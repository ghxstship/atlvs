import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  analyticsFilterSchema,
  fetchUniformSizingAnalytics,
  fetchRecentActivity,
} from '@/app/(app)/(shell)/profile/uniform/lib/uniformSizingService';

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

function hasPermission(role: string, action: 'read' | 'write' | 'admin'): boolean {
  const permissions = {
    owner: ['read', 'write', 'admin'],
    admin: ['read', 'write', 'admin'],
    manager: ['read', 'write'],
    member: ['read'],
  };

  return permissions[role as keyof typeof permissions]?.includes(action) ?? false;
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!hasPermission(membership.role, 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const orgId = membership.organization_id;
    const url = new URL(request.url);
    const activityMode = url.searchParams.get('activity') === 'true';

    if (activityMode) {
      // Get recent activity
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const activity = await fetchRecentActivity(supabase, orgId, limit);
      return NextResponse.json(activity);
    }

    // Get analytics data
    const filters = analyticsFilterSchema.parse(Object.fromEntries(url.searchParams));
    const analytics = await fetchUniformSizingAnalytics(supabase, orgId, filters);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/v1/profile/uniform/analytics:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
