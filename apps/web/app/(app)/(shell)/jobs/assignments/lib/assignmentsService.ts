import { tryCatch, reportError } from '@ghxstship/ui';
import type {
  JobAssignment,
  AssignmentsResponse,
  CreateAssignmentData,
  UpdateAssignmentData,
  AssignmentFilters,
  AssignmentStats,
  AssignmentService
} from '../types';

/**
 * Assignments Service - Handles all API interactions for job assignments
 * Follows the same patterns as procurement services
 */
class AssignmentsServiceImpl implements AssignmentService {
  private baseUrl = '/api/v1/jobs/assignments';

  /**
   * Get all assignments with optional filtering
   */
  async getAssignments(filters?: AssignmentFilters): Promise<AssignmentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assignee_user_id) params.append('assignee_user_id', filters.assignee_user_id);
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

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
        throw new Error(`Failed to fetch assignments: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        assignments: data.assignments || [],
        total: data.total,
        page: data.page,
        limit: data.limit
      };
    } catch (error) {
      console.error('Error loading assignments:', error);
      throw error;
    }
  }

  /**
   * Get a single assignment by ID
   */
  async getAssignment(id: string): Promise<JobAssignment> {
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
        throw new Error(`Failed to fetch assignment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading assignment:', error);
      throw error;
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(data: CreateAssignmentData): Promise<JobAssignment> {
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
        throw new Error(`Failed to create assignment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Update an existing assignment
   */
  async updateAssignment(data: UpdateAssignmentData): Promise<JobAssignment> {
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
        throw new Error(`Failed to update assignment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string): Promise<void> {
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
        throw new Error(`Failed to delete assignment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(): Promise<AssignmentStats> {
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
        throw new Error(`Failed to fetch assignment stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading assignment stats:', error);
      // Return default stats if API fails
      return {
        total: 0,
        byStatus: {
          pending: 0,
          assigned: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        recentAssignments: 0,
        completionRate: 0,
        averageCompletionTime: 0,
        overdue: 0
      };
    }
  }

  /**
   * Bulk operations
   */
  async bulkUpdateAssignments(ids: string[], updates: Partial<UpdateAssignmentData>): Promise<JobAssignment[]> {
    try {
      const responseResult = await tryCatch(async () =>
        fetch(`${this.baseUrl}/bulk`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, updates })
        })
      );

      if (!responseResult.success) {
        reportError(responseResult.error);
        throw new Error(responseResult.error.message);
      }

      const response = responseResult.data;
      if (!response.ok) {
        throw new Error(`Failed to bulk update assignments: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error bulk updating assignments:', error);
      throw error;
    }
  }

  /**
   * Export assignments data
   */
  async exportAssignments(filters?: AssignmentFilters, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assignee_user_id) params.append('assignee_user_id', filters.assignee_user_id);
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
        throw new Error(`Failed to export assignments: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting assignments:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const assignmentsService = new AssignmentsServiceImpl();
export default assignmentsService;
