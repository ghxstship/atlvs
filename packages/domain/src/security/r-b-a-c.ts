export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'contributor'
  | 'viewer'
  | 'vendor';

export type Permission =
  | 'projects:read'
  | 'projects:write'
  | 'projects:delete'
  | 'projects:manage'
  | 'projects:tasks:read'
  | 'projects:tasks:write'
  | 'projects:tasks:delete'
  | 'projects:risks:read'
  | 'projects:risks:write'
  | 'projects:risks:delete'
  | 'projects:files:read'
  | 'projects:files:write'
  | 'projects:files:delete'
  | 'projects:inspections:read'
  | 'projects:inspections:write'
  | 'projects:inspections:delete'
  | 'projects:activations:read'
  | 'projects:activations:write'
  | 'projects:activations:delete'
  | 'projects:time:read'
  | 'projects:time:write'
  | 'projects:time:approve'
  | 'programming:read'
  | 'programming:write'
  | 'programming:delete'
  | 'finance:read'
  | 'finance:write'
  | 'resources:create'
  | 'resources:update'
  | 'resources:delete'
  | 'resources:read'
  | 'marketplace:manage'
  | 'settings:manage'
  | 'organizations:manage';

export type AccessDecision = 'allow' | 'deny';

export interface AccessRequest {
  userId: string;
  organizationId: string;
  projectId?: string;
  permission: Permission;
}

export interface Policy {
  roles: Role[];
  permissions: Permission[];
}

export interface RBACContext {
  userId: string;
  organizationId: string;
  roles: Role[];
  // Optional per-project roles
  projectRoles?: Record<string, Role[]>;
}

// Static baseline role-permission map; can be extended by infrastructure adapters
export const BASE_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'projects:read',
    'projects:write',
    'projects:delete',
    'projects:manage',
    'projects:tasks:read',
    'projects:tasks:write',
    'projects:tasks:delete',
    'projects:risks:read',
    'projects:risks:write',
    'projects:risks:delete',
    'projects:files:read',
    'projects:files:write',
    'projects:files:delete',
    'projects:inspections:read',
    'projects:inspections:write',
    'projects:inspections:delete',
    'projects:activations:read',
    'projects:activations:write',
    'projects:activations:delete',
    'projects:time:read',
    'projects:time:write',
    'projects:time:approve',
    'programming:read',
    'programming:write',
    'programming:delete',
    'finance:read',
    'finance:write',
    'resources:create',
    'resources:update',
    'resources:delete',
    'resources:read',
    'marketplace:manage',
    'settings:manage',
    'organizations:manage'
  ],
  admin: [
    'projects:read',
    'projects:write',
    'projects:delete',
    'projects:manage',
    'projects:tasks:read',
    'projects:tasks:write',
    'projects:tasks:delete',
    'projects:risks:read',
    'projects:risks:write',
    'projects:risks:delete',
    'projects:files:read',
    'projects:files:write',
    'projects:files:delete',
    'projects:inspections:read',
    'projects:inspections:write',
    'projects:inspections:delete',
    'projects:activations:read',
    'projects:activations:write',
    'projects:activations:delete',
    'projects:time:read',
    'projects:time:write',
    'projects:time:approve',
    'programming:read',
    'programming:write',
    'finance:read',
    'finance:write',
    'resources:create',
    'resources:update',
    'resources:delete',
    'resources:read',
    'marketplace:manage',
    'settings:manage'
  ],
  manager: [
    'projects:read',
    'projects:write',
    'projects:manage',
    'projects:tasks:read',
    'projects:tasks:write',
    'projects:risks:read',
    'projects:risks:write',
    'projects:files:read',
    'projects:files:write',
    'projects:inspections:read',
    'projects:inspections:write',
    'projects:activations:read',
    'projects:activations:write',
    'projects:time:read',
    'projects:time:write',
    'projects:time:approve',
    'programming:read',
    'programming:write',
    'finance:read',
    'resources:create',
    'resources:update',
    'resources:read'
  ],
  contributor: [
    'projects:read',
    'projects:tasks:read',
    'projects:tasks:write',
    'projects:risks:read',
    'projects:files:read',
    'projects:inspections:read',
    'projects:activations:read',
    'projects:time:read',
    'projects:time:write',
    'programming:read',
    'resources:read'
  ],
  viewer: [
    'projects:read',
    'projects:tasks:read',
    'projects:risks:read',
    'projects:files:read',
    'projects:inspections:read',
    'projects:activations:read',
    'projects:time:read',
    'programming:read',
    'resources:read'
  ],
  vendor: [
    'projects:read',
    'projects:tasks:read',
    'projects:files:read',
    'projects:time:read',
    'programming:read',
    'resources:read'
  ]
};

export function authorize(
  ctx: RBACContext,
  permission: Permission,
  projectId?: string
): AccessDecision {
  const roles = new Set<Role>(ctx.roles);
  if (projectId && ctx.projectRoles?.[projectId]) {
    for (const r of ctx.projectRoles[projectId]) roles.add(r);
  }

  for (const role of roles) {
    const perms = BASE_ROLE_PERMISSIONS[role] ?? [];
    if (perms.includes(permission)) return 'allow';
  }
  return 'deny';
}
