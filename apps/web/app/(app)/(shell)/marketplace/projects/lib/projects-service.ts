import { createClient } from '@ghxstship/auth/client';
import type { MarketplaceProject } from '../../types';
import type { ProjectFormData, ProjectStats, ProjectActivity, ProjectProposal } from '../types';

export class ProjectsService {
  private supabase = createClient();

  async getProjects(filters: unknown = {}): Promise<MarketplaceProject[]> {
    try {
      const response = await fetch('/api/v1/marketplace/projects');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      return data.projects || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<MarketplaceProject | null> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_projects')
        .select(`
          *,
          client:users(id, name, email),
          organization:organizations(id, name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: ProjectFormData): Promise<MarketplaceProject> {
    try {
      const response = await fetch('/api/v1/marketplace/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      return data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<MarketplaceProject> {
    try {
      const response = await fetch('/api/v1/marketplace/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...projectData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project');
      }

      return data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch('/api/v1/marketplace/projects', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async getProjectStats(orgId: string): Promise<ProjectStats> {
    try {
      const { data: projects, error } = await this.supabase
        .from('opendeck_projects')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;

      const stats: ProjectStats = {
        totalProjects: projects?.length || 0,
        openProjects: projects?.filter(p => p.status === 'open').length || 0,
        inProgressProjects: projects?.filter(p => p.status === 'in_progress').length || 0,
        completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
        totalProposals: 0, // Would need to join with proposals table
        averageProjectValue: 0,
        categoryBreakdown: {},
        statusBreakdown: {}
      };

      // Calculate category breakdown
      projects?.forEach(project => {
        if (project.category) {
          stats.categoryBreakdown[project.category] = (stats.categoryBreakdown[project.category] || 0) + 1;
        }
        stats.statusBreakdown[project.status] = (stats.statusBreakdown[project.status] || 0) + 1;
      });

      // Calculate average project value
      const projectsWithBudget = projects?.filter(p => p.budget_min && p.budget_max) || [];
      if (projectsWithBudget.length > 0) {
        const totalValue = projectsWithBudget.reduce((sum, p) => sum + ((p.budget_min + p.budget_max) / 2), 0);
        stats.averageProjectValue = totalValue / projectsWithBudget.length;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  }

  async getProjectActivity(projectId: string): Promise<ProjectActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_activity')
        .select(`
          *,
          user:users(id, name, email)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project activity:', error);
      return [];
    }
  }

  async getProjectProposals(projectId: string): Promise<ProjectProposal[]> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_proposals')
        .select(`
          *,
          vendor:opendeck_vendor_profiles(id, display_name, business_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project proposals:', error);
      return [];
    }
  }

  async submitProposal(projectId: string, proposalData: unknown): Promise<ProjectProposal> {
    try {
      const { data, error } = await this.supabase
        .from('opendeck_proposals')
        .insert({
          project_id: projectId,
          ...proposalData,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting proposal:', error);
      throw error;
    }
  }

  async exportProjects(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const projects = await this.getProjects(filters);
      
      const exportData = projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        budget_type: project.budget_type,
        budget_min: project.budget_min,
        budget_max: project.budget_max,
        currency: project.currency,
        location_type: project.location_type,
        experience_level: project.experience_level,
        start_date: project.start_date,
        end_date: project.end_date,
        created_at: project.created_at
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv' });
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting projects:', error);
      throw error;
    }
  }

  // Helper methods
  generateId(): string {
    return crypto.randomUUID();
  }

  getCurrentOrganizationId(): string {
    return 'current-org-id';
  }

  getCurrentUserId(): string {
    return 'current-user-id';
  }
}
