import { z as zod } from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import {
  performanceFilterSchema,
  fetchPerformanceReviews,
  fetchPerformanceReviewById,
  fetchPerformanceStats,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  updateReviewStatus,
  updateReviewVisibility,
} from '@/app/(app)/(shell)/profile/performance/lib/performanceService';

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
    const reviewId = searchParams.get('review_id');

    if (reviewId) {
      const review = await fetchPerformanceReviewById(supabase, reviewId);
      return NextResponse.json(review);
    }

    const filters = {
      search: searchParams.get('search') || '',
      review_type: searchParams.get('review_type') || 'all',
      status: searchParams.get('status') || 'all',
      visibility: searchParams.get('visibility') || 'all',
      reviewer: searchParams.get('reviewer') || 'all',
      rating_min: searchParams.get('rating_min') ? parseFloat(searchParams.get('rating_min')!) : undefined,
      rating_max: searchParams.get('rating_max') ? parseFloat(searchParams.get('rating_max')!) : undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      has_goals: searchParams.get('has_goals') === 'true',
      promotion_recommended: searchParams.get('promotion_recommended') === 'true',
    };

    const validatedFilters = performanceFilterSchema.parse(filters);
    const result = await fetchPerformanceReviews(
      supabase,
      membership.organization_id,
      user!.id,
      validatedFilters
    );

    const stats = await fetchPerformanceStats(
      supabase,
      membership.organization_id,
      user!.id
    );

    return NextResponse.json({
      ...result,
      stats,
    });
  } catch (error) {
    console.error('Error in GET /api/v1/profile/performance:', error);
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
    const reviewId = searchParams.get('review_id');
    const action = searchParams.get('action');
    // Handle special actions
    if (reviewId && action) {
      const body = await request.json();
      
      switch (action) {
        case 'toggle_active': {
          const toggledRecord = await updateReviewStatus(
            supabase,
            reviewId,
            body.status
          );
          return NextResponse.json(toggledRecord);
        }
        
        case 'update_visibility': {
          const updatedRecord = await updateReviewVisibility(
            supabase,
            reviewId,
            body.visibility
          );
          return NextResponse.json(updatedRecord);
        }
        
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }

    // Create new performance review
    const data = await request.json();
    const review = await createPerformanceReview(
      supabase,
      membership.organization_id,
      user!.id,
      data
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/profile/performance:', error);
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
    const reviewId = searchParams.get('review_id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const data = await request.json();
    const review = await updatePerformanceReview(supabase, reviewId, data);

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/performance:', error);
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
    const reviewId = searchParams.get('review_id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    await deletePerformanceReview(supabase, reviewId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/v1/profile/performance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
