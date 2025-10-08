/**
 * Procurement Export Service
 * Data export functionality with multiple formats (CSV, JSON, XLSX)
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Export format types
export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
  PDF = 'pdf'
}

// Export options schema
const ExportOptionsSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  entity: z.enum(['orders', 'vendors', 'requests', 'contracts', 'budgets']),
  filters: z.record(z.any()).optional(),
  fields: z.array(z.string()).optional(),
  includeRelated: z.boolean().default(false),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  filename: z.string().optional()
});

export type ExportOptions = z.infer<typeof ExportOptionsSchema>;

// Export job status
export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Export job interface
export interface ExportJob {
  id: string;
  status: ExportStatus;
  format: ExportFormat;
  entity: string;
  recordCount: number;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Export result
export interface ExportResult {
  success: boolean;
  data?: Blob | string;
  filename: string;
  recordCount: number;
  error?: string;
}

/**
 * Procurement Export Service Class
 * Handles data export with multiple formats and large dataset support
 */
export class ProcurementExportService {
  private supabase: unknown;
  private orgId: string;
  private userId: string;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase = createClient();
  }

  /**
   * Export data in specified format
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    try {
      // Validate options
      const validatedOptions = ExportOptionsSchema.parse(options);

      // Fetch data
      const data = await this.fetchData(validatedOptions);

      if (data.length === 0) {
        return {
          success: false,
          filename: this.generateFilename(validatedOptions),
          recordCount: 0,
          error: 'No data found matching the criteria'
        };
      }

      // Process data based on format
      switch (validatedOptions.format) {
        case ExportFormat.CSV:
          return await this.exportToCSV(data, validatedOptions);
        case ExportFormat.JSON:
          return await this.exportToJSON(data, validatedOptions);
        case ExportFormat.XLSX:
          return await this.exportToXLSX(data, validatedOptions);
        case ExportFormat.PDF:
          return await this.exportToPDF(data, validatedOptions);
        default:
          throw new Error(`Unsupported export format: ${validatedOptions.format}`);
      }
    } catch (error: unknown) {
      return {
        success: false,
        filename: this.generateFilename(options),
        recordCount: 0,
        error: error.message || 'Export failed'
      };
    }
  }

  /**
   * Fetch data for export with filters and field selection
   */
  private async fetchData(options: ExportOptions): Promise<any[]> {
    const {
      entity,
      filters = {},
      fields,
      includeRelated,
      dateRange
    } = options;

    // Build query
    let query = this.supabase
      .from(this.getTableName(entity))
      .select(fields ? fields.join(',') : '*')
      .eq('organization_id', this.orgId);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply date range if specified
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    // Include related data if requested
    if (includeRelated) {
      query = this.addRelatedData(query, entity);
    }

    // Execute query
    const { data, error } = await query;

    if (error) throw error;

    return data || [];
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
   * Add related data to query
   */
  private addRelatedData(query: unknown, entity: string): unknown {
    switch (entity) {
      case 'orders':
        return query.select(`
          *,
          vendor:vendors(name, contact_email),
          requested_by:users(name, email)
        `);
      case 'requests':
        return query.select(`
          *,
          requested_by:users(name, email)
        `);
      case 'contracts':
        return query.select(`
          *,
          vendor:vendors(name, contact_email),
          created_by:users(name, email)
        `);
      default:
        return query;
    }
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(data: unknown[], options: ExportOptions): Promise<ExportResult> {
    const filename = this.generateFilename(options);

    // Flatten nested objects for CSV
    const flattenedData = data.map(item => this.flattenObject(item));

    // Get all unique keys
    const allKeys = new Set<string>();
    flattenedData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // Create CSV content
    const csvRows = [
      headers.join(','),
      ...flattenedData.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma or quote
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    return {
      success: true,
      data: csvContent,
      filename: `${filename}.csv`,
      recordCount: data.length
    };
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(data: unknown[], options: ExportOptions): Promise<ExportResult> {
    const filename = this.generateFilename(options);
    const jsonContent = JSON.stringify(data, null, 2);

    return {
      success: true,
      data: jsonContent,
      filename: `${filename}.json`,
      recordCount: data.length
    };
  }

  /**
   * Export to XLSX format
   */
  private async exportToXLSX(data: unknown[], options: ExportOptions): Promise<ExportResult> {
    const filename = this.generateFilename(options);

    // For XLSX export, we'd need a library like xlsx
    // For now, return CSV as XLSX is not implemented in this environment
    console.warn('XLSX export not fully implemented, returning CSV format');

    return this.exportToCSV(data, { ...options, format: ExportFormat.CSV });
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(data: unknown[], options: ExportOptions): Promise<ExportResult> {
    const filename = this.generateFilename(options);

    // For PDF export, we'd need a library like jsPDF or Puppeteer
    // For now, return JSON as PDF is not implemented in this environment
    console.warn('PDF export not fully implemented, returning JSON format');

    return this.exportToJSON(data, options);
  }

  /**
   * Flatten nested objects for CSV export
   */
  private flattenObject(obj: unknown, prefix: string = ''): unknown {
    const flattened: unknown = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Flatten nested object
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[newKey] = value.join('; ');
      } else {
        flattened[newKey] = value;
      }
    });

    return flattened;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(options: ExportOptions): string {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
    const entity = options.entity;
    const customName = options.filename || `${entity}_export_${timestamp}`;

    return customName;
  }

  /**
   * Create downloadable blob from export result
   */
  createDownloadBlob(result: ExportResult): Blob {
    if (typeof result.data === 'string') {
      return new Blob([result.data], {
        type: result.filename.endsWith('.json') ? 'application/json' :
              result.filename.endsWith('.csv') ? 'text/csv' :
              'application/octet-stream'
      });
    }

    return result.data as Blob;
  }

  /**
   * Trigger download in browser
   */
  downloadResult(result: ExportResult): void {
    const blob = this.createDownloadBlob(result);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Get export history for user
   */
  async getExportHistory(limit: number = 50): Promise<ExportJob[]> {
    // This would require an export_jobs table
    // For now, return empty array
    console.warn('Export history not implemented - requires export_jobs table');
    return [];
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(daysOld: number = 30): Promise<number> {
    // This would clean up old export files from storage
    console.warn('Export cleanup not implemented');
    return 0;
  }
}

// Factory function
export function createProcurementExportService(
  orgId: string,
  userId: string
): ProcurementExportService {
  return new ProcurementExportService(orgId, userId);
}

// Utility functions
export function formatExportFilename(entity: string, format: ExportFormat, timestamp?: Date): string {
  const ts = timestamp || new Date();
  const dateStr = ts.toISOString().slice(0, 10);
  return `${entity}_export_${dateStr}.${format}`;
}

export function validateExportOptions(options: unknown): ExportOptions {
  return ExportOptionsSchema.parse(options);
}

export function getSupportedFormats(): ExportFormat[] {
  return [ExportFormat.CSV, ExportFormat.JSON, ExportFormat.XLSX, ExportFormat.PDF];
}

export function getFormatMimeType(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.CSV: return 'text/csv';
    case ExportFormat.JSON: return 'application/json';
    case ExportFormat.XLSX: return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case ExportFormat.PDF: return 'application/pdf';
    default: return 'application/octet-stream';
  }
}
