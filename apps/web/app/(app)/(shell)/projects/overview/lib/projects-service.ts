// Projects Service Layer
// Business logic and data access for Projects module

import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Project, 
  CreateProjectData, 
  UpdateProjectData, 
  ApiResponse, 
  PaginatedResponse,
  FilterConfig,
  SortConfig 
} from '../types';

export class ProjectsService {
  private supabase = createBrowserClient();

  // Get all projects for an organization
  async getProjects(
    orgId: string,
    options?: {
      page?: number;
      perPage?: number;
      filters?: FilterConfig[];
      sort?: SortConfig;
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    try {
      let query = this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('organization_id', orgId);

      // Apply search
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply filters
      if (options?.filters) {
        options.filters.forEach(filter => {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(filter.field, filter.value);
              break;
            case 'neq':
              query = query.neq(filter.field, filter.value);
              break;
            case 'gt':
              query = query.gt(filter.field, filter.value);
              break;
            case 'gte':
              query = query.gte(filter.field, filter.value);
              break;
            case 'lt':
              query = query.lt(filter.field, filter.value);
              break;
            case 'lte':
              query = query.lte(filter.field, filter.value);
              break;
            case 'like':
              query = query.ilike(filter.field, `%${filter.value}%`);
              break;
            case 'in':
              query = query.in(filter.field, filter.value);
              break;
          }
        });
      }

      // Apply sorting
      if (options?.sort) {
        query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const page = options?.page || 1;
      const perPage = options?.perPage || 50;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          data: data || [],
          total: count || 0,
          page,
          per_page: perPage,
          total_pages: Math.ceil((count || 0) / perPage),
        }
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get a single project by ID
  async getProject(id: string, orgId: string): Promise<ApiResponse<Project>>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a new project
  async createProject(
    projectData: CreateProjectData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Project>>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...projectData,
          organization_id: orgId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'projects.create', 'project', data.id, {
        name: data.name,
        status: data.status,
        priority: data.priority,
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update an existing project
  async updateProject(
    projectData: UpdateProjectData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Project>>> {
    try {
      const { id, ...updateData } = projectData;

      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'projects.update', 'project', id, {
        updated_fields: Object.keys(updateData),
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a project
  async deleteProject(
    id: string,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<boolean>>> {
    try {
      // Get project name for audit log
      const { data: project } = await this.supabase
        .from('projects')
        .select('name')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'projects.delete', 'project', id, {
        name: project?.name || 'Unknown',
      });

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get project statistics
  async getProjectStats(orgId: string): Promise<ApiResponse<{
    total: number;
    active: number;
    completed: number;
    planning: number;
    on_hold: number;
    cancelled: number;
    totalBudget: number;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('status, budget')
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      const stats = data.reduce((acc, project) => {
        acc.total++;
        acc[project.status as keyof typeof acc]++;
        acc.totalBudget += project.budget || 0;
        return acc;
      }, {
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        on_hold: 0,
        cancelled: 0,
        totalBudget: 0,
      });

      return { data: stats };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Subscribe to real-time project changes
  subscribeToProjects(
    orgId: string,
    callback: (payload: unknown) => void
  ) {
    return this.supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `organization_id=eq.${orgId}`,
        },
        callback
      )
      .subscribe();
  }

  // Bulk operations
  async bulkUpdateProjects(
    projectIds: string[],
    updateData: Partial<Project>,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Project[]>>> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .in('id', projectIds)
        .eq('organization_id', orgId)
        .select();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail for bulk operation
      await this.logActivity(orgId, userId, 'projects.bulk_update', 'project', null, {
        project_ids: projectIds,
        updated_fields: Object.keys(updateData),
        count: projectIds.length,
      });

      return { data: data || [] };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async bulkDeleteProjects(
    projectIds: string[],
    orgId: string,
    userId: string
  ): Promise<ApiResponse<boolean>>> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .in('id', projectIds)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail for bulk operation
      await this.logActivity(orgId, userId, 'projects.bulk_delete', 'project', null, {
        project_ids: projectIds,
        count: projectIds.length,
      });

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Export projects data
  async exportProjects(
    orgId: string,
    format: 'csv' | 'json',
    filters?: FilterConfig[]
  ): Promise<ApiResponse<string | object[]>>> {
    try {
      let query = this.supabase
        .from('projects')
        .select('*')
        .eq('organization_id', orgId);

      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          query = query.eq(filter.field, filter.value);
        });
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      if (format === 'json') {
        return { data };
      }

      // Convert to CSV
      if (!data || data.length === 0) {
        return { data: '' };
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );

      const csv = [headers, ...rows].join('\n');
      return { data: csv };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Private helper method for audit logging
  private async logActivity(
    orgId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string | null,
    details: Record<string, unknown>
  ) {
    try {
      await this.supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        occurred_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to log activity:', error);
    }
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
