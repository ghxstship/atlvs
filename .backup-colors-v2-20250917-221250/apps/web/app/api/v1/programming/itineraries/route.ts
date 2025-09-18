import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const CreateItinerarySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['travel', 'daily', 'event', 'tour']),
  status: z.enum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  start_date: z.string(),
  end_date: z.string(),
  location: z.string().optional(),
  transportation_type: z.enum(['flight', 'car', 'train', 'bus', 'ship', 'walking']).optional(),
  total_cost: z.number().optional(),
  currency: z.string().optional(),
  participants_count: z.number().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional()
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

    // Get organization ID from membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    let query = supabase
      .from('programming_itineraries')
      .select('*')
      .eq('organization_id', membership.organization_id);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: itineraries, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching itineraries:', error);
      return NextResponse.json({ error: 'Failed to fetch itineraries' }, { status: 500 });
    }

    return NextResponse.json({ data: itineraries });
  } catch (error) {
    console.error('Error in GET /api/v1/programming/itineraries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Get organization ID from membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = CreateItinerarySchema.parse(body);

    const now = new Date().toISOString();
    const { data: itinerary, error } = await supabase
      .from('programming_itineraries')
      .insert([{
        ...validatedData,
        organization_id: membership.organization_id,
        created_by: user.id,
        created_at: now,
        updated_at: now
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating itinerary:', error);
      return NextResponse.json({ error: 'Failed to create itinerary' }, { status: 500 });
    }

    return NextResponse.json({ data: itinerary }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error in POST /api/v1/programming/itineraries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
