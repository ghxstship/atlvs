export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  roles: Role[];
  organizationId: string;
}

export class RBACManager {
  private static instance: RBACManager;
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();

  static getInstance(): RBACManager {
    if (!RBACManager.instance) {
      RBACManager.instance = new RBACManager();
    }
    return RBACManager.instance;
  }

  addRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    return user.roles.some(role =>
      role.permissions.some(permission =>
        permission.resource === resource && permission.action === action
      )
    );
  }

  getUserPermissions(user: User): Permission[] {
    const permissions: Permission[] = [];
    user.roles.forEach(role => {
      permissions.push(...role.permissions);
    });
    return Array.from(new Set(permissions));
  }
}

// System roles
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer'
} as const;

// System permissions
export const SYSTEM_PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const;
