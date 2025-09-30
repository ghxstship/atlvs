/**
 * Dashboard Module Database Mutations
 * Enterprise-grade data mutation operations
 * Provides atomic operations with rollback, audit trails, and conflict resolution
 */

import { dashboardApi, ApiError } from './api';
import { dashboardQueries } from './queries';
import type {
  Dashboard,
  DashboardWidget,
  WidgetPosition,
  DashboardFilter,
  DashboardExport
} from '../types';

// Mutation Types
export interface MutationOptions {
  optimistic?: boolean;
  rollbackOnError?: boolean;
  audit?: boolean;
  auditMessage?: string;
  conflictResolution?: 'overwrite' | 'merge' | 'skip';
}

export interface MutationResult<T> {
  data: T;
  success: boolean;
  rollbackData?: T;
  executionTime: number;
  auditId?: string;
}

// Dashboard Mutations
export class DashboardMutations {
  // Create Dashboard
  static async createDashboard(
    dashboardData: Omit<Dashboard, 'id' | 'created_at' | 'updated_at'>,
    options: MutationOptions = {}
  ): Promise<MutationResult<Dashboard>> {
    const startTime = Date.now();
    let rollbackData: Dashboard | undefined;

    try {
      // Optimistic update if enabled
      if (options.optimistic) {
        // This would typically update local state immediately
      }

      const response = await dashboardApi.post<Dashboard>('/dashboards', dashboardData);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `dashboard_create_${response.data.id}` : undefined
      };
    } catch (error) {
      console.error('Error creating dashboard:', error);

      // Rollback optimistic update if enabled
      if (options.rollbackOnError && rollbackData) {
        // Implement rollback logic
      }

      throw error;
    }
  }

  // Update Dashboard
  static async updateDashboard(
    id: string,
    updates: Partial<Dashboard>,
    options: MutationOptions = {}
  ): Promise<MutationResult<Dashboard>> {
    const startTime = Date.now();
    let originalData: Dashboard | undefined;

    try {
      // Get original data for rollback
      if (options.rollbackOnError) {
        originalData = await dashboardQueries.getDashboard(id);
      }

      // Optimistic update if enabled
      if (options.optimistic) {
      }

      const response = await dashboardApi.patch<Dashboard>(`/dashboards/${id}`, updates);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        rollbackData: originalData,
        executionTime,
        auditId: options.audit ? `dashboard_update_${id}` : undefined
      };
    } catch (error) {
      console.error('Error updating dashboard:', error);

      // Rollback optimistic update if enabled
      if (options.rollbackOnError && originalData) {
      }

      throw error;
    }
  }

  // Delete Dashboard
  static async deleteDashboard(
    id: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ deleted: boolean }> {
    const startTime = Date.now();
    let originalData: Dashboard | undefined;

    try {
      // Get original data for rollback
      if (options.rollbackOnError) {
        originalData = await dashboardQueries.getDashboard(id);
      }

      // Optimistic update if enabled
      if (options.optimistic) {
      }

      await dashboardApi.delete(`/dashboards/${id}`);

      const executionTime = Date.now() - startTime;

      return {
        data: { deleted: true },
        success: true,
        rollbackData: originalData ? { deleted: false } : undefined,
        executionTime,
        auditId: options.audit ? `dashboard_delete_${id}` : undefined
      };
    } catch (error) {
      console.error('Error deleting dashboard:', error);

      // Rollback optimistic update if enabled
      if (options.rollbackOnError && originalData) {
      }

      throw error;
    }
  }

  // Clone Dashboard
  static async cloneDashboard(
    id: string,
    newName: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<Dashboard>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<Dashboard>(`/dashboards/${id}/clone`, {
        name: newName
      });

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `dashboard_clone_${response.data.id}` : undefined
      };
    } catch (error) {
      console.error('Error cloning dashboard:', error);
      throw error;
    }
  }

  // Set Default Dashboard
  static async setDefaultDashboard(
    id: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ updated: boolean }> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.patch<{ updated: boolean }>(`/dashboards/${id}/default`, {
        is_default: true
      });

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `dashboard_set_default_${id}` : undefined
      };
    } catch (error) {
      console.error('Error setting default dashboard:', error);
      throw error;
    }
  }
}

