import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { orgId: string; projectId: string } }) {
  const { orgId, projectId } = params;

  // Authorize: user must be an active member of the org
  const cookieStore = await cookies();
  const userSb = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });
  const { data: { user } } = await userSb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: membership } = await userSb
    .from('memberships')
    .select('organization_id,status')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  // Service role to read audit_logs (no SELECT for clients)
  const svc = createServiceRoleClient();
  const { data, error } = await svc
    .from('audit_logs')
    .select('occurred_at, action, entity_type, entity_id, meta')
    .eq('organization_id', orgId)
    .eq('project_id', projectId)
    .order('occurred_at', { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, data });
}
