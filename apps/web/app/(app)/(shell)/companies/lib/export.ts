/**
 * Companies Export Service
 * Handles data export operations with multiple formats
 * Supports CSV, Excel, JSON, PDF with background processing
 */

import { createClient } from '@/lib/supabase/client';
import type { Company } from '../types';

export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';
export type ExportScope = 'all' | 'filtered' | 'selected';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  filters?: Record<string, any>;
  selectedIds?: string[];
  fields?: string[];
  includeRelated?: boolean;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ExportFormat;
  fileUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class CompaniesExportService {
  private supabase = createClient();

  /**
   * Start background export job
   */
  async startExport(orgId: string, userId: string, options: ExportOptions): Promise<string> {
    const { data, error } = await this.supabase.rpc('start_company_export', {
      org_id: orgId,
      user_id: userId,
      export_options: options,
    });

    if (error) throw error;
    return data.job_id;
  }

  /**
   * Get export job status
   */
  async getExportStatus(jobId: string, orgId: string): Promise<ExportJob> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return {
      id: data.id,
      status: data.status,
      format: data.format,
      fileUrl: data.file_url,
      error: data.error_message,
      createdAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    };
  }

  /**
   * Get user's export history
   */
  async getExportHistory(orgId: string, userId: string, limit: number = 50): Promise<ExportJob[]> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('organization_id', orgId)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data.map(row => ({
      id: row.id,
      status: row.status,
      format: row.format,
      fileUrl: row.file_url,
      error: row.error_message,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    }));
  }

  /**
   * Synchronous export for small datasets
   */
  async exportCompaniesSync(orgId: string, options: ExportOptions): Promise<string> {
    // Get data
    const data = await this.getExportData(orgId, options);

    // Generate file based on format
    switch (options.format) {
      case 'csv':
        return this.generateCSV(data);
      case 'json':
        return this.generateJSON(data);
      case 'xlsx':
        return this.generateXLSX(data);
      case 'pdf':
        return this.generatePDF(data);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Get data for export
   */
  private async getExportData(orgId: string, options: ExportOptions): Promise<Company[]> {
    let query = this.supabase
      .from('companies')
      .select(options.includeRelated ? `
        *,
        contacts:company_contacts(*),
        contracts:company_contracts(*),
        qualifications:company_qualifications(*),
        ratings:company_ratings(*)
      ` : '*')
      .eq('organization_id', orgId);

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    // Apply selected IDs
    if (options.scope === 'selected' && options.selectedIds) {
      query = query.in('id', options.selectedIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Generate CSV content
   */
  private generateCSV(data: Company[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Generate JSON content
   */
  private generateJSON(data: Company[]): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate XLSX (placeholder - would use a library like xlsx)
   */
  private generateXLSX(data: Company[]): string {
    // In real implementation, use xlsx library
    throw new Error('XLSX export not implemented');
  }

  /**
   * Generate PDF (placeholder - would use a library like pdfkit)
   */
  private generatePDF(data: Company[]): string {
    // In real implementation, use pdf library
    throw new Error('PDF export not implemented');
  }

  /**
   * Validate export options
   */
  validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['csv', 'xlsx', 'json', 'pdf'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (!['all', 'filtered', 'selected'].includes(options.scope)) {
      errors.push('Invalid export scope');
    }

    if (options.scope === 'selected' && (!options.selectedIds || options.selectedIds.length === 0)) {
      errors.push('Selected IDs required for selected scope');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get export templates
   */
  getExportTemplates(): Array<{ id: string; name: string; description: string; fields: string[] }> {
    return [
      {
        id: 'basic',
        name: 'Basic Company Info',
        description: 'Name, industry, status, and contact info',
        fields: ['name', 'industry', 'status', 'email', 'phone', 'website'],
      },
      {
        id: 'detailed',
        name: 'Detailed Company Profile',
        description: 'Complete company information including address and metadata',
        fields: ['name', 'description', 'industry', 'status', 'email', 'phone', 'website', 'address', 'size', 'founded_year'],
      },
      {
        id: 'analytics',
        name: 'Analytics Export',
        description: 'Company data optimized for analytics and reporting',
        fields: ['name', 'industry', 'size', 'status', 'founded_year', 'created_at', 'updated_at'],
      },
    ];
  }
}

export const companiesExportService = new CompaniesExportService();
