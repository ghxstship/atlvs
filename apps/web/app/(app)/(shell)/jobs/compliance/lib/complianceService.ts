import { tryCatch, reportError } from '@ghxstship/ui';
import type {
  JobCompliance,
  ComplianceResponse,
  CreateComplianceData,
  UpdateComplianceData,
  ComplianceFilters,
  ComplianceStats,
  ComplianceService,
  JobInfo,
  ComplianceFramework,
  ComplianceEvidence,
  ComplianceAssessment
} from '../types';

/**
 * Compliance Service - Handles all API interactions for job compliance
 * Follows the same patterns as procurement, assignments, bids, and contracts services
 */
class ComplianceServiceImpl implements ComplianceService {
  private baseUrl = '/api/v1/jobs/compliance';

  /**
   * Get all compliance items with optional filtering
   */
  async getCompliance(filters?: ComplianceFilters): Promise<ComplianceResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.kind) params.append('kind', filters.kind);
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.risk_level) params.append('risk_level', filters.risk_level);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.due_from) params.append('due_from', filters.due_from);
      if (filters?.due_to) params.append('due_to', filters.due_to);
      if (filters?.overdue) params.append('overdue', 'true');
      if (filters?.assessor) params.append('assessor', filters.assessor);

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
        throw new Error(`Failed to fetch compliance: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        compliance: data.compliance || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading compliance:', error);
      throw error;
    }
  }

  /**
   * Get a single compliance item by ID
   */
  async getComplianceItem(id: string): Promise<JobCompliance> {
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
        throw new Error(`Failed to fetch compliance item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading compliance item:', error);
      throw error;
    }
  }

  /**
   * Create a new compliance item
   */
  async createCompliance(data: CreateComplianceData): Promise<JobCompliance> {
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
        throw new Error(`Failed to create compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating compliance:', error);
      throw error;
    }
  }

  /**
   * Update an existing compliance item
   */
  async updateCompliance(data: UpdateComplianceData): Promise<JobCompliance> {
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
        throw new Error(`Failed to update compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating compliance:', error);
      throw error;
    }
  }

  /**
   * Delete a compliance item
   */
  async deleteCompliance(id: string): Promise<void> {
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
        throw new Error(`Failed to delete compliance: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting compliance:', error);
      throw error;
    }
  }

  /**
   * Get compliance statistics
   */
  async getComplianceStats(): Promise<ComplianceStats> {
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
        throw new Error(`Failed to fetch compliance stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading compliance stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          pending: 0,
          submitted: 0,
          approved: 0,
          rejected: 0
        },
        byKind: {
          regulatory: 0,
          safety: 0,
          quality: 0,
          security: 0,
          environmental: 0,
          legal: 0,
          financial: 0
        },
        byRiskLevel: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        pendingCompliance: 0,
        overdueCompliance: 0,
        recentCompliance: 0,
        complianceRate: 0,
        averageCompletionTime: 0,
        criticalIssues: 0
      };
    }
  }

  /**
   * Submit a compliance item for review
   */
  async submitCompliance(id: string): Promise<JobCompliance> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/submit`, {
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
        throw new Error(`Failed to submit compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting compliance:', error);
      throw error;
    }
  }

  /**
   * Approve a compliance item
   */
  async approveCompliance(id: string, notes?: string): Promise<JobCompliance> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to approve compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error approving compliance:', error);
      throw error;
    }
  }

  /**
   * Reject a compliance item
   */
  async rejectCompliance(id: string, reason: string): Promise<JobCompliance> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${id}/reject`, {
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
        throw new Error(`Failed to reject compliance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rejecting compliance:', error);
      throw error;
    }
  }

  /**
   * Get available jobs for compliance
   */
  async getAvailableJobs(): Promise<JobInfo[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch('/api/v1/jobs?status=in_progress,open', {
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
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error loading jobs:', error);
      return [];
    }
  }

  /**
   * Get compliance frameworks
   */
  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/frameworks`, {
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
        throw new Error(`Failed to fetch frameworks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.frameworks || [];
    } catch (error) {
      console.error('Error loading compliance frameworks:', error);
      return [];
    }
  }

  /**
   * Upload compliance evidence
   */
  async uploadEvidence(complianceId: string, file: File): Promise<ComplianceEvidence> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('compliance_id', complianceId);

      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/${complianceId}/evidence`, {
          method: 'POST',
          body: formData
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to upload evidence: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  /**
   * Export compliance data
   */
  async exportCompliance(filters?: ComplianceFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.kind) params.append('kind', filters.kind);
      if (filters?.job_id) params.append('job_id', filters.job_id);

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
        throw new Error(`Failed to export compliance: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting compliance:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const complianceService = new ComplianceServiceImpl();
export default complianceService;
