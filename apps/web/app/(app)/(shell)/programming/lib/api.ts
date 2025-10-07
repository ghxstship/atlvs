/**
 * Programming Module API Service
 * Handles all HTTP communication with the backend
 */
import { createClient } from '@/lib/supabase/client';
import type {
  ProgrammingEvent,
  Performance,
  CallSheet,
  Rider,
  Itinerary,
  Lineup,
  Space,
  Workshop,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
  SortOptions,
  CreateEventForm,
  UpdateEventForm,
  BulkActionRequest,
  ExportOptions,
  ImportResult,
  PermissionCheck,
  PermissionResult,
} from '../types';

export class ProgrammingApiService {
  private supabase = createClient();

  // Events API
  async getEvents(
    organizationId: string,
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'start_date', direction: 'desc' },
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<ProgrammingEvent>> {
    const offset = (pagination.page - 1) * pagination.limit;

    let query = this.supabase
      .from('programming_events')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters.type?.length) {
      query = query.in('type', filters.type);
    }

    if (filters.date_from) {
      query = query.gte('start_date', filters.date_from.toISOString());
    }

    if (filters.date_to) {
      query = query.lte('end_date', filters.date_to.toISOString());
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.capacity_min) {
      query = query.gte('capacity', filters.capacity_min);
    }

    if (filters.capacity_max) {
      query = query.lte('capacity', filters.capacity_max);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pagination.limit),
      },
    };
  }

  async getEvent(id: string, organizationId: string): Promise<ProgrammingEvent> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error) throw error;
    return data;
  }

  async createEvent(eventData: CreateEventForm, organizationId: string, userId: string): Promise<ProgrammingEvent> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .insert({
        ...eventData,
        organization_id: organizationId,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(eventData: UpdateEventForm, organizationId: string, userId: string): Promise<ProgrammingEvent> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .update({
        ...eventData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventData.id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('programming_events')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async bulkUpdateEvents(request: BulkActionRequest, organizationId: string, userId: string): Promise<ProgrammingEvent[]> {
    const { ids, action, data } = request;

    if (action === 'delete') {
      const { error } = await this.supabase
        .from('programming_events')
        .delete()
        .in('id', ids)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return [];
    }

    if (action === 'update_status' && data?.status) {
      const { data: updatedData, error } = await this.supabase
        .from('programming_events')
        .update({
          status: data.status,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .eq('organization_id', organizationId)
        .select();

      if (error) throw error;
      return updatedData || [];
    }

    throw new Error(`Unsupported bulk action: ${action}`);
  }

  // Similar methods for other entities (Performances, CallSheets, etc.)
  // Implementation would follow the same pattern as Events API

  async getPerformances(organizationId: string, filters: SearchFilters = {}, sort: SortOptions = { field: 'date', direction: 'desc' }, pagination: { page: number; limit: number } = { page: 1, limit: 20 }): Promise<PaginatedResponse<Performance>> {
    const offset = (pagination.page - 1) * pagination.limit;

    let query = this.supabase
      .from('performances')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Apply filters (similar to events)
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,venue.ilike.%${filters.search}%`);
    }

    if (filters.status?.length) {
      query = query.in('status', filters.status);
    }

    if (filters.date_from) {
      query = query.gte('date', filters.date_from.toISOString());
    }

    if (filters.date_to) {
      query = query.lte('date', filters.date_to.toISOString());
    }

    query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    query = query.range(offset, offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / pagination.limit),
      },
    };
  }

  // Export/Import API
  async exportEvents(options: ExportOptions, organizationId: string): Promise<Blob> {
    const { data, error } = await this.supabase.functions.invoke('export-programming-events', {
      body: { options, organizationId },
    });

    if (error) throw error;

    // Convert response to blob based on format
    const contentType = options.format === 'csv' ? 'text/csv' :
                       options.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       options.format === 'json' ? 'application/json' : 'application/pdf';

    return new Blob([data], { type: contentType });
  }

  async importEvents(file: File, organizationId: string, userId: string): Promise<ImportResult> {
    const { data, error } = await this.supabase.functions.invoke('import-programming-events', {
      body: { file: await file.arrayBuffer(), organizationId, userId },
    });

    if (error) throw error;
    return data as ImportResult;
  }

  // Permission checks
  async checkPermission(permission: PermissionCheck): Promise<PermissionResult> {
    const { data, error } = await this.supabase.rpc('check_programming_permission', {
      p_action: permission.action,
      p_entity: permission.entity,
      p_resource_id: permission.resource_id,
      p_user_id: permission.user_id,
      p_organization_id: permission.organization_id,
    });

    if (error) throw error;
    return data as PermissionResult;
  }

  // Statistics and analytics
  async getStatistics(organizationId: string, dateRange?: { from: Date; to: Date }) {
    const { data, error } = await this.supabase.rpc('get_programming_statistics', {
      p_organization_id: organizationId,
      p_date_from: dateRange?.from?.toISOString(),
      p_date_to: dateRange?.to?.toISOString(),
    });

    if (error) throw error;
    return data;
  }
}

export const programmingApi = new ProgrammingApiService();
