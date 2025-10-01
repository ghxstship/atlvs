import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CreateEventSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  kind: z.enum(['performance', 'activation', 'workshop']).default('performance'),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional()
});

const UpdateEventSchema = CreateEventSchema.partial();

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

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('project_id');

  let query = supabase
    .from('events')
    .select(`
      *,
      projects!inner(name, organization_id),
      lineups(*),
      riders(*),
      call_sheets(*)
    `)
    .eq('projects.organization_id', params.orgId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query.order('starts_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
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
  const validatedData = CreateEventSchema.parse(body);

  // Verify project belongs to organization
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id')
    .eq('id', validatedData.project_id)
    .eq('organization_id', params.orgId)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'project not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('events')
    .insert(validatedData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    project_id: validatedData.project_id,
    user_id: user.id,
    action: 'create',
    entity_type: 'event',
    entity_id: data.id,
    meta: { name: data.name, kind: data.kind }
  });

  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: { params: { orgId: string } }) {
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
  const validatedData = UpdateEventSchema.parse(updateData);

  const { data, error } = await supabase
    .from('events')
    .update(validatedData)
    .eq('id', id)
    .select(`
      *,
      projects!inner(organization_id)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    project_id: data.project_id,
    user_id: user.id,
    action: 'update',
    entity_type: 'event',
    entity_id: data.id,
    meta: { name: data.name }
  });

  return NextResponse.json({ data });
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
  const eventId = searchParams.get('id');

  if (!eventId) {
    return NextResponse.json({ error: 'event id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .select(`
      *,
      projects!inner(organization_id)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Log audit event
  await supabase.from('audit_logs').insert({
    organization_id: params.orgId,
    project_id: data.project_id,
    user_id: user.id,
    action: 'delete',
    entity_type: 'event',
    entity_id: data.id,
    meta: { name: data.name }
  });

  return NextResponse.json({ data });
}
