/**
 * Programming Module Import Service
 * Handles data import functionality for all entities
 */
import type {
  ImportResult,
  ImportError,
  ProgrammingEvent,
  Performance,
  CallSheet,
  Rider,
  Itinerary,
  Lineup,
  Space,
  Workshop
} from '../types';
import { programmingMutations } from './mutations';
import { programmingValidations } from './validations';

export class ProgrammingImportService {
  /**
   * Import events from CSV data
   */
  async importEvents(
    csvData: string,
    organizationId: string,
    userId: string,
    options: {
      skipValidation?: boolean;
      updateExisting?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<ImportResult> {
    const { skipValidation = false, updateExisting = false, batchSize = 50 } = options;

    try {
      // Parse CSV data
      const rows = this.parseCSV(csvData);
      if (rows.length === 0) {
        return {
          success: false,
          total_processed: 0,
          successful: 0,
          failed: 0,
          errors: [{ row: 0, error: 'No data rows found in CSV' }]
        };
      }

      // Extract headers from first row
      const headers = rows[0];
      const dataRows = rows.slice(1);

      const errors: ImportError[] = [];
      let successful = 0;
      let failed = 0;

      // Process in batches
      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        const batchResults = await this.processEventBatch(
          batch,
          headers,
          organizationId,
          userId,
          skipValidation,
          updateExisting,
          i + 1 // Start row number for error reporting
        );

        successful += batchResults.successful;
        failed += batchResults.failed;
        errors.push(...batchResults.errors);
      }

      return {
        success: failed === 0,
        total_processed: dataRows.length,
        successful,
        failed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        total_processed: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  }

  /**
   * Import performances from CSV data
   */
  async importPerformances(
    csvData: string,
    organizationId: string,
    userId: string,
    options: {
      skipValidation?: boolean;
      updateExisting?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<ImportResult> {
    const { skipValidation = false, updateExisting = false, batchSize = 50 } = options;

    try {
      const rows = this.parseCSV(csvData);
      if (rows.length === 0) {
        return {
          success: false,
          total_processed: 0,
          successful: 0,
          failed: 0,
          errors: [{ row: 0, error: 'No data rows found in CSV' }]
        };
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const errors: ImportError[] = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        const batchResults = await this.processPerformanceBatch(
          batch,
          headers,
          organizationId,
          userId,
          skipValidation,
          updateExisting,
          i + 1
        );

        successful += batchResults.successful;
        failed += batchResults.failed;
        errors.push(...batchResults.errors);
      }

      return {
        success: failed === 0,
        total_processed: dataRows.length,
        successful,
        failed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        total_processed: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  }

  /**
   * Import workshops from CSV data
   */
  async importWorkshops(
    csvData: string,
    organizationId: string,
    userId: string,
    options: {
      skipValidation?: boolean;
      updateExisting?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<ImportResult> {
    const { skipValidation = false, updateExisting = false, batchSize = 50 } = options;

    try {
      const rows = this.parseCSV(csvData);
      if (rows.length === 0) {
        return {
          success: false,
          total_processed: 0,
          successful: 0,
          failed: 0,
          errors: [{ row: 0, error: 'No data rows found in CSV' }]
        };
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const errors: ImportError[] = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < dataRows.length; i += batchSize) {
        const batch = dataRows.slice(i, i + batchSize);
        const batchResults = await this.processWorkshopBatch(
          batch,
          headers,
          organizationId,
          userId,
          skipValidation,
          updateExisting,
          i + 1
        );

        successful += batchResults.successful;
        failed += batchResults.failed;
        errors.push(...batchResults.errors);
      }

      return {
        success: failed === 0,
        total_processed: dataRows.length,
        successful,
        failed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        total_processed: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  }

  /**
   * Import from JSON data
   */
  async importFromJSON(
    jsonData: string,
    entityType: 'events' | 'performances' | 'workshops' | 'spaces',
    organizationId: string,
    userId: string,
    options: {
      skipValidation?: boolean;
      updateExisting?: boolean;
    } = {}
  ): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonData);

      if (!Array.isArray(data)) {
        return {
          success: false,
          total_processed: 0,
          successful: 0,
          failed: 0,
          errors: [{ row: 0, error: 'JSON data must be an array' }]
        };
      }

      const errors: ImportError[] = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const rowNumber = i + 1;

        try {
          if (!options.skipValidation) {
            // Validate the data based on entity type
            const validationResult = this.validateJSONItem(item, entityType);
            if (!validationResult.success) {
              errors.push({
                row: rowNumber,
                error: validationResult.error,
                data: item
              });
              failed++;
              continue;
            }
          }

          // Import the item
          await this.importJSONItem(item, entityType, organizationId, userId, options.updateExisting);
          successful++;
        } catch (error) {
          errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: item
          });
          failed++;
        }
      }

      return {
        success: failed === 0,
        total_processed: data.length,
        successful,
        failed,
        errors
      };
    } catch (error) {
      return {
        success: false,
        total_processed: 0,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]
      };
    }
  }

  // Batch processing methods
  private async processEventBatch(
    batch: string[][],
    headers: string[],
    organizationId: string,
    userId: string,
    skipValidation: boolean,
    updateExisting: boolean,
    startRow: number
  ): Promise<{ successful: number; failed: number; errors: ImportError[] }> {
    const errors: ImportError[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = startRow + i;

      try {
        const eventData = this.mapCSVRowToEvent(row, headers);

        if (!skipValidation) {
          const validation = programmingValidations.validateEventData(eventData);
          if (!validation.success) {
            errors.push({
              row: rowNumber,
              error: 'Validation failed',
              data: eventData
            });
            failed++;
            continue;
          }
        }

        if (updateExisting && eventData.id) {
          // Update existing event
          await programmingMutations.updateEvent(eventData.id, eventData, organizationId, userId);
        } else {
          // Create new event
          await programmingMutations.createEvent(eventData, organizationId, userId);
        }

        successful++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))
        });
        failed++;
      }
    }

    return { successful, failed, errors };
  }

