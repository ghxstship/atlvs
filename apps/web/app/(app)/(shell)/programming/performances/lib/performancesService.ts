import { createBrowserClient } from '@ghxstship/auth';

export interface Performance {
  id: string;
  organization_id: string;
  project_id?: string | null;
  event_id?: string | null;
  title: string;
  description?: string | null;
  type: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  venue?: string | null;
  stage?: string | null;
  duration_minutes?: number | null;
  capacity?: number | null;
  starts_at: string;
  ends_at?: string | null;
  setup_time?: number | null;
  breakdown_time?: number | null;
  technical_requirements?: unknown;
  hospitality_requirements?: unknown;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export class PerformancesService {
  private supabase = createBrowserClient();

  async getPerformances(orgId: string, filters?: {
    projectId?: string;
    eventId?: string;
    status?: string;
    type?: string;
    venue?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Performance[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_performances')
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('starts_at', { ascending: true });

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.venue) {
        query = query.eq('venue', filters.venue);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit && filters?.offset !== undefined) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching performances:', error);
      throw error;
    }
  }

  async createPerformance(orgId: string, userId: string, performanceData: Partial<Performance>): Promise<Performance> {
    try {
      const { data, error } = await this.supabase
        .from('programming_performances')
        .insert({
          ...performanceData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: performanceData.status || 'draft',
          technical_requirements: performanceData.technical_requirements || {},
          hospitality_requirements: performanceData.hospitality_requirements || {},
          metadata: performanceData.metadata || {}
        })
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        type: data.type,
        starts_at: data.starts_at
      });

      return data;
    } catch (error) {
      console.error('Error creating performance:', error);
      throw error;
    }
  }

  async updatePerformance(performanceId: string, userId: string, performanceData: Partial<Performance>): Promise<Performance> {
    try {
      const { data, error } = await this.supabase
        .from('programming_performances')
        .update({
          ...performanceData,
          updated_by: userId
        })
        .eq('id', performanceId)
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', performanceId, {
        title: data.title,
        changes: Object.keys(performanceData)
      });

      return data;
    } catch (error) {
      console.error('Error updating performance:', error);
      throw error;
    }
  }

  async deletePerformance(performanceId: string, userId: string): Promise<void> {
    try {
      const { data: performance } = await this.supabase
        .from('programming_performances')
        .select('organization_id, title')
        .eq('id', performanceId)
        .single();

      const { error } = await this.supabase
        .from('programming_performances')
        .delete()
        .eq('id', performanceId);

      if (error) throw error;

      if (performance) {
        await this.logActivity(performance.organization_id, userId, 'delete', performanceId, {
          title: performance.title
        });
      }
    } catch (error) {
      console.error('Error deleting performance:', error);
      throw error;
    }
  }

  async getPerformanceStats(orgId: string): Promise<{
    totalPerformances: number;
    scheduledPerformances: number;
    completedPerformances: number;
    upcomingPerformances: number;
    averageDuration: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_performances')
        .select('status, starts_at, duration_minutes')
        .eq('organization_id', orgId);

      if (error) throw error;

      const now = new Date().toISOString();
      const durations = data.filter(p => p.duration_minutes).map(p => p.duration_minutes);
      
      const stats = {
        totalPerformances: data.length,
        scheduledPerformances: data.filter(p => p.status === 'scheduled').length,
        completedPerformances: data.filter(p => p.status === 'completed').length,
        upcomingPerformances: data.filter(p => p.starts_at > now && p.status !== 'cancelled').length,
        averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      throw error;
    }
  }

  async getPerformancesByVenue(orgId: string, venue: string): Promise<Performance[]> {
    try {
      const { data, error } = await this.supabase
        .from('programming_performances')
        .select(`
          *,
          project:projects(id, name, status),
          event:programming_events(id, title, start_at)
        `)
        .eq('organization_id', orgId)
        .eq('venue', venue)
        .order('starts_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching performances by venue:', error);
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
          resource_type: 'programming_performance',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const performancesService = new PerformancesService();
