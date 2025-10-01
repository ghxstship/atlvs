import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  project:projects(id, name, status)
`;

const updateSpaceSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  kind: z.enum(['room', 'green_room', 'dressing_room', 'meeting_room', 'classroom', 'studio', 'rehearsal_room', 'storage', 'office', 'lounge', 'kitchen', 'bathroom', 'corridor', 'lobby', 'stage', 'backstage', 'loading_dock', 'parking', 'outdoor', 'other']).optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'setup', 'breakdown', 'out_of_service']).optional(),
  access_level: z.enum(['public', 'restricted', 'staff_only', 'talent_only', 'vip', 'crew_only', 'private']).optional(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  floor: z.string().optional().nullable(),
  room_number: z.string().optional().nullable(),
  capacity: z.number().int().min(0).optional().nullable(),
  max_capacity: z.number().int().min(0).optional().nullable(),
  area_sqft: z.number().min(0).optional().nullable(),
  length: z.number().min(0).optional().nullable(),
  width: z.number().min(0).optional().nullable(),
  height: z.number().min(0).optional().nullable(),
  amenities: z.object({
    wifi: z.boolean().optional(),
    air_conditioning: z.boolean().optional(),
    heating: z.boolean().optional(),
    lighting_control: z.boolean().optional(),
    sound_system: z.boolean().optional(),
    projection: z.boolean().optional(),
    whiteboard: z.boolean().optional(),
    tables: z.boolean().optional(),
    chairs: z.boolean().optional(),
    power_outlets: z.boolean().optional(),
    windows: z.boolean().optional(),
    private_bathroom: z.boolean().optional(),
    kitchenette: z.boolean().optional(),
    storage: z.boolean().optional(),
    security_camera: z.boolean().optional(),
    access_control: z.boolean().optional(),
  }).optional(),
  technical_specs: z.object({
    audio_inputs: z.number().int().min(0).optional(),
    video_inputs: z.number().int().min(0).optional(),
    power_capacity: z.string().optional(),
    internet_speed: z.string().optional(),
    lighting_fixtures: z.number().int().min(0).optional(),
    ceiling_height: z.number().min(0).optional(),
    load_capacity: z.number().min(0).optional(),
    hvac_zones: z.number().int().min(0).optional(),
    emergency_exits: z.number().int().min(0).optional(),
    fire_safety: z.array(z.string()).optional(),
  }).optional(),
  is_bookable: z.boolean().optional(),
  booking_advance_days: z.number().int().min(0).optional().nullable(),
  min_booking_duration: z.number().int().min(0).optional().nullable(),
  max_booking_duration: z.number().int().min(0).optional().nullable(),
  hourly_rate: z.number().min(0).optional().nullable(),
  daily_rate: z.number().min(0).optional().nullable(),
  setup_time: z.number().int().min(0).optional().nullable(),
  breakdown_time: z.number().int().min(0).optional().nullable(),
  cleaning_time: z.number().int().min(0).optional().nullable(),
  contact_person: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  rules: z.string().optional().nullable(),
  restrictions: z.string().optional().nullable(),
  equipment_provided: z.array(z.string()).optional(),
  equipment_allowed: z.array(z.string()).optional(),
  equipment_prohibited: z.array(z.string()).optional(),
  last_maintenance: z.string().datetime().optional().nullable(),
  next_maintenance: z.string().datetime().optional().nullable(),
  maintenance_notes: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  floor_plan: z.string().url().optional().nullable(),
  documents: z.array(z.string().url()).optional(),
  tags: z.array(z.string().max(32)).optional(),
  metadata: z.record(z.any()).optional(),
});

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user },
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

async function getSpace(supabase: ReturnType<typeof createServerClient>, id: string, orgId: string) {
  const { data, error } = await supabase
    .from('programming_spaces')
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

    const space = await getSpace(supabase, params.id, membership.organization_id);
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(space);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/spaces/[id]:', error);
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

    const existingSpace = await getSpace(supabase, params.id, membership.organization_id);
    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const payload = await request.json();
    const data = updateSpaceSchema.parse(payload);

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
      updated_at: new Date().toISOString(),
    };

    const { data: space, error: updateError } = await supabase
      .from('programming_spaces')
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
      resource_type: 'space',
      resource_id: space.id,
      action: 'update',
      details: {
        name: space.name,
        kind: space.kind,
        changes: Object.keys(data),
      },
    });

    return NextResponse.json(space);
  } catch (err) {
    console.error('PATCH /api/v1/programming/spaces/[id] error:', err);
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

    const existingSpace = await getSpace(supabase, params.id, membership.organization_id);
    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('programming_spaces')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (deleteError) throw deleteError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'space',
      resource_id: params.id,
      action: 'delete',
      details: {
        name: existingSpace.name,
        kind: existingSpace.kind,
        capacity: existingSpace.capacity,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/programming/spaces/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
