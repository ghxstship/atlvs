import { z as zod } from 'zod';
import type {
  ContactInfo,
  ContactFilters,
  ContactStats,
  ContactAnalytics,
  ContactFormData,
} from '../types';
import { 
  createEmptyContactStats, 
  createEmptyContactAnalytics,
  calculateContactCompleteness,
} from '../types';

export const contactFilterSchema = zod.object({
  search: zod.string().optional(),
  country: zod.string().optional(),
  state_province: zod.string().optional(),
  city: zod.string().optional(),
  verification_status: zod.enum(['all', 'verified', 'pending', 'unverified']).optional(),
  has_emergency_contact: zod.boolean().optional(),
  preferred_contact_method: zod.enum(['all', 'email', 'phone', 'sms', 'mail']).optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0),
});

export const contactUpdateSchema = zod.object({
  phone_primary: zod.string().optional(),
  phone_secondary: zod.string().optional(),
  phone_mobile: zod.string().optional(),
  phone_work: zod.string().optional(),
  phone_extension: zod.string().optional(),
  address_line1: zod.string().optional(),
  address_line2: zod.string().optional(),
  city: zod.string().optional(),
  state_province: zod.string().optional(),
  postal_code: zod.string().optional(),
  country: zod.string().optional(),
  billing_address_line1: zod.string().optional(),
  billing_address_line2: zod.string().optional(),
  billing_city: zod.string().optional(),
  billing_state_province: zod.string().optional(),
  billing_postal_code: zod.string().optional(),
  billing_country: zod.string().optional(),
  billing_same_as_primary: zod.boolean().optional(),
  emergency_contact_name: zod.string().optional(),
  emergency_contact_relationship: zod.string().optional(),
  emergency_contact_phone: zod.string().optional(),
  emergency_contact_email: zod.string().email().optional().or(zod.literal('')),
  timezone: zod.string().optional(),
  preferred_contact_method: zod.enum(['email', 'phone', 'sms', 'mail']).optional(),
  do_not_contact: zod.boolean().optional(),
  contact_notes: zod.string().max(1000).optional(),
});

type SupabaseClient = ReturnType<typeof import('@ghxstship/auth').createServerClient>;

