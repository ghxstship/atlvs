import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  project:projects(id, name, status),
  event:programming_events(id, title, start_at, end_at, location)
`;

const updateCallSheetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  call_type: z.enum([
    'general',
    'crew',
    'talent',
    'vendor',
    'security',
    'medical',
    'transport',
  ]).optional(),
  status: z.enum(['draft', 'published', 'distributed', 'updated', 'cancelled']).optional(),
  event_date: z.string().date().optional(),
  call_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  location: z.string().min(1).optional(),
  notes: z.string().optional(),
  weather_info: z.record(z.any()).optional(),
  contact_info: z.array(z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  })).optional(),
  schedule: z.array(z.object({
    time: z.string(),
    activity: z.string(),
    location: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  crew_assignments: z.array(z.object({
    user_id: z.string().uuid().optional(),
    role: z.string(),
    department: z.string().optional(),
    call_time: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  equipment_list: z.array(z.object({
    item: z.string(),
    quantity: z.number().int().min(1),
    responsible_person: z.string().optional(),
    notes: z.string().optional()
  })).optional(),
  safety_notes: z.string().optional(),
  distribution_list: z.array(z.object({
    user_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    method: z.enum(['email', 'sms', 'app']).default('email')
  })).optional(),
  tags: z.array(z.string().max(32)).optional(),
  metadata: z.record(z.any()).optional()
});

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { supabase, user };
}

async function getMembership(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getCallSheetById(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from('call_sheets')
    .select(BASE_SELECT)
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const callSheet = await getCallSheetById(supabase, membership.organization_id, params.id);
    if (!callSheet) {
      return NextResponse.json({ error: 'Call sheet not found' }, { status: 404 });
    }

    return NextResponse.json(callSheet);
  } catch (err) {
    console.error('GET /api/v1/programming/call-sheets/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!['admin', 'manager', 'producer'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const existing = await getCallSheetById(supabase, membership.organization_id, params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Call sheet not found' }, { status: 404 });
    }

    const payload = await request.json();
    const updates = updateCallSheetSchema.parse(payload);

    // Verify project if provided
    if (updates.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', updates.project_id)
        .eq('organization_id', membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    // Verify event if provided
    if (updates.event_id) {
      const { data: event } = await supabase
        .from('programming_events')
        .select('id')
        .eq('id', updates.event_id)
        .eq('organization_id', membership.organization_id)
        .maybeSingle();

      if (!event) {
        return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
      }
    }

    const updatePayload = {
      ...updates,
      project_id: updates.project_id === undefined ? existing.project_id : updates.project_id,
      event_id: updates.event_id === undefined ? existing.event_id : updates.event_id,
      weather_info: updates.weather_info ?? existing.weather_info,
      contact_info: updates.contact_info ?? existing.contact_info,
      schedule: updates.schedule ?? existing.schedule,
      crew_assignments: updates.crew_assignments ?? existing.crew_assignments,
      equipment_list: updates.equipment_list ?? existing.equipment_list,
      distribution_list: updates.distribution_list ?? existing.distribution_list,
      tags: updates.tags ?? existing.tags,
      metadata: updates.metadata ?? existing.metadata,
      updated_by: user!.id
    };

    const { data: callSheet, error: updateError } = await supabase
      .from('call_sheets')
      .update(updatePayload)
      .eq('organization_id', membership.organization_id)
      .eq('id', params.id)
      .select(BASE_SELECT)
      .single();

    if (updateError) throw updateError;

    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'call_sheet',
      resource_id: params.id,
      action: 'update',
      details: {
        updated_fields: Object.keys(updates)
      }
    });

    return NextResponse.json(callSheet);
  } catch (err) {
    console.error('PATCH /api/v1/programming/call-sheets/[id] error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!['admin', 'manager', 'producer'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const existing = await getCallSheetById(supabase, membership.organization_id, params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Call sheet not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('call_sheets')
      .delete()
      .eq('organization_id', membership.organization_id)
      .eq('id', params.id);

    if (deleteError) throw deleteError;

    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'call_sheet',
      resource_id: params.id,
      action: 'delete',
      details: {
        name: existing.name,
        call_type: existing.call_type
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/v1/programming/call-sheets/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
