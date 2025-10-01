import { z } from 'zod';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';

class ResponseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function getContext() {
  const cookieStore = await cookies();
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

    // Get views by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: accessData } = await ctx.supabase
      .from('resource_access')
      .select('accessed_at, access_type')
      .eq('organization_id', ctx.organizationId)
      .gte('accessed_at', thirtyDaysAgo.toISOString());

    // Process views and downloads by day
    const viewsByDay: { [key: string]: number } = {};
    const downloadsByDay: { [key: string]: number } = {};

    accessData?.forEach(access => {
      const date = new Date(access.accessed_at).toISOString().split('T')[0];
      if (access.access_type === 'view') {
        viewsByDay[date] = (viewsByDay[date] || 0) + 1;
      } else if (access.access_type === 'download') {
        downloadsByDay[date] = (downloadsByDay[date] || 0) + 1;
      }
    });

    // Convert to array format
    const views_by_day = Object.entries(viewsByDay).map(([date, count]) => ({ date, count }));
    const downloads_by_day = Object.entries(downloadsByDay).map(([date, count]) => ({ date, count }));

    // Get popular assets
    const { data: popularAssets } = await ctx.supabase
      .from('resources')
      .select('id, title, view_count, download_count')
      .eq('organization_id', ctx.organizationId)
      .order('view_count', { ascending: false })
      .limit(10);

    const popular_assets = popularAssets?.map(asset => ({
      asset_id: asset.id,
      title: asset.title,
      views: asset.view_count || 0,
      downloads: asset.download_count || 0
    })) || [];

    // Get category distribution
    const { data: categoryData } = await ctx.supabase
      .from('resources')
      .select('category')
      .eq('organization_id', ctx.organizationId);

    const categoryCount: { [key: string]: number } = {};
    categoryData?.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    const category_distribution = Object.entries(categoryCount).map(([category, count]) => ({
      category: category as unknown,
      count
    }));

    // Get storage by category
    const { data: storageData } = await ctx.supabase
      .from('resources')
      .select('category, file_size')
      .eq('organization_id', ctx.organizationId)
      .not('file_size', 'is', null);

    const storageByCategory: { [key: string]: number } = {};
    storageData?.forEach(item => {
      storageByCategory[item.category] = (storageByCategory[item.category] || 0) + (item.file_size || 0);
    });

    const storage_by_category = Object.entries(storageByCategory).map(([category, size_bytes]) => ({
      category: category as unknown,
      size_bytes
    }));

    // Get access level distribution
    const { data: accessLevelData } = await ctx.supabase
      .from('resources')
      .select('visibility')
      .eq('organization_id', ctx.organizationId);

    const accessLevelCount: { [key: string]: number } = {};
    accessLevelData?.forEach(item => {
      const accessLevel = item.visibility || 'public';
      accessLevelCount[accessLevel] = (accessLevelCount[accessLevel] || 0) + 1;
    });

    const access_level_distribution = Object.entries(accessLevelCount).map(([access_level, count]) => ({
      access_level: access_level as unknown,
      count
    }));

    const analytics = {
      views_by_day,
      downloads_by_day,
      popular_assets,
      category_distribution,
      storage_by_category,
      access_level_distribution
    };

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof ResponseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error in GET /api/v1/files/analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
