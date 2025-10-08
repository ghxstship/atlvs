// Endorsement Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Endorsement,
  EndorsementFilters,
  EndorsementStats,
  EndorsementAnalytics
} from '../types';
import {
  endorsementFilterSchema,
  endorsementUpsertSchema,
  filterEndorsements,
  sortEndorsements
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchEndorsements(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: EndorsementFilters
): Promise<{ endorsements: Endorsement[]; total: number }> {
  let query = supabase
    .from('endorsements')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('date_received', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = endorsementFilterSchema.parse(filters);
    
    if (validatedFilters.relationship && validatedFilters.relationship !== 'all') {
      query = query.eq('relationship', validatedFilters.relationship);
    }
    
    if (validatedFilters.rating && validatedFilters.rating !== 'all') {
      query = query.eq('rating', validatedFilters.rating);
    }
    
    if (validatedFilters.verification_status && validatedFilters.verification_status !== 'all') {
      query = query.eq('verification_status', validatedFilters.verification_status);
    }
    
    if (validatedFilters.is_public && validatedFilters.is_public !== 'all') {
      query = query.eq('is_public', validatedFilters.is_public === 'public');
    }
    
    if (validatedFilters.is_featured && validatedFilters.is_featured !== 'all') {
      query = query.eq('is_featured', validatedFilters.is_featured === 'featured');
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('date_received', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('date_received', validatedFilters.date_to);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `endorser_name.ilike.%${validatedFilters.search}%,` +
        `endorsement_text.ilike.%${validatedFilters.search}%,` +
        `endorser_company.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching endorsements:', error);
    throw error;
  }

  return {
    endorsements: data || [],
    total: count || 0
  };
}

export async function fetchEndorsementById(
  supabase: SupabaseClient,
  endorsementId: string
): Promise<Endorsement | null> {
  const { data, error } = await supabase
    .from('endorsements')
    .select('*')
    .eq('id', endorsementId)
    .single();

  if (error) {
    console.error('Error fetching endorsement:', error);
    throw error;
  }

  return data;
}

export async function fetchEndorsementStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<EndorsementStats> {
  const { data: endorsements, error } = await supabase
    .from('endorsements')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching endorsement stats:', error);
    throw error;
  }

  if (!endorsements || endorsements.length === 0) {
    return {
      totalEndorsements: 0,
      averageRating: 0,
      verifiedCount: 0,
      publicCount: 0,
      featuredCount: 0,
      byRelationship: [],
      byRating: [],
      topSkills: []
    };
  }

  // Calculate stats
  const totalEndorsements = endorsements.length;
  const averageRating = endorsements.reduce((sum, e) => sum + e.rating, 0) / totalEndorsements;
  const verifiedCount = endorsements.filter(e => e.verification_status === 'verified').length;
  const publicCount = endorsements.filter(e => e.is_public).length;
  const featuredCount = endorsements.filter(e => e.is_featured).length;

  // Group by relationship
  const relationshipMap = new Map<string, number>();
  endorsements.forEach(e => {
    relationshipMap.set(e.relationship, (relationshipMap.get(e.relationship) || 0) + 1);
  });
  const byRelationship = Array.from(relationshipMap.entries()).map(([relationship, count]) => ({
    relationship: relationship as unknown,
    count
  }));

  // Group by rating
  const ratingMap = new Map<number, number>();
  endorsements.forEach(e => {
    ratingMap.set(e.rating, (ratingMap.get(e.rating) || 0) + 1);
  });
  const byRating = Array.from(ratingMap.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => b.rating - a.rating);

  // Top skills
  const skillMap = new Map<string, number>();
  endorsements.forEach(e => {
    e.skills_endorsed.forEach(skill => {
      skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
    });
  });
  const topSkills = Array.from(skillMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEndorsements,
    averageRating: Math.round(averageRating * 10) / 10,
    verifiedCount,
    publicCount,
    featuredCount,
    byRelationship,
    byRating,
    topSkills
  };
}

export async function fetchEndorsementAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<EndorsementAnalytics> {
  // Fetch all endorsements for the organization
  const { data: endorsements, error } = await supabase
    .from('endorsements')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_received', { ascending: false });

  if (error) {
    console.error('Error fetching endorsement analytics:', error);
    throw error;
  }

  if (!endorsements || endorsements.length === 0) {
    return {
      endorsementTrends: [],
      relationshipDistribution: [],
      skillCloud: [],
      verificationRate: 0,
      publicRate: 0,
      recentEndorsements: []
    };
  }

  // Calculate trends by month
  const trendMap = new Map<string, { count: number; totalRating: number }>();
  endorsements.forEach(e => {
    const month = new Date(e.date_received).toISOString().slice(0, 7);
    const existing = trendMap.get(month) || { count: 0, totalRating: 0 };
    trendMap.set(month, {
      count: existing.count + 1,
      totalRating: existing.totalRating + e.rating
    });
  });
  const endorsementTrends = Array.from(trendMap.entries())
    .map(([month, data]) => ({
      month,
      count: data.count,
      averageRating: Math.round((data.totalRating / data.count) * 10) / 10
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months

  // Calculate relationship distribution
  const relationshipMap = new Map<string, number>();
  endorsements.forEach(e => {
    relationshipMap.set(e.relationship, (relationshipMap.get(e.relationship) || 0) + 1);
  });
  const total = endorsements.length;
  const relationshipDistribution = Array.from(relationshipMap.entries()).map(([relationship, count]) => ({
    relationship: relationship as unknown,
    percentage: Math.round((count / total) * 100)
  }));

  // Calculate skill cloud
  const skillMap = new Map<string, number>();
  endorsements.forEach(e => {
    e.skills_endorsed.forEach(skill => {
      skillMap.set(skill, (skillMap.get(skill) || 0) + 1);
    });
  });
  const maxFrequency = Math.max(...Array.from(skillMap.values()));
  const skillCloud = Array.from(skillMap.entries())
    .map(([skill, frequency]) => ({
      skill,
      frequency,
      weight: Math.round((frequency / maxFrequency) * 100)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 30);

  // Calculate rates
  const verifiedCount = endorsements.filter(e => e.verification_status === 'verified').length;
  const publicCount = endorsements.filter(e => e.is_public).length;
  const verificationRate = Math.round((verifiedCount / total) * 100);
  const publicRate = Math.round((publicCount / total) * 100);

  // Get recent endorsements
  const recentEndorsements = endorsements.slice(0, 5);

  return {
    endorsementTrends,
    relationshipDistribution,
    skillCloud,
    verificationRate,
    publicRate,
    recentEndorsements
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createEndorsement(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<Endorsement> {
  const validated = endorsementUpsertSchema.parse(data);

  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      ...validated,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating endorsement:', error);
    throw error;
  }

  return endorsement;
}

export async function updateEndorsement(
  supabase: SupabaseClient,
  endorsementId: string,
  data: unknown
): Promise<Endorsement> {
  const validated = endorsementUpsertSchema.parse(data);

  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .update({
      ...validated,
      updated_at: new Date().toISOString()
    })
    .eq('id', endorsementId)
    .select()
    .single();

  if (error) {
    console.error('Error updating endorsement:', error);
    throw error;
  }

  return endorsement;
}

export async function deleteEndorsement(
  supabase: SupabaseClient,
  endorsementId: string
): Promise<void> {
  const { error } = await supabase
    .from('endorsements')
    .delete()
    .eq('id', endorsementId);

  if (error) {
    console.error('Error deleting endorsement:', error);
    throw error;
  }
}

export async function verifyEndorsement(
  supabase: SupabaseClient,
  endorsementId: string,
  verifiedBy: string
): Promise<Endorsement> {
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .update({
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', endorsementId)
    .select()
    .single();

  if (error) {
    console.error('Error verifying endorsement:', error);
    throw error;
  }

  return endorsement;
}

export async function rejectEndorsement(
  supabase: SupabaseClient,
  endorsementId: string,
  rejectedBy: string
): Promise<Endorsement> {
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .update({
      verification_status: 'rejected',
      verified_at: new Date().toISOString(),
      verified_by: rejectedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', endorsementId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting endorsement:', error);
    throw error;
  }

  return endorsement;
}

export async function toggleEndorsementFeatured(
  supabase: SupabaseClient,
  endorsementId: string,
  isFeatured: boolean
): Promise<Endorsement> {
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .update({
      is_featured: isFeatured,
      updated_at: new Date().toISOString()
    })
    .eq('id', endorsementId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling endorsement featured status:', error);
    throw error;
  }

  return endorsement;
}

export async function toggleEndorsementPublic(
  supabase: SupabaseClient,
  endorsementId: string,
  isPublic: boolean
): Promise<Endorsement> {
  const { data: endorsement, error } = await supabase
    .from('endorsements')
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString()
    })
    .eq('id', endorsementId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling endorsement public status:', error);
    throw error;
  }

  return endorsement;
}

// ============================================================================
// Export Functions
// ============================================================================

export { endorsementFilterSchema, endorsementUpsertSchema };