  private async processPerformanceBatch(
    batch: string[][],
    headers: string[],
    organizationId: string,
    userId: string,
    skipValidation: boolean,
    updateExisting: boolean,
    startRow: number
  ): Promise<{ successful: number; failed: number; errors: ImportError[] }> {
    const errors: ImportError[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = startRow + i;

      try {
        const performanceData = this.mapCSVRowToPerformance(row, headers);

        if (!skipValidation) {
          const validation = programmingValidations.validatePerformanceData(performanceData);
          if (!validation.success) {
            errors.push({
              row: rowNumber,
              error: 'Validation failed',
              data: performanceData
            });
            failed++;
            continue;
          }
        }

        await programmingMutations.createPerformance(performanceData, userId);
        successful++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))
        });
        failed++;
      }
    }

    return { successful, failed, errors };
  }

  private async processWorkshopBatch(
    batch: string[][],
    headers: string[],
    organizationId: string,
    userId: string,
    skipValidation: boolean,
    updateExisting: boolean,
    startRow: number
  ): Promise<{ successful: number; failed: number; errors: ImportError[] }> {
    const errors: ImportError[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      const rowNumber = startRow + i;

      try {
        const workshopData = this.mapCSVRowToWorkshop(row, headers);

        if (!skipValidation) {
          const validation = programmingValidations.validateWorkshopData(workshopData);
          if (!validation.success) {
            errors.push({
              row: rowNumber,
              error: 'Validation failed',
              data: workshopData
            });
            failed++;
            continue;
          }
        }

        await programmingMutations.createWorkshop(workshopData, userId);
        successful++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: Object.fromEntries(headers.map((h, idx) => [h, row[idx]]))
        });
        failed++;
      }
    }

    return { successful, failed, errors };
  }

  // CSV parsing and mapping utilities
  private parseCSV(csvText: string): string[][] {
    const lines = csvText.split('\n').filter(line => line.trim());
    return lines.map(line => {
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
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      // Add the last field
      result.push(current.trim());
      return result;
    });
  }

  private mapCSVRowToEvent(row: string[], headers: string[]): Omit<ProgrammingEvent, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
    const data: unknown = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const lowerHeader = header.toLowerCase();

      switch (lowerHeader) {
        case 'title':
          data.title = value;
          break;
        case 'description':
          data.description = value || undefined;
          break;
        case 'type':
          data.type = value as ProgrammingEvent['type'];
          break;
        case 'status':
          data.status = (value as ProgrammingEvent['status']) || 'scheduled';
          break;
        case 'start_date':
        case 'start date':
          data.start_date = value ? new Date(value) : new Date();
          break;
        case 'end_date':
        case 'end date':
          data.end_date = value ? new Date(value) : new Date();
          break;
        case 'location':
          data.location = value || undefined;
          break;
        case 'capacity':
          data.capacity = value ? parseInt(value, 10) : undefined;
          break;
      }
    });

    return data;
  }

  private mapCSVRowToPerformance(row: string[], headers: string[]): Omit<Performance, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
    const data: unknown = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const lowerHeader = header.toLowerCase();

      switch (lowerHeader) {
        case 'title':
          data.title = value;
          break;
        case 'description':
          data.description = value || undefined;
          break;
        case 'venue':
          data.venue = value || undefined;
          break;
        case 'date':
          data.date = value ? new Date(value) : new Date();
          break;
        case 'duration':
          data.duration = value ? parseInt(value, 10) : undefined;
          break;
        case 'status':
          data.status = (value as Performance['status']) || 'planned';
          break;
      }
    });

    return data;
  }

  private mapCSVRowToWorkshop(row: string[], headers: string[]): Omit<Workshop, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {
    const data: unknown = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const lowerHeader = header.toLowerCase();

      switch (lowerHeader) {
        case 'title':
          data.title = value;
          break;
        case 'description':
          data.description = value || undefined;
          break;
        case 'instructor':
          data.instructor = value;
          break;
        case 'start_date':
        case 'start date':
          data.start_date = value ? new Date(value) : new Date();
          break;
        case 'end_date':
        case 'end date':
          data.end_date = value ? new Date(value) : new Date();
          break;
        case 'capacity':
          data.capacity = value ? parseInt(value, 10) : undefined;
          break;
        case 'status':
          data.status = (value as Workshop['status']) || 'planned';
          break;
      }
    });

    return data;
  }

  // JSON validation and import
  private validateJSONItem(item: unknown, entityType: string): { success: boolean; error?: string } {
    try {
      switch (entityType) {
        case 'events':
          return programmingValidations.validateEventData(item);
        case 'performances':
          return programmingValidations.validatePerformanceData(item);
        case 'workshops':
          return programmingValidations.validateWorkshopData(item);
        default:
          return { success: false, error: `Unknown entity type: ${entityType}` };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Validation error' };
    }
  }

  private async importJSONItem(
    item: unknown,
    entityType: string,
    organizationId: string,
    userId: string,
    updateExisting: boolean
  ): Promise<void> {
    // Add organization_id to the item
    const itemWithOrg = { ...item, organization_id: organizationId };

    switch (entityType) {
      case 'events':
        if (updateExisting && item.id) {
          await programmingMutations.updateEvent(item.id, itemWithOrg, organizationId, userId);
        } else {
          await programmingMutations.createEvent(itemWithOrg, organizationId, userId);
        }
        break;
      case 'performances':
        await programmingMutations.createPerformance(itemWithOrg, userId);
        break;
      case 'workshops':
        await programmingMutations.createWorkshop(itemWithOrg, userId);
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  // Import templates and validation
  getImportTemplates(entityType: string): {
    name: string;
    description: string;
    requiredFields: string[];
    optionalFields: string[];
    sampleData: Record<string, any>;
  }[] {
    const templates: Record<string, any[]> = {
      events: [
        {
          name: 'Basic Events',
          description: 'Import basic event information',
          requiredFields: ['title', 'start_date', 'end_date'],
          optionalFields: ['description', 'type', 'location', 'capacity', 'status'],
          sampleData: {
            title: 'Sample Event',
            description: 'A sample event description',
            type: 'performance',
            start_date: '2024-01-15T10:00:00Z',
            end_date: '2024-01-15T12:00:00Z',
            location: 'Main Stage',
            capacity: 200,
            status: 'scheduled'
          }
        },
      ],
      performances: [
        {
          name: 'Performance Schedule',
          description: 'Import performance scheduling data',
          requiredFields: ['title', 'date'],
          optionalFields: ['description', 'venue', 'duration', 'status'],
          sampleData: {
            title: 'Sample Performance',
            description: 'A sample performance',
            venue: 'Main Hall',
            date: '2024-01-15T19:00:00Z',
            duration: 120,
            status: 'planned'
          }
        },
      ],
      workshops: [
        {
          name: 'Workshop Sessions',
          description: 'Import workshop session data',
          requiredFields: ['title', 'instructor', 'start_date', 'end_date'],
          optionalFields: ['description', 'capacity', 'status'],
          sampleData: {
            title: 'Sample Workshop',
            instructor: 'John Doe',
            start_date: '2024-01-15T09:00:00Z',
            end_date: '2024-01-15T17:00:00Z',
            description: 'A sample workshop',
            capacity: 50,
            status: 'planned'
          }
        },
      ]
    };

    return templates[entityType] || [];
  }

  validateImportFile(file: File, entityType: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      errors.push('File must be CSV or JSON format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const programmingImport = new ProgrammingImportService();
