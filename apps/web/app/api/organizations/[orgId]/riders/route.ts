import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CreateRiderSchema = z.object({
  event_id: z.string().uuid(),
  kind: z.enum(['technical', 'hospitality', 'stage_plot']).default('technical'),
  details: z.record(z.any()).optional()
});

const UpdateRiderSchema = CreateRiderSchema.partial();

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

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('event_id');

  let query = supabase
    .from('riders')
    .select(`
      *,
      events!inner(
        name,
        projects!inner(organization_id)
      )
    `)
    .eq('events.projects.organization_id', params.orgId);

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query.order('kind', { ascending: true });

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
  const validatedData = CreateRiderSchema.parse(body);

  // Verify event belongs to organization
  const { data: event } = await supabase
    .from('events')
    .select(`
      id,
      projects!inner(organization_id)
    `)
    .eq('id', validatedData.event_id)
    .eq('projects.organization_id', params.orgId)
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: 'event not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('riders')
    .insert(validatedData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'create',
    entity_type: 'rider',
    entity_id: data.id,
    meta: { kind: data.kind, event_id: data.event_id }
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
  const validatedData = UpdateRiderSchema.parse(updateData);

  const { data, error } = await supabase
    .from('riders')
    .update(validatedData)
    .eq('id', id)
    .select(`
      *,
      events!inner(
        projects!inner(organization_id)
      )
    `)
    .eq('events.projects.organization_id', params.orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'update',
    entity_type: 'rider',
    entity_id: data.id,
    meta: { kind: data.kind }
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
  const riderId = searchParams.get('id');

  if (!riderId) {
    return NextResponse.json({ error: 'rider id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('riders')
    .delete()
    .eq('id', riderId)
    .select(`
      *,
      events!inner(
        projects!inner(organization_id)
      )
    `)
    .eq('events.projects.organization_id', params.orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    user_id: user.id,
    action: 'delete',
    entity_type: 'rider',
    entity_id: data.id,
    meta: { kind: data.kind }
  });

  return NextResponse.json({ data });
}
