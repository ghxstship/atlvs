/**
 * Assets Permissions Handler
 *
 * Enterprise-grade role-based access control (RBAC) and attribute-based access control (ABAC)
 * for asset management operations. Implements multi-tenant security with granular permissions.
 *
 * @module assets/lib/permissions
 */

import { supabase } from './api';
import { Asset, AssetPermissions } from '../types';

// Permission levels
export enum PermissionLevel {
  NONE = 0,
  VIEW = 1,
  CREATE = 2,
  UPDATE = 3,
  DELETE = 4,
  MANAGE = 5
}

// Role definitions with hierarchical permissions
export const ROLE_PERMISSIONS: Record<string, AssetPermissions> = {
  owner: {
    view: true,
    create: true,
    update: true,
    delete: true,
    assign: true,
    maintain: true,
    audit: true
  },
  admin: {
    view: true,
    create: true,
    update: true,
    delete: true,
    assign: true,
    maintain: true,
    audit: true
  },
  manager: {
    view: true,
    create: true,
    update: true,
    delete: false,
    assign: true,
    maintain: true,
    audit: false
  },
  member: {
    view: true,
    create: false,
    update: false,
    delete: false,
    assign: false,
    maintain: false,
    audit: false
  },
  viewer: {
    view: true,
    create: false,
    update: false,
    delete: false,
    assign: false,
    maintain: false,
    audit: false
  }
};

// Permission checker class
export class PermissionChecker {
  private static instance: PermissionChecker;
  private cache = new Map<string, { permissions: AssetPermissions; expiry: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PermissionChecker {
    if (!PermissionChecker.instance) {
      PermissionChecker.instance = new PermissionChecker();
    }
    return PermissionChecker.instance;
  }

  async getPermissions(userId: string, orgId: string): Promise<AssetPermissions> {
    const cacheKey = `${userId}:${orgId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.permissions;
    }

    const permissions = await this.fetchPermissions(userId, orgId);
    this.cache.set(cacheKey, { permissions, expiry: Date.now() + this.CACHE_TTL });

    return permissions;
  }

  private async fetchPermissions(userId: string, orgId: string): Promise<AssetPermissions> {
    // Get user role from membership
    const { data: membership, error } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (error || !membership) {
      return ROLE_PERMISSIONS.viewer; // Default to viewer for safety
    }

    return ROLE_PERMISSIONS[membership.role] || ROLE_PERMISSIONS.viewer;
  }

  async checkPermission(
    userId: string,
    orgId: string,
    permission: keyof AssetPermissions
  ): Promise<boolean> {
    const permissions = await this.getPermissions(userId, orgId);
    return permissions[permission] === true;
  }

  async checkAssetPermission(
    userId: string,
    orgId: string,
    assetId: string,
    permission: keyof AssetPermissions
  ): Promise<boolean> {
    // Check basic permission first
    const hasBasicPermission = await this.checkPermission(userId, orgId, permission);
    if (!hasBasicPermission) return false;

    // Additional checks for specific assets
    if (permission === 'update' || permission === 'delete') {
      // Check if asset is assigned to user (for self-service updates)
      const { data: asset } = await supabase
        .from('assets')
        .select('assigned_to, status')
        .eq('organization_id', orgId)
        .eq('id', assetId)
        .single();

      if (asset?.assigned_to === userId && permission === 'update' && asset.status === 'in_use') {
        return true; // Allow users to update their assigned assets
      }
    }

    return true;
  }

  clearCache(userId?: string, orgId?: string): void {
    if (userId && orgId) {
      this.cache.delete(`${userId}:${orgId}`);
    } else if (userId) {
      // Clear all entries for this user
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

// Permission guard functions
export const requirePermission = async (
  userId: string,
  orgId: string,
  permission: keyof AssetPermissions
): Promise<void> => {
  const checker = PermissionChecker.getInstance();
  const hasPermission = await checker.checkPermission(userId, orgId, permission);

  if (!hasPermission) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
};

export const requireAssetPermission = async (
  userId: string,
  orgId: string,
  assetId: string,
  permission: keyof AssetPermissions
): Promise<void> => {
  const checker = PermissionChecker.getInstance();
  const hasPermission = await checker.checkAssetPermission(userId, orgId, assetId, permission);

  if (!hasPermission) {
    throw new Error(`Insufficient permissions for asset: ${permission} required`);
  }
};

// Row Level Security helpers
export const applyRLS = (query: any, userId: string, orgId: string, table: string) => {
  // Base RLS - organization isolation
  query = query.eq('organization_id', orgId);

  // Additional filters based on role and table
  switch (table) {
    case 'assets':
      // Assets can have additional filtering based on assignment
      break;
    case 'asset_assignments':
      // Assignments may need filtering based on user role
      break;
    case 'asset_maintenance':
      // Maintenance records may have technician-specific access
      break;
    case 'asset_audits':
      // Audit records may be restricted to auditors and admins
      break;
  }

  return query;
};

// Permission-aware query builders
export const buildAssetQuery = async (userId: string, orgId: string, baseQuery: unknown) => {
  const permissions = await PermissionChecker.getInstance().getPermissions(userId, orgId);

  // Apply RLS
  let query = applyRLS(baseQuery, userId, orgId, 'assets');

  // Additional permission-based filters
  if (!permissions.view) {
    throw new Error('Insufficient permissions to view assets');
  }

  // If user can only see assigned assets, add filter
  if (!permissions.manage && !permissions.audit) {
    // For non-managers, show only assets assigned to them or available
    query = query.or(`assigned_to.eq.${userId},status.eq.available`);
  }

  return query;
};

export const buildMaintenanceQuery = async (userId: string, orgId: string, baseQuery: unknown) => {
  const permissions = await PermissionChecker.getInstance().getPermissions(userId, orgId);

  let query = applyRLS(baseQuery, userId, orgId, 'asset_maintenance');

  // Permission-based filters
  if (!permissions.maintain && !permissions.manage) {
    // Non-maintenance users can only see maintenance they're assigned to
    query = query.eq('assigned_to', userId);
  }

  return query;
};

export const buildAuditQuery = async (userId: string, orgId: string, baseQuery: unknown) => {
  const permissions = await PermissionChecker.getInstance().getPermissions(userId, orgId);

  let query = applyRLS(baseQuery, userId, orgId, 'asset_audits');

  // Audit permissions are restricted
  if (!permissions.audit && !permissions.manage) {
    // Non-auditors can only see audits they created
    query = query.eq('auditor_id', userId);
  }

  return query;
};

// Attribute-based access control for complex scenarios
export const checkAssetAttributeAccess = async (
  userId: string,
  orgId: string,
  asset: Asset,
  attribute: keyof Asset,
  action: 'read' | 'write'
): Promise<boolean> => {
  const permissions = await PermissionChecker.getInstance().getPermissions(userId, orgId);

  // Financial attributes (purchase_price, current_value) may be restricted
  if (['purchase_price', 'current_value', 'depreciation_rate'].includes(attribute)) {
    if (action === 'write' && !permissions.manage) return false;
    if (action === 'read' && !permissions.update && !permissions.manage) return false;
  }

  // Assignment-related attributes
  if (['assigned_to', 'assignment_date'].includes(attribute)) {
    if (action === 'write' && !permissions.assign && !permissions.manage) return false;
  }

  // Location changes may be restricted
  if (attribute === 'location_id' && action === 'write') {
    if (!permissions.update && !permissions.manage) return false;
  }

  return true;
};

// Export singleton instance
export const permissionChecker = PermissionChecker.getInstance();
