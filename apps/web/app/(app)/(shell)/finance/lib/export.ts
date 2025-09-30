'use client';

import type { ExportFinanceInput, FinanceFilterInput } from './validations';

export class FinanceExport {
 /**
  * Export finance data to CSV format
  */
 static async exportToCSV(
   data: unknown[],
   filename: string,
   columns?: string[]
 ): Promise<void> {
   if (!data.length) {
     throw new Error('No data to export');
   }

   // Determine columns from data if not provided
   const exportColumns = columns || Object.keys(data[0]);

   // Create CSV header
   const header = exportColumns.join(',');

   // Create CSV rows
   const rows = data.map(row =>
     exportColumns.map(col => {
       const value = row[col];
       // Escape commas and quotes in CSV
       if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
         return `"${value.replace(/"/g, '""')}"`;
       }
       return value || '';
     }).join(',')
   );

   // Combine header and rows
   const csvContent = [header, ...rows].join('\n');

   // Download file
   this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
 }

 /**
  * Export finance data to JSON format
  */
 static async exportToJSON(
   data: unknown[],
   filename: string,
   pretty: boolean = true
 ): Promise<void> {
   const jsonContent = pretty
     ? JSON.stringify(data, null, 2)
     : JSON.stringify(data);

   this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
 }

 /**
  * Export finance data to Excel format (client-side)
  */
 static async exportToExcel(
   data: unknown[],
   filename: string,
   sheetName: string = 'Data'
 ): Promise<void> {
   // For client-side Excel export, we'll use a simple CSV approach
   // In a production environment, you'd use a library like xlsx or sheetjs
   await this.exportToCSV(data, filename);

   // TODO: Implement proper Excel export with multiple sheets
   console.warn('Excel export uses CSV format. Implement proper Excel library for production.');
 }

 /**
  * Export finance data to PDF format
  */
 static async exportToPDF(
   data: unknown[],
   filename: string,
   title: string,
   columns?: string[]
 ): Promise<void> {
   // For client-side PDF export, we'll create a simple HTML table
   // In a production environment, you'd use a library like jsPDF or puppeteer
   const exportColumns = columns || Object.keys(data[0]);

   const htmlContent = `
     <!DOCTYPE html>
     <html>
     <head>
       <title>${title}</title>
       <style>
         body { font-family: Arial, sans-serif; margin: 20px; }
         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
         th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
         th { background-color: #f5f5f5; font-weight: bold; }
         tr:nth-child(even) { background-color: #f9f9f9; }
         h1 { color: #333; }
       </style>
     </head>
     <body>
       <h1>${title}</h1>
       <table>
         <thead>
           <tr>
             ${exportColumns.map(col => `<th>${col}</th>`).join('')}
           </tr>
         </thead>
         <tbody>
           ${data.map(row => `
             <tr>
               ${exportColumns.map(col => `<td>${row[col] || ''}</td>`).join('')}
             </tr>
           `).join('')}
         </tbody>
       </table>
     </body>
     </html>
   `;

   this.downloadFile(htmlContent, `${filename}.html`, 'text/html');
   console.warn('PDF export creates HTML file. Implement proper PDF library for production.');
 }

 /**
  * Export with filters applied
  */
 static async exportWithFilters(
   config: ExportFinanceInput,
   data: unknown[],
   orgId: string
 ): Promise<void> {
   let filteredData = data;

   // Apply filters if provided
   if (config.filters) {
     filteredData = this.applyFilters(data, config.filters);
   }

   const timestamp = new Date().toISOString().split('T')[0];
   const filename = `${config.module}_export_${timestamp}`;

   switch (config.format) {
     case 'csv':
       await this.exportToCSV(filteredData, filename);
       break;
     case 'json':
       await this.exportToJSON(filteredData, filename);
       break;
     case 'xlsx':
       await this.exportToExcel(filteredData, filename);
       break;
     case 'pdf':
       await this.exportToPDF(filteredData, filename, `${config.module.charAt(0).toUpperCase() + config.module.slice(1)} Report`);
       break;
     default:
       throw new Error(`Unsupported export format: ${config.format}`);
   }
 }

 /**
  * Apply filters to data
  */
 private static applyFilters(data: unknown[], filters: FinanceFilterInput): unknown[] {
   return data.filter(item => {
     // Status filter
     if (filters.status?.length && !filters.status.includes(item.status)) {
       return false;
     }

     // Category filter
     if (filters.category?.length && !filters.category.includes(item.category)) {
       return false;
     }

     // Date range filter
     if (filters.date_range) {
       const itemDate = new Date(item.created_at || item.date);
       const startDate = new Date(filters.date_range.start);
       const endDate = new Date(filters.date_range.end);

       if (itemDate < startDate || itemDate > endDate) {
         return false;
       }
     }

     // Amount range filter
     if (filters.amount_range) {
       const amount = item.amount || item.total_amount || 0;
       if (amount < filters.amount_range.min || amount > filters.amount_range.max) {
         return false;
       }
     }

     // Project filter
     if (filters.project_id?.length && !filters.project_id.includes(item.project_id)) {
       return false;
     }

     // Client filter
     if (filters.client_id?.length && !filters.client_id.includes(item.client_id)) {
       return false;
     }

     return true;
   });
 }

 /**
  * Download file utility
  */
 private static downloadFile(content: string, filename: string, mimeType: string): void {
   const blob = new Blob([content], { type: mimeType });
   const url = URL.createObjectURL(blob);

   const link = document.createElement('a');
   link.href = url;
   link.download = filename;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);

   URL.revokeObjectURL(url);
 }

 /**
  * Get export templates for different modules
  */
 static getExportTemplates(module: string): { columns: string[], filename: string } {
   const templates: Record<string, { columns: string[], filename: string }> = {
     budgets: {
       columns: ['name', 'category', 'amount', 'spent', 'status', 'period', 'fiscal_year', 'created_at'],
       filename: 'budgets'
     },
     expenses: {
       columns: ['description', 'amount', 'category', 'expense_date', 'status', 'vendor', 'project_name', 'created_at'],
       filename: 'expenses'
     },
     revenue: {
       columns: ['source', 'amount', 'category', 'recognition_date', 'status', 'client_name', 'project_name', 'created_at'],
       filename: 'revenue'
     },
     transactions: {
       columns: ['description', 'amount', 'type', 'transaction_date', 'category', 'account_name', 'project_name', 'created_at'],
       filename: 'transactions'
     },
     accounts: {
       columns: ['name', 'type', 'current_balance', 'status', 'institution', 'created_at'],
       filename: 'accounts'
     },
     invoices: {
       columns: ['invoice_number', 'client_name', 'amount', 'status', 'issue_date', 'due_date', 'created_at'],
       filename: 'invoices'
     },
     forecasts: {
       columns: ['title', 'category', 'forecasted_amount', 'forecast_date', 'confidence_level', 'scenario', 'created_at'],
       filename: 'forecasts'
     }
   };

   return templates[module] || { columns: [], filename: module };
 }

 /**
  * Validate export request
  */
 static validateExportRequest(config: ExportFinanceInput): { valid: boolean; errors: string[] } {
   const errors: string[] = [];

   if (!config.module) {
     errors.push('Module is required');
   }

   if (!config.format) {
     errors.push('Export format is required');
   }

   if (!['csv', 'xlsx', 'json', 'pdf'].includes(config.format)) {
     errors.push('Invalid export format');
   }

   if (!['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts'].includes(config.module)) {
     errors.push('Invalid module');
   }

   return {
     valid: errors.length === 0,
     errors
   };
 }
}

export const financeExport = FinanceExport;
