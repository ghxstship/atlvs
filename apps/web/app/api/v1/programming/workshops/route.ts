import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

const BASE_SELECT = `
  *,
  project:projects(id, name, status),
  event:programming_events(id, title, start_at, end_at, location, venue),
  primary_instructor:users(id, email, full_name, avatar_url)
`;

const createWorkshopSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  category: z.enum(['technical', 'creative', 'business', 'leadership', 'production', 'design', 'marketing', 'finance', 'legal', 'other']),
  type: z.enum(['workshop', 'masterclass', 'seminar', 'bootcamp', 'training', 'certification', 'conference', 'panel']).optional(),
  status: z.enum(['planning', 'open_registration', 'registration_closed', 'full', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'all_levels']).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime().optional().nullable(),
  duration_minutes: z.number().int().min(0).optional().nullable(),
  timezone: z.string().optional().nullable(),
  format: z.enum(['in_person', 'virtual', 'hybrid']).optional(),
  location: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  virtual_link: z.string().url().optional().nullable(),
  max_participants: z.number().int().min(0).optional().nullable(),
  min_participants: z.number().int().min(0).optional().nullable(),
  registration_deadline: z.string().datetime().optional().nullable(),
  registration_opens_at: z.string().datetime().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
  early_bird_price: z.number().min(0).optional().nullable(),
  early_bird_deadline: z.string().datetime().optional().nullable(),
  member_discount: z.number().min(0).max(100).optional().nullable(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  materials_provided: z.array(z.string()).optional(),
  materials_required: z.array(z.string()).optional(),
  agenda: z.string().optional().nullable(),
  primary_instructor_id: z.string().uuid().optional().nullable(),
  co_instructors: z.array(z.string().uuid()).optional(),
  assistants: z.array(z.string().uuid()).optional(),
  has_assessment: z.boolean().optional(),
  assessment_type: z.enum(['quiz', 'project', 'presentation', 'practical']).optional().nullable(),
  certification_available: z.boolean().optional(),
  certification_criteria: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  public_notes: z.string().optional().nullable(),
  cancellation_policy: z.string().optional().nullable(),
  refund_policy: z.string().optional().nullable(),
  featured_image: z.string().url().optional().nullable(),
  gallery_images: z.array(z.string().url()).optional(),
  promotional_video: z.string().url().optional().nullable(),
  tags: z.array(z.string().max(32)).optional(),
  metadata: z.record(z.any()).optional(),
});

const filterSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  category: z.enum(['technical', 'creative', 'business', 'leadership', 'production', 'design', 'marketing', 'finance', 'legal', 'other']).optional(),
  type: z.enum(['workshop', 'masterclass', 'seminar', 'bootcamp', 'training', 'certification', 'conference', 'panel']).optional(),
  status: z.enum(['planning', 'open_registration', 'registration_closed', 'full', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'all_levels']).optional(),
  format: z.enum(['in_person', 'virtual', 'hybrid']).optional(),
  instructor_id: z.string().uuid().optional(),
  search: z.string().optional(),
  start_date_from: z.string().datetime().optional(),
  start_date_to: z.string().datetime().optional(),
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().min(0).optional(),
  has_availability: z.boolean().optional(),
  certification_available: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
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
      .from('programming_workshops')
      .select(BASE_SELECT)
      .eq('organization_id', membership.organization_id)
      .order('start_date', { ascending: true })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters.event_id) {
      query = query.eq('event_id', filters.event_id);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.skill_level) {
      query = query.eq('skill_level', filters.skill_level);
    }

    if (filters.format) {
      query = query.eq('format', filters.format);
    }

    if (filters.instructor_id) {
      query = query.eq('primary_instructor_id', filters.instructor_id);
    }

    if (filters.start_date_from) {
      query = query.gte('start_date', filters.start_date_from);
    }

    if (filters.start_date_to) {
      query = query.lte('start_date', filters.start_date_to);
    }

    if (filters.price_min !== undefined) {
      query = query.gte('price', filters.price_min);
    }

    if (filters.price_max !== undefined) {
      query = query.lte('price', filters.price_max);
    }

    if (filters.has_availability) {
      query = query.lt('current_participants', supabase.raw('max_participants'));
    }

    if (filters.certification_available !== undefined) {
      query = query.eq('certification_available', filters.certification_available);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,agenda.ilike.%${filters.search}%`);
    }

    const { data: workshops, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching workshops:', queryError);
      return NextResponse.json({ error: 'Failed to fetch workshops' }, { status: 500 });
    }

    return NextResponse.json(workshops);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/workshops:', error);
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
    const data = createWorkshopSchema.parse(payload);

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

    // Verify instructor if provided
    if (data.primary_instructor_id) {
      const { data: instructor } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('user_id', data.primary_instructor_id)
        .eq('organization_id', membership.organization_id)
        .eq('status', 'active')
        .maybeSingle();

      if (!instructor) {
        return NextResponse.json({ error: 'Instructor not found or not a member' }, { status: 404 });
      }
    }

    const insertPayload = {
      ...data,
      organization_id: membership.organization_id,
      project_id: data.project_id ?? null,
      event_id: data.event_id ?? null,
      type: data.type ?? 'workshop',
      status: data.status ?? 'planning',
      skill_level: data.skill_level ?? 'all_levels',
      format: data.format ?? 'in_person',
      current_participants: 0,
      waitlist_count: 0,
      has_assessment: data.has_assessment ?? false,
      certification_available: data.certification_available ?? false,
      objectives: data.objectives ?? [],
      prerequisites: data.prerequisites ?? [],
      materials_provided: data.materials_provided ?? [],
      materials_required: data.materials_required ?? [],
      co_instructors: data.co_instructors ?? [],
      assistants: data.assistants ?? [],
      gallery_images: data.gallery_images ?? [],
      tags: data.tags ?? [],
      metadata: data.metadata ?? {},
      created_by: user!.id,
      updated_by: user!.id,
    };

    const { data: workshop, error: insertError } = await supabase
      .from('programming_workshops')
      .insert(insertPayload)
      .select(BASE_SELECT)
      .single();

    if (insertError) throw insertError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'workshop',
      resource_id: workshop.id,
      action: 'create',
      details: {
        title: workshop.title,
        category: workshop.category,
        start_date: workshop.start_date,
      },
    });

    return NextResponse.json(workshop, { status: 201 });
  } catch (err) {
    console.error('POST /api/v1/programming/workshops error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
