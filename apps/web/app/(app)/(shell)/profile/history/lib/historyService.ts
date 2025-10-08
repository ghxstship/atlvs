// History Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  HistoryEntry,
  HistoryFilters,
  HistoryStats,
  HistoryAnalytics
} from '../types';
import {
  historyFilterSchema,
  historyUpsertSchema,
  filterHistoryEntries,
  sortHistoryEntries,
  calculateDuration
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchHistoryEntries(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: HistoryFilters
): Promise<{ entries: HistoryEntry[]; total: number }> {
  let query = supabase
    .from('history_entries')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = historyFilterSchema.parse(filters);
    
    if (validatedFilters.entry_type && validatedFilters.entry_type !== 'all') {
      query = query.eq('entry_type', validatedFilters.entry_type);
    }
    
    if (validatedFilters.employment_type && validatedFilters.employment_type !== 'all') {
      query = query.eq('employment_type', validatedFilters.employment_type);
    }
    
    if (validatedFilters.education_level && validatedFilters.education_level !== 'all') {
      query = query.eq('education_level', validatedFilters.education_level);
    }
    
    if (validatedFilters.project_status && validatedFilters.project_status !== 'all') {
      query = query.eq('project_status', validatedFilters.project_status);
    }
    
    if (validatedFilters.visibility && validatedFilters.visibility !== 'all') {
      query = query.eq('visibility', validatedFilters.visibility);
    }
    
    if (validatedFilters.is_current && validatedFilters.is_current !== 'all') {
      query = query.eq('is_current', validatedFilters.is_current === 'current');
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('start_date', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('start_date', validatedFilters.date_to);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `title.ilike.%${validatedFilters.search}%,` +
        `organization.ilike.%${validatedFilters.search}%,` +
        `description.ilike.%${validatedFilters.search}%,` +
        `location.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching history entries:', error);
    throw error;
  }

  return {
    entries: data || [],
    total: count || 0
  };
}

export async function fetchHistoryEntryById(
  supabase: SupabaseClient,
  entryId: string
): Promise<HistoryEntry | null> {
  const { data, error } = await supabase
    .from('history_entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (error) {
    console.error('Error fetching history entry:', error);
    throw error;
  }

  return data;
}

export async function fetchHistoryStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<HistoryStats> {
  const { data: entries, error } = await supabase
    .from('history_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching history stats:', error);
    throw error;
  }

  if (!entries || entries.length === 0) {
    return {
      totalEntries: 0,
      currentEntries: 0,
      completedEntries: 0,
      totalYearsExperience: 0,
      byType: [],
      byEmploymentType: [],
      byEducationLevel: [],
      skillsFrequency: [],
      organizationsWorked: []
    };
  }

  // Calculate stats
  const totalEntries = entries.length;
  const currentEntries = entries.filter(e => e.is_current).length;
  const completedEntries = entries.filter(e => !e.is_current).length;
  
  // Calculate total years of experience
  let totalDays = 0;
  entries.forEach(entry => {
    const start = new Date(entry.start_date);
    const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    totalDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });
  const totalYearsExperience = Math.round((totalDays / 365) * 10) / 10;

  // Group by type
  const typeMap = new Map<string, number>();
  entries.forEach(e => {
    typeMap.set(e.entry_type, (typeMap.get(e.entry_type) || 0) + 1);
  });
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type: type as unknown,
    count
  }));

  // Group by employment type
  const employmentTypeMap = new Map<string, number>();
  entries.forEach(e => {
    if (e.employment_type) {
      employmentTypeMap.set(e.employment_type, (employmentTypeMap.get(e.employment_type) || 0) + 1);
    }
  });
  const byEmploymentType = Array.from(employmentTypeMap.entries()).map(([type, count]) => ({
    type: type as unknown,
    count
  }));

  // Group by education level
  const educationLevelMap = new Map<string, number>();
  entries.forEach(e => {
    if (e.education_level) {
      educationLevelMap.set(e.education_level, (educationLevelMap.get(e.education_level) || 0) + 1);
    }
  });
  const byEducationLevel = Array.from(educationLevelMap.entries()).map(([level, count]) => ({
    level: level as unknown,
    count
  }));

  // Skills frequency
  const skillsMap = new Map<string, number>();
  entries.forEach(e => {
    e.skills_gained.forEach(skill => {
      skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
    });
  });
  const skillsFrequency = Array.from(skillsMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Organizations worked
  const orgMap = new Map<string, { count: number; totalDuration: number }>();
  entries.forEach(e => {
    if (e.organization) {
      const existing = orgMap.get(e.organization) || { count: 0, totalDuration: 0 };
      const start = new Date(e.start_date);
      const end = e.is_current ? new Date() : e.end_date ? new Date(e.end_date) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      orgMap.set(e.organization, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + duration
      });
    }
  });
  const organizationsWorked = Array.from(orgMap.entries())
    .map(([organization, { count, totalDuration }]) => ({
      organization,
      count,
      totalDuration
    }))
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .slice(0, 10);

  return {
    totalEntries,
    currentEntries,
    completedEntries,
    totalYearsExperience,
    byType,
    byEmploymentType,
    byEducationLevel,
    skillsFrequency,
    organizationsWorked
  };
}

export async function fetchHistoryAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<HistoryAnalytics> {
  // Fetch all history entries for the organization
  const { data: entries, error } = await supabase
    .from('history_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching history analytics:', error);
    throw error;
  }

  if (!entries || entries.length === 0) {
    return {
      careerProgression: [],
      skillsEvolution: [],
      industryExperience: [],
      educationJourney: [],
      achievementTimeline: [],
      careerGaps: [],
      locationHistory: []
    };
  }

  // Calculate career progression by year
  const progressionMap = new Map<number, HistoryEntry[]>();
  entries.forEach(entry => {
    const year = new Date(entry.start_date).getFullYear();
    if (!progressionMap.has(year)) {
      progressionMap.set(year, []);
    }
    progressionMap.get(year)!.push(entry);
  });
  const careerProgression = Array.from(progressionMap.entries())
    .map(([year, yearEntries]) => ({
      year,
      entries: yearEntries
    }))
    .sort((a, b) => a.year - b.year);

  // Calculate skills evolution
  const skillsEvolutionMap = new Map<string, Array<{ year: number; count: number }>>();
  entries.forEach(entry => {
    const year = new Date(entry.start_date).getFullYear();
    entry.skills_gained.forEach(skill => {
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
      timeline: timeline.sort((a, b) => a.year - b.year)
    }))
    .filter(s => s.timeline.length > 1) // Only skills that evolved over time
    .slice(0, 10);

  // Calculate industry experience (based on organization)
  const industryMap = new Map<string, { duration: number; entries: number }>();
  entries.forEach(entry => {
    if (entry.organization) {
      const existing = industryMap.get(entry.organization) || { duration: 0, entries: 0 };
      const start = new Date(entry.start_date);
      const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      industryMap.set(entry.organization, {
        duration: existing.duration + duration,
        entries: existing.entries + 1
      });
    }
  });
  const industryExperience = Array.from(industryMap.entries())
    .map(([industry, { duration, entries }]) => ({
      industry,
      duration,
      entries
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  // Calculate education journey
  const educationEntries = entries.filter(e => e.entry_type === 'education');
  const educationMap = new Map<string, { institutions: string[]; completionYear?: number }>();
  educationEntries.forEach(entry => {
    if (entry.education_level) {
      const existing = educationMap.get(entry.education_level) || { institutions: [] };
      if (entry.organization && !existing.institutions.includes(entry.organization)) {
        existing.institutions.push(entry.organization);
      }
      if (entry.end_date) {
        existing.completionYear = new Date(entry.end_date).getFullYear();
      }
      educationMap.set(entry.education_level, existing);
    }
  });
  const educationJourney = Array.from(educationMap.entries()).map(([level, data]) => ({
    level: level as unknown,
    institutions: data.institutions,
    completionYear: data.completionYear
  }));

  // Calculate achievement timeline
  const achievementTimeline: Array<{ year: number; achievements: string[]; entryId: string }> = [];
  entries.forEach(entry => {
    if (entry.achievements.length > 0) {
      const year = new Date(entry.start_date).getFullYear();
      achievementTimeline.push({
        year,
        achievements: entry.achievements,
        entryId: entry.id
      });
    }
  });
  achievementTimeline.sort((a, b) => b.year - a.year);

  // Calculate career gaps
  const sortedEntries = [...entries].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const careerGaps: Array<{ startDate: string; endDate: string; duration: number }> = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevEntry = sortedEntries[i - 1];
    const currentEntry = sortedEntries[i];
    
    const prevEnd = prevEntry.end_date ? new Date(prevEntry.end_date) : new Date();
    const currentStart = new Date(currentEntry.start_date);
    
    const gapDays = Math.ceil((currentStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60 * 24));
    
    if (gapDays > 30) { // Only gaps longer than 30 days
      careerGaps.push({
        startDate: prevEnd.toISOString().split('T')[0],
        endDate: currentStart.toISOString().split('T')[0],
        duration: gapDays
      });
    }
  }

  // Calculate location history
  const locationMap = new Map<string, { duration: number; entries: number }>();
  entries.forEach(entry => {
    if (entry.location) {
      const existing = locationMap.get(entry.location) || { duration: 0, entries: 0 };
      const start = new Date(entry.start_date);
      const end = entry.is_current ? new Date() : entry.end_date ? new Date(entry.end_date) : new Date();
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      locationMap.set(entry.location, {
        duration: existing.duration + duration,
        entries: existing.entries + 1
      });
    }
  });
  const locationHistory = Array.from(locationMap.entries())
    .map(([location, { duration, entries }]) => ({
      location,
      duration,
      entries
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 10);

  return {
    careerProgression,
    skillsEvolution,
    industryExperience,
    educationJourney,
    achievementTimeline,
    careerGaps,
    locationHistory
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createHistoryEntry(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<HistoryEntry> {
  const validated = historyUpsertSchema.parse(data);

  const { data: entry, error } = await supabase
    .from('history_entries')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating history entry:', error);
    throw error;
  }

  return entry;
}

export async function updateHistoryEntry(
  supabase: SupabaseClient,
  entryId: string,
  data: unknown
): Promise<HistoryEntry> {
  const validated = historyUpsertSchema.parse(data);

  const { data: entry, error } = await supabase
    .from('history_entries')
    .update({
      ...validated,
      updated_at: new Date().toISOString()
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating history entry:', error);
    throw error;
  }

  return entry;
}

export async function deleteHistoryEntry(
  supabase: SupabaseClient,
  entryId: string
): Promise<void> {
  const { error } = await supabase
    .from('history_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error deleting history entry:', error);
    throw error;
  }
}

export async function toggleHistoryEntryCurrent(
  supabase: SupabaseClient,
  entryId: string,
  isCurrent: boolean
): Promise<HistoryEntry> {
  const updateData: unknown = {
    is_current: isCurrent,
    updated_at: new Date().toISOString()
  };

  // If setting to current, clear end_date
  if (isCurrent) {
    updateData.end_date = null;
  }

  const { data: entry, error } = await supabase
    .from('history_entries')
    .update(updateData)
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling history entry current status:', error);
    throw error;
  }

  return entry;
}

export async function updateHistoryEntryVisibility(
  supabase: SupabaseClient,
  entryId: string,
  visibility: string
): Promise<HistoryEntry> {
  const { data: entry, error } = await supabase
    .from('history_entries')
    .update({
      visibility,
      updated_at: new Date().toISOString()
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('Error updating history entry visibility:', error);
    throw error;
  }

  return entry;
}

// ============================================================================
// Export Functions
// ============================================================================

export { historyFilterSchema, historyUpsertSchema };
