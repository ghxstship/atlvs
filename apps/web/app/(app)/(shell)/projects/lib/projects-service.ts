/**
 * Projects Service Layer
 * Centralized business logic for Projects module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  budget?: number;
  actual_cost?: number;
  progress?: number;
  client?: string;
  project_manager?: string;
  team_members?: string[];
  created_at: string;
  updated_at: string;
}

export class ProjectsService {
  private supabase = createBrowserClient();

  /**
   * Get all projects for organization
   */
  async getProjects(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<{ items: Project[]; total: number }> {
    try {
      let query = this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,client.ilike.%${options.search}%`);
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
        items: (data as Project[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Get single project by ID
   */
  async getProject(projectId: string, organizationId: string): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  /**
   * Create new project
   */
  async createProject(organizationId: string, project: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          ...project,
          organization_id: organizationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, organizationId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    totalSpent: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('id, status, budget, actual_cost')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        totalProjects: data?.length || 0,
        activeProjects: data?.filter(p => p.status === 'active').length || 0,
        completedProjects: data?.filter(p => p.status === 'completed').length || 0,
        totalBudget: data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
        totalSpent: data?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        totalSpent: 0
      };
    }
  }
}

export const projectsService = new ProjectsService();
