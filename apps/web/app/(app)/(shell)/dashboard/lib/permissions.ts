/**
 * Dashboard Module Permission System
 * Enterprise-grade role-based access control and row-level security
 * Provides granular permissions with dynamic evaluation and caching
 */

import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Permission Types
export type Permission =
  | 'dashboard:create'
  | 'dashboard:read'
  | 'dashboard:update'
  | 'dashboard:delete'
  | 'dashboard:share'
  | 'dashboard:export'
  | 'widget:create'
  | 'widget:read'
  | 'widget:update'
  | 'widget:delete'
  | 'widget:configure'
  | 'filter:create'
  | 'filter:read'
  | 'filter:update'
  | 'filter:delete'
  | 'analytics:read'
  | 'analytics:export'
  | 'settings:update';

export type Role = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export type ResourceType = 'dashboard' | 'widget' | 'filter' | 'organization';

export interface PermissionContext {
  userId: string;
  orgId: string;
  resourceId?: string;
  resourceType?: ResourceType;
  session: Session;
}

// Permission Matrix
const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  owner: [
    'dashboard:create', 'dashboard:read', 'dashboard:update', 'dashboard:delete',
    'dashboard:share', 'dashboard:export',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:configure',
    'filter:create', 'filter:read', 'filter:update', 'filter:delete',
    'analytics:read', 'analytics:export',
    'settings:update'
  ],
  admin: [
    'dashboard:create', 'dashboard:read', 'dashboard:update', 'dashboard:delete',
    'dashboard:share', 'dashboard:export',
    'widget:create', 'widget:read', 'widget:update', 'widget:delete', 'widget:configure',
    'filter:create', 'filter:read', 'filter:update', 'filter:delete',
    'analytics:read', 'analytics:export',
    'settings:update'
  ],
  editor: [
    'dashboard:create', 'dashboard:read', 'dashboard:update',
    'dashboard:share', 'dashboard:export',
    'widget:create', 'widget:read', 'widget:update', 'widget:configure',
    'filter:create', 'filter:read', 'filter:update',
    'analytics:read', 'analytics:export'
  ],
  viewer: [
    'dashboard:read',
    'widget:read',
    'filter:read',
    'analytics:read'
  ],
  guest: [
    'dashboard:read',
    'widget:read',
    'analytics:read'
  ]
};

// Permission Cache
class PermissionCache {
  private cache = new Map<string, { permissions: Permission[]; expires: number }>();
  private readonly ttl = 300000; // 5 minutes

  set(userId: string, orgId: string, permissions: Permission[]): void {
    const key = `${userId}:${orgId}`;
    this.cache.set(key, {
      permissions,
      expires: Date.now() + this.ttl
    });
  }

