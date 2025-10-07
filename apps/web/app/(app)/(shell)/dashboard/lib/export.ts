/**
 * Dashboard Module Export Service
 * Enterprise-grade data export functionality
 * Supports multiple formats with background processing and progress tracking
 */

import { dashboardApi, ApiError } from './api';
import type { Dashboard, DashboardWidget, DashboardExport } from '../types';

// Export Types
export interface ExportJob {
  id: string;
  type: 'dashboard' | 'widget' | 'analytics';
  resourceId: string;
  format: 'pdf' | 'png' | 'jpeg' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  metadata: {
    fileSize?: number;
    recordCount?: number;
    processingTime?: number;
  };
}

export interface ExportOptions extends DashboardExport {
  filename?: string;
  includeMetadata?: boolean;
  compression?: 'none' | 'gzip' | 'zip';
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM format
    timezone?: string;
  };
}

export interface BulkExportOptions {
  resources: Array<{
    id: string;
    type: 'dashboard' | 'widget';
    options: ExportOptions;
  }>;
  combineIntoSingleFile?: boolean;
  filename?: string;
}

// Export Service Class
export class ExportService {
  private activeJobs = new Map<string, ExportJob>();

  // Dashboard Export
  async exportDashboard(
    dashboardId: string,
    options: ExportOptions
  ): Promise<ExportJob> {
    try {
      const response = await dashboardApi.post<ExportJob>(
        `/dashboards/${dashboardId}/export`,
        {
          ...options,
          background: true // Always use background processing
        }
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      // Start progress monitoring
      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating dashboard export:', error);
      throw error;
    }
  }

  // Widget Export
  async exportWidget(
    widgetId: string,
    options: ExportOptions
  ): Promise<ExportJob> {
    try {
      const response = await dashboardApi.post<ExportJob>(
        `/widgets/${widgetId}/export`,
        {
          ...options,
          background: true
        }
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating widget export:', error);
      throw error;
    }
  }

  // Analytics Export
  async exportAnalytics(
    query: Record<string, unknown>,
    options: ExportOptions
  ): Promise<ExportJob> {
    try {
      const response = await dashboardApi.post<ExportJob>(
        '/analytics/export',
        {
          query,
          ...options,
          background: true
        }
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating analytics export:', error);
      throw error;
    }
  }

  // Bulk Export
  async bulkExport(options: BulkExportOptions): Promise<ExportJob[]> {
    try {
      const response = await dashboardApi.post<ExportJob[]>(
        '/export/bulk',
        options
      );

      const jobs = response.data;
      jobs.forEach(job => {
        this.activeJobs.set(job.id, job);
        this.monitorJobProgress(job.id);
      });

      return jobs;
    } catch (error) {
      console.error('Error creating bulk export:', error);
      throw error;
    }
  }

  // Get Export Job Status
  async getExportJob(jobId: string): Promise<ExportJob | null> {
    // Check local cache first
    const localJob = this.activeJobs.get(jobId);
    if (localJob && localJob.status !== 'completed' && localJob.status !== 'failed') {
      return localJob;
    }

    try {
      const response = await dashboardApi.get<ExportJob>(`/export/jobs/${jobId}`);
      const job = response.data;

      if (job.status === 'completed' || job.status === 'failed') {
        this.activeJobs.delete(jobId);
      } else {
        this.activeJobs.set(jobId, job);
      }

      return job;
    } catch (error) {
      console.error('Error getting export job:', error);
      return null;
    }
  }

  // List Export Jobs
  async listExportJobs(options: {
    status?: ExportJob['status'];
    type?: ExportJob['type'];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ jobs: ExportJob[]; total: number }> {
    try {
      const params: Record<string, string> = {};
      if (options.status) params.status = options.status;
      if (options.type) params.type = options.type;
      if (options.limit) params.limit = options.limit.toString();
      if (options.offset) params.offset = options.offset.toString();

      const response = await dashboardApi.get<{
        jobs: ExportJob[];
        total: number;
      }>('/export/jobs', params);

      return response.data;
    } catch (error) {
      console.error('Error listing export jobs:', error);
      return { jobs: [], total: 0 };
    }
  }

  // Cancel Export Job
  async cancelExportJob(jobId: string): Promise<boolean> {
    try {
      await dashboardApi.post(`/export/jobs/${jobId}/cancel`, {});
      this.activeJobs.delete(jobId);
      return true;
    } catch (error) {
      console.error('Error canceling export job:', error);
      return false;
    }
  }

  // Delete Export Job
  async deleteExportJob(jobId: string): Promise<boolean> {
    try {
      await dashboardApi.delete(`/export/jobs/${jobId}`);
      this.activeJobs.delete(jobId);
      return true;
    } catch (error) {
      console.error('Error deleting export job:', error);
      return false;
    }
  }

  // Download Exported File
  async downloadExport(jobId: string): Promise<Blob | null> {
    try {
      const job = await this.getExportJob(jobId);
      if (!job || !job.fileUrl) return null;

      const response = await fetch(job.fileUrl);
      if (!response.ok) throw new Error('Download failed');

      return await response.blob();
    } catch (error) {
      console.error('Error downloading export:', error);
      return null;
    }
  }

  // Schedule Export
  async scheduleExport(
    config: {
      type: 'dashboard' | 'widget' | 'analytics';
      resourceId: string;
      options: ExportOptions;
    }
  ): Promise<{ scheduleId: string }> {
    try {
      const response = await dashboardApi.post<{ scheduleId: string }>(
        '/export/schedules',
        config
      );

      return response.data;
    } catch (error) {
      console.error('Error scheduling export:', error);
      throw error;
    }
  }

  // Get Scheduled Exports
  async getScheduledExports(): Promise<Array<{
    id: string;
    type: string;
    resourceId: string;
    frequency: string;
    nextRun: string;
    lastRun?: string;
    isActive: boolean;
  }>> {
    try {
      const response = await dashboardApi.get('/export/schedules');
      return response.data || [];
    } catch (error) {
      console.error('Error getting scheduled exports:', error);
      return [];
    }
  }

  // Private Methods
  private monitorJobProgress(jobId: string): void {
    const checkProgress = async () => {
      try {
        const job = await this.getExportJob(jobId);
        if (!job) return;

        // Update local job status
        this.activeJobs.set(jobId, job);

        // Continue monitoring if still processing
        if (job.status === 'pending' || job.status === 'processing') {
          setTimeout(checkProgress, 2000); // Check every 2 seconds
        }
      } catch (error) {
        console.error('Error monitoring job progress:', error);
      }
    };

    // Start monitoring after a short delay
    setTimeout(checkProgress, 1000);
  }
}

// Format Conversion Utilities
export class ExportFormatter {
  // Convert dashboard to various formats
  static async dashboardToJSON(dashboard: Dashboard): Promise<string> {
    const exportData = {
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        layout: dashboard.layout,
        widgets: dashboard.widgets?.map(widget => ({
          id: widget.id,
          type: widget.type,
          title: widget.title,
          config: widget.config,
          position: widget.position
        }))
      },
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  static async dashboardToCSV(dashboard: Dashboard): Promise<string> {
    const rows: string[] = [];

    // Header
    rows.push('Widget ID,Type,Title,Position X,Position Y,Width,Height');

    // Data rows
    dashboard.widgets?.forEach(widget => {
      rows.push([
        widget.id,
        widget.type,
        `"${widget.title}"`,
        widget.position.x.toString(),
        widget.position.y.toString(),
        widget.position.w.toString(),
        widget.position.h.toString()
      ].join(','));
    });

    return rows.join('\n');
  }

  // Convert widget data to formats
  static async widgetDataToCSV(data: unknown[], headers?: string[]): Promise<string> {
    const rows: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      return 'No data available';
    }

    // Auto-detect headers if not provided
    const headerKeys = headers || Object.keys(data[0] as Record<string, unknown>);

    // Header row
    rows.push(headerKeys.map(h => `"${h}"`).join(','));

    // Data rows
    data.forEach(item => {
      const row = headerKeys.map(key => {
        const value = (item as Record<string, unknown>)[key];
        if (value === null || value === undefined) return '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  static async widgetDataToExcel(data: unknown[]): Promise<ArrayBuffer> {
    // This would integrate with a library like exceljs or xlsx
    // For now, return CSV as Excel-compatible format
    const csv = await this.widgetDataToCSV(data);
    return new TextEncoder().encode(csv).buffer;
  }
}

// Export Templates
export class ExportTemplates {
  static getDashboardTemplate(format: string): ExportOptions {
    const baseOptions: ExportOptions = {
      format: format as any,
      filename: `dashboard-export-${new Date().toISOString().split('T')[0]}`,
      includeMetadata: true
    };

    switch (format) {
      case 'pdf':
        return {
          ...baseOptions,
          options: {
            include_data: true,
            include_images: true,
            page_size: 'A4',
            orientation: 'landscape'
          }
        };
      case 'png':
      case 'jpeg':
        return {
          ...baseOptions,
          options: {
            quality: 'high'
          }
        };
      case 'excel':
        return {
          ...baseOptions,
          compression: 'zip'
        };
      default:
        return baseOptions;
    }
  }

  static getAnalyticsTemplate(dateRange?: { start: string; end: string }): ExportOptions {
    return {
      format: 'excel',
      filename: `analytics-export-${new Date().toISOString().split('T')[0]}`,
      includeMetadata: true,
      schedule: dateRange ? {
        frequency: 'weekly',
        time: '09:00',
        timezone: 'UTC'
      } : undefined
    };
  }
}

// Export singleton instance
export const exportService = new ExportService();
