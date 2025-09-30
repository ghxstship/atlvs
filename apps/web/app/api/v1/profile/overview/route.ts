import { z as zod } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import {
  profileOverviewFilterSchema,
  profileOverviewUpdateSchema,
  bulkActionSchema,
  exportSchema,
  fetchProfileOverview,
  fetchProfileOverviews,
  updateProfileOverview,
  fetchProfileOverviewStats,
  performBulkAction,
  exportProfileOverviews,
} from '@/app/(app)/(shell)/profile/overview/lib/profileOverviewService';

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
    const targetUserId = url.searchParams.get('user_id');
    const listMode = url.searchParams.get('list') === 'true';
    const statsMode = url.searchParams.get('stats') === 'true';

    if (statsMode) {
      // Get overview statistics
      const stats = await fetchProfileOverviewStats(supabase, orgId);
      return NextResponse.json(stats);
    }

    if (listMode) {
      // List multiple profile overviews
      const filters = profileOverviewFilterSchema.parse(Object.fromEntries(url.searchParams));
      const result = await fetchProfileOverviews(supabase, orgId, filters);
      return NextResponse.json(result);
    }

    if (targetUserId) {
      // Get specific profile overview
      const canViewOthers = hasPermission(membership.role, 'admin');
      if (targetUserId !== user!.id && !canViewOthers) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const profile = await fetchProfileOverview(supabase, orgId, targetUserId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json(profile);
    }

    // Default: get current user's profile overview
    const profile = await fetchProfileOverview(supabase, orgId, user!.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in GET /api/v1/profile/overview:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user, error } = await requireAuth();
    if (error) return error;

    const membership = await getMembership(supabase, user!.id);
    if (!membership?.organization_id) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    if (!hasPermission(membership.role, 'write')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('user_id') || user!.id;

    // Check if user can update the target user's profile
    const canUpdateOthers = hasPermission(membership.role, 'admin');
    if (targetUserId !== user!.id && !canUpdateOthers) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const profileData = profileOverviewUpdateSchema.parse(body);
    const updatedProfile = await updateProfileOverview(
      supabase,
      membership.organization_id,
      targetUserId,
      profileData,
      user!.id
    );

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in PUT /api/v1/profile/overview:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const body = await request.json();
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'bulk': {
        if (!hasPermission(membership.role, 'admin')) {
          return NextResponse.json({ error: 'Admin permissions required for bulk actions' }, { status: 403 });
        }

        const bulkAction = bulkActionSchema.parse(body);
        const result = await performBulkAction(
          supabase,
          membership.organization_id,
          bulkAction,
          user!.id
        );

        return NextResponse.json(result);
      }

      case 'export': {
        if (!hasPermission(membership.role, 'read')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const exportConfig = exportSchema.parse(body);
        const result = await exportProfileOverviews(
          supabase,
          membership.organization_id,
          exportConfig
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Set appropriate headers for file download
        const headers = new Headers();
        headers.set('Content-Type', getContentType(exportConfig.format));
        headers.set('Content-Disposition', `attachment; filename="profile-overviews.${exportConfig.format}"`);

        return new NextResponse(result.data, { headers });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/v1/profile/overview:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getContentType(format: string): string {
  const contentTypes = {
    csv: 'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json',
    pdf: 'application/pdf',
  };

  return contentTypes[format as keyof typeof contentTypes] || 'application/octet-stream';
}
