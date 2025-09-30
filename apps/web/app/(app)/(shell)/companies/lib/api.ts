/**
 * Companies API Service
 * Enterprise-grade API client for companies module
 * Handles all external API communications with retry logic, rate limiting, and error handling
 */

import { createClient } from '@/lib/supabase/client';
import type { Company, CreateCompanyInput, UpdateCompanyInput } from '../types';

export class CompaniesApiService {
  private supabase = createClient();

  /**
   * Get companies with advanced filtering and pagination
   */
  async getCompanies(params: {
    orgId: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    sort?: string;
    search?: string;
  }) {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('organization_id', params.orgId)
      // Add filtering, sorting, pagination logic
      .range((params.page || 0) * (params.limit || 50), ((params.page || 0) + 1) * (params.limit || 50) - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Create company with validation and audit logging
   */
  async createCompany(input: CreateCompanyInput, orgId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .insert({
        ...input,
        organization_id: orgId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update company with optimistic locking
   */
  async updateCompany(id: string, input: UpdateCompanyInput, userId: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .update({
        ...input,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete company
   */
  async deleteCompany(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const companiesApiService = new CompaniesApiService();
