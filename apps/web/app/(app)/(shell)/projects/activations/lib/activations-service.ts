// Activations Service Layer
// Business logic and data access for Project Activations

import { createBrowserClient } from '@ghxstship/auth';
import type { 
  Activation, 
  CreateActivationData, 
  UpdateActivationData,
  ActivationStats,
  ActivationFilters
} from '../types';
import type { ApiResponse, PaginatedResponse } from '../../types';

export class ActivationsService {
  private supabase = createBrowserClient();

  // Get all activations for an organization
  async getActivations(
    orgId: string,
    options?: {
      page?: number;
      perPage?: number;
      filters?: ActivationFilters;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<Activation>>> {
    try {
      let query = this.supabase
        .from('project_activations')
        .select(`
          *,
          project:projects(id, name, status)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      // Apply search
      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%,location.ilike.%${options.search}%`);
      }

      // Apply filters
      if (options?.filters) {
        const { status, activation_type, project_id, location, date_range } = options.filters;
        
        if (status) query = query.eq('status', status);
        if (activation_type) query = query.eq('activation_type', activation_type);
        if (project_id) query = query.eq('project_id', project_id);
        if (location) query = query.ilike('location', `%${location}%`);
        if (date_range) {
          query = query.gte('scheduled_date', date_range.start);
          query = query.lte('scheduled_date', date_range.end);
        }
      }

      // Apply sorting
      const sortField = options?.sortField || 'scheduled_date';
      const sortDirection = options?.sortDirection || 'desc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

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

  // Get a single activation by ID
  async getActivation(id: string, orgId: string): Promise<ApiResponse<Activation>> {
    try {
      const { data, error } = await this.supabase
        .from('project_activations')
        .select(`
          *,
          project:projects(id, name, status)
        `)
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

  // Create a new activation
  async createActivation(
    activationData: CreateActivationData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Activation>> {
    try {
      const { data, error } = await this.supabase
        .from('project_activations')
        .insert({
          ...activationData,
          organization_id: orgId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'activations.create', 'activation', data.id, {
        name: data.name,
        status: data.status,
        activation_type: data.activation_type,
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update an existing activation
  async updateActivation(
    activationData: UpdateActivationData,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Activation>> {
    try {
      const { id, ...updateData } = activationData;

      // Auto-set dates based on status changes
      const updates: unknown = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      if (updateData.status === 'active' && !updateData.actual_date) {
        updates.actual_date = new Date().toISOString();
      }

      if (updateData.status === 'completed' && !updateData.completion_date) {
        updates.completion_date = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('project_activations')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'activations.update', 'activation', id, {
        updated_fields: Object.keys(updateData),
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete an activation
  async deleteActivation(
    id: string,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Get activation name for audit log
      const { data: activation } = await this.supabase
        .from('project_activations')
        .select('name')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      const { error } = await this.supabase
        .from('project_activations')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'activations.delete', 'activation', id, {
        name: activation?.name || 'Unknown',
      });

      return { data: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get activation statistics
  async getActivationStats(orgId: string): Promise<ApiResponse<ActivationStats>> {
    try {
      const { data, error } = await this.supabase
        .from('project_activations')
        .select('status, budget, actual_cost, scheduled_date, completion_date')
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      const stats = data.reduce((acc, activation) => {
        acc.total++;
        acc[activation.status as keyof ActivationStats]++;
        acc.totalBudget += activation.budget || 0;
        acc.totalActualCost += activation.actual_cost || 0;

        // Calculate completion time for completed activations
        if (activation.status === 'completed' && activation.scheduled_date && activation.completion_date) {
          const scheduled = new Date(activation.scheduled_date);
          const completed = new Date(activation.completion_date);
          const completionTime = Math.abs(completed.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24); // days
          acc.avgCompletionTime = (acc.avgCompletionTime + completionTime) / 2;
        }

        return acc;
      }, {
        total: 0,
        planning: 0,
        ready: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        totalBudget: 0,
        totalActualCost: 0,
        avgCompletionTime: 0,
      } as ActivationStats);

      return { data: stats };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Subscribe to real-time activation changes
  subscribeToActivations(
    orgId: string,
    callback: (payload: unknown) => void
  ) {
    return this.supabase
      .channel('activations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_activations',
          filter: `organization_id=eq.${orgId}`,
        },
        callback
      )
      .subscribe();
  }

  // Duplicate an activation
  async duplicateActivation(
    id: string,
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Activation>> {
    try {
      const { data: original, error: fetchError } = await this.supabase
        .from('project_activations')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (fetchError) {
        return { error: fetchError.message };
      }

      const { id: _, created_at, updated_at, actual_date, completion_date, actual_cost, ...duplicateData } = original;

      const { data, error } = await this.supabase
        .from('project_activations')
        .insert({
          ...duplicateData,
          name: `${original.name} (Copy)`,
          status: 'planning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          project:projects(id, name, status)
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      // Log audit trail
      await this.logActivity(orgId, userId, 'activations.duplicate', 'activation', data.id, {
        original_id: id,
        original_name: original.name,
        new_name: data.name,
      });

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Bulk status update
  async bulkUpdateStatus(
    activationIds: string[],
    status: Activation['status'],
    orgId: string,
    userId: string
  ): Promise<ApiResponse<Activation[]>> {
    try {
      const updates: unknown = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Auto-set dates based on status
      if (status === 'active') {
        updates.actual_date = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completion_date = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('project_activations')
        .update(updates)
        .in('id', activationIds)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status)
        `);

      if (error) {
        return { error: error.message };
      }

      // Log audit trail for bulk operation
      await this.logActivity(orgId, userId, 'activations.bulk_status_update', 'activation', null, {
        activation_ids: activationIds,
        new_status: status,
        count: activationIds.length,
      });

      return { data: data || [] };
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
export const activationsService = new ActivationsService();
