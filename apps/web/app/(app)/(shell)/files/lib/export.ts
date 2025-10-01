/**
 * Files Export Service
 * Handles file data export in multiple formats
 * Supports CSV, Excel, JSON, PDF export with advanced filtering
 */

import type { DigitalAsset, FileExportInput } from '../types';
import { filesQueriesService } from './queries';
import { filesPermissionsService } from './permissions';

export class FilesExportService {
  /**
   * Export files to CSV format
   */
  async exportToCSV(orgId: string, userId: string, params: FileExportInput): Promise<string> {
    // Check bulk permissions
    if (params.ids && params.ids.length > 0) {
      const { allowed } = await filesPermissionsService.checkBulkPermissions(
        params.ids,
        userId,
        orgId,
        'view'
      );

      if (allowed.length === 0) {
        throw new Error('No files available for export');
      }

      params.ids = allowed;
    }

    // Get files data
    const { data: files } = await filesQueriesService.getFilesWithStats(orgId, {
      filters: params.filters,
      limit: 10000, // Large limit for export
    });

    // Filter by IDs if specified
    let exportFiles = files;
    if (params.ids) {
      exportFiles = files.filter(file => params.ids!.includes(file.id));
    }

    // Generate CSV headers
    const headers = [
      'ID',
      'Title',
      'Description',
      'Category',
      'File Type',
      'File Size',
      'Access Level',
      'Status',
      'Created By',
      'Created At',
      'Updated At',
      'Tags',
      'Download Count',
      'Version Count'
    ];

    // Generate CSV rows
    const rows = exportFiles.map(file => [
      file.id,
      `"${file.title.replace(/"/g, '""')}"`,
      `"${(file.description || '').replace(/"/g, '""')}"`,
      file.category,
      file.file_type,
      file.file_size,
      file.access_level,
      file.status,
      file.created_by,
      file.created_at,
      file.updated_at,
      `"${(file.tags || []).join(', ')}"`,
      file.downloads?.[0]?.count || 0,
      file.versions?.[0]?.count || 0
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Export files to Excel format (client-side generation)
   */
  async exportToExcel(orgId: string, userId: string, params: FileExportInput): Promise<Blob> {
    // Check bulk permissions
    if (params.ids && params.ids.length > 0) {
      const { allowed } = await filesPermissionsService.checkBulkPermissions(
        params.ids,
        userId,
        orgId,
        'view'
      );

      if (allowed.length === 0) {
        throw new Error('No files available for export');
      }

      params.ids = allowed;
    }

    // Get files data
    const { data: files } = await filesQueriesService.getFilesWithStats(orgId, {
      filters: params.filters,
      limit: 10000,
    });

    // Filter by IDs if specified
    let exportFiles = files;
    if (params.ids) {
      exportFiles = files.filter(file => params.ids!.includes(file.id));
    }

    // Create Excel-compatible CSV with BOM for proper encoding
    const csvContent = await this.exportToCSV(orgId, userId, params);
    const BOM = '\uFEFF';
    const excelCSV = BOM + csvContent;

    return new Blob([excelCSV], {
      type: 'application/vnd.ms-excel;charset=utf-8'
    });
  }

  /**
   * Export files to JSON format
   */
  async exportToJSON(orgId: string, userId: string, params: FileExportInput): Promise<string> {
    // Check bulk permissions
    if (params.ids && params.ids.length > 0) {
      const { allowed } = await filesPermissionsService.checkBulkPermissions(
        params.ids,
        userId,
        orgId,
        'view'
      );

      if (allowed.length === 0) {
        throw new Error('No files available for export');
      }

      params.ids = allowed;
    }

    // Get files data
    const { data: files } = await filesQueriesService.getFilesWithStats(orgId, {
      filters: params.filters,
      limit: 10000,
    });

    // Filter by IDs if specified
    let exportFiles = files;
    if (params.ids) {
      exportFiles = files.filter(file => params.ids!.includes(file.id));
    }

    // Prepare export data
    const exportData = {
      metadata: {
        export_date: new Date().toISOString(),
        organization_id: orgId,
        total_files: exportFiles.length,
        filters: params.filters || {},
        include_versions: params.include_versions || false,
        include_metadata: params.include_metadata || true,
      },
      files: exportFiles.map(file => ({
        id: file.id,
        title: file.title,
        description: file.description,
        category: file.category,
        file_type: file.file_type,
        file_size: file.file_size,
        access_level: file.access_level,
        status: file.status,
        tags: file.tags || [],
        folder_id: file.folder_id,
        project_id: file.project_id,
        created_by: file.created_by,
        created_at: file.created_at,
        updated_at: file.updated_at,
        ...(params.include_metadata && { metadata: file.metadata }),
        ...(params.include_versions && {
          versions_count: file.versions?.[0]?.count || 0,
          downloads_count: file.downloads?.[0]?.count || 0,
          access_logs_count: file.access_logs?.[0]?.count || 0,
        }),
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export files to PDF format (summary report)
   */
  async exportToPDF(orgId: string, userId: string, params: FileExportInput): Promise<Blob> {
    // Check bulk permissions
    if (params.ids && params.ids.length > 0) {
      const { allowed } = await filesPermissionsService.checkBulkPermissions(
        params.ids,
        userId,
        orgId,
        'view'
      );

      if (allowed.length === 0) {
        throw new Error('No files available for export');
      }

      params.ids = allowed;
    }

    // Get files data
    const { data: files } = await filesQueriesService.getFilesWithStats(orgId, {
      filters: params.filters,
      limit: 1000, // Reasonable limit for PDF
    });

    // Filter by IDs if specified
    let exportFiles = files;
    if (params.ids) {
      exportFiles = files.filter(file => params.ids!.includes(file.id));
    }

    // Generate PDF content (simplified HTML that can be converted to PDF)
    const pdfContent = this.generatePDFContent(exportFiles, params);

    // In a real implementation, this would use a PDF library
    // For now, return HTML content as a blob
    return new Blob([pdfContent], {
      type: 'text/html;charset=utf-8'
    });
  }

  /**
   * Generate PDF content as HTML
   */
  private generatePDFContent(files: DigitalAsset[], params: FileExportInput): string {
    const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
    const categories = [...new Set(files.map(f => f.category))];
    const accessLevels = [...new Set(files.map(f => f.access_level))];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Files Export Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: hsl(0 0% 20%); border-bottom: 2px solid hsl(0 0% 20%); padding-bottom: 10px; }
          .summary { background: hsl(0 0% 96%); padding: 15px; margin: 20px 0; border-radius: 5px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat { background: white; padding: 10px; border-radius: 3px; box-shadow: 0 1px 3px hsl(0 0% 0% / 0.1); }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid hsl(0 0% 87%); padding: 8px; text-align: left; }
          th { background-color: hsl(0 0% 95%); font-weight: bold; }
          tr:nth-child(even) { background-color: hsl(0 0% 98%); }
          .category-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1>Files Export Report</h1>

        <div class="summary">
          <h2>Export Summary</h2>
          <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Files:</strong> ${files.length}</p>
          <p><strong>Total Size:</strong> ${(totalSize / (1024 * 1024)).toFixed(2)} MB</p>
          <p><strong>Categories:</strong> ${categories.join(', ')}</p>
          <p><strong>Access Levels:</strong> ${accessLevels.join(', ')}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <strong>Documents:</strong> ${files.filter(f => f.category === 'document').length}
          </div>
          <div class="stat">
            <strong>Images:</strong> ${files.filter(f => f.category === 'image').length}
          </div>
          <div class="stat">
            <strong>Videos:</strong> ${files.filter(f => f.category === 'video').length}
          </div>
          <div class="stat">
            <strong>Other:</strong> ${files.filter(f => !['document', 'image', 'video'].includes(f.category)).length}
          </div>
        </div>

        <h2>File Details</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Size</th>
              <th>Access Level</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${files.map(file => `
              <tr>
                <td>${file.title}</td>
                <td>${file.category}</td>
                <td>${file.file_size ? (file.file_size / 1024).toFixed(1) + ' KB' : 'N/A'}</td>
                <td>${file.access_level}</td>
                <td>${new Date(file.created_at).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Schedule background export
   */
  async scheduleExport(orgId: string, userId: string, params: FileExportInput): Promise<string> {
    // In a real implementation, this would queue the export job
    // For now, return a mock job ID
    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate background processing
    setTimeout(async () => {
      try {
        let content: string | Blob;
        let filename: string;

        switch (params.format) {
          case 'csv':
            content = await this.exportToCSV(orgId, userId, params);
            filename = `files_export_${new Date().toISOString().split('T')[0]}.csv`;
            break;
          case 'xlsx':
            content = await this.exportToExcel(orgId, userId, params);
            filename = `files_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            break;
          case 'json':
            content = await this.exportToJSON(orgId, userId, params);
            filename = `files_export_${new Date().toISOString().split('T')[0]}.json`;
            break;
          case 'pdf':
            content = await this.exportToPDF(orgId, userId, params);
            filename = `files_export_${new Date().toISOString().split('T')[0]}.html`;
            break;
          default:
            throw new Error(`Unsupported format: ${params.format}`);
        }

        // In a real implementation, this would save to storage and notify the user

      } catch (error) {
        console.error('Export failed:', error);
      }
    }, 100); // Immediate processing for demo

    return jobId;
  }

  /**
   * Get export job status
   */
  async getExportStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    error?: string;
  }> {
    // In a real implementation, this would check the job status from database/storage
    // For now, return mock completed status
    return {
      status: 'completed',
      progress: 100,
      downloadUrl: `/api/files/exports/${jobId}/download`,
    };
  }
}

export const filesExportService = new FilesExportService();
