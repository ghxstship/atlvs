import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  travelFilterSchema,
  fetchTravelRecords,
  fetchTravelRecordById,
  fetchTravelStats,
  createTravelRecord,
  updateTravelRecord,
  deleteTravelRecord,
  updateTravelStatus,
} from '@/app/(app)/(shell)/profile/travel/lib/travelService';

async function getSupabase() {
  const cookieStore = await cookies();
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

    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('record_id');

    if (recordId) {
      const record = await fetchTravelRecordById(supabase, recordId);
      return NextResponse.json(record);
    }

    const filters = {
      search: searchParams.get('search') || '',
      travel_type: searchParams.get('travel_type') || 'all',
      status: searchParams.get('status') || 'all',
      country: searchParams.get('country') || 'all',
      visa_required: searchParams.get('visa_required') === 'true' ? true : undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      expenses_min: searchParams.get('expenses_min') ? parseFloat(searchParams.get('expenses_min')!) : undefined,
      expenses_max: searchParams.get('expenses_max') ? parseFloat(searchParams.get('expenses_max')!) : undefined,
      duration_min: searchParams.get('duration_min') ? parseInt(searchParams.get('duration_min')!) : undefined,
      duration_max: searchParams.get('duration_max') ? parseInt(searchParams.get('duration_max')!) : undefined,
      has_visa: searchParams.get('has_visa') === 'true' ? true : undefined,
    };

    const validatedFilters = travelFilterSchema.parse(filters);
    const result = await fetchTravelRecords(
      supabase,
      membership.organization_id,
      user!.id,
      validatedFilters
    );

    const stats = await fetchTravelStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/travel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('record_id');
    const action = searchParams.get('action');
    // Handle special actions
    if (recordId && action) {
      const body = await request.json();
      
      switch (action) {
        case 'update_status': {
          const updatedRecord = await updateTravelStatus(
            supabase,
            recordId,
            body.status
          );
          return NextResponse.json(updatedRecord);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Create new travel record
    const data = await request.json();
    const record = await createTravelRecord(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/travel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('record_id');

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
    }

    const data = await request.json();
    const record = await updateTravelRecord(supabase, recordId, data);

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/travel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, error } = await requireAuth();
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const recordId = searchParams.get('record_id');

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
    }

    await deleteTravelRecord(supabase, recordId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/travel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
