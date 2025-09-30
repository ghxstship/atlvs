import { createBrowserClient } from "@ghxstship/auth";
import {
  Project,
  ProjectTask,
  ProjectFile,
  ProjectActivation,
  ProjectRisk,
  ProjectInspection,
  ProjectLocation,
  ProjectMilestone,
  CreateProjectData,
  UpdateProjectData,
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateFileSchema,
  UpdateActivationSchema,
  CreateRiskSchema,
  UpdateRiskSchema,
  CreateInspectionSchema,
  UpdateInspectionSchema,
  CreateLocationSchema,
  UpdateLocationSchema,
  CreateMilestoneSchema,
  UpdateMilestoneSchema,
} from "../types";
import { checkPermission } from "./permissions";

// Mutation result type
export interface MutationResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * PROJECT MUTATIONS
 */
export class ProjectMutations {
  private supabase = createBrowserClient();

  /**
   * Create a new project
   */
  async createProject(
    orgId: string,
    userId: string,
    projectData: CreateProjectData
  ): Promise<MutationResult<Project>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('project', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create project', success: false };
      }

      const now = new Date().toISOString();
      const projectPayload = {
        ...projectData,
        organization_id: orgId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('projects')
        .insert([projectPayload])
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the creation
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'project',
        resource_id: data.id,
        action: 'created',
        details: { name: projectData.name },
        created_at: now,
      }]);

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating project:', error);
      return { error: error.message || 'Failed to create project', success: false };
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(
    projectId: string,
    userId: string,
    orgId: string,
    updates: UpdateProjectData
  ): Promise<MutationResult<Project>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('project', 'update', projectId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to update project', success: false };
      }

      const { data, error } = await this.supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('organization_id', orgId)
        .select(`
          *,
          client:clients(id, name),
          manager:users!projects_manager_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the update
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'project',
        resource_id: projectId,
        action: 'updated',
        details: updates,
        created_at: new Date().toISOString(),
      }]);

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error updating project:', error);
      return { error: error.message || 'Failed to update project', success: false };
    }
  }

  /**
   * Delete a project (soft delete)
   */
  async deleteProject(
    projectId: string,
    userId: string,
    orgId: string
  ): Promise<MutationResult<void>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('project', 'delete', projectId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to delete project', success: false };
      }

      const { error } = await this.supabase
        .from('projects')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('organization_id', orgId);

      if (error) throw error;

      // Log the deletion
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'project',
        resource_id: projectId,
        action: 'deleted',
        created_at: new Date().toISOString(),
      }]);

      return { success: true };
    } catch (error: unknown) {
      console.error('Error deleting project:', error);
      return { error: error.message || 'Failed to delete project', success: false };
    }
  }
}

/**
 * TASK MUTATIONS
 */
export class TaskMutations {
  private supabase = createBrowserClient();

  async createTask(
    orgId: string,
    userId: string,
    taskData: unknown // Using any for now, should use CreateTaskData
  ): Promise<MutationResult<ProjectTask>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('task', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create task', success: false };
      }

      // Get the highest position for this project
      const { data: existingTasks } = await this.supabase
        .from('project_tasks')
        .select('position')
        .eq('project_id', taskData.project_id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (existingTasks?.[0]?.position || 0) + 1;

      const now = new Date().toISOString();
      const taskPayload = {
        ...taskData,
        organization_id: orgId,
        position: nextPosition,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_tasks')
        .insert([taskPayload])
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!project_tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          reporter:users!project_tasks_reporter_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the creation
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'task',
        resource_id: data.id,
        action: 'created',
        details: { title: taskData.title },
        created_at: now,
      }]);

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating task:', error);
      return { error: error.message || 'Failed to create task', success: false };
    }
  }

  async updateTask(
    taskId: string,
    userId: string,
    orgId: string,
    updates: unknown
  ): Promise<MutationResult<ProjectTask>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('task', 'update', taskId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to update task', success: false };
      }

      const { data, error } = await this.supabase
        .from('project_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq('id', taskId)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name, status),
          assignee:users!project_tasks_assignee_id_fkey(id, email, full_name, avatar_url),
          reporter:users!project_tasks_reporter_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the update
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'task',
        resource_id: taskId,
        action: 'updated',
        details: updates,
        created_at: new Date().toISOString(),
      }]);

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error updating task:', error);
      return { error: error.message || 'Failed to update task', success: false };
    }
  }

  async deleteTask(
    taskId: string,
    userId: string,
    orgId: string
  ): Promise<MutationResult<void>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('task', 'delete', taskId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to delete task', success: false };
      }

      const { error } = await this.supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)
        .eq('organization_id', orgId);

      if (error) throw error;

      // Log the deletion
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'task',
        resource_id: taskId,
        action: 'deleted',
        created_at: new Date().toISOString(),
      }]);

      return { success: true };
    } catch (error: unknown) {
      console.error('Error deleting task:', error);
      return { error: error.message || 'Failed to delete task', success: false };
    }
  }

  async updateTaskPositions(
    orgId: string,
    userId: string,
    updates: Array<{ id: string; position: number }>
  ): Promise<MutationResult<void>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('task', 'update', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to reorder tasks', success: false };
      }

      const updatePromises = updates.map(({ id, position }) =>
        this.supabase
          .from('project_tasks')
          .update({
            position,
            updated_at: new Date().toISOString(),
            updated_by: userId,
          })
          .eq('id', id)
          .eq('organization_id', orgId)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error('Failed to update some task positions');
      }

      return { success: true };
    } catch (error: unknown) {
      console.error('Error updating task positions:', error);
      return { error: error.message || 'Failed to reorder tasks', success: false };
    }
  }
}

/**
 * FILE MUTATIONS
 */
export class FileMutations {
  private supabase = createBrowserClient();

  async uploadFile(
    orgId: string,
    userId: string,
    fileData: unknown
  ): Promise<MutationResult<ProjectFile>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('file', 'upload', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to upload files', success: false };
      }

      const now = new Date().toISOString();
      const filePayload = {
        ...fileData,
        organization_id: orgId,
        uploaded_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_files')
        .insert([filePayload])
        .select(`
          *,
          project:projects(id, name),
          uploader:users!project_files_uploaded_by_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log the upload
      await this.supabase.from('activity_logs').insert([{
        organization_id: orgId,
        user_id: userId,
        resource_type: 'file',
        resource_id: data.id,
        action: 'uploaded',
        details: { name: fileData.name },
        created_at: now,
      }]);

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      return { error: error.message || 'Failed to upload file', success: false };
    }
  }

  async updateFile(
    fileId: string,
    userId: string,
    orgId: string,
    updates: unknown
  ): Promise<MutationResult<ProjectFile>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('file', 'manage_versions', fileId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to update file', success: false };
      }

      const { data, error } = await this.supabase
        .from('project_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fileId)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name),
          uploader:users!project_files_uploaded_by_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error updating file:', error);
      return { error: error.message || 'Failed to update file', success: false };
    }
  }

  async deleteFile(
    fileId: string,
    userId: string,
    orgId: string
  ): Promise<MutationResult<void>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('file', 'delete', fileId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to delete file', success: false };
      }

      const { error } = await this.supabase
        .from('project_files')
        .delete()
        .eq('id', fileId)
        .eq('organization_id', orgId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      console.error('Error deleting file:', error);
      return { error: error.message || 'Failed to delete file', success: false };
    }
  }
}

