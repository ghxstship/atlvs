import { createBrowserClient } from '@ghxstship/auth';

export interface Itinerary {
  id: string;
  organization_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  participants?: string[] | null;
  itinerary_items: ItineraryItem[];
  total_cost?: number | null;
  currency?: string | null;
  notes?: string | null;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ItineraryItem {
  id: string;
  type: 'travel' | 'accommodation' | 'meal' | 'meeting' | 'event' | 'activity' | 'other';
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
  address?: string | null;
  contact_info?: unknown;
  cost?: number | null;
  booking_reference?: string | null;
  confirmation_status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string | null;
  order_index: number;
}

export class ItinerariesService {
  private supabase = createBrowserClient();

  async getItineraries(orgId: string, filters?: {
    projectId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    participants?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Itinerary[]; count: number }> {
    try {
      let query = this.supabase
        .from('programming_itineraries')
        .select(`
          *,
          project:projects(id, name, status)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('start_date', { ascending: true });

      if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }
      if (filters?.participants && filters.participants.length > 0) {
        query = query.overlaps('participants', filters.participants);
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
      console.error('Error fetching itineraries:', error);
      throw error;
    }
  }

  async createItinerary(orgId: string, userId: string, itineraryData: Partial<Itinerary>): Promise<Itinerary> {
    try {
      const { data, error } = await this.supabase
        .from('programming_itineraries')
        .insert({
          ...itineraryData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          status: itineraryData.status || 'draft',
          participants: itineraryData.participants || [],
          itinerary_items: itineraryData.itinerary_items || [],
          currency: itineraryData.currency || 'USD',
          metadata: itineraryData.metadata || {}
        })
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date
      });

      return data;
    } catch (error) {
      console.error('Error creating itinerary:', error);
      throw error;
    }
  }

  async updateItinerary(itineraryId: string, userId: string, itineraryData: Partial<Itinerary>): Promise<Itinerary> {
    try {
      const { data, error } = await this.supabase
        .from('programming_itineraries')
        .update({
          ...itineraryData,
          updated_by: userId
        })
        .eq('id', itineraryId)
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', itineraryId, {
        title: data.title,
        changes: Object.keys(itineraryData)
      });

      return data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  }

  async deleteItinerary(itineraryId: string, userId: string): Promise<void> {
    try {
      const { data: itinerary } = await this.supabase
        .from('programming_itineraries')
        .select('organization_id, title')
        .eq('id', itineraryId)
        .single();

      const { error } = await this.supabase
        .from('programming_itineraries')
        .delete()
        .eq('id', itineraryId);

      if (error) throw error;

      if (itinerary) {
        await this.logActivity(itinerary.organization_id, userId, 'delete', itineraryId, {
          title: itinerary.title
        });
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  }

  async addItemToItinerary(itineraryId: string, item: Omit<ItineraryItem, 'id'>, userId: string): Promise<Itinerary> {
    try {
      const { data: currentItinerary, error: fetchError } = await this.supabase
        .from('programming_itineraries')
        .select('itinerary_items, total_cost')
        .eq('id', itineraryId)
        .single();

      if (fetchError) throw fetchError;

      const newItem: ItineraryItem = {
        ...item,
        id: crypto.randomUUID()
      };

      const updatedItems = [...(currentItinerary.itinerary_items || []), newItem];
      const updatedTotalCost = this.calculateTotalCost(updatedItems);

      return await this.updateItinerary(itineraryId, userId, {
        itinerary_items: updatedItems,
        total_cost: updatedTotalCost
      });
    } catch (error) {
      console.error('Error adding item to itinerary:', error);
      throw error;
    }
  }

  async removeItemFromItinerary(itineraryId: string, itemId: string, userId: string): Promise<Itinerary> {
    try {
      const { data: currentItinerary, error: fetchError } = await this.supabase
        .from('programming_itineraries')
        .select('itinerary_items')
        .eq('id', itineraryId)
        .single();

      if (fetchError) throw fetchError;

      const updatedItems = (currentItinerary.itinerary_items || []).filter(
        (item: ItineraryItem) => item.id !== itemId
      );
      const updatedTotalCost = this.calculateTotalCost(updatedItems);

      return await this.updateItinerary(itineraryId, userId, {
        itinerary_items: updatedItems,
        total_cost: updatedTotalCost
      });
    } catch (error) {
      console.error('Error removing item from itinerary:', error);
      throw error;
    }
  }

  async updateItemInItinerary(itineraryId: string, itemId: string, itemData: Partial<ItineraryItem>, userId: string): Promise<Itinerary> {
    try {
      const { data: currentItinerary, error: fetchError } = await this.supabase
        .from('programming_itineraries')
        .select('itinerary_items')
        .eq('id', itineraryId)
        .single();

      if (fetchError) throw fetchError;

      const updatedItems = (currentItinerary.itinerary_items || []).map((item: ItineraryItem) =>
        item.id === itemId ? { ...item, ...itemData } : item
      );
      const updatedTotalCost = this.calculateTotalCost(updatedItems);

      return await this.updateItinerary(itineraryId, userId, {
        itinerary_items: updatedItems,
        total_cost: updatedTotalCost
      });
    } catch (error) {
      console.error('Error updating item in itinerary:', error);
      throw error;
    }
  }

  async confirmItinerary(itineraryId: string, userId: string): Promise<Itinerary> {
    try {
      return await this.updateItinerary(itineraryId, userId, {
        status: 'confirmed'
      });
    } catch (error) {
      console.error('Error confirming itinerary:', error);
      throw error;
    }
  }

  async getItineraryStats(orgId: string): Promise<{
    totalItineraries: number;
    confirmedItineraries: number;
    draftItineraries: number;
    inProgressItineraries: number;
    totalCost: number;
    averageCost: number;
    itemTypeBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('programming_itineraries')
        .select('status, total_cost, itinerary_items')
        .eq('organization_id', orgId);

      if (error) throw error;

      const costs = data.filter(i => i.total_cost).map(i => i.total_cost);
      const itemTypeBreakdown: Record<string, number> = {};

      data.forEach(itinerary => {
        const items = itinerary.itinerary_items || [];
        items.forEach((item: ItineraryItem) => {
          if (item.type) {
            itemTypeBreakdown[item.type] = (itemTypeBreakdown[item.type] || 0) + 1;
          }
        });
      });

      const stats = {
        totalItineraries: data.length,
        confirmedItineraries: data.filter(i => i.status === 'confirmed').length,
        draftItineraries: data.filter(i => i.status === 'draft').length,
        inProgressItineraries: data.filter(i => i.status === 'in_progress').length,
        totalCost: costs.reduce((sum, cost) => sum + cost, 0),
        averageCost: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
        itemTypeBreakdown
      };

      return stats;
    } catch (error) {
      console.error('Error fetching itinerary stats:', error);
      throw error;
    }
  }

  private calculateTotalCost(items: ItineraryItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.cost || 0);
    }, 0);
  }

  private async logActivity(orgId: string, userId: string, action: string, resourceId: string, details: unknown): Promise<void> {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          organization_id: orgId,
          user_id: userId,
          resource_type: 'programming_itinerary',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const itinerariesService = new ItinerariesService();
