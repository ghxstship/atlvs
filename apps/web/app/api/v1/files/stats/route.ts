import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';

class ResponseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function getContext() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new ResponseError('Unauthorized', 401);
  }

  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    throw new ResponseError('Organization membership required', 403);
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    organizationId: membership.organization_id,
    role: membership.role
  };
}

export async function GET() {
  try {
    const ctx = await getContext();

    // Get total counts
    const { count: totalAssets } = await ctx.supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', ctx.organizationId);

    const { count: activeAssets } = await ctx.supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', ctx.organizationId)
      .eq('status', 'published');

    const { count: archivedAssets } = await ctx.supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', ctx.organizationId)
      .eq('status', 'archived');

    const { count: featuredAssets } = await ctx.supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', ctx.organizationId)
      .eq('is_featured', true);

    // Get aggregated stats
    const { data: viewsData } = await ctx.supabase
      .from('resources')
      .select('view_count')
      .eq('organization_id', ctx.organizationId);

    const { data: downloadsData } = await ctx.supabase
      .from('resources')
      .select('download_count')
      .eq('organization_id', ctx.organizationId);

    const { data: storageData } = await ctx.supabase
      .from('resources')
      .select('file_size')
      .eq('organization_id', ctx.organizationId)
      .not('file_size', 'is', null);

    const totalViews = viewsData?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
    const totalDownloads = downloadsData?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0;
    const totalStorage = storageData?.reduce((sum, item) => sum + (item.file_size || 0), 0) || 0;

    // Get category count
    const { data: categoryData } = await ctx.supabase
      .from('resources')
      .select('category')
      .eq('organization_id', ctx.organizationId);

    const uniqueCategories = new Set(categoryData?.map(item => item.category) || []).size;

    // Get active users (users who have accessed resources in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await ctx.supabase
      .from('resource_access')
      .select('user_id', { count: 'exact', head: true })
      .eq('organization_id', ctx.organizationId)
      .gte('accessed_at', thirtyDaysAgo.toISOString());

    const stats = {
      total_assets: totalAssets || 0,
      active_assets: activeAssets || 0,
      archived_assets: archivedAssets || 0,
      featured_assets: featuredAssets || 0,
      total_views: totalViews,
      total_downloads: totalDownloads,
      total_storage_used: totalStorage,
      categories_count: uniqueCategories,
      folders_count: 0, // TODO: Implement folder counting when folders are implemented
      active_users: activeUsers || 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in GET /api/v1/files/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
