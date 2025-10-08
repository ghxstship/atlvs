import { z as zod } from 'zod';
import type {
  EmergencyContact,
  EmergencyContactFilters,
  EmergencyContactStats,
  EmergencyContactAnalytics,
  EmergencyPriority,
  EmergencyAvailability,
  EmergencyContactFormData
} from '../types';
import {
  createEmptyStats,
  createEmptyAnalytics
} from '../types';

export const emergencyFilterSchema = zod.object({
  search: zod.string().optional(),
  priority: zod.enum(['all', 'critical', 'high', 'medium', 'low']).optional(),
  verification_status: zod.enum(['all', 'verified', 'pending', 'unverified']).optional(),
  is_primary: zod.enum(['all', 'primary', 'backup']).optional(),
  availability: zod.enum(['all', '24_7', 'business_hours', 'night_only', 'weekends', 'on_call']).optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0)
});

export const emergencyUpsertSchema = zod.object({
  name: zod.string().min(1),
  relationship: zod.string().min(1),
  phone_primary: zod.string().min(1),
  phone_secondary: zod.string().optional().nullable(),
  email: zod.string().email().optional().nullable(),
  address: zod.string().optional().nullable(),
  city: zod.string().optional().nullable(),
  state_province: zod.string().optional().nullable(),
  country: zod.string().optional().nullable(),
  postal_code: zod.string().optional().nullable(),
  notes: zod.string().max(1000).optional().nullable(),
  is_primary: zod.boolean().default(false),
  is_backup: zod.boolean().default(false),
  priority_level: zod.enum(['critical', 'high', 'medium', 'low']),
  availability: zod.enum(['24_7', 'business_hours', 'night_only', 'weekends', 'on_call']).optional().nullable(),
  response_time_minutes: zod.number().min(0).max(1440).optional().nullable(),
  verification_status: zod.enum(['verified', 'pending', 'unverified']).default('pending')
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export async function fetchEmergencyContacts(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof emergencyFilterSchema>
): Promise<{ contacts: EmergencyContact[]; total: number }> {
  let query = supabase
    .from('emergency_contacts')
    .select('*', { count: 'exact' })
    .eq('organization_id', orgId);

  if (filters.search) {
    const search = filters.search.trim();
    query = query.or(`
      name.ilike.%${search}%,
      relationship.ilike.%${search}%,
      phone_primary.ilike.%${search}%,
      phone_secondary.ilike.%${search}%,
      email.ilike.%${search}%
    `);
  }

  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority_level', filters.priority);
  }

  if (filters.verification_status && filters.verification_status !== 'all') {
    query = query.eq('verification_status', filters.verification_status);
  }

  if (filters.is_primary && filters.is_primary !== 'all') {
    query = query.eq('is_primary', filters.is_primary === 'primary');
  }

  if (filters.is_primary === 'backup') {
    query = query.eq('is_backup', true);
  }

  if (filters.availability && filters.availability !== 'all') {
    query = query.eq('availability', filters.availability);
  }

  const { data, error, count } = await query
    .order('priority_level', { ascending: true })
    .order('is_primary', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(filters.offset, filters.offset + filters.limit - 1);

  if (error) {
    throw error;
  }

  return {
    contacts: data ?? [],
    total: count ?? 0
  };
}

export async function fetchEmergencyContactById(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  contactId: string
): Promise<EmergencyContact | null> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .eq('id', contactId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function createEmergencyContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  payload: zod.infer<typeof emergencyUpsertSchema>
): Promise<EmergencyContact> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      ...payload,
      user_id: userId,
      organization_id: orgId
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logEmergencyActivity(supabase, orgId, userId, 'created', data.id, payload);
  return data as EmergencyContact;
}

export async function updateEmergencyContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  contactId: string,
  payload: zod.infer<typeof emergencyUpsertSchema>
): Promise<EmergencyContact> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update({
      ...payload,
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logEmergencyActivity(supabase, orgId, userId, 'updated', contactId, payload);
  return data as EmergencyContact;
}

export async function deleteEmergencyContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  contactId: string
): Promise<void> {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId)
    .eq('organization_id', orgId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  await logEmergencyActivity(supabase, orgId, userId, 'deleted', contactId, null);
}

