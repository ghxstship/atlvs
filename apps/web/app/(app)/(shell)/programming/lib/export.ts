/**
 * Programming Module Export Service
 * Handles data export functionality for all entities
 */
import type {
  ProgrammingEvent,
  Performance,
  CallSheet,
  Rider,
  Itinerary,
  Lineup,
  Space,
  Workshop,
  ExportOptions,
  SearchFilters,
  SortOptions,
} from '../types';
import { programmingQueries } from './queries';

export class ProgrammingExportService {
  /**
   * Export events data
   */
  async exportEvents(
    organizationId: string,
    options: ExportOptions,
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'start_date', direction: 'desc' }
  ): Promise<string> {
    // Get all events data (we'll implement pagination handling)
    const allEvents: ProgrammingEvent[] = [];
    let page = 1;
    const limit = 1000;

    while (true) {
      const result = await programmingQueries.getEventsByDateRange(
        organizationId,
        filters.date_from || new Date(2000, 0, 1),
        filters.date_to || new Date(2100, 0, 1)
      );

      if (result.length === 0) break;

      // Apply additional filters
      const filteredEvents = this.applyFilters(result, filters);
      allEvents.push(...filteredEvents);

      page++;
      if (result.length < limit) break;
    }

    // Sort the data
    const sortedEvents = this.sortData(allEvents, sort);

    // Export based on format
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(sortedEvents, options.fields, 'events');
      case 'json':
        return this.exportToJSON(sortedEvents, options.fields);
      case 'excel':
        return this.exportToExcel(sortedEvents, options.fields, 'events');
      case 'pdf':
        return this.exportToPDF(sortedEvents, options.fields, 'Events Report');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export performances data
   */
  async exportPerformances(
    organizationId: string,
    options: ExportOptions,
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'date', direction: 'desc' }
  ): Promise<string> {
    const allPerformances: Performance[] = [];
    let page = 1;
    const limit = 1000;

    while (true) {
      const result = await programmingQueries.getPerformancesByDateRange(
        organizationId,
        filters.date_from || new Date(2000, 0, 1),
        filters.date_to || new Date(2100, 0, 1)
      );

      if (result.length === 0) break;

      const filteredPerformances = this.applyFilters(result, filters);
      allPerformances.push(...filteredPerformances);

      page++;
      if (result.length < limit) break;
    }

    const sortedPerformances = this.sortData(allPerformances, sort);

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(sortedPerformances, options.fields, 'performances');
      case 'json':
        return this.exportToJSON(sortedPerformances, options.fields);
      case 'excel':
        return this.exportToExcel(sortedPerformances, options.fields, 'performances');
      case 'pdf':
        return this.exportToPDF(sortedPerformances, options.fields, 'Performances Report');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export call sheets data
   */
  async exportCallSheets(
    organizationId: string,
    options: ExportOptions,
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'date', direction: 'desc' }
  ): Promise<string> {
    // Get call sheets data
    const callSheets = await this.getAllCallSheets(organizationId, filters);
    const sortedCallSheets = this.sortData(callSheets, sort);

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(sortedCallSheets, options.fields, 'call-sheets');
      case 'json':
        return this.exportToJSON(sortedCallSheets, options.fields);
      case 'excel':
        return this.exportToExcel(sortedCallSheets, options.fields, 'call-sheets');
      case 'pdf':
        return this.exportToPDF(sortedCallSheets, options.fields, 'Call Sheets Report');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export comprehensive programming report
   */
  async exportComprehensiveReport(
    organizationId: string,
    options: ExportOptions,
    dateRange?: { from: Date; to: Date }
  ): Promise<string> {
    const reportData = {
      events: await this.getAllEvents(organizationId, {}, dateRange),
      performances: await this.getAllPerformances(organizationId, {}, dateRange),
      callSheets: await this.getAllCallSheets(organizationId, {}, dateRange),
      spaces: await this.getAllSpaces(organizationId),
      workshops: await this.getAllWorkshops(organizationId, {}, dateRange),
      generated_at: new Date().toISOString(),
      organization_id: organizationId,
    };

    switch (options.format) {
      case 'json':
        return JSON.stringify(reportData, null, 2);
      case 'excel':
        return this.exportComprehensiveToExcel(reportData);
      case 'pdf':
        return this.exportComprehensiveToPDF(reportData);
      default:
        throw new Error(`Comprehensive reports only support JSON, Excel, and PDF formats`);
    }
  }

  // Helper methods for data retrieval
  private async getAllEvents(organizationId: string, filters: SearchFilters = {}, dateRange?: { from: Date; to: Date }): Promise<ProgrammingEvent[]> {
    const events = await programmingQueries.getEventsByDateRange(
      organizationId,
      dateRange?.from || new Date(2000, 0, 1),
      dateRange?.to || new Date(2100, 0, 1)
    );
    return this.applyFilters(events, filters);
  }

  private async getAllPerformances(organizationId: string, filters: SearchFilters = {}, dateRange?: { from: Date; to: Date }): Promise<Performance[]> {
    const performances = await programmingQueries.getPerformancesByDateRange(
      organizationId,
      dateRange?.from || new Date(2000, 0, 1),
      dateRange?.to || new Date(2100, 0, 1)
    );
    return this.applyFilters(performances, filters);
  }

  private async getAllCallSheets(organizationId: string, filters: SearchFilters = {}, dateRange?: { from: Date; to: Date }): Promise<CallSheet[]> {
    // Implementation would fetch all call sheets with date filtering
    return [];
  }

  private async getAllSpaces(organizationId: string): Promise<Space[]> {
    // Implementation would fetch all spaces
    return [];
  }

  private async getAllWorkshops(organizationId: string, filters: SearchFilters = {}, dateRange?: { from: Date; to: Date }): Promise<Workshop[]> {
    const workshops = await programmingQueries.getWorkshopsByDateRange(
      organizationId,
      dateRange?.from || new Date(2000, 0, 1),
      dateRange?.to || new Date(2100, 0, 1)
    );
    return this.applyFilters(workshops, filters);
  }

  // Filter and sort helpers
  private applyFilters<T extends Record<string, any>>(data: T[], filters: SearchFilters): T[] {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = Object.values(item)
          .filter(val => typeof val === 'string')
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status?.length && item.status) {
        if (!filters.status.includes(item.status)) {
          return false;
        }
      }

      // Type filter
      if (filters.type?.length && item.type) {
        if (!filters.type.includes(item.type)) {
          return false;
        }
      }

      return true;
    });
  }

  private sortData<T extends Record<string, any>>(data: T[], sort: SortOptions): T[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  // Export format implementations
  private exportToCSV<T extends Record<string, any>>(data: T[], fields: string[], filename: string): string {
    if (data.length === 0) return '';

    // Create CSV header
    const headers = fields.join(',');

    // Create CSV rows
    const rows = data.map(item => {
      return fields.map(field => {
        const value = item[field];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    return [headers, ...rows].join('\n');
  }

  private exportToJSON<T extends Record<string, any>>(data: T[], fields: string[]): string {
    const filteredData = data.map(item => {
      const filtered: Record<string, any> = {};
      fields.forEach(field => {
        filtered[field] = item[field];
      });
      return filtered;
    });

    return JSON.stringify(filteredData, null, 2);
  }

  private exportToExcel<T extends Record<string, any>>(data: T[], fields: string[], sheetName: string): string {
    // For Excel export, we'll return CSV format with Excel headers
    // In a real implementation, you'd use a library like xlsx
    const csv = this.exportToCSV(data, fields, sheetName);

    // Add Excel BOM for proper encoding
    return '\uFEFF' + csv;
  }

  private exportToPDF<T extends Record<string, any>>(data: T[], fields: string[], title: string): string {
    // For PDF export, return a structured text representation
    // In a real implementation, you'd use a PDF generation library
    let output = `${title}\n${'='.repeat(title.length)}\n\n`;
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Total Records: ${data.length}\n\n`;

    if (data.length > 0) {
      // Create a simple table representation
      const headers = fields;
      const rows = data.map(item => fields.map(field => String(item[field] || '')));

      // Calculate column widths
      const colWidths = headers.map((header, i) => {
        const maxDataWidth = Math.max(...rows.map(row => row[i]?.length || 0));
        return Math.max(header.length, maxDataWidth);
      });

      // Create table header
      output += headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + '\n';
      output += colWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';

      // Create table rows
      rows.forEach(row => {
        output += row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + '\n';
      });
    }

    return output;
  }

  private exportComprehensiveToExcel(data: unknown): string {
    // Create multiple sheets in Excel format
    let excelData = '';

    // Events sheet
    excelData += 'Events\n';
    if (data.events.length > 0) {
      excelData += this.exportToCSV(data.events, Object.keys(data.events[0]), 'events') + '\n\n';
    }

    // Performances sheet
    excelData += 'Performances\n';
    if (data.performances.length > 0) {
      excelData += this.exportToCSV(data.performances, Object.keys(data.performances[0]), 'performances') + '\n\n';
    }

    // Add other sheets...

    return '\uFEFF' + excelData;
  }

  private exportComprehensiveToPDF(data: unknown): string {
    let output = 'Comprehensive Programming Report\n';
    output += '='.repeat(40) + '\n\n';
    output += `Generated: ${new Date().toLocaleString()}\n`;
    output += `Organization: ${data.organization_id}\n\n`;

    output += `Events: ${data.events.length}\n`;
    output += `Performances: ${data.performances.length}\n`;
    output += `Call Sheets: ${data.callSheets.length}\n`;
    output += `Spaces: ${data.spaces.length}\n`;
    output += `Workshops: ${data.workshops.length}\n\n`;

    // Add detailed sections for each data type
    if (data.events.length > 0) {
      output += 'EVENTS SUMMARY\n' + '-'.repeat(20) + '\n';
      data.events.slice(0, 10).forEach((event: ProgrammingEvent) => {
        output += `- ${event.title} (${event.status}) - ${event.start_date.toLocaleDateString()}\n`;
      });
      if (data.events.length > 10) {
        output += `... and ${data.events.length - 10} more events\n`;
      }
      output += '\n';
    }

    return output;
  }

  /**
   * Get export templates for different entities
   */
  getExportTemplates(entity: string): { name: string; fields: string[]; description: string }[] {
    const templates: Record<string, { name: string; fields: string[]; description: string }[]> = {
      events: [
        {
          name: 'Basic Info',
          fields: ['title', 'type', 'status', 'start_date', 'end_date', 'location'],
          description: 'Essential event information for scheduling',
        },
        {
          name: 'Complete Details',
          fields: ['title', 'description', 'type', 'status', 'start_date', 'end_date', 'location', 'capacity'],
          description: 'All event details including capacity and descriptions',
        },
        {
          name: 'Timeline Only',
          fields: ['title', 'start_date', 'end_date', 'status'],
          description: 'Just the essential timeline information',
        },
      ],
      performances: [
        {
          name: 'Performance Schedule',
          fields: ['title', 'venue', 'date', 'duration', 'status'],
          description: 'Performance scheduling information',
        },
        {
          name: 'Complete Performance',
          fields: ['title', 'description', 'venue', 'date', 'duration', 'status'],
          description: 'All performance details',
        },
      ],
      workshops: [
        {
          name: 'Workshop Overview',
          fields: ['title', 'instructor', 'start_date', 'end_date', 'capacity', 'status'],
          description: 'Workshop scheduling and capacity information',
        },
      ],
    };

    return templates[entity] || [];
  }

  /**
   * Validate export options
   */
  validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!['csv', 'excel', 'json', 'pdf'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (!options.fields || options.fields.length === 0) {
      errors.push('At least one field must be selected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const programmingExport = new ProgrammingExportService();
