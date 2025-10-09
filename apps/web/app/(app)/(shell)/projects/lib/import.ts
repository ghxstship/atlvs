import { createBrowserClient } from "@ghxstship/auth";
import { projectMutations, taskMutations, riskMutations, inspectionMutations } from "./mutations";

// Import formats
export type ImportFormat = 'csv' | 'json' | 'excel';

// Import options
export interface ImportOptions {
  format: ImportFormat;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
  batchSize?: number;
  mapping?: Record<string, string>; // field mapping for CSV
}

// Import result
export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  skippedRecords: number;
  errorRecords: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: unknown;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

// Import job status
export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ImportFormat;
  filename: string;
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string;
  result?: ImportResult;
}

/**
 * PROJECT IMPORTS
 */
export class ProjectImports {
  private supabase = createBrowserClient();

  /**
   * Import projects from CSV
   */
  async importProjectsFromCSV(
    orgId: string,
    userId: string,
    csvContent: string,
    options: ImportOptions = { format: 'csv' }
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 0,
        errors: [],
        warnings: []
      };

      // Parse CSV
      const { headers, rows } = this.parseCSV(csvContent);
      result.totalRecords = rows.length;

      // Validate headers
      const requiredHeaders = ['name', 'status'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        result.success = false;
        result.errors.push({
          row: 0,
          message: `Missing required headers: ${missingHeaders.join(', ')}`
        });
        return result;
      }

      // Process in batches
      const batchSize = options.batchSize || 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await this.processProjectBatch(orgId, userId, headers, batch, result, options);
      }

      return result;
    } catch (error: unknown) {
      console.error('Error importing projects from CSV:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 1,
        errors: [{ row: 0, message: error.message }],
        warnings: []
      };
    }
  }

  /**
   * Import projects from JSON
   */
  async importProjectsFromJSON(
    orgId: string,
    userId: string,
    jsonContent: string,
    options: ImportOptions = { format: 'json' }
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 0,
        errors: [],
        warnings: []
      };

      const data = JSON.parse(jsonContent);

      // Handle different JSON structures
      let projects: unknown[] = [];
      if (data.projects) {
        projects = data.projects; // From our export format
      } else if (Array.isArray(data)) {
        projects = data; // Direct array
      } else {
        throw new Error('Invalid JSON format');
      }

      result.totalRecords = projects.length;

      // Process in batches
      const batchSize = options.batchSize || 50;
      for (let i = 0; i < projects.length; i += batchSize) {
        const batch = projects.slice(i, i + batchSize);
        await this.processProjectJSONBatch(orgId, userId, batch, result, options, i);
      }

      return result;
    } catch (error: unknown) {
      console.error('Error importing projects from JSON:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 1,
        errors: [{ row: 0, message: error.message }],
        warnings: []
      };
    }
  }

  private async processProjectBatch(
    orgId: string,
    userId: string,
    headers: string[],
    rows: string[][],
    result: ImportResult,
    options: ImportOptions
  ): Promise<void> {
    const createPromises = rows.map(async (row, index) => {
      try {
        const projectData = this.mapCSVRowToProject(headers, row, options.mapping);

        // Validate required fields
        if (!projectData.name || !projectData.status) {
          result.errorRecords++;
          result.errors.push({
            row: result.totalRecords - rows.length + index + 1,
            message: 'Missing required fields: name or status',
            data: projectData
          });
          return;
        }

        // Check for duplicates if configured
        if (options.skipDuplicates) {
          const { data: existing } = await this.supabase
            .from('projects')
            .select('id')
            .eq('organization_id', orgId)
            .eq('name', projectData.name)
            .single();

          if (existing) {
            result.skippedRecords++;
            return;
          }
        }

        if (!options.validateOnly) {
          const mutationResult = await projectMutations.createProject(orgId, userId, projectData);
          if (mutationResult.success) {
            result.importedRecords++;
          } else {
            result.errorRecords++;
            result.errors.push({
              row: result.totalRecords - rows.length + index + 1,
              message: mutationResult.error || 'Unknown error',
              data: projectData
            });
          }
        } else {
          // Validation only mode
          result.importedRecords++;
        }
      } catch (error: unknown) {
        result.errorRecords++;
        result.errors.push({
          row: result.totalRecords - rows.length + index + 1,
          message: error.message,
          data: row
        });
      }
    });

    await Promise.all(createPromises);
  }

  private async processProjectJSONBatch(
    orgId: string,
    userId: string,
    projects: unknown[],
    result: ImportResult,
    options: ImportOptions,
    startIndex: number
  ): Promise<void> {
    const createPromises = projects.map(async (project, index) => {
      try {
        // Clean up export metadata
        const projectData = { ...project };
        delete projectData._exportedAt;
        delete projectData.id; // Don't import IDs
        delete projectData.created_at;
        delete projectData.updated_at;
        delete projectData.created_by;

        // Validate required fields
        if (!projectData.name || !projectData.status) {
          result.errorRecords++;
          result.errors.push({
            row: startIndex + index + 1,
            message: 'Missing required fields: name or status',
            data: projectData
          });
          return;
        }

        if (!options.validateOnly) {
          const mutationResult = await projectMutations.createProject(orgId, userId, projectData);
          if (mutationResult.success) {
            result.importedRecords++;
          } else {
            result.errorRecords++;
            result.errors.push({
              row: startIndex + index + 1,
              message: mutationResult.error || 'Unknown error',
              data: projectData
            });
          }
        } else {
          result.importedRecords++;
        }
      } catch (error: unknown) {
        result.errorRecords++;
        result.errors.push({
          row: startIndex + index + 1,
          message: error.message,
          data: project
        });
      }
    });

    await Promise.all(createPromises);
  }

  private mapCSVRowToProject(
    headers: string[],
    row: string[],
    mapping?: Record<string, string>
  ): unknown {
    const project: unknown = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const fieldName = mapping?.[header] || header.toLowerCase().replace(/\s+/g, '_');

      switch (fieldName) {
        case 'name':
          project.name = value;
          break;
        case 'description':
          project.description = e.target.value || undefined;
          break;
        case 'status':
          project.status = e.target.value as any;
          break;
        case 'priority':
          project.priority = e.target.value as any;
          break;
        case 'budget':
          project.budget = value ? parseFloat(value) : undefined;
          break;
        case 'currency':
          project.currency = value || 'USD';
          break;
        case 'progress':
          project.progress = value ? parseFloat(value) : undefined;
          break;
        case 'starts_at':
        case 'start_date':
          project.starts_at = e.target.value || undefined;
          break;
        case 'ends_at':
        case 'end_date':
        case 'due_date':
          project.ends_at = e.target.value || undefined;
          break;
        case 'tags':
          project.tags = value ? value.split(';').map(t => t.trim()) : undefined;
          break;
        case 'notes':
          project.notes = e.target.value || undefined;
          break;
      }
    });

    return project;
  }
}

