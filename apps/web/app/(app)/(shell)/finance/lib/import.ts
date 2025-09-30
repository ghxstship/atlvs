'use client';

import type { ImportFinanceInput } from './validations';

export interface ImportResult {
 success: boolean;
 imported: number;
 skipped: number;
 errors: string[];
 warnings: string[];
}

export interface ImportPreview {
 headers: string[];
 rows: unknown[][];
 totalRows: number;
 sampleData: unknown[];
}

export class FinanceImport {
 /**
  * Parse CSV file content
  */
 static async parseCSV(file: File): Promise<string[][]> {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       try {
         const csv = e.target?.result as string;
         const lines = csv.split('\n').filter(line => line.trim());
         const data = lines.map(line => {
           // Simple CSV parsing - for production, use a proper CSV library
           const result = [];
           let current = '';
           let inQuotes = false;

           for (let i = 0; i < line.length; i++) {
             const char = line[i];
             if (char === '"') {
               inQuotes = !inQuotes;
             } else if (char === ',' && !inQuotes) {
               result.push(current.trim());
               current = '';
             } else {
               current += char;
             }
           }

           result.push(current.trim());
           return result;
         });

         resolve(data);
       } catch (error) {
         reject(new Error('Failed to parse CSV file'));
       }
     };
     reader.onerror = () => reject(new Error('Failed to read file'));
     reader.readAsText(file);
   });
 }

 /**
  * Parse JSON file content
  */
 static async parseJSON(file: File): Promise<any[]> {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = (e) => {
       try {
         const json = e.target?.result as string;
         const data = JSON.parse(json);
         resolve(Array.isArray(data) ? data : [data]);
       } catch (error) {
         reject(new Error('Failed to parse JSON file'));
       }
     };
     reader.onerror = () => reject(new Error('Failed to read file'));
     reader.readAsText(file);
   });
 }

 /**
  * Parse Excel file content (basic implementation)
  */
 static async parseExcel(file: File): Promise<any[]> {
   // For production, implement proper Excel parsing with a library like xlsx
   throw new Error('Excel import not implemented. Use CSV format instead.');
 }

 /**
  * Generate import preview
  */
 static async generatePreview(config: ImportFinanceInput): Promise<ImportPreview> {
   const { file, format } = config;

   let rawData: unknown[][] | any[];

   switch (format) {
     case 'csv':
       rawData = await this.parseCSV(file);
       break;
     case 'json':
       rawData = await this.parseJSON(file);
       break;
     case 'xlsx':
       rawData = await this.parseExcel(file);
       break;
     default:
       throw new Error(`Unsupported format: ${format}`);
   }

   if (Array.isArray(rawData) && rawData.length === 0) {
     throw new Error('File is empty');
   }

   // Handle different data structures
   let headers: string[];
   let rows: unknown[][];

   if (format === 'json') {
     // For JSON, extract headers from first object
     const jsonData = rawData as any[];
     headers = Object.keys(jsonData[0] || {});
     rows = jsonData.map(item => headers.map(header => item[header]));
   } else {
     // For CSV/Excel, first row is headers
     const csvData = rawData as any[][];
     headers = csvData[0];
     rows = csvData.slice(1);
   }

   const sampleData = rows.slice(0, 5).map(row =>
     headers.reduce((obj, header, index) => {
       obj[header] = row[index];
       return obj;
     }, {} as any)
   );

   return {
     headers,
     rows,
     totalRows: rows.length,
     sampleData
   };
 }

 /**
  * Validate import data
  */
 static validateImportData(data: unknown[], module: string): { valid: boolean; errors: string[]; warnings: string[] } {
   const errors: string[] = [];
   const warnings: string[] = [];

   if (!data.length) {
     errors.push('No data to import');
     return { valid: false, errors, warnings };
   }

   // Module-specific validation
   switch (module) {
     case 'budgets':
       data.forEach((item, index) => {
         if (!item.name) errors.push(`Row ${index + 1}: Budget name is required`);
         if (!item.amount || isNaN(Number(item.amount))) errors.push(`Row ${index + 1}: Valid amount is required`);
         if (!['operations', 'marketing', 'development', 'production', 'other'].includes(item.category)) {
           warnings.push(`Row ${index + 1}: Invalid category, will default to 'other'`);
         }
       });
       break;

     case 'expenses':
       data.forEach((item, index) => {
         if (!item.description) errors.push(`Row ${index + 1}: Description is required`);
         if (!item.amount || isNaN(Number(item.amount))) errors.push(`Row ${index + 1}: Valid amount is required`);
         if (!item.expense_date) errors.push(`Row ${index + 1}: Expense date is required`);
       });
       break;

     case 'revenue':
       data.forEach((item, index) => {
         if (!item.source) errors.push(`Row ${index + 1}: Revenue source is required`);
         if (!item.amount || isNaN(Number(item.amount))) errors.push(`Row ${index + 1}: Valid amount is required`);
         if (!item.recognition_date) errors.push(`Row ${index + 1}: Recognition date is required`);
       });
       break;

     default:
       warnings.push('Generic validation applied - module-specific validation not implemented');
   }

   return {
     valid: errors.length === 0,
     errors,
     warnings
   };
 }

 /**
  * Process import with validation and duplicate handling
  */
 static async processImport(
   config: ImportFinanceInput,
   data: unknown[],
   orgId: string,
   onProgress?: (progress: { current: number; total: number; status: string }) => void
 ): Promise<ImportResult> {
   const { module, options = {} } = config;
   const { skip_duplicates = true, update_existing = false, validate_data = true } = options;

   let imported = 0;
   let skipped = 0;
   const errors: string[] = [];
   const warnings: string[] = [];

   // Validate data if requested
   if (validate_data) {
     const validation = this.validateImportData(data, module);
     if (!validation.valid) {
       return {
         success: false,
         imported: 0,
         skipped: 0,
         errors: validation.errors,
         warnings: validation.warnings
       };
     }
     warnings.push(...validation.warnings);
   }

   // Process each record
   for (let i = 0; i < data.length; i++) {
     const record = data[i];

     try {
       onProgress?.({
         current: i + 1,
         total: data.length,
         status: `Processing ${module} record ${i + 1}/${data.length}`
       });

       // Check for duplicates if requested
       if (skip_duplicates) {
         const isDuplicate = await this.checkForDuplicate(record, module, orgId);
         if (isDuplicate) {
           skipped++;
           continue;
         }
       }

       // Import the record
       await this.importRecord(record, module, orgId, update_existing);
       imported++;

     } catch (error) {
       errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Import failed'}`);
     }
   }

   return {
     success: errors.length === 0,
     imported,
     skipped,
     errors,
     warnings
   };
 }

 /**
  * Check for duplicate records
  */
 private static async checkForDuplicate(record: unknown, module: string, orgId: string): Promise<boolean> {
   // Implement duplicate checking logic based on module
   // This is a simplified implementation - in production, you'd check against the database
   switch (module) {
     case 'budgets':
       return false; // Simplified - no duplicate check implemented
     case 'expenses':
       return false; // Simplified - no duplicate check implemented
     case 'revenue':
       return false; // Simplified - no duplicate check implemented
     default:
       return false;
   }
 }

 /**
  * Import a single record
  */
 private static async importRecord(record: unknown, module: string, orgId: string, updateExisting: boolean): Promise<void> {
   // This would integrate with the mutations API
   // Simplified implementation for demonstration

   // In a real implementation, this would call the appropriate mutation
   // await financeMutations.createBudget(record, 'system-user', orgId);
 }

 /**
  * Get import templates
  */
 static getImportTemplates(module: string): { required: string[], optional: string[], example: unknown } {
   const templates: Record<string, { required: string[], optional: string[], example: unknown }> = {
     budgets: {
       required: ['name', 'category', 'amount', 'currency'],
       optional: ['period', 'fiscal_year', 'status', 'notes', 'project_id'],
       example: {
         name: 'Marketing Budget Q1',
         category: 'marketing',
         amount: 50000,
         currency: 'USD',
         period: 'quarterly',
         fiscal_year: 2024,
         status: 'active'
       }
     },
     expenses: {
       required: ['description', 'amount', 'category', 'expense_date'],
       optional: ['vendor', 'receipt_url', 'project_id', 'budget_id', 'notes'],
       example: {
         description: 'Office supplies purchase',
         amount: 250.50,
         category: 'office',
         expense_date: '2024-01-15',
         vendor: 'Office Depot',
         status: 'draft'
       }
     },
     revenue: {
       required: ['source', 'amount', 'category', 'recognition_date'],
       optional: ['client_id', 'project_id', 'invoice_number', 'notes'],
       example: {
         source: 'Consulting Services',
         amount: 15000,
         category: 'services',
         recognition_date: '2024-01-31',
         status: 'invoiced'
       }
     }
   };

   return templates[module] || {
     required: [],
     optional: [],
     example: {}
   };
 }

 /**
  * Validate import configuration
  */
 static validateImportConfig(config: ImportFinanceInput): { valid: boolean; errors: string[] } {
   const errors: string[] = [];

   if (!config.module) {
     errors.push('Module is required');
   }

   if (!config.file) {
     errors.push('File is required');
   }

   if (!['csv', 'xlsx', 'json'].includes(config.format)) {
     errors.push('Invalid import format');
   }

   if (!['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts'].includes(config.module)) {
     errors.push('Invalid module');
   }

   // File size validation (10MB limit)
   if (config.file.size > 10 * 1024 * 1024) {
     errors.push('File size exceeds 10MB limit');
   }

   return {
     valid: errors.length === 0,
     errors
   };
 }
}

export const financeImport = FinanceImport;
