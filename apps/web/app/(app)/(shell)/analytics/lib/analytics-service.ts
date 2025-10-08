/**
 * Analytics Service Layer
 * Centralized business logic for Analytics module operations
 * 
 * @module AnalyticsService
 */

import { createBrowserClient } from '@ghxstship/auth';
import type { Database } from '@/types/supabase';

type SupabaseClient = ReturnType<typeof createBrowserClient>;

export interface Report {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: 'table' | 'chart' | 'dashboard' | 'summary';
  data_source: string;
  query: Record<string, unknown>;
  visualization?: Record<string, unknown>;
  schedule?: Record<string, unknown>;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  run_count?: number;
}

export interface Dashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  layout: Record<string, unknown>;
  widgets: unknown[];
  filters: unknown[];
  is_template: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExportJob {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  data_source: string;
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filters: unknown[];
  schedule?: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  row_count?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AnalyticsStats {
  totalReports: number;
  activeDashboards: number;
  scheduledReports: number;
  recentExports: number;
}

export class AnalyticsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createBrowserClient();
  }

  /**
   * Get analytics statistics for an organization
   */
  async getStats(organizationId: string): Promise<AnalyticsStats> {
    try {
      const [reportsResult, dashboardsResult, exportsResult] = await Promise.all([
        this.supabase
          .from('reports')
          .select('id, schedule', { count: 'exact' })
          .eq('organization_id', organizationId),
        this.supabase
          .from('dashboards')
          .select('id', { count: 'exact' })
          .eq('organization_id', organizationId)
          .eq('is_template', false),
        this.supabase
          .from('export_jobs')
          .select('id', { count: 'exact' })
          .eq('organization_id', organizationId)
          .eq('status', 'completed')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const totalReports = reportsResult.count || 0;
      const scheduledReports = reportsResult.data?.filter(r => r.schedule).length || 0;
      const activeDashboards = dashboardsResult.count || 0;
      const recentExports = exportsResult.count || 0;

      return {
        totalReports,
        activeDashboards,
        scheduledReports,
        recentExports
      };
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      return {
        totalReports: 0,
        activeDashboards: 0,
        scheduledReports: 0,
        recentExports: 0
      };
    }
  }

  /**
   * Get all reports for an organization
   */
  async getReports(organizationId: string, filters?: {
    type?: string;
    dataSource?: string;
    isPublic?: boolean;
  }): Promise<Report[]> {
    try {
      let query = this.supabase
        .from('reports')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.dataSource) {
        query = query.eq('data_source', filters.dataSource);
      }
      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as Report[]) || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  /**
   * Create a new report
   */
  async createReport(organizationId: string, userId: string, report: Partial<Report>): Promise<Report | null> {
    try {
      const { data, error } = await this.supabase
        .from('reports')
        .insert({
          ...report,
          organization_id: organizationId,
          created_by: userId,
          run_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Report;
    } catch (error) {
      console.error('Error creating report:', error);
      return null;
    }
  }

  /**
   * Run a report and return results
   */
  async runReport(reportId: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      // This would typically call the API endpoint to execute the report
      // For now, return a success response
      const { data, error } = await this.supabase
        .from('reports')
        .update({
          last_run_at: new Date().toISOString(),
          run_count: this.supabase.rpc('increment', { row_id: reportId })
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          reportId,
          executedAt: new Date().toISOString(),
          rowCount: 0
        }
      };
    } catch (error) {
      console.error('Error running report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run report'
      };
    }
  }

  /**
   * Get all dashboards for an organization
   */
  async getDashboards(organizationId: string): Promise<Dashboard[]> {
    try {
      const { data, error } = await this.supabase
        .from('dashboards')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as Dashboard[]) || [];
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      return [];
    }
  }

  /**
   * Create a new dashboard
   */
  async createDashboard(organizationId: string, userId: string, dashboard: Partial<Dashboard>): Promise<Dashboard | null> {
    try {
      const { data, error } = await this.supabase
        .from('dashboards')
        .insert({
          ...dashboard,
          organization_id: organizationId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as Dashboard;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      return null;
    }
  }

  /**
   * Get export jobs for an organization
   */
  async getExportJobs(organizationId: string): Promise<ExportJob[]> {
    try {
      const { data, error } = await this.supabase
        .from('export_jobs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data as ExportJob[]) || [];
    } catch (error) {
      console.error('Error fetching export jobs:', error);
      return [];
    }
  }

  /**
   * Create a new export job
   */
  async createExportJob(organizationId: string, userId: string, exportJob: Partial<ExportJob>): Promise<ExportJob | null> {
    try {
      const { data, error } = await this.supabase
        .from('export_jobs')
        .insert({
          ...exportJob,
          organization_id: organizationId,
          created_by: userId,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data as ExportJob;
    } catch (error) {
      console.error('Error creating export job:', error);
      return null;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(dashboardId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('dashboards')
        .delete()
        .eq('id', dashboardId)
        .eq('organization_id', organizationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      return false;
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
