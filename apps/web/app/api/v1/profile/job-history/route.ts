import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  jobFilterSchema,
  fetchJobHistoryEntries,
  fetchJobHistoryEntryById,
  fetchJobHistoryStats,
  createJobHistoryEntry,
  updateJobHistoryEntry,
  deleteJobHistoryEntry,
  toggleJobHistoryEntryCurrent,
  updateJobHistoryEntryVisibility,
} from '@/app/(app)/(shell)/profile/job-history/lib/jobHistoryService';
import type { JobHistoryFilters } from '@/app/(app)/(shell)/profile/job-history/types';

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
    const entryId = searchParams.get('entry_id');

    if (entryId) {
      const entry = await fetchJobHistoryEntryById(supabase, entryId);
      return NextResponse.json(entry);
    }

    const filtersInput: JobHistoryFilters = {
      search: searchParams.get('search') || '',
      employment_type: (searchParams.get('employment_type') || 'all') as JobHistoryFilters['employment_type'],
      company_size: (searchParams.get('company_size') || 'all') as JobHistoryFilters['company_size'],
      visibility: (searchParams.get('visibility') || 'all') as JobHistoryFilters['visibility'],
      is_current: (searchParams.get('is_current') || 'all') as JobHistoryFilters['is_current'],
      industry: searchParams.get('industry') || 'all',
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      has_achievements: searchParams.get('has_achievements') === 'true',
    };

    const validatedFilters = jobFilterSchema.parse(filtersInput);
    const normalizedFilters: JobHistoryFilters = {
      search: validatedFilters.search ?? '',
      employment_type: validatedFilters.employment_type ?? 'all',
      company_size: validatedFilters.company_size ?? 'all',
      visibility: validatedFilters.visibility ?? 'all',
      is_current: validatedFilters.is_current ?? 'all',
      industry: validatedFilters.industry ?? 'all',
      date_from: validatedFilters.date_from,
      date_to: validatedFilters.date_to,
      has_achievements: validatedFilters.has_achievements,
    };
    const result = await fetchJobHistoryEntries(
      supabase,
      membership.organization_id,
      user!.id,
      normalizedFilters
    );

    const stats = await fetchJobHistoryStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/job-history:', error);
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
        visibility?: JobHistoryFilters['visibility'];
      };
      
      switch (action) {
        case 'toggle_current': {
          if (typeof body.is_current !== 'boolean') {
            return NextResponse.json({ error: 'is_current must be boolean' }, { status: 400 });
          }
          const toggledEntry = await toggleJobHistoryEntryCurrent(
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
          const updatedEntry = await updateJobHistoryEntryVisibility(
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

    // Create new job history entry
    const data = await request.json();
    const entry = await createJobHistoryEntry(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/job-history:', error);
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
    const entry = await updateJobHistoryEntry(supabase, entryId, data);

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/job-history:', error);
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

    await deleteJobHistoryEntry(supabase, entryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/job-history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
