/**
 * Assets Import Service
 *
 * Enterprise-grade data import functionality supporting multiple formats
 * with validation, duplicate handling, progress tracking, and error reporting.
 *
 * @module assets/lib/import
 */

import { supabase } from './api';
import { AssetError } from '../types';
import {
  validateAssetForm,
  CreateAssetInput,
  createAssetSchema
} from './validations';

// Import job status types
export interface ImportJob {
  id: string;
  organization_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'excel' | 'json';
  entity_type: 'assets' | 'locations' | 'maintenance' | 'assignments' | 'audits';
  total_records: number;
  processed_records: number;
  successful_imports: number;
  failed_imports: number;
  errors: ImportError[];
  update_existing: boolean;
  validate_only: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: unknown;
}

export interface ImportProgress {
  job_id: string;
  status: ImportJob['status'];
  progress: number;
  total_records: number;
  processed_records: number;
  successful_imports: number;
  failed_imports: number;
  current_row?: number;
  estimated_completion?: string;
}

// Import service class
export class ImportService {
  private static instance: ImportService;
  private activeJobs = new Map<string, ImportJob>();

  static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  async createImportJob(
    orgId: string,
    userId: string,
    format: 'csv' | 'excel' | 'json',
    data: string,
    options: {
      updateExisting?: boolean;
      validateOnly?: boolean;
      entityType?: 'assets' | 'locations' | 'maintenance' | 'assignments' | 'audits';
    } = {}
  ): Promise<ImportJob> {
    const jobId = crypto.randomUUID();

    // Parse and validate data
    const parsedData = this.parseImportData(data, format);
    const totalRecords = parsedData.length;

    const job: ImportJob = {
      id: jobId,
      organization_id: orgId,
      user_id: userId,
      status: 'pending',
      format,
      entity_type: options.entityType || 'assets',
      total_records: totalRecords,
      processed_records: 0,
      successful_imports: 0,
      failed_imports: 0,
      errors: [],
      update_existing: options.updateExisting || false,
      validate_only: options.validateOnly || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store job in database
    const { error } = await supabase
      .from('import_jobs')
      .insert(job);

    if (error) {
      throw new AssetError(`Failed to create import job: ${error.message}`, 'IMPORT_ERROR', 500);
    }

    this.activeJobs.set(jobId, job);

    // Start background processing
    this.processImportJob(jobId, parsedData);

    return job;
  }

  async getImportJob(jobId: string, orgId: string): Promise<ImportJob | null> {
    const { data, error } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new AssetError(`Failed to get import job: ${error.message}`, 'FETCH_ERROR', 500);
    }

    return data;
  }

  async getUserImportJobs(userId: string, orgId: string): Promise<ImportJob[]> {
    const { data, error } = await supabase
      .from('import_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new AssetError(`Failed to get import jobs: ${error.message}`, 'FETCH_ERROR', 500);
    }

    return data || [];
  }

