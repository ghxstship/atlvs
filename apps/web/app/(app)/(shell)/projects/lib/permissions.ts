import { createBrowserClient } from "@ghxstship/auth";
import { Project, ProjectTask, ProjectFile, ProjectActivation, ProjectRisk, ProjectInspection, ProjectLocation, ProjectMilestone } from "../types";

// Permission levels for the Projects module
export type PermissionLevel = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

// Project permissions
export interface ProjectPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage_members: boolean;
  manage_budget: boolean;
  view_financial: boolean;
  export: boolean;
}

// Task permissions
export interface TaskPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  assign: boolean;
  update_status: boolean;
  manage_dependencies: boolean;
}

// File permissions
export interface FilePermissions {
  upload: boolean;
  download: boolean;
  delete: boolean;
  manage_versions: boolean;
  change_access: boolean;
}

// Activation permissions
export interface ActivationPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage_stakeholders: boolean;
  update_status: boolean;
}

// Risk permissions
export interface RiskPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  assess: boolean;
  mitigate: boolean;
  close: boolean;
}

// Inspection permissions
export interface InspectionPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  conduct: boolean;
  approve: boolean;
  manage_checklist: boolean;
}

// Location permissions
export interface LocationPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage_facilities: boolean;
  assign_projects: boolean;
}

// Milestone permissions
export interface MilestonePermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  complete: boolean;
  manage_dependencies: boolean;
}

/**
 * Get user permission level for the organization
 */
export async function getUserPermissionLevel(orgId: string, userId: string): Promise<PermissionLevel> {
  const supabase = createBrowserClient();

  try {
    const { data: membership, error } = await supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      throw new Error('User is not a member of this organization');
    }

    return membership.role as PermissionLevel;
  } catch (error) {
    console.error('Error getting user permission level:', error);
    return 'viewer';
  }
}

/**
 * Get project-specific permissions for a user
 */
export async function getProjectPermissions(
  projectId: string,
  userId: string,
  permissionLevel: PermissionLevel
): Promise<ProjectPermissions> {
  const supabase = createBrowserClient();

  try {
    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('manager_id, created_by')
      .eq('id', projectId)
      .single();

    const isProjectManager = project?.manager_id === userId;
    const isProjectCreator = project?.created_by === userId;
    const isPrivileged = isProjectManager || isProjectCreator;

    // Base permissions by role
    const basePermissions: Record<PermissionLevel, ProjectPermissions> = {
      owner: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage_members: true,
        manage_budget: true,
        view_financial: true,
        export: true
      },
      admin: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage_members: true,
        manage_budget: true,
        view_financial: true,
        export: true
      },
      manager: {
        create: true,
        read: true,
        update: true,
        delete: false,
        manage_members: true,
        manage_budget: true,
        view_financial: true,
        export: true
      },
      member: {
        create: true,
        read: true,
        update: true,
        delete: false,
        manage_members: false,
        manage_budget: false,
        view_financial: false,
        export: true
      },
      viewer: {
        create: false,
        read: true,
        update: false,
        delete: false,
        manage_members: false,
        manage_budget: false,
        view_financial: false,
        export: false
      }
    };

    const permissions = { ...basePermissions[permissionLevel] };

    // Additional privileges for project managers/creators
    if (isPrivileged && permissionLevel === 'member') {
      permissions.update = true;
      permissions.manage_budget = true;
      permissions.view_financial = true;
    }

    return permissions;
  } catch (error) {
    console.error('Error getting project permissions:', error);
    return {
      create: false,
      read: false,
      update: false,
      delete: false,
      manage_members: false,
      manage_budget: false,
      view_financial: false,
      export: false
    };
  }
}

/**
 * Get task permissions for a user
 */
export async function getTaskPermissions(
  taskId: string,
  userId: string,
  permissionLevel: PermissionLevel
): Promise<TaskPermissions> {
  const supabase = createBrowserClient();

  try {
    // Get task details
    const { data: task } = await supabase
      .from('project_tasks')
      .select('assignee_id, reporter_id, created_by')
      .eq('id', taskId)
      .single();

    const isAssignee = task?.assignee_id === userId;
    const isReporter = task?.reporter_id === userId;
    const isCreator = task?.created_by === userId;

    // Base permissions by role
    const basePermissions: Record<PermissionLevel, TaskPermissions> = {
      owner: {
        create: true,
        read: true,
        update: true,
        delete: true,
        assign: true,
        update_status: true,
        manage_dependencies: true
      },
      admin: {
        create: true,
        read: true,
        update: true,
        delete: true,
        assign: true,
        update_status: true,
        manage_dependencies: true
      },
      manager: {
        create: true,
        read: true,
        update: true,
        delete: true,
        assign: true,
        update_status: true,
        manage_dependencies: true
      },
      member: {
        create: true,
        read: true,
        update: true,
        delete: false,
        assign: true,
        update_status: true,
        manage_dependencies: false
      },
      viewer: {
        create: false,
        read: true,
        update: false,
        delete: false,
        assign: false,
        update_status: false,
        manage_dependencies: false
      }
    };

    const permissions = { ...basePermissions[permissionLevel] };

    // Assignees can update their own tasks
    if (isAssignee && permissionLevel === 'viewer') {
      permissions.update = true;
      permissions.update_status = true;
    }

    return permissions;
  } catch (error) {
    console.error('Error getting task permissions:', error);
    return {
      create: false,
      read: false,
      update: false,
      delete: false,
      assign: false,
      update_status: false,
      manage_dependencies: false
    };
  }
}

/**
 * Get file permissions for a user
 */
