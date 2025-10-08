/**
 * Procurement Service Layer
 * Centralized business logic for Procurement module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface ProcurementItem {
  id: string;
  organization_id: string;
  item_name: string;
  description?: string;
  category: string;
  status: 'requested' | 'approved' | 'ordered' | 'received' | 'cancelled';
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  vendor?: string;
  requester?: string;
  approver?: string;
  request_date: string;
  approval_date?: string;
  delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export class ProcurementService {
  private supabase = createBrowserClient();

  /**
   * Get all procurement items for organization
   */
  async getProcurementItems(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ items: ProcurementItem[]; total: number }> {
    try {
      let query = this.supabase
        .from('procurement')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('request_date', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.search) {
        query = query.or(`item_name.ilike.%${options.search}%,description.ilike.%${options.search}%,vendor.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: (data as ProcurementItem[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching procurement items:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Get single procurement item by ID
   */
  async getProcurementItem(itemId: string, organizationId: string): Promise<ProcurementItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('procurement')
        .select('*')
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as ProcurementItem;
    } catch (error) {
      console.error('Error fetching procurement item:', error);
      return null;
    }
  }

  /**
   * Create new procurement item
   */
  async createProcurementItem(organizationId: string, item: Partial<ProcurementItem>): Promise<ProcurementItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('procurement')
        .insert({
          ...item,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProcurementItem;
    } catch (error) {
      console.error('Error creating procurement item:', error);
      return null;
    }
  }

  /**
   * Update procurement item
   */
  async updateProcurementItem(itemId: string, organizationId: string, updates: Partial<ProcurementItem>): Promise<ProcurementItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('procurement')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as ProcurementItem;
    } catch (error) {
      console.error('Error updating procurement item:', error);
      return null;
    }
  }

  /**
   * Delete procurement item
   */
  async deleteProcurementItem(itemId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('procurement')
        .delete()
        .eq('id', itemId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting procurement item:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalItems: number;
    pendingApprovals: number;
    orderedItems: number;
    totalSpend: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('procurement')
        .select('id, status, total_price')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        totalItems: data?.length || 0,
        pendingApprovals: data?.filter(p => p.status === 'requested').length || 0,
        orderedItems: data?.filter(p => p.status === 'ordered').length || 0,
        totalSpend: data?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalItems: 0,
        pendingApprovals: 0,
        orderedItems: 0,
        totalSpend: 0
      };
    }
  }
}

export const procurementService = new ProcurementService();
