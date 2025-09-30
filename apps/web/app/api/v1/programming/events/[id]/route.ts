import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { updateWithOptimisticLock, deleteWithOptimisticLock } from '@ghxstship/auth/conflict-resolution';

const BASE_SELECT = `
  *,
  project:projects(id, name, status)
`;

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  project_id: z.string().uuid().nullable().optional(),
  event_type: z.enum([
    'performance',
    'activation',
    'workshop',
    'meeting',
    'rehearsal',
    'setup',
    'breakdown',
    'other',
  ]).optional(),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  location: z.string().nullable().optional(),
  capacity: z.number().min(0).max(100000).nullable().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().nullable().optional(),
  setup_start: z.string().datetime().nullable().optional(),
  teardown_end: z.string().datetime().nullable().optional(),
  timezone: z.string().max(64).optional(),
  is_all_day: z.boolean().optional(),
  broadcast_url: z.string().url().nullable().optional(),
  tags: z.array(z.string().max(32)).optional(),
  resources: z.array(z.object({ name: z.string(), quantity: z.number().int().min(1) })).optional(),
  staffing: z.array(z.object({ role: z.string(), user_id: z.string().uuid().optional(), notes: z.string().optional() })).optional(),
  metadata: z.record(z.any()).optional(),
}).refine((data) => {
  if (data.start_at && data.end_at) {
    return new Date(data.start_at) <= new Date(data.end_at);
  }
  return true;
}, { message: 'end_at must be after start_at', path: ['end_at'] });

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

async function getEventById(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from('programming_events')
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

    const event = await getEventById(supabase, membership.organization_id, params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error('GET /api/v1/programming/events/[id] error:', err);
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

    const existing = await getEventById(supabase, membership.organization_id, params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const payload = await request.json();
    const updates = updateEventSchema.parse(payload);

    // Extract client version for optimistic locking
    const clientVersion = request.headers.get('x-client-version') || undefined;

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

    const updatePayload = {
      ...updates,
      project_id: updates.project_id === undefined ? existing.project_id : updates.project_id,
      capacity: updates.capacity ?? existing.capacity,
      location: updates.location ?? existing.location,
      end_at: updates.end_at ?? existing.end_at,
      setup_start: updates.setup_start ?? existing.setup_start,
      teardown_end: updates.teardown_end ?? existing.teardown_end,
      broadcast_url: updates.broadcast_url ?? existing.broadcast_url,
      tags: updates.tags ?? existing.tags,
      resources: updates.resources ?? existing.resources,
      staffing: updates.staffing ?? existing.staffing,
      metadata: updates.metadata ?? existing.metadata,
      timezone: updates.timezone ?? existing.timezone,
      is_all_day: updates.is_all_day ?? existing.is_all_day,
      updated_by: user!.id,
    };

    // Use optimistic locking for the update
    const result = await updateWithOptimisticLock(
      supabase,
      'programming_events',
      params.id,
      membership.organization_id,
      updatePayload,
      clientVersion
    );

    if (!result.success) {
      if (result.error?.type === 'conflict') {
        return NextResponse.json({
          error: result.error.message,
          type: 'conflict',
          serverVersion: result.error.serverVersion
        }, { status: 409 });
      }
      return NextResponse.json({ error: result.error?.message || 'Update failed' }, { status: 400 });
    }

    const event = result.data;

    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'programming_event',
      resource_id: params.id,
      action: 'update',
      details: {
        updated_fields: Object.keys(updates),
      },
    });

    return NextResponse.json(event);
  } catch (err) {
    console.error('PATCH /api/v1/programming/events/[id] error:', err);
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

    const existing = await getEventById(supabase, membership.organization_id, params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Extract client version for optimistic locking
    const clientVersion = request.headers.get('x-client-version') || undefined;

    // Use optimistic locking for the delete
    const result = await deleteWithOptimisticLock(
      supabase,
      'programming_events',
      params.id,
      membership.organization_id,
      clientVersion
    );

    if (!result.success) {
      if (result.error?.type === 'conflict') {
        return NextResponse.json({
          error: result.error.message,
          type: 'conflict',
          serverVersion: result.error.serverVersion
        }, { status: 409 });
      }
      return NextResponse.json({ error: result.error?.message || 'Delete failed' }, { status: 400 });
    }

    await supabase.from('activity_logs').insert({
      organization_id: membership.organization_id,
      user_id: user!.id,
      resource_type: 'programming_event',
      resource_id: params.id,
      action: 'delete',
      details: {
        title: existing.title,
        event_type: existing.event_type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/v1/programming/events/[id] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
