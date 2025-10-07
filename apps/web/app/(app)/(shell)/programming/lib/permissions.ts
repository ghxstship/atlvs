/**
 * Programming Module Permission Handlers
 * Row Level Security permission management and role-based access control
 */
import { createClient } from '@/lib/supabase/server';
import type {
  PermissionCheck,
  PermissionResult,
} from '../types';

export class ProgrammingPermissionsService {
  private supabase = createClient();

  // Role definitions
  private readonly ROLES = {
    viewer: ['read'],
    contributor: ['read', 'create', 'update'],
    manager: ['read', 'create', 'update', 'delete'],
    admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
    owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
  } as const;

  // Entity-specific permissions
  private readonly ENTITY_PERMISSIONS = {
    events: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    performances: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    'call-sheets': {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    riders: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    itineraries: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    lineups: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    spaces: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
    workshops: {
      viewer: ['read'],
      contributor: ['read', 'create', 'update'],
      manager: ['read', 'create', 'update', 'delete'],
      admin: ['read', 'create', 'update', 'delete', 'export', 'import'],
      owner: ['read', 'create', 'update', 'delete', 'export', 'import'],
    },
  } as const;

  /**
   * Check if a user has permission to perform an action on an entity
   */
  async checkPermission(permission: PermissionCheck): Promise<PermissionResult> {
    try {
      // Get user's role in the organization
      const userRole = await this.getUserRole(permission.user_id, permission.organization_id);

      if (!userRole) {
        return {
          allowed: false,
          reason: 'User is not a member of this organization',
        };
      }

      // Check if the role has the required permission for this entity
      const entityPermissions = this.ENTITY_PERMISSIONS[permission.entity as keyof typeof this.ENTITY_PERMISSIONS];

      if (!entityPermissions) {
        return {
          allowed: false,
          reason: 'Unknown entity type',
        };
      }

      const rolePermissions = entityPermissions[userRole as keyof typeof entityPermissions];

      if (!rolePermissions) {
        return {
          allowed: false,
          reason: 'Invalid user role',
        };
      }

      const hasPermission = rolePermissions.includes(permission.action);

      if (!hasPermission) {
        return {
          allowed: false,
          reason: `Role '${userRole}' does not have '${permission.action}' permission for '${permission.entity}'`,
          required_role: this.getRequiredRoles(permission.entity, permission.action),
        };
      }

      // Additional resource-specific checks
      if (permission.resource_id) {
        const resourceCheck = await this.checkResourceOwnership(
          permission.entity,
          permission.resource_id,
          permission.user_id,
          permission.organization_id,
          permission.action
        );

        if (!resourceCheck.allowed) {
          return resourceCheck;
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        allowed: false,
        reason: 'Permission check failed due to system error',
      };
    }
  }

  /**
   * Get the user's role in the organization
   */
  private async getUserRole(userId: string, organizationId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return null;
      }

      return data.role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Check resource ownership and additional permissions
   */
  private async checkResourceOwnership(
    entity: string,
    resourceId: string,
    userId: string,
    organizationId: string,
    action: string
  ): Promise<PermissionResult> {
    try {
      // Check if the resource belongs to the organization
      const tableName = this.getTableName(entity);
      if (!tableName) {
        return { allowed: false, reason: 'Invalid entity type' };
      }

      const { data, error } = await this.supabase
        .from(tableName)
        .select('created_by')
        .eq('id', resourceId)
        .eq('organization_id', organizationId)
        .single();

      if (error || !data) {
        return { allowed: false, reason: 'Resource not found or access denied' };
      }

      // Additional ownership checks for certain actions
      if (action === 'delete' || action === 'update') {
        // Only allow deletion/updates by the creator or higher roles
        if (data.created_by !== userId) {
          const userRole = await this.getUserRole(userId, organizationId);
          if (!['admin', 'owner', 'manager'].includes(userRole || '')) {
            return {
              allowed: false,
              reason: 'Only the creator or managers can perform this action',
            };
          }
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Resource ownership check error:', error);
      return { allowed: false, reason: 'Resource check failed' };
    }
  }

  /**
   * Get the database table name for an entity
   */
  private getTableName(entity: string): string | null {
    const tableMap: Record<string, string> = {
      events: 'programming_events',
      performances: 'performances',
      'call-sheets': 'call_sheets',
      riders: 'riders',
      itineraries: 'itineraries',
      lineups: 'lineups',
      spaces: 'spaces',
      workshops: 'workshops',
    };

    return tableMap[entity] || null;
  }

  /**
   * Get the minimum roles required for an action on an entity
   */
  private getRequiredRoles(entity: string, action: string): string[] {
    const entityPerms = this.ENTITY_PERMISSIONS[entity as keyof typeof this.ENTITY_PERMISSIONS];
    if (!entityPerms) return [];

    const requiredRoles: string[] = [];
    for (const [role, permissions] of Object.entries(entityPerms)) {
      if (permissions.includes(action)) {
        requiredRoles.push(role);
      }
    }

    return requiredRoles;
  }

  /**
   * Check bulk permissions for multiple resources
   */
  async checkBulkPermissions(
    permissions: PermissionCheck[],
    userId: string,
    organizationId: string
  ): Promise<PermissionResult[]> {
    const results = await Promise.all(
      permissions.map(perm => this.checkPermission({ ...perm, user_id: userId, organization_id: organizationId }))
    );

    return results;
  }

  /**
   * Get all permissions for a user in an organization
   */
  async getUserPermissions(userId: string, organizationId: string): Promise<Record<string, string[]>> {
    const userRole = await this.getUserRole(userId, organizationId);

    if (!userRole) {
      return {};
    }

    const permissions: Record<string, string[]> = {};

    for (const [entity, rolePerms] of Object.entries(this.ENTITY_PERMISSIONS)) {
      const rolePermissions = rolePerms[userRole as keyof typeof rolePerms];
      if (rolePermissions) {
        permissions[entity] = rolePermissions;
      }
    }

    return permissions;
  }

  /**
   * Check if user can access the programming module at all
   */
  async canAccessModule(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return role !== null && ['viewer', 'contributor', 'manager', 'admin', 'owner'].includes(role);
  }

  /**
   * Get field-level permissions for a specific entity
   */
  async getFieldPermissions(
    entity: string,
    userId: string,
    organizationId: string
  ): Promise<Record<string, { read: boolean; write: boolean }>> {
    const role = await this.getUserRole(userId, organizationId);
    if (!role) {
      return {};
    }

    // Define field permissions based on entity and role
    const fieldPermissions: Record<string, Record<string, { read: boolean; write: boolean }>> = {
      events: {
        title: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        description: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        type: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        status: { read: true, write: ['manager', 'admin', 'owner'].includes(role) },
        start_date: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        end_date: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        location: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        capacity: { read: true, write: ['manager', 'admin', 'owner'].includes(role) },
      },
      performances: {
        title: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        description: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        venue: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        date: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        duration: { read: true, write: ['contributor', 'manager', 'admin', 'owner'].includes(role) },
        status: { read: true, write: ['manager', 'admin', 'owner'].includes(role) },
      },
      // Add similar field permissions for other entities...
    };

    return fieldPermissions[entity] || {};
  }

  /**
   * Validate organization membership
   */
  async validateOrganizationMembership(userId: string, organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is organization owner
   */
  async isOrganizationOwner(userId: string, organizationId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      return !error && data?.role === 'owner';
    } catch {
      return false;
    }
  }

  /**
   * Get organization members with roles
   */
  async getOrganizationMembers(organizationId: string): Promise<Array<{ user_id: string; role: string; name: string; email: string }>> {
    try {
      const { data, error } = await this.supabase
        .from('memberships')
        .select(`
          user_id,
          role,
          users (
            name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) return [];

      return (data || []).map(item => ({
        user_id: item.user_id,
        role: item.role,
        name: item.users?.name || '',
        email: item.users?.email || '',
      }));
    } catch {
      return [];
    }
  }
}

export const programmingPermissions = new ProgrammingPermissionsService();
