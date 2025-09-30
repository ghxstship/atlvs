import { z as zod } from 'zod';
import type {
  Certification,
  CertificationFilters,
  CertificationStats,
  CertificationAnalytics,
  CertificationFormData,
} from '../types';
import { 
  createEmptyCertificationStats, 
  createEmptyCertificationAnalytics,
  getCertificationStatus,
} from '../types';

export const certificationFilterSchema = zod.object({
  status: zod.enum(['all', 'active', 'expired', 'suspended', 'revoked']).optional(),
  issuing_organization: zod.string().optional(),
  expiry_status: zod.enum(['active', 'expiring_soon', 'expired', 'all']).optional(),
  search: zod.string().optional(),
  date_from: zod.string().datetime().optional(),
  date_to: zod.string().datetime().optional(),
  issue_year: zod.string().optional(),
  limit: zod.number().min(1).max(100).default(50),
  offset: zod.number().min(0).default(0),
});

export const certificationCreateSchema = zod.object({
  name: zod.string().min(1, 'Certification name is required'),
  issuing_organization: zod.string().min(1, 'Issuing organization is required'),
  certification_number: zod.string().optional(),
  issue_date: zod.string().optional(),
  expiry_date: zod.string().optional(),
  status: zod.enum(['active', 'expired', 'suspended', 'revoked']).default('active'),
  verification_url: zod.string().url().optional().or(zod.literal('')),
  attachment_url: zod.string().url().optional().or(zod.literal('')),
  notes: zod.string().max(500).optional(),
});

export const certificationUpdateSchema = certificationCreateSchema.partial();

