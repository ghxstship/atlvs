import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

const UpdateItinerarySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  type: z.enum(['travel', 'daily', 'event', 'tour']).optional(),
  status: z.enum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().optional(),
  transportation_type: z.enum(['flight', 'car', 'train', 'bus', 'ship', 'walking']).optional(),
  total_cost: z.number().optional(),
  currency: z.string().optional(),
  participants_count: z.number().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: itinerary, error } = await supabase
      .from('programming_itineraries')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
      }
      console.error('Error fetching itinerary:', error);
      return NextResponse.json({ error: 'Failed to fetch itinerary' }, { status: 500 });
    }

    return NextResponse.json({ data: itinerary });
  } catch (error) {
    console.error('Error in GET /api/v1/programming/itineraries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = UpdateItinerarySchema.parse(body);

    const { data: itinerary, error } = await supabase
      .from('programming_itineraries')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 });
      }
      console.error('Error updating itinerary:', error);
      return NextResponse.json({ error: 'Failed to update itinerary' }, { status: 500 });
    }

    return NextResponse.json({ data: itinerary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error in PUT /api/v1/programming/itineraries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { error } = await supabase
      .from('programming_itineraries')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', membership.organization_id);

    if (error) {
      console.error('Error deleting itinerary:', error);
      return NextResponse.json({ error: 'Failed to delete itinerary' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/programming/itineraries/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
