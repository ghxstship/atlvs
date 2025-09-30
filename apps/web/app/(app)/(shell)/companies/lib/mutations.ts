/**
 * Companies Mutations Service
 * Data mutation operations with transaction management
 * Handles create, update, delete with rollback capabilities
 */

import { createClient } from '@/lib/supabase/client';
import type { CreateCompanyInput, UpdateCompanyInput, Company } from '../types';

export class CompaniesMutationsService {
  private supabase = createClient();

  /**
   * Create company with transaction management
   */
  async createCompany(input: CreateCompanyInput, orgId: string, userId: string) {
    const { data, error } = await this.supabase.rpc('create_company_transaction', {
      company_data: input,
      org_id: orgId,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update company with optimistic locking
   */
  async updateCompany(id: string, input: UpdateCompanyInput, userId: string, version?: number) {
    const { data, error } = await this.supabase.rpc('update_company_optimistic', {
      company_id: id,
      update_data: input,
      user_id: userId,
      expected_version: version,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Bulk update companies
   */
  async bulkUpdateCompanies(updates: Array<{ id: string; data: UpdateCompanyInput }>, userId: string) {
    const { data, error } = await this.supabase.rpc('bulk_update_companies', {
      updates: updates,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete company
   */
  async softDeleteCompany(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('soft_delete_company', {
      company_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Hard delete company (admin only)
   */
  async hardDeleteCompany(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('hard_delete_company', {
      company_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Bulk delete companies
   */
  async bulkDeleteCompanies(ids: string[], userId: string, soft: boolean = true) {
    const { data, error } = await this.supabase.rpc('bulk_delete_companies', {
      company_ids: ids,
      user_id: userId,
      soft_delete: soft,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Restore soft-deleted company
   */
  async restoreCompany(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('restore_company', {
      company_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }
}

export const companiesMutationsService = new CompaniesMutationsService();