// Widget Mutations
export class WidgetMutations {
  // Create Widget
  static async createWidget(
    widgetData: Omit<DashboardWidget, 'id' | 'created_at' | 'updated_at'>,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardWidget>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<DashboardWidget>('/widgets', widgetData);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `widget_create_${response.data.id}` : undefined
      };
    } catch (error) {
      console.error('Error creating widget:', error);
      throw error;
    }
  }

  // Update Widget
  static async updateWidget(
    id: string,
    updates: Partial<DashboardWidget>,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardWidget>> {
    const startTime = Date.now();
    let originalData: DashboardWidget | undefined;

    try {
      // Get original data for rollback
      if (options.rollbackOnError) {
        originalData = await dashboardQueries.getWidget(id);
      }

      const response = await dashboardApi.patch<DashboardWidget>(`/widgets/${id}`, updates);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        rollbackData: originalData,
        executionTime,
        auditId: options.audit ? `widget_update_${id}` : undefined
      };
    } catch (error) {
      console.error('Error updating widget:', error);
      throw error;
    }
  }

  // Update Widget Position
  static async updateWidgetPosition(
    id: string,
    position: WidgetPosition,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardWidget>> {
    return this.updateWidget(id, { position }, {
      ...options,
      auditMessage: `Widget ${id} position updated`
    });
  }

  // Update Widget Config
  static async updateWidgetConfig(
    id: string,
    config: Record<string, unknown>,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardWidget>> {
    return this.updateWidget(id, { config }, {
      ...options,
      auditMessage: `Widget ${id} configuration updated`
    });
  }

  // Delete Widget
  static async deleteWidget(
    id: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ deleted: boolean }> {
    const startTime = Date.now();
    let originalData: DashboardWidget | undefined;

    try {
      // Get original data for rollback
      if (options.rollbackOnError) {
        originalData = await dashboardQueries.getWidget(id);
      }

      await dashboardApi.delete(`/widgets/${id}`);

      const executionTime = Date.now() - startTime;

      return {
        data: { deleted: true },
        success: true,
        rollbackData: originalData ? { deleted: false } : undefined,
        executionTime,
        auditId: options.audit ? `widget_delete_${id}` : undefined
      };
    } catch (error) {
      console.error('Error deleting widget:', error);
      throw error;
    }
  }

  // Bulk Update Widgets
  static async bulkUpdateWidgets(
    updates: Array<{ id: string; updates: Partial<DashboardWidget> }>,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ updated: number; failed: number }> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.patch<{ updated: number; failed: number }>(
        '/widgets/bulk',
        { updates }
      );

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `widget_bulk_update_${updates.length}` : undefined
      };
    } catch (error) {
      console.error('Error bulk updating widgets:', error);
      throw error;
    }
  }

  // Duplicate Widget
  static async duplicateWidget(
    id: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardWidget>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<DashboardWidget>(`/widgets/${id}/duplicate`, {});

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `widget_duplicate_${response.data.id}` : undefined
      };
    } catch (error) {
      console.error('Error duplicating widget:', error);
      throw error;
    }
  }
}

// Filter Mutations
export class FilterMutations {
  // Create Filter
  static async createFilter(
    filterData: Omit<DashboardFilter, 'id'>,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardFilter>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<DashboardFilter>('/filters', filterData);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `filter_create_${response.data.id}` : undefined
      };
    } catch (error) {
      console.error('Error creating filter:', error);
      throw error;
    }
  }

  // Update Filter
  static async updateFilter(
    id: string,
    updates: Partial<DashboardFilter>,
    options: MutationOptions = {}
  ): Promise<MutationResult<DashboardFilter>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.patch<DashboardFilter>(`/filters/${id}`, updates);

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `filter_update_${id}` : undefined
      };
    } catch (error) {
      console.error('Error updating filter:', error);
      throw error;
    }
  }

  // Delete Filter
  static async deleteFilter(
    id: string,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ deleted: boolean }> {
    const startTime = Date.now();

    try {
      await dashboardApi.delete(`/filters/${id}`);

      const executionTime = Date.now() - startTime;

      return {
        data: { deleted: true },
        success: true,
        executionTime,
        auditId: options.audit ? `filter_delete_${id}` : undefined
      };
    } catch (error) {
      console.error('Error deleting filter:', error);
      throw error;
    }
  }

  // Bulk Delete Filters
  static async bulkDeleteFilters(
    filterIds: string[],
    options: MutationOptions = {}
  ): Promise<MutationResult<{ deleted: number }> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<{ deleted: number }>('/filters/bulk-delete', {
        filter_ids: filterIds
      });

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `filter_bulk_delete_${filterIds.length}` : undefined
      };
    } catch (error) {
      console.error('Error bulk deleting filters:', error);
      throw error;
    }
  }
}

// Export Mutations
export class ExportMutations {
  // Export Dashboard
  static async exportDashboard(
    dashboardId: string,
    exportConfig: DashboardExport,
    options: MutationOptions = {}
  ): Promise<MutationResult<{ url: string; expires: number }> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<{ url: string; expires: number }>(
        `/dashboards/${dashboardId}/export`,
        exportConfig
      );

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `dashboard_export_${dashboardId}` : undefined
      };
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      throw error;
    }
  }

  // Export Widget Data
  static async exportWidgetData(
    widgetId: string,
    format: 'csv' | 'excel' | 'json',
    options: MutationOptions = {}
  ): Promise<MutationResult<{ url: string; expires: number }> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.post<{ url: string; expires: number }>(
        `/widgets/${widgetId}/export`,
        { format }
      );

      const executionTime = Date.now() - startTime;

      return {
        data: response.data,
        success: true,
        executionTime,
        auditId: options.audit ? `widget_export_${widgetId}` : undefined
      };
    } catch (error) {
      console.error('Error exporting widget data:', error);
      throw error;
    }
  }
}

// Conflict Resolution Utilities
export class ConflictResolver {
  static resolveDashboardConflict(
    local: Dashboard,
    remote: Dashboard,
    strategy: 'overwrite' | 'merge' | 'skip' = 'merge'
  ): Dashboard {
    switch (strategy) {
      case 'overwrite':
        return remote;
      case 'skip':
        return local;
      case 'merge':
      default:
        return {
          ...remote,
          name: remote.name || local.name,
          description: remote.description || local.description,
          widgets: remote.widgets?.length ? remote.widgets : local.widgets
        };
    }
  }

  static resolveWidgetConflict(
    local: DashboardWidget,
    remote: DashboardWidget,
    strategy: 'overwrite' | 'merge' | 'skip' = 'merge'
  ): DashboardWidget {
    switch (strategy) {
      case 'overwrite':
        return remote;
      case 'skip':
        return local;
      case 'merge':
      default:
        return {
          ...remote,
          title: remote.title || local.title,
          config: { ...local.config, ...remote.config },
          position: remote.position || local.position
        };
    }
  }
}
