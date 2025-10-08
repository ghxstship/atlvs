import { z as zod } from 'zod';
import type {
  ActivityRecord,
  ActivityFilters,
  ActivityStats,
  ActivityAnalytics,
  ActivityType
} from '../types';
import { createEmptyActivityStats, createEmptyActivityAnalytics } from '../types';

export const activityFilterSchema = zod.object({
  activity_type: zod.enum([
    'all',
    'profile_updated',
    'certification_added',
    'certification_expired',
    'job_history_added',
    'emergency_contact_updated',
    'health_record_updated',
    'travel_info_updated',
    'uniform_sizing_updated',
    'performance_review_completed',
    'endorsement_received',
    'profile_created',
    'profile_viewed'
  ]).optional(),
  date_from: zod.string().datetime().optional(),
  date_to: zod.string().datetime().optional(),
  performed_by: zod.string().uuid().optional(),
  search: zod.string().optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0)
});

export const analyticsFilterSchema = zod.object({
  period: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: zod.enum(['hour', 'day', 'week', 'month']).default('day')
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export function getPeriodDates(period: string) {
  const now = new Date();
  const periodMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };

  const days = periodMap[period] ?? 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

export async function fetchUserActivityData(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  filters: zod.infer<typeof activityFilterSchema>
): Promise<{
  activities: ActivityRecord[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_profile_activity')
      .select(`
        *,
        performed_by_user:users!performed_by(id, full_name, email)
      `, { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    // Apply filters
    if (filters.activity_type && filters.activity_type !== 'all') {
      query = query.eq('activity_type', filters.activity_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.performed_by) {
      query = query.eq('performed_by', filters.performed_by);
    }

    if (filters.search) {
      query = query.or(`activity_description.ilike.%${filters.search}%,activity_type.ilike.%${filters.search}%`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    const activities: ActivityRecord[] = (data || []).map(activity => ({
      ...activity,
      performed_by_name: activity.performed_by_user?.full_name || 'System'
    }));

    return {
      activities,
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    return {
      activities: [],
      total: 0
    };
  }
}

export async function fetchActivityStats(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<ActivityStats> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get activity counts
    const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
      supabase
        .from('user_profile_activity')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('user_id', userId),
      
      supabase
        .from('user_profile_activity')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .gte('created_at', today.toISOString()),
      
      supabase
        .from('user_profile_activity')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString()),
      
      supabase
        .from('user_profile_activity')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString()),
    ]);

    // Get activity type distribution
    const { data: typeData } = await supabase
      .from('user_profile_activity')
      .select('activity_type')
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    const typeCounts = (typeData || []).reduce((acc, item) => {
      acc[item.activity_type] = (acc[item.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalActivities = totalResult.count || 0;
    const topActivityTypes = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type: type as ActivityType,
        count,
        percentage: totalActivities > 0 ? (count / totalActivities) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent activity trends (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const { data: trendData } = await supabase
      .from('user_profile_activity')
      .select('created_at')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailyCounts = (trendData || []).reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityTrends = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    }));

    // Get user engagement metrics
    const profileUpdates = typeCounts['profile_updated'] || 0;
    const certificationsAdded = typeCounts['certification_added'] || 0;
    const reviewsCompleted = typeCounts['performance_review_completed'] || 0;

    const { data: lastActivityData } = await supabase
      .from('user_profile_activity')
      .select('created_at')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastActivity = lastActivityData?.[0]?.created_at || '';

    return {
      totalActivities,
      todayActivities: todayResult.count || 0,
      weekActivities: weekResult.count || 0,
      monthActivities: monthResult.count || 0,
      topActivityTypes,
      activityTrends,
      userEngagement: {
        profileUpdates,
        certificationsAdded,
        reviewsCompleted,
        lastActivity
      }
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return createEmptyActivityStats();
  }
}

export async function fetchActivityAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  filters: zod.infer<typeof analyticsFilterSchema>
): Promise<ActivityAnalytics> {
  try {
    const { startDate, endDate } = getPeriodDates(filters.period);

    // Get daily activity data
    const { data: dailyData } = await supabase
      .from('user_profile_activity')
      .select('created_at, activity_type')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Process daily activity
    const dailyActivity = (dailyData || []).reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, types: {} as Record<ActivityType, number> };
      }
      acc[date].count++;
      acc[date].types[item.activity_type as ActivityType] = 
        (acc[date].types[item.activity_type as ActivityType] || 0) + 1;
      return acc;
    }, {} as Record<string, unknown>);

    // Get type distribution
    const typeCounts = (dailyData || []).reduce((acc, item) => {
      acc[item.activity_type] = (acc[item.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCount = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);
    const typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({
      type: type as ActivityType,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
    }));

    // Get time patterns (hour of day)
    const timePatterns = (dailyData || []).reduce((acc, item) => {
      const hour = new Date(item.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: timePatterns[hour] || 0
    }));

    return {
      dailyActivity: Object.values(dailyActivity),
      typeDistribution,
      userActivity: [], // Single user context, so empty
      timePatterns: hourlyPatterns
    };
  } catch (error) {
    console.error('Error fetching activity analytics:', error);
    return createEmptyActivityAnalytics();
  }
}

export async function createActivityRecord(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  activityType: ActivityType,
  description: string,
  metadata?: Record<string, unknown>,
  performedBy?: string
): Promise<ActivityRecord | null> {
  try {
    const { data, error } = await supabase
      .from('user_profile_activity')
      .insert({
        organization_id: orgId,
        user_id: userId,
        activity_type: activityType,
        activity_description: description,
        metadata: metadata || {},
        performed_by: performedBy
      })
      .select(`
        *,
        performed_by_user:users!performed_by(id, full_name, email)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      performed_by_name: data.performed_by_user?.full_name || 'System'
    };
  } catch (error) {
    console.error('Error creating activity record:', error);
    return null;
  }
}
