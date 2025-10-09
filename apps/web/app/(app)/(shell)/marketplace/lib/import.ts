import { tryCatch, reportError } from '@ghxstship/ui';
// import Papa from 'papaparse'; // TODO: Install papaparse
import type { MarketplaceListing, UpsertListingDto } from '../types';
import { marketplaceMutationService } from './mutations';
import { validateListingData } from './validations';

// Import service for marketplace data
export class MarketplaceImportService {
  // CSV Import
  async importFromCSV(
    orgId: string,
    userId: string,
    csvData: string,
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateOnly?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
    preview?: unknown[];
  }> {
    return tryCatch(async () => {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => this.normalizeHeader(header)
      });

      if (result.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      const listings = result.data as any[];
      return this.processImportListings(orgId, userId, listings, options);
    }, 'MarketplaceImportService.importFromCSV');
  }

  // JSON Import
  async importFromJSON(
    orgId: string,
    userId: string,
    jsonData: string,
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateOnly?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
    preview?: unknown[];
  }> {
    return tryCatch(async () => {
      const listings = JSON.parse(jsonData);

      if (!Array.isArray(listings)) {
        throw new Error('JSON data must be an array of listings');
      }

      return this.processImportListings(orgId, userId, listings, options);
    }, 'MarketplaceImportService.importFromJSON');
  }

  // Excel Import (expects parsed data structure)
  async importFromExcelData(
    orgId: string,
    userId: string,
    excelData: unknown[],
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateOnly?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
    preview?: unknown[];
  }> {
    return tryCatch(async () => {
      return this.processImportListings(orgId, userId, excelData, options);
    }, 'MarketplaceImportService.importFromExcelData');
  }

  // Bulk import with progress tracking
  async importBulk(
    orgId: string,
    userId: string,
    format: 'csv' | 'json' | 'excel',
    data: string | any[],
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateOnly?: boolean;
      batchSize?: number;
    } = {},
    onProgress?: (progress: { completed: number; total: number; errors: number }) => void
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    return tryCatch(async () => {
      const batchSize = options.batchSize || 50;
      let imported = 0;
      let skipped = 0;
      const errors: Array<{ row: number; error: string }> = [];

      // Parse data based on format
      let listings: unknown[] = [];

      if (format === 'csv' && typeof data === 'string') {
        const result = Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => this.normalizeHeader(header)
        });
        listings = result.data as any[];
      } else if (format === 'json' && typeof data === 'string') {
        listings = JSON.parse(data);
      } else if (format === 'excel' && Array.isArray(data)) {
        listings = data;
      }

      // Process in batches
      for (let i = 0; i < listings.length; i += batchSize) {
        const batch = listings.slice(i, i + batchSize);
        const batchResult = await this.processImportListings(orgId, userId, batch, {
          ...options,
          startRow: i + 1
        });

        imported += batchResult.imported;
        skipped += batchResult.skipped;
        errors.push(...batchResult.errors);

        onProgress?.({
          completed: Math.min(i + batchSize, listings.length),
          total: listings.length,
          errors: errors.length
        });
      }

      return {
        success: errors.length === 0,
        imported,
        skipped,
        errors
      };
    }, 'MarketplaceImportService.importBulk');
  }

  // Preview import data
  async previewImport(
    format: 'csv' | 'json' | 'excel',
    data: string | any[],
    maxRows: number = 5
  ): Promise<{
    headers: string[];
    preview: unknown[];
    totalRows: number;
  }> {
    return tryCatch(async () => {
      let parsedData: unknown[] = [];
      let headers: string[] = [];

      if (format === 'csv' && typeof data === 'string') {
        const result = Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
          preview: maxRows + 1, // +1 for headers
          transformHeader: (header: string) => this.normalizeHeader(header)
        });
        parsedData = result.data as any[];
        headers = result.meta.fields || [];
      } else if (format === 'json' && typeof data === 'string') {
        const jsonData = JSON.parse(data);
        parsedData = Array.isArray(jsonData) ? jsonData.slice(0, maxRows) : [jsonData];
        headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
      } else if (format === 'excel' && Array.isArray(data)) {
        parsedData = data.slice(0, maxRows);
        headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
      }

      return {
        headers,
        preview: parsedData,
        totalRows: this.getTotalRows(format, data)
      };
    }, 'MarketplaceImportService.previewImport');
  }

  // Import templates and field mapping
  getImportTemplates() {
    return {
      basic: {
        name: 'Basic Listing Template',
        description: 'Essential fields for quick listing import',
        requiredFields: ['title', 'type', 'category'],
        optionalFields: ['description', 'status'],
        example: {
          title: 'Professional Photography Services',
          type: 'offer',
          category: 'services',
          description: 'High-quality event photography services',
          status: 'active'
        }
      },
      detailed: {
        name: 'Detailed Listing Template',
        description: 'Complete listing information with pricing and location',
        requiredFields: ['title', 'type', 'category', 'description'],
        optionalFields: ['status', 'amount', 'currency', 'city', 'country', 'isRemote', 'featured'],
        example: {
          title: 'Catering Services for Corporate Events',
          type: 'offer',
          category: 'services',
          description: 'Full-service catering for corporate events, weddings, and parties',
          status: 'active',
          amount: 150,
          currency: 'USD',
          city: 'New York',
          country: 'USA',
          isRemote: false,
          featured: true
        }
      },
      vendor: {
        name: 'Vendor Profile Template',
        description: 'Template for importing vendor profile data',
        requiredFields: ['businessName', 'email', 'primaryCategory'],
        optionalFields: ['tagline', 'bio', 'phone', 'website', 'hourlyRate', 'currency'],
        example: {
          businessName: 'ABC Photography',
          email: 'contact@abcphoto.com',
          primaryCategory: 'photography',
          tagline: 'Capturing your special moments',
          bio: 'Professional photographer with 10+ years experience',
          phone: '+1-555-0123',
          website: 'https://abcphoto.com',
          hourlyRate: 150,
          currency: 'USD'
        }
      }
    };
  }

  getFieldMappings() {
    return {
      // Listing fields
      title: ['title', 'name', 'listing_title', 'listing_name'],
      description: ['description', 'desc', 'details', 'info'],
      type: ['type', 'listing_type', 'offer_type'],
      category: ['category', 'listing_category', 'service_category'],
      status: ['status', 'listing_status', 'state'],
      amount: ['amount', 'price', 'cost', 'rate', 'pricing.amount'],
      currency: ['currency', 'curr', 'pricing.currency'],
      city: ['city', 'location.city'],
      country: ['country', 'location.country'],
      isRemote: ['isRemote', 'remote', 'location.isRemote'],
      featured: ['featured', 'is_featured', 'promoted'],

      // Vendor fields
      businessName: ['businessName', 'business_name', 'company', 'vendor_name'],
      email: ['email', 'contact_email', 'business_email'],
      phone: ['phone', 'contact_phone', 'business_phone'],
      website: ['website', 'site', 'url', 'business_website'],
      primaryCategory: ['primaryCategory', 'main_category', 'category'],
      tagline: ['tagline', 'slogan', 'headline'],
      bio: ['bio', 'description', 'about', 'profile'],
      hourlyRate: ['hourlyRate', 'rate', 'hourly_rate']
    };
  }

  // Private utility methods
  private async processImportListings(
    orgId: string,
    userId: string,
    listings: unknown[],
    options: {
      skipDuplicates?: boolean;
      updateExisting?: boolean;
      validateOnly?: boolean;
      startRow?: number;
    } = {}
  ): Promise<{
    success: boolean;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
    preview?: unknown[];
  }> {
    const { skipDuplicates = true, updateExisting = false, validateOnly = false, startRow = 1 } = options;

    let imported = 0;
    let skipped = 0;
    const errors: Array<{ row: number; error: string }> = [];

    if (validateOnly) {
      // Return preview data for validation
      const preview = listings.slice(0, 5).map((listing, index) => ({
        row: startRow + index,
        data: this.transformImportData(listing),
        valid: validateListingData(this.transformImportData(listing)).success
      }));

      return {
        success: true,
        imported: 0,
        skipped: 0,
        errors: [],
        preview
      };
    }

    for (let i = 0; i < listings.length; i++) {
      const rowNumber = startRow + i;
      const rawListing = listings[i];

      try {
        const listingData = this.transformImportData(rawListing);
        const validation = validateListingData(listingData);

        if (!validation.success) {
          errors.push({
            row: rowNumber,
            error: `Validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`
          });
          continue;
        }

        // Check for duplicates if requested
        if (skipDuplicates) {
          const isDuplicate = await this.checkForDuplicate(orgId, listingData);
          if (isDuplicate) {
            skipped++;
            continue;
          }
        }

        // Create or update the listing
        await marketplaceMutationService.createListing(orgId, userId, listingData);
        imported++;

      } catch (error) {
        errors.push({
          row: rowNumber,
          error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return {
      success: errors.length === 0,
      imported,
      skipped,
      errors
    };
  }

  private transformImportData(rawData: unknown): UpsertListingDto {
    const transformed: unknown = {};

    // Map fields using field mappings
    Object.entries(this.getFieldMappings()).forEach(([targetField, sourceFields]) => {
      for (const sourceField of sourceFields) {
        if (rawData[sourceField] !== undefined && rawData[sourceField] !== null && rawData[sourceField] !== '') {
          if (targetField.includes('.')) {
            // Handle nested fields like pricing.amount
            const [parent, child] = targetField.split('.');
            if (!transformed[parent]) transformed[parent] = {};
            transformed[parent][child] = this.parseFieldValue(targetField, rawData[sourceField]);
          } else {
            transformed[targetField] = this.parseFieldValue(targetField, rawData[sourceField]);
          }
          break; // Use first matching field
        }
      }
    });

    // Set defaults for required fields if not provided
    if (!transformed.status) transformed.status = 'draft';
    if (!transformed.type) transformed.type = 'offer';
    if (!transformed.category) transformed.category = 'other';

    return transformed as UpsertListingDto;
  }

  private parseFieldValue(field: string, value: unknown): unknown {
    if (value === null || value === undefined || value === '') return undefined;

    // Boolean fields
    if (['featured', 'isRemote'].includes(field)) {
      return this.parseBoolean(value);
    }

    // Numeric fields
    if (['amount', 'hourlyRate'].includes(field)) {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    }

    // String fields
    return String(value).trim();
  }

  private parseBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return ['true', 'yes', '1', 'on'].includes(lower);
    }
    if (typeof value === 'number') return value === 1;
    return false;
  }

  private normalizeHeader(header: string): string {
    return header
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private async checkForDuplicate(orgId: string, listingData: UpsertListingDto): Promise<boolean> {
    // Simple duplicate check based on title - in a real implementation,
    // you might want more sophisticated duplicate detection
    try {
      const { data } = await this.supabase
        .from('marketplace_listings')
        .select('id')
        .eq('organization_id', orgId)
        .eq('title', listingData.title)
        .limit(1);

      return (data?.length || 0) > 0;
    } catch {
      return false;
    }
  }

  private getTotalRows(format: string, data: string | any[]): number {
    if (Array.isArray(data)) return data.length;

    if (typeof data === 'string') {
      if (format === 'csv') {
        return data.split('\n').length - 1; // Subtract header row
      }
      if (format === 'json') {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          return 0;
        }
      }
    }

    return 0;
  }
}

export const marketplaceImportService = new MarketplaceImportService();
