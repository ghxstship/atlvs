import { tryCatch, reportError } from '@ghxstship/ui';
import type {
  JobRfp,
  RfpsResponse,
  CreateRfpData,
  UpdateRfpData,
  RfpFilters,
  RfpStats,
  RfpService,
  ProjectInfo,
  OrganizationInfo,
  RfpSubmission,
  RfpEvaluation,
  RfpTemplate
} from '../types';

/**
 * RFPs Service - Handles all API interactions for job RFPs
 * Follows the same patterns as procurement, assignments, bids, contracts, compliance, and opportunities services
 */
class RfpsServiceImpl implements RfpService {
  private baseUrl = '/api/v1/jobs/rfps';

  /**
   * Get all RFPs with optional filtering
   */
  async getRfps(filters?: RfpFilters): Promise<RfpsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.budget_min) params.append('budget_min', filters.budget_min.toString());
      if (filters?.budget_max) params.append('budget_max', filters.budget_max.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.evaluation_criteria?.length) params.append('evaluation_criteria', filters.evaluation_criteria.join(','));
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.due_soon) params.append('due_soon', 'true');
      if (filters?.contact_person) params.append('contact_person', filters.contact_person);

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
        throw new Error(`Failed to fetch RFPs: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        rfps: data.rfps || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading RFPs:', error);
      throw error;
    }
  }

  /**
   * Get a single RFP by ID
   */
  async getRfp(id: string): Promise<JobRfp> {
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
        throw new Error(`Failed to fetch RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading RFP:', error);
      throw error;
    }
  }

  /**
   * Create a new RFP
   */
  async createRfp(data: CreateRfpData): Promise<JobRfp> {
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
        throw new Error(`Failed to create RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating RFP:', error);
      throw error;
    }
  }

  /**
   * Update an existing RFP
   */
  async updateRfp(data: UpdateRfpData): Promise<JobRfp> {
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
        throw new Error(`Failed to update RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating RFP:', error);
      throw error;
    }
  }

  /**
   * Delete an RFP
   */
  async deleteRfp(id: string): Promise<void> {
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
        throw new Error(`Failed to delete RFP: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting RFP:', error);
      throw error;
    }
  }

  /**
   * Get RFP statistics
   */
  async getRfpStats(): Promise<RfpStats> {
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
        throw new Error(`Failed to fetch RFP stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading RFP stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          open: 0,
          closed: 0,
          awarded: 0,
          cancelled: 0
        },
        byCategory: {
          construction: 0,
          consulting: 0,
          technology: 0,
          services: 0,
          supplies: 0,
          other: 0
        },
        totalValue: 0,
        averageValue: 0,
        activeRfps: 0,
        dueSoonRfps: 0,
        recentRfps: 0,
        awardRate: 0,
        averageResponseTime: 0,
        totalSubmissions: 0
      };
    }
  }

  /**
   * Close an RFP
   */
  async closeRfp(id: string): Promise<JobRfp> {
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
        throw new Error(`Failed to close RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error closing RFP:', error);
      throw error;
    }
  }

  /**
   * Award an RFP
   */
  async awardRfp(id: string, winnerId: string): Promise<JobRfp> {
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
        throw new Error(`Failed to award RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error awarding RFP:', error);
      throw error;
    }
  }

  /**
   * Cancel an RFP
   */
  async cancelRfp(id: string, reason?: string): Promise<JobRfp> {
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
        throw new Error(`Failed to cancel RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling RFP:', error);
      throw error;
    }
  }

  /**
   * Publish an RFP
   */
  async publishRfp(id: string): Promise<JobRfp> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/publish`, {
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
        throw new Error(`Failed to publish RFP: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error publishing RFP:', error);
      throw error;
    }
  }

  /**
   * Get available projects for RFPs
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
   * Get available organizations for RFPs
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
   * Get RFP submissions
   */
  async getRfpSubmissions(rfpId: string): Promise<RfpSubmission[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${rfpId}/submissions`, {
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
        throw new Error(`Failed to fetch submissions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.submissions || [];
    } catch (error) {
      console.error('Error loading RFP submissions:', error);
      return [];
    }
  }

  /**
   * Get RFP templates
   */
  async getRfpTemplates(): Promise<RfpTemplate[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/templates`, {
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
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error loading RFP templates:', error);
      return [];
    }
  }

  /**
   * Export RFPs data
   */
  async exportRfps(filters?: RfpFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
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
        throw new Error(`Failed to export RFPs: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting RFPs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const rfpsService = new RfpsServiceImpl();
export default rfpsService;