export async function fetchUserContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<ContactInfo | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        organization_id,
        phone_primary,
        phone_secondary,
        phone_mobile,
        phone_work,
        phone_extension,
        address_line1,
        address_line2,
        city,
        state_province,
        postal_code,
        country,
        billing_address_line1,
        billing_address_line2,
        billing_city,
        billing_state_province,
        billing_postal_code,
        billing_country,
        billing_same_as_primary,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
        emergency_contact_email,
        timezone,
        preferred_contact_method,
        do_not_contact,
        contact_notes,
        created_at,
        updated_at,
        last_verified,
        verification_status
      `)
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user contact:', error);
    return null;
  }
}

export async function fetchContacts(
  supabase: SupabaseClient,
  orgId: string,
  filters: zod.infer<typeof contactFilterSchema>
): Promise<{
  contacts: ContactInfo[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId);

    // Apply filters
    if (filters.search) {
      query = query.or(`
        phone_primary.ilike.%${filters.search}%,
        phone_secondary.ilike.%${filters.search}%,
        address_line1.ilike.%${filters.search}%,
        city.ilike.%${filters.search}%,
        emergency_contact_name.ilike.%${filters.search}%
      `);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.state_province) {
      query = query.eq('state_province', filters.state_province);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.verification_status && filters.verification_status !== 'all') {
      query = query.eq('verification_status', filters.verification_status);
    }

    if (filters.has_emergency_contact) {
      query = query.not('emergency_contact_name', 'is', null);
    }

    if (filters.preferred_contact_method && filters.preferred_contact_method !== 'all') {
      query = query.eq('preferred_contact_method', filters.preferred_contact_method);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    return {
      contacts: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      contacts: [],
      total: 0,
    };
  }
}

export async function updateUserContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  contactData: zod.infer<typeof contactUpdateSchema>
): Promise<ContactInfo | null> {
  try {
    // If billing same as primary, copy primary address to billing
    if (contactData.billing_same_as_primary) {
      contactData.billing_address_line1 = contactData.address_line1;
      contactData.billing_address_line2 = contactData.address_line2;
      contactData.billing_city = contactData.city;
      contactData.billing_state_province = contactData.state_province;
      contactData.billing_postal_code = contactData.postal_code;
      contactData.billing_country = contactData.country;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...contactData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) throw error;

    // Create activity log entry
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'contact_updated',
        activity_description: 'Updated contact information',
        metadata: {
          fields_updated: Object.keys(contactData),
        },
        performed_by: userId,
      });

    return data;
  } catch (error) {
    console.error('Error updating contact:', error);
    return null;
  }
}

export async function verifyContact(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        verification_status: 'verified',
        last_verified: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('organization_id', orgId);

    if (error) throw error;

    // Create activity log entry
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'contact_verified',
        activity_description: 'Verified contact information',
        performed_by: userId,
      });

    return true;
  } catch (error) {
    console.error('Error verifying contact:', error);
    return false;
  }
}

export async function fetchContactStats(
  supabase: SupabaseClient,
  orgId: string
): Promise<ContactStats> {
  try {
    const { data: contacts } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId);

    if (!contacts) {
      return createEmptyContactStats();
    }

    const totalContacts = contacts.length;
    const verifiedContacts = contacts.filter(c => c.verification_status === 'verified').length;
    const unverifiedContacts = contacts.filter(c => c.verification_status !== 'verified').length;
    const withEmergencyContact = contacts.filter(c => c.emergency_contact_name).length;

    // Contact method distribution
    const methodCounts: Record<string, number> = {};
    contacts.forEach(contact => {
      const method = contact.preferred_contact_method || 'email';
      methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const contactMethodDistribution = Object.entries(methodCounts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Country distribution
    const countryCounts: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.country) {
        countryCounts[contact.country] = (countryCounts[contact.country] || 0) + 1;
      }
    });

    const countryDistribution = Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Verification status distribution
    const statusCounts: Record<string, number> = {
      verified: 0,
      pending: 0,
      unverified: 0,
    };

    contacts.forEach(contact => {
      const status = contact.verification_status || 'unverified';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const verificationStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0,
      }));

    return {
      totalContacts,
      verifiedContacts,
      unverifiedContacts,
      withEmergencyContact,
      contactMethodDistribution,
      countryDistribution,
      verificationStatus,
    };
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return createEmptyContactStats();
  }
}

export async function fetchContactAnalytics(
  supabase: SupabaseClient,
  orgId: string
): Promise<ContactAnalytics> {
  try {
    const { data: contacts } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', orgId);

    if (!contacts || contacts.length === 0) {
      return createEmptyContactAnalytics();
    }

    // Calculate completeness metrics
    const completenessScores = contacts.map(contact => calculateContactCompleteness(contact));
    const contactCompleteness = Math.round(
      completenessScores.reduce((sum, score) => sum + score, 0) / contacts.length
    );

    // Verification rate
    const verifiedCount = contacts.filter(c => c.verification_status === 'verified').length;
    const verificationRate = Math.round((verifiedCount / contacts.length) * 100);

    // Emergency contact coverage
    const withEmergency = contacts.filter(c => c.emergency_contact_name).length;
    const emergencyContactCoverage = Math.round((withEmergency / contacts.length) * 100);

    // Address completeness
    const withCompleteAddress = contacts.filter(c => 
      c.address_line1 && c.city && c.state_province && c.postal_code && c.country
    ).length;
    const addressCompleteness = Math.round((withCompleteAddress / contacts.length) * 100);

    // Phone completeness
    const withPhone = contacts.filter(c => c.phone_primary).length;
    const phoneCompleteness = Math.round((withPhone / contacts.length) * 100);

    // Recent updates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUpdates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const updates = contacts.filter(c => 
        c.updated_at.startsWith(dateStr)
      ).length;
      
      const verifications = contacts.filter(c => 
        c.last_verified && c.last_verified.startsWith(dateStr)
      ).length;
      
      if (updates > 0 || verifications > 0) {
        recentUpdates.push({
          date: dateStr,
          updates,
          verifications,
        });
      }
    }

    // Geographic distribution
    const regionCounts: Record<string, number> = {};
    contacts.forEach(contact => {
      if (contact.country) {
        // Simple region mapping
        const region = getRegionFromCountry(contact.country);
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }
    });

    const geographicDistribution = Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
        percentage: (count / contacts.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      contactCompleteness,
      verificationRate,
      emergencyContactCoverage,
      addressCompleteness,
      phoneCompleteness,
      recentUpdates,
      geographicDistribution,
    };
  } catch (error) {
    console.error('Error fetching contact analytics:', error);
    return createEmptyContactAnalytics();
  }
}

function getRegionFromCountry(country: string): string {
  const regionMap: Record<string, string> = {
    'US': 'North America',
    'CA': 'North America',
    'MX': 'North America',
    'GB': 'Europe',
    'DE': 'Europe',
    'FR': 'Europe',
    'IT': 'Europe',
    'ES': 'Europe',
    'JP': 'Asia',
    'CN': 'Asia',
    'IN': 'Asia',
    'KR': 'Asia',
    'AU': 'Oceania',
    'NZ': 'Oceania',
    'BR': 'South America',
    'AR': 'South America',
  };
  
  return regionMap[country] || 'Other';
}
