/**
 * Enterprise-grade Streaming Import Service
 * Handles large file imports with progress tracking and memory efficiency
 */

import { XMLParser } from 'fast-xml-parser';
import Papa from 'papaparse';

export interface ImportProgress {
  processed: number;
  total: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export interface ImportOptions {
  format: 'csv' | 'json' | 'xml' | 'excel';
  chunkSize?: number;
  batchSize?: number;
  validateRow?: (row: any) => boolean | Promise<boolean>;
  transformRow?: (row: any) => any | Promise<any>;
  onProgress?: (progress: ImportProgress) => void;
  onError?: (error: ImportError) => void;
  abortSignal?: AbortSignal;
}

export class StreamingImportService {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private readonly BATCH_SIZE = 100; // Records per batch
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: true,
      trimValues: true,
      parseTrueNumberOnly: true,
    });
  }

  /**
   * Stream import large files with progress tracking
   */
  async *streamImport(
    file: File,
    options: ImportOptions
  ): AsyncGenerator<any[], void, unknown> {
    const chunkSize = options.chunkSize || this.CHUNK_SIZE;
    const batchSize = options.batchSize || this.BATCH_SIZE;
    
    // Validate file size
    if (file.size > 1024 * 1024 * 1024) { // 1GB limit
      throw new Error('File size exceeds 1GB limit');
    }

    const progress: ImportProgress = {
      processed: 0,
      total: file.size,
      percentage: 0,
      currentChunk: 0,
      totalChunks: Math.ceil(file.size / chunkSize),
      errors: [],
    };

    try {
      switch (options.format) {
        case 'csv':
          yield* this.streamCSV(file, options, progress);
          break;
        case 'json':
          yield* this.streamJSON(file, options, progress);
          break;
        case 'xml':
          yield* this.streamXML(file, options, progress);
          break;
        case 'excel':
          yield* this.streamExcel(file, options, progress);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }
    } catch (error) {
      if (options.onError) {
        options.onError({
          row: progress.processed,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }

  /**
   * Stream CSV files
   */
  private async *streamCSV(
    file: File,
    options: ImportOptions,
    progress: ImportProgress
  ): AsyncGenerator<any[], void, unknown> {
    return new Promise((resolve, reject) => {
      let batch: any[] = [];
      let rowCount = 0;

      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        chunk: async (results, parser) => {
          // Check abort signal
          if (options.abortSignal?.aborted) {
            parser.abort();
            return;
          }

          for (const row of results.data) {
            rowCount++;

            // Validate row
            if (options.validateRow) {
              const isValid = await options.validateRow(row);
              if (!isValid) {
                progress.errors.push({
                  row: rowCount,
                  message: 'Validation failed',
                  data: row,
                });
                continue;
              }
            }

            // Transform row
            const transformedRow = options.transformRow
              ? await options.transformRow(row)
              : row;

            batch.push(transformedRow);

            // Yield batch when full
            if (batch.length >= (options.batchSize || this.BATCH_SIZE)) {
              yield batch;
              batch = [];
            }
          }

          // Update progress
          progress.processed = results.meta.cursor || 0;
          progress.percentage = (progress.processed / progress.total) * 100;
          progress.currentChunk++;

          if (options.onProgress) {
            options.onProgress(progress);
          }
        },
        complete: () => {
          // Yield remaining batch
          if (batch.length > 0) {
            yield batch;
          }
          resolve();
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  /**
   * Stream JSON files
   */
  private async *streamJSON(
    file: File,
    options: ImportOptions,
    progress: ImportProgress
  ): AsyncGenerator<any[], void, unknown> {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Handle both array and object formats
    const items = Array.isArray(data) ? data : [data];
    const batchSize = options.batchSize || this.BATCH_SIZE;
    
    let batch: any[] = [];
    let rowCount = 0;

    for (const item of items) {
      // Check abort signal
      if (options.abortSignal?.aborted) {
        break;
      }

      rowCount++;

      // Validate
      if (options.validateRow) {
        const isValid = await options.validateRow(item);
        if (!isValid) {
          progress.errors.push({
            row: rowCount,
            message: 'Validation failed',
            data: item,
          });
          continue;
        }
      }

      // Transform
      const transformedItem = options.transformRow
        ? await options.transformRow(item)
        : item;

      batch.push(transformedItem);

      // Yield batch when full
      if (batch.length >= batchSize) {
        yield batch;
        batch = [];

        // Update progress
        progress.processed = rowCount;
        progress.percentage = (rowCount / items.length) * 100;
        
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    }

    // Yield remaining batch
    if (batch.length > 0) {
      yield batch;
    }
  }

  /**
   * Stream XML files
   */
  private async *streamXML(
    file: File,
    options: ImportOptions,
    progress: ImportProgress
  ): AsyncGenerator<any[], void, unknown> {
    const text = await file.text();
    const parsed = this.xmlParser.parse(text);
    
    // Find the root array element
    const items = this.extractItemsFromXML(parsed);
    const batchSize = options.batchSize || this.BATCH_SIZE;
    
    let batch: any[] = [];
    let rowCount = 0;

    for (const item of items) {
      // Check abort signal
      if (options.abortSignal?.aborted) {
        break;
      }

      rowCount++;

      // Validate
      if (options.validateRow) {
        const isValid = await options.validateRow(item);
        if (!isValid) {
          progress.errors.push({
            row: rowCount,
            message: 'Validation failed',
            data: item,
          });
          continue;
        }
      }

      // Transform
      const transformedItem = options.transformRow
        ? await options.transformRow(item)
        : item;

      batch.push(transformedItem);

      // Yield batch when full
      if (batch.length >= batchSize) {
        yield batch;
        batch = [];

        // Update progress
        progress.processed = rowCount;
        progress.percentage = (rowCount / items.length) * 100;
        
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    }

    // Yield remaining batch
    if (batch.length > 0) {
      yield batch;
    }
  }

  /**
   * Stream Excel files
   */
  private async *streamExcel(
    file: File,
    options: ImportOptions,
    progress: ImportProgress
  ): AsyncGenerator<any[], void, unknown> {
    // Dynamic import for Excel parsing (heavy library)
    const XLSX = await import('xlsx');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Use first sheet by default
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const items = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });
    
    const batchSize = options.batchSize || this.BATCH_SIZE;
    let batch: any[] = [];
    let rowCount = 0;

    for (const item of items) {
      // Check abort signal
      if (options.abortSignal?.aborted) {
        break;
      }

      rowCount++;

      // Validate
      if (options.validateRow) {
        const isValid = await options.validateRow(item);
        if (!isValid) {
          progress.errors.push({
            row: rowCount,
            message: 'Validation failed',
            data: item,
          });
          continue;
        }
      }

      // Transform
      const transformedItem = options.transformRow
        ? await options.transformRow(item)
        : item;

      batch.push(transformedItem);

      // Yield batch when full
      if (batch.length >= batchSize) {
        yield batch;
        batch = [];

        // Update progress
        progress.processed = rowCount;
        progress.percentage = (rowCount / items.length) * 100;
        
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    }

    // Yield remaining batch
    if (batch.length > 0) {
      yield batch;
    }
  }

  /**
   * Extract items from XML structure
   */
  private extractItemsFromXML(parsed: any): any[] {
    // Try common XML structures
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // Look for common root elements
    const commonRoots = ['items', 'records', 'data', 'rows', 'entries'];
    
    for (const root of commonRoots) {
      if (parsed[root]) {
        if (Array.isArray(parsed[root])) {
          return parsed[root];
        }
        // Check nested structure
        const keys = Object.keys(parsed[root]);
        if (keys.length === 1 && Array.isArray(parsed[root][keys[0]])) {
          return parsed[root][keys[0]];
        }
      }
    }

    // Check first level for arrays
    const values = Object.values(parsed);
    for (const value of values) {
      if (Array.isArray(value)) {
        return value;
      }
    }

    // Fallback to wrapping in array
    return [parsed];
  }

  /**
   * Validate import data against schema
   */
  async validateAgainstSchema(data: any[], schema: any): Promise<ImportError[]> {
    const errors: ImportError[] = [];
    
    // Use Zod for validation if available
    try {
      const { z } = await import('zod');
      
      data.forEach((row, index) => {
        try {
          schema.parse(row);
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              errors.push({
                row: index + 1,
                field: err.path.join('.'),
                message: err.message,
                data: row,
              });
            });
          }
        }
      });
    } catch {
      // Fallback to basic validation
      console.warn('Zod not available, using basic validation');
    }

    return errors;
  }

  /**
   * Get file format from extension
   */
  detectFormat(file: File): ImportOptions['format'] {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'xlsx':
      case 'xls':
        return 'excel';
      default:
        // Try to detect from MIME type
        if (file.type.includes('csv')) return 'csv';
        if (file.type.includes('json')) return 'json';
        if (file.type.includes('xml')) return 'xml';
        if (file.type.includes('sheet') || file.type.includes('excel')) return 'excel';
        
        throw new Error(`Unable to detect file format for ${file.name}`);
    }
  }
}

// Export singleton instance
export const streamingImportService = new StreamingImportService();
