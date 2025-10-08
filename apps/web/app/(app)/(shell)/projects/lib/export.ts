import { createBrowserClient } from "@ghxstship/auth";
import { projectQueries, taskQueries, fileQueries, riskQueries, inspectionQueries, activationQueries, locationQueries, milestoneQueries } from "./queries";

// Export formats
export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  includeRelated?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  fields?: string[];
  filename?: string;
}

// Export job status
export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ExportFormat;
  filename: string;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  recordCount: number;
}

/**
 * PROJECT EXPORTS
 */
export class ProjectExports {
  private supabase = createBrowserClient();

  /**
   * Export projects to CSV
   */
  async exportProjectsToCSV(
    orgId: string,
    options: ExportOptions = { format: 'csv' }
  ): Promise<string> {
    try {
      const { data: projects } = await projectQueries.getProjects(orgId, {
        ...options.filters,
        limit: 10000, // Large limit for export
      });

      if (!projects || projects.length === 0) {
        throw new Error('No projects found to export');
      }

      const headers = [
        'ID',
        'Name',
        'Description',
        'Status',
        'Priority',
        'Budget',
        'Currency',
        'Progress (%)',
        'Client',
        'Manager',
        'Start Date',
        'End Date',
        'Tags',
        'Created At',
        'Updated At'
      ];

      const rows = projects.map(project => [
        project.id,
        project.name,
        project.description || '',
        project.status,
        project.priority,
        project.budget?.toString() || '',
        project.currency || 'USD',
        project.progress?.toString() || '0',
        project.client?.name || '',
        project.manager?.full_name || project.manager?.email || '',
        project.starts_at || '',
        project.ends_at || '',
        (project.tags || []).join('; '),
        project.created_at,
        project.updated_at
      ]);

      return this.generateCSV(headers, rows, options.filename || 'projects-export');
    } catch (error) {
      console.error('Error exporting projects to CSV:', error);
      throw error;
    }
  }

