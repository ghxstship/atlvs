import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateRiderSchema = z.object({
  event_id: z.string().uuid(),
  kind: z.enum(['technical', 'hospitality', 'stage_plot']).default('technical'),
  details: z.record(z.any()).optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
      .from('riders')
      .select(`
        id,
        kind,
        details,
        requirements,
        notes,
        created_at,
        event:events(id, name)
      `)
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: riders, error } = await query;

    if (error) throw error;

    return NextResponse.json({ riders: riders || [] });
  } catch (error) {
    console.error('Riders API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
    const validatedData = CreateRiderSchema.parse(body);

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

    const riderData = {
      ...validatedData,
      organization_id: membership.organization_id,
    };

    const { data: rider, error } = await supabase
      .from('riders')
      .insert(riderData)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      organization_id: membership.organization_id,
      entity_type: 'rider',
      entity_id: rider.id,
      action: 'created',
      actor_id: user.id,
      metadata: { kind: rider.kind, event_id: rider.event_id }
    });

    return NextResponse.json({ rider }, { status: 201 });
  } catch (error) {
    console.error('Create rider error:', error);
    
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
