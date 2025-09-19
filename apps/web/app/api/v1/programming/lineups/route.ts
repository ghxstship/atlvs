import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateLineupSchema = z.object({
  event_id: z.string().uuid(),
  performer: z.string().min(1).max(200),
  stage: z.string().max(100).optional(),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  notes: z.string().optional(),
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
    const eventId = searchParams.get('event_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    let query = supabase
      .from('lineups')
      .select(`
        id,
        performer,
        stage,
        starts_at,
        ends_at,
        notes,
        created_at,
        event:events(id, name)
      `)
      .eq('organization_id', membership.organization_id)
      .order('starts_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: lineups, error } = await query;

    if (error) throw error;

    return NextResponse.json({ lineups: lineups || [] });
  } catch (error) {
    console.error('Lineups API error:', error);
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

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, roles')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const roles = Array.isArray(membership.roles) ? membership.roles : [];
    if (!roles.includes('admin') && !roles.includes('manager')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateLineupSchema.parse(body);

    // Verify event belongs to organization
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', validatedData.event_id)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (!event) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    const lineupData = {
      ...validatedData,
      organization_id: membership.organization_id,
    };

    const { data: lineup, error } = await supabase
      .from('lineups')
      .insert(lineupData)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      organization_id: membership.organization_id,
      entity_type: 'lineup',
      entity_id: lineup.id,
      action: 'created',
      actor_id: user.id,
      metadata: { performer: lineup.performer, event_id: lineup.event_id }
    });

    return NextResponse.json({ lineup }, { status: 201 });
  } catch (error) {
    console.error('Create lineup error:', error);
    
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
