/**
 * Programming Service Layer
 * Centralized business logic for Programming/Scheduling module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface ProgramItem {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  type: 'show' | 'event' | 'production' | 'rehearsal';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  venue?: string;
  capacity?: number;
  tickets_sold?: number;
  budget?: number;
  revenue?: number;
  created_at: string;
  updated_at: string;
}

export class ProgrammingService {
  private supabase = createBrowserClient();

  /**
   * Get all program items for organization
   */
  async getProgramItems(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ items: ProgramItem[]; total: number }> {
    try {
      let query = this.supabase
        .from('programming')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('start_date', { ascending: true });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.startDate) {
        query = query.gte('start_date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('end_date', options.endDate);
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
        items: (data as ProgramItem[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching program items:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Get single program item by ID
   */
  async getProgramItem(itemId: string, organizationId: string): Promise<ProgramItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('programming')
        .select('*')
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as ProgramItem;
    } catch (error) {
      console.error('Error fetching program item:', error);
      return null;
    }
  }

  /**
   * Create new program item
   */
  async createProgramItem(organizationId: string, item: Partial<ProgramItem>): Promise<ProgramItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('programming')
        .insert({
          ...item,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProgramItem;
    } catch (error) {
      console.error('Error creating program item:', error);
      return null;
    }
  }

  /**
   * Update program item
   */
  async updateProgramItem(itemId: string, organizationId: string, updates: Partial<ProgramItem>): Promise<ProgramItem | null> {
    try {
      const { data, error } = await this.supabase
        .from('programming')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as ProgramItem;
    } catch (error) {
      console.error('Error updating program item:', error);
      return null;
    }
  }

  /**
   * Delete program item
   */
  async deleteProgramItem(itemId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('programming')
        .delete()
        .eq('id', itemId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting program item:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalPrograms: number;
    upcomingPrograms: number;
    totalRevenue: number;
    ticketsSold: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming')
        .select('id, status, start_date, revenue, tickets_sold')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const now = new Date();
      const stats = {
        totalPrograms: data?.length || 0,
        upcomingPrograms: data?.filter(p => new Date(p.start_date) > now && p.status === 'scheduled').length || 0,
        totalRevenue: data?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0,
        ticketsSold: data?.reduce((sum, p) => sum + (p.tickets_sold || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalPrograms: 0,
        upcomingPrograms: 0,
        totalRevenue: 0,
        ticketsSold: 0
      };
    }
  }
}

export const programmingService = new ProgrammingService();
