import { createBrowserClient } from '@ghxstship/auth';

export interface Space {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  kind: 'room' | 'green_room' | 'dressing_room' | 'meeting_room' | 'classroom' | 'stage' | 'backstage' | 'storage' | 'office' | 'other';
  location?: string | null;
  capacity?: number | null;
  availability: 'available' | 'occupied' | 'maintenance' | 'reserved';
  amenities?: string[] | null;
  equipment?: string[] | null;
  accessibility_features?: string[] | null;
  hourly_rate?: number | null;
  currency?: string | null;
  booking_rules?: unknown;
  metadata?: unknown;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export class SpacesService {
  private supabase = createBrowserClient();

  async getSpaces(orgId: string, filters?: {
    kind?: string;
    availability?: string;
    location?: string;
    minCapacity?: number;
    maxCapacity?: number;
    amenities?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Space[]; count: number }> {
    try {
      let query = this.supabase
        .from('spaces')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId)
        .order('name', { ascending: true });

      if (filters?.kind) {
        query = query.eq('kind', filters.kind);
      }
      if (filters?.availability) {
        query = query.eq('availability', filters.availability);
      }
      if (filters?.location) {
        query = query.eq('location', filters.location);
      }
      if (filters?.minCapacity) {
        query = query.gte('capacity', filters.minCapacity);
      }
      if (filters?.maxCapacity) {
        query = query.lte('capacity', filters.maxCapacity);
      }
      if (filters?.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', filters.amenities);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.limit && filters?.offset !== undefined) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching spaces:', error);
      throw error;
    }
  }

  async createSpace(orgId: string, userId: string, spaceData: Partial<Space>): Promise<Space> {
    try {
      const { data, error } = await this.supabase
        .from('spaces')
        .insert({
          ...spaceData,
          organization_id: orgId,
          created_by: userId,
          updated_by: userId,
          availability: spaceData.availability || 'available',
          amenities: spaceData.amenities || [],
          equipment: spaceData.equipment || [],
          accessibility_features: spaceData.accessibility_features || [],
          currency: spaceData.currency || 'USD',
          booking_rules: spaceData.booking_rules || {},
          metadata: spaceData.metadata || {}
        })
        .select('*')
        .single();

      if (error) throw error;

      await this.logActivity(orgId, userId, 'create', data.id, {
        name: data.name,
        kind: data.kind,
        capacity: data.capacity
      });

      return data;
    } catch (error) {
      console.error('Error creating space:', error);
      throw error;
    }
  }

  async updateSpace(spaceId: string, userId: string, spaceData: Partial<Space>): Promise<Space> {
    try {
      const { data, error } = await this.supabase
        .from('spaces')
        .update({
          ...spaceData,
          updated_by: userId
        })
        .eq('id', spaceId)
        .select('*')
        .single();

      if (error) throw error;

      await this.logActivity(data.organization_id, userId, 'update', spaceId, {
        name: data.name,
        changes: Object.keys(spaceData)
      });

      return data;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
  }

  async deleteSpace(spaceId: string, userId: string): Promise<void> {
    try {
      const { data: space } = await this.supabase
        .from('spaces')
        .select('organization_id, name')
        .eq('id', spaceId)
        .single();

      const { error } = await this.supabase
        .from('spaces')
        .delete()
        .eq('id', spaceId);

      if (error) throw error;

      if (space) {
        await this.logActivity(space.organization_id, userId, 'delete', spaceId, {
          name: space.name
        });
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
  }

  async updateAvailability(spaceId: string, availability: Space['availability'], userId: string): Promise<Space> {
    try {
      return await this.updateSpace(spaceId, userId, { availability });
    } catch (error) {
      console.error('Error updating space availability:', error);
      throw error;
    }
  }

  async getSpaceStats(orgId: string): Promise<{
    totalSpaces: number;
    availableSpaces: number;
    occupiedSpaces: number;
    maintenanceSpaces: number;
    totalCapacity: number;
    averageCapacity: number;
    kindBreakdown: Record<string, number>;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('spaces')
        .select('availability, capacity, kind')
        .eq('organization_id', orgId);

      if (error) throw error;

      const capacities = data.filter(s => s.capacity).map(s => s.capacity);
      const kindBreakdown: Record<string, number> = {};
      
      data.forEach(space => {
        if (space.kind) {
          kindBreakdown[space.kind] = (kindBreakdown[space.kind] || 0) + 1;
        }
      });

      const stats = {
        totalSpaces: data.length,
        availableSpaces: data.filter(s => s.availability === 'available').length,
        occupiedSpaces: data.filter(s => s.availability === 'occupied').length,
        maintenanceSpaces: data.filter(s => s.availability === 'maintenance').length,
        totalCapacity: capacities.reduce((sum, cap) => sum + cap, 0),
        averageCapacity: capacities.length > 0 ? capacities.reduce((a, b) => a + b, 0) / capacities.length : 0,
        kindBreakdown
      };

      return stats;
    } catch (error) {
      console.error('Error fetching space stats:', error);
      throw error;
    }
  }

  async getAvailableSpaces(orgId: string, requiredCapacity?: number): Promise<Space[]> {
    try {
      let query = this.supabase
        .from('spaces')
        .select('*')
        .eq('organization_id', orgId)
        .eq('availability', 'available')
        .order('capacity', { ascending: false });

      if (requiredCapacity) {
        query = query.gte('capacity', requiredCapacity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available spaces:', error);
      throw error;
    }
  }

  async getSpacesByKind(orgId: string, kind: Space['kind']): Promise<Space[]> {
    try {
      const { data, error } = await this.supabase
        .from('spaces')
        .select('*')
        .eq('organization_id', orgId)
        .eq('kind', kind)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching spaces by kind:', error);
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
          resource_type: 'space',
          resource_id: resourceId,
          action,
          details
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

export const spacesService = new SpacesService();
