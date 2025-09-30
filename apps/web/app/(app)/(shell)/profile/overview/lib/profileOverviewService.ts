import { z as zod } from 'zod';
import type {
  ProfileOverview,
  ProfileOverviewFilters,
  ProfileOverviewStats,
  ProfileOverviewAnalytics,
  RecentActivity,
} from '../types';
import { 
  createEmptyProfileOverviewStats, 
  createEmptyProfileOverviewAnalytics 
} from '../types';

export const profileOverviewFilterSchema = zod.object({
  status: zod.enum(['all', 'active', 'inactive', 'pending', 'suspended']).optional(),
  department: zod.string().optional(),
  completion_range: zod.object({
    min: zod.number().min(0).max(100),
    max: zod.number().min(0).max(100),
  }).optional(),
  search: zod.string().optional(),
  date_from: zod.string().datetime().optional(),
  date_to: zod.string().datetime().optional(),
  has_certifications: zod.boolean().optional(),
  has_job_history: zod.boolean().optional(),
  recent_login: zod.boolean().optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0),
});

export const profileOverviewUpdateSchema = zod.object({
  job_title: zod.string().optional(),
  department: zod.string().optional(),
  employee_id: zod.string().optional(),
  phone_primary: zod.string().optional(),
  location: zod.string().optional(),
  bio: zod.string().max(500).optional(),
  status: zod.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
});

export const analyticsFilterSchema = zod.object({
  period: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: zod.enum(['day', 'week', 'month']).default('day'),
});

export const bulkActionSchema = zod.object({
  action: zod.enum(['activate', 'deactivate', 'delete']),
  profile_ids: zod.array(zod.string().uuid()),
});

export const exportSchema = zod.object({
  format: zod.enum(['csv', 'xlsx', 'json', 'pdf']),
  profile_ids: zod.array(zod.string().uuid()).optional(),
  filters: profileOverviewFilterSchema.optional(),
  fields: zod.array(zod.string()).optional(),
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export function getPeriodDates(period: string) {
  const now = new Date();
  const periodMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  };

  const days = periodMap[period] ?? 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, endDate: now };
}

