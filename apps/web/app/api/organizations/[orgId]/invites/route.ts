import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

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
  const { data, error } = await supabase
    .from('organization_invites')
    .select('id, email, role, status, created_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ invites: data || [] });
}

export async function DELETE(req: NextRequest, { params }: { params: { orgId: string } }) {
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
  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Ensure actor is owner/admin
  const { data: member } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  if (!member || !['owner','admin'].includes((member as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('organization_invites')
    .update({ status: 'revoked' })
    .eq('id', id)
    .eq('organization_id', orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: { orgId: string } }) {
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
  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  const action = body?.action as string | undefined;
  if (!id || action !== 'resend') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Ensure actor is owner/admin
  const { data: member } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();
  if (!member || !['owner','admin'].includes((member as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Lookup invite
  const { data: invite, error } = await supabase
    .from('organization_invites')
    .select('email, status')
    .eq('id', id)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error || !invite) return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  if (invite.status !== 'pending') return NextResponse.json({ error: 'Only pending invites can be resent' }, { status: 409 });

  const admin = createServiceRoleClient();
  const { error: resendErr } = await admin.auth.admin.inviteUserByEmail(invite.email, { redirectTo: process.env.NEXT_PUBLIC_APP_URL || undefined });
  if (resendErr) return NextResponse.json({ error: resendErr.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
