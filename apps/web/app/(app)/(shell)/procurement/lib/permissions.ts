/**
 * Procurement Permissions Service
 * RLS permission handlers with role-based access control
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Permission levels
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  CREATE = 2,
  UPDATE = 3,
  DELETE = 4,
  ADMIN = 5,
}

// User roles in procurement context
export enum ProcurementRole {
  VIEWER = 'viewer',
  MEMBER = 'member',
  MANAGER = 'manager',
  ADMIN = 'admin',
  OWNER = 'owner',
}

// Permission matrix for each role
const ROLE_PERMISSIONS: Record<ProcurementRole, Record<string, PermissionLevel>> = {
  [ProcurementRole.VIEWER]: {
    orders: PermissionLevel.VIEW,
    vendors: PermissionLevel.VIEW,
    requests: PermissionLevel.VIEW,
    contracts: PermissionLevel.VIEW,
    budgets: PermissionLevel.VIEW,
    analytics: PermissionLevel.VIEW,
  },
  [ProcurementRole.MEMBER]: {
    orders: PermissionLevel.UPDATE,
    vendors: PermissionLevel.UPDATE,
    requests: PermissionLevel.CREATE,
    contracts: PermissionLevel.VIEW,
    budgets: PermissionLevel.VIEW,
    analytics: PermissionLevel.VIEW,
  },
  [ProcurementRole.MANAGER]: {
    orders: PermissionLevel.UPDATE,
    vendors: PermissionLevel.UPDATE,
    requests: PermissionLevel.UPDATE,
    contracts: PermissionLevel.UPDATE,
    budgets: PermissionLevel.UPDATE,
    analytics: PermissionLevel.UPDATE,
  },
  [ProcurementRole.ADMIN]: {
    orders: PermissionLevel.ADMIN,
    vendors: PermissionLevel.ADMIN,
    requests: PermissionLevel.ADMIN,
    contracts: PermissionLevel.ADMIN,
    budgets: PermissionLevel.ADMIN,
    analytics: PermissionLevel.ADMIN,
  },
  [ProcurementRole.OWNER]: {
    orders: PermissionLevel.ADMIN,
    vendors: PermissionLevel.ADMIN,
    requests: PermissionLevel.ADMIN,
    contracts: PermissionLevel.ADMIN,
    budgets: PermissionLevel.ADMIN,
    analytics: PermissionLevel.ADMIN,
  },
};

// Permission check result
const PermissionCheckResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  requiredLevel: z.nativeEnum(PermissionLevel),
  userLevel: z.nativeEnum(PermissionLevel),
});

export type PermissionCheckResult = z.infer<typeof PermissionCheckResultSchema>;

// Permission context
export interface PermissionContext {
  userId: string;
  orgId: string;
  userRole: ProcurementRole;
  resourceId?: string;
  resourceType?: string;
  action: string;
}

/**
 * Procurement Permissions Service Class
 * Handles role-based access control and permission validation
 */
