/**
 * Companies Permissions Service
 * Row Level Security and permission management
 * Handles RLS policies, attribute-based access control, and permission evaluation
 */

import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export type CompanyPermission = {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageContracts: boolean;
  canManageQualifications: boolean;
  canManageRatings: boolean;
  canViewAnalytics: boolean;
  canExport: boolean;
};

export class CompaniesPermissionsService {
  private supabase = createClient();

  /**
   * Get user permissions for companies module
   */
  async getUserPermissions(userId: string, orgId: string): Promise<CompanyPermission> {
    // Get user role and membership status
    const { data: membership } = await this.supabase
      .from('memberships')
      .select('role, status')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    if (!membership || membership.status !== 'active') {
      return this.getNoAccessPermissions();
    }

    const role = membership.role;

    switch (role) {
      case 'owner':
        return this.getOwnerPermissions();
      case 'admin':
        return this.getAdminPermissions();
      case 'manager':
        return this.getManagerPermissions();
      case 'member':
        return this.getMemberPermissions();
      case 'viewer':
        return this.getViewerPermissions();
      default:
        return this.getNoAccessPermissions();
    }
  }

  /**
   * Check field-level permissions for a specific company
   */
  async getFieldPermissions(userId: string, orgId: string, companyId: string): Promise<Record<string, boolean>> {
    const permissions = await this.getUserPermissions(userId, orgId);

    // Additional checks for specific company
    const { data: company } = await this.supabase
      .from('companies')
      .select('created_by')
      .eq('id', companyId)
      .eq('organization_id', orgId)
      .single();

    const isOwner = company?.created_by === userId;

    return {
      name: permissions.canUpdate,
      description: permissions.canUpdate,
      industry: permissions.canUpdate,
      website: permissions.canUpdate,
      phone: permissions.canUpdate,
      email: permissions.canUpdate,
      address: permissions.canUpdate,
      size: permissions.canUpdate,
      founded_year: permissions.canUpdate,
      logo_url: permissions.canUpdate,
      status: permissions.canUpdate || isOwner, // Only creator or admin can change status
      contracts: permissions.canManageContracts,
      qualifications: permissions.canManageQualifications,
      ratings: permissions.canUpdate
    };
  }

  /**
   * Evaluate RLS policies for queries
   */
  getRLSPolicies(userId: string, orgId: string) {
    return {
      companies: `organization_id = '${orgId}'`,
      company_contracts: `organization_id = '${orgId}'`,
      company_qualifications: `organization_id = '${orgId}'`,
      company_ratings: `organization_id = '${orgId}'`,
      company_contacts: `organization_id = '${orgId}'`
    };
  }

  /**
   * Check bulk operation permissions
   */
  async canPerformBulkOperation(userId: string, orgId: string, operation: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, orgId);

    switch (operation) {
      case 'update':
        return permissions.canUpdate;
      case 'delete':
        return permissions.canDelete;
      case 'export':
        return permissions.canExport;
      default:
        return false;
    }
  }

  /**
   * Get organization-wide permissions for user
   */
  async getOrganizationPermissions(userId: string, orgId: string): Promise<Record<string, PermissionLevel>> {
    const permissions = await this.getUserPermissions(userId, orgId);

    return {
      companies: this.mapPermissionLevel(permissions.canRead, permissions.canUpdate, permissions.canDelete),
      contracts: permissions.canManageContracts ? 'write' : permissions.canRead ? 'read' : 'none',
      qualifications: permissions.canManageQualifications ? 'write' : permissions.canRead ? 'read' : 'none',
      ratings: permissions.canUpdate ? 'write' : permissions.canRead ? 'read' : 'none',
      analytics: permissions.canViewAnalytics ? 'read' : 'none',
      exports: permissions.canExport ? 'read' : 'none'
    };
  }

  private getNoAccessPermissions(): CompanyPermission {
    return {
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageContracts: false,
      canManageQualifications: false,
      canManageRatings: false,
      canViewAnalytics: false,
      canExport: false
    };
  }

  private getOwnerPermissions(): CompanyPermission {
    return {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canManageContracts: true,
      canManageQualifications: true,
      canManageRatings: true,
      canViewAnalytics: true,
      canExport: true
    };
  }

  private getAdminPermissions(): CompanyPermission {
    return {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canManageContracts: true,
      canManageQualifications: true,
      canManageRatings: true,
      canViewAnalytics: true,
      canExport: true
    };
  }

  private getManagerPermissions(): CompanyPermission {
    return {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false, // Managers cannot delete
      canManageContracts: true,
      canManageQualifications: true,
      canManageRatings: true,
      canViewAnalytics: true,
      canExport: true
    };
  }

  private getMemberPermissions(): CompanyPermission {
    return {
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: false,
      canManageContracts: false,
      canManageQualifications: false,
      canManageRatings: true,
      canViewAnalytics: false,
      canExport: true
    };
  }

  private getViewerPermissions(): CompanyPermission {
    return {
      canRead: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canManageContracts: false,
      canManageQualifications: false,
      canManageRatings: false,
      canViewAnalytics: false,
      canExport: false
    };
  }

  private mapPermissionLevel(canRead: boolean, canUpdate: boolean, canDelete: boolean): PermissionLevel {
    if (canDelete) return 'admin';
    if (canUpdate) return 'write';
    if (canRead) return 'read';
    return 'none';
  }
}

export const companiesPermissionsService = new CompaniesPermissionsService();
