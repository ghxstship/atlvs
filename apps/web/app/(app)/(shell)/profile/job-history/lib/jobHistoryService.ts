// Job History Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  JobHistoryEntry,
  JobFilters,
  JobStats,
  JobAnalytics,
} from '../types';
import {
  jobFilterSchema,
  jobUpsertSchema,
  filterJobEntries,
  sortJobEntries,
  calculateDuration,
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchJobHistoryEntries(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: JobFilters
): Promise<{ entries: JobHistoryEntry[]; total: number }> {
  let query = supabase
    .from('job_history')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = jobFilterSchema.parse(filters);
    
    if (validatedFilters.employment_type && validatedFilters.employment_type !== 'all') {
      query = query.eq('employment_type', validatedFilters.employment_type);
    }
    
    if (validatedFilters.company_size && validatedFilters.company_size !== 'all') {
      query = query.eq('company_size', validatedFilters.company_size);
    }
    
    if (validatedFilters.visibility && validatedFilters.visibility !== 'all') {
      query = query.eq('visibility', validatedFilters.visibility);
    }
    
    if (validatedFilters.is_current && validatedFilters.is_current !== 'all') {
      query = query.eq('is_current', validatedFilters.is_current === 'current');
    }
    
    if (validatedFilters.industry && validatedFilters.industry !== 'all') {
      query = query.eq('industry', validatedFilters.industry);
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('start_date', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('start_date', validatedFilters.date_to);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `company_name.ilike.%${validatedFilters.search}%,` +
        `job_title.ilike.%${validatedFilters.search}%,` +
        `department.ilike.%${validatedFilters.search}%,` +
        `description.ilike.%${validatedFilters.search}%,` +
        `location.ilike.%${validatedFilters.search}%,` +
        `industry.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching job history entries:', error);
    throw error;
  }

  return {
    entries: data || [],
    total: count || 0,
  };
}

export async function fetchJobHistoryEntryById(
  supabase: SupabaseClient,
  entryId: string
): Promise<JobHistoryEntry | null> {
  const { data, error } = await supabase
    .from('job_history')
    .select('*')
    .eq('id', entryId)
    .single();

  if (error) {
    console.error('Error fetching job history entry:', error);
    throw error;
  }

  return data;
}

export async function fetchJobHistoryStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<JobStats> {
  const { data: entries, error } = await supabase
    .from('job_history')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching job history stats:', error);
    throw error;
  }

  if (!entries || entries.length === 0) {
    return {
      totalJobs: 0,
      currentJobs: 0,
      completedJobs: 0,
      totalYearsExperience: 0,
      byEmploymentType: [],
      byCompanySize: [],
      byIndustry: [],
      skillsFrequency: [],
      companiesWorked: [],
      averageJobDuration: 0,
    };
  }

  // Calculate stats
  const totalJobs = entries.length;
  const currentJobs = entries.filter(e => e.is_current).length;
  const completedJobs = entries.filter(e => !e.is_current).length;
  
  // Calculate total years of experience
  let totalDays = 0;
  entries.forEach(entry => {
    const start = new Date(entry.start_date);
    const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
  const totalYearsExperience = Math.round((totalDays / 365) * 10) / 10;

  // Group by employment type
  const employmentTypeMap = new Map<string, number>();
  entries.forEach(e => {
    employmentTypeMap.set(e.employment_type, (employmentTypeMap.get(e.employment_type) || 0) + 1);
  });
  const byEmploymentType = Array.from(employmentTypeMap.entries()).map(([type, count]) => ({
    type: type as unknown,
    count,
  }));

  // Group by company size
  const companySizeMap = new Map<string, number>();
  entries.forEach(e => {
    if (e.company_size) {
      companySizeMap.set(e.company_size, (companySizeMap.get(e.company_size) || 0) + 1);
    }
  });
  const byCompanySize = Array.from(companySizeMap.entries()).map(([size, count]) => ({
    size: size as unknown,
    count,
  }));

  // Group by industry
  const industryMap = new Map<string, number>();
  entries.forEach(e => {
    if (e.industry) {
      industryMap.set(e.industry, (industryMap.get(e.industry) || 0) + 1);
    }
  });
  const byIndustry = Array.from(industryMap.entries())
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Skills frequency
  const skillsMap = new Map<string, number>();
  entries.forEach(e => {
    e.skills_used.forEach(skill => {
      skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
    });
  });
  const skillsFrequency = Array.from(skillsMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Companies worked
  const companyMap = new Map<string, { positions: number; totalDuration: number }>();
  entries.forEach(e => {
    const existing = companyMap.get(e.company_name) || { positions: 0, totalDuration: 0 };
    const start = new Date(e.start_date);
    const end = e.is_current ? new Date() : e.end_date ? new Date(e.end_date) : new Date();
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    companyMap.set(e.company_name, {
      positions: existing.positions + 1,
      totalDuration: existing.totalDuration + duration,
    });
  });
  const companiesWorked = Array.from(companyMap.entries())
    .map(([company, { positions, totalDuration }]) => ({
      company,
      positions,
      totalDuration,
    }))
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .slice(0, 10);

  // Average job duration
  const averageJobDuration = totalDays > 0 ? Math.round((totalDays / entries.length) / 30) : 0; // in months

  return {
    totalJobs,
    currentJobs,
    completedJobs,
    totalYearsExperience,
    byEmploymentType,
    byCompanySize,
    byIndustry,
    skillsFrequency,
    companiesWorked,
    averageJobDuration,
  };
}

export async function fetchJobHistoryAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<JobAnalytics> {
  // Fetch all job history entries for the organization
  const { data: entries, error } = await supabase
    .from('job_history')
    .select('*')
    .eq('organization_id', organizationId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching job history analytics:', error);
    throw error;
  }

  if (!entries || entries.length === 0) {
    return {
      careerProgression: [],
      skillsEvolution: [],
      industryExperience: [],
      companyTenure: [],
      salaryProgression: [],
      jobMobility: {
        averageTenure: 0,
        longestTenure: 0,
        shortestTenure: 0,
        jobChangesPerYear: 0,
      },
      locationHistory: [],
    };
  }

  // Calculate career progression by year
  const progressionMap = new Map<number, JobHistoryEntry[]>();
  entries.forEach(entry => {
    const year = new Date(entry.start_date).getFullYear();
    if (!progressionMap.has(year)) {
      progressionMap.set(year, []);
    }
    progressionMap.get(year)!.push(entry);
  });
  const careerProgression = Array.from(progressionMap.entries())
    .map(([year, jobs]) => ({ year, jobs }))
    .sort((a, b) => a.year - b.year);

  // Calculate skills evolution
  const skillsEvolutionMap = new Map<string, Array<{ year: number; count: number }>>();
  entries.forEach(entry => {
    const year = new Date(entry.start_date).getFullYear();
    entry.skills_used.forEach(skill => {
      if (!skillsEvolutionMap.has(skill)) {
        skillsEvolutionMap.set(skill, []);
      }
      const timeline = skillsEvolutionMap.get(skill)!;
      const existing = timeline.find(t => t.year === year);
      if (existing) {
        existing.count += 1;
      } else {
        timeline.push({ year, count: 1 });
      }
    });
  });
  const skillsEvolution = Array.from(skillsEvolutionMap.entries())
    .map(([skill, timeline]) => ({
      skill,
      timeline: timeline.sort((a, b) => a.year - b.year),
    }))
    .filter(s => s.timeline.length > 1)
    .slice(0, 10);

  // Calculate industry experience
  const industryMap = new Map<string, { duration: number; positions: number }>();
  entries.forEach(entry => {
    if (entry.industry) {
      const existing = industryMap.get(entry.industry) || { duration: 0, positions: 0 };
      const start = new Date(entry.start_date);
      const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      industryMap.set(entry.industry, {
        duration: existing.duration + duration,
        positions: existing.positions + 1,
      });
    }
  });
  const industryExperience = Array.from(industryMap.entries())
    .map(([industry, { duration, positions }]) => ({
      industry,
      duration,
      positions,
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Calculate company tenure
  const companyTenureMap = new Map<string, { duration: number; positions: string[] }>();
  entries.forEach(entry => {
    const existing = companyTenureMap.get(entry.company_name) || { duration: 0, positions: [] };
    const start = new Date(entry.start_date);
    const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    companyTenureMap.set(entry.company_name, {
      duration: existing.duration + duration,
      positions: [...existing.positions, entry.job_title],
    });
  });
  const companyTenure = Array.from(companyTenureMap.entries())
    .map(([company, { duration, positions }]) => ({
      company,
      duration,
      positions,
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Calculate salary progression
  const salaryProgression = entries
    .filter(e => e.salary_range)
    .map(e => ({
      year: new Date(e.start_date).getFullYear(),
      range: e.salary_range!,
      company: e.company_name,
      title: e.job_title,
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate job mobility
  const tenures = entries.map(e => {
    const start = new Date(e.start_date);
    const end = e.is_current ? new Date() : e.end_date ? new Date(e.end_date) : new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });
  
  const averageTenure = tenures.length > 0 ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length / 30) : 0; // in months
  const longestTenure = tenures.length > 0 ? Math.round(Math.max(...tenures) / 30) : 0;
  const shortestTenure = tenures.length > 0 ? Math.round(Math.min(...tenures) / 30) : 0;
  
  const careerSpan = entries.length > 1 ? 
    (new Date().getFullYear() - new Date(entries[0].start_date).getFullYear()) || 1 : 1;
  const jobChangesPerYear = Math.round((entries.length / careerSpan) * 10) / 10;

  const jobMobility = {
    averageTenure,
    longestTenure,
    shortestTenure,
    jobChangesPerYear,
  };

  // Calculate location history
  const locationMap = new Map<string, Set<(data: unknown) => void>>();
  entries.forEach(entry => {
    if (entry.location) {
      const existing = locationMap.get(entry.location) || { duration: 0, companies: new Set() };
      const start = new Date(entry.start_date);
      const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      existing.companies.add(entry.company_name);
      locationMap.set(entry.location, {
        duration: existing.duration + duration,
        companies: existing.companies,
      });
    }
  });
  const locationHistory = Array.from(locationMap.entries())
    .map(([location, { duration, companies }]) => ({
      location,
      duration,
      companies: companies.size,
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  return {
    careerProgression,
    skillsEvolution,
    industryExperience,
    companyTenure,
    salaryProgression,
    jobMobility,
    locationHistory,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createJobHistoryEntry(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<JobHistoryEntry> {
  const validated = jobUpsertSchema.parse(data);

  const { data: entry, error } = await supabase
    .from('job_history')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job history entry:', error);
    throw error;
  }

  return entry;
}

export async function updateJobHistoryEntry(
  supabase: SupabaseClient,
  entryId: string,
  data: unknown
): Promise<JobHistoryEntry> {
  const validated = jobUpsertSchema.parse(data);

  const { data: entry, error } = await supabase
    .from('job_history')
    .update({
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job history entry:', error);
    throw error;
  }

  return entry;
}

export async function deleteJobHistoryEntry(
  supabase: SupabaseClient,
  entryId: string
): Promise<void> {
  const { error } = await supabase
    .from('job_history')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error deleting job history entry:', error);
    throw error;
  }
}

export async function toggleJobHistoryEntryCurrent(
  supabase: SupabaseClient,
  entryId: string,
  isCurrent: boolean
): Promise<JobHistoryEntry> {
  const updateData: unknown = {
    is_current: isCurrent,
    updated_at: new Date().toISOString(),
  };

  // If setting to current, clear end_date
  if (isCurrent) {
    updateData.end_date = null;
  }

  const { data: entry, error } = await supabase
    .from('job_history')
    .update(updateData)
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling job history entry current status:', error);
    throw error;
  }

  return entry;
}

export async function updateJobHistoryEntryVisibility(
  supabase: SupabaseClient,
  entryId: string,
  visibility: string
): Promise<JobHistoryEntry> {
  const { data: entry, error } = await supabase
    .from('job_history')
    .update({
      visibility,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job history entry visibility:', error);
    throw error;
  }

  return entry;
}

// ============================================================================
// Export Functions
// ============================================================================

export { jobFilterSchema, jobUpsertSchema };
