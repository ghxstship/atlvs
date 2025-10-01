import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  healthFilterSchema,
  fetchHealthRecords,
  fetchHealthRecordById,
  fetchHealthStats,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  toggleHealthRecordActive,
  updateHealthRecordReminder,
} from '@/app/(app)/(shell)/profile/health/lib/healthService';

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
      const record = await fetchHealthRecordById(supabase, recordId);
      return NextResponse.json(record);
    }

    const filters = {
      search: searchParams.get('search') || '',
      record_type: searchParams.get('record_type') || 'all',
      severity: searchParams.get('severity') || 'all',
      category: searchParams.get('category') || 'all',
      privacy_level: searchParams.get('privacy_level') || 'all',
      is_active: searchParams.get('is_active') || 'all',
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      expiring_soon: searchParams.get('expiring_soon') === 'true',
    };

    const validatedFilters = healthFilterSchema.parse(filters);
    const result = await fetchHealthRecords(
      supabase,
      membership.organization_id,
      user!.id,
      validatedFilters
    );

    const stats = await fetchHealthStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/health:', error);
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
        case 'toggle_active': {
          const toggledRecord = await toggleHealthRecordActive(
            supabase,
            recordId,
            body.is_active
          );
          return NextResponse.json(toggledRecord);
        }
        
        case 'update_reminder': {
          const updatedRecord = await updateHealthRecordReminder(
            supabase,
            recordId,
            body.reminder_enabled,
            body.reminder_days_before
          );
          return NextResponse.json(updatedRecord);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Create new health record
    const data = await request.json();
    const record = await createHealthRecord(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/health:', error);
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
    const record = await updateHealthRecord(supabase, recordId, data);

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/health:', error);
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

    await deleteHealthRecord(supabase, recordId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/health:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
