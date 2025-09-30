/**
 * Dashboard Module Import Service
 * Enterprise-grade data import functionality
 * Supports multiple formats with validation, transformation, and progress tracking
 */

import { dashboardApi, ApiError } from './api';
import Papa from 'papaparse';
import type { Dashboard, DashboardWidget } from '../types';

// Import Types
export interface ImportJob {
  id: string;
  type: 'dashboard' | 'widgets' | 'analytics';
  format: 'csv' | 'excel' | 'json' | 'xml';
  status: 'pending' | 'processing' | 'validating' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  createdAt: string;
  completedAt?: string;
  metadata: {
    fileSize: number;
    estimatedTime?: number;
    processingTime?: number;
  };
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  suggestion?: string;
}

export interface ImportOptions {
  format: 'csv' | 'excel' | 'json' | 'xml';
  delimiter?: string;
  hasHeaders?: boolean;
  skipRows?: number;
  encoding?: string;
  validateOnly?: boolean;
  updateExisting?: boolean;
  conflictResolution?: 'skip' | 'overwrite' | 'merge';
  transform?: Record<string, unknown>;
  batchSize?: number;
}

export interface ImportResult {
  success: boolean;
  jobId: string;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  warningsCount: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  preview?: unknown[];
}

// Import Service Class
export class ImportService {
  private activeJobs = new Map<string, ImportJob>();

