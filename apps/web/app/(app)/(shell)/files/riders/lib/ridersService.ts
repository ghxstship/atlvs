import { createBrowserClient } from '@ghxstship/auth';

export interface Rider {
  id: string;
  organization_id: string;
  event_id?: string | null;
  performance_id?: string | null;
  title: string;
  kind: 'technical' | 'hospitality' | 'stage_plot' | 'security' | 'catering' | 'transport';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'fulfilled';
  requirements: unknown;
  notes?: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string | null;
  assigned_to?: string | null;
  estimated_cost?: number | null;
  currency?: string | null;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export class RidersService {
  private supabase = createBrowserClient();

  async getRiders(orgId: string, filters?: {
    eventId?: string;
    performanceId?: string;
    kind?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Rider[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_riders')
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters?.performanceId) {
        query = query.eq('performance_id', filters.performanceId);
      }
      if (filters?.kind) {
        query = query.eq('kind', filters.kind);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
      }
      if (filters?.limit && filters?.offset !== undefined) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching riders:', error);
      throw error;
    }
  }

  async createRider(orgId: string, userId: string, riderData: Partial<Rider>): Promise<Rider> {
    try {
      const { data, error } = await this.supabase
        .from('programming_riders')
        .insert({
          ...riderData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: riderData.status || 'draft',
          priority: riderData.priority || 'medium',
          requirements: riderData.requirements || {},
          currency: riderData.currency || 'USD',
          metadata: riderData.metadata || {}
        })
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        kind: data.kind,
        priority: data.priority
      });

      return data;
    } catch (error) {
      console.error('Error creating rider:', error);
      throw error;
    }
  }

  async updateRider(riderId: string, userId: string, riderData: Partial<Rider>): Promise<Rider> {
    try {
      const { data, error } = await this.supabase
        .from('programming_riders')
        .update({
          ...riderData,
          updated_by: userId
        })
        .eq('id', riderId)
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', riderId, {
        title: data.title,
        changes: Object.keys(riderData)
      });

      return data;
    } catch (error) {
      console.error('Error updating rider:', error);
      throw error;
    }
  }

  async deleteRider(riderId: string, userId: string): Promise<void> {
    try {
      const { data: rider } = await this.supabase
        .from('programming_riders')
        .select('organization_id, title')
        .eq('id', riderId)
        .single();

      const { error } = await this.supabase
        .from('programming_riders')
        .delete()
        .eq('id', riderId);

      if (error) throw error;

      if (rider) {
        await this.logActivity(rider.organization_id, userId, 'delete', riderId, {
          title: rider.title
        });
      }
    } catch (error) {
      console.error('Error deleting rider:', error);
      throw error;
    }
  }

  async approveRider(riderId: string, userId: string, notes?: string): Promise<Rider> {
    try {
      const updateData: Partial<Rider> = {
        status: 'approved',
        updated_by: userId
      };

      if (notes) {
        updateData.notes = notes;
      }

      return await this.updateRider(riderId, userId, updateData);
    } catch (error) {
      console.error('Error approving rider:', error);
      throw error;
    }
  }

  async rejectRider(riderId: string, userId: string, reason: string): Promise<Rider> {
    try {
      return await this.updateRider(riderId, userId, {
        status: 'rejected',
        notes: reason
      });
    } catch (error) {
      console.error('Error rejecting rider:', error);
      throw error;
    }
  }

  async getRiderStats(orgId: string): Promise<{
    totalRiders: number;
    pendingRiders: number;
    approvedRiders: number;
    rejectedRiders: number;
    criticalRiders: number;
    kindBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_riders')
        .select('status, priority, kind')
        .eq('organization_id', orgId);

      if (error) throw error;

      const kindBreakdown: Record<string, number> = {};
      data.forEach(rider => {
        if (rider.kind) {
          kindBreakdown[rider.kind] = (kindBreakdown[rider.kind] || 0) + 1;
        }
      });

      const stats = {
        totalRiders: data.length,
        pendingRiders: data.filter(r => r.status === 'submitted').length,
        approvedRiders: data.filter(r => r.status === 'approved').length,
        rejectedRiders: data.filter(r => r.status === 'rejected').length,
        criticalRiders: data.filter(r => r.priority === 'critical').length,
        kindBreakdown
      };

      return stats;
    } catch (error) {
      console.error('Error fetching rider stats:', error);
      throw error;
    }
  }

  async getRidersByEvent(orgId: string, eventId: string): Promise<Rider[]> {
    try {
      const { data, error } = await this.supabase
        .from('programming_riders')
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `)
        .eq('organization_id', orgId)
        .eq('event_id', eventId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching riders by event:', error);
      throw error;
    }
  }

  private async logActivity(orgId: string, userId: string, action: string, resourceId: string, details: unknown): Promise<void> {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          organization_id: orgId,
          user_id: userId,
          resource_type: 'programming_rider',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const ridersService = new RidersService();