  /**
   * Export projects to JSON
   */
  async exportProjectsToJSON(
    orgId: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<string> {
    try {
      const { data: projects } = await projectQueries.getProjects(orgId, {
        ...options.filters,
        limit: 10000
      });

      if (!projects || projects.length === 0) {
        throw new Error('No projects found to export');
      }

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          recordCount: projects.length,
          organizationId: orgId,
          filters: options.filters || {}
        },
        projects: projects.map(project => ({
          ...project,
          _exportedAt: new Date().toISOString()
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting projects to JSON:', error);
      throw error;
    }
  }

  /**
   * Export projects to Excel format (returns CSV that can be converted)
   */
  async exportProjectsToExcel(
    orgId: string,
    options: ExportOptions = { format: 'excel' }
  ): Promise<string> {
    // For now, return CSV format (can be enhanced to actual Excel)
    return this.exportProjectsToCSV(orgId, { ...options, format: 'excel' });
  }

  /**
   * Export projects to PDF (placeholder - would need PDF generation library)
   */
  async exportProjectsToPDF(
    orgId: string,
    options: ExportOptions = { format: 'pdf' }
  ): Promise<string> {
    throw new Error('PDF export not yet implemented');
  }
}

/**
 * TASK EXPORTS
 */
export class TaskExports {
  private supabase = createBrowserClient();

  async exportTasksToCSV(
    orgId: string,
    options: ExportOptions = { format: 'csv' }
  ): Promise<string> {
    try {
      const { data: tasks } = await taskQueries.getTasks(orgId, {
        ...options.filters,
        limit: 10000
      });

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found to export');
      }

      const headers = [
        'ID',
        'Title',
        'Description',
        'Status',
        'Priority',
        'Project',
        'Assignee',
        'Reporter',
        'Estimated Hours',
        'Actual Hours',
        'Start Date',
        'Due Date',
        'Completed At',
        'Tags',
        'Position',
        'Created At',
        'Updated At'
      ];

      const rows = tasks.map(task => [
        task.id,
        task.title,
        task.description || '',
        task.status,
        task.priority,
        task.project?.name || '',
        task.assignee?.full_name || task.assignee?.email || '',
        task.reporter?.full_name || task.reporter?.email || '',
        task.estimated_hours?.toString() || '',
        task.actual_hours?.toString() || '',
        task.start_date || '',
        task.due_date || '',
        task.completed_at || '',
        (task.tags || []).join('; '),
        task.position.toString(),
        task.created_at,
        task.updated_at
      ]);

      return this.generateCSV(headers, rows, options.filename || 'tasks-export');
    } catch (error) {
      console.error('Error exporting tasks to CSV:', error);
      throw error;
    }
  }

  async exportTasksToJSON(
    orgId: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<string> {
    try {
      const { data: tasks } = await taskQueries.getTasks(orgId, {
        ...options.filters,
        limit: 10000
      });

      if (!tasks || tasks.length === 0) {
        throw new Error('No tasks found to export');
      }

      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          recordCount: tasks.length,
          organizationId: orgId,
          filters: options.filters || {}
        },
        tasks: tasks.map(task => ({
          ...task,
          _exportedAt: new Date().toISOString()
        }))
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting tasks to JSON:', error);
      throw error;
    }
  }
}

/**
 * RISK EXPORTS
 */
export class RiskExports {
  private supabase = createBrowserClient();

  async exportRisksToCSV(
    orgId: string,
    options: ExportOptions = { format: 'csv' }
  ): Promise<string> {
    try {
      const { data: risks } = await riskQueries.getRisks(orgId, {
        ...options.filters,
        limit: 10000
      });

      if (!risks || risks.length === 0) {
        throw new Error('No risks found to export');
      }

      const headers = [
        'ID',
        'Title',
        'Description',
        'Category',
        'Probability',
        'Impact',
        'Risk Score',
        'Status',
        'Project',
        'Owner',
        'Mitigation Plan',
        'Contingency Plan',
        'Review Date',
        'Created At',
        'Updated At'
      ];

      const rows = risks.map(risk => [
        risk.id,
        risk.title,
        risk.description,
        risk.category,
        risk.probability,
        risk.impact,
        risk.risk_score.toString(),
        risk.status,
        risk.project?.name || '',
        risk.owner?.full_name || risk.owner?.email || '',
        risk.mitigation_plan || '',
        risk.contingency_plan || '',
        risk.review_date || '',
        risk.created_at,
        risk.updated_at
      ]);

      return this.generateCSV(headers, rows, options.filename || 'risks-export');
    } catch (error) {
      console.error('Error exporting risks to CSV:', error);
      throw error;
    }
  }
}

/**
 * INSPECTION EXPORTS
 */
export class InspectionExports {
  private supabase = createBrowserClient();

  async exportInspectionsToCSV(
    orgId: string,
    options: ExportOptions = { format: 'csv' }
  ): Promise<string> {
    try {
      const { data: inspections } = await inspectionQueries.getInspections(orgId, {
        ...options.filters,
        limit: 10000
      });

      if (!inspections || inspections.length === 0) {
        throw new Error('No inspections found to export');
      }

      const headers = [
        'ID',
        'Title',
        'Description',
        'Type',
        'Status',
        'Project',
        'Inspector',
        'Scheduled Date',
        'Completed Date',
        'Location',
        'Score',
        'Passed',
        'Findings',
        'Recommendations',
        'Created At',
        'Updated At'
      ];

      const rows = inspections.map(inspection => [
        inspection.id,
        inspection.title,
        inspection.description || '',
        inspection.type,
        inspection.status,
        inspection.project?.name || '',
        inspection.inspector?.full_name || inspection.inspector?.email || '',
        inspection.scheduled_date,
        inspection.completed_date || '',
        inspection.location || '',
        inspection.score?.toString() || '',
        inspection.passed.toString(),
        inspection.findings || '',
        inspection.recommendations || '',
        inspection.created_at,
        inspection.updated_at
      ]);

      return this.generateCSV(headers, rows, options.filename || 'inspections-export');
    } catch (error) {
      console.error('Error exporting inspections to CSV:', error);
      throw error;
    }
  }
}

/**
 * COMPREHENSIVE PROJECT EXPORT
 */
export class ComprehensiveProjectExports {
  private projectExports = new ProjectExports();
  private taskExports = new TaskExports();
  private riskExports = new RiskExports();
  private inspectionExports = new InspectionExports();

  /**
   * Export complete project data (projects + tasks + risks + inspections)
   */
  async exportCompleteProjectData(
    orgId: string,
    options: ExportOptions = { format: 'json' }
  ): Promise<string> {
    try {
      const [projectsData, tasksData, risksData, inspectionsData] = await Promise.all([
        this.projectExports.exportProjectsToJSON(orgId, options),
        this.taskExports.exportTasksToJSON(orgId, options),
        this.riskExports.exportRisksToCSV(orgId, options),
        this.inspectionExports.exportInspectionsToCSV(orgId, options),
      ]);

      const completeExport = {
        metadata: {
          exportDate: new Date().toISOString(),
          organizationId: orgId,
          format: options.format,
          exportedBy: 'system', // Would be user ID in real implementation
        },
        data: {
          projects: JSON.parse(projectsData),
          tasks: JSON.parse(tasksData),
          risks: this.parseCSV(risksData),
          inspections: this.parseCSV(inspectionsData)
        }
      };

      return JSON.stringify(completeExport, null, 2);
    } catch (error) {
      console.error('Error exporting complete project data:', error);
      throw error;
    }
  }

  /**
   * Create export job (for background processing of large exports)
   */
  async createExportJob(
    orgId: string,
    exportType: 'projects' | 'tasks' | 'risks' | 'inspections' | 'complete',
    options: ExportOptions
  ): Promise<ExportJob> {
    try {
      const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const filename = options.filename || `${exportType}_export_${new Date().toISOString().split('T')[0]}`;

      // In a real implementation, this would queue a background job
      // For now, we'll simulate the job creation
      const job: ExportJob = {
        id: jobId,
        status: 'pending',
        format: options.format,
        filename: `${filename}.${options.format}`,
        createdAt: new Date().toISOString(),
        recordCount: 0, // Would be calculated during processing
      };

      // Store job in database (placeholder)
      await this.supabase
        .from('export_jobs')
        .insert([{
          id: jobId,
          organization_id: orgId,
          export_type: exportType,
          format: options.format,
          filename: job.filename,
          status: 'pending',
          options: options,
          created_at: job.createdAt
        }]);

      return job;
    } catch (error) {
      console.error('Error creating export job:', error);
      throw error;
    }
  }

  /**
   * Get export job status
   */
  async getExportJob(jobId: string): Promise<ExportJob | null> {
    try {
      const { data, error } = await this.supabase
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        status: data.status,
        format: data.format,
        filename: data.filename,
        downloadUrl: data.download_url,
        error: data.error_message,
        createdAt: data.created_at,
        completedAt: data.completed_at,
        recordCount: data.record_count || 0
      };
    } catch (error) {
      console.error('Error getting export job:', error);
      return null;
    }
  }
}

// Utility functions
function generateCSV(headers: string[], rows: string[][], filename: string): string {
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell =>
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        cell.includes(',') || cell.includes('"') || cell.includes('\n')
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(',')
    )
  ].join('\n');

  return csvContent;
}

function parseCSV(csvContent: string): unknown[] {
  // Simple CSV parser - in production, use a proper CSV library
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    const obj: unknown = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Export singleton instances
export const projectExports = new ProjectExports();
export const taskExports = new TaskExports();
export const riskExports = new RiskExports();
export const inspectionExports = new InspectionExports();
export const comprehensiveExports = new ComprehensiveProjectExports();
