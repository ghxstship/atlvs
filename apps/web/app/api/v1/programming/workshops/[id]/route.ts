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

const updateWorkshopSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(['technical', 'creative', 'business', 'leadership', 'production', 'design', 'marketing', 'finance', 'legal', 'other']).optional(),
  type: z.enum(['workshop', 'masterclass', 'seminar', 'bootcamp', 'training', 'certification', 'conference', 'panel']).optional(),
  status: z.enum(['planning', 'open_registration', 'registration_closed', 'full', 'in_progress', 'completed', 'cancelled', 'postponed']).optional(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert', 'all_levels']).optional(),
  start_date: z.string().datetime().optional(),
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

async function getWorkshop(supabase: ReturnType<typeof createServerClient>, id: string, orgId: string) {
  const { data, error } = await supabase
    .from('programming_workshops')
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

    const workshop = await getWorkshop(supabase, params.id, membership.organization_id);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    return NextResponse.json(workshop);
  } catch (error) {
    console.error('Error in GET /api/v1/programming/workshops/[id]:', error);
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

    const existingWorkshop = await getWorkshop(supabase, params.id, membership.organization_id);
    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    const payload = await request.json();
    const data = updateWorkshopSchema.parse(payload);

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

    const updatePayload = {
      ...data,
      updated_by: user!.id,
      updated_at: new Date().toISOString()
    };

    const { data: workshop, error: updateError } = await supabase
      .from('programming_workshops')
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
      resource_type: 'workshop',
      resource_id: workshop.id,
      action: 'update',
      details: {
        title: workshop.title,
        category: workshop.category,
        changes: Object.keys(data)
      }
    });

    return NextResponse.json(workshop);
  } catch (err) {
    console.error('PATCH /api/v1/programming/workshops/[id] error:', err);
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

    const existingWorkshop = await getWorkshop(supabase, params.id, membership.organization_id);
    if (!existingWorkshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Check if workshop has participants
    if (existingWorkshop.current_participants > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete workshop with registered participants. Cancel the workshop instead.' 
      }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('programming_workshops')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (deleteError) throw deleteError;

    // Log activity
    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'workshop',
      resource_id: params.id,
      action: 'delete',
      details: {
        title: existingWorkshop.title,
        category: existingWorkshop.category,
        start_date: existingWorkshop.start_date
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/programming/workshops/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
