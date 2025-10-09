import { tryCatch, reportError } from '@ghxstship/ui';
import type {
  JobOpportunity,
  OpportunitiesResponse,
  CreateOpportunityData,
  UpdateOpportunityData,
  OpportunityFilters,
  OpportunityStats,
  OpportunityService,
  ProjectInfo,
  OrganizationInfo,
  OpportunityPipeline,
  OpportunityActivity,
  OpportunityProposal
} from '../types';

/**
 * Opportunities Service - Handles all API interactions for job opportunities
 * Follows the same patterns as procurement, assignments, bids, contracts, and compliance services
 */
class OpportunitiesServiceImpl implements OpportunityService {
  private baseUrl = '/api/v1/jobs/opportunities';

  /**
   * Get all opportunities with optional filtering
   */
  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunitiesResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.budget_min) params.append('budget_min', filters.budget_min.toString());
      if (filters?.budget_max) params.append('budget_max', filters.budget_max.toString());
      if (filters?.value_min) params.append('value_min', filters.value_min.toString());
      if (filters?.value_max) params.append('value_max', filters.value_max.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.skills?.length) params.append('skills', filters.skills.join(','));
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.closing_soon) params.append('closing_soon', 'true');

      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        opportunities: data.opportunities || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading opportunities:', error);
      throw error;
    }
  }

  /**
   * Get a single opportunity by ID
   */
  async getOpportunity(id: string): Promise<JobOpportunity> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading opportunity:', error);
      throw error;
    }
  }

  /**
   * Create a new opportunity
   */
  async createOpportunity(data: CreateOpportunityData): Promise<JobOpportunity> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to create opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  }

  /**
   * Update an existing opportunity
   */
  async updateOpportunity(data: UpdateOpportunityData): Promise<JobOpportunity> {
    try {
      const { id, ...updateData } = data;
      
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to update opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  }

  /**
   * Delete an opportunity
   */
  async deleteOpportunity(id: string): Promise<void> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to delete opportunity: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  }

  /**
   * Get opportunity statistics
   */
  async getOpportunityStats(): Promise<OpportunityStats> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/stats`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunity stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading opportunity stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          open: 0,
          closed: 0,
          awarded: 0,
          cancelled: 0
        },
        byStage: {
          lead: 0,
          qualified: 0,
          proposal: 0,
          negotiation: 0,
          won: 0,
          lost: 0
        },
        byType: {
          construction: 0,
          technical: 0,
          creative: 0,
          logistics: 0,
          consulting: 0,
          other: 0
        },
        totalValue: 0,
        averageValue: 0,
        winRate: 0,
        pipelineValue: 0,
        activeOpportunities: 0,
        closingOpportunities: 0,
        recentOpportunities: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Close an opportunity
   */
  async closeOpportunity(id: string): Promise<JobOpportunity> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to close opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error closing opportunity:', error);
      throw error;
    }
  }

  /**
   * Award an opportunity
   */
  async awardOpportunity(id: string, winnerId: string): Promise<JobOpportunity> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/award`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner_id: winnerId })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to award opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error awarding opportunity:', error);
      throw error;
    }
  }

  /**
   * Cancel an opportunity
   */
  async cancelOpportunity(id: string, reason?: string): Promise<JobOpportunity> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to cancel opportunity: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling opportunity:', error);
      throw error;
    }
  }

  /**
   * Get available projects for opportunities
   */
  async getAvailableProjects(): Promise<ProjectInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/projects?status=active,planning', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Get available organizations for opportunities
   */
  async getAvailableOrganizations(): Promise<OrganizationInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/organizations?active=true', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.organizations || [];
    } catch (error) {
      console.error('Error loading organizations:', error);
      return [];
    }
  }

  /**
   * Get opportunity pipeline data
   */
  async getOpportunityPipeline(): Promise<OpportunityPipeline[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/pipeline`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to fetch pipeline: ${response.statusText}`);
      }

      const data = await response.json();
      return data.pipeline || [];
    } catch (error) {
      console.error('Error loading opportunity pipeline:', error);
      return [];
    }
  }

  /**
   * Export opportunities data
   */
  async exportOpportunities(filters?: OpportunityFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);

      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/export?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to export opportunities: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting opportunities:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const opportunitiesService = new OpportunitiesServiceImpl();
export default opportunitiesService;
