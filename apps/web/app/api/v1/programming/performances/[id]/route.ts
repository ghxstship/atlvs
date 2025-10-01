import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  event:programming_events(id, title, start_at, end_at, location),
  project:projects(id, name, status),
  lineup_count:programming_lineups(count)
`;

const updatePerformanceSchema = z.object({
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  performance_type: z.enum(['concert', 'theater', 'dance', 'comedy', 'spoken_word', 'variety', 'festival', 'other']).optional(),
  status: z.enum(['planning', 'rehearsal', 'ready', 'live', 'completed', 'cancelled']).optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().min(1).max(1440).optional().nullable(),
  venue: z.string().max(255).optional().nullable(),
  venue_capacity: z.number().int().min(1).optional().nullable(),
  ticket_info: z.object({
    price_min: z.number().min(0).optional(),
    price_max: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    sales_url: z.string().url().optional(),
    sold_out: z.boolean().optional(),
  }).optional(),
  technical_requirements: z.object({
    sound_system: z.string().optional(),
    lighting: z.string().optional(),
    stage_setup: z.string().optional(),
    equipment_needed: z.array(z.string()).optional(),
    crew_requirements: z.string().optional(),
  }).optional(),
  production_notes: z.object({
    rehearsal_schedule: z.string().optional(),
    call_time: z.string().datetime().optional(),
    sound_check: z.string().datetime().optional(),
    special_instructions: z.string().optional(),
  }).optional(),
  audience_info: z.object({
    expected_attendance: z.number().int().min(0).optional(),
    target_demographic: z.string().optional(),
    accessibility_notes: z.string().optional(),
  }).optional(),
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

    const { data: performance, error: queryError } = await supabase
      .from('programming_performances')
      .select(BASE_SELECT)
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
      }
      console.error('Error fetching performance:', queryError);
      return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 });
    }

    return NextResponse.json(performance);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/performances/[id]:', error);
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

    const payload = await request.json();
    const data = updatePerformanceSchema.parse(payload);

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
    };

    const { data: performance, error: updateError } = await supabase
      .from('programming_performances')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .select(BASE_SELECT)
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
      }
      throw updateError;
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'performance',
      resource_id: performance.id,
      action: 'update',
      details: {
        name: performance.name,
        changes: Object.keys(data),
      },
    });

    return NextResponse.json(performance);
  } catch (err) {
    console.error('PATCH /api/v1/programming/performances/[id] error:', err);
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

    // Get performance details for logging before deletion
    const { data: performance } = await supabase
      .from('programming_performances')
      .select('name, performance_type')
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (!performance) {
      return NextResponse.json({ error: 'Performance not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('programming_performances')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (deleteError) {
      console.error('Error deleting performance:', deleteError);
      return NextResponse.json({ error: 'Failed to delete performance' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'performance',
      resource_id: params.id,
      action: 'delete',
      details: {
        name: performance.name,
        performance_type: performance.performance_type,
      },
    });

    return NextResponse.json({ message: 'Performance deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/programming/performances/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