export class ProcurementPermissionsService {
  private supabase: unknown;
  private orgId: string;
  private userId: string;
  private userRole: ProcurementRole | null = null;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase = createClient();
  }

  /**
   * Initialize user role from database
   */
  async initializeUserRole(): Promise<ProcurementRole> {
    if (this.userRole) return this.userRole;

    // Get user membership and role
    const { data: membership, error } = await this.supabase
      .from('memberships')
      .select('role')
      .eq('organization_id', this.orgId)
      .eq('user_id', this.userId)
      .single();

    if (error || !membership) {
      this.userRole = ProcurementRole.VIEWER; // Default fallback
    } else {
      this.userRole = membership.role as ProcurementRole;
    }

    return this.userRole;
  }

  /**
   * Check if user has permission for an action
   */
  async checkPermission(
    resourceType: string,
    action: string,
    resourceId?: string
  ): Promise<PermissionCheckResult> {
    const role = await this.initializeUserRole();
    const permissions = ROLE_PERMISSIONS[role];

    if (!permissions) {
      return {
        allowed: false,
        reason: 'Invalid user role',
        requiredLevel: PermissionLevel.NONE,
        userLevel: PermissionLevel.NONE,
      };
    }

    const userLevel = permissions[resourceType] || PermissionLevel.NONE;
    const requiredLevel = this.getRequiredLevel(action);

    const allowed = userLevel >= requiredLevel;

    return {
      allowed,
      reason: allowed ? undefined : `Insufficient permissions. Required: ${PermissionLevel[requiredLevel]}, User has: ${PermissionLevel[userLevel]}`,
      requiredLevel,
      userLevel,
    };
  }

  /**
   * Get required permission level for an action
   */
  private getRequiredLevel(action: string): PermissionLevel {
    switch (action.toLowerCase()) {
      case 'view':
      case 'read':
      case 'list':
        return PermissionLevel.VIEW;
      case 'create':
      case 'insert':
        return PermissionLevel.CREATE;
      case 'update':
      case 'edit':
        return PermissionLevel.UPDATE;
      case 'delete':
      case 'remove':
        return PermissionLevel.DELETE;
      case 'admin':
      case 'manage':
        return PermissionLevel.ADMIN;
      default:
        return PermissionLevel.NONE;
    }
  }

  /**
   * Check bulk operation permissions
   */
  async checkBulkPermission(
    resourceType: string,
    action: string,
    resourceIds: string[]
  ): Promise<PermissionCheckResult> {
    // For bulk operations, check if user can perform action on ALL resources
    for (const resourceId of resourceIds) {
      const result = await this.checkPermission(resourceType, action, resourceId);
      if (!result.allowed) {
        return result;
      }
    }

    return {
      allowed: true,
      requiredLevel: this.getRequiredLevel(action),
      userLevel: await this.getUserLevel(resourceType),
    };
  }

  /**
   * Get user's permission level for a resource type
   */
  async getUserLevel(resourceType: string): Promise<PermissionLevel> {
    const role = await this.initializeUserRole();
    return ROLE_PERMISSIONS[role]?.[resourceType] || PermissionLevel.NONE;
  }

  /**
   * Check field-level permissions
   */
  async checkFieldPermission(
    resourceType: string,
    fieldName: string,
    action: 'view' | 'edit',
    resourceId?: string
  ): Promise<boolean> {
    // Basic implementation - could be extended with field-level permissions
    const basePermission = await this.checkPermission(resourceType, action, resourceId);
    if (!basePermission.allowed) return false;

    // Define sensitive fields that require higher permissions
    const sensitiveFields = {
      orders: ['approved_by', 'approved_at'],
      vendors: ['tax_id'],
      contracts: ['value', 'terms'],
      budgets: ['amount'],
    };

    const sensitive = sensitiveFields[resourceType as keyof typeof sensitiveFields]?.includes(fieldName);
    if (sensitive && basePermission.userLevel < PermissionLevel.UPDATE) {
      return false;
    }

    return true;
  }

  /**
   * Apply permission filters to a query
   */
  async applyPermissionFilters(
    query: unknown,
    resourceType: string,
    userId: string
  ): Promise< {
    const role = await this.initializeUserRole();
    const userLevel = ROLE_PERMISSIONS[role]?.[resourceType] || PermissionLevel.NONE;

    // Apply organization filter (RLS)
    query = query.eq('organization_id', this.orgId);

    // Apply user-specific filters based on role
    if (userLevel < PermissionLevel.ADMIN) {
      switch (resourceType) {
        case 'orders':
          // Members can only see orders they created or are assigned to
          if (userLevel < PermissionLevel.UPDATE) {
            query = query.eq('requested_by', userId);
          }
          break;
        case 'requests':
          // Users can only see their own requests unless they have approval permissions
          if (userLevel < PermissionLevel.UPDATE) {
            query = query.eq('requested_by', userId);
          }
          break;
        case 'contracts':
          // Managers and above can see all contracts
          if (userLevel < PermissionLevel.UPDATE) {
            query = query.eq('created_by', userId);
          }
          break;
      }
    }

    return query;
  }

  /**
   * Get available actions for a user on a specific resource
   */
  async getAvailableActions(resourceType: string, resourceId?: string): Promise<string[]> {
    const actions = ['view'];
    const createPerm = await this.checkPermission(resourceType, 'create');
    const updatePerm = await this.checkPermission(resourceType, 'update', resourceId);
    const deletePerm = await this.checkPermission(resourceType, 'delete', resourceId);

    if (createPerm.allowed) actions.push('create');
    if (updatePerm.allowed) actions.push('update');
    if (deletePerm.allowed) actions.push('delete');

    // Add business-specific actions
    if (resourceType === 'orders' && updatePerm.allowed) {
      actions.push('approve', 'reject');
    }

    return actions;
  }

  /**
   * Validate approval workflow permissions
   */
  async canApprove(resourceType: string, resourceId: string): Promise<boolean> {
    const role = await this.initializeUserRole();

    // Only managers, admins, and owners can approve
    return [ProcurementRole.MANAGER, ProcurementRole.ADMIN, ProcurementRole.OWNER].includes(role);
  }

  /**
   * Check if user can manage budgets
   */
  async canManageBudgets(): Promise<boolean> {
    const role = await this.initializeUserRole();
    return [ProcurementRole.MANAGER, ProcurementRole.ADMIN, ProcurementRole.OWNER].includes(role);
  }

  /**
   * Get permission audit trail
   */
  async getPermissionAudit(userId: string, resourceType?: string, limit: number = 50) {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', this.orgId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (resourceType) {
      query = query.eq('table_name', resourceType);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get permission audit: ${error.message}`);

    return data;
  }

  /**
   * Grant temporary elevated permissions (for approval workflows)
   */
  async grantTemporaryPermission(
    resourceType: string,
    resourceId: string,
    permissionLevel: PermissionLevel,
    durationMinutes: number = 60
  ): Promise<boolean> {
    // This would require additional database schema for temporary permissions
    // For now, return false as this is not implemented
    console.warn('Temporary permissions not yet implemented');
    return false;
  }
}

// Factory function
export function createProcurementPermissionsService(
  orgId: string,
  userId: string
): ProcurementPermissionsService {
  return new ProcurementPermissionsService(orgId, userId);
}

// Utility functions
export function hasPermission(
  userRole: ProcurementRole,
  resourceType: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;

  const userLevel = permissions[resourceType] || PermissionLevel.NONE;
  const requiredLevel = action === 'view' ? PermissionLevel.VIEW :
                       action === 'create' ? PermissionLevel.CREATE :
                       action === 'update' ? PermissionLevel.UPDATE :
                       action === 'delete' ? PermissionLevel.DELETE :
                       PermissionLevel.ADMIN;

  return userLevel >= requiredLevel;
}

export function getRoleDisplayName(role: ProcurementRole): string {
  switch (role) {
    case ProcurementRole.VIEWER: return 'Viewer';
    case ProcurementRole.MEMBER: return 'Member';
    case ProcurementRole.MANAGER: return 'Manager';
    case ProcurementRole.ADMIN: return 'Admin';
    case ProcurementRole.OWNER: return 'Owner';
    default: return 'Unknown';
  }
}