  // Dashboard Import
  async importDashboard(
    file: File,
    options: ImportOptions
  ): Promise<ImportJob> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await dashboardApi.post<ImportJob>(
        '/import/dashboard',
        formData,
        { timeout: 300000 } // 5 minute timeout for large files
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating dashboard import:', error);
      throw error;
    }
  }

  // Widgets Import
  async importWidgets(
    file: File,
    dashboardId: string,
    options: ImportOptions
  ): Promise<ImportJob> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dashboardId', dashboardId);
      formData.append('options', JSON.stringify(options));

      const response = await dashboardApi.post<ImportJob>(
        '/import/widgets',
        formData,
        { timeout: 300000 }
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating widgets import:', error);
      throw error;
    }
  }

  // Analytics Data Import
  async importAnalyticsData(
    file: File,
    options: ImportOptions
  ): Promise<ImportJob> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));

      const response = await dashboardApi.post<ImportJob>(
        '/import/analytics',
        formData,
        { timeout: 300000 }
      );

      const job = response.data;
      this.activeJobs.set(job.id, job);

      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error creating analytics import:', error);
      throw error;
    }
  }

  // Validate Import File
  async validateImportFile(
    file: File,
    options: ImportOptions
  ): Promise<{
    valid: boolean;
    errors: ImportError[];
    warnings: ImportWarning[];
    preview: unknown[];
    estimatedRecords: number;
  }> {
    try {
      const result = await this.parseFile(file, options);

      return {
        valid: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings,
        preview: result.data.slice(0, 5), // First 5 rows
        estimatedRecords: result.data.length
      };
    } catch (error) {
      console.error('Error validating import file:', error);
      throw error;
    }
  }

  // Get Import Job Status
  async getImportJob(jobId: string): Promise<ImportJob | null> {
    const localJob = this.activeJobs.get(jobId);
    if (localJob && localJob.status !== 'completed' && localJob.status !== 'failed') {
      return localJob;
    }

    try {
      const response = await dashboardApi.get<ImportJob>(`/import/jobs/${jobId}`);
      const job = response.data;

      if (job.status === 'completed' || job.status === 'failed') {
        this.activeJobs.delete(jobId);
      } else {
        this.activeJobs.set(jobId, job);
      }

      return job;
    } catch (error) {
      console.error('Error getting import job:', error);
      return null;
    }
  }

  // List Import Jobs
  async listImportJobs(options: {
    status?: ImportJob['status'];
    type?: ImportJob['type'];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ jobs: ImportJob[]; total: number }> {
    try {
      const params: Record<string, string> = {};
      if (options.status) params.status = options.status;
      if (options.type) params.type = options.type;
      if (options.limit) params.limit = options.limit.toString();
      if (options.offset) params.offset = options.offset.toString();

      const response = await dashboardApi.get<{
        jobs: ImportJob[];
        total: number;
      }>('/import/jobs', params);

      return response.data;
    } catch (error) {
      console.error('Error listing import jobs:', error);
      return { jobs: [], total: 0 };
    }
  }

  // Cancel Import Job
  async cancelImportJob(jobId: string): Promise<boolean> {
    try {
      await dashboardApi.post(`/import/jobs/${jobId}/cancel`, {});
      this.activeJobs.delete(jobId);
      return true;
    } catch (error) {
      console.error('Error canceling import job:', error);
      return false;
    }
  }

  // Retry Failed Import
  async retryImportJob(jobId: string): Promise<ImportJob | null> {
    try {
      const response = await dashboardApi.post<ImportJob>(`/import/jobs/${jobId}/retry`, {});
      const job = response.data;

      this.activeJobs.set(job.id, job);
      this.monitorJobProgress(job.id);

      return job;
    } catch (error) {
      console.error('Error retrying import job:', error);
      return null;
    }
  }

  // Private Methods
  private async parseFile(file: File, options: ImportOptions): Promise<{
    data: unknown[];
    errors: ImportError[];
    warnings: ImportWarning[];
  }> {
    return new Promise((resolve, reject) => {
      const errors: ImportError[] = [];
      const warnings: ImportWarning[] = [];

      switch (options.format) {
        case 'csv':
          this.parseCSV(file, options, errors, warnings, resolve, reject);
          break;
        case 'json':
          this.parseJSON(file, options, errors, warnings, resolve, reject);
          break;
        case 'excel':
          this.parseExcel(file, options, errors, warnings, resolve, reject);
          break;
        default:
          reject(new Error(`Unsupported format: ${options.format}`));
      }
    });
  }

  private parseCSV(
    file: File,
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[],
    resolve: (result: unknown) => void
    reject: (error: unknown) => void
  ): void {
    Papa.parse(file, {
      header: options.hasHeaders !== false,
      delimiter: options.delimiter || ',',
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        // Validate data
        this.validateCSVData(results.data, errors, warnings);

        resolve({
          data: results.data,
          errors,
          warnings
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  }

  private async parseJSON(
    file: File,
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[],
    resolve: (result: unknown) => void
    reject: (error: unknown) => void
  ): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Handle different JSON structures
      let records: unknown[] = [];
      if (Array.isArray(data)) {
        records = data;
      } else if (data.data && Array.isArray(data.data)) {
        records = data.data;
      } else if (typeof data === 'object') {
        records = [data];
      }

      // Validate data
      this.validateJSONData(records, errors, warnings);

      resolve({
        data: records,
        errors,
        warnings
      });
    } catch (error) {
      reject(error);
    }
  }

  private async parseExcel(
    file: File,
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[],
    resolve: (result: unknown) => void
    reject: (error: unknown) => void
  ): Promise<void> {
    try {
      // This would use a library like xlsx
      // For now, convert to CSV and parse
      const text = await file.text();
      const csvOptions = { ...options, format: 'csv' as const };
      this.parseCSV(new File([text], file.name), csvOptions, errors, warnings, resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  private validateCSVData(data: unknown[], errors: ImportError[], warnings: ImportWarning[]): void {
    if (!Array.isArray(data) || data.length === 0) {
      errors.push({
        row: 0,
        message: 'No data found in file',
        severity: 'error'
      });
      return;
    }

    // Check for required fields
    const firstRow = data[0] as Record<string, unknown>;
    const requiredFields = ['name', 'type']; // Adjust based on import type

    requiredFields.forEach(field => {
      if (!(field in firstRow)) {
        warnings.push({
          row: 1,
          field,
          message: `Required field '${field}' not found`,
          suggestion: 'Add the missing column to your CSV file'
        });
      }
    });

    // Validate each row
    data.forEach((row, index) => {
      if (typeof row === 'object' && row !== null) {
        const record = row as Record<string, unknown>;

        // Check for empty required fields
        requiredFields.forEach(field => {
          if (record[field] === '' || record[field] === null || record[field] === undefined) {
            errors.push({
              row: index + 1,
              field,
              message: `Required field '${field}' is empty`,
              severity: 'error'
            });
          }
        });
      }
    });
  }

  private validateJSONData(data: unknown[], errors: ImportError[], warnings: ImportWarning[]): void {
    if (!Array.isArray(data) || data.length === 0) {
      errors.push({
        row: 0,
        message: 'No data found in JSON',
        severity: 'error'
      });
      return;
    }

    // Validate each record
    data.forEach((record, index) => {
      if (typeof record !== 'object' || record === null) {
        errors.push({
          row: index + 1,
          message: 'Invalid record format',
          severity: 'error'
        });
        return;
      }

      const obj = record as Record<string, unknown>;

      // Check required fields
      if (!obj.name || typeof obj.name !== 'string') {
        errors.push({
          row: index + 1,
          field: 'name',
          message: 'Missing or invalid name field',
          severity: 'error'
        });
      }
    });
  }

  private monitorJobProgress(jobId: string): void {
    const checkProgress = async () => {
      try {
        const job = await this.getImportJob(jobId);
        if (!job) return;

        this.activeJobs.set(jobId, job);

        if (job.status === 'pending' || job.status === 'processing' || job.status === 'validating') {
          setTimeout(checkProgress, 2000);
        }
      } catch (error) {
        console.error('Error monitoring import job progress:', error);
      }
    };

    setTimeout(checkProgress, 1000);
  }
}

// Import Templates
export class ImportTemplates {
  static getDashboardTemplate(): ImportOptions {
    return {
      format: 'json',
      hasHeaders: true,
      validateOnly: false,
      updateExisting: false,
      conflictResolution: 'skip',
      batchSize: 10
    };
  }

  static getWidgetsTemplate(): ImportOptions {
    return {
      format: 'csv',
      hasHeaders: true,
      delimiter: ',',
      validateOnly: false,
      updateExisting: true,
      conflictResolution: 'merge',
      batchSize: 25
    };
  }

  static getAnalyticsTemplate(): ImportOptions {
    return {
      format: 'excel',
      hasHeaders: true,
      validateOnly: false,
      updateExisting: false,
      conflictResolution: 'overwrite',
      batchSize: 100
    };
  }
}

// Data Transformation Utilities
export class ImportTransformers {
  static transformDashboardData(rawData: unknown[]): Partial<Dashboard>[] {
    return rawData.map(item => {
      const data = item as Record<string, unknown>;
      return {
        name: String(data.name || ''),
        description: data.description ? String(data.description) : undefined,
        layout: data.layout as any || 'grid',
        layout_config: data.layout_config as any || {},
        is_default: Boolean(data.is_default),
        is_template: Boolean(data.is_template),
        access_level: data.access_level as any || 'private',
        tags: Array.isArray(data.tags) ? data.tags.map(String) : []
      };
    });
  }

  static transformWidgetData(rawData: unknown[]): Partial<DashboardWidget>[] {
    return rawData.map(item => {
      const data = item as Record<string, unknown>;
      return {
        type: data.type as any || 'metric',
        title: String(data.title || ''),
        config: data.config as any || {},
        position: data.position as any || { x: 0, y: 0, w: 4, h: 4 },
        refresh_interval: data.refresh_interval as any || 'manual',
        is_visible: data.is_visible !== false
      };
    });
  }

  static cleanImportData(data: unknown[], options: ImportOptions): unknown[] {
    return data
      .filter(item => {
        // Remove empty rows
        if (typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          return Object.values(obj).some(value =>
            value !== null && value !== undefined && String(value).trim() !== ''
          );
        }
        return true;
      })
      .map(item => {
        // Apply transformations
        if (options.transform && typeof item === 'object' && item !== null) {
          const obj = item as Record<string, unknown>;
          const transformed: Record<string, unknown> = {};

          Object.entries(obj).forEach(([key, value]) => {
            const transformer = (options.transform as Record<string, unknown>)[key];
            if (typeof transformer === 'function') {
              transformed[key] = transformer(value);
            } else {
              transformed[key] = value;
            }
          });

          return transformed;
        }

        return item;
      });
  }
}

// Export singleton instance
export const importService = new ImportService();
