import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import { rateLimitRequest } from '../../../../../lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /.+@.+\..+/i;

const InviteActionSchema = z.object({
  action: z.enum(['invite', 'addExisting', 'bulkInvite', 'resend']),
  email: z.string().email().optional(),
  role: z.enum(['viewer', 'contributor', 'manager', 'admin']).optional(),
  emails: z.array(z.string().email()).optional(),
  inviteId: z.string().uuid().optional()
});

const RevokeActionSchema = z.object({
  inviteId: z.string().uuid()
});

type AuthenticatedContext = {
  user: { id: string };
  orgId: string;
  role: string;
  admin: ReturnType<typeof createServiceRoleClient>;
};

async function getAuthenticatedContext(): Promise<AuthenticatedContext> {
  const cookieStore = await cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) throw new Error('No active organization membership');

  interface Membership {
    organization_id: string;
    role: string;
  }

  const typedMembership = membership as Membership;

  return {
    user,
    orgId: typedMembership.organization_id,
    role: typedMembership.role,
    admin: createServiceRoleClient()
  };
}

function serializeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function extractDomain(email: string): string | null {
  const match = email.toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2})$/i);
  return match ? match[1] : null;
}

type SeatContext = {
  seatPolicy: string;
  seatsLimit: number | null;
  remainingSeats: number | null;
  activeCount: number;
  activeDomains: Set<string>;
};

async function getSeatContext(admin: ReturnType<typeof createServiceRoleClient>, orgId: string): Promise<SeatContext> {
  const { data: entitlements } = await admin
    .from('organization_entitlements')
    .select('seat_policy, seats_limit')
    .eq('organization_id', orgId)
    .maybeSingle();

  const seatPolicy = (entitlements?.seat_policy as string | null) ?? 'user';
  const seatsLimit = entitlements?.seats_limit ?? null;

  const { count } = await admin
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'active');

  const remainingSeats = seatsLimit != null ? Math.max(seatsLimit - (count ?? 0), 0) : null;

  interface Domain {
    domain: string;
    status: string;
  }

  const { data: domains } = await admin
    .from('organization_domains')
    .select('domain, status')
    .eq('organization_id', orgId);

  const activeDomains = new Set(
    (domains ?? [])
      .filter((domain: Domain) => domain.status === 'active')
      .map((domain: Domain) => domain.domain.toLowerCase())
  );

  return {
    seatPolicy,
    seatsLimit,
    remainingSeats,
    activeCount: count ?? 0,
    activeDomains
  };
}

