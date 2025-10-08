import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  event:programming_events(id, title, start_at, end_at, location, venue),
  project:projects(id, name, status)
`;

const updateRiderSchema = z.object({
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional().nullable(),
  kind: z.enum(['technical', 'hospitality', 'stage_plot', 'security', 'catering', 'transportation', 'accommodation', 'production', 'artist', 'crew']).optional(),
  status: z.enum(['draft', 'pending_review', 'under_review', 'approved', 'rejected', 'fulfilled', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'urgent']).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  requirements: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  technical_requirements: z.object({
    sound_system: z.string().optional(),
    lighting: z.string().optional(),
    stage_setup: z.string().optional(),
    power_requirements: z.string().optional(),
    equipment_list: z.array(z.string()).optional(),
    crew_requirements: z.string().optional(),
    load_in_time: z.string().optional(),
    sound_check_time: z.string().optional(),
    special_instructions: z.string().optional()
  }).optional(),
  hospitality_requirements: z.object({
    catering: z.string().optional(),
    beverages: z.string().optional(),
    dietary_restrictions: z.array(z.string()).optional(),
    green_room_setup: z.string().optional(),
    towels_count: z.number().int().min(0).optional(),
    water_bottles: z.number().int().min(0).optional(),
    special_requests: z.string().optional(),
    meal_times: z.string().optional()
  }).optional(),
  stage_plot: z.object({
    stage_dimensions: z.string().optional(),
    input_list: z.array(z.string()).optional(),
    monitor_requirements: z.string().optional(),
    backline: z.string().optional(),
    risers: z.string().optional(),
    special_staging: z.string().optional(),
    plot_file_url: z.string().url().optional()
  }).optional(),
  security_requirements: z.object({
    security_level: z.string().optional(),
    personnel_count: z.number().int().min(0).optional(),
    backstage_access: z.string().optional(),
    vip_requirements: z.string().optional(),
    crowd_control: z.string().optional(),
    emergency_procedures: z.string().optional()
  }).optional(),
  transportation: z.object({
    arrival_details: z.string().optional(),
    departure_details: z.string().optional(),
    local_transport: z.string().optional(),
    parking_requirements: z.string().optional(),
    load_in_access: z.string().optional(),
    special_arrangements: z.string().optional()
  }).optional(),
  accommodation: z.object({
    hotel_requirements: z.string().optional(),
    room_count: z.number().int().min(0).optional(),
    check_in_date: z.string().optional(),
    check_out_date: z.string().optional(),
    special_requests: z.string().optional(),
    proximity_requirements: z.string().optional()
  }).optional(),
  fulfilled_at: z.string().datetime().optional().nullable(),
  fulfilled_by: z.string().uuid().optional().nullable(),
  fulfillment_notes: z.string().optional().nullable(),
  reviewed_at: z.string().datetime().optional().nullable(),
  reviewed_by: z.string().uuid().optional().nullable(),
  review_notes: z.string().optional().nullable(),
  approved_at: z.string().datetime().optional().nullable(),
  approved_by: z.string().uuid().optional().nullable(),
  attachments: z.array(z.string()).optional(),
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

async function getRider(supabase: ReturnType<typeof createServerClient>, id: string, orgId: string) {
  const { data, error } = await supabase
    .from('programming_riders')
    .select(BASE_SELECT)
    .eq('id', id)
    .eq('organization_id', orgId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const rider = await getRider(supabase, params.id, membership.organization_id);
    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    return NextResponse.json(rider);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/riders/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const existingRider = await getRider(supabase, params.id, membership.organization_id);
    if (!existingRider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    const payload = await request.json();
    const data = updateRiderSchema.parse(payload);

    // Verify event if provided
    if (data.event_id) {
      const { data: event } = await supabase
        .from('programming_events')
        .select('id')
        .eq('id', data.event_id)
        .eq('organization_id', membership.organization_id)
        .maybeSingle();

      if (!event) {
        return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
      }
    }

    // Verify project if provided
    if (data.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', data.project_id)
        .eq('organization_id', membership.organization_id)
        .maybeSingle();

      if (!project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    const updatePayload = {
      ...data,
      updated_by: user!.id,
      updated_at: new Date().toISOString()
    };

    const { data: rider, error: updateError } = await supabase
      .from('programming_riders')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .select(BASE_SELECT)
      .single();

    if (updateError) throw updateError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'rider',
      resource_id: rider.id,
      action: 'update',
      details: {
        title: rider.title,
        kind: rider.kind,
        changes: Object.keys(data)
      }
    });

    return NextResponse.json(rider);
  } catch (err) {
    console.error('PATCH /api/v1/programming/riders/[id] error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!['admin', 'manager'].includes(membership.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const existingRider = await getRider(supabase, params.id, membership.organization_id);
    if (!existingRider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('programming_riders')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (deleteError) throw deleteError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'rider',
      resource_id: params.id,
      action: 'delete',
      details: {
        title: existingRider.title,
        kind: existingRider.kind,
        event_id: existingRider.event_id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/programming/riders/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
