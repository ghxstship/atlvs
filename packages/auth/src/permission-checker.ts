import { createServerClient } from '@ghxstship/auth';
import { NextRequest } from 'next/server';
import { UserRole, Permission, PERMISSION_MATRIX } from './permission-matrix';
import { getPermissionCache } from './permission-cache';
import { SecurityLogger } from './security-logger';

export { Permission };

export interface PermissionCheckResult {
  allowed: boolean;
  userId?: string;
  organizationId?: string;
  role?: UserRole | null;
  requiredPermission?: Permission;
}

export class PermissionChecker {
  private supabase: any;
  private cache = getPermissionCache();
  private securityLogger = new SecurityLogger();

  constructor(request?: NextRequest) {
    this.supabase = createServerClient({
      get: (name: string) => {
        if (request) {
          const c = request.cookies.get(name);
          return c ? { name: c.name, value: c.value } : undefined;
        }
        return undefined;
      },
      set: () => {},
      remove: () => {}
    });
  }

  /**
   * Check if user has specific permission
   */
  async checkPermission(
    userId: string,
    organizationId: string,
    permission: Permission
  ): Promise<PermissionCheckResult> {
    try {
      // Get user role from cache or database
      const role = await this.getUserRole(userId, organizationId);

      if (!role) {
        return {
          allowed: false,
          userId,
          organizationId,
          requiredPermission: permission
        };
      }

      // Check if role has the permission
      const rolePermissions = PERMISSION_MATRIX[role] || [];
      const allowed = rolePermissions.includes(permission);

      // Log permission check for audit
      if (!allowed) {
        await this.securityLogger.logAuthzEvent(
          userId,
          organizationId,
          'access_denied',
          {
            permission,
            role,
            context: 'permission_check'
          }
        );
      }

      return {
        allowed,
        userId,
        organizationId,
        role: role || undefined,
        requiredPermission: permission
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        allowed: false,
        userId,
        organizationId,
        requiredPermission: permission
      };
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async checkAnyPermission(
    userId: string,
    organizationId: string,
    permissions: Permission[]
  ): Promise<PermissionCheckResult> {
    for (const permission of permissions) {
      const result = await this.checkPermission(userId, organizationId, permission);
      if (result.allowed) {
        return result;
      }
    }

    return {
      allowed: false,
      userId,
      organizationId,
      requiredPermission: permissions[0] // Return first required permission
    };
  }

  /**
   * Check if user has all of the specified permissions
   */
  async checkAllPermissions(
    userId: string,
    organizationId: string,
    permissions: Permission[]
  ): Promise<PermissionCheckResult> {
    for (const permission of permissions) {
      const result = await this.checkPermission(userId, organizationId, permission);
      if (!result.allowed) {
        return result;
      }
    }

    return {
      allowed: true,
      userId,
      organizationId,
      role: await this.getUserRole(userId, organizationId),
      requiredPermission: permissions[0]
    };
  }

  /**
   * Get user role for organization
   */
  async getUserRole(userId: string, organizationId: string): Promise<UserRole | null> {
    // Check cache first
    const cachedMembership = this.cache.getMembership(userId, organizationId);
    if (cachedMembership) {
      return cachedMembership.role as UserRole;
    }

    // Fetch from database
    const { data, error } = await this.supabase
      .from('memberships')
      .select('role, status')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    // Cache the membership data
    this.cache.setMembership(userId, organizationId, data);

    return data.role as UserRole;
  }

  /**
   * Get all permissions for user in organization
   */
  async getUserPermissions(userId: string, organizationId: string): Promise<Permission[]> {
    // Check cache first
    const cachedPermissions = this.cache.getPermissions(userId, organizationId);
    if (cachedPermissions) {
      return cachedPermissions as Permission[];
    }

    const role = await this.getUserRole(userId, organizationId);
    if (!role) {
      return [];
    }

    const permissions = PERMISSION_MATRIX[role] || [];

    // Cache the permissions
    this.cache.setPermissions(userId, organizationId, permissions);

    return permissions;
  }

  /**
   * Check if user is owner of organization
   */
  async isOwner(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return role === UserRole.OWNER;
  }

  /**
   * Check if user is admin or owner
   */
  async isAdminOrOwner(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return role === UserRole.ADMIN || role === UserRole.OWNER;
  }

  /**
   * Check if user is manager or higher
   */
  async isManagerOrHigher(userId: string, organizationId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, organizationId);
    return [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(role as UserRole);
  }

  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  getRoleLevel(role: UserRole): number {
    switch (role) {
      case UserRole.OWNER: return 5;
      case UserRole.ADMIN: return 4;
      case UserRole.MANAGER: return 3;
      case UserRole.PRODUCER: return 2;
      case UserRole.MEMBER: return 1;
      default: return 0;
    }
  }

  /**
   * Check if user can manage another user's role
   */
  async canManageRole(
    managerUserId: string,
    organizationId: string,
    targetRole: UserRole
  ): Promise<boolean> {
    const managerRole = await this.getUserRole(managerUserId, organizationId);
    if (!managerRole) return false;

    const managerLevel = this.getRoleLevel(managerRole);
    const targetLevel = this.getRoleLevel(targetRole);

    // Users can only assign roles at or below their level
    return managerLevel > targetLevel;
  }

  /**
   * Validate organization membership and status
   */
  async validateMembership(userId: string, organizationId: string): Promise<boolean> {
    const membership = this.cache.getMembership(userId, organizationId);

    if (membership) {
      return membership.status === 'active';
    }

    // Check database
    const { data, error } = await this.supabase
      .from('memberships')
      .select('status')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !data || data.status !== 'active') {
      return false;
    }

    // Cache the result
    this.cache.setMembership(userId, organizationId, data);
    return true;
  }

  /**
   * Clear user permission cache (call when role changes)
   */
  clearUserCache(userId: string): void {
    this.cache.invalidateUserCache(userId);
  }

  /**
   * Clear organization permission cache
   */
  clearOrganizationCache(organizationId: string): void {
    this.cache.invalidateOrganizationCache(organizationId);
  }
}
