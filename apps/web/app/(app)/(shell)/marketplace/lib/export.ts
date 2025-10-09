import { tryCatch, reportError } from '@ghxstship/ui';
import type { MarketplaceListing, ListingFilters } from '../types';
import { marketplaceQueryService } from './queries';

// Export service for marketplace data
export class MarketplaceExportService {
  // CSV Export
  async exportToCSV(orgId: string, filters?: ListingFilters, fields?: string[]): Promise<string> {
    return tryCatch(async () => {
      const listings = await marketplaceQueryService.getListings(orgId, filters);
      const selectedFields = fields || this.getDefaultFields();

      const csvHeaders = selectedFields.map(field => this.formatHeader(field)).join(',');
      const csvRows = listings.map(listing => this.listingToCSVRow(listing, selectedFields)).join('\n');

      return `${csvHeaders}\n${csvRows}`;
    }, 'MarketplaceExportService.exportToCSV');
  }

  // JSON Export
  async exportToJSON(orgId: string, filters?: ListingFilters, fields?: string[]): Promise<string> {
    return tryCatch(async () => {
      const listings = await marketplaceQueryService.getListings(orgId, filters);
      const selectedFields = fields || this.getDefaultFields();

      const exportData = listings.map(listing => this.filterFields(listing, selectedFields));
      return JSON.stringify(exportData, null, 2);
    }, 'MarketplaceExportService.exportToJSON');
  }

  // Excel Export (returns data structure for exceljs or similar)
  async exportToExcelData(orgId: string, filters?: ListingFilters, fields?: string[]): Promise<unknown> {
    return tryCatch(async () => {
      const listings = await marketplaceQueryService.getListings(orgId, filters);
      const selectedFields = fields || this.getDefaultFields();

      const headers = selectedFields.map(field => ({
        header: this.formatHeader(field),
        key: field,
        width: this.getColumnWidth(field)
      }));

      const rows = listings.map(listing => this.filterFields(listing, selectedFields));

      return {
        headers,
        rows,
        worksheetName: 'Marketplace Listings',
        filename: `marketplace-listings-${new Date().toISOString().split('T')[0]}.xlsx`
      };
    }, 'MarketplaceExportService.exportToExcelData');
  }

  // PDF Export (returns data structure for pdf generation)
  async exportToPDFData(orgId: string, filters?: ListingFilters, fields?: string[]): Promise<unknown> {
    return tryCatch(async () => {
      const listings = await marketplaceQueryService.getListings(orgId, filters);
      const selectedFields = fields || this.getDefaultFields();

      const exportData = listings.map(listing => this.filterFields(listing, selectedFields));

      return {
        title: 'Marketplace Listings Export',
        headers: selectedFields.map(field => this.formatHeader(field)),
        data: exportData,
        filename: `marketplace-listings-${new Date().toISOString().split('T')[0]}.pdf`,
        generatedAt: new Date().toISOString(),
        filters: filters || {},
        recordCount: listings.length
      };
    }, 'MarketplaceExportService.exportToPDFData');
  }

