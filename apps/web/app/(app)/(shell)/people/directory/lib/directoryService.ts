import { createBrowserClient } from '@ghxstship/auth';
import type { Person, PersonFilters, PersonSort, CreatePersonData, UpdatePersonData, PersonStats } from '../types';

export class DirectoryService {
  private supabase = createBrowserClient();

  async getPeople(orgId: string, filters?: PersonFilters, sorts?: PersonSort[]): Promise<Person[]> {
    let query = this.supabase
      .from('people')
      .select('*')
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.location) {
      query = query.eq('location', filters.location);
    }
    if (filters?.hire_date_from) {
      query = query.gte('hire_date', filters.hire_date_from);
    }
    if (filters?.hire_date_to) {
      query = query.lte('hire_date', filters.hire_date_to);
    }

    // Apply sorting
    if (sorts && sorts.length > 0) {
      const sort = sorts[0];
      query = query.order(sort.field as string, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('first_name', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getPerson(id: string, orgId: string): Promise<Person | null> {
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createPerson(orgId: string, data: CreatePersonData): Promise<Person> {
    const { status: payloadStatus = 'active', ...rest } = data;
    const { data: person, error } = await this.supabase
      .from('people')
      .insert({
        ...rest,
        organization_id: orgId,
        status: payloadStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return person;
  }

  async updatePerson(id: string, orgId: string, data: UpdatePersonData): Promise<Person> {
    const { status: payloadStatus, ...rest } = data;
    const { data: person, error } = await this.supabase
      .from('people')
      .update({
        ...rest,
        ...(payloadStatus ? { status: payloadStatus } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw error;
    return person;
  }

  async deletePerson(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('people')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async searchPeople(orgId: string, query: string): Promise<Person[]> {
    const { data, error } = await this.supabase
      .from('people')
      .select('*')
      .eq('organization_id', orgId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,role.ilike.%${query}%,department.ilike.%${query}%`)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPeopleStats(orgId: string): Promise<PersonStats> {
    const { data, error } = await this.supabase
      .from('people')
      .select('status, department, role, location')
      .eq('organization_id', orgId);

    if (error) throw error;

    const stats: PersonStats = {
      total: data.length,
      active: data.filter(p => p.status === 'active').length,
      inactive: data.filter(p => p.status === 'inactive').length,
      terminated: data.filter(p => p.status === 'terminated').length,
      by_department: {},
      by_role: {},
      by_location: {}
    };

    data.forEach(person => {
      if (person.department) {
        stats.by_department[person.department] = (stats.by_department[person.department] || 0) + 1;
      }
      if (person.role) {
        stats.by_role[person.role] = (stats.by_role[person.role] || 0) + 1;
      }
      if (person.location) {
        stats.by_location[person.location] = (stats.by_location[person.location] || 0) + 1;
      }
    });

    return stats;
  }

  async bulkUpdateStatus(ids: string[], orgId: string, status: Person['status']): Promise<void> {
    const { error } = await this.supabase
      .from('people')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async bulkDelete(ids: string[], orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('people')
      .delete()
      .in('id', ids)
      .eq('organization_id', orgId);

    if (error) throw error;
  }
}

const directoryService = new DirectoryService();

export default directoryService;
