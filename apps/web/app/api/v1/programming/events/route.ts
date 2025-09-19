import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateEventSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum(['performance', 'activation', 'workshop']).default('performance'),
  project_id: z.string().uuid(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, roles')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    let query = supabase
      .from('events')
      .select(`
        id,
        name,
        kind,
        starts_at,
        ends_at,
        description,
        venue,
        created_at,
        project:projects(id, name)
      `)
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and roles
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, roles')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Check permissions - require admin or manager role for creating events
    const roles = Array.isArray(membership.roles) ? membership.roles : [];
    if (!roles.includes('admin') && !roles.includes('manager')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateEventSchema.parse(body);

    // Verify project belongs to organization
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', validatedData.project_id)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }

    const eventData = {
      ...validatedData,
      organization_id: membership.organization_id,
    };

    const { data: event, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activities').insert({
      organization_id: membership.organization_id,
      entity_type: 'event',
      entity_id: event.id,
      action: 'created',
      actor_id: user.id,
      metadata: { name: event.name, kind: event.kind }
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
