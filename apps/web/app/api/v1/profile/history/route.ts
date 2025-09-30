import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  historyFilterSchema,
  fetchHistoryEntries,
  fetchHistoryEntryById,
  fetchHistoryStats,
  createHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
  toggleHistoryEntryCurrent,
  updateHistoryEntryVisibility,
} from '@/app/(app)/(shell)/profile/history/lib/historyService';
import type { HistoryFilters } from '@/app/(app)/(shell)/profile/history/types';

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

    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get('entry_id');

    if (entryId) {
      const entry = await fetchHistoryEntryById(supabase, entryId);
      return NextResponse.json(entry);
    }

    const filtersInput: HistoryFilters = {
      search: searchParams.get('search') ?? '',
      entry_type: (searchParams.get('entry_type') ?? 'all') as HistoryFilters['entry_type'],
      employment_type: (searchParams.get('employment_type') ?? 'all') as HistoryFilters['employment_type'],
      education_level: (searchParams.get('education_level') ?? 'all') as HistoryFilters['education_level'],
      project_status: (searchParams.get('project_status') ?? 'all') as HistoryFilters['project_status'],
      visibility: (searchParams.get('visibility') ?? 'all') as HistoryFilters['visibility'],
      is_current: (searchParams.get('is_current') ?? 'all') as HistoryFilters['is_current'],
      date_from: searchParams.get('date_from') ?? undefined,
      date_to: searchParams.get('date_to') ?? undefined,
      has_achievements: searchParams.get('has_achievements') === 'true',
    };

    const validatedFilters = historyFilterSchema.parse(filtersInput);
    const result = await fetchHistoryEntries(
      supabase,
      membership.organization_id,
      user!.id,
      validatedFilters
    );

    const stats = await fetchHistoryStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/history:', error);
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
    const entryId = searchParams.get('entry_id');
    const action = searchParams.get('action');

    // Handle special actions
    if (entryId && action) {
      const body = await request.json() as {
        is_current?: boolean;
        visibility?: HistoryFilters['visibility'];
      };
      
      switch (action) {
        case 'toggle_current': {
          if (typeof body.is_current !== 'boolean') {
            return NextResponse.json({ error: 'is_current must be boolean' }, { status: 400 });
          }
          const toggledEntry = await toggleHistoryEntryCurrent(
            supabase,
            entryId,
            body.is_current
          );
          return NextResponse.json(toggledEntry);
        }
        
        case 'update_visibility': {
          if (!body.visibility) {
            return NextResponse.json({ error: 'visibility is required' }, { status: 400 });
          }
          const updatedEntry = await updateHistoryEntryVisibility(
            supabase,
            entryId,
            body.visibility
          );
          return NextResponse.json(updatedEntry);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Create new history entry
    const data = await request.json();
    const entry = await createHistoryEntry(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/history:', error);
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
    const entryId = searchParams.get('entry_id');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const data = await request.json();
    const entry = await updateHistoryEntry(supabase, entryId, data);

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/history:', error);
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
    const entryId = searchParams.get('entry_id');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    await deleteHistoryEntry(supabase, entryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
