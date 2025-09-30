import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  event:programming_events(id, title, start_at, end_at, location),
  project:projects(id, name, status)
`;

const updateLineupSchema = z.object({
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional().nullable(),
  performer_name: z.string().min(1).max(255).optional(),
  performer_type: z.enum(['artist', 'band', 'dj', 'speaker', 'host', 'comedian', 'dancer', 'other']).optional(),
  role: z.string().max(100).optional().nullable(),
  stage: z.string().max(100).optional().nullable(),
  set_time: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().min(1).max(1440).optional().nullable(),
  status: z.enum(['confirmed', 'tentative', 'cancelled', 'pending']).optional(),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    agent: z.string().optional(),
    manager: z.string().optional(),
  }).optional(),
  technical_requirements: z.object({
    sound_check: z.string().datetime().optional(),
    equipment: z.array(z.string()).optional(),
    special_requests: z.string().optional(),
  }).optional(),
  contract_details: z.object({
    fee: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    payment_terms: z.string().optional(),
    contract_signed: z.boolean().optional(),
  }).optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string().max(32)).optional(),
  metadata: z.record(z.any()).optional(),
});

async function getSupabase() {
  const cookieStore = cookies();
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

    const { data: lineup, error: queryError } = await supabase
      .from('programming_lineups')
      .select(BASE_SELECT)
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lineup not found' }, { status: 404 });
      }
      console.error('Error fetching lineup:', queryError);
      return NextResponse.json({ error: 'Failed to fetch lineup' }, { status: 500 });
    }

    return NextResponse.json(lineup);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/lineups/[id]:', error);
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
    const data = updateLineupSchema.parse(payload);

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

    const { data: lineup, error: updateError } = await supabase
      .from('programming_lineups')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .select(BASE_SELECT)
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lineup not found' }, { status: 404 });
      }
      throw updateError;
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'lineup',
      resource_id: lineup.id,
      action: 'update',
      details: {
        performer_name: lineup.performer_name,
        changes: Object.keys(data),
      },
    });

    return NextResponse.json(lineup);
  } catch (err) {
    console.error('PATCH /api/v1/programming/lineups/[id] error:', err);
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

    // Get lineup details for logging before deletion
    const { data: lineup } = await supabase
      .from('programming_lineups')
      .select('performer_name, performer_type')
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (!lineup) {
      return NextResponse.json({ error: 'Lineup not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('programming_lineups')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (deleteError) {
      console.error('Error deleting lineup:', deleteError);
      return NextResponse.json({ error: 'Failed to delete lineup' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'lineup',
      resource_id: params.id,
      action: 'delete',
      details: {
        performer_name: lineup.performer_name,
        performer_type: lineup.performer_type,
      },
    });

    return NextResponse.json({ message: 'Lineup deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/programming/lineups/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
