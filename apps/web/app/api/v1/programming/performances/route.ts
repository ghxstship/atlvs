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

const createPerformanceSchema = z.object({
  event_id: z.string().uuid(),
  project_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  performance_type: z.enum(['concert', 'theater', 'dance', 'comedy', 'spoken_word', 'variety', 'festival', 'other']).optional(),
  status: z.enum(['planning', 'rehearsal', 'ready', 'live', 'completed', 'cancelled']).optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().min(1).max(1440).optional().nullable(),
  venue: z.string().max(255).optional().nullable(),
  venue_capacity: z.number().int().min(1).optional().nullable(),
  ticket_info: z.object({
    price_min: z.number().min(0).optional(),
    price_max: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    sales_url: z.string().url().optional(),
    sold_out: z.boolean().optional()
  }).optional(),
  technical_requirements: z.object({
    sound_system: z.string().optional(),
    lighting: z.string().optional(),
    stage_setup: z.string().optional(),
    equipment_needed: z.array(z.string()).optional(),
    crew_requirements: z.string().optional()
  }).optional(),
  production_notes: z.object({
    rehearsal_schedule: z.string().optional(),
    call_time: z.string().datetime().optional(),
    sound_check: z.string().datetime().optional(),
    special_instructions: z.string().optional()
  }).optional(),
  audience_info: z.object({
    expected_attendance: z.number().int().min(0).optional(),
    target_demographic: z.string().optional(),
    accessibility_notes: z.string().optional()
  }).optional(),
  tags: z.array(z.string().max(32)).optional(),
  metadata: z.record(z.any()).optional()
});

const filterSchema = z.object({
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['planning', 'rehearsal', 'ready', 'live', 'completed', 'cancelled']).optional(),
  performance_type: z.enum(['concert', 'theater', 'dance', 'comedy', 'spoken_word', 'variety', 'festival', 'other']).optional(),
  venue: z.string().optional(),
  search: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
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

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const filters = filterSchema.parse(Object.fromEntries(new URL(request.url).searchParams));

    let query = supabase
      .from('programming_performances')
      .select(BASE_SELECT)
      .eq('organization_id', membership.organization_id)
      .order('starts_at', { ascending: true })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.event_id) {
      query = query.eq('event_id', filters.event_id);
    }

    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.performance_type) {
      query = query.eq('performance_type', filters.performance_type);
    }

    if (filters.venue) {
      query = query.ilike('venue', `%${filters.venue}%`);
    }

    if (filters.start_date) {
      query = query.gte('starts_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('starts_at', filters.end_date);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,venue.ilike.%${filters.search}%`);
    }

    const { data: performances, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching performances:', queryError);
      return NextResponse.json({ error: 'Failed to fetch performances' }, { status: 500 });
    }

    return NextResponse.json(performances);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/performances:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const data = createPerformanceSchema.parse(payload);

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

    const insertPayload = {
      ...data,
      organization_id: membership.organization_id,
      project_id: data.project_id ?? null,
      ticket_info: data.ticket_info ?? {},
      technical_requirements: data.technical_requirements ?? {},
      production_notes: data.production_notes ?? {},
      audience_info: data.audience_info ?? {},
      tags: data.tags ?? [],
      metadata: data.metadata ?? {},
      created_by: user!.id,
      updated_by: user!.id
    };

    const { data: performance, error: insertError } = await supabase
      .from('programming_performances')
      .insert(insertPayload)
      .select(BASE_SELECT)
      .single();

    if (insertError) throw insertError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'performance',
      resource_id: performance.id,
      action: 'create',
      details: {
        name: performance.name,
        performance_type: performance.performance_type,
        event_id: performance.event_id
      }
    });

    return NextResponse.json(performance, { status: 201 });
  } catch (err) {
    console.error('POST /api/v1/programming/performances error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