export const analyticsFilterSchema = zod.object({
  period: zod.enum(['7d', '30d', '90d', '1y']).default('30d'),
  granularity: zod.enum(['day', 'week', 'month']).default('day'),
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

export async function fetchUserCertifications(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  filters: zod.infer<typeof certificationFilterSchema>
): Promise<{
  certifications: Certification[];
  total: number;
}> {
  try {
    let query = supabase
      .from('user_certifications')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.issuing_organization) {
      query = query.ilike('issuing_organization', `%${filters.issuing_organization}%`);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,issuing_organization.ilike.%${filters.search}%,certification_number.ilike.%${filters.search}%`);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.issue_year) {
      const year = parseInt(filters.issue_year);
      const startOfYear = new Date(year, 0, 1).toISOString();
      const endOfYear = new Date(year, 11, 31, 23, 59, 59).toISOString();
      query = query.gte('issue_date', startOfYear).lte('issue_date', endOfYear);
    }

    // Apply expiry status filter
    if (filters.expiry_status && filters.expiry_status !== 'all') {
      const now = new Date().toISOString();
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      switch (filters.expiry_status) {
        case 'active':
          query = query.or(`expiry_date.is.null,expiry_date.gt.${now}`);
          break;
        case 'expiring_soon':
          query = query.gte('expiry_date', now).lte('expiry_date', thirtyDaysFromNow);
          break;
        case 'expired':
          query = query.lt('expiry_date', now);
          break;
      }
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (error) throw error;

    return {
      certifications: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching user certifications:', error);
    return {
      certifications: [],
      total: 0,
    };
  }
}

export async function createCertification(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  certificationData: zod.infer<typeof certificationCreateSchema>
): Promise<Certification | null> {
  try {
    const { data, error } = await supabase
      .from('user_certifications')
      .insert({
        user_id: userId,
        organization_id: orgId,
        ...certificationData,
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity log entry
    await supabase
      .from('user_profile_activity')
      .insert({
        user_id: userId,
        organization_id: orgId,
        activity_type: 'certification_added',
        activity_description: `Added certification: ${certificationData.name}`,
        metadata: {
          certification_name: certificationData.name,
          issuing_organization: certificationData.issuing_organization,
        },
        performed_by: userId,
      });

    return data;
  } catch (error) {
    console.error('Error creating certification:', error);
    return null;
  }
}

export async function updateCertification(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  certificationId: string,
  certificationData: zod.infer<typeof certificationUpdateSchema>
): Promise<Certification | null> {
  try {
    const { data, error } = await supabase
      .from('user_certifications')
      .update({
        ...certificationData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', certificationId)
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
        activity_type: 'certification_updated',
        activity_description: `Updated certification: ${data.name}`,
        metadata: {
          certification_id: certificationId,
          certification_name: data.name,
        },
        performed_by: userId,
      });

    return data;
  } catch (error) {
    console.error('Error updating certification:', error);
    return null;
  }
}

export async function deleteCertification(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  certificationId: string
): Promise<boolean> {
  try {
    // Get certification details for activity log
    const { data: certification } = await supabase
      .from('user_certifications')
      .select('name')
      .eq('id', certificationId)
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    const { error } = await supabase
      .from('user_certifications')
      .delete()
      .eq('id', certificationId)
      .eq('user_id', userId)
      .eq('organization_id', orgId);

    if (error) throw error;

    // Create activity log entry
    if (certification) {
      await supabase
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: 'certification_removed',
          activity_description: `Removed certification: ${certification.name}`,
          metadata: {
            certification_id: certificationId,
            certification_name: certification.name,
          },
          performed_by: userId,
        });
    }

    return true;
  } catch (error) {
    console.error('Error deleting certification:', error);
    return false;
  }
}

export async function fetchCertificationStats(
  supabase: SupabaseClient,
  orgId: string,
  userId: string
): Promise<CertificationStats> {
  try {
    const { data: certifications } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (!certifications) {
      return createEmptyCertificationStats();
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let activeCertifications = 0;
    let expiredCertifications = 0;
    let expiringSoon = 0;

    const organizationCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    certifications.forEach(cert => {
      const status = getCertificationStatus(cert);
      
      if (status.status === 'Active') {
        activeCertifications++;
      } else if (status.status === 'Expired') {
        expiredCertifications++;
      } else if (status.isExpiring) {
        expiringSoon++;
      }

      // Organization distribution
      organizationCounts[cert.issuing_organization] = (organizationCounts[cert.issuing_organization] || 0) + 1;
      
      // Status distribution
      statusCounts[cert.status] = (statusCounts[cert.status] || 0) + 1;
    });

    const totalCertifications = certifications.length;

    const organizationDistribution = Object.entries(organizationCounts)
      .map(([organization, count]) => ({
        organization,
        count,
        percentage: totalCertifications > 0 ? (count / totalCertifications) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const statusDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalCertifications > 0 ? (count / totalCertifications) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Generate expiry trends for next 12 months
    const expiryTrends = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
      
      const expiring = certifications.filter(cert => {
        if (!cert.expiry_date) return false;
        const expiry = new Date(cert.expiry_date);
        return expiry >= monthStart && expiry <= monthEnd;
      }).length;

      const expired = certifications.filter(cert => {
        if (!cert.expiry_date) return false;
        const expiry = new Date(cert.expiry_date);
        return expiry >= monthStart && expiry <= monthEnd && expiry < now;
      }).length;

      expiryTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        expiring,
        expired,
      });
    }

    // Generate recent activity (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const added = certifications.filter(cert => 
        cert.created_at.startsWith(dateStr)
      ).length;

      const renewed = certifications.filter(cert => 
        cert.updated_at.startsWith(dateStr) && cert.created_at !== cert.updated_at
      ).length;

      if (added > 0 || renewed > 0) {
        recentActivity.push({
          date: dateStr,
          added,
          renewed,
        });
      }
    }

    return {
      totalCertifications,
      activeCertifications,
      expiredCertifications,
      expiringSoon,
      organizationDistribution,
      statusDistribution,
      expiryTrends,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching certification stats:', error);
    return createEmptyCertificationStats();
  }
}

export async function fetchCertificationAnalytics(
  supabase: SupabaseClient,
  orgId: string,
  userId: string,
  filters: zod.infer<typeof analyticsFilterSchema>
): Promise<CertificationAnalytics> {
  try {
    const { startDate, endDate } = getPeriodDates(filters.period);

    const { data: certificationsData } = await supabase
      .from('user_certifications')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const certifications = certificationsData ?? [];

    if (certifications.length === 0) {
      return createEmptyCertificationAnalytics();
    }

    const dailyCounts: Record<string, { total: number; new: number; renewals: number }> = {};
    
    certifications.forEach((cert: Certification) => {
      const createdDate = new Date(cert.created_at).toISOString().split('T')[0];
      const updatedDate = new Date(cert.updated_at).toISOString().split('T')[0];
      
      if (!dailyCounts[createdDate]) {
        dailyCounts[createdDate] = { total: 0, new: 0, renewals: 0 };
      }
      
      dailyCounts[createdDate].new += 1;
      dailyCounts[createdDate].total += 1;
      
      if (createdDate !== updatedDate) {
        if (!dailyCounts[updatedDate]) {
          dailyCounts[updatedDate] = { total: 0, new: 0, renewals: 0 };
        }
        dailyCounts[updatedDate].renewals += 1;
        dailyCounts[updatedDate].total += 1;
      }
    });

    const certificationTrends = Object.entries(dailyCounts)
      .map(([date, counts]) => ({
        date,
        totalCertifications: counts.total,
        newCertifications: counts.new,
        renewals: counts.renewals,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Organization analysis
    const organizationStats: Record<string, {
      total: number;
      active: number;
      validityPeriods: number[];
    }> = {};

    certifications.forEach(cert => {
      const org = cert.issuing_organization;
      if (!organizationStats[org]) {
        organizationStats[org] = { total: 0, active: 0, validityPeriods: [] };
      }
      
      organizationStats[org].total++;
      
      const status = getCertificationStatus(cert);
      if (status.status === 'Active') {
        organizationStats[org].active++;
      }
      
      if (cert.issue_date && cert.expiry_date) {
        const issueDate = new Date(cert.issue_date);
        const expiryDate = new Date(cert.expiry_date);
        const validityPeriod = Math.ceil((expiryDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
        organizationStats[org].validityPeriods.push(validityPeriod);
      }
    });

    const organizationAnalysis = Object.entries(organizationStats)
      .map(([organization, stats]) => ({
        organization,
        totalCertifications: stats.total,
        activeCertifications: stats.active,
        averageValidityPeriod: stats.validityPeriods.length > 0 
          ? Math.round(stats.validityPeriods.reduce((sum, period) => sum + period, 0) / stats.validityPeriods.length)
          : 0,
      }))
      .sort((a, b) => b.totalCertifications - a.totalCertifications);

    // Expiry analysis
    const now = new Date();
    const expiryRanges = [
      { timeframe: 'Expired', filter: (cert: Certification) => {
        if (!cert.expiry_date) return false;
        return new Date(cert.expiry_date) < now;
      }},
      { timeframe: 'Next 30 days', filter: (cert: Certification) => {
        if (!cert.expiry_date) return false;
        const expiry = new Date(cert.expiry_date);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiry >= now && expiry <= thirtyDays;
      }},
      { timeframe: 'Next 90 days', filter: (cert: Certification) => {
        if (!cert.expiry_date) return false;
        const expiry = new Date(cert.expiry_date);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        return expiry > thirtyDays && expiry <= ninetyDays;
      }},
      { timeframe: 'Next year', filter: (cert: Certification) => {
        if (!cert.expiry_date) return false;
        const expiry = new Date(cert.expiry_date);
        const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        const oneYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        return expiry > ninetyDays && expiry <= oneYear;
      }},
      { timeframe: 'No expiry', filter: (cert: Certification) => !cert.expiry_date },
    ];

    const expiryAnalysis = expiryRanges.map(range => {
      const count = certifications.filter(range.filter).length;
      return {
        timeframe: range.timeframe,
        count,
        percentage: certifications.length > 0 ? (count / certifications.length) * 100 : 0,
      };
    });

    // Compliance metrics
    const activeCerts = certifications.filter(cert => getCertificationStatus(cert).status === 'Active').length;
    const expiredCerts = certifications.filter(cert => getCertificationStatus(cert).status === 'Expired').length;
    const renewedCerts = certifications.filter(cert => cert.created_at !== cert.updated_at).length;
    
    const overallCompliance = certifications.length > 0 ? (activeCerts / certifications.length) * 100 : 0;
    const renewalRate = certifications.length > 0 ? (renewedCerts / certifications.length) * 100 : 0;

    // Calculate average renewal time
    const renewalTimes = certifications
      .filter(cert => cert.created_at !== cert.updated_at && cert.issue_date)
      .map(cert => {
        const created = new Date(cert.created_at);
        const updated = new Date(cert.updated_at);
        return Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });

    const averageRenewalTime = renewalTimes.length > 0 
      ? Math.round(renewalTimes.reduce((sum, time) => sum + time, 0) / renewalTimes.length)
      : 0;

    return {
      certificationTrends,
      organizationAnalysis,
      expiryAnalysis,
      complianceMetrics: {
        overallCompliance: Math.round(overallCompliance),
        criticalCertifications: certifications.filter(cert => getCertificationStatus(cert).isExpiring).length,
        renewalRate: Math.round(renewalRate),
        averageRenewalTime,
      },
    };
  } catch (error) {
    console.error('Error fetching certification analytics:', error);
    return createEmptyCertificationAnalytics();
  }
}
