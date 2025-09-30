/**
 * PEOPLE MODULE - RLS PERMISSION HANDLERS
 * Comprehensive Row Level Security permission management
 * Enterprise-grade access control with role-based permissions
 */

import { createClient } from '@/lib/supabase/server';

// Permission levels
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  DELETE = 4,
  ADMIN = 8
}

// Permission actions
export enum PermissionAction {
  VIEW_PEOPLE = 'view_people',
  CREATE_PEOPLE = 'create_people',
  EDIT_PEOPLE = 'edit_people',
  DELETE_PEOPLE = 'delete_people',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_COMPETENCIES = 'manage_competencies',
  VIEW_COMPETENCIES = 'view_competencies',
  ASSIGN_COMPETENCIES = 'assign_competencies',
  ENDORSE_COMPETENCIES = 'endorse_competencies',
  MANAGE_ASSIGNMENTS = 'manage_assignments',
  VIEW_ASSIGNMENTS = 'view_assignments',
  MANAGE_CONTRACTS = 'manage_contracts',
  VIEW_CONTRACTS = 'view_contracts',
  MANAGE_TRAINING = 'manage_training',
  VIEW_TRAINING = 'view_training',
  MANAGE_NETWORK = 'manage_network',
  VIEW_NETWORK = 'view_network',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  BULK_OPERATIONS = 'bulk_operations',
  VIEW_ANALYTICS = 'view_analytics'
}

// Role definitions with permissions
const ROLE_PERMISSIONS = {
  owner: [
    PermissionAction.VIEW_PEOPLE,
    PermissionAction.CREATE_PEOPLE,
    PermissionAction.EDIT_PEOPLE,
    PermissionAction.DELETE_PEOPLE,
    PermissionAction.MANAGE_ROLES,
    PermissionAction.MANAGE_COMPETENCIES,
    PermissionAction.VIEW_COMPETENCIES,
    PermissionAction.ASSIGN_COMPETENCIES,
    PermissionAction.ENDORSE_COMPETENCIES,
    PermissionAction.MANAGE_ASSIGNMENTS,
    PermissionAction.VIEW_ASSIGNMENTS,
    PermissionAction.MANAGE_CONTRACTS,
    PermissionAction.VIEW_CONTRACTS,
    PermissionAction.MANAGE_TRAINING,
    PermissionAction.VIEW_TRAINING,
    PermissionAction.MANAGE_NETWORK,
    PermissionAction.VIEW_NETWORK,
    PermissionAction.EXPORT_DATA,
    PermissionAction.IMPORT_DATA,
    PermissionAction.BULK_OPERATIONS,
    PermissionAction.VIEW_ANALYTICS
  ],
  admin: [
    PermissionAction.VIEW_PEOPLE,
    PermissionAction.CREATE_PEOPLE,
    PermissionAction.EDIT_PEOPLE,
    PermissionAction.DELETE_PEOPLE,
    PermissionAction.MANAGE_ROLES,
    PermissionAction.MANAGE_COMPETENCIES,
    PermissionAction.VIEW_COMPETENCIES,
    PermissionAction.ASSIGN_COMPETENCIES,
    PermissionAction.ENDORSE_COMPETENCIES,
    PermissionAction.MANAGE_ASSIGNMENTS,
    PermissionAction.VIEW_ASSIGNMENTS,
    PermissionAction.MANAGE_CONTRACTS,
    PermissionAction.VIEW_CONTRACTS,
    PermissionAction.MANAGE_TRAINING,
    PermissionAction.VIEW_TRAINING,
    PermissionAction.MANAGE_NETWORK,
    PermissionAction.VIEW_NETWORK,
    PermissionAction.EXPORT_DATA,
    PermissionAction.IMPORT_DATA,
    PermissionAction.BULK_OPERATIONS,
    PermissionAction.VIEW_ANALYTICS
  ],
  manager: [
    PermissionAction.VIEW_PEOPLE,
    PermissionAction.CREATE_PEOPLE,
    PermissionAction.EDIT_PEOPLE,
    PermissionAction.MANAGE_ASSIGNMENTS,
    PermissionAction.VIEW_ASSIGNMENTS,
    PermissionAction.MANAGE_CONTRACTS,
    PermissionAction.VIEW_CONTRACTS,
    PermissionAction.MANAGE_TRAINING,
    PermissionAction.VIEW_TRAINING,
    PermissionAction.ASSIGN_COMPETENCIES,
    PermissionAction.ENDORSE_COMPETENCIES,
    PermissionAction.VIEW_COMPETENCIES,
    PermissionAction.EXPORT_DATA,
    PermissionAction.BULK_OPERATIONS,
    PermissionAction.VIEW_ANALYTICS
  ],
  member: [
    PermissionAction.VIEW_PEOPLE,
    PermissionAction.VIEW_COMPETENCIES,
    PermissionAction.ENDORSE_COMPETENCIES,
    PermissionAction.VIEW_ASSIGNMENTS,
    PermissionAction.VIEW_CONTRACTS,
    PermissionAction.VIEW_TRAINING,
    PermissionAction.VIEW_NETWORK,
    PermissionAction.VIEW_ANALYTICS
  ],
  viewer: [
    PermissionAction.VIEW_PEOPLE,
    PermissionAction.VIEW_COMPETENCIES,
    PermissionAction.VIEW_ASSIGNMENTS,
    PermissionAction.VIEW_CONTRACTS,
    PermissionAction.VIEW_TRAINING,
    PermissionAction.VIEW_NETWORK,
    PermissionAction.VIEW_ANALYTICS
  ]
};

