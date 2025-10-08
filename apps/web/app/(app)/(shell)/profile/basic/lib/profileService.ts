import { z as zod } from 'zod';
import type {
  UserProfile,
  ProfileFilters,
  ProfileStats,
  ProfileAnalytics
} from '../types';
import { createEmptyProfileStats, createEmptyProfileAnalytics } from '../types';

export const profileFilterSchema = zod.object({
  status: zod.enum(['all', 'active', 'inactive', 'pending', 'suspended']).optional(),
  department: zod.string().optional(),
  employment_type: zod.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']).optional(),
  completion_range: zod.object({
    min: zod.number().min(0).max(100),
    max: zod.number().min(0).max(100)
  }).optional(),
  search: zod.string().optional(),
  date_from: zod.string().datetime().optional(),
  date_to: zod.string().datetime().optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0)
});

export const profileUpdateSchema = zod.object({
  avatar_url: zod.string().url().optional().or(zod.literal('')),
  date_of_birth: zod.string().optional(),
  gender: zod.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  nationality: zod.string().optional(),
  languages: zod.array(zod.string()).default([]),
  phone_primary: zod.string().optional(),
  phone_secondary: zod.string().optional(),
  address_line1: zod.string().optional(),
  address_line2: zod.string().optional(),
  city: zod.string().optional(),
  state_province: zod.string().optional(),
  postal_code: zod.string().optional(),
  country: zod.string().optional(),
  job_title: zod.string().optional(),
  department: zod.string().optional(),
  employee_id: zod.string().optional(),
  hire_date: zod.string().optional(),
  employment_type: zod.enum(['full-time', 'part-time', 'contract', 'freelance', 'intern']).optional(),
  skills: zod.array(zod.string()).default([]),
  bio: zod.string().max(500).optional(),
  linkedin_url: zod.string().url().optional().or(zod.literal('')),
  website_url: zod.string().url().optional().or(zod.literal(''))
});