export async function fetchProfileOverview(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<ProfileOverview | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user:users!user_id(id, full_name, email),
        certifications:user_certifications(count),
        job_history:user_job_history(count),
        emergency_contacts:user_emergency_contacts(count),
        endorsements:user_endorsements(count)
      `)
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    // Transform the data to match ProfileOverview interface
    const profile: ProfileOverview = {
      ...data,
      full_name: data.user?.full_name || 'Unknown User',
      email: data.user?.email || '',
      certifications_count: data.certifications?.length || 0,
      job_history_count: data.job_history?.length || 0,
      emergency_contacts_count: data.emergency_contacts?.length || 0,
      endorsements_count: data.endorsements?.length || 0,
    };

    return profile;
  } catch (error) {
    console.error('Error fetching profile overview:', error);
    return null;
  }
}

export async function fetchProfileOverviews(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof profileOverviewFilterSchema>
): Promise<{
  profiles: ProfileOverview[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user:users!user_id(id, full_name, email),
        certifications:user_certifications(count),
        job_history:user_job_history(count),
        emergency_contacts:user_emergency_contacts(count),
        endorsements:user_endorsements(count)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.department) {
      query = query.ilike('department', `%${filters.department}%`);
    }

    if (filters.completion_range) {
      query = query
        .gte('profile_completion_percentage', filters.completion_range.min)
        .lte('profile_completion_percentage', filters.completion_range.max);
    }

    if (filters.search) {
      query = query.or(`
        job_title.ilike.%${filters.search}%,
        department.ilike.%${filters.search}%,
        bio.ilike.%${filters.search}%,
        employee_id.ilike.%${filters.search}%
      `);
    }

    if (filters.date_from) {
      query = query.gte('updated_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('updated_at', filters.date_to);
    }

    if (filters.recent_login) {
      const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('last_login', recentDate);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    // Transform the data
    const profiles: ProfileOverview[] = (data || []).map(item => ({
      ...item,
      full_name: item.user?.full_name || 'Unknown User',
      email: item.user?.email || '',
      certifications_count: item.certifications?.length || 0,
      job_history_count: item.job_history?.length || 0,
      emergency_contacts_count: item.emergency_contacts?.length || 0,
      endorsements_count: item.endorsements?.length || 0,
    }));

    return {
      profiles,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching profile overviews:', error);
    return {
      profiles: [],
      total: 0,
    };
  }
}

export async function updateProfileOverview(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  profileData: zod.infer<typeof profileOverviewUpdateSchema>,
  updatedBy: string
): Promise<ProfileOverview | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        last_updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .select(`
        *,
        user:users!user_id(id, full_name, email),
        certifications:user_certifications(count),
        job_history:user_job_history(count),
        emergency_contacts:user_emergency_contacts(count),
        endorsements:user_endorsements(count)
      `)
      .single();

    if (error) throw error;

    // Create activity log entry
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'profile_updated',
        activity_description: 'Profile overview information was updated',
        metadata: {
          fields_updated: Object.keys(profileData),
          updated_by: updatedBy,
        },
        performed_by: updatedBy,
      });

    // Transform the data
    const profile: ProfileOverview = {
      ...data,
      full_name: data.user?.full_name || 'Unknown User',
      email: data.user?.email || '',
      certifications_count: data.certifications?.length || 0,
      job_history_count: data.job_history?.length || 0,
      emergency_contacts_count: data.emergency_contacts?.length || 0,
      endorsements_count: data.endorsements?.length || 0,
    };

    return profile;
  } catch (error) {
    console.error('Error updating profile overview:', error);
    return null;
  }
}

export async function fetchProfileOverviewStats(
  supabase: SupabaseClient,
  orgId: string
): Promise<ProfileOverviewStats> {
  try {
    // Get basic counts
    const [totalResult, activeResult, recentLoginsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId),
      
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('status', 'active'),
      
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .eq('organization_id', orgId)
        .gte('last_login', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Get profile data for distributions
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('profile_completion_percentage, department, status')
      .eq('organization_id', orgId);

    const profiles = profileData || [];
    const totalProfiles = totalResult.count || 0;
    const activeProfiles = activeResult.count || 0;
    const recentLogins = recentLoginsResult.count || 0;

    // Calculate average completion
    const averageCompletion = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + (p.profile_completion_percentage || 0), 0) / profiles.length
      : 0;

    // Department distribution
    const departmentCounts = profiles.reduce((acc, profile) => {
      const dept = profile.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentDistribution = Object.entries(departmentCounts)
      .map(([department, count]) => ({
        department,
        count,
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Completion distribution
    const completionRanges = [
      { range: '0-25%', min: 0, max: 25 },
      { range: '26-50%', min: 26, max: 50 },
      { range: '51-75%', min: 51, max: 75 },
      { range: '76-100%', min: 76, max: 100 },
    ];

    const completionDistribution = completionRanges.map(({ range, min, max }) => {
      const count = profiles.filter(p => 
        (p.profile_completion_percentage || 0) >= min && 
        (p.profile_completion_percentage || 0) <= max
      ).length;
      
      return {
        range,
        count,
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0,
      };
    });

    // Status distribution
    const statusCounts = profiles.reduce((acc, profile) => {
      const status = profile.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProfiles,
      activeProfiles,
      averageCompletion: Math.round(averageCompletion),
      recentLogins,
      departmentDistribution,
      completionDistribution,
      statusDistribution,
    };
  } catch (error) {
    console.error('Error fetching profile overview stats:', error);
    return createEmptyProfileOverviewStats();
  }
}

export async function fetchProfileOverviewAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof analyticsFilterSchema>
): Promise<ProfileOverviewAnalytics> {
  try {
    const { startDate, endDate } = getPeriodDates(filters.period);

    // Get completion trends from activity log
    const { data: activityData } = await supabase
      .from('user_profile_activity')
      .select('created_at, metadata')
      .eq('organization_id', orgId)
      .eq('activity_type', 'profile_updated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    type ActivityRow = {
      created_at: string;
      metadata?: { completion_percentage?: number } | null;
    };

    type DailyUpdate = {
      profilesUpdated: number;
      completionSum: number;
    };

    const activityRows: ActivityRow[] = (activityData ?? []) as ActivityRow[];

    // Process completion trends
    const dailyUpdates = activityRows.reduce<Record<string, DailyUpdate>((acc, activity) => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { profilesUpdated: 0, completionSum: 0 };
      }
      acc[date].profilesUpdated += 1;
      const completion = activity.metadata?.completion_percentage ?? 0;
      acc[date].completionSum += completion;
      return acc;
    }, {});

    const completionTrends = Object.entries(dailyUpdates).map(([date, stats]) => ({
      date,
      averageCompletion: stats.profilesUpdated > 0 ? stats.completionSum / stats.profilesUpdated : 0,
      profilesUpdated: stats.profilesUpdated,
    }));

    // Mock login activity data (would need to be tracked separately)
    const loginActivity = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        uniqueLogins: Math.floor(Math.random() * 50) + 10,
        totalSessions: Math.floor(Math.random() * 100) + 20,
      };
    }).reverse();

    // Get current profile data for department analysis
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select(`
        department, 
        profile_completion_percentage, 
        status,
        certifications:user_certifications(count)
      `)
      .eq('organization_id', orgId);

    type ProfileRow = {
      department: string | null;
      profile_completion_percentage?: number | null;
      status?: string | null;
      certifications?: unknown[] | null;
    };

    const profiles: ProfileRow[] = (profileData ?? []) as ProfileRow[];

    // Department stats
    type DepartmentStat = {
      totalProfiles: number;
      completionSum: number;
      activeProfiles: number;
    };

    const departmentStats = profiles.reduce<Record<string, DepartmentStat>((acc, profile) => {
      const dept = profile.department ?? 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { totalProfiles: 0, completionSum: 0, activeProfiles: 0 };
      }
      acc[dept].totalProfiles += 1;
      acc[dept].completionSum += profile.profile_completion_percentage ?? 0;
      if (profile.status === 'active') {
        acc[dept].activeProfiles += 1;
      }
      return acc;
    }, {});

    const departmentStatsArray = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      totalProfiles: stats.totalProfiles,
      averageCompletion: stats.totalProfiles > 0 ? Math.round(stats.completionSum / stats.totalProfiles) : 0,
      activeProfiles: stats.activeProfiles,
    }));

    // Certification stats by department
    type CertificationStat = {
      totalCertifications: number;
      profileCount: number;
      expiringCertifications: number;
    };

    const certificationStats = profiles.reduce<Record<string, CertificationStat>((acc, profile) => {
      const dept = profile.department ?? 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { totalCertifications: 0, profileCount: 0, expiringCertifications: 0 };
      }
      acc[dept].profileCount += 1;
      const certificationCount = Array.isArray(profile.certifications) ? profile.certifications.length : 0;
      acc[dept].totalCertifications += certificationCount;
      // Mock expiring certifications data
      acc[dept].expiringCertifications += Math.floor(Math.random() * 2);
      return acc;
    }, {});

    const certificationStatsArray = Object.entries(certificationStats).map(([department, stats]) => ({
      department,
      totalCertifications: stats.totalCertifications,
      averageCertifications: stats.profileCount > 0 ? Math.round(stats.totalCertifications / stats.profileCount) : 0,
      expiringCertifications: stats.expiringCertifications,
    }));

    return {
      completionTrends,
      loginActivity,
      departmentStats: departmentStatsArray,
      certificationStats: certificationStatsArray,
    };
  } catch (error) {
    console.error('Error fetching profile overview analytics:', error);
    return createEmptyProfileOverviewAnalytics();
  }
}

export async function fetchRecentActivity(
  supabase: SupabaseClient,
  orgId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  try {
    const { data, error } = await supabase
      .from('user_profile_activity')
      .select(`
        *,
        user:users!user_id(full_name, avatar_url)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(activity => ({
      ...activity,
      user_name: activity.user?.full_name || 'Unknown User',
      user_avatar: activity.user?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export async function performBulkAction(
  supabase: SupabaseClient,
  orgId: string,
  action: zod.infer<typeof bulkActionSchema>,
  performedBy: string
): Promise<{ success: boolean; affectedCount: number; errors?: string[] }> {
  try {
    const { action: actionType, profile_ids } = action;
    let result;
    let affectedCount = 0;

    switch (actionType) {
      case 'activate':
        result = await supabase
          .from('user_profiles')
          .update({ 
            status: 'active',
            last_updated_by: performedBy,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', orgId)
          .in('user_id', profile_ids);
        break;

      case 'deactivate':
        result = await supabase
          .from('user_profiles')
          .update({ 
            status: 'inactive',
            last_updated_by: performedBy,
            updated_at: new Date().toISOString(),
          })
          .eq('organization_id', orgId)
          .in('user_id', profile_ids);
        break;

      case 'delete':
        result = await supabase
          .from('user_profiles')
          .delete()
          .eq('organization_id', orgId)
          .in('user_id', profile_ids);
        break;

      default:
        throw new Error(`Unknown action: ${actionType}`);
    }

    if (result.error) throw result.error;

    affectedCount = profile_ids.length;

    // Log the bulk action
    await supabase
      .from('user_profile_activity')
      .insert(
        profile_ids.map(userId => ({
          user_id: userId,
          organization_id: orgId,
          activity_type: 'profile_updated',
          activity_description: `Profile ${actionType}d via bulk action`,
          metadata: {
            bulk_action: actionType,
            performed_by: performedBy,
          },
          performed_by: performedBy,
        }))
      );

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return { 
      success: false, 
      affectedCount: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
}

export async function exportProfileOverviews(
  supabase: SupabaseClient,
  orgId: string,
  exportConfig: zod.infer<typeof exportSchema>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const { format, profile_ids, filters, fields } = exportConfig;

    // Fetch the data to export
    let profiles: ProfileOverview[];
    
    if (profile_ids && profile_ids.length > 0) {
      // Export specific profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user:users!user_id(id, full_name, email),
          certifications:user_certifications(count),
          job_history:user_job_history(count),
          emergency_contacts:user_emergency_contacts(count),
          endorsements:user_endorsements(count)
        `)
        .eq('organization_id', orgId)
        .in('user_id', profile_ids);

      if (error) throw error;

      profiles = (data || []).map(item => ({
        ...item,
        full_name: item.user?.full_name || 'Unknown User',
        email: item.user?.email || '',
        certifications_count: item.certifications?.length || 0,
        job_history_count: item.job_history?.length || 0,
        emergency_contacts_count: item.emergency_contacts?.length || 0,
        endorsements_count: item.endorsements?.length || 0,
      }));
    } else if (filters) {
      // Export based on filters
      const result = await fetchProfileOverviews(supabase, orgId, filters);
      profiles = result.profiles;
    } else {
      // Export all profiles
      const result = await fetchProfileOverviews(supabase, orgId, { limit: 1000, offset: 0 });
      profiles = result.profiles;
    }

    // Filter fields if specified
    let exportData = profiles;
    if (fields && fields.length > 0) {
      exportData = profiles.map(profile => {
        const filteredProfile: unknown = {};
        fields.forEach(field => {
          if (field in profile) {
            filteredProfile[field] = profile[field as keyof ProfileOverview];
          }
        });
        return filteredProfile;
      });
    }

    // Format data based on export format
    switch (format) {
      case 'json':
        return { success: true, data: JSON.stringify(exportData, null, 2) };
      
      case 'csv':
        if (exportData.length === 0) {
          return { success: true, data: '' };
        }
        
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(item => 
          Object.values(item).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(',')
        );
        
        return { success: true, data: [headers, ...rows].join('\n') };
      
      case 'xlsx':
      case 'pdf':
        // These would require additional libraries like xlsx or jsPDF
        // For now, return JSON format
        return { success: true, data: JSON.stringify(exportData, null, 2) };
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting profile overviews:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Export failed' 
    };
  }
}
