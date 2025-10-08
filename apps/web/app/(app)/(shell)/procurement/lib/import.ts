/**
 * Procurement Import Service
 * Data import functionality with validation and batch processing
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Import format types
export enum ImportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx'
}

// Import options schema
const ImportOptionsSchema = z.object({
  format: z.nativeEnum(ImportFormat),
  entity: z.enum(['orders', 'vendors', 'requests', 'contracts', 'budgets']),
  data: z.array(z.record(z.any())),
  skipDuplicates: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  validateOnly: z.boolean().default(false),
  batchSize: z.number().min(1).max(100).default(50),
  onProgress: z.function().optional()
});

export type ImportOptions = z.infer<typeof ImportOptionsSchema>;

// Import job status
export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Import result
export interface ImportResult {
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  jobId?: string;
}

// Import error
export interface ImportError {
  row: number;
  field?: string;
  value?: unknown;
  message: string;
  code: string;
}

// Import warning
export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
}

// Import job
export interface ImportJob {
  id: string;
  status: ImportStatus;
  format: ImportFormat;
  entity: string;
  totalRecords: number;
  processedRecords: number;
  errors: number;
  warnings: number;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Procurement Import Service Class
 * Handles data import with validation, batch processing, and error handling
 */
export class ProcurementImportService {
  private supabase: unknown;
  private orgId: string;
  private userId: string;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase = createClient();
  }

  /**
   * Import data from various formats
   */
  async import(options: ImportOptions): Promise<ImportResult> {
    try {
      const validatedOptions = ImportOptionsSchema.parse(options);

      const result: ImportResult = {
        success: true,
        totalRecords: validatedOptions.data.length,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        skippedRecords: 0,
        errors: [],
        warnings: []
      };

      // Parse and validate data
      const parsedData = await this.parseImportData(validatedOptions);

      // Validate data
      const validationResult = await this.validateImportData(
        validatedOptions.entity,
        parsedData,
        validatedOptions.skipDuplicates,
        validatedOptions.updateExisting
      );

      result.errors = validationResult.errors;
      result.warnings = validationResult.warnings;

      if (validatedOptions.validateOnly) {
        result.processedRecords = parsedData.length;
        return result;
      }

      // Process import in batches
      const batches = this.chunkArray(parsedData, validatedOptions.batchSize);

      for (const batch of batches) {
        const batchResult = await this.processBatch(
          validatedOptions.entity,
          batch,
          validatedOptions.updateExisting,
          options.onProgress
        );

        result.processedRecords += batchResult.processed;
        result.successfulRecords += batchResult.successful;
        result.failedRecords += batchResult.failed;
        result.skippedRecords += batchResult.skipped;
        result.errors.push(...batchResult.errors);
      }

      result.success = result.failedRecords === 0;

      return result;
    } catch (error: unknown) {
      return {
        success: false,
        totalRecords: options.data.length,
        processedRecords: 0,
        successfulRecords: 0,
        failedRecords: options.data.length,
        skippedRecords: 0,
        errors: [{
          row: 0,
          message: error.message || 'Import failed',
          code: 'IMPORT_FAILED'
        }],
        warnings: []
      };
    }
  }

  /**
   * Parse import data based on format
   */
  private async parseImportData(options: ImportOptions): Promise<any[]> {
    const { format, data } = options;

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

  /**
   * Parse CSV data
   */
  private parseCSV(data: unknown[]): unknown[] {
    // Assume data is already parsed CSV rows as objects
    return data;
  }

  /**
   * Parse JSON data
   */
  private parseJSON(data: unknown[]): unknown[] {
    // Assume data is array of objects
    return data;
  }

  /**
   * Parse XLSX data
   */
  private parseXLSX(data: unknown[]): unknown[] {
    // For XLSX parsing, we'd need a library like xlsx
    // For now, assume data is already parsed
    console.warn('XLSX parsing not fully implemented');
    return data;
  }

  /**
   * Validate import data
   */
  private async validateImportData(
    entity: string,
    data: unknown[],
    skipDuplicates: boolean,
    updateExisting: boolean
  ): Promise<{ errors: ImportError[]; warnings: ImportWarning[] }> {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1;

      // Validate required fields
      const validationError = this.validateRow(entity, row, rowNumber);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      // Check for duplicates
      if (skipDuplicates || updateExisting) {
        const duplicateCheck = await this.checkForDuplicates(entity, row, rowNumber);
        if (duplicateCheck.isDuplicate) {
          if (skipDuplicates) {
            warnings.push({
              row: rowNumber,
              message: duplicateCheck.message
            });
          } else if (!updateExisting) {
            errors.push({
              row: rowNumber,
              message: duplicateCheck.message,
              code: 'DUPLICATE_RECORD'
            });
          }
        }
      }

      // Additional validations
      const additionalErrors = await this.validateBusinessRules(entity, row, rowNumber);
      errors.push(...additionalErrors);
    }

    return { errors, warnings };
  }

  /**
   * Validate individual row
   */
  private validateRow(entity: string, row: unknown, rowNumber: number): ImportError | null {
    try {
      switch (entity) {
        case 'orders':
          this.validatePurchaseOrder(row);
          break;
        case 'vendors':
          this.validateVendor(row);
          break;
        case 'requests':
          this.validateRequest(row);
          break;
        case 'contracts':
          this.validateContract(row);
          break;
        case 'budgets':
          this.validateBudget(row);
          break;
        default:
          throw new Error(`Unknown entity: ${entity}`);
      }
      return null;
    } catch (error: unknown) {
      return {
        row: rowNumber,
        message: error.message,
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Basic validation methods (simplified)
   */
  private validatePurchaseOrder(data: unknown): void {
    if (!data.po_number) throw new Error('PO number is required');
    if (!data.title) throw new Error('Title is required');
    if (!data.vendor_id && !data.vendor_name) throw new Error('Vendor is required');
    if (!data.total_amount) throw new Error('Total amount is required');
  }

  private validateVendor(data: unknown): void {
    if (!data.name) throw new Error('Vendor name is required');
    if (!data.contact_email) throw new Error('Email is required');
  }

  private validateRequest(data: unknown): void {
    if (!data.title) throw new Error('Title is required');
    if (!data.description) throw new Error('Description is required');
  }

  private validateContract(data: unknown): void {
    if (!data.title) throw new Error('Contract title is required');
    if (!data.vendor_id && !data.vendor_name) throw new Error('Vendor is required');
  }

  private validateBudget(data: unknown): void {
    if (!data.name) throw new Error('Budget name is required');
    if (!data.amount) throw new Error('Amount is required');
  }

  /**
   * Check for duplicate records
   */
  private async checkForDuplicates(
    entity: string,
    row: unknown,
    rowNumber: number
  ): Promise<{ isDuplicate: boolean; message: string }> {
    const table = this.getTableName(entity);

    let query = this.supabase
      .from(table)
      .select('id')
      .eq('organization_id', this.orgId);

    // Define uniqueness criteria for each entity
    switch (entity) {
      case 'orders':
        if (row.po_number) {
          query = query.eq('po_number', row.po_number);
        }
        break;
      case 'vendors':
        if (row.contact_email) {
          query = query.eq('contact_email', row.contact_email);
        }
        break;
      case 'contracts':
        if (row.contract_number) {
          query = query.eq('contract_number', row.contract_number);
        }
        break;
      case 'budgets':
        if (row.name) {
          query = query.eq('name', row.name);
        }
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Duplicate check failed:', error);
      return { isDuplicate: false, message: '' };
    }

    const isDuplicate = data && data.length > 0;

    return {
      isDuplicate,
      message: isDuplicate ? `Duplicate record found (existing ID: ${data[0].id})` : ''
    };
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    entity: string,
    row: unknown,
    rowNumber: number
  ): Promise<ImportError[]> {
    const errors: ImportError[] = [];

    // Check vendor references
    if ((entity === 'orders' || entity === 'contracts') && row.vendor_name && !row.vendor_id) {
      // Try to find vendor by name
      const { data: vendor } = await this.supabase
        .from('vendors')
        .select('id')
        .eq('organization_id', this.orgId)
        .eq('name', row.vendor_name)
        .single();

      if (vendor) {
        row.vendor_id = vendor.id;
      } else {
        errors.push({
          row: rowNumber,
          field: 'vendor_name',
          value: row.vendor_name,
          message: `Vendor "${row.vendor_name}" not found`,
          code: 'VENDOR_NOT_FOUND'
        });
      }
    }

    // Validate amounts
    if (row.total_amount && row.total_amount < 0) {
      errors.push({
        row: rowNumber,
        field: 'total_amount',
        value: row.total_amount,
        message: 'Total amount cannot be negative',
        code: 'INVALID_AMOUNT'
      });
    }

    // Validate dates
    if (row.delivery_date) {
      const deliveryDate = new Date(row.delivery_date);
      if (isNaN(deliveryDate.getTime())) {
        errors.push({
          row: rowNumber,
          field: 'delivery_date',
          value: row.delivery_date,
          message: 'Invalid delivery date format',
          code: 'INVALID_DATE'
        });
      }
    }

    return errors;
  }

  /**
   * Process batch of records
   */
  private async processBatch(
    entity: string,
    batch: unknown[],
    updateExisting: boolean,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{
    processed: number;
    successful: number;
    failed: number;
    skipped: number;
    errors: ImportError[];
  }> {
    const result = {
      processed: batch.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as ImportError[]
    };

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = i + 1;

      try {
        // Skip if marked for skipping
        if (row._skip) {
          result.skipped++;
          continue;
        }

        // Prepare data for insertion/update
        const preparedData = this.prepareDataForImport(entity, row);

        // Insert or update
        const table = this.getTableName(entity);
        const { data, error } = await this.supabase
          .from(table)
          .upsert(preparedData, {
            onConflict: updateExisting ? this.getConflictColumns(entity) : undefined
          })
          .select()
          .single();

        if (error) throw error;

        result.successful++;

        // Log import action
        await this.logImportAction(entity, 'INSERT', data.id);

      } catch (error: unknown) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: error.message || 'Import failed',
          code: 'IMPORT_ERROR'
        });
      }

      onProgress?.(i + 1, batch.length);
    }

    return result;
  }

  /**
   * Prepare data for import
   */
  private prepareDataForImport(entity: string, row: unknown): unknown {
    const baseData = {
      organization_id: this.orgId,
      ...row
    };

    // Add user references and timestamps
    switch (entity) {
      case 'orders':
        return {
          ...baseData,
          requested_by: this.userId,
          status: row.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      case 'vendors':
        return {
          ...baseData,
          status: row.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      case 'requests':
        return {
          ...baseData,
          requested_by: this.userId,
          status: row.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      case 'contracts':
        return {
          ...baseData,
          created_by: this.userId,
          status: row.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      case 'budgets':
        return {
          ...baseData,
          created_by: this.userId,
          status: row.status || 'active',
          spent: row.spent || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      default:
        return baseData;
    }
  }

  /**
   * Get conflict columns for upsert
   */
  private getConflictColumns(entity: string): string {
    switch (entity) {
      case 'orders':
        return 'organization_id,po_number';
      case 'vendors':
        return 'organization_id,contact_email';
      case 'contracts':
        return 'organization_id,contract_number';
      case 'budgets':
        return 'organization_id,name';
      default:
        return 'organization_id,id';
    }
  }

  /**
   * Get table name for entity
   */
  private getTableName(entity: string): string {
    const tableMap: Record<string, string> = {
      orders: 'purchase_orders',
      vendors: 'vendors',
      requests: 'procurement_requests',
      contracts: 'contracts',
      budgets: 'budgets'
    };

    return tableMap[entity] || entity;
  }

  /**
   * Log import action
   */
  private async logImportAction(entity: string, action: string, recordId: string): Promise<void> {
    try {
      await this.supabase
        .from('audit_logs')
        .insert({
          table_name: entity,
          record_id: recordId,
          operation: action as any,
          user_id: this.userId,
          organization_id: this.orgId,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      // Don't fail import if logging fails
      console.error('Import logging failed:', error);
    }
  }

  /**
   * Utility: Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Factory function
export function createProcurementImportService(
  orgId: string,
  userId: string
): ProcurementImportService {
  return new ProcurementImportService(orgId, userId);
}

// Utility functions
export function getSupportedImportFormats(): ImportFormat[] {
  return [ImportFormat.CSV, ImportFormat.JSON, ImportFormat.XLSX];
}

export function validateImportOptions(options: unknown): ImportOptions {
  return ImportOptionsSchema.parse(options);
}

export function generateImportTemplate(entity: string): unknown[] {
  // Return sample data structure for each entity
  switch (entity) {
    case 'orders':
      return [{
        po_number: 'PO-001',
        title: 'Office Supplies Order',
        description: 'Monthly office supplies',
        vendor_name: 'Office Depot',
        total_amount: 1500.00,
        currency: 'USD',
        delivery_date: '2025-12-01'
      }];
    case 'vendors':
      return [{
        name: 'ABC Supplies Inc.',
        contact_email: 'contact@abc.com',
        contact_phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        status: 'active',
        rating: 4.5
      }];
    default:
      return [];
  }
}
