// Professional Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ProfessionalProfile,
  ProfessionalFilters,
  ProfessionalStats,
  ProfessionalAnalytics,
} from '../types';
import {
  professionalFilterSchema,
  professionalUpsertSchema,
  filterProfessionalProfiles,
  sortProfessionalProfiles,
  calculateProfileCompletion,
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchProfessionalProfiles(
  supabase: SupabaseClient,
  organizationId: string,
  filters?: ProfessionalFilters
): Promise<{ profiles: ProfessionalProfile[]; total: number }> {
  let query = supabase
    .from('user_profiles')
    .select(`
      *,
      manager:users!manager_id(id, email, full_name)
    `, { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = professionalFilterSchema.parse(filters);
    
    if (validatedFilters.employment_type && validatedFilters.employment_type !== 'all') {
      query = query.eq('employment_type', validatedFilters.employment_type);
    }
    
    if (validatedFilters.status && validatedFilters.status !== 'all') {
      query = query.eq('status', validatedFilters.status);
    }
    
    if (validatedFilters.department && validatedFilters.department !== 'all') {
      query = query.eq('department', validatedFilters.department);
    }
    
    if (validatedFilters.manager && validatedFilters.manager !== 'all') {
      query = query.eq('manager_id', validatedFilters.manager);
    }
    
    if (validatedFilters.completion_min) {
      query = query.gte('profile_completion_percentage', validatedFilters.completion_min);
    }
    
    if (validatedFilters.hire_date_from) {
      query = query.gte('hire_date', validatedFilters.hire_date_from);
    }
    
    if (validatedFilters.hire_date_to) {
      query = query.lte('hire_date', validatedFilters.hire_date_to);
    }
    
    if (validatedFilters.has_linkedin) {
      query = query.not('linkedin_url', 'is', null);
    }
    
    if (validatedFilters.has_website) {
      query = query.not('website_url', 'is', null);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `job_title.ilike.%${validatedFilters.search}%,` +
        `department.ilike.%${validatedFilters.search}%,` +
        `employee_id.ilike.%${validatedFilters.search}%,` +
        `bio.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching professional profiles:', error);
    throw error;
  }

  // Transform data to include manager name
  const profiles = (data || []).map(profile => ({
    ...profile,
    manager_name: profile.manager?.full_name || null,
    skills: profile.skills || [],
  }));

  return {
    profiles,
    total: count || 0,
  };
}

export async function fetchProfessionalProfileById(
  supabase: SupabaseClient,
  profileId: string
): Promise<ProfessionalProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      manager:users!manager_id(id, email, full_name)
    `)
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('Error fetching professional profile:', error);
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    manager_name: data.manager?.full_name || null,
    skills: data.skills || [],
  };
}

export async function fetchProfessionalStats(
  supabase: SupabaseClient,
  organizationId: string
): Promise<ProfessionalStats> {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching professional stats:', error);
    throw error;
  }

  if (!profiles || profiles.length === 0) {
    return {
      totalProfiles: 0,
      activeProfiles: 0,
      averageCompletion: 0,
      byEmploymentType: [],
      byDepartment: [],
      byStatus: [],
      completionDistribution: [],
      topSkills: [],
      recentHires: [],
    };
  }

  // Calculate stats
  const totalProfiles = profiles.length;
  const activeProfiles = profiles.filter(p => p.status === 'active').length;
  const averageCompletion = profiles.reduce((sum, p) => sum + (p.profile_completion_percentage || 0), 0) / totalProfiles;

  // Group by employment type
  const employmentTypeMap = new Map<string, { count: number; totalCompletion: number }>();
  profiles.forEach(p => {
    const type = p.employment_type || 'unknown';
    const existing = employmentTypeMap.get(type) || { count: 0, totalCompletion: 0 };
    employmentTypeMap.set(type, {
      count: existing.count + 1,
      totalCompletion: existing.totalCompletion + (p.profile_completion_percentage || 0),
    });
  });
  const byEmploymentType = Array.from(employmentTypeMap.entries()).map(([type, data]) => ({
    type: type as unknown,
    count: data.count,
    averageCompletion: data.totalCompletion / data.count,
  }));

  // Group by department
  const departmentMap = new Map<string, { count: number; totalCompletion: number }>();
  profiles.forEach(p => {
    const dept = p.department || 'Unknown';
    const existing = departmentMap.get(dept) || { count: 0, totalCompletion: 0 };
    departmentMap.set(dept, {
      count: existing.count + 1,
      totalCompletion: existing.totalCompletion + (p.profile_completion_percentage || 0),
    });
  });
  const byDepartment = Array.from(departmentMap.entries()).map(([department, data]) => ({
    department,
    count: data.count,
    averageCompletion: data.totalCompletion / data.count,
  }));

  // Group by status
  const statusMap = new Map<string, number>();
  profiles.forEach(p => {
    statusMap.set(p.status, (statusMap.get(p.status) || 0) + 1);
  });
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status as unknown,
    count,
  }));

  // Completion distribution
  const completionRanges = [
    { range: '0-25%', min: 0, max: 25 },
    { range: '26-50%', min: 26, max: 50 },
    { range: '51-75%', min: 51, max: 75 },
    { range: '76-100%', min: 76, max: 100 },
  ];
  const completionDistribution = completionRanges.map(range => ({
    range: range.range,
    count: profiles.filter(p => {
      const completion = p.profile_completion_percentage || 0;
      return completion >= range.min && completion <= range.max;
    }).length,
  }));

  // Top skills
  const skillsMap = new Map<string, number>();
  profiles.forEach(p => {
    const skills = p.skills || [];
    skills.forEach((skill: string) => {
      skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
    });
  });
  const topSkills = Array.from(skillsMap.entries())
    .map(([skill, frequency]) => ({ skill, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Recent hires (last 12 months)
  const recentHires = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = date.toISOString().split('T')[0];
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const count = profiles.filter(p => {
      if (!p.hire_date) return false;
      return p.hire_date >= monthStart && p.hire_date <= monthEnd;
    }).length;
    
    recentHires.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count,
    });
  }

  return {
    totalProfiles,
    activeProfiles,
    averageCompletion: Math.round(averageCompletion * 100) / 100,
    byEmploymentType,
    byDepartment,
    byStatus,
    completionDistribution,
    topSkills,
    recentHires,
  };
}

