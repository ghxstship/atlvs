import { createBrowserClient } from '@ghxstship/auth';
import type { Assignment, AssignmentFilters, AssignmentSort, CreateAssignmentData, UpdateAssignmentData } from '../types';

export class AssignmentService {
  private supabase = createBrowserClient();

  async getAssignments(orgId: string, filters?: AssignmentFilters, sorts?: AssignmentSort[]): Promise<Assignment[]> {
    let query = this.supabase
      .from('manning_slots')
      .select(`
        *,
        project:projects(name, status)
      `)
      .eq('organization_id', orgId);

    // Apply filters
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.department) {
      query = query.eq('department', filters.department);
    }
    if (filters?.role) {
      query = query.ilike('role', `%${filters.role}%`);
    }

    // Apply sorting
    if (sorts && sorts.length > 0) {
      const sort = sorts[0];
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getAssignment(id: string, orgId: string): Promise<Assignment | null> {
    const { data, error } = await this.supabase
      .from('manning_slots')
      .select(`
        *,
        project:projects(name, status)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  async createAssignment(orgId: string, data: CreateAssignmentData): Promise<Assignment> {
    const { data: assignment, error } = await this.supabase
      .from('manning_slots')
      .insert({
        ...data,
        organization_id: orgId,
        filled_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        project:projects(name, status)
      `)
      .single();

    if (error) throw error;
    return assignment;
  }

  async updateAssignment(id: string, orgId: string, data: UpdateAssignmentData): Promise<Assignment> {
    const { data: assignment, error } = await this.supabase
      .from('manning_slots')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select(`
        *,
        project:projects(name, status)
      `)
      .single();

    if (error) throw error;
    return assignment;
  }

  async deleteAssignment(id: string, orgId: string): Promise<void> {
    const { error } = await this.supabase
      .from('manning_slots')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) throw error;
  }

  async searchAssignments(orgId: string, query: string): Promise<Assignment[]> {
    const { data, error } = await this.supabase
      .from('manning_slots')
      .select(`
        *,
        project:projects(name, status)
      `)
      .eq('organization_id', orgId)
      .or(`role.ilike.%${query}%,department.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAssignmentStats(orgId: string): Promise<unknown> {
    const { data, error } = await this.supabase
      .from('manning_slots')
      .select('department, role, required_count, filled_count')
      .eq('organization_id', orgId);

    if (error) throw error;

    const stats = {
      total: data.length,
      open: data.filter(a => a.filled_count < a.required_count).length,
      filled: data.filter(a => a.filled_count >= a.required_count).length,
      closed: 0,
      by_department: {} as Record<string, number>,
      by_role: {} as Record<string, number>
    };

    data.forEach(assignment => {
      if (assignment.department) {
        stats.by_department[assignment.department] = (stats.by_department[assignment.department] || 0) + 1;
      }
      if (assignment.role) {
        stats.by_role[assignment.role] = (stats.by_role[assignment.role] || 0) + 1;
      }
    });

    return stats;
  }
}
