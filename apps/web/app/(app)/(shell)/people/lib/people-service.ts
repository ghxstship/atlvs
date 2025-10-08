/**
 * People Service Layer
 * Centralized business logic for People/Personnel module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface Person {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  hire_date?: string;
  termination_date?: string;
  avatar_url?: string;
  skills?: string[];
  certifications?: string[];
  created_at: string;
  updated_at: string;
}

export class PeopleService {
  private supabase = createBrowserClient();

  /**
   * Get all people for organization
   */
  async getPeople(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    department?: string;
    search?: string;
  }): Promise<{ items: Person[]; total: number }> {
    try {
      let query = this.supabase
        .from('people')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('last_name', { ascending: true });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.department) {
        query = query.eq('department', options.department);
      }

      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: (data as Person[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching people:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Get single person by ID
   */
  async getPerson(personId: string, organizationId: string): Promise<Person | null> {
    try {
      const { data, error } = await this.supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as Person;
    } catch (error) {
      console.error('Error fetching person:', error);
      return null;
    }
  }

  /**
   * Create new person
   */
  async createPerson(organizationId: string, person: Partial<Person>): Promise<Person | null> {
    try {
      const { data, error } = await this.supabase
        .from('people')
        .insert({
          ...person,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    } catch (error) {
      console.error('Error creating person:', error);
      return null;
    }
  }

  /**
   * Update person
   */
  async updatePerson(personId: string, organizationId: string, updates: Partial<Person>): Promise<Person | null> {
    try {
      const { data, error } = await this.supabase
        .from('people')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', personId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as Person;
    } catch (error) {
      console.error('Error updating person:', error);
      return null;
    }
  }

  /**
   * Delete person
   */
  async deletePerson(personId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('people')
        .delete()
        .eq('id', personId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting person:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalPeople: number;
    activePeople: number;
    departments: number;
    newHires: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('people')
        .select('id, status, department, hire_date')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats = {
        totalPeople: data?.length || 0,
        activePeople: data?.filter(p => p.status === 'active').length || 0,
        departments: new Set(data?.map(p => p.department).filter(Boolean)).size || 0,
        newHires: data?.filter(p => p.hire_date && new Date(p.hire_date) >= thirtyDaysAgo).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalPeople: 0,
        activePeople: 0,
        departments: 0,
        newHires: 0
      };
    }
  }
}

export const peopleService = new PeopleService();