/**
 * RISK MUTATIONS
 */
export class RiskMutations {
  private supabase = createBrowserClient();

  async createRisk(
    orgId: string,
    userId: string,
    riskData: unknown
  ): Promise<MutationResult<ProjectRisk>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('risk', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create risk', success: false };
      }

      const now = new Date().toISOString();
      const riskPayload = {
        ...riskData,
        organization_id: orgId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_risks')
        .insert([riskPayload])
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_risks_owner_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating risk:', error);
      return { error: error.message || 'Failed to create risk', success: false };
    }
  }

  async updateRisk(
    riskId: string,
    userId: string,
    orgId: string,
    updates: unknown
  ): Promise<MutationResult<ProjectRisk>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('risk', 'update', riskId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to update risk', success: false };
      }

      const { data, error } = await this.supabase
        .from('project_risks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', riskId)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_risks_owner_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error updating risk:', error);
      return { error: error.message || 'Failed to update risk', success: false };
    }
  }
}

/**
 * INSPECTION MUTATIONS
 */
export class InspectionMutations {
  private supabase = createBrowserClient();

  async createInspection(
    orgId: string,
    userId: string,
    inspectionData: unknown
  ): Promise<MutationResult<ProjectInspection>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('inspection', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create inspection', success: false };
      }

