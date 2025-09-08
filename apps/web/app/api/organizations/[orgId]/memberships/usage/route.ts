import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = params.orgId;

  // Ensure requester is an active member
  const { data: member } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Get entitlements
  const { data: entitlements, error: entErr } = await supabase
    .from('organization_entitlements')
    .select('seat_policy, seats_limit')
    .eq('organization_id', orgId)
    .maybeSingle();
  if (entErr) return NextResponse.json({ error: entErr.message }, { status: 400 });

  // Count active members
  const { count: activeCount, error: cntErr } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'active');
  if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 400 });

  return NextResponse.json({
    seat_policy: entitlements?.seat_policy ?? 'user',
    seats_limit: entitlements?.seats_limit ?? null,
    active_count: activeCount ?? 0,
  });
}
