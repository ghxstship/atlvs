import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractDomain(email: string): string | null {
  const m = String(email).toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})$/i);
  return m ? m[1] : null;
}

export async function POST(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name),
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = params.orgId;
  const payload = await req.json().catch(() => null);
  const { email, role = 'contributor', mode = 'invite' } = (payload || {}) as { email: string; role?: string; mode?: 'invite' | 'addExisting' };
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  // Actor must be owner/admin
  const { data: actor } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  if (!actor || !['owner','admin'].includes((actor as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Load entitlements & domains
  const admin = createServiceRoleClient();
  const { data: ent } = await admin
    .from('organization_entitlements')
    .select('seat_policy, seats_limit')
    .eq('organization_id', orgId)
    .maybeSingle();

  const inviteDomain = extractDomain(email);
  const seatPolicy = ent?.seat_policy ?? 'user';
  let domainAllowed = false;
  if (inviteDomain) {
    const { data: dom } = await admin
      .from('organization_domains')
      .select('id')
      .eq('organization_id', orgId)
      .eq('domain', inviteDomain)
      .eq('status', 'active')
      .maybeSingle();
    domainAllowed = Boolean(dom);
  }

  // If seat policy is user (not domain-unlimited), enforce seats_limit if provided
  if (!(seatPolicy === 'domain-unlimited' && domainAllowed)) {
    if (seatPolicy === 'user' && ent?.seats_limit != null) {
      const { count } = await admin
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active');
      if ((count ?? 0) >= (ent.seats_limit as number)) {
        return NextResponse.json({ error: 'Seat limit reached' }, { status: 402 });
      }
    }
  }

  if (mode === 'addExisting') {
    // Try to find existing Auth user by email and corresponding public.users row by auth_id
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) return NextResponse.json({ error: listErr.message }, { status: 400 });
    const authUser = (list?.users || []).find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (!authUser) return NextResponse.json({ error: 'User not found; use invite mode instead' }, { status: 404 });
    const { data: profile } = await admin
      .from('users')
      .select('id')
      .eq('auth_id', (authUser as any).id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: 'User profile not provisioned yet; invite them instead' }, { status: 409 });
    }

    const { data: m, error: merr } = await admin
      .from('memberships')
      .upsert({ user_id: (profile as any).id, organization_id: orgId, role, status: 'active' }, { onConflict: 'user_id,organization_id' })
      .select('id')
      .single();
    if (merr) return NextResponse.json({ error: merr.message }, { status: 400 });
    return NextResponse.json({ membership_id: m?.id, mode: 'addExisting' }, { status: 201 });
  }

  // Default: invite mode — record invite and send Auth invite
  const lowerEmail = email.toLowerCase();
  let createdByUserId: string | null = null;
  // Try to resolve actor's public.users id for created_by reference
  const { data: actorProfile } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();
  createdByUserId = actorProfile?.id ?? null;

  // Upsert organization_invites row
  await admin
    .from('organization_invites')
    .upsert({ organization_id: orgId, email: lowerEmail, role, status: 'pending', created_by: createdByUserId }, { onConflict: 'organization_id,email' });

  const { data: inviteRes, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(lowerEmail, { redirectTo: process.env.NEXT_PUBLIC_APP_URL || undefined });
  if (inviteErr) return NextResponse.json({ error: inviteErr.message }, { status: 400 });
  // Optionally record a pending membership (cannot create due to FK until profile row exists). We rely on post-signup flow to create membership.
  return NextResponse.json({ invited: true, email: inviteRes?.user?.email }, { status: 202 });
}