      const now = new Date().toISOString();
      const inspectionPayload = {
        ...inspectionData,
        organization_id: orgId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_inspections')
        .insert([inspectionPayload])
        .select(`
          *,
          project:projects(id, name),
          inspector:users!project_inspections_inspector_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating inspection:', error);
      return { error: error.message || 'Failed to create inspection', success: false };
    }
  }
}

/**
 * ACTIVATION MUTATIONS
 */
export class ActivationMutations {
  private supabase = createBrowserClient();

  async createActivation(
    orgId: string,
    userId: string,
    activationData: unknown
  ): Promise<MutationResult<ProjectActivation>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('activation', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create activation', success: false };
      }

      const now = new Date().toISOString();
      const activationPayload = {
        ...activationData,
        organization_id: orgId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_activations')
        .insert([activationPayload])
        .select(`
          *,
          project:projects(id, name)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating activation:', error);
      return { error: error.message || 'Failed to create activation', success: false };
    }
  }
}

/**
 * LOCATION MUTATIONS
 */
export class LocationMutations {
  private supabase = createBrowserClient();

  async createLocation(
    orgId: string,
    userId: string,
    locationData: unknown
  ): Promise<MutationResult<ProjectLocation>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('location', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create location', success: false };
      }

      const now = new Date().toISOString();
      const locationPayload = {
        ...locationData,
        organization_id: orgId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_locations')
        .insert([locationPayload])
        .select('*')
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating location:', error);
      return { error: error.message || 'Failed to create location', success: false };
    }
  }
}

/**
 * MILESTONE MUTATIONS
 */
export class MilestoneMutations {
  private supabase = createBrowserClient();

  async createMilestone(
    orgId: string,
    userId: string,
    milestoneData: unknown
  ): Promise<MutationResult<ProjectMilestone>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('milestone', 'create', '', userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to create milestone', success: false };
      }

      const now = new Date().toISOString();
      const milestonePayload = {
        ...milestoneData,
        organization_id: orgId,
        created_by: userId,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await this.supabase
        .from('project_milestones')
        .insert([milestonePayload])
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_milestones_owner_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error creating milestone:', error);
      return { error: error.message || 'Failed to create milestone', success: false };
    }
  }

  async updateMilestone(
    milestoneId: string,
    userId: string,
    orgId: string,
    updates: unknown
  ): Promise<MutationResult<ProjectMilestone>> {
    try {
      // Check permissions
      const hasPermission = await checkPermission('milestone', 'update', milestoneId, userId, orgId);
      if (!hasPermission) {
        return { error: 'Insufficient permissions to update milestone', success: false };
      }

      const { data, error } = await this.supabase
        .from('project_milestones')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', milestoneId)
        .eq('organization_id', orgId)
        .select(`
          *,
          project:projects(id, name),
          owner:users!project_milestones_owner_id_fkey(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return { data, success: true };
    } catch (error: unknown) {
      console.error('Error updating milestone:', error);
      return { error: error.message || 'Failed to update milestone', success: false };
    }
  }
}

// Export singleton instances
export const projectMutations = new ProjectMutations();
export const taskMutations = new TaskMutations();
export const fileMutations = new FileMutations();
export const riskMutations = new RiskMutations();
export const inspectionMutations = new InspectionMutations();
export const activationMutations = new ActivationMutations();
export const locationMutations = new LocationMutations();
export const milestoneMutations = new MilestoneMutations();
