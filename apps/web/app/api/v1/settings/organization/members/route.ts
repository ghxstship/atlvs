import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';
import { rateLimitRequest } from '../../../../../_components/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AuthenticatedContext {
  user: { id: string };
  orgId: string;
  role: string;
  admin: ReturnType<typeof createServiceRoleClient>;
}

async function getAuthenticatedContext(): Promise<AuthenticatedContext> {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name),
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return {
    user,
    orgId: (membership as unknown).organization_id,
    role: (membership as unknown).role,
    admin: createServiceRoleClient(),
  };
}

function serializeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimitRequest(request, 'rl:settings-organization-members-get', 60, 30);
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { user, orgId, admin } = await getAuthenticatedContext();

    const { data, error } = await admin
      .from('memberships')
      .select(
        `id, user_id, role, status, created_at,
         users:users!inner(id, full_name, email, avatar_url, job_title)`
      )
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Organization members fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const members = (data ?? []).map((row: unknown) => ({
      membershipId: row.id,
      userId: row.user_id,
      role: row.role,
      status: row.status,
      joinedAt: row.created_at,
      fullName: row.users?.full_name ?? null,
      email: row.users?.email ?? null,
      avatarUrl: row.users?.avatar_url ?? null,
      jobTitle: row.users?.job_title ?? null,
    }));

    await admin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.organization.members.list',
      resource_type: 'organization',
      resource_id: orgId,
      details: { count: members.length },
      occurred_at: new Date().toISOString(),
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Organization members GET error:', error);
    const message = serializeError(error);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
