/**
 * Companies Queries Service
 * Database query optimization and management
 * Handles complex queries, caching, and performance optimization
 */

import { createClient } from '@/lib/supabase/client';
import type { Company } from '../types';

export class CompaniesQueriesService {
  private supabase = createClient();

  /**
   * Optimized company list query with joins and aggregations
   */
  async getCompaniesWithStats(orgId: string, params: {
    search?: string;
    filters?: Record<string, any>;
    sort?: { field: string; direction: 'asc' | 'desc' };
    page?: number;
    limit?: number;
  }) {
    let query = this.supabase
      .from('companies')
      .select(`
        *,
        contracts:company_contracts(count),
        qualifications:company_qualifications(count),
        ratings:company_ratings(avg_rating:avg(rating))
      `)
      .eq('organization_id', orgId);

    // Apply search
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // Apply filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    // Apply sorting
    if (params.sort) {
      query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
    }

    // Apply pagination
    if (params.page !== undefined && params.limit) {
      const from = params.page * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  /**
   * Get company by ID with all related data
   */
  async getCompanyById(id: string, orgId: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .select(`
        *,
        contacts:company_contacts(*),
        contracts:company_contracts(*),
        qualifications:company_qualifications(*),
        ratings:company_ratings(*)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Analytics queries for dashboard
   */
  async getCompanyAnalytics(orgId: string) {
    const { data, error } = await this.supabase
      .rpc('get_company_analytics', { org_id: orgId });

    if (error) throw error;
    return data;
  }
}

export const companiesQueriesService = new CompaniesQueriesService();