export async function fetchProfessionalAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<ProfessionalAnalytics> {
  // Fetch all professional profiles for the organization
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching professional analytics:', error);
    throw error;
  }

  if (!profiles || profiles.length === 0) {
    return {
      profileTrends: [],
      skillAnalytics: [],
      departmentBreakdown: [],
      employmentTypeDistribution: [],
      hiringTrends: [],
      completionMetrics: {
        averageCompletion: 0,
        highCompletion: 0,
        mediumCompletion: 0,
        lowCompletion: 0,
      },
    };
  }

  // Calculate profile trends by period
  const trendMap = new Map<string, { total: number; active: number; completions: number[] }>();
  profiles.forEach(profile => {
    const period = `${new Date(profile.created_at).getFullYear()}`;
    const existing = trendMap.get(period) || { total: 0, active: 0, completions: [] };
    existing.total += 1;
    if (profile.status === 'active') existing.active += 1;
    existing.completions.push(profile.profile_completion_percentage || 0);
    trendMap.set(period, existing);
  });
  
  const profileTrends = Array.from(trendMap.entries())
    .map(([period, data]) => ({
      period,
      totalProfiles: data.total,
      activeProfiles: data.active,
      averageCompletion: data.completions.reduce((a, b) => a + b, 0) / data.completions.length,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  // Calculate skill analytics
  const skillMap = new Map<string, Set<(data: unknown) => void>>();
  profiles.forEach(profile => {
    const skills = profile.skills || [];
    const department = profile.department || 'Unknown';
    skills.forEach((skill: string) => {
      const existing = skillMap.get(skill) || { frequency: 0, departments: new Set() };
      existing.frequency += 1;
      existing.departments.add(department);
      skillMap.set(skill, existing);
    });
  });
  
  const skillAnalytics = Array.from(skillMap.entries())
    .map(([skill, data]) => ({
      skill,
      frequency: data.frequency,
      trend: 0, // Would need historical data
      departments: Array.from(data.departments),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Calculate department breakdown
  const deptMap = new Map<string, { employees: ProfessionalProfile[]; skills: Map<string, number> }>();
  profiles.forEach(profile => {
    const dept = profile.department || 'Unknown';
    const existing = deptMap.get(dept) || { employees: [], skills: new Map() };
    existing.employees.push(profile);
    const skills = profile.skills || [];
    skills.forEach((skill: string) => {
      existing.skills.set(skill, (existing.skills.get(skill) || 0) + 1);
    });
    deptMap.set(dept, existing);
  });
  
  const departmentBreakdown = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    totalEmployees: data.employees.length,
    averageCompletion: data.employees.reduce((sum, emp) => sum + (emp.profile_completion_percentage || 0), 0) / data.employees.length,
    topSkills: Array.from(data.skills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill),
  }));

  // Calculate employment type distribution
  const empTypeMap = new Map<string, { count: number; tenures: number[] }>();
  profiles.forEach(profile => {
    const type = profile.employment_type || 'unknown';
    const existing = empTypeMap.get(type) || { count: 0, tenures: [] };
    existing.count += 1;
    if (profile.hire_date) {
      const tenure = Math.floor((Date.now() - new Date(profile.hire_date).getTime()) / (1000 * 60 * 60 * 24));
      existing.tenures.push(tenure);
    }
    empTypeMap.set(type, existing);
  });
  
  const employmentTypeDistribution = Array.from(empTypeMap.entries()).map(([type, data]) => ({
    type: type as unknown,
    count: data.count,
    percentage: (data.count / profiles.length) * 100,
    averageTenure: data.tenures.length > 0 ? data.tenures.reduce((a, b) => a + b, 0) / data.tenures.length : 0,
  }));

  // Calculate hiring trends (last 12 months)
  const hiringTrends = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = date.toISOString().split('T')[0];
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const hires = profiles.filter(p => {
      if (!p.hire_date) return false;
      return p.hire_date >= monthStart && p.hire_date <= monthEnd;
    }).length;
    
    // For departures, we'd need a separate tracking mechanism
    const departures = 0; // Placeholder
    
    hiringTrends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      hires,
      departures,
      netGrowth: hires - departures,
    });
  }

  // Calculate completion metrics
  const completions = profiles.map(p => p.profile_completion_percentage || 0);
  const completionMetrics = {
    averageCompletion: completions.reduce((a, b) => a + b, 0) / completions.length,
    highCompletion: completions.filter(c => c > 80).length,
    mediumCompletion: completions.filter(c => c >= 50 && c <= 80).length,
    lowCompletion: completions.filter(c => c < 50).length,
  };

  return {
    profileTrends,
    skillAnalytics,
    departmentBreakdown,
    employmentTypeDistribution,
    hiringTrends,
    completionMetrics,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createProfessionalProfile(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<ProfessionalProfile> {
  const validated = professionalUpsertSchema.parse(data);

  // Calculate profile completion
  const completion = calculateProfileCompletion({
    ...validated,
    skills: validated.skills || [],
  } as unknown);

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      organization_id: organizationId,
      ...validated,
      profile_completion_percentage: completion,
      updated_at: new Date().toISOString(),
    })
    .select(`
      *,
      manager:users!manager_id(id, email, full_name)
    `)
    .single();

  if (error) {
    console.error('Error creating professional profile:', error);
    throw error;
  }

  return {
    ...profile,
    manager_name: profile.manager?.full_name || null,
    skills: profile.skills || [],
  };
}

