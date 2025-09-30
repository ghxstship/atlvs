/**
 * PEOPLE MODULE - IMPORT SERVICE
 * Comprehensive data import functionality for People module
 * Supports multiple formats with validation and error handling
 */

import { createClient } from '@/lib/supabase/server';
import { createPeoplePermissionsManager, PermissionAction } from './permissions';
import { CreatePersonSchema, UpdatePersonSchema } from './validations';

export enum ImportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx'
}

export interface ImportOptions {
  format: ImportFormat;
  data: unknown[];
  updateExisting?: boolean;
  validateOnly?: boolean;
  skipDuplicates?: boolean;
  batchSize?: number;
  onProgress?: (progress: ImportProgress) => void;
}

export interface ImportProgress {
  processed: number;
  total: number;
  successful: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: unknown;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: ImportError[];
  warnings: string[];
  created: number;
  updated: number;
  skipped: number;
}

export class PeopleImportService {
  private supabase = createClient();
  private orgId: string;
  private userId: string;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
  }

  async importPeople(options: ImportOptions): Promise<ImportResult> {
    try {
      // Check permissions
      const permissionsManager = createPeoplePermissionsManager(this.orgId, this.userId);
      await permissionsManager.initializePermissions();

      if (!permissionsManager.canImportData()) {
        throw new Error('Insufficient permissions to import data');
      }

      // Parse and validate data
      const parsedData = this.parseImportData(options.data, options.format);
      const validatedData = this.validateImportData(parsedData);

      if (options.validateOnly) {
        return {
          success: true,
          totalProcessed: validatedData.valid.length,
          successful: validatedData.valid.length,
          failed: validatedData.invalid.length,
          errors: validatedData.invalid.map(item => ({
            row: item.row,
            message: item.error,
            data: item.data
          })),
          warnings: validatedData.warnings,
          created: 0,
          updated: 0,
          skipped: 0
        };
      }

      // Process import in batches
      const result = await this.processImportBatch(
        validatedData.valid,
        options.updateExisting || false,
        options.skipDuplicates || false,
        options.batchSize || 50,
        options.onProgress
      );

      return {
        success: result.errors.length === 0,
        totalProcessed: result.processed,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
        warnings: validatedData.warnings,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped
      };

    } catch (error) {
      return {
        success: false,
        totalProcessed: 0,
        successful: 0,
        failed: 1,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Import failed'
        }],
        warnings: [],
        created: 0,
        updated: 0,
        skipped: 0
      };
    }
  }

  private parseImportData(data: unknown[], format: ImportFormat): unknown[] {
    switch (format) {
      case ImportFormat.CSV:
        return this.parseCSV(data);
      case ImportFormat.JSON:
        return this.parseJSON(data);
      case ImportFormat.XLSX:
        return this.parseXLSX(data);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  private parseCSV(data: unknown[]): unknown[] {
    // Assume data is already parsed CSV rows
    // In a real implementation, this would parse CSV string
    return data.map((row, index) => ({
      ...row,
      _rowIndex: index + 1
    }));
  }

  private parseJSON(data: unknown[]): unknown[] {
    // Assume data is JSON objects
    return data.map((item, index) => ({
      ...item,
      _rowIndex: index + 1
    }));
  }

  private parseXLSX(data: unknown[]): unknown[] {
    // Assume data is parsed XLSX rows
    // In a real implementation, this would parse XLSX file
    return data.map((row, index) => ({
      ...row,
      _rowIndex: index + 1
    }));
  }

  private validateImportData(data: unknown[]): {
    valid: Array<{ row: number; data: unknown }>;
    invalid: Array<{ row: number; data: unknown; error: string }>;
    warnings: string[];
  } {
    const valid: Array<{ row: number; data: unknown }> = [];
    const invalid: Array<{ row: number; data: unknown; error: string }> = [];
    const warnings: string[] = [];

    data.forEach((item, index) => {
      try {
        // Check for required fields
        if (!item.email) {
          invalid.push({
            row: item._rowIndex || index + 1,
            data: item,
            error: 'Email is required'
          });
          return;
        }

        // Validate against schema
        const validation = CreatePersonSchema.safeParse(item);

        if (validation.success) {
          valid.push({
            row: item._rowIndex || index + 1,
            data: validation.data
          });
        } else {
          const errorMessages = validation.error.errors.map(err => err.message).join(', ');
          invalid.push({
            row: item._rowIndex || index + 1,
            data: item,
            error: errorMessages
          });
        }

        // Check for potential duplicates
        if (item.email) {
          // This would be checked against database in real implementation
          // For now, just collect as warning if email format issues
        }

      } catch (error) {
        invalid.push({
          row: item._rowIndex || index + 1,
          data: item,
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    });

    return { valid, invalid, warnings };
  }

  private async processImportBatch(
    validData: Array<{ row: number; data: unknown }>,
    updateExisting: boolean,
    skipDuplicates: boolean,
    batchSize: number,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: ImportError[];
    created: number;
    updated: number;
    skipped: number;
  }> {
    const result = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as ImportError[],
      created: 0,
      updated: 0,
      skipped: 0
    };

    // Process in batches
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);

      try {
        const batchResult = await this.processBatch(batch, updateExisting, skipDuplicates);

        result.processed += batchResult.processed;
        result.successful += batchResult.successful;
        result.failed += batchResult.failed;
        result.errors.push(...batchResult.errors);
        result.created += batchResult.created;
        result.updated += batchResult.updated;
        result.skipped += batchResult.skipped;

        // Report progress
        if (onProgress) {
          onProgress({
            processed: result.processed,
            total: validData.length,
            successful: result.successful,
            failed: result.failed,
            errors: result.errors
          });
        }

      } catch (error) {
        // Batch failed entirely
        batch.forEach(item => {
          result.errors.push({
            row: item.row,
            message: error instanceof Error ? error.message : 'Batch processing failed',
            data: item.data
          });
          result.failed++;
          result.processed++;
        });
      }
    }

    return result;
  }

  private async processBatch(
    batch: Array<{ row: number; data: unknown }>,
    updateExisting: boolean,
    skipDuplicates: boolean
  ): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: ImportError[];
    created: number;
    updated: number;
    skipped: number;
  }> {
    const result = {
      processed: batch.length,
      successful: 0,
      failed: 0,
      errors: [] as ImportError[],
      created: 0,
      updated: 0,
      skipped: 0
    };

    // Check for existing emails in batch
    const emails = batch.map(item => item.data.email);
    const { data: existingPeople, error: checkError } = await this.supabase
      .from('people')
      .select('email')
      .in('email', emails)
      .eq('organization_id', this.orgId);

    if (checkError) {
      throw checkError;
    }

    const existingEmails = new Set(existingPeople?.map(p => p.email) || []);

    // Process each item
    for (const item of batch) {
      try {
        const email = item.data.email;
        const exists = existingEmails.has(email);

        if (exists && !updateExisting) {
          if (skipDuplicates) {
            result.skipped++;
            result.successful++;
            continue;
          } else {
            result.errors.push({
              row: item.row,
              field: 'email',
              message: 'Person with this email already exists',
              data: item.data
            });
            result.failed++;
            continue;
          }
        }

        if (exists && updateExisting) {
          // Update existing person
          const { error: updateError } = await this.supabase
            .from('people')
            .update({
              ...item.data,
              updated_by: this.userId,
              updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .eq('organization_id', this.orgId);

          if (updateError) throw updateError;
          result.updated++;
        } else {
          // Create new person
          const { error: insertError } = await this.supabase
            .from('people')
            .insert([{
              ...item.data,
              organization_id: this.orgId,
              created_by: this.userId,
              updated_by: this.userId
            }]);

          if (insertError) throw insertError;
          result.created++;
        }

        result.successful++;

      } catch (error) {
        result.errors.push({
          row: item.row,
          message: error instanceof Error ? error.message : 'Import failed',
          data: item.data
        });
        result.failed++;
      }
    }

    return result;
  }

  // Competency import functionality
  async importCompetencies(options: ImportOptions): Promise<ImportResult> {
    try {
      const permissionsManager = createPeoplePermissionsManager(this.orgId, this.userId);
      await permissionsManager.initializePermissions();

      if (!permissionsManager.canManageCompetencies()) {
        throw new Error('Insufficient permissions to import competencies');
      }

      // Parse and validate competency data
      const parsedData = this.parseImportData(options.data, options.format);
      const validatedData = this.validateCompetencyData(parsedData);

      if (options.validateOnly) {
        return {
          success: true,
          totalProcessed: validatedData.valid.length,
          successful: validatedData.valid.length,
          failed: validatedData.invalid.length,
          errors: validatedData.invalid.map(item => ({
            row: item.row,
            message: item.error,
            data: item.data
          })),
          warnings: validatedData.warnings,
          created: 0,
          updated: 0,
          skipped: 0
        };
      }

      // Process competency import
      const result = await this.processCompetencyImportBatch(
        validatedData.valid,
        options.updateExisting || false,
        options.batchSize || 50,
        options.onProgress
      );

      return {
        success: result.errors.length === 0,
        totalProcessed: result.processed,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
        warnings: validatedData.warnings,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped
      };

    } catch (error) {
      return {
        success: false,
        totalProcessed: 0,
        successful: 0,
        failed: 1,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Competency import failed'
        }],
        warnings: [],
        created: 0,
        updated: 0,
        skipped: 0
      };
    }
  }

  private validateCompetencyData(data: unknown[]): {
    valid: Array<{ row: number; data: unknown }>;
    invalid: Array<{ row: number; data: unknown; error: string }>;
    warnings: string[];
  } {
    const valid: Array<{ row: number; data: unknown }> = [];
    const invalid: Array<{ row: number; data: unknown; error: string }> = [];
    const warnings: string[] = [];

    data.forEach((item) => {
      try {
        // Basic validation for competency data
        if (!item.name || !item.category) {
          invalid.push({
            row: item._rowIndex || 0,
            data: item,
            error: 'Name and category are required for competencies'
          });
          return;
        }

        // Validate competency levels if provided
        if (item.level_definitions) {
          const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
          const providedLevels = Object.keys(item.level_definitions);

          const invalidLevels = providedLevels.filter(level => !levels.includes(level));
          if (invalidLevels.length > 0) {
            warnings.push(`Row ${item._rowIndex}: Invalid competency levels: ${invalidLevels.join(', ')}`);
          }
        }

        valid.push({
          row: item._rowIndex || 0,
          data: item
        });

      } catch (error) {
        invalid.push({
          row: item._rowIndex || 0,
          data: item,
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    });

    return { valid, invalid, warnings };
  }

  private async processCompetencyImportBatch(
    validData: Array<{ row: number; data: unknown }>,
    updateExisting: boolean,
    batchSize: number,
    onProgress?: (progress: ImportProgress) => void
  ): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: ImportError[];
    created: number;
    updated: number;
    skipped: number;
  }> {
    const result = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as ImportError[],
      created: 0,
      updated: 0,
      skipped: 0
    };

    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);

      for (const item of batch) {
        try {
          // Check if competency exists
          const { data: existing, error: checkError } = await this.supabase
            .from('people_competencies')
            .select('id')
            .eq('name', item.data.name)
            .eq('organization_id', this.orgId)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
            throw checkError;
          }

          if (existing && !updateExisting) {
            result.skipped++;
            result.successful++;
            continue;
          }

          if (existing && updateExisting) {
            // Update existing competency
            const { error: updateError } = await this.supabase
              .from('people_competencies')
              .update({
                ...item.data,
                updated_by: this.userId,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);

            if (updateError) throw updateError;
            result.updated++;
          } else {
            // Create new competency
            const { error: insertError } = await this.supabase
              .from('people_competencies')
              .insert([{
                ...item.data,
                organization_id: this.orgId,
                created_by: this.userId,
                updated_by: this.userId
              }]);

            if (insertError) throw insertError;
            result.created++;
          }

          result.successful++;
          result.processed++;

        } catch (error) {
          result.errors.push({
            row: item.row,
            message: error instanceof Error ? error.message : 'Competency import failed',
            data: item.data
          });
          result.failed++;
          result.processed++;
        }
      }

      // Report progress
      if (onProgress) {
        onProgress({
          processed: result.processed,
          total: validData.length,
          successful: result.successful,
          failed: result.failed,
          errors: result.errors
        });
      }
    }

    return result;
  }
}

// Factory function for import service
export function createPeopleImportService(orgId: string, userId: string) {
  return new PeopleImportService(orgId, userId);
}
