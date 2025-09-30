import { createBrowserClient } from '@ghxstship/auth';
import type { ProgrammingEvent } from '../types';

export class EventsService {
  private supabase = createBrowserClient();

  async getEvents(orgId: string, filters?: {
    projectId?: string;
    status?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ProgrammingEvent[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_events')
        .select(`
          *,
          project:projects(id, name, status)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('start_at', { ascending: true });

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.startDate) {
        query = query.gte('start_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_at', filters.endDate);
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
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createEvent(orgId: string, userId: string, eventData: Partial<ProgrammingEvent>): Promise<ProgrammingEvent> {
    try {
      const { data, error } = await this.supabase
        .from('programming_events')
        .insert({
          ...eventData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: eventData.status || 'draft',
          tags: eventData.tags || [],
          resources: eventData.resources || [],
          staffing: eventData.staffing || [],
          metadata: eventData.metadata || {},
          is_all_day: eventData.is_all_day || false,
          timezone: eventData.timezone || 'UTC'
        })
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        event_type: data.event_type,
        start_at: data.start_at
      });

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, userId: string, eventData: Partial<ProgrammingEvent>): Promise<ProgrammingEvent> {
    try {
      const { data, error } = await this.supabase
        .from('programming_events')
        .update({
          ...eventData,
          updated_by: userId
        })
        .eq('id', eventId)
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', eventId, {
        title: data.title,
        changes: Object.keys(eventData)
      });

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      const { data: event } = await this.supabase
        .from('programming_events')
        .select('organization_id, title')
        .eq('id', eventId)
        .single();

      const { error } = await this.supabase
        .from('programming_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      if (event) {
        await this.logActivity(event.organization_id, userId, 'delete', eventId, {
          title: event.title
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(eventIds: string[], status: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('programming_events')
        .update({ status, updated_by: userId })
        .in('id', eventIds);

      if (error) throw error;

      // Log bulk activity
      for (const eventId of eventIds) {
        await this.logActivity('', userId, 'bulk_update', eventId, { status });
      }
    } catch (error) {
      console.error('Error bulk updating events:', error);
      throw error;
    }
  }

  async duplicateEvent(eventId: string, userId: string, newTitle?: string): Promise<ProgrammingEvent> {
    try {
      const { data: originalEvent, error: fetchError } = await this.supabase
        .from('programming_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      const duplicateData = {
        ...originalEvent,
        id: undefined,
        title: newTitle || `${originalEvent.title} (Copy)`,
        status: 'draft',
        created_by: userId,
        updated_by: userId,
        created_at: undefined,
        updated_at: undefined
      };

      const { data, error } = await this.supabase
        .from('programming_events')
        .insert(duplicateData)
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(originalEvent.organization_id, userId, 'duplicate', data.id, {
        original_event_id: eventId,
        title: data.title
      });

      return data;
    } catch (error) {
      console.error('Error duplicating event:', error);
      throw error;
    }
  }

  async getEventsByDateRange(orgId: string, startDate: string, endDate: string): Promise<ProgrammingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('programming_events')
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .eq('organization_id', orgId)
        .gte('start_at', startDate)
        .lte('start_at', endDate)
        .order('start_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events by date range:', error);
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
          resource_type: 'programming_event',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const eventsService = new EventsService();
