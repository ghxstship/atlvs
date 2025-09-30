// Travel Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TravelRecord,
  TravelInfo,
  TravelFilters,
  TravelStats,
  TravelAnalytics,
} from '../types';
import {
  travelFilterSchema,
  travelRecordUpsertSchema,
  travelInfoUpsertSchema,
  filterTravelRecords,
  sortTravelRecords,
  calculateDuration,
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchTravelRecords(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: TravelFilters
): Promise<{ records: TravelRecord[]; total: number }> {
  let query = supabase
    .from('user_travel_records')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = travelFilterSchema.parse(filters);
    
    if (validatedFilters.travel_type && validatedFilters.travel_type !== 'all') {
      query = query.eq('travel_type', validatedFilters.travel_type);
    }
    
    if (validatedFilters.status && validatedFilters.status !== 'all') {
      query = query.eq('status', validatedFilters.status);
    }
    
    if (validatedFilters.country && validatedFilters.country !== 'all') {
      query = query.eq('country', validatedFilters.country);
    }
    
    if (validatedFilters.visa_required !== undefined) {
      query = query.eq('visa_required', validatedFilters.visa_required);
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('start_date', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('end_date', validatedFilters.date_to);
    }
    
    if (validatedFilters.expenses_min) {
      query = query.gte('expenses', validatedFilters.expenses_min);
    }
    
    if (validatedFilters.expenses_max) {
      query = query.lte('expenses', validatedFilters.expenses_max);
    }
    
    if (validatedFilters.duration_min) {
      query = query.gte('duration_days', validatedFilters.duration_min);
    }
    
    if (validatedFilters.duration_max) {
      query = query.lte('duration_days', validatedFilters.duration_max);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `destination.ilike.%${validatedFilters.search}%,` +
        `country.ilike.%${validatedFilters.search}%,` +
        `purpose.ilike.%${validatedFilters.search}%,` +
        `notes.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching travel records:', error);
    throw error;
  }

  return {
    records: data || [],
    total: count || 0,
  };
}

export async function fetchTravelRecordById(
  supabase: SupabaseClient,
  recordId: string
): Promise<TravelRecord | null> {
  const { data, error } = await supabase
    .from('user_travel_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (error) {
    console.error('Error fetching travel record:', error);
    throw error;
  }

  return data;
}

export async function fetchTravelInfo(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<TravelInfo | null> {
  const { data, error } = await supabase
    .from('user_travel_info')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching travel info:', error);
    throw error;
  }

  return data;
}

export async function fetchTravelStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<TravelStats> {
  const { data: records, error } = await supabase
    .from('user_travel_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching travel stats:', error);
    throw error;
  }

  if (!records || records.length === 0) {
    return {
      totalTrips: 0,
      completedTrips: 0,
      totalExpenses: 0,
      averageTripDuration: 0,
      byTravelType: [],
      byCountry: [],
      byStatus: [],
      monthlyTrends: [],
      topDestinations: [],
      visaRequirements: {
        required: 0,
        notRequired: 0,
        pending: 0,
        approved: 0,
        denied: 0,
      },
    };
  }

  // Calculate stats
  const totalTrips = records.length;
  const completedTrips = records.filter(r => r.status === 'completed').length;
  const totalExpenses = records.reduce((sum, r) => sum + (r.expenses || 0), 0);
  const averageTripDuration = records.reduce((sum, r) => sum + r.duration_days, 0) / totalTrips;

  // Group by travel type
  const travelTypeMap = new Map<string, { count: number; totalExpenses: number; totalDuration: number }>();
  records.forEach(r => {
    const type = r.travel_type;
    const existing = travelTypeMap.get(type) || { count: 0, totalExpenses: 0, totalDuration: 0 };
    travelTypeMap.set(type, {
      count: existing.count + 1,
      totalExpenses: existing.totalExpenses + (r.expenses || 0),
      totalDuration: existing.totalDuration + r.duration_days,
    });
  });
  const byTravelType = Array.from(travelTypeMap.entries()).map(([type, data]) => ({
    type: type as unknown,
    count: data.count,
    totalExpenses: data.totalExpenses,
    averageDuration: data.totalDuration / data.count,
  }));

  // Group by country
  const countryMap = new Map<string, { count: number; totalExpenses: number }>();
  records.forEach(r => {
    const country = r.country;
    const existing = countryMap.get(country) || { count: 0, totalExpenses: 0 };
    countryMap.set(country, {
      count: existing.count + 1,
      totalExpenses: existing.totalExpenses + (r.expenses || 0),
    });
  });
  const byCountry = Array.from(countryMap.entries()).map(([country, data]) => ({
    country,
    count: data.count,
    totalExpenses: data.totalExpenses,
  }));

  // Group by status
  const statusMap = new Map<string, number>();
  records.forEach(r => {
    statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
  });
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status as unknown,
    count,
  }));

  // Monthly trends (last 12 months)
  const monthlyTrends = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = date.toISOString().split('T')[0];
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const monthRecords = records.filter(r => {
      return r.start_date >= monthStart && r.start_date <= monthEnd;
    });
    
    monthlyTrends.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      trips: monthRecords.length,
      expenses: monthRecords.reduce((sum, r) => sum + (r.expenses || 0), 0),
    });
  }

  // Top destinations
  const destinationMap = new Map<string, { country: string; count: number; totalExpenses: number }>();
  records.forEach(r => {
    const key = `${r.destination}, ${r.country}`;
    const existing = destinationMap.get(key) || { country: r.country, count: 0, totalExpenses: 0 };
    destinationMap.set(key, {
      country: r.country,
      count: existing.count + 1,
      totalExpenses: existing.totalExpenses + (r.expenses || 0),
    });
  });
  const topDestinations = Array.from(destinationMap.entries())
    .map(([destination, data]) => ({
      destination: destination.split(', ')[0],
      country: data.country,
      count: data.count,
      totalExpenses: data.totalExpenses,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Visa requirements
  const visaRequirements = {
    required: records.filter(r => r.visa_required).length,
    notRequired: records.filter(r => !r.visa_required).length,
    pending: records.filter(r => r.visa_status === 'pending').length,
    approved: records.filter(r => r.visa_status === 'approved').length,
    denied: records.filter(r => r.visa_status === 'denied').length,
  };

  return {
    totalTrips,
    completedTrips,
    totalExpenses,
    averageTripDuration: Math.round(averageTripDuration * 10) / 10,
    byTravelType,
    byCountry,
    byStatus,
    monthlyTrends,
    topDestinations,
    visaRequirements,
  };
}

export async function fetchTravelAnalytics(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<TravelAnalytics> {
  const { data: records, error } = await supabase
    .from('user_travel_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching travel analytics:', error);
    throw error;
  }

  if (!records || records.length === 0) {
    return {
      travelTrends: [],
      destinationAnalytics: [],
      expenseAnalysis: [],
      visaAnalytics: [],
      seasonalPatterns: [],
      complianceMetrics: {
        visaCompliance: 0,
        documentationComplete: 0,
        expenseReporting: 0,
      },
    };
  }

  // Calculate travel trends by year
  const trendMap = new Map<string, { total: number; business: number; personal: number; expenses: number }>();
  records.forEach(record => {
    const year = new Date(record.start_date).getFullYear().toString();
    const existing = trendMap.get(year) || { total: 0, business: 0, personal: 0, expenses: 0 };
    existing.total += 1;
    if (record.travel_type === 'business') existing.business += 1;
    if (record.travel_type === 'personal') existing.personal += 1;
    existing.expenses += record.expenses || 0;
    trendMap.set(year, existing);
  });
  
  const travelTrends = Array.from(trendMap.entries())
    .map(([period, data]) => ({
      period,
      totalTrips: data.total,
      businessTrips: data.business,
      personalTrips: data.personal,
      totalExpenses: data.expenses,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  // Calculate destination analytics
  const destMap = new Map<string, { country: string; visits: TravelRecord[] }>();
  records.forEach(record => {
    const key = `${record.destination}, ${record.country}`;
    const existing = destMap.get(key) || { country: record.country, visits: [] };
    existing.visits.push(record);
    destMap.set(key, existing);
  });
  
  const destinationAnalytics = Array.from(destMap.entries())
    .map(([destination, data]) => ({
      destination: destination.split(', ')[0],
      country: data.country,
      frequency: data.visits.length,
      averageStay: data.visits.reduce((sum, v) => sum + v.duration_days, 0) / data.visits.length,
      totalExpenses: data.visits.reduce((sum, v) => sum + (v.expenses || 0), 0),
      lastVisit: data.visits[data.visits.length - 1].start_date,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 15);

  // Calculate expense analysis
  const totalExpenses = records.reduce((sum, r) => sum + (r.expenses || 0), 0);
  const expenseByType = new Map<string, number>();
  records.forEach(r => {
    const type = r.travel_type;
    expenseByType.set(type, (expenseByType.get(type) || 0) + (r.expenses || 0));
  });
  
  const expenseAnalysis = Array.from(expenseByType.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    trend: 0, // Would need historical data
  }));

  // Calculate visa analytics
  const visaMap = new Map<string, { total: number; required: number; approved: number; processingTimes: number[] }>();
  records.forEach(record => {
    const country = record.country;
    const existing = visaMap.get(country) || { total: 0, required: 0, approved: 0, processingTimes: [] };
    existing.total += 1;
    if (record.visa_required) {
      existing.required += 1;
      if (record.visa_status === 'approved') {
        existing.approved += 1;
      }
    }
    visaMap.set(country, existing);
  });
  
  const visaAnalytics = Array.from(visaMap.entries()).map(([country, data]) => ({
    country,
    visaRequired: data.required > 0,
    approvalRate: data.required > 0 ? (data.approved / data.required) * 100 : 100,
    averageProcessingTime: 0, // Would need processing time data
  }));

  // Calculate seasonal patterns
  const seasonalMap = new Map<string, { business: number; personal: number; expenses: number }>();
  records.forEach(record => {
    const month = new Date(record.start_date).toLocaleDateString('en-US', { month: 'long' });
    const existing = seasonalMap.get(month) || { business: 0, personal: 0, expenses: 0 };
    if (record.travel_type === 'business') existing.business += 1;
    if (record.travel_type === 'personal') existing.personal += 1;
    existing.expenses += record.expenses || 0;
    seasonalMap.set(month, existing);
  });
  
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const seasonalPatterns = monthOrder.map(month => {
    const data = seasonalMap.get(month) || { business: 0, personal: 0, expenses: 0 };
    return {
      month,
      businessTrips: data.business,
      personalTrips: data.personal,
      averageExpenses: data.business + data.personal > 0 ? data.expenses / (data.business + data.personal) : 0,
    };
  });

  // Calculate compliance metrics
  const visaCompliance = records.filter(r => !r.visa_required || r.visa_status === 'approved').length / records.length * 100;
  const documentationComplete = records.filter(r => r.passport_used && r.booking_reference).length / records.length * 100;
  const expenseReporting = records.filter(r => r.expenses !== null && r.expenses > 0).length / records.length * 100;

  return {
    travelTrends,
    destinationAnalytics,
    expenseAnalysis,
    visaAnalytics,
    seasonalPatterns,
    complianceMetrics: {
      visaCompliance: Math.round(visaCompliance),
      documentationComplete: Math.round(documentationComplete),
      expenseReporting: Math.round(expenseReporting),
    },
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createTravelRecord(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<TravelRecord> {
  const validated = travelRecordUpsertSchema.parse(data);

  // Calculate duration
  const duration = calculateDuration(validated.start_date, validated.end_date);

  const { data: record, error } = await supabase
    .from('user_travel_records')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      ...validated,
      duration_days: duration,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating travel record:', error);
    throw error;
  }

  return record;
}

export async function updateTravelRecord(
  supabase: SupabaseClient,
  recordId: string,
  data: unknown
): Promise<TravelRecord> {
  const validated = travelRecordUpsertSchema.parse(data);

  // Calculate duration
  const duration = calculateDuration(validated.start_date, validated.end_date);

  const { data: record, error } = await supabase
    .from('user_travel_records')
    .update({
      ...validated,
      duration_days: duration,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating travel record:', error);
    throw error;
  }

  return record;
}

export async function deleteTravelRecord(
  supabase: SupabaseClient,
  recordId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_travel_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting travel record:', error);
    throw error;
  }
}

export async function updateTravelStatus(
  supabase: SupabaseClient,
  recordId: string,
  status: string
): Promise<TravelRecord> {
  const { data: record, error } = await supabase
    .from('user_travel_records')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating travel status:', error);
    throw error;
  }

  return record;
}

export async function createOrUpdateTravelInfo(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<TravelInfo> {
  const validated = travelInfoUpsertSchema.parse(data);

  const { data: info, error } = await supabase
    .from('user_travel_info')
    .upsert({
      user_id: userId,
      organization_id: organizationId,
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating travel info:', error);
    throw error;
  }

  return info;
}

// ============================================================================
// Helper Functions
// ============================================================================

export async function fetchCountries(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<string[]> {
  const { data: records, error } = await supabase
    .from('user_travel_records')
    .select('country')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  const countries = [...new Set(records.map(r => r.country).filter(Boolean))];
  return countries.sort();
}

export async function fetchDestinations(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<Array<{ destination: string; country: string }>> {
  const { data: records, error } = await supabase
    .from('user_travel_records')
    .select('destination, country')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }

  const destinations = records.map(r => ({
    destination: r.destination,
    country: r.country,
  }));

  // Remove duplicates
  const unique = destinations.filter((dest, index, self) => 
    index === self.findIndex(d => d.destination === dest.destination && d.country === dest.country)
  );

  return unique.sort((a, b) => a.destination.localeCompare(b.destination));
}

// ============================================================================
// Export Functions
// ============================================================================

export { travelFilterSchema, travelRecordUpsertSchema, travelInfoUpsertSchema };