export async function updateProfessionalProfile(
  supabase: SupabaseClient,
  profileId: string,
  data: unknown
): Promise<ProfessionalProfile> {
  const validated = professionalUpsertSchema.parse(data);

  // Calculate profile completion
  const completion = calculateProfileCompletion({
    ...validated,
    skills: validated.skills || [],
  } as unknown);

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update({
      ...validated,
      profile_completion_percentage: completion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select(`
      *,
      manager:users!manager_id(id, email, full_name)
    `)
    .single();

  if (error) {
    console.error('Error updating professional profile:', error);
    throw error;
  }

  return {
    ...profile,
    manager_name: profile.manager?.full_name || null,
    skills: profile.skills || [],
  };
}

export async function deleteProfessionalProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', profileId);

  if (error) {
    console.error('Error deleting professional profile:', error);
    throw error;
  }
}

export async function updateProfileStatus(
  supabase: SupabaseClient,
  profileId: string,
  status: string
): Promise<ProfessionalProfile> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profileId)
    .select(`
      *,
      manager:users!manager_id(id, email, full_name)
    `)
    .single();

  if (error) {
    console.error('Error updating profile status:', error);
    throw error;
  }

  return {
    ...profile,
    manager_name: profile.manager?.full_name || null,
    skills: profile.skills || [],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function fetchManagers(
  supabase: SupabaseClient,
  organizationId: string
): Promise<Array<{ id: string; name: string; email: string }>> {
  const { data: managers, error } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .not('full_name', 'is', null);

  if (error) {
    console.error('Error fetching managers:', error);
    return [];
  }

  return (managers || []).map(manager => ({
    id: manager.id,
    name: manager.full_name || manager.email,
    email: manager.email,
  }));
}

export async function fetchDepartments(
  supabase: SupabaseClient,
  organizationId: string
): Promise<string[]> {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('department')
    .eq('organization_id', organizationId)
    .not('department', 'is', null);

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  const departments = [...new Set(profiles.map(p => p.department).filter(Boolean))];
  return departments.sort();
}

// ============================================================================
// Export Functions
// ============================================================================

export { professionalFilterSchema, professionalUpsertSchema };
