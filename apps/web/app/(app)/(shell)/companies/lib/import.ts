/**
 * Companies Import Service
 * Handles data import operations with multiple formats
 * Supports CSV, Excel, JSON with validation and background processing
 */

import { createClient } from '@/lib/supabase/client';
import type { CreateCompanyInput } from '../types';
import { companiesValidationsService } from './validations';

export type ImportFormat = 'csv' | 'xlsx' | 'json';
export type ImportMode = 'create' | 'update' | 'upsert';

export interface ImportOptions {
  format: ImportFormat;
  mode: ImportMode;
  file: File;
  fieldMapping?: Record<string, string>;
  skipValidation?: boolean;
  batchSize?: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: Array<{ row: number; field?: string; message: string }>;
  warnings: Array<{ row: number; message: string }>;
}

export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ImportResult;
  createdAt: Date;
  completedAt?: Date;
}

export class CompaniesImportService {
  private supabase = createClient();

  /**
   * Start background import job
   */
  async startImport(orgId: string, userId: string, options: ImportOptions): Promise<string> {
    // Validate file
    const validation = await this.validateImportFile(options.file, options.format);
    if (!validation.valid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    // Parse file
    const data = await this.parseImportFile(options.file, options.format);

    // Validate data
    const dataValidation = this.validateImportData(data, options.fieldMapping);
    if (!dataValidation.valid && !options.skipValidation) {
      throw new Error(`Invalid data: ${dataValidation.errors.join(', ')}`);
    }

    // Start import job
    const { data: job, error } = await this.supabase.rpc('start_company_import', {
      org_id: orgId,
      user_id: userId,
      import_data: data,
      import_options: options
    });

    if (error) throw error;
    return job.job_id;
  }

  /**
   * Get import job status
   */
  async getImportStatus(jobId: string, orgId: string): Promise<ImportJob> {
    const { data, error } = await this.supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return {
      id: data.id,
      status: data.status,
      result: data.result,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined
    };
  }

  /**
   * Synchronous import for small datasets
   */
  async importCompaniesSync(orgId: string, userId: string, options: ImportOptions): Promise<ImportResult> {
    // Parse file
    const data = await this.parseImportFile(options.file, options.format);

    // Apply field mapping
    const mappedData = this.applyFieldMapping(data, options.fieldMapping);

    // Validate data
    const validation = this.validateImportData(mappedData);
    if (!validation.valid) {
      return {
        success: false,
        totalRows: data.length,
        processedRows: 0,
        createdRows: 0,
        updatedRows: 0,
        skippedRows: data.length,
        errors: validation.errors.map(error => ({ row: error.row, message: error.message })),
        warnings: []
      };
    }

    // Process import
    return await this.processImport(mappedData, orgId, userId, options.mode);
  }

  /**
   * Validate import file
   */
  private async validateImportFile(file: File, format: ImportFormat): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = {
      csv: ['text/csv', 'application/csv'],
      xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      json: ['application/json']
    };

    if (!allowedTypes[format].includes(file.type)) {
      errors.push(`Invalid file type for ${format} format`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Parse import file
   */
  private async parseImportFile(file: File, format: ImportFormat): Promise<Record<string, any>[]> {
    const content = await file.text();

    switch (format) {
      case 'csv':
        return this.parseCSV(content);
      case 'json':
        return JSON.parse(content);
      case 'xlsx':
        // Would use xlsx library in real implementation
        throw new Error('XLSX parsing not implemented');
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): Record<string, any>[] {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).filter(line => line.trim());

    return rows.map((line, index) => {
      const values = this.parseCSVLine(line);
      const row: Record<string, any> = {};

      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      return row;
    });
  }

  /**
   * Parse CSV line handling quotes
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Apply field mapping
   */
  private applyFieldMapping(data: Record<string, any>[], mapping?: Record<string, string>): Record<string, any>[] {
    if (!mapping) return data;

    return data.map(row => {
      const mappedRow: Record<string, any> = {};

      Object.entries(row).forEach(([key, value]) => {
        const mappedKey = mapping[key] || key;
        mappedRow[mappedKey] = value;
      });

      return mappedRow;
    });
  }

  /**
   * Validate import data
   */
  private validateImportData(data: Record<string, any>[], mapping?: Record<string, string>): { valid: boolean; errors: Array<{ row: number; field?: string; message: string }> } {
    const errors: Array<{ row: number; field?: string; message: string }> = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // 1-indexed, plus header

      // Check required fields
      if (!row.name || row.name.trim() === '') {
        errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
      }

      // Validate using schema
      const validation = companiesValidationsService.validateCreate(row);
      if (!validation.success) {
        validation.error.errors.forEach(error => {
          errors.push({
            row: rowNumber,
            field: error.path.join('.'),
            message: error.message
          });
        });
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Process import
   */
  private async processImport(data: Record<string, any>[], orgId: string, userId: string, mode: ImportMode): Promise<ImportResult> {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ row: number; field?: string; message: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        switch (mode) {
          case 'create':
            await this.supabase.from('companies').insert({
              ...row,
              organization_id: orgId,
              created_by: userId
            });
            created++;
            break;

          case 'update':
            if (!row.id) {
              errors.push({ row: rowNumber, message: 'ID required for update mode' });
              skipped++;
              continue;
            }
            await this.supabase.from('companies').update(row).eq('id', row.id);
            updated++;
            break;

          case 'upsert':
            const { data: existing } = await this.supabase
              .from('companies')
              .select('id')
              .eq('name', row.name)
              .eq('organization_id', orgId)
              .single();

            if (existing) {
              await this.supabase.from('companies').update(row).eq('id', existing.id);
              updated++;
            } else {
              await this.supabase.from('companies').insert({
                ...row,
                organization_id: orgId,
                created_by: userId
              });
              created++;
            }
            break;
        }
      } catch (error) {
        errors.push({ row: rowNumber, message: error.message });
        skipped++;
      }
    }

    return {
      success: errors.length === 0,
      totalRows: data.length,
      processedRows: created + updated,
      createdRows: created,
      updatedRows: updated,
      skippedRows: skipped,
      errors,
      warnings: []
    };
  }

  /**
   * Get import templates
   */
  getImportTemplates(): Array<{ id: string; name: string; description: string; fields: string[]; sample: Record<string, any> }> {
    return [
      {
        id: 'basic',
        name: 'Basic Company Info',
        description: 'Name, industry, and basic contact info',
        fields: ['name', 'industry', 'email', 'phone', 'website'],
        sample: {
          name: 'Acme Corp',
          industry: 'Technology',
          email: 'contact@acme.com',
          phone: '+1-555-0123',
          website: 'https://acme.com'
        }
      },
      {
        id: 'detailed',
        name: 'Detailed Company Profile',
        description: 'Complete company information including address',
        fields: ['name', 'description', 'industry', 'email', 'phone', 'website', 'street', 'city', 'state', 'zip_code', 'country', 'size', 'founded_year'],
        sample: {
          name: 'TechStart Inc',
          description: 'Leading technology solutions provider',
          industry: 'Technology',
          email: 'info@techstart.com',
          phone: '+1-555-0456',
          website: 'https://techstart.com',
          street: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zip_code: '94105',
          country: 'USA',
          size: 'medium',
          founded_year: 2018
        }
      },
    ];
  }
}

export const companiesImportService = new CompaniesImportService();