  // Bulk export with progress tracking
  async exportBulk(
    orgId: string,
    format: 'csv' | 'json' | 'excel' | 'pdf',
    filters?: ListingFilters,
    fields?: string[],
    onProgress?: (progress: number) => void
  ): Promise<unknown> {
    return tryCatch(async () => {
      onProgress?.(10);

      let result: unknown;
      switch (format) {
        case 'csv':
          result = await this.exportToCSV(orgId, filters, fields);
          break;
        case 'json':
          result = await this.exportToJSON(orgId, filters, fields);
          break;
        case 'excel':
          result = await this.exportToExcelData(orgId, filters, fields);
          break;
        case 'pdf':
          result = await this.exportToPDFData(orgId, filters, fields);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      onProgress?.(100);
      return result;
    }, 'MarketplaceExportService.exportBulk');
  }

  // Export templates
  getExportTemplates() {
    return {
      basic: {
        name: 'Basic Listing Info',
        fields: ['title', 'type', 'category', 'status', 'created_at'],
        description: 'Essential listing information for quick overview'
      },
      detailed: {
        name: 'Detailed Listing Info',
        fields: ['title', 'description', 'type', 'category', 'status', 'pricing.amount', 'pricing.currency', 'location.city', 'location.country', 'featured', 'response_count', 'created_at', 'updated_at'],
        description: 'Complete listing information including pricing and location'
      },
      vendor: {
        name: 'Vendor-Focused Export',
        fields: ['title', 'type', 'category', 'pricing.amount', 'pricing.currency', 'contactInfo.preferredMethod', 'contactInfo.email', 'contactInfo.phone', 'organization.name'],
        description: 'Listing information optimized for vendor outreach'
      },
      analytics: {
        name: 'Analytics Export',
        fields: ['title', 'type', 'category', 'status', 'featured', 'view_count', 'response_count', 'created_at', 'organization.name', 'creator.name'],
        description: 'Data optimized for marketplace analytics and reporting'
      }
    };
  }

  // Field filtering and formatting utilities
  private getDefaultFields(): string[] {
    return [
      'title',
      'type',
      'category',
      'status',
      'pricing.amount',
      'pricing.currency',
      'location.city',
      'location.country',
      'featured',
      'response_count',
      'created_at',
      'updated_at'
    ];
  }

  private filterFields(listing: MarketplaceListing, fields: string[]): unknown {
    const result: unknown = {};

    fields.forEach(field => {
      const value = this.getNestedValue(listing, field);
      result[field] = this.formatValue(value, field);
    });

    return result;
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: unknown, field: string): unknown {
    if (value === null || value === undefined) return '';

    // Format dates
    if (field.includes('created_at') || field.includes('updated_at') || field.includes('expires_at')) {
      return value ? new Date(value).toISOString().split('T')[0] : '';
    }

    // Format currency
    if (field.includes('amount') && typeof value === 'number') {
      return value.toFixed(2);
    }

    // Format booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value;
  }

  private formatHeader(field: string): string {
    return field
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private getColumnWidth(field: string): number {
    const widthMap: Record<string, number> = {
      'title': 30,
      'description': 50,
      'type': 10,
      'category': 15,
      'status': 10,
      'pricing.amount': 12,
      'pricing.currency': 8,
      'location.city': 15,
      'location.country': 15,
      'featured': 8,
      'response_count': 12,
      'view_count': 10,
      'created_at': 12,
      'updated_at': 12,
      'expires_at': 12
    };

    return widthMap[field] || 15;
  }

  private listingToCSVRow(listing: MarketplaceListing, fields: string[]): string {
    return fields
      .map(field => {
        const value = this.getNestedValue(listing, field);
        const formatted = this.formatValue(value, field);

        // Escape CSV values that contain commas, quotes, or newlines
        if (typeof formatted === 'string' && (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n'))) {
          return `"${formatted.replace(/"/g, '""')}"`;
        }

        return formatted;
      })
      .join(',');
  }

  // Export metadata and statistics
  async getExportMetadata(orgId: string, filters?: ListingFilters): Promise<unknown> {
    return tryCatch(async () => {
      const listings = await marketplaceQueryService.getListings(orgId, filters);

      return {
        totalRecords: listings.length,
        exportDate: new Date().toISOString(),
        filters: filters || {},
        fieldCount: this.getDefaultFields().length,
        estimatedFileSize: this.estimateFileSize(listings),
        availableFormats: ['csv', 'json', 'excel', 'pdf'],
        availableTemplates: Object.keys(this.getExportTemplates())
      };
    }, 'MarketplaceExportService.getExportMetadata');
  }

  private estimateFileSize(listings: MarketplaceListing[]): string {
    // Rough estimation: average 500 bytes per listing
    const estimatedBytes = listings.length * 500;

    if (estimatedBytes < 1024) return `${estimatedBytes} B`;
    if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(1)} KB`;
    return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export const marketplaceExportService = new MarketplaceExportService();
