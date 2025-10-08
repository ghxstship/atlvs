import { z as zod } from 'zod';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  analyticsFilterSchema,
  fetchActivityAnalytics
} from '@/app/(app)/(shell)/profile/activity/lib/activityService';

export const dynamic = 'force-dynamic';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
}

async function requireAuth() {
  const supabase = await getSupabase();
  const {
    data: { user }
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

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;

    // Check if user can access the target user's analytics
    if (targetUserId !== user!.id) {
      // Only allow if user is admin/owner or manager of target user
      const { data: targetProfile } = await supabase
        .from('user_profiles')
        .select('manager_id')
        .eq('user_id', targetUserId)
        .eq('organization_id', orgId)
        .single();

      const isManager = targetProfile?.manager_id === user!.id;
      const isAdmin = ['owner', 'admin'].includes(membership.role);

      if (!isManager && !isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const filters = analyticsFilterSchema.parse(Object.fromEntries(url.searchParams));
    const analytics = await fetchActivityAnalytics(supabase, orgId, targetUserId, filters);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/v1/profile/activity/analytics:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