  async cancelImportJob(jobId: string, orgId: string): Promise<void> {
    const { error } = await supabase
      .from('import_jobs')
      .update({
        status: 'failed',
        errors: [{ row: 0, message: 'Job cancelled by user' }],
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('organization_id', orgId);

    if (error) {
      throw new AssetError(`Failed to cancel import job: ${error.message}`, 'UPDATE_ERROR', 500);
    }

    this.activeJobs.delete(jobId);
  }

  private parseImportData(data: string, format: 'csv' | 'excel' | 'json'): unknown[] {
    switch (format) {
      case 'json':
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          throw new AssetError('Invalid JSON format', 'PARSE_ERROR', 400);
        }

      case 'csv':
        return this.parseCSV(data);

      case 'excel':
        // For Excel, we'd use a library like xlsx, but for now throw error
        throw new AssetError('Excel import not yet implemented', 'UNSUPPORTED_FORMAT', 400);

      default:
        throw new AssetError(`Unsupported format: ${format}`, 'UNSUPPORTED_FORMAT', 400);
    }
  }

  private parseCSV(csvText: string): unknown[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new AssetError('CSV must have at least a header row and one data row', 'PARSE_ERROR', 400);
    }

    const headers = this.parseCSVLine(lines[0]);
    const data: unknown[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        throw new AssetError(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`, 'PARSE_ERROR', 400);
      }

      const row: unknown = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  private async processImportJob(jobId: string, data: unknown[]): Promise<void> {
    try {
      const job = this.activeJobs.get(jobId);
      if (!job) return;

      // Update status to processing
      await this.updateJobStatus(jobId, 'processing');

      const errors: ImportError[] = [];
      let successfulImports = 0;
      let processedRecords = 0;

      // Process in batches
      const batchSize = 10;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        for (let j = 0; j < batch.length; j++) {
          const rowIndex = i + j + 2; // +2 for header row and 1-indexing
          const row = batch[j];

          try {
            await this.processImportRow(job, row, rowIndex);
            successfulImports++;
          } catch (error: unknown) {
            errors.push({
              row: rowIndex,
              message: error.message,
              data: row
            });
          }

          processedRecords++;

          // Update progress
          await this.updateJobProgress(jobId, processedRecords, successfulImports, errors.length);
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update final status
      await this.updateJobStatus(jobId, 'completed', successfulImports, errors);

    } catch (error) {
      console.error(`Import job ${jobId} failed:`, error);
      await this.updateJobStatus(jobId, 'failed', 0, [{ row: 0, message: error.message }]);
    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  private async processImportRow(
    job: ImportJob,
    row: unknown,
    rowIndex: number
  ): Promise<void> {
    if (job.validate_only) {
      // Only validate, don't import
      await this.validateImportRow(job, row, rowIndex);
      return;
    }

    switch (job.entity_type) {
      case 'assets':
        await this.importAsset(job, row, rowIndex);
        break;
      // Add other entity types as needed
      default:
        throw new Error(`Import not implemented for entity type: ${job.entity_type}`);
    }
  }

  private async validateImportRow(
    job: ImportJob,
    row: unknown,
    rowIndex: number
  ): Promise<void> {
    switch (job.entity_type) {
      case 'assets':
        const validation = validateAssetForm(row);
        if (!validation.success) {
          const errors = validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }));
          throw new Error(`Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
        }
        break;
    }
  }

  private async importAsset(
    job: ImportJob,
    row: unknown,
    rowIndex: number
  ): Promise<void> {
    // Validate the row data
    const validation = validateAssetForm(row);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      throw new Error(`Validation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }

    const assetData = validation.data as CreateAssetInput;

    // Check for duplicates if not updating existing
    if (!job.update_existing) {
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('organization_id', job.organization_id)
        .eq('asset_tag', assetData.asset_tag)
        .single();

      if (existing) {
        throw new Error(`Asset with tag ${assetData.asset_tag} already exists`);
      }
    }

    // Create or update the asset
    if (job.update_existing) {
      // Try to update existing asset
      const { error } = await supabase
        .from('assets')
        .upsert({
          ...assetData,
          organization_id: job.organization_id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,asset_tag'
        });

      if (error) throw error;
    } else {
      // Create new asset
      const { error } = await supabase
        .from('assets')
        .insert({
          ...assetData,
          organization_id: job.organization_id
        });

      if (error) throw error;
    }
  }

  private async updateJobStatus(
    jobId: string,
    status: ImportJob['status'],
    successfulImports?: number,
    errors?: ImportError[]
  ): Promise<void> {
    const updates: unknown = {
      status,
      updated_at: new Date().toISOString()
    };

    if (successfulImports !== undefined) updates.successful_imports = successfulImports;
    if (errors !== undefined) updates.errors = errors;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('import_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) {
      console.error(`Failed to update job status: ${error.message}`);
    }

    // Update in-memory job
    const job = this.activeJobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
    }
  }

  private async updateJobProgress(
    jobId: string,
    processedRecords: number,
    successfulImports: number,
    failedImports: number
  ): Promise<void> {
    const updates = {
      processed_records: processedRecords,
      successful_imports: successfulImports,
      failed_imports: failedImports,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('import_jobs')
      .update(updates)
      .eq('id', jobId);

    if (error) {
      console.error(`Failed to update job progress: ${error.message}`);
    }
  }

  // Quick validation for small datasets
  async validateImport(
    orgId: string,
    format: 'csv' | 'excel' | 'json',
    data: string,
    entityType: 'assets' | 'locations' | 'maintenance' | 'assignments' | 'audits' = 'assets'
  ): Promise<{ valid: boolean; errors: ImportError[] }> {
    try {
      const parsedData = this.parseImportData(data, format);
      const errors: ImportError[] = [];

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        const rowIndex = i + 2; // +2 for header and 1-indexing

        try {
          await this.validateImportRow({ entity_type: entityType } as ImportJob, row, rowIndex);
        } catch (error: unknown) {
          errors.push({
            row: rowIndex,
            message: error.message,
            data: row
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: unknown) {
      return {
        valid: false,
        errors: [{ row: 0, message: error.message }]
      };
    }
  }
}

// Export singleton instance
export const importService = ImportService.getInstance();
