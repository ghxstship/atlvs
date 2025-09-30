// Jobs Import Service
// Data import functionality for Jobs module

import { createClient } from '@/lib/supabase/client';
import type { Job, JobAssignment, Opportunity, Bid, JobContract, JobCompliance, RFP } from '../types';
import {
  validateJobCreate,
  validateAssignmentCreate,
  validateOpportunityCreate,
  validateBidCreate,
  validateContractCreate,
  validateComplianceCreate,
  validateRfpCreate
} from './validations';

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
  batchSize?: number;
  organizationId: string;
  userId: string;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: unknown;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  data?: unknown;
}

export class JobsImportService {
  private supabase = createClient();

  // ============================================================================
  // IMPORT METHODS
  // ============================================================================

  async importJobs(csvData: string, options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    try {
      const rows = this.parseCSV(csvData);
      result.totalProcessed = rows.length;

      if (options.validateOnly) {
        return this.validateJobsImport(rows, options);
      }

      const batchSize = options.batchSize || 50;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const batchResult = await this.processJobsBatch(batch, options, result.errors, result.warnings);

        result.successful += batchResult.successful;
        result.failed += batchResult.failed;
        result.skipped += batchResult.skipped;
      }

      result.success = result.failed === 0;
      return result;
    } catch (error: unknown) {
      result.errors.push({
        row: 0,
        message: `Import failed: ${error.message}`
      });
      return result;
    }
  }

  async importAssignments(csvData: string, options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    try {
      const rows = this.parseCSV(csvData);
      result.totalProcessed = rows.length;

      if (options.validateOnly) {
        return this.validateAssignmentsImport(rows, options);
      }

      const batchSize = options.batchSize || 50;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const batchResult = await this.processAssignmentsBatch(batch, options, result.errors, result.warnings);

        result.successful += batchResult.successful;
        result.failed += batchResult.failed;
        result.skipped += batchResult.skipped;
      }

      result.success = result.failed === 0;
      return result;
    } catch (error: unknown) {
      result.errors.push({
        row: 0,
        message: `Import failed: ${error.message}`
      });
      return result;
    }
  }

  async importOpportunities(csvData: string, options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    try {
      const rows = this.parseCSV(csvData);
      result.totalProcessed = rows.length;

      if (options.validateOnly) {
        return this.validateOpportunitiesImport(rows, options);
      }

      const batchSize = options.batchSize || 50;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const batchResult = await this.processOpportunitiesBatch(batch, options, result.errors, result.warnings);

        result.successful += batchResult.successful;
        result.failed += batchResult.failed;
        result.skipped += batchResult.skipped;
      }

      result.success = result.failed === 0;
      return result;
    } catch (error: unknown) {
      result.errors.push({
        row: 0,
        message: `Import failed: ${error.message}`
      });
      return result;
    }
  }

  // ============================================================================
  // CSV PARSING
  // ============================================================================

  private parseCSV(csvData: string): unknown[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = this.parseCSVRow(lines[0]);
    const rows: unknown[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVRow(lines[i]);
      if (values.length === 0) continue; // Skip empty rows

      const row: unknown = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current); // Add the last field
    return result;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateJobsImport(rows: unknown[], options: ImportOptions): ImportResult {
    const result: ImportResult = {
      success: false,
      totalProcessed: rows.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because we skip header and 0-index

      try {
        // Transform CSV row to job data
        const jobData = this.transformJobRow(row, options);

        // Validate the data
        const validation = validateJobCreate(jobData);

        if (!validation.success) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: 'Validation failed',
            data: validation.error.format()
          });
        } else {
          result.successful++;
        }
      } catch (error: unknown) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    });

    result.success = result.failed === 0;
    return result;
  }

  private validateAssignmentsImport(rows: unknown[], options: ImportOptions): ImportResult {
    const result: ImportResult = {
      success: false,
      totalProcessed: rows.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      try {
        const assignmentData = this.transformAssignmentRow(row, options);
        const validation = validateAssignmentCreate(assignmentData);

        if (!validation.success) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: 'Validation failed',
            data: validation.error.format()
          });
        } else {
          result.successful++;
        }
      } catch (error: unknown) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    });

    result.success = result.failed === 0;
    return result;
  }

  private validateOpportunitiesImport(rows: unknown[], options: ImportOptions): ImportResult {
    const result: ImportResult = {
      success: false,
      totalProcessed: rows.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      warnings: []
    };

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      try {
        const opportunityData = this.transformOpportunityRow(row, options);
        const validation = validateOpportunityCreate(opportunityData);

        if (!validation.success) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            message: 'Validation failed',
            data: validation.error.format()
          });
        } else {
          result.successful++;
        }
      } catch (error: unknown) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    });

    result.success = result.failed === 0;
    return result;
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  private async processJobsBatch(
    rows: unknown[],
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[]
  ): Promise<{ successful: number; failed: number; skipped: number }> {
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        const jobData = this.transformJobRow(row, options);

        // Check for duplicates if requested
        if (options.skipDuplicates) {
          const { data: existing } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('organization_id', options.organizationId)
            .eq('title', jobData.title)
            .single();

          if (existing) {
            skipped++;
            warnings.push({
              row: rowNumber,
              message: 'Duplicate job skipped',
              data: { title: jobData.title }
            });
            continue;
          }
        }

        // Create the job
        await this.supabase
          .from('jobs')
          .insert([jobData]);

        successful++;
      } catch (error: unknown) {
        failed++;
        errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    }

    return { successful, failed, skipped };
  }

  private async processAssignmentsBatch(
    rows: unknown[],
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[]
  ): Promise<{ successful: number; failed: number; skipped: number }> {
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        const assignmentData = this.transformAssignmentRow(row, options);

        await this.supabase
          .from('job_assignments')
          .insert([assignmentData]);

        successful++;
      } catch (error: unknown) {
        failed++;
        errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    }

    return { successful, failed, skipped };
  }

  private async processOpportunitiesBatch(
    rows: unknown[],
    options: ImportOptions,
    errors: ImportError[],
    warnings: ImportWarning[]
  ): Promise<{ successful: number; failed: number; skipped: number }> {
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      try {
        const opportunityData = this.transformOpportunityRow(row, options);

        await this.supabase
          .from('opportunities')
          .insert([opportunityData]);

        successful++;
      } catch (error: unknown) {
        failed++;
        errors.push({
          row: rowNumber,
          message: error.message,
          data: row
        });
      }
    }

    return { successful, failed, skipped };
  }

  // ============================================================================
  // DATA TRANSFORMATION
  // ============================================================================

  private transformJobRow(row: unknown, options: ImportOptions): unknown {
    return {
      organization_id: options.organizationId,
      created_by: options.userId,
      title: row.title || row.job_title || '',
      description: row.description || '',
      status: row.status || 'draft',
      priority: row.priority || 'medium',
      type: row.type || row.job_type || 'full-time',
      category: row.category || 'other',
      project_id: row.project_id || null,
      client_id: row.client_id || null,
      location: row.location || '',
      remote_allowed: row.remote_allowed === 'true' || row.remote_allowed === '1',
      start_date: row.start_date ? new Date(row.start_date).toISOString() : null,
      end_date: row.end_date ? new Date(row.end_date).toISOString() : null,
      estimated_hours: row.estimated_hours ? parseFloat(row.estimated_hours) : null,
      hourly_rate: row.hourly_rate ? parseFloat(row.hourly_rate) : null,
      total_budget: row.total_budget ? parseFloat(row.total_budget) : null,
      currency: row.currency || 'USD',
      requirements: row.requirements ? row.requirements.split(';').map((r: string) => r.trim()) : [],
      skills_required: row.skills_required ? row.skills_required.split(';').map((s: string) => s.trim()) : [],
      experience_level: row.experience_level || null,
      assigned_to: row.assigned_to || null,
      tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()) : []
    };
  }

  private transformAssignmentRow(row: unknown, options: ImportOptions): unknown {
    return {
      job_id: row.job_id || '',
      assignee_user_id: row.assignee_user_id || row.assignee_id || '',
      role: row.role || '',
      status: row.status || 'pending',
      notes: row.notes || ''
    };
  }

  private transformOpportunityRow(row: unknown, options: ImportOptions): unknown {
    return {
      organization_id: options.organizationId,
      created_by: options.userId,
      title: row.title || '',
      description: row.description || '',
      project_id: row.project_id || null,
      status: row.status || 'open',
      budget: row.budget ? parseFloat(row.budget) : null,
      currency: row.currency || 'USD',
      stage: row.stage || '',
      probability: row.probability ? parseInt(row.probability) : null,
      opens_at: row.opens_at ? new Date(row.opens_at).toISOString() : null,
      closes_at: row.closes_at ? new Date(row.closes_at).toISOString() : null
    };
  }
}
