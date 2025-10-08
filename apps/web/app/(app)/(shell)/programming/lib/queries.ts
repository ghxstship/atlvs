/**
 * Programming Module Database Queries
 * Handles all database read operations with optimized queries
 */
import { createClient } from '@/lib/supabase/server';
import type {
  ProgrammingEvent,
  Performance,
  CallSheet,
  Rider,
  Itinerary,
  Lineup,
  Space,
  Workshop,
  SearchFilters,
  SortOptions
} from '../types';

export class ProgrammingQueriesService {
  private supabase = createClient();

  // Events Queries
  async getEventsByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<ProgrammingEvent[]> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_date', startDate.toISOString())
      .lte('end_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getEventsByStatus(organizationId: string, status: ProgrammingEvent['status'][]): Promise<ProgrammingEvent[]> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select('*')
      .eq('organization_id', organizationId)
      .in('status', status)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUpcomingEvents(organizationId: string, limit: number = 10): Promise<ProgrammingEvent[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('programming_events')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_date', now)
      .in('status', ['scheduled', 'in-progress'])
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async searchEvents(organizationId: string, searchTerm: string, limit: number = 50): Promise<ProgrammingEvent[]> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getEventsWithPerformances(organizationId: string): Promise<(ProgrammingEvent & { performances: Performance[] })[]> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select(`
        *,
        performances (*)
      `)
      .eq('organization_id', organizationId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Performances Queries
  async getPerformancesByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<Performance[]> {
    const { data, error } = await this.supabase
      .from('performances')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPerformancesByVenue(organizationId: string, venue: string): Promise<Performance[]> {
    const { data, error } = await this.supabase
      .from('performances')
      .select('*')
      .eq('organization_id', organizationId)
      .ilike('venue', `%${venue}%`)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPerformancesByStatus(organizationId: string, status: Performance['status'][]): Promise<Performance[]> {
    const { data, error } = await this.supabase
      .from('performances')
      .select('*')
      .eq('organization_id', organizationId)
      .in('status', status)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Call Sheets Queries
  async getCallSheetsForEvent(organizationId: string, eventId: string): Promise<CallSheet[]> {
    const { data, error } = await this.supabase
      .from('call_sheets')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('event_id', eventId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getCallSheetsByDate(organizationId: string, date: Date): Promise<CallSheet[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await this.supabase
      .from('call_sheets')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())
      .order('call_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Riders Queries
  async getActiveRiders(organizationId: string): Promise<Rider[]> {
    const { data, error } = await this.supabase
      .from('riders')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('type', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getRidersByType(organizationId: string, type: Rider['type']): Promise<Rider[]> {
    const { data, error } = await this.supabase
      .from('riders')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', type)
      .eq('status', 'active')
      .order('title', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Itineraries Queries
  async getItinerariesByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<Itinerary[]> {
    const { data, error } = await this.supabase
      .from('itineraries')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_date', startDate.toISOString())
      .lte('end_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getItineraryWithDetails(organizationId: string, itineraryId: string): Promise<Itinerary | null> {
    const { data, error } = await this.supabase
      .from('itineraries')
      .select(`
        *,
        destinations,
        transportation,
        accommodations
      `)
      .eq('organization_id', organizationId)
      .eq('id', itineraryId)
      .single();

    if (error) throw error;
    return data;
  }

  // Lineups Queries
  async getLineupsForEvent(organizationId: string, eventId: string): Promise<Lineup[]> {
    const { data, error } = await this.supabase
      .from('lineups')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getLineupWithActs(organizationId: string, lineupId: string): Promise<Lineup | null> {
    const { data, error } = await this.supabase
      .from('lineups')
      .select(`
        *,
        acts,
        set_times
      `)
      .eq('organization_id', organizationId)
      .eq('id', lineupId)
      .single();

    if (error) throw error;
    return data;
  }

  // Spaces Queries
  async getAvailableSpaces(organizationId: string, date: Date, startTime: string, endTime: string): Promise<Space[]> {
    const dayOfWeek = date.getDay();

    const { data, error } = await this.supabase
      .from('spaces')
      .select(`
        *,
        availability
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .contains('availability', [{
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_available: true
      }]);

    if (error) throw error;
    return data || [];
  }

  async getSpacesByType(organizationId: string, type: Space['type']): Promise<Space[]> {
    const { data, error } = await this.supabase
      .from('spaces')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('type', type)
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Workshops Queries
  async getWorkshopsByDateRange(organizationId: string, startDate: Date, endDate: Date): Promise<Workshop[]> {
    const { data, error } = await this.supabase
      .from('workshops')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_date', startDate.toISOString())
      .lte('end_date', endDate.toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getWorkshopsByInstructor(organizationId: string, instructor: string): Promise<Workshop[]> {
    const { data, error } = await this.supabase
      .from('workshops')
      .select('*')
      .eq('organization_id', organizationId)
      .ilike('instructor', `%${instructor}%`)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Analytics and Reporting Queries
  async getEventStatistics(organizationId: string, dateRange?: { from: Date; to: Date }) {
    let query = this.supabase.rpc('get_programming_event_stats', {
      p_organization_id: organizationId
    });

    if (dateRange) {
      query = this.supabase.rpc('get_programming_event_stats', {
        p_organization_id: organizationId,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString()
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getPerformanceStatistics(organizationId: string, dateRange?: { from: Date; to: Date }) {
    let query = this.supabase.rpc('get_programming_performance_stats', {
      p_organization_id: organizationId
    });

    if (dateRange) {
      query = this.supabase.rpc('get_programming_performance_stats', {
        p_organization_id: organizationId,
        p_date_from: dateRange.from.toISOString(),
        p_date_to: dateRange.to.toISOString()
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Complex multi-table queries
  async getEventsWithFullDetails(organizationId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .select(`
        *,
        performances (*),
        call_sheets (*),
        lineups (*)
      `)
      .eq('organization_id', organizationId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getVenueUtilization(organizationId: string, dateRange: { from: Date; to: Date }) {
    const { data, error } = await this.supabase.rpc('get_venue_utilization', {
      p_organization_id: organizationId,
      p_date_from: dateRange.from.toISOString(),
      p_date_to: dateRange.to.toISOString()
    });

    if (error) throw error;
    return data;
  }
}

export const programmingQueries = new ProgrammingQueriesService();
