// Jobs Permissions Service
// RLS permission handlers for Jobs module

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface PermissionContext {
  userId: string;
  orgId: string;
  userRole?: string;
  resourceId?: string;
  resourceType?: string;
}

export interface PermissionCheck {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  assign?: boolean;
  approve?: boolean;
  review?: boolean;
}

export class JobsPermissions {
  private supabase = createClient();

  // ============================================================================
  // PERMISSION CONTEXT MANAGEMENT
  // ============================================================================

  async getPermissionContext(userId: string, orgId: string, resourceId?: string, resourceType?: string): Promise<PermissionContext> {
    // Get user's role in the organization
    const { data: membership } = await this.supabase
      .from('memberships')
      .select('role, status')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    return {
      userId,
      orgId,
      userRole: membership?.role,
      resourceId,
      resourceType
    };
  }

  // ============================================================================
  // JOB PERMISSIONS
  // ============================================================================

  async checkJobPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole, orgId } = context;

    // Base permissions by role
    const rolePermissions = this.getRolePermissions(userRole);

    // Additional context-specific checks
    const canAssign = ['owner', 'admin', 'manager'].includes(userRole || '');
    const canApprove = ['owner', 'admin'].includes(userRole || '');

    return {
      ...rolePermissions,
      assign: canAssign,
      approve: canApprove
    };
  }

  async checkJobAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const { userId, orgId, resourceId } = context;

    // Organization membership check
    const { data: membership } = await this.supabase
      .from('memberships')
      .select('role, status')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    if (!membership || membership.status !== 'active') {
      return false;
    }

    // Role-based permissions
    const permissions = await this.checkJobPermissions(context);
    return permissions[action] || false;
  }

  async checkJobOwnership(context: PermissionContext): Promise<boolean> {
    const { userId, resourceId } = context;

    if (!resourceId) return false;

    const { data: job } = await this.supabase
      .from('jobs')
      .select('created_by')
      .eq('id', resourceId)
      .single();

    return job?.created_by === userId;
  }

  // ============================================================================
  // ASSIGNMENT PERMISSIONS
  // ============================================================================

  async checkAssignmentPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole } = context;

    const basePermissions = this.getRolePermissions(userRole);

    // Assignments can be managed by managers and above
    const canAssign = ['owner', 'admin', 'manager'].includes(userRole || '');
    const canApprove = ['owner', 'admin'].includes(userRole || '');

    return {
      ...basePermissions,
      assign: canAssign,
      approve: canApprove
    };
  }

  async checkAssignmentAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkAssignmentPermissions(context);
    return permissions[action] || false;
  }

  async checkAssignmentOwnership(context: PermissionContext): Promise<boolean> {
    const { userId, resourceId } = context;

    if (!resourceId) return false;

    // Check if user is the assignee
    const { data: assignment } = await this.supabase
      .from('job_assignments')
      .select('assignee_user_id')
      .eq('id', resourceId)
      .single();

    return assignment?.assignee_user_id === userId;
  }

  // ============================================================================
  // OPPORTUNITY PERMISSIONS
  // ============================================================================

  async checkOpportunityPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole } = context;

    const basePermissions = this.getRolePermissions(userRole);

    // Opportunities require higher permissions
    const canApprove = ['owner', 'admin', 'manager'].includes(userRole || '');

    return {
      ...basePermissions,
      approve: canApprove
    };
  }

  async checkOpportunityAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkOpportunityPermissions(context);
    return permissions[action] || false;
  }

  // ============================================================================
  // BID PERMISSIONS
  // ============================================================================

  async checkBidPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole, userId, resourceId } = context;

    const basePermissions = this.getRolePermissions(userRole);

    // Check if user is the bidder (can update their own bids)
    let canUpdateOwnBid = false;
    if (resourceId) {
      const { data: bid } = await this.supabase
        .from('job_bids')
        .select('bidder_id')
        .eq('id', resourceId)
        .single();

      canUpdateOwnBid = bid?.bidder_id === userId;
    }

    return {
      ...basePermissions,
      update: basePermissions.update || canUpdateOwnBid,
    };
  }

  async checkBidAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkBidPermissions(context);
    return permissions[action] || false;
  }

  // ============================================================================
  // CONTRACT PERMISSIONS
  // ============================================================================

  async checkContractPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole } = context;

    // Contracts require admin-level permissions
    const isAdmin = ['owner', 'admin'].includes(userRole || '');
    const isManager = ['owner', 'admin', 'manager'].includes(userRole || '');

    return {
      create: isManager,
      read: isManager,
      update: isAdmin,
      delete: isAdmin,
      approve: isAdmin,
      review: isAdmin
    };
  }

  async checkContractAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkContractPermissions(context);
    return permissions[action] || false;
  }

  // ============================================================================
  // COMPLIANCE PERMISSIONS
  // ============================================================================

  async checkCompliancePermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole, userId, resourceId } = context;

    const basePermissions = this.getRolePermissions(userRole);

    // Check if user is assigned to this compliance item
    let canUpdateOwn = false;
    if (resourceId) {
      const { data: compliance } = await this.supabase
        .from('job_compliance')
        .select('assigned_to, reviewer')
        .eq('id', resourceId)
        .single();

      canUpdateOwn = compliance?.assigned_to === userId || compliance?.reviewer === userId;
    }

    const canApprove = ['owner', 'admin', 'manager'].includes(userRole || '');

    return {
      ...basePermissions,
      update: basePermissions.update || canUpdateOwn,
      approve: canApprove,
      review: canApprove
    };
  }

  async checkComplianceAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkCompliancePermissions(context);
    return permissions[action] || false;
  }

  // ============================================================================
  // RFP PERMISSIONS
  // ============================================================================

  async checkRfpPermissions(context: PermissionContext): Promise<PermissionCheck> {
    const { userRole } = context;

    const basePermissions = this.getRolePermissions(userRole);

    // RFPs require manager-level permissions
    const canApprove = ['owner', 'admin', 'manager'].includes(userRole || '');

    return {
      ...basePermissions,
      approve: canApprove
    };
  }

  async checkRfpAccess(context: PermissionContext, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
    const permissions = await this.checkRfpPermissions(context);
    return permissions[action] || false;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getRolePermissions(userRole?: string): PermissionCheck {
    switch (userRole) {
      case 'owner':
        return {
          create: true,
          read: true,
          update: true,
          delete: true,
        };

      case 'admin':
        return {
          create: true,
          read: true,
          update: true,
          delete: true,
        };

      case 'manager':
        return {
          create: true,
          read: true,
          update: true,
          delete: false,
        };

      case 'member':
        return {
          create: true,
          read: true,
          update: false,
          delete: false,
        };

      case 'viewer':
        return {
          create: false,
          read: true,
          update: false,
          delete: false,
        };

      default:
        return {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
    }
  }

  async validateOrganizationAccess(userId: string, orgId: string): Promise<boolean> {
    const { data: membership } = await this.supabase
      .from('memberships')
      .select('status')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    return membership?.status === 'active';
  }

  async getUserRole(userId: string, orgId: string): Promise<string | null> {
    const { data: membership } = await this.supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', orgId)
      .single();

    return membership?.role || null;
  }

  // ============================================================================
  // BULK PERMISSIONS
  // ============================================================================

  async checkBulkPermissions(context: PermissionContext, resourceIds: string[], action: 'update' | 'delete'): Promise<boolean> {
    const { userRole } = context;

    // Bulk operations require elevated permissions
    if (action === 'delete') {
      return ['owner', 'admin'].includes(userRole || '');
    }

    if (action === 'update') {
      return ['owner', 'admin', 'manager'].includes(userRole || '');
    }

    return false;
  }

  async filterAccessibleResources(context: PermissionContext, resourceIds: string[]): Promise<string[]> {
    // This would implement row-level filtering based on permissions
    // For now, return all IDs (would need specific implementation per resource type)
    return resourceIds;
  }
}