  get(userId: string, orgId: string): Permission[] | null {
    const key = `${userId}:${orgId}`;
    const entry = this.cache.get(key);

    if (!entry || Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.permissions;
  }

  invalidate(userId: string, orgId?: string): void {
    if (orgId) {
      const key = `${userId}:${orgId}`;
      this.cache.delete(key);
    } else {
      // Invalidate all permissions for user
      for (const [key] of this.cache) {
        if (key.startsWith(`${userId}:`)) {
          this.cache.delete(key);
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Main Permission Service
export class PermissionService {
  private supabase = createClient();
  private cache = new PermissionCache();

  // Check single permission
  async checkPermission(
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(context);
      return userPermissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // Check multiple permissions
  async checkPermissions(
    permissions: Permission[],
    context: PermissionContext
  ): Promise<Record<Permission, boolean>> {
    try {
      const userPermissions = await this.getUserPermissions(context);
      return permissions.reduce((acc, perm) => {
        acc[perm] = userPermissions.includes(perm);
        return acc;
      }, {} as Record<Permission, boolean>);
    } catch (error) {
      console.error('Error checking permissions:', error);
      return permissions.reduce((acc, perm) => {
        acc[perm] = false;
        return acc;
      }, {} as Record<Permission, boolean>);
    }
  }

  // Get all user permissions for organization
  async getUserPermissions(context: PermissionContext): Promise<Permission[]> {
    // Check cache first
    const cached = this.cache.get(context.userId, context.orgId);
    if (cached) {
      return cached;
    }

    try {
      // Get user role in organization
      const { data: membership, error } = await this.supabase
        .from('memberships')
        .select('role')
        .eq('user_id', context.userId)
        .eq('organization_id', context.orgId)
        .single();

      if (error || !membership) {
        console.warn('User not found in organization or error:', error);
        return [];
      }

      const role = membership.role as Role;
      const permissions = PERMISSION_MATRIX[role] || [];

      // Cache permissions
      this.cache.set(context.userId, context.orgId, permissions);

      return permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  // Check resource-specific permissions
  async checkResourcePermission(
    permission: Permission,
    resourceId: string,
    resourceType: ResourceType,
    context: PermissionContext
  ): Promise<boolean> {
    try {
      // First check general permission
      const hasPermission = await this.checkPermission(permission, context);
      if (!hasPermission) return false;

      // Then check resource-specific access
      switch (resourceType) {
        case 'dashboard':
          return this.checkDashboardAccess(resourceId, context);
        case 'widget':
          return this.checkWidgetAccess(resourceId, context);
        case 'filter':
          return this.checkFilterAccess(resourceId, context);
        case 'organization':
          return this.checkOrganizationAccess(resourceId, context);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking resource permission:', error);
      return false;
    }
  }

  // Get user role in organization
  async getUserRole(userId: string, orgId: string): Promise<Role | null> {
    try {
      const { data: membership, error } = await this.supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error || !membership) {
        return null;
      }

      return membership.role as Role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Check if user can access organization
  async checkOrganizationAccess(orgId: string, context: PermissionContext): Promise<boolean> {
    return context.orgId === orgId;
  }

  // Check dashboard access (private, team, organization, public)
  private async checkDashboardAccess(dashboardId: string, context: PermissionContext): Promise<boolean> {
    try {
      const { data: dashboard, error } = await this.supabase
        .from('dashboards')
        .select('access_level, allowed_users, allowed_roles, organization_id')
        .eq('id', dashboardId)
        .single();

      if (error || !dashboard) return false;

      // Organization check
      if (dashboard.organization_id !== context.orgId) return false;

      // Access level checks
      switch (dashboard.access_level) {
        case 'public':
          return true;
        case 'organization':
          return true; // Already checked organization above
        case 'team':
          // Check if user has allowed role
          if (dashboard.allowed_roles?.length) {
            const userRole = await this.getUserRole(context.userId, context.orgId);
            return userRole ? dashboard.allowed_roles.includes(userRole) : false;
          }
          return true; // No specific roles required
        case 'private':
          // Check if user is explicitly allowed
          return dashboard.allowed_users?.includes(context.userId) || false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking dashboard access:', error);
      return false;
    }
  }

  // Check widget access
  private async checkWidgetAccess(widgetId: string, context: PermissionContext): Promise<boolean> {
    try {
      const { data: widget, error } = await this.supabase
        .from('dashboard_widgets')
        .select('dashboard_id, organization_id')
        .eq('id', widgetId)
        .single();

      if (error || !widget) return false;

      // Organization check
      if (widget.organization_id !== context.orgId) return false;

      // Check dashboard access
      return this.checkDashboardAccess(widget.dashboard_id, context);
    } catch (error) {
      console.error('Error checking widget access:', error);
      return false;
    }
  }

  // Check filter access
  private async checkFilterAccess(filterId: string, context: PermissionContext): Promise<boolean> {
    try {
      const { data: filter, error } = await this.supabase
        .from('dashboard_filters')
        .select('organization_id')
        .eq('id', filterId)
        .single();

      if (error || !filter) return false;

      // Organization check
      return filter.organization_id === context.orgId;
    } catch (error) {
      console.error('Error checking filter access:', error);
      return false;
    }
  }

  // Invalidate permission cache
  invalidateCache(userId: string, orgId?: string): void {
    this.cache.invalidate(userId, orgId);
  }

  // Clear all cached permissions
  clearCache(): void {
    this.cache.clear();
  }

  // Get permission matrix for role
  getPermissionsForRole(role: Role): Permission[] {
    return PERMISSION_MATRIX[role] || [];
  }

  // Check if role has permission
  roleHasPermission(role: Role, permission: Permission): boolean {
    return PERMISSION_MATRIX[role]?.includes(permission) || false;
  }
}

// Permission Guard Utilities
export class PermissionGuard {
  private permissionService = new PermissionService();

  // Create permission guard for route/component
  createGuard(requiredPermissions: Permission[], resourceType?: ResourceType) {
    return async (context: PermissionContext): Promise<boolean> => {
      if (resourceType && context.resourceId && context.resourceType) {
        // Check resource-specific permissions
        const results = await Promise.all(
          requiredPermissions.map(perm =>
            this.permissionService.checkResourcePermission(
              perm,
              context.resourceId!,
              context.resourceType!,
              context
            )
          )
        );
        return results.every(Boolean);
      } else {
        // Check general permissions
        const results = await Promise.all(
          requiredPermissions.map(perm =>
            this.permissionService.checkPermission(perm, context)
          )
        );
        return results.every(Boolean);
      }
    };
  }

  // Check permissions with fallback
  async checkWithFallback(
    permissions: Permission[],
    context: PermissionContext,
    fallbackRole: Role = 'viewer'
  ): Promise<Permission[]> {
    const allowedPermissions: Permission[] = [];

    for (const permission of permissions) {
      const hasPermission = await this.permissionService.checkPermission(permission, context);
      if (hasPermission) {
        allowedPermissions.push(permission);
      } else if (this.permissionService.roleHasPermission(fallbackRole, permission)) {
        // Allow fallback permissions
        allowedPermissions.push(permission);
      }
    }

    return allowedPermissions;
  }
}

// Export singleton instances
export const permissionService = new PermissionService();
export const permissionGuard = new PermissionGuard();

// Utility functions
export const requirePermission = (permission: Permission) => {
  return async (context: PermissionContext): Promise<void> => {
    const hasPermission = await permissionService.checkPermission(permission, context);
    if (!hasPermission) {
      throw new Error(`Permission denied: ${permission}`);
    }
  };
};

export const requirePermissions = (permissions: Permission[]) => {
  return async (context: PermissionContext): Promise<void> => {
    const results = await permissionService.checkPermissions(permissions, context);
    const denied = Object.entries(results)
      .filter(([, hasPermission]) => !hasPermission)
      .map(([permission]) => permission);

    if (denied.length > 0) {
      throw new Error(`Permissions denied: ${denied.join(', ')}`);
    }
  };
};

export const hasAnyPermission = (permissions: Permission[]) => {
  return async (context: PermissionContext): Promise<boolean> => {
    const results = await permissionService.checkPermissions(permissions, context);
    return Object.values(results).some(Boolean);
  };
};

export const hasAllPermissions = (permissions: Permission[]) => {
  return async (context: PermissionContext): Promise<boolean> => {
    const results = await permissionService.checkPermissions(permissions, context);
    return Object.values(results).every(Boolean);
  };
};
