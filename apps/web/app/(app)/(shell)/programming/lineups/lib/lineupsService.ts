import { createBrowserClient } from '@ghxstship/auth';

export interface Lineup {
  id: string;
  organization_id: string;
  event_id?: string | null;
  performance_id?: string | null;
  status: 'draft' | 'confirmed' | 'published' | 'cancelled';
  title: string;
  description?: string | null;
  lineup_date: string;
  venue?: string | null;
  stage?: string | null;
  performers: LineupPerformer[];
  total_duration?: number | null;
  notes?: string | null;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface LineupPerformer {
  id: string;
  name: string;
  type: 'artist' | 'band' | 'speaker' | 'host' | 'dj' | 'other';
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  order_index: number;
  technical_requirements?: unknown;
  contact_info?: unknown;
  notes?: string | null;
}

export class LineupsService {
  private supabase = createBrowserClient();

  async getLineups(orgId: string, filters?: {
    eventId?: string;
    performanceId?: string;
    status?: string;
    venue?: string;
    stage?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Lineup[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_lineups')
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('lineup_date', { ascending: true });

      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters?.performanceId) {
        query = query.eq('performance_id', filters.performanceId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.venue) {
        query = query.eq('venue', filters.venue);
      }
      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }
      if (filters?.dateFrom) {
        query = query.gte('lineup_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('lineup_date', filters.dateTo);
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
      console.error('Error fetching lineups:', error);
      throw error;
    }
  }

  async createLineup(orgId: string, userId: string, lineupData: Partial<Lineup>): Promise<Lineup> {
    try {
      const { data, error } = await this.supabase
        .from('programming_lineups')
        .insert({
          ...lineupData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: lineupData.status || 'draft',
          performers: lineupData.performers || [],
          metadata: lineupData.metadata || {}
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
        lineup_date: data.lineup_date,
        performers_count: data.performers?.length || 0
      });

      return data;
    } catch (error) {
      console.error('Error creating lineup:', error);
      throw error;
    }
  }

  async updateLineup(lineupId: string, userId: string, lineupData: Partial<Lineup>): Promise<Lineup> {
    try {
      const { data, error } = await this.supabase
        .from('programming_lineups')
        .update({
          ...lineupData,
          updated_by: userId
        })
        .eq('id', lineupId)
        .select(`
          *,
          event:programming_events(id, title, start_at),
          performance:programming_performances(id, title, starts_at)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', lineupId, {
        title: data.title,
        changes: Object.keys(lineupData)
      });

      return data;
    } catch (error) {
      console.error('Error updating lineup:', error);
      throw error;
    }
  }

  async deleteLineup(lineupId: string, userId: string): Promise<void> {
    try {
      const { data: lineup } = await this.supabase
        .from('programming_lineups')
        .select('organization_id, title')
        .eq('id', lineupId)
        .single();

      const { error } = await this.supabase
        .from('programming_lineups')
        .delete()
        .eq('id', lineupId);

      if (error) throw error;

      if (lineup) {
        await this.logActivity(lineup.organization_id, userId, 'delete', lineupId, {
          title: lineup.title
        });
      }
    } catch (error) {
      console.error('Error deleting lineup:', error);
      throw error;
    }
  }

  async addPerformerToLineup(lineupId: string, performer: Omit<LineupPerformer, 'id'>, userId: string): Promise<Lineup> {
    try {
      // Get current lineup
      const { data: currentLineup, error: fetchError } = await this.supabase
        .from('programming_lineups')
        .select('performers')
        .eq('id', lineupId)
        .single();

      if (fetchError) throw fetchError;

      const newPerformer: LineupPerformer = {
        ...performer,
        id: crypto.randomUUID()
      };

      const updatedPerformers = [...(currentLineup.performers || []), newPerformer];

      return await this.updateLineup(lineupId, userId, {
        performers: updatedPerformers,
        total_duration: this.calculateTotalDuration(updatedPerformers)
      });
    } catch (error) {
      console.error('Error adding performer to lineup:', error);
      throw error;
    }
  }

  async removePerformerFromLineup(lineupId: string, performerId: string, userId: string): Promise<Lineup> {
    try {
      const { data: currentLineup, error: fetchError } = await this.supabase
        .from('programming_lineups')
        .select('performers')
        .eq('id', lineupId)
        .single();

      if (fetchError) throw fetchError;

      const updatedPerformers = (currentLineup.performers || []).filter(
        (p: LineupPerformer) => p.id !== performerId
      );

      return await this.updateLineup(lineupId, userId, {
        performers: updatedPerformers,
        total_duration: this.calculateTotalDuration(updatedPerformers)
      });
    } catch (error) {
      console.error('Error removing performer from lineup:', error);
      throw error;
    }
  }

  async reorderPerformers(lineupId: string, performerIds: string[], userId: string): Promise<Lineup> {
    try {
      const { data: currentLineup, error: fetchError } = await this.supabase
        .from('programming_lineups')
        .select('performers')
        .eq('id', lineupId)
        .single();

      if (fetchError) throw fetchError;

      const performersMap = new Map(
        (currentLineup.performers || []).map((p: LineupPerformer) => [p.id, p])
      );

      const reorderedPerformers = performerIds.map((id, index) => ({
        ...performersMap.get(id),
        order_index: index
      })).filter(Boolean);

      return await this.updateLineup(lineupId, userId, {
        performers: reorderedPerformers
      });
    } catch (error) {
      console.error('Error reordering performers:', error);
      throw error;
    }
  }

  async publishLineup(lineupId: string, userId: string): Promise<Lineup> {
    try {
      return await this.updateLineup(lineupId, userId, {
        status: 'published'
      });
    } catch (error) {
      console.error('Error publishing lineup:', error);
      throw error;
    }
  }

  async getLineupStats(orgId: string): Promise<{
    totalLineups: number;
    publishedLineups: number;
    draftLineups: number;
    totalPerformers: number;
    averagePerformersPerLineup: number;
    performerTypeBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_lineups')
        .select('status, performers')
        .eq('organization_id', orgId);

      if (error) throw error;

      const performerTypeBreakdown: Record<string, number> = {};
      let totalPerformers = 0;

      data.forEach(lineup => {
        const performers = lineup.performers || [];
        totalPerformers += performers.length;
        
        performers.forEach((performer: LineupPerformer) => {
          if (performer.type) {
            performerTypeBreakdown[performer.type] = (performerTypeBreakdown[performer.type] || 0) + 1;
          }
        });
      });

      const stats = {
        totalLineups: data.length,
        publishedLineups: data.filter(l => l.status === 'published').length,
        draftLineups: data.filter(l => l.status === 'draft').length,
        totalPerformers,
        averagePerformersPerLineup: data.length > 0 ? totalPerformers / data.length : 0,
        performerTypeBreakdown
      };

      return stats;
    } catch (error) {
      console.error('Error fetching lineup stats:', error);
      throw error;
    }
  }

  private calculateTotalDuration(performers: LineupPerformer[]): number {
    return performers.reduce((total, performer) => {
      return total + (performer.duration_minutes || 0);
    }, 0);
  }

  private async logActivity(orgId: string, userId: string, action: string, resourceId: string, details: unknown): Promise<void> {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          organization_id: orgId,
          user_id: userId,
          resource_type: 'programming_lineup',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const lineupsService = new LineupsService();
