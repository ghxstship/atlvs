import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CreateSpaceSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum(['room', 'green_room', 'dressing_room', 'meeting_room', 'classroom', 'other']).default('room'),
  capacity: z.number().int().positive().optional()
});

const UpdateSpaceSchema = CreateSpaceSchema.partial();

export async function GET(req: NextRequest, { params }: { params: { orgId: string } }) {
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
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Check membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('organization_id', params.orgId)
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
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
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Check membership with write permissions
  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership || !['owner', 'admin', 'contributor'].includes(membership.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const validatedData = CreateSpaceSchema.parse(body);

  const { data, error } = await supabase
    .from('spaces')
    .insert({
      ...validatedData,
      organization_id: params.orgId
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'create',
    entity_type: 'space',
    entity_id: data.id,
    meta: { name: data.name, kind: data.kind }
  });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: { params: { orgId: string } }) {
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
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership || !['owner', 'admin', 'contributor'].includes(membership.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { id, ...updateData } = body;
  const validatedData = UpdateSpaceSchema.parse(updateData);

  const { data, error } = await supabase
    .from('spaces')
    .update(validatedData)
    .eq('id', id)
    .eq('organization_id', params.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'update',
    entity_type: 'space',
    entity_id: data.id,
    meta: { name: data.name }
  });

  return NextResponse.json({ data });
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
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('id');

  if (!spaceId) {
    return NextResponse.json({ error: 'space id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', spaceId)
    .eq('organization_id', params.orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'delete',
    entity_type: 'space',
    entity_id: data.id,
    meta: { name: data.name }
  });

  return NextResponse.json({ data });
}
