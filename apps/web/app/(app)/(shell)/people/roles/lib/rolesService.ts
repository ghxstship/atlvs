import { createBrowserClient } from '@ghxstship/auth';
import type { Role, RoleFilters, RoleSort, CreateRoleData, UpdateRoleData } from '../types';

export class RolesService {
  private supabase = createBrowserClient();

  async getRoles(orgId: string, filters?: RoleFilters, sorts?: RoleSort[]): Promise<Role[]> {
    let query = this.supabase
      .from('people_roles')
      .select('*')
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.level) {
      query = query.eq('level', filters.level);
    }

    // Apply sorting
    if (sorts && sorts.length > 0) {
      const sort = sorts[0];
      query = query.order(sort.field as string, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getRole(id: string, orgId: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from('people_roles')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createRole(orgId: string, data: CreateRoleData): Promise<Role> {
    const { data: role, error } = await this.supabase
      .from('people_roles')
      .insert({
        ...data,
        organization_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;
    return role;
  }

  async updateRole(id: string, orgId: string, data: UpdateRoleData): Promise<Role> {
    const { data: role, error } = await this.supabase
      .from('people_roles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (error) throw error;
    return role;
  }

  async deleteRole(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('people_roles')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async searchRoles(orgId: string, query: string): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from('people_roles')
      .select('*')
      .eq('organization_id', orgId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getRoleStats(orgId: string): Promise<unknown> {
    const { data, error } = await this.supabase
      .from('people_roles')
      .select('level, department')
      .eq('organization_id', orgId);

    if (error) throw error;

    const stats = {
      total: data.length,
      by_level: {} as Record<string, number>,
      by_department: {} as Record<string, number>
    };

    data.forEach(role => {
      if (role.level) {
        stats.by_level[role.level] = (stats.by_level[role.level] || 0) + 1;
      }
      if (role.department) {
        stats.by_department[role.department] = (stats.by_department[role.department] || 0) + 1;
      }
    });

    return stats;
  }
}