export const analyticsFilterSchema = zod.object({
  period: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: zod.enum(['day', 'week', 'month']).default('day')
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

export async function fetchUserProfile(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        manager:users!manager_id(id, full_name, email),
        last_updated_by_user:users!last_updated_by(id, full_name, email)
      `)
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function fetchProfiles(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof profileFilterSchema>
): Promise<{
  profiles: UserProfile[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user:users!user_id(id, full_name, email),
        manager:users!manager_id(id, full_name, email)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.department) {
      query = query.ilike('department', `%${filters.department}%`);
    }

    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
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
        nationality.ilike.%${filters.search}%
      `);
    }

    if (filters.date_from) {
      query = query.gte('updated_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('updated_at', filters.date_to);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    return {
      profiles: data || [],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return {
      profiles: [],
      total: 0
    };
  }
}

export async function updateUserProfile(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  profileData: zod.infer<typeof profileUpdateSchema>,
  updatedBy: string
): Promise<UserProfile | null> {
  try {
    // Calculate profile completion percentage
    const completionPercentage = calculateProfileCompletion(profileData);

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        organization_id: orgId,
        ...profileData,
        profile_completion_percentage: completionPercentage,
        last_updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        manager:users!manager_id(id, full_name, email),
        last_updated_by_user:users!last_updated_by(id, full_name, email)
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
        activity_description: 'Profile information was updated',
        metadata: {
          fields_updated: Object.keys(profileData),
          completion_percentage: completionPercentage
        },
        performed_by: updatedBy
      });

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

export async function fetchProfileStats(
  supabase: SupabaseClient,
  orgId: string
): Promise<ProfileStats> {
  try {
    // Get basic counts
    const [totalResult, activeResult, recentResult] = await Promise.all([
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
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Get completion and department data
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('profile_completion_percentage, department, employment_type')
      .eq('organization_id', orgId);

    const profiles = profileData || [];
    const totalProfiles = totalResult.count || 0;
    const activeProfiles = activeResult.count || 0;
    const recentUpdates = recentResult.count || 0;

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
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0
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
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0
      };
    });

    // Employment type distribution
    const employmentCounts = profiles.reduce((acc, profile) => {
      const type = profile.employment_type || 'Unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const employmentTypeDistribution = Object.entries(employmentCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalProfiles > 0 ? (count / totalProfiles) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalProfiles,
      activeProfiles,
      averageCompletion: Math.round(averageCompletion),
      recentUpdates,
      departmentDistribution,
      completionDistribution,
      employmentTypeDistribution
    };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return createEmptyProfileStats();
  }
}

export async function fetchProfileAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof analyticsFilterSchema>
): Promise<ProfileAnalytics> {
  try {
    const { startDate, endDate } = getPeriodDates(filters.period);

    // Get completion trends
    const { data: activityData } = await supabase
      .from('user_profile_activity')
      .select('created_at, metadata')
      .eq('organization_id', orgId)
      .eq('activity_type', 'profile_updated')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Process completion trends
    const dailyUpdates = (activityData || []).reduce((acc, activity) => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { profilesUpdated: 0, completionSum: 0 };
      }
      acc[date].profilesUpdated++;
      acc[date].completionSum += activity.metadata?.completion_percentage || 0;
      return acc;
    }, {} as Record<string, unknown>);

    const completionTrends = Object.entries(dailyUpdates).map(([date, data]) => ({
      date,
      averageCompletion: data.profilesUpdated > 0 ? data.completionSum / data.profilesUpdated : 0,
      profilesUpdated: data.profilesUpdated
    }));

    // Get current profile data for analysis
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('department, profile_completion_percentage, status, skills, languages')
      .eq('organization_id', orgId);

    const profiles = profileData || [];

    // Department stats
    const departmentStats = profiles.reduce((acc, profile) => {
      const dept = profile.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = { totalProfiles: 0, completionSum: 0, activeProfiles: 0 };
      }
      acc[dept].totalProfiles++;
      acc[dept].completionSum += profile.profile_completion_percentage || 0;
      if (profile.status === 'active') {
        acc[dept].activeProfiles++;
      }
      return acc;
    }, {} as Record<string, unknown>);

    const departmentStatsArray = Object.entries(departmentStats).map(([department, stats]) => ({
      department,
      totalProfiles: stats.totalProfiles,
      averageCompletion: stats.totalProfiles > 0 ? Math.round(stats.completionSum / stats.totalProfiles) : 0,
      activeProfiles: stats.activeProfiles
    }));

    // Skills analysis
    const skillCounts = profiles.reduce((acc, profile) => {
      (profile.skills || []).forEach((skill: string) => {
        if (!acc[skill]) {
          acc[skill] = { count: 0, departments: new Set() };
        }
        acc[skill].count++;
        if (profile.department) {
          acc[skill].departments.add(profile.department);
        }
      });
      return acc;
    }, {} as Record<string, unknown>);

    const skillsAnalysis = Object.entries(skillCounts)
      .map(([skill, data]) => ({
        skill,
        count: data.count as number,
        departments: Array.from(data.departments as Set<string>)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Language distribution
    const languageCounts = profiles.reduce((acc, profile) => {
      (profile.languages || []).forEach((language: string) => {
        acc[language] = (acc[language] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const totalLanguageEntries = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
    const languageDistribution = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: totalLanguageEntries > 0 ? (count / totalLanguageEntries) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      completionTrends,
      departmentStats: departmentStatsArray,
      skillsAnalysis,
      languageDistribution
    };
  } catch (error) {
    console.error('Error fetching profile analytics:', error);
    return createEmptyProfileAnalytics();
  }
}

function calculateProfileCompletion(profile: Partial<UserProfile>): number {
  const fields = [
    'avatar_url',
    'date_of_birth',
    'gender',
    'nationality',
    'phone_primary',
    'address_line1',
    'city',
    'country',
    'job_title',
    'department',
    'employment_type',
    'bio',
  ];

  const arrayFields = ['languages', 'skills'];
  
  let completedFields = 0;
  let totalFields = fields.length + arrayFields.length;

  // Check regular fields
  fields.forEach(field => {
    if (profile[field as keyof UserProfile] && 
        String(profile[field as keyof UserProfile]).trim() !== '') {
      completedFields++;
    }
  });

  // Check array fields
  arrayFields.forEach(field => {
    const value = profile[field as keyof UserProfile] as string[] | undefined;
    if (value && Array.isArray(value) && value.length > 0) {
      completedFields++;
    }
  });

  return Math.round((completedFields / totalFields) * 100);
}
