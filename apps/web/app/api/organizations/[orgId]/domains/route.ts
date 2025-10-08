import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidDomain(domain: string) {
  return /^[a-z0-9.-]+\.[a-z]{2}$/i.test(domain);
}

export async function GET(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = await cookies();
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
    .from('organization_domains')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ domains: data || [] });
}

export async function POST(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = await cookies();
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
  if (!body || !body.domain) return NextResponse.json({ error: 'Missing domain' }, { status: 400 });

  const domain = String(body.domain).toLowerCase();
  if (!isValidDomain(domain)) return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });

  // Ensure actor is owner/admin of org
  const { data: member } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();
  if (!member || !['owner','admin'].includes((member as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('organization_domains')
    .insert({ organization_id: orgId, domain })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ domain: data }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = await cookies();
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

  const { data: member } = await supabase
    .from('memberships')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single();
  if (!member || !['owner','admin'].includes((member as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('organization_domains')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