export class PeoplePermissionsManager {
  private supabase = createClient();
  private orgId: string;
  private userId: string;
  private userRole: string | null = null;
  private permissions: Set<PermissionAction> = new Set();

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
  }

  // Initialize permissions for the current user
  async initializePermissions() {
    const { data: membership, error } = await this.supabase
      .from('memberships')
      .select('role, status')
      .eq('user_id', this.userId)
      .eq('organization_id', this.orgId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      this.userRole = null;
      this.permissions.clear();
      return false;
    }

    this.userRole = membership.role;
    this.permissions = new Set(ROLE_PERMISSIONS[this.userRole as keyof typeof ROLE_PERMISSIONS] || []);
    return true;
  }

  // Check if user has specific permission
  hasPermission(action: PermissionAction): boolean {
    return this.permissions.has(action);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(actions: PermissionAction[]): boolean {
    return actions.some(action => this.permissions.has(action));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(actions: PermissionAction[]): boolean {
    return actions.every(action => this.permissions.has(action));
  }

  // Get user's role
  getUserRole(): string | null {
    return this.userRole;
  }

  // Check if user is owner or admin
  isOwnerOrAdmin(): boolean {
    return this.userRole === 'owner' || this.userRole === 'admin';
  }

  // Check if user can manage people
  canManagePeople(): boolean {
    return this.hasAllPermissions([
      PermissionAction.VIEW_PEOPLE,
      PermissionAction.CREATE_PEOPLE,
      PermissionAction.EDIT_PEOPLE
    ]);
  }

  // Check if user can delete people
  canDeletePeople(): boolean {
    return this.hasPermission(PermissionAction.DELETE_PEOPLE);
  }

  // Check if user can manage roles
  canManageRoles(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_ROLES);
  }

  // Check if user can manage competencies
  canManageCompetencies(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_COMPETENCIES);
  }

  // Check if user can assign competencies
  canAssignCompetencies(): boolean {
    return this.hasPermission(PermissionAction.ASSIGN_COMPETENCIES);
  }

  // Check if user can endorse competencies
  canEndorseCompetencies(): boolean {
    return this.hasPermission(PermissionAction.ENDORSE_COMPETENCIES);
  }

  // Check if user can manage assignments
  canManageAssignments(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_ASSIGNMENTS);
  }

  // Check if user can manage contracts
  canManageContracts(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_CONTRACTS);
  }

  // Check if user can manage training
  canManageTraining(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_TRAINING);
  }

  // Check if user can manage network connections
  canManageNetwork(): boolean {
    return this.hasPermission(PermissionAction.MANAGE_NETWORK);
  }

  // Check if user can perform bulk operations
  canPerformBulkOperations(): boolean {
    return this.hasPermission(PermissionAction.BULK_OPERATIONS);
  }

  // Check if user can export data
  canExportData(): boolean {
    return this.hasPermission(PermissionAction.EXPORT_DATA);
  }

  // Check if user can import data
  canImportData(): boolean {
    return this.hasPermission(PermissionAction.IMPORT_DATA);
  }

  // Check if user can view analytics
  canViewAnalytics(): boolean {
    return this.hasPermission(PermissionAction.VIEW_ANALYTICS);
  }

  // Advanced permission checks with context
  async canEditPerson(personId: string): Promise<boolean> {
    if (!this.hasPermission(PermissionAction.EDIT_PEOPLE)) {
      return false;
    }

    // Check if person belongs to the same organization
    const { data: person, error } = await this.supabase
      .from('people')
      .select('organization_id')
      .eq('id', personId)
      .single();

    if (error || !person) {
      return false;
    }

    return person.organization_id === this.orgId;
  }

  async canViewPerson(personId: string): Promise<boolean> {
    if (!this.hasPermission(PermissionAction.VIEW_PEOPLE)) {
      return false;
    }

    // Check if person belongs to the same organization
    const { data: person, error } = await this.supabase
      .from('people')
      .select('organization_id')
      .eq('id', personId)
      .single();

    if (error || !person) {
      return false;
    }

    return person.organization_id === this.orgId;
  }

  async canAssignToPerson(personId: string): Promise<boolean> {
    if (!this.hasPermission(PermissionAction.MANAGE_ASSIGNMENTS)) {
      return false;
    }

    // Check if person belongs to the same organization
    const { data: person, error } = await this.supabase
      .from('people')
      .select('organization_id')
      .eq('id', personId)
      .single();

    if (error || !person) {
      return false;
    }

    return person.organization_id === this.orgId;
  }

  async canEndorsePerson(personId: string): Promise<boolean> {
    if (!this.hasPermission(PermissionAction.ENDORSE_COMPETENCIES)) {
      return false;
    }

    // Users cannot endorse themselves
    if (personId === this.userId) {
      return false;
    }

    // Check if person belongs to the same organization
    const { data: person, error } = await this.supabase
      .from('people')
      .select('organization_id')
      .eq('id', personId)
      .single();

    if (error || !person) {
      return false;
    }

    return person.organization_id === this.orgId;
  }

  // Bulk permission checks
  async canEditPeople(personIds: string[]): Promise<string[]> {
    if (!this.hasPermission(PermissionAction.EDIT_PEOPLE)) {
      return [];
    }

    // Check organization membership for all people
    const { data: people, error } = await this.supabase
      .from('people')
      .select('id, organization_id')
      .in('id', personIds);

    if (error || !people) {
      return [];
    }

    return people
      .filter(person => person.organization_id === this.orgId)
      .map(person => person.id);
  }

  async canDeletePeople(personIds: string[]): Promise<string[]> {
    if (!this.canDeletePeople()) {
      return [];
    }

    // Check organization membership for all people
    const { data: people, error } = await this.supabase
      .from('people')
      .select('id, organization_id')
      .in('id', personIds);

    if (error || !people) {
      return [];
    }

    return people
      .filter(person => person.organization_id === this.orgId)
      .map(person => person.id);
  }

  // Get effective permissions for UI rendering
  getEffectivePermissions(): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canManageRoles: boolean;
    canManageCompetencies: boolean;
    canAssignCompetencies: boolean;
    canEndorseCompetencies: boolean;
    canManageAssignments: boolean;
    canManageContracts: boolean;
    canManageTraining: boolean;
    canManageNetwork: boolean;
    canBulkOperations: boolean;
    canExport: boolean;
    canImport: boolean;
    canViewAnalytics: boolean;
  } {
    return {
      canView: this.hasPermission(PermissionAction.VIEW_PEOPLE),
      canCreate: this.hasPermission(PermissionAction.CREATE_PEOPLE),
      canEdit: this.hasPermission(PermissionAction.EDIT_PEOPLE),
      canDelete: this.hasPermission(PermissionAction.DELETE_PEOPLE),
      canManageRoles: this.hasPermission(PermissionAction.MANAGE_ROLES),
      canManageCompetencies: this.hasPermission(PermissionAction.MANAGE_COMPETENCIES),
      canAssignCompetencies: this.hasPermission(PermissionAction.ASSIGN_COMPETENCIES),
      canEndorseCompetencies: this.hasPermission(PermissionAction.ENDORSE_COMPETENCIES),
      canManageAssignments: this.hasPermission(PermissionAction.MANAGE_ASSIGNMENTS),
      canManageContracts: this.hasPermission(PermissionAction.MANAGE_CONTRACTS),
      canManageTraining: this.hasPermission(PermissionAction.MANAGE_TRAINING),
      canManageNetwork: this.hasPermission(PermissionAction.MANAGE_NETWORK),
      canBulkOperations: this.hasPermission(PermissionAction.BULK_OPERATIONS),
      canExport: this.hasPermission(PermissionAction.EXPORT_DATA),
      canImport: this.hasPermission(PermissionAction.IMPORT_DATA),
      canViewAnalytics: this.hasPermission(PermissionAction.VIEW_ANALYTICS)
    };
  }
}

// Factory function for permissions manager
export function createPeoplePermissionsManager(orgId: string, userId: string) {
  return new PeoplePermissionsManager(orgId, userId);
}

// Permission checking utilities
export function checkPermission(userRole: string, action: PermissionAction): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return rolePermissions.includes(action);
}

export function getRolePermissions(role: string): PermissionAction[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}

export function getAllPermissions(): PermissionAction[] {
  return Object.values(PermissionAction);
}

// Permission validation helpers
export function validatePermission(userRole: string | null, action: PermissionAction): boolean {
  if (!userRole) return false;
  return checkPermission(userRole, action);
}

export function requirePermission(userRole: string | null, action: PermissionAction): void {
  if (!validatePermission(userRole, action)) {
    throw new Error(`Insufficient permissions: ${action}`);
  }
}
