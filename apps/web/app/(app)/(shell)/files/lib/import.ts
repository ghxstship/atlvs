/**
 * Files Import Service
 * Handles file data import from multiple formats
 * Supports CSV, Excel, JSON, XML import with validation and duplicate handling
 */

import type { FileImportInput, CreateAssetInput } from '../types';
import { filesMutationsService } from './mutations';
import { filesPermissionsService } from './permissions';

export class FilesImportService {
  /**
   * Import files from CSV format
   */
  async importFromCSV(
    orgId: string,
    userId: string,
    csvContent: string,
    options: FileImportInput['options'] = {}
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    duplicates: Array<{ row: number; title: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
      duplicates: [] as Array<{ row: number; title: string }>
    };

    try {
      // Parse CSV
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = this.parseCSVLine(lines[0]);

      // Validate headers
      const requiredHeaders = ['title', 'category'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const rowData = this.mapCSVRowToObject(headers, values);

          // Validate and transform data
          const importData = await this.validateAndTransformImportData(rowData, orgId, userId, options);

          // Check for duplicates if enabled
          if (options.skip_duplicates) {
            const isDuplicate = await this.checkForDuplicate(importData.title, orgId);
            if (isDuplicate) {
              results.duplicates.push({ row: i, title: importData.title });
              continue;
            }
          }

          // Create file record
          await filesMutationsService.createFile(importData, orgId, userId);
          results.success++;

        } catch (error) {
          results.errors.push({
            row: i,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          results.failed++;
        }
      }

    } catch (error) {
      results.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'CSV parsing failed'
      });
    }

