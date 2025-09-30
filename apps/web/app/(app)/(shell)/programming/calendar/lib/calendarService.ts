import { createBrowserClient } from '@ghxstship/auth';
import type { ProgrammingEvent } from '../types';

export class CalendarService {
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
        query = query.ilike('title', `%${filters.search}%`);
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

      // Log activity
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

      // Log activity
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
      // Get event details for logging
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

      // Log activity
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

  async getEventById(eventId: string): Promise<ProgrammingEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('programming_events')
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  async getEventStats(orgId: string): Promise<{
    totalEvents: number;
    draftEvents: number;
    scheduledEvents: number;
    completedEvents: number;
    upcomingEvents: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_events')
        .select('status, start_at')
        .eq('organization_id', orgId);

      if (error) throw error;

      const now = new Date().toISOString();
      const stats = {
        totalEvents: data.length,
        draftEvents: data.filter(e => e.status === 'draft').length,
        scheduledEvents: data.filter(e => e.status === 'scheduled').length,
        completedEvents: data.filter(e => e.status === 'completed').length,
        upcomingEvents: data.filter(e => e.start_at > now && e.status !== 'cancelled').length
      };

      return stats;
    } catch (error) {
      console.error('Error fetching event stats:', error);
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
      // Don't throw - activity logging shouldn't break the main operation
    }
  }
}

export const calendarService = new CalendarService();
