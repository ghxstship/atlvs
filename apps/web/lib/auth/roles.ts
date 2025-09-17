export type Role =
  | 'super_admin'
  | 'org_admin'
  | 'manager'
  | 'project_owner'
  | 'team_member'
  | 'viewer'
  | 'client'
  | 'vendor'
  | 'partner';

// Top-level module IDs used in routeRegistry
const MODULES = [
  'dashboard','projects','people','programming','pipeline','procurement','jobs','companies','finance','analytics','resources','enterprise','settings','profile'
] as const;
export type ModuleId = typeof MODULES[number];

const roleAllowedModules: Record<Role, Set<ModuleId>> = {
  super_admin: new Set(MODULES),
  org_admin: new Set(MODULES),
  manager: new Set([
    'dashboard','projects','people','programming','pipeline','procurement','companies','finance','analytics','resources','profile'
  ]),
  project_owner: new Set([
    'dashboard','projects','analytics','resources','profile'
  ]),
  team_member: new Set([
    'dashboard','projects','resources','profile'
  ]),
  viewer: new Set([
    'dashboard','projects','analytics','resources','profile'
  ]),
  client: new Set([
    'dashboard','projects','analytics','resources','profile'
  ]),
  vendor: new Set([
    'procurement','resources','profile'
  ]),
  partner: new Set([
    'dashboard','projects','resources','profile'
  ]),
};

export function canAccessModule(role: Role, moduleId: ModuleId): boolean {
  const allowed = roleAllowedModules[role] ?? roleAllowedModules.viewer;
  return allowed.has(moduleId);
}

export function normalizeRole(role?: string | null): Role {
  const r = (role || '').toLowerCase();
  switch (r) {
    case 'super admin':
    case 'super_admin': return 'super_admin';
    case 'org admin':
    case 'org_admin':
    case 'account owner': return 'org_admin';
    case 'manager':
    case 'department head': return 'manager';
    case 'project owner':
    case 'project lead':
    case 'project_owner': return 'project_owner';
    case 'team member':
    case 'contributor':
    case 'team_member': return 'team_member';
    case 'viewer':
    case 'read-only': return 'viewer';
    case 'client':
    case 'sponsor': return 'client';
    case 'vendor':
    case 'supplier': return 'vendor';
    case 'partner':
    case 'collaborator': return 'partner';
    default:
      // Until roles are persisted, default to full access in UI; RLS still protects data
      return 'super_admin';
  }
}

// ================================
// Child-level RBAC (optional)
// ================================
// Child IDs should match routeRegistry child node IDs
// e.g. 'settings-billing', 'projects-overview', etc.

type ChildId = string;
type ModuleChildMap = Partial<Record<ModuleId, Set<ChildId>>>;

// Default policy: allow all children. Only specify exceptions below.
const roleAllowedChildren: Partial<Record<Role, ModuleChildMap>> = {
  team_member: {
    settings: new Set<ChildId>([
      'settings-account',
      'settings-notifications',
      'settings-security',
    ]),
    finance: new Set<ChildId>([
      'finance-overview',
      'finance-expenses',
    ]),
  },
  viewer: {
    settings: new Set<ChildId>([
      'settings-account',
      'settings-notifications',
      'settings-security',
    ]),
    finance: new Set<ChildId>([
      'finance-overview',
    ]),
  },
  client: {
    settings: new Set<ChildId>([
      'settings-account',
      'settings-notifications',
      'settings-security',
    ]),
    finance: new Set<ChildId>([
      'finance-overview',
    ]),
  },
  vendor: {
    settings: new Set<ChildId>([
      'settings-account',
      'settings-notifications',
      'settings-security',
    ]),
    finance: new Set<ChildId>([
      'finance-overview',
    ]),
  },
  partner: {
    finance: new Set<ChildId>([
      'finance-overview',
    ]),
  },
};

export function canAccessChild(role: Role, moduleId: ModuleId, childId: ChildId): boolean {
  const moduleMap = roleAllowedChildren[role];
  if (!moduleMap) return true; // allow-all
  const allowed = moduleMap[moduleId];
  if (!allowed || allowed.size === 0) return true; // allow-all for this module
  return allowed.has(childId);
}