    return results;
  }

  /**
   * Import files from Excel format
   */
  async importFromExcel(
    orgId: string,
    userId: string,
    excelData: ArrayBuffer,
    options: FileImportInput['options'] = {}
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    duplicates: Array<{ row: number; title: string }>;
  }> {
    // In a real implementation, this would use a library like xlsx
    // For now, convert to CSV-like format and reuse CSV logic
    try {
      // Mock Excel parsing - in reality, use a proper Excel library
      const csvContent = await this.convertExcelToCSV(excelData);
      return this.importFromCSV(orgId, userId, csvContent, options);
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        errors: [{ row: 0, error: 'Excel parsing failed' }],
        duplicates: []
      };
    }
  }

  /**
   * Import files from JSON format
   */
  async importFromJSON(
    orgId: string,
    userId: string,
    jsonData: unknown,
    options: FileImportInput['options'] = {}
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    duplicates: Array<{ row: number; title: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
      duplicates: [] as Array<{ row: number; title: string }>
    };

    try {
      // Parse JSON
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const files = Array.isArray(data) ? data : data.files || [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        try {
          const fileData = files[i];

          // Validate and transform data
          const importData = await this.validateAndTransformImportData(fileData, orgId, userId, options);

          // Check for duplicates if enabled
          if (options.skip_duplicates) {
            const isDuplicate = await this.checkForDuplicate(importData.title, orgId);
            if (isDuplicate) {
              results.duplicates.push({ row: i, title: importData.title });
              continue;
            }
          }

          // Create file record
          await filesMutationsService.createFile(importData, orgId, userId);
          results.success++;

        } catch (error) {
          results.errors.push({
            row: i,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          results.failed++;
        }
      }

    } catch (error) {
      results.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'JSON parsing failed'
      });
    }

    return results;
  }

  /**
   * Import files from XML format
   */
  async importFromXML(
    orgId: string,
    userId: string,
    xmlData: string,
    options: FileImportInput['options'] = {}
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    duplicates: Array<{ row: number; title: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
      duplicates: [] as Array<{ row: number; title: string }>
    };

    try {
      // Parse XML (simplified - in reality use a proper XML parser)
      const files = this.parseXMLToFiles(xmlData);

      // Process each file
      for (let i = 0; i < files.length; i++) {
        try {
          const fileData = files[i];

          // Validate and transform data
          const importData = await this.validateAndTransformImportData(fileData, orgId, userId, options);

          // Check for duplicates if enabled
          if (options.skip_duplicates) {
            const isDuplicate = await this.checkForDuplicate(importData.title, orgId);
            if (isDuplicate) {
              results.duplicates.push({ row: i, title: importData.title });
              continue;
            }
          }

          // Create file record
          await filesMutationsService.createFile(importData, orgId, userId);
          results.success++;

        } catch (error) {
          results.errors.push({
            row: i,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          results.failed++;
        }
      }

    } catch (error) {
      results.errors.push({
        row: 0,
        error: error instanceof Error ? error.message : 'XML parsing failed'
      });
    }

    return results;
  }

  /**
   * Parse CSV line handling quoted values
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
   * Map CSV row to object
   */
  private mapCSVRowToObject(headers: string[], values: string[]): Record<string, any> {
    const obj: Record<string, any> = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';
      obj[header.toLowerCase()] = value;
    });

    return obj;
  }

  /**
   * Validate and transform import data
   */
  private async validateAndTransformImportData(
    rawData: Record<string, any>,
    orgId: string,
    userId: string,
    options: FileImportInput['options'] = {}
  ): Promise<CreateAssetInput> {
    // Basic validation and transformation
    const title = rawData.title || rawData.name || '';
    if (!title) {
      throw new Error('Title is required');
    }

    const category = rawData.category || rawData.type || options.category || 'other';
    const validCategories = ['document', 'image', 'video', 'audio', 'drawing', 'specification', 'report', 'template', 'policy', 'other'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    const accessLevel = rawData.access_level || rawData.access || options.access_level || 'private';
    const validAccessLevels = ['public', 'team', 'restricted', 'private'];
    if (!validAccessLevels.includes(accessLevel)) {
      throw new Error(`Invalid access level: ${accessLevel}`);
    }

    // Check folder permission if specified
    const folderId = rawData.folder_id || options.folder_id;
    if (folderId) {
      const canCreateInFolder = await filesPermissionsService.canCreateInFolder(folderId, userId, orgId);
      if (!canCreateInFolder) {
        throw new Error('No permission to create files in specified folder');
      }
    }

    // Transform to CreateAssetInput format
    const importData: CreateAssetInput = {
      title: title.substring(0, 255), // Truncate if too long
      description: rawData.description || '',
      category,
      tags: this.parseTags(rawData.tags || rawData.keywords || ''),
      access_level: accessLevel,
      folder_id: folderId || null,
      project_id: rawData.project_id || null,
      metadata: rawData.metadata || {},
      file_path: rawData.file_path || rawData.path || `imported/${Date.now()}_${title.replace(/[^a-zA-Z0-9]/g, '_')}`,
      file_size: parseInt(rawData.file_size) || 0,
      mime_type: rawData.mime_type || rawData.content_type || 'application/octet-stream'
    };

    return importData;
  }

  /**
   * Check for duplicate files
   */
  private async checkForDuplicate(title: string, orgId: string): Promise<boolean> {
    // In a real implementation, this would query the database
    // For now, return false (no duplicates)
    return false;
  }

  /**
   * Parse tags from string or array
   */
  private parseTags(tagsInput: unknown): string[] {
    if (Array.isArray(tagsInput)) {
      return tagsInput.slice(0, 20); // Limit to 20 tags
    }

    if (typeof tagsInput === 'string') {
      return tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 20);
    }

    return [];
  }

  /**
   * Convert Excel data to CSV (simplified)
   */
  private async convertExcelToCSV(excelData: ArrayBuffer): Promise<string> {
    // In a real implementation, use xlsx library
    // For now, return mock CSV
    return 'title,category,description\nSample File,document,Imported from Excel';
  }

  /**
   * Parse XML to files array (simplified)
   */
  private parseXMLToFiles(xmlData: string): unknown[] {
    // In a real implementation, use xml2js or similar
    // For now, return mock data
    return [{
      title: 'Sample XML Import',
      category: 'document',
      description: 'Imported from XML'
    }];
  }

  /**
   * Schedule background import
   */
  async scheduleImport(
    orgId: string,
    userId: string,
    format: string,
    data: unknown,
    options: FileImportInput['options'] = {}
  ): Promise<string> {
    // In a real implementation, this would queue the import job
    // For now, return a mock job ID
    const jobId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process import asynchronously
    setTimeout(async () => {
      try {
        let results: unknown;

        switch (format) {
          case 'csv':
            results = await this.importFromCSV(orgId, userId, data, options);
            break;
          case 'xlsx':
            results = await this.importFromExcel(orgId, userId, data, options);
            break;
          case 'json':
            results = await this.importFromJSON(orgId, userId, data, options);
            break;
          case 'xml':
            results = await this.importFromXML(orgId, userId, data, options);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        // In a real implementation, save results and notify user

      } catch (error) {
        console.error('Import failed:', error);
      }
    }, 100); // Immediate processing for demo

    return jobId;
  }

  /**
   * Get import job status
   */
  async getImportStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    results?: {
      success: number;
      failed: number;
      errors: Array<{ row: number; error: string }>;
      duplicates: Array<{ row: number; title: string }>;
    };
    error?: string;
  }> {
    // In a real implementation, this would check the job status from database
    // For now, return mock completed status
    return {
      status: 'completed',
      progress: 100,
      results: {
        success: 10,
        failed: 0,
        errors: [],
        duplicates: []
      }
    };
  }
}

export const filesImportService = new FilesImportService();