/**
 * TASK IMPORTS
 */
export class TaskImports {
  private supabase = createBrowserClient();

  async importTasksFromCSV(
    orgId: string,
    userId: string,
    csvContent: string,
    options: ImportOptions = { format: 'csv' }
  ): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 0,
        errors: [],
        warnings: []
      };

      const { headers, rows } = this.parseCSV(csvContent);
      result.totalRecords = rows.length;

      // Get projects for validation
      const { data: projects } = await this.supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', orgId);

      const projectMap = new Map(projects?.map(p => [p.name.toLowerCase(), p.id]) || []);

      // Process in batches
      const batchSize = options.batchSize || 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        await this.processTaskBatch(orgId, userId, headers, batch, projectMap, result, options, i);
      }

      return result;
    } catch (error: unknown) {
      console.error('Error importing tasks from CSV:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 1,
        errors: [{ row: 0, message: error.message }],
        warnings: []
      };
    }
  }

  private async processTaskBatch(
    orgId: string,
    userId: string,
    headers: string[],
    rows: string[][],
    projectMap: Map<string, string>,
    result: ImportResult,
    options: ImportOptions,
    startIndex: number
  ): Promise<void> {
    const createPromises = rows.map(async (row, index) => {
      try {
        const taskData = this.mapCSVRowToTask(headers, row, projectMap, options.mapping);

        // Validate required fields
        if (!taskData.title || !taskData.project_id) {
          result.errorRecords++;
          result.errors.push({
            row: startIndex + index + 1,
            message: 'Missing required fields: title or project',
            data: taskData
          });
          return;
        }

        if (!options.validateOnly) {
          const mutationResult = await taskMutations.createTask(orgId, userId, taskData);
          if (mutationResult.success) {
            result.importedRecords++;
          } else {
            result.errorRecords++;
            result.errors.push({
              row: startIndex + index + 1,
              message: mutationResult.error || 'Unknown error',
              data: taskData
            });
          }
        } else {
          result.importedRecords++;
        }
      } catch (error: unknown) {
        result.errorRecords++;
        result.errors.push({
          row: startIndex + index + 1,
          message: error.message,
          data: row
        });
      }
    });

    await Promise.all(createPromises);
  }

  private mapCSVRowToTask(
    headers: string[],
    row: string[],
    projectMap: Map<string, string>,
    mapping?: Record<string, string>
  ): unknown {
    const task: unknown = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() || '';
      const fieldName = mapping?.[header] || header.toLowerCase().replace(/\s+/g, '_');

      switch (fieldName) {
        case 'title':
          task.title = value;
          break;
        case 'description':
          task.description = e.target.value || undefined;
          break;
        case 'status':
          task.status = e.target.value as any;
          break;
        case 'priority':
          task.priority = e.target.value as any;
          break;
        case 'project':
          task.project_id = projectMap.get(value.toLowerCase());
          break;
        case 'assignee':
          task.assignee_id = e.target.value || undefined; // Would need user lookup
          break;
        case 'estimated_hours':
          task.estimated_hours = value ? parseFloat(value) : undefined;
          break;
        case 'actual_hours':
          task.actual_hours = value ? parseFloat(value) : undefined;
          break;
        case 'start_date':
          task.start_date = e.target.value || undefined;
          break;
        case 'due_date':
          task.due_date = e.target.value || undefined;
          break;
        case 'tags':
          task.tags = value ? value.split(';').map(t => t.trim()) : undefined;
          break;
      }
    });

    return task;
  }
}

