// Health Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  HealthRecord,
  HealthFilters,
  HealthStats,
  HealthAnalytics,
} from '../types';
import {
  healthFilterSchema,
  healthUpsertSchema,
  filterHealthRecords,
  sortHealthRecords,
  getDaysUntilExpiry,
  getExpiryUrgency,
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchHealthRecords(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: HealthFilters
): Promise<{ records: HealthRecord[]; total: number }> {
  let query = supabase
    .from('health_records')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('date_recorded', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = healthFilterSchema.parse(filters);
    
    if (validatedFilters.record_type && validatedFilters.record_type !== 'all') {
      query = query.eq('record_type', validatedFilters.record_type);
    }
    
    if (validatedFilters.severity && validatedFilters.severity !== 'all') {
      query = query.eq('severity', validatedFilters.severity);
    }
    
    if (validatedFilters.category && validatedFilters.category !== 'all') {
      query = query.eq('category', validatedFilters.category);
    }
    
    if (validatedFilters.privacy_level && validatedFilters.privacy_level !== 'all') {
      query = query.eq('privacy_level', validatedFilters.privacy_level);
    }
    
    if (validatedFilters.is_active && validatedFilters.is_active !== 'all') {
      query = query.eq('is_active', validatedFilters.is_active === 'active');
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('date_recorded', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('date_recorded', validatedFilters.date_to);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `title.ilike.%${validatedFilters.search}%,` +
        `description.ilike.%${validatedFilters.search}%,` +
        `provider.ilike.%${validatedFilters.search}%,` +
        `notes.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching health records:', error);
    throw error;
  }

  return {
    records: data || [],
    total: count || 0,
  };
}

export async function fetchHealthRecordById(
  supabase: SupabaseClient,
  recordId: string
): Promise<HealthRecord | null> {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('id', recordId)
    .single();

  if (error) {
    console.error('Error fetching health record:', error);
    throw error;
  }

  return data;
}

export async function fetchHealthStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<HealthStats> {
  const { data: records, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching health stats:', error);
    throw error;
  }

  if (!records || records.length === 0) {
    return {
      totalRecords: 0,
      activeRecords: 0,
      expiringRecords: 0,
      criticalRecords: 0,
      byType: [],
      bySeverity: [],
      byCategory: [],
      upcomingReminders: [],
    };
  }

  // Calculate stats
  const totalRecords = records.length;
  const activeRecords = records.filter(r => r.is_active).length;
  const criticalRecords = records.filter(r => r.severity === 'critical').length;
  
  // Calculate expiring records
  const expiringRecords = records.filter(r => {
    if (!r.expiry_date) return false;
    const daysUntil = getDaysUntilExpiry(r.expiry_date);
    return daysUntil <= 30 && daysUntil >= 0;
  }).length;

  // Group by type
  const typeMap = new Map<string, number>();
  records.forEach(r => {
    typeMap.set(r.record_type, (typeMap.get(r.record_type) || 0) + 1);
  });
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type: type as unknown,
    count,
  }));

  // Group by severity
  const severityMap = new Map<string, number>();
  records.forEach(r => {
    if (r.severity) {
      severityMap.set(r.severity, (severityMap.get(r.severity) || 0) + 1);
    }
  });
  const bySeverity = Array.from(severityMap.entries()).map(([severity, count]) => ({
    severity: severity as unknown,
    count,
  }));

  // Group by category
  const categoryMap = new Map<string, number>();
  records.forEach(r => {
    if (r.category) {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
    }
  });
  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category: category as unknown,
    count,
  }));

  // Upcoming reminders
  const upcomingReminders = records
    .filter(r => r.expiry_date && r.reminder_enabled)
    .map(r => ({
      record: r,
      daysUntilExpiry: getDaysUntilExpiry(r.expiry_date!),
    }))
    .filter(r => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= (r.record.reminder_days_before || 30))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 10);

  return {
    totalRecords,
    activeRecords,
    expiringRecords,
    criticalRecords,
    byType,
    bySeverity,
    byCategory,
    upcomingReminders,
  };
}

export async function fetchHealthAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<HealthAnalytics> {
  // Fetch all health records for the organization
  const { data: records, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_recorded', { ascending: false });

  if (error) {
    console.error('Error fetching health analytics:', error);
    throw error;
  }

  if (!records || records.length === 0) {
    return {
      recordTrends: [],
      expiryAlerts: [],
      providerDistribution: [],
      categoryBreakdown: [],
      tagCloud: [],
      healthScore: 0,
      completenessScore: 0,
      recentActivity: [],
    };
  }

  // Calculate trends by month
  const trendMap = new Map<string, { count: number; byType: Record<string, number> }>();
  records.forEach(r => {
    const month = new Date(r.date_recorded).toISOString().slice(0, 7);
    const existing = trendMap.get(month) || { count: 0, byType: {} };
    existing.count += 1;
    existing.byType[r.record_type] = (existing.byType[r.record_type] || 0) + 1;
    trendMap.set(month, existing);
  });
  const recordTrends = Array.from(trendMap.entries())
    .map(([month, data]) => ({
      month,
      count: data.count,
      byType: data.byType as unknown,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  // Calculate expiry alerts
  const expiryAlerts = records
    .filter(r => r.expiry_date)
    .map(r => ({
      record: r,
      daysUntilExpiry: getDaysUntilExpiry(r.expiry_date!),
      urgency: getExpiryUrgency(getDaysUntilExpiry(r.expiry_date!)),
    }))
    .filter(r => r.daysUntilExpiry <= 90)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  // Calculate provider distribution
  const providerMap = new Map<string, number>();
  records.forEach(r => {
    if (r.provider) {
      providerMap.set(r.provider, (providerMap.get(r.provider) || 0) + 1);
    }
  });
  const providerDistribution = Array.from(providerMap.entries())
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate category breakdown
  const categoryMap = new Map<string, number>();
  records.forEach(r => {
    if (r.category) {
      categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
    }
  });
  const total = records.length;
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category: category as unknown,
    percentage: Math.round((count / total) * 100),
  }));

  // Calculate tag cloud
  const tagMap = new Map<string, number>();
  records.forEach(r => {
    r.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  const maxFrequency = Math.max(...Array.from(tagMap.values()), 1);
  const tagCloud = Array.from(tagMap.entries())
    .map(([tag, frequency]) => ({
      tag,
      frequency,
      weight: Math.round((frequency / maxFrequency) * 100),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  // Calculate health score (based on completeness and recency)
  const activeRecords = records.filter(r => r.is_active).length;
  const recentRecords = records.filter(r => {
    const monthsAgo = (Date.now() - new Date(r.date_recorded).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo <= 12;
  }).length;
  const healthScore = Math.min(100, Math.round((activeRecords * 0.6 + recentRecords * 0.4) / records.length * 100));

  // Calculate completeness score
  const completeFields = records.reduce((sum, r) => {
    let fieldCount = 0;
    if (r.title) fieldCount++;
    if (r.description) fieldCount++;
    if (r.provider) fieldCount++;
    if (r.date_recorded) fieldCount++;
    if (r.category) fieldCount++;
    if (r.tags.length > 0) fieldCount++;
    return sum + fieldCount;
  }, 0);
  const maxFields = records.length * 6; // 6 key fields
  const completenessScore = maxFields > 0 ? Math.round((completeFields / maxFields) * 100) : 0;

  // Get recent activity
  const recentActivity = records.slice(0, 10);

  return {
    recordTrends,
    expiryAlerts,
    providerDistribution,
    categoryBreakdown,
    tagCloud,
    healthScore,
    completenessScore,
    recentActivity,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createHealthRecord(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<HealthRecord> {
  const validated = healthUpsertSchema.parse(data);

  const { data: record, error } = await supabase
    .from('health_records')
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
    console.error('Error creating health record:', error);
    throw error;
  }

  return record;
}

export async function updateHealthRecord(
  supabase: SupabaseClient,
  recordId: string,
  data: unknown
): Promise<HealthRecord> {
  const validated = healthUpsertSchema.parse(data);

  const { data: record, error } = await supabase
    .from('health_records')
    .update({
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating health record:', error);
    throw error;
  }

  return record;
}

export async function deleteHealthRecord(
  supabase: SupabaseClient,
  recordId: string
): Promise<void> {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    console.error('Error deleting health record:', error);
    throw error;
  }
}

export async function toggleHealthRecordActive(
  supabase: SupabaseClient,
  recordId: string,
  isActive: boolean
): Promise<HealthRecord> {
  const { data: record, error } = await supabase
    .from('health_records')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling health record active status:', error);
    throw error;
  }

  return record;
}

export async function updateHealthRecordReminder(
  supabase: SupabaseClient,
  recordId: string,
  reminderEnabled: boolean,
  reminderDaysBefore?: number
): Promise<HealthRecord> {
  const { data: record, error } = await supabase
    .from('health_records')
    .update({
      reminder_enabled: reminderEnabled,
      reminder_days_before: reminderDaysBefore || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    console.error('Error updating health record reminder:', error);
    throw error;
  }

  return record;
}

// ============================================================================
// Export Functions
// ============================================================================

export { healthFilterSchema, healthUpsertSchema };
