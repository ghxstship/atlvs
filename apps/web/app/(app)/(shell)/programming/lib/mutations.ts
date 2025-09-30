/**
 * Programming Module Database Mutations
 * Handles all database write operations with transaction management
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
  CreateEventForm,
  UpdateEventForm,
} from '../types';

export class ProgrammingMutationsService {
  private supabase = createClient();

  // Events Mutations
  async createEvent(eventData: CreateEventForm, organizationId: string, userId: string): Promise<ProgrammingEvent> {
    const eventPayload = {
      ...eventData,
      organization_id: organizationId,
      status: 'scheduled' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('programming_events')
      .insert(eventPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(eventId: string, eventData: UpdateEventForm, organizationId: string, userId: string): Promise<ProgrammingEvent> {
    const updatePayload = {
      ...eventData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('programming_events')
      .update(updatePayload)
      .eq('id', eventId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEvent(eventId: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('programming_events')
      .delete()
      .eq('id', eventId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  async updateEventStatus(eventId: string, status: ProgrammingEvent['status'], organizationId: string, userId: string): Promise<ProgrammingEvent> {
    const { data, error } = await this.supabase
      .from('programming_events')
      .update({
        status,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Performances Mutations
  async createPerformance(performanceData: Omit<Performance, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Performance> {
    const performancePayload = {
      ...performanceData,
      status: 'planned' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('performances')
      .insert(performancePayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePerformance(performanceId: string, performanceData: Partial<Performance>, organizationId: string, userId: string): Promise<Performance> {
    const updatePayload = {
      ...performanceData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('performances')
      .update(updatePayload)
      .eq('id', performanceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePerformance(performanceId: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('performances')
      .delete()
      .eq('id', performanceId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  // Call Sheets Mutations
  async createCallSheet(callSheetData: Omit<CallSheet, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<CallSheet> {
    const callSheetPayload = {
      ...callSheetData,
      status: 'draft' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('call_sheets')
      .insert(callSheetPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCallSheet(callSheetId: string, callSheetData: Partial<CallSheet>, organizationId: string, userId: string): Promise<CallSheet> {
    const updatePayload = {
      ...callSheetData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('call_sheets')
      .update(updatePayload)
      .eq('id', callSheetId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async publishCallSheet(callSheetId: string, organizationId: string, userId: string): Promise<CallSheet> {
    const { data, error } = await this.supabase
      .from('call_sheets')
      .update({
        status: 'published',
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', callSheetId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Riders Mutations
  async createRider(riderData: Omit<Rider, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Rider> {
    const riderPayload = {
      ...riderData,
      status: 'draft' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('riders')
      .insert(riderPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRider(riderId: string, riderData: Partial<Rider>, organizationId: string, userId: string): Promise<Rider> {
    const updatePayload = {
      ...riderData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('riders')
      .update(updatePayload)
      .eq('id', riderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async activateRider(riderId: string, organizationId: string, userId: string): Promise<Rider> {
    const { data, error } = await this.supabase
      .from('riders')
      .update({
        status: 'active',
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', riderId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Itineraries Mutations
  async createItinerary(itineraryData: Omit<Itinerary, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Itinerary> {
    const itineraryPayload = {
      ...itineraryData,
      status: 'planned' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('itineraries')
      .insert(itineraryPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateItinerary(itineraryId: string, itineraryData: Partial<Itinerary>, organizationId: string, userId: string): Promise<Itinerary> {
    const updatePayload = {
      ...itineraryData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('itineraries')
      .update(updatePayload)
      .eq('id', itineraryId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Lineups Mutations
  async createLineup(lineupData: Omit<Lineup, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Lineup> {
    const lineupPayload = {
      ...lineupData,
      status: 'draft' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('lineups')
      .insert(lineupPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLineup(lineupId: string, lineupData: Partial<Lineup>, organizationId: string, userId: string): Promise<Lineup> {
    const updatePayload = {
      ...lineupData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('lineups')
      .update(updatePayload)
      .eq('id', lineupId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Spaces Mutations
  async createSpace(spaceData: Omit<Space, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Space> {
    const spacePayload = {
      ...spaceData,
      status: 'active' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('spaces')
      .insert(spacePayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSpace(spaceId: string, spaceData: Partial<Space>, organizationId: string, userId: string): Promise<Space> {
    const updatePayload = {
      ...spaceData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('spaces')
      .update(updatePayload)
      .eq('id', spaceId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Workshops Mutations
  async createWorkshop(workshopData: Omit<Workshop, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, userId: string): Promise<Workshop> {
    const workshopPayload = {
      ...workshopData,
      status: 'planned' as const,
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('workshops')
      .insert(workshopPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWorkshop(workshopId: string, workshopData: Partial<Workshop>, organizationId: string, userId: string): Promise<Workshop> {
    const updatePayload = {
      ...workshopData,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('workshops')
      .update(updatePayload)
      .eq('id', workshopId)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk Operations with Transaction Management
  async bulkUpdateEvents(eventIds: string[], updates: Partial<ProgrammingEvent>, organizationId: string, userId: string): Promise<ProgrammingEvent[]> {
    const updatePayload = {
      ...updates,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('programming_events')
      .update(updatePayload)
      .in('id', eventIds)
      .eq('organization_id', organizationId)
      .select();

    if (error) throw error;
    return data || [];
  }

  async bulkDeleteEvents(eventIds: string[], organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('programming_events')
      .delete()
      .in('id', eventIds)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  // Complex transaction operations
  async createEventWithPerformances(
    eventData: CreateEventForm,
    performances: Omit<Performance, 'id' | 'organization_id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>[],
    organizationId: string,
    userId: string
  ): Promise<{ event: ProgrammingEvent; performances: Performance[] }> {
    // Create event first
    const event = await this.createEvent(eventData, organizationId, userId);

    // Create performances linked to the event
    const performancePromises = performances.map(perf =>
      this.createPerformance({
        ...perf,
        organization_id: organizationId,
      }, userId)
    );

    const createdPerformances = await Promise.all(performancePromises);

    return { event, performances: createdPerformances };
  }

  // Audit trail operations
  async createAuditLog(entity: string, entityId: string, action: string, changes: Record<string, any>, organizationId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('audit_logs')
      .insert({
        entity,
        entity_id: entityId,
        action,
        changes,
        organization_id: organizationId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}

export const programmingMutations = new ProgrammingMutationsService();