/**
 * COMPREHENSIVE IMPORTS
 */
export class ComprehensiveProjectImports {
  private projectImports = new ProjectImports();
  private taskImports = new TaskImports();

  /**
   * Import complete project data from JSON export
   */
  async importCompleteProjectData(
    orgId: string,
    userId: string,
    jsonContent: string,
    options: ImportOptions = { format: 'json' }
  ): Promise<ImportResult> {
    try {
      const data = JSON.parse(jsonContent);

      if (!data.data) {
        throw new Error('Invalid export format');
      }

      const result: ImportResult = {
        success: true,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 0,
        errors: [],
        warnings: []
      };

      // Import in order: projects first, then tasks
      if (data.data.projects?.projects) {
        const projectResult = await this.projectImports.importProjectsFromJSON(
          orgId,
          userId,
          JSON.stringify(data.data.projects),
          options
        );
        this.mergeResults(result, projectResult);
      }

      if (data.data.tasks?.tasks) {
        const taskResult = await this.taskImports.importTasksFromCSV(
          orgId,
          userId,
          this.convertJSONToCSV(data.data.tasks),
          options
        );
        this.mergeResults(result, taskResult);
      }

      // Could add risks and inspections here

      return result;
    } catch (error: unknown) {
      console.error('Error importing complete project data:', error);
      return {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        skippedRecords: 0,
        errorRecords: 1,
        errors: [{ row: 0, message: error.message }],
        warnings: []
      };
    }
  }

  private mergeResults(target: ImportResult, source: ImportResult): void {
    target.totalRecords += source.totalRecords;
    target.importedRecords += source.importedRecords;
    target.skippedRecords += source.skippedRecords;
    target.errorRecords += source.errorRecords;
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.success = target.success && source.success;
  }

  private convertJSONToCSV(jsonArray: unknown[]): string {
    if (!jsonArray.length) return '';

    const headers = Object.keys(jsonArray[0]);
    const rows = jsonArray.map(obj =>
      headers.map(header => {
        const value = obj[header];
        return Array.isArray(value) ? value.join(';') : String(value || '');
      })
    );

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// Utility functions
function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });

  return { headers, rows };
}

// Export singleton instances
export const projectImports = new ProjectImports();
export const taskImports = new TaskImports();
export const comprehensiveImports = new ComprehensiveProjectImports();