export async function verifyEmergencyContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  contactId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('emergency_contacts')
    .update({
      verification_status: 'verified',
      last_verified: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', contactId)
    .eq('organization_id', orgId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  await logEmergencyActivity(supabase, orgId, userId, 'verified', contactId, null);
  return true;
}

export async function fetchEmergencyStats(
  supabase: SupabaseClient,
  orgId: string
): Promise<EmergencyContactStats> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('organization_id', orgId);

  if (error) {
    console.error('Error fetching emergency stats:', error);
    return createEmptyStats();
  }

  if (!data) {
    return createEmptyStats();
  }

  const totalContacts = data.length;
  const primaryContacts = data.filter(contact => contact.is_primary).length;
  const backupContacts = data.filter(contact => contact.is_backup).length;
  const verifiedContacts = data.filter(contact => contact.verification_status === 'verified').length;

  const priorityLevels: EmergencyPriority[] = ['critical', 'high', 'medium', 'low'];
  const byPriority = priorityLevels.map(priority => {
    const count = data.filter(contact => contact.priority_level === priority).length;
    return {
      priority,
      count,
      percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0
    };
  });

  const responseBuckets = [
    { bucket: '<15 min', range: [0, 14] },
    { bucket: '15-30 min', range: [15, 30] },
    { bucket: '30-60 min', range: [31, 60] },
    { bucket: '60-120 min', range: [61, 120] },
    { bucket: '120+ min', range: [121, Infinity] },
  ];

  const responseTimeDistribution = responseBuckets.map(({ bucket, range }) => ({
    bucket,
    count: data.filter(contact => {
      if (!contact.response_time_minutes) return false;
      const value = contact.response_time_minutes;
      return value >= range[0] && value <= range[1];
    }).length
  }));

  const availabilities: EmergencyAvailability[] = ['24_7', 'business_hours', 'night_only', 'weekends', 'on_call'];
  const availabilityBreakdown = availabilities.map(availability => {
    const count = data.filter(contact => contact.availability === availability).length;
    return {
      availability,
      count,
      percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0
    };
  });

  return {
    totalContacts,
    primaryContacts,
    backupContacts,
    verifiedContacts,
    byPriority,
    responseTimeDistribution,
    availabilityBreakdown
  };
}

export async function fetchEmergencyAnalytics(
  supabase: SupabaseClient,
  orgId: string
): Promise<EmergencyContactAnalytics> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('organization_id', orgId);

  if (error) {
    console.error('Error fetching emergency analytics:', error);
    return createEmptyAnalytics();
  }

  if (!data || data.length === 0) {
    return createEmptyAnalytics();
  }

  const readinessScore = calculateReadinessScore(data);
  const verificationRate = Math.round(
    (data.filter(contact => contact.verification_status === 'verified').length / data.length) * 100,
  );
  const primaryCoverage = Math.round(
    (data.filter(contact => contact.is_primary).length / data.length) * 100,
  );
  const averageResponseTime = calculateAverageResponseTime(data);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentUpdates = data
    .filter(contact => contact.updated_at)
    .map(contact => ({
      date: contact.updated_at.split('T')[0],
      updates: 1,
      verifications: contact.last_verified ? 1 : 0
    }))
    .reduce<Record<string, { updates: number; verifications: number }>((acc, current) => {
      if (!acc[current.date]) {
        acc[current.date] = { updates: 0, verifications: 0 };
      }
      acc[current.date].updates += current.updates;
      acc[current.date].verifications += current.verifications;
      return acc;
    }, {});

  const recentUpdatesArray = Object.entries(recentUpdates)
    .filter(([date]) => new Date(date) >= thirtyDaysAgo)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, values]) => ({ date, ...values }));

  const priorityLevels: EmergencyPriority[] = ['critical', 'high', 'medium', 'low'];
  const priorityTrends = priorityLevels.map(priority => ({
    priority,
    count: data.filter(contact => contact.priority_level === priority).length
  }));

  return {
    readinessScore,
    verificationRate,
    primaryCoverage,
    averageResponseTime,
    recentUpdates: recentUpdatesArray,
    priorityTrends
  };
}

function calculateReadinessScore(contacts: EmergencyContact[]): number {
  let score = 0;
  const totalContacts = contacts.length;

  const primaryWeight = 0.3;
  const verificationWeight = 0.3;
  const priorityWeight = 0.2;
  const responseTimeWeight = 0.2;

  const primaryCoverage = contacts.filter(contact => contact.is_primary).length / totalContacts;
  score += primaryCoverage * primaryWeight;

  const verificationRate = contacts.filter(contact => contact.verification_status === 'verified').length / totalContacts;
  score += verificationRate * verificationWeight;

  const criticalContacts = contacts.filter(contact => contact.priority_level === 'critical').length;
  const highContacts = contacts.filter(contact => contact.priority_level === 'high').length;
  const priorityScore = (criticalContacts * 2 + highContacts) / (totalContacts * 2);
  score += priorityScore * priorityWeight;

  const averageResponseTime = calculateAverageResponseTime(contacts);
  const responseTimeScore = Math.max(0, 1 - averageResponseTime / 120);
  score += responseTimeScore * responseTimeWeight;

  return Math.round(score * 100);
}

function calculateAverageResponseTime(contacts: EmergencyContact[]): number {
  const validResponseTimes = contacts
    .map(contact => contact.response_time_minutes)
    .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

  if (validResponseTimes.length === 0) {
    return 0;
  }

  const sum = validResponseTimes.reduce((acc, current) => acc + current, 0);
  return Math.round(sum / validResponseTimes.length);
}

async function logEmergencyActivity(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  activityType: 'created' | 'updated' | 'deleted' | 'verified',
  contactId: string,
  payload: unknown,
): Promise<void> {
  await supabase
    .from('user_profile_activity')
    .insert({
      organization_id: orgId,
      user_id: userId,
      activity_type: `emergency_${activityType}`,
      activity_description: `Emergency contact ${activityType}`,
      metadata: {
        contact_id: contactId,
        payload
      }
    });
}