export async function getFilePermissions(
  fileId: string,
  userId: string,
  permissionLevel: PermissionLevel
): Promise<FilePermissions> {
  const supabase = createBrowserClient();

  try {
    // Get file details
    const { data: file } = await supabase
      .from('project_files')
      .select('uploaded_by, access_level')
      .eq('id', fileId)
      .single();

    const isUploader = file?.uploaded_by === userId;
    const accessLevel = file?.access_level || 'team';

    // Base permissions by role
    const basePermissions: Record<PermissionLevel, FilePermissions> = {
      owner: {
        upload: true,
        download: true,
        delete: true,
        manage_versions: true,
        change_access: true
      },
      admin: {
        upload: true,
        download: true,
        delete: true,
        manage_versions: true,
        change_access: true
      },
      manager: {
        upload: true,
        download: true,
        delete: true,
        manage_versions: false,
        change_access: false
      },
      member: {
        upload: true,
        download: true,
        delete: false,
        manage_versions: false,
        change_access: false
      },
      viewer: {
        upload: false,
        download: true,
        delete: false,
        manage_versions: false,
        change_access: false
      }
    };

    const permissions = { ...basePermissions[permissionLevel] };

    // Restrict based on access level
    if (accessLevel === 'private' && !isUploader) {
      permissions.download = false;
      permissions.delete = false;
    } else if (accessLevel === 'restricted' && !['owner', 'admin', 'manager'].includes(permissionLevel)) {
      permissions.download = false;
      permissions.delete = false;
    }

    return permissions;
  } catch (error) {
    console.error('Error getting file permissions:', error);
    return {
      upload: false,
      download: false,
      delete: false,
      manage_versions: false,
      change_access: false
    };
  }
}

/**
 * Check if user has permission to perform an action on a resource
 */
export async function checkPermission(
  resourceType: 'project' | 'task' | 'file' | 'activation' | 'risk' | 'inspection' | 'location' | 'milestone',
  action: string,
  resourceId: string,
  userId: string,
  orgId: string
): Promise<boolean> {
  try {
    const permissionLevel = await getUserPermissionLevel(orgId, userId);

    switch (resourceType) {
      case 'project':
        const projectPerms = await getProjectPermissions(resourceId, userId, permissionLevel);
        return (projectPerms as any)[action] || false;

      case 'task':
        const taskPerms = await getTaskPermissions(resourceId, userId, permissionLevel);
        return (taskPerms as any)[action] || false;

      case 'file':
        const filePerms = await getFilePermissions(resourceId, userId, permissionLevel);
        return (filePerms as any)[action] || false;

      default:
        // For other resources, use role-based permissions
        const rolePermissions: Record<PermissionLevel, Record<string, boolean>> = {
          owner: { create: true, read: true, update: true, delete: true },
          admin: { create: true, read: true, update: true, delete: true },
          manager: { create: true, read: true, update: true, delete: false },
          member: { create: true, read: true, update: false, delete: false },
          viewer: { create: false, read: true, update: false, delete: false }
        };

        return rolePermissions[permissionLevel]?.[action] || false;
    }
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user across all resource types
 */
export async function getAllPermissions(
  orgId: string,
  userId: string,
  projectId?: string
): Promise<{
  organization: PermissionLevel;
  project?: ProjectPermissions;
  task: TaskPermissions;
  file: FilePermissions;
  activation: ActivationPermissions;
  risk: RiskPermissions;
  inspection: InspectionPermissions;
  location: LocationPermissions;
  milestone: MilestonePermissions;
}> {
  const permissionLevel = await getUserPermissionLevel(orgId, userId);

  const basePermissions = {
    organization: permissionLevel,
    task: {
      create: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      delete: ['owner', 'admin', 'manager'].includes(permissionLevel),
      assign: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      update_status: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      manage_dependencies: ['owner', 'admin', 'manager'].includes(permissionLevel)
    },
    file: {
      upload: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      download: true,
      delete: ['owner', 'admin', 'manager'].includes(permissionLevel),
      manage_versions: ['owner', 'admin'].includes(permissionLevel),
      change_access: ['owner', 'admin'].includes(permissionLevel)
    },
    activation: {
      create: ['owner', 'admin', 'manager'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager'].includes(permissionLevel),
      delete: ['owner', 'admin'].includes(permissionLevel),
      manage_stakeholders: ['owner', 'admin', 'manager'].includes(permissionLevel),
      update_status: ['owner', 'admin', 'manager'].includes(permissionLevel)
    },
    risk: {
      create: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      delete: ['owner', 'admin', 'manager'].includes(permissionLevel),
      assess: ['owner', 'admin', 'manager'].includes(permissionLevel),
      mitigate: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      close: ['owner', 'admin', 'manager'].includes(permissionLevel)
    },
    inspection: {
      create: ['owner', 'admin', 'manager'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager'].includes(permissionLevel),
      delete: ['owner', 'admin'].includes(permissionLevel),
      conduct: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      approve: ['owner', 'admin', 'manager'].includes(permissionLevel),
      manage_checklist: ['owner', 'admin', 'manager'].includes(permissionLevel)
    },
    location: {
      create: ['owner', 'admin', 'manager'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager'].includes(permissionLevel),
      delete: ['owner', 'admin'].includes(permissionLevel),
      manage_facilities: ['owner', 'admin', 'manager'].includes(permissionLevel),
      assign_projects: ['owner', 'admin', 'manager'].includes(permissionLevel)
    },
    milestone: {
      create: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      read: true,
      update: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      delete: ['owner', 'admin', 'manager'].includes(permissionLevel),
      complete: ['owner', 'admin', 'manager', 'member'].includes(permissionLevel),
      manage_dependencies: ['owner', 'admin', 'manager'].includes(permissionLevel)
    }
  };

  if (projectId) {
    const projectPermissions = await getProjectPermissions(projectId, userId, permissionLevel);
    return { ...basePermissions, project: projectPermissions };
  }

  return basePermissions;
}