function consumeSeatIfRequired(email: string, seatContext: SeatContext) {
  const { seatPolicy, seatsLimit, activeDomains } = seatContext;

  if (seatPolicy === 'domain-unlimited') {
    const domain = extractDomain(email);
    if (domain && activeDomains.has(domain)) {
      return;
    }
  }

  if (seatsLimit != null) {
    if (seatContext.remainingSeats == null || seatContext.remainingSeats <= 0) {
      throw new Error('Seat limit reached. Remove existing members or upgrade your plan.');
    }
    seatContext.remainingSeats -= 1;
    seatContext.activeCount += 1;
  }
}

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-teams-get', 60, 30);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { user, orgId, role, admin } = await getAuthenticatedContext();
    const seatContext = await getSeatContext(admin, orgId);

    const { data: invites } = await admin
      .from('organization_invites')
      .select('id, email, role, status, created_at, updated_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    const { data: domains } = await admin
      .from('organization_domains')
      .select('id, domain, status, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.teams.get',
      resource_type: 'organization_invites',
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({
      invites: invites ?? [],
      seatUsage: {
        seatPolicy: seatContext.seatPolicy,
        seatsLimit: seatContext.seatsLimit,
        activeCount: seatContext.activeCount,
        remainingSeats: seatContext.remainingSeats
      },
      domains: domains ?? [],
      activeDomains: Array.from(seatContext.activeDomains),
      canManage: ['owner', 'admin'].includes(role)
    });
  } catch (error: unknown) {
    console.error('Teams settings GET error:', error);
    const message = serializeError(error);
    if (message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-teams-post', 60, 20);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { user, orgId, role, admin } = await getAuthenticatedContext();
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const payload = InviteActionSchema.parse(await request.json());
    const seatContext = await getSeatContext(admin, orgId);

    const inviteSingle = async (email: string, inviteRole: string) => {
      const lowercaseEmail = email.toLowerCase();
      consumeSeatIfRequired(lowercaseEmail, seatContext);

      await admin
        .from('organization_invites')
        .upsert({
          organization_id: orgId,
          email: lowercaseEmail,
          role: inviteRole,
          status: 'pending',
          created_by: user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id,email' });

      const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(lowercaseEmail, {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL || undefined
      });
      if (inviteError) throw new Error(inviteError.message);
    };

    if (payload.action === 'invite') {
      if (!payload.email || !payload.role) {
        return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
      }
      await inviteSingle(payload.email, payload.role);
      return NextResponse.json({ success: true });
    }

    if (payload.action === 'bulkInvite') {
      if (!payload.emails || payload.emails.length === 0 || !payload.role) {
        return NextResponse.json({ error: 'Emails and role are required' }, { status: 400 });
      }

      const results = await Promise.allSettled(
        payload.emails
          .filter((email: string) => EMAIL_REGEX.test(email))
          .map(async (email: string) => {
            await inviteSingle(email, payload.role!);
            return email;
          })
      );

      const successes = results.filter((res) => res.status === 'fulfilled').length;
      const failures = results.length - successes;

      return NextResponse.json({ success: true, results: { successes, failures } });
    }

    if (payload.action === 'addExisting') {
      if (!payload.email || !payload.role) {
        return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
      }

      const lowercaseEmail = payload.email.toLowerCase();
      consumeSeatIfRequired(lowercaseEmail, seatContext);

      // Find existing user by email
      const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (listError) return NextResponse.json({ error: listError.message }, { status: 400 });

      interface AuthUser {
        id: string;
        email?: string;
      }
      const authUser = authUsers?.users?.find((u: AuthUser) => u.email?.toLowerCase() === lowercaseEmail);
      if (!authUser) {
        return NextResponse.json({ error: 'User not found; invite them instead' }, { status: 404 });
      }

      const { data: profile } = await admin
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .maybeSingle();
      if (!profile) {
        return NextResponse.json({ error: 'User profile not provisioned yet; invite them instead' }, { status: 409 });
      }

      await admin
        .from('memberships')
        .upsert({
          user_id: (profile as { id: string }).id,
          organization_id: orgId,
          role: payload.role,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,organization_id' });

      return NextResponse.json({ success: true });
    }

    if (payload.action === 'resend') {
      if (!payload.inviteId) {
        return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
      }

      const { data: invite } = await admin
        .from('organization_invites')
        .select('email')
        .eq('id', payload.inviteId)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!invite) {
        return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
      }

      const { error: resendError } = await admin.auth.admin.inviteUserByEmail((invite as unknown).email, {
        redirectTo: process.env.NEXT_PUBLIC_APP_URL || undefined
      });

      if (resendError) {
        return NextResponse.json({ error: resendError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Teams settings POST error:', error);
    const message = serializeError(error);
    if (message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-teams-delete', 60, 10);
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { user, orgId, role, admin } = await getAuthenticatedContext();
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { inviteId } = RevokeActionSchema.parse(await request.json());

    const { data: invite } = await admin
      .from('organization_invites')
      .select('id')
      .eq('id', inviteId)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    await admin
      .from('organization_invites')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.teams.invite.revoke',
      resource_type: 'organization_invites',
      resource_id: inviteId,
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Teams settings DELETE error:', error);
    const message = serializeError(error);
    if (message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
