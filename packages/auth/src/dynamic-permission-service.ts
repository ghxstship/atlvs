import { createServerClient } from '@ghxstship/auth';
import { NextRequest } from 'next/server';
import { getPermissionCache } from './permission-cache';

export interface PermissionContext {
  userId: string;
  organizationId: string;
  userRole: string;
  resource?: string;
  action?: string;
  resourceId?: string;
  metadata?: any;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  conditions?: any;
  rolloutPercentage?: number;
}

export class DynamicPermissionService {
  private supabase: any;
  private cache: ReturnType<typeof getPermissionCache>;

  constructor(request?: NextRequest) {
    this.supabase = createServerClient({
      get: (name: string) => {
        if (request) {
          const c = request.cookies.get(name);
          return c ? { name: c.name, value: c.value } : undefined;
        }
        return undefined;
      },
      set: (name: string, value: string, options) => {
        // Not needed for service operations
      },
      remove: (name: string) => {
        // Not needed for service operations
      }
    });
    this.cache = getPermissionCache();
  }

  async evaluatePermission(context: PermissionContext): Promise<boolean> {
    try {
      // Check cache first
      const cachedPermissions = this.cache.getPermissions(context.userId, context.organizationId);
      if (cachedPermissions) {
        const permissionKey = `${context.resource || 'default'}.${context.action || 'read'}`;
        return cachedPermissions.includes(permissionKey) || cachedPermissions.includes(`${context.resource || 'default'}.*`);
      }

      // Get organization security settings (with caching)
      let securitySettings = this.cache.getOrganizationSettings(context.organizationId);
      if (!securitySettings) {
        const { data: org } = await this.supabase
          .from('organizations')
          .select('security_settings')
          .eq('id', context.organizationId)
          .single();

        securitySettings = org?.security_settings || {};
        this.cache.setOrganizationSettings(context.organizationId, securitySettings);
      }

      // Evaluate role-based permissions first
      if (!this.checkRoleBasedPermission(context, securitySettings)) {
        return false;
      }

      // Evaluate feature flags
      if (!await this.checkFeatureFlags(context, securitySettings)) {
        return false;
      }

      // Evaluate resource-specific permissions
      if (!await this.checkResourcePermissions(context, securitySettings)) {
        return false;
      }

      // Evaluate time-based restrictions
      if (!this.checkTimeBasedRestrictions(context, securitySettings)) {
        return false;
      }

      // Evaluate IP-based restrictions
      if (!this.checkIPRestrictions(context, securitySettings)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Permission evaluation error:', error);
      return false;
    }
  }

  /**
   * Check role-based permissions
   */
  private checkRoleBasedPermission(context: PermissionContext, securitySettings: any): boolean {
    const roleHierarchy = {
      owner: 5,
      admin: 4,
      manager: 3,
      producer: 2,
      member: 1,
    };

    const userRoleLevel = roleHierarchy[context.userRole as keyof typeof roleHierarchy] || 0;

    // Define permission requirements by resource and action
    const permissionMatrix: Record<string, Record<string, number>> = {
      // User management
      users: {
        create: 4, // admin+
        read: 1,   // member+
        update: 4, // admin+
        delete: 5, // owner only
      },
      // Organization settings
      organization: {
        read: 1,
        update: 5, // owner only
      },
      // Financial data
      finance: {
        create: 3, // manager+
        read: 2,   // producer+
        update: 3, // manager+
        delete: 4, // admin+
      },
      // Projects
      projects: {
        create: 2, // producer+
        read: 1,   // member+
        update: 3, // manager+
        delete: 4, // admin+
      },
      // Sensitive data
      audit_logs: {
        read: 4, // admin+
      },
      security_events: {
        read: 4, // admin+
      },
    };

    const resourcePermissions = permissionMatrix[context.resource || ''];
    if (!resourcePermissions) {
      return true; // Allow if no specific rules
    }

    const requiredLevel = resourcePermissions[context.action || 'read'] || 5;
    return userRoleLevel >= requiredLevel;
  }

  /**
   * Check feature flags
   */
  private async checkFeatureFlags(context: PermissionContext, securitySettings: any): Promise<boolean> {
    const featureFlags = securitySettings.feature_flags || {};

    // Check if the requested feature is enabled
    if (context.resource && context.action) {
      const featureKey = `${context.resource}.${context.action}`;
      const featureFlag = featureFlags[featureKey];

      if (featureFlag && !featureFlag.enabled) {
        return false;
      }

      // Check rollout percentage
      if (featureFlag?.rolloutPercentage) {
        const userHash = this.hashUserId(context.userId);
        const rolloutValue = userHash % 100;
        if (rolloutValue > featureFlag.rolloutPercentage) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check resource-specific permissions
   */
  private async checkResourcePermissions(context: PermissionContext, securitySettings: any): Promise<boolean> {
    // Check resource ownership
    if (context.resourceId && context.resource) {
      try {
        const { data: resource } = await this.supabase
          .from(context.resource)
          .select('organization_id, created_by')
          .eq('id', context.resourceId)
          .single();

        if (!resource) {
          return false;
        }

        // Must belong to same organization
        if (resource.organization_id !== context.organizationId) {
          return false;
        }

        // Additional ownership checks
        if (context.action === 'update' || context.action === 'delete') {
          // Users can modify their own resources, or admins can modify any
          if (resource.created_by !== context.userId && !['owner', 'admin'].includes(context.userRole)) {
            return false;
          }
        }
      } catch (error) {
        // If resource doesn't exist or can't be checked, deny access
        return false;
      }
    }

    return true;
  }

  /**
   * Check time-based restrictions
   */
  private checkTimeBasedRestrictions(context: PermissionContext, securitySettings: any): boolean {
    const restrictions = securitySettings.time_restrictions || {};

    // Check business hours
    if (restrictions.business_hours_only) {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Business hours: Monday-Friday, 9 AM - 6 PM
      if (day === 0 || day === 6) return false; // Weekend
      if (hour < 9 || hour >= 18) return false; // Outside business hours
    }

    // Check session time limits
    if (restrictions.max_session_hours) {
      // This would require session tracking, simplified for now
      return true;
    }

    return true;
  }

  /**
   * Check IP-based restrictions
   */
  private checkIPRestrictions(context: PermissionContext, securitySettings: any): boolean {
    const restrictions = securitySettings.ip_restrictions || {};

    if (!restrictions.enabled) {
      return true;
    }

    // This would require getting the client IP from the request context
    // For now, assume IP checking is done at middleware level
    return true;
  }

  async getUserPermissions(context: PermissionContext): Promise<string[]> {
    // Check cache first
    const cachedPermissions = this.cache.getPermissions(context.userId, context.organizationId);
    if (cachedPermissions) {
      return cachedPermissions;
    }

    const permissions: string[] = [];

    // Add role-based permissions
    permissions.push(`${context.userRole}.*`);

    // Add resource-specific permissions
    const resources = ['users', 'organization', 'finance', 'projects', 'audit_logs', 'security_events'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const resource of resources) {
      for (const action of actions) {
        const testContext = { ...context, resource, action };
        if (await this.evaluatePermission(testContext)) {
          permissions.push(`${resource}.${action}`);
        }
      }
    }

    // Cache the permissions
    this.cache.setPermissions(context.userId, context.organizationId, permissions);

    return permissions;
  }

  async isFeatureEnabled(featureName: string, context: PermissionContext): Promise<boolean> {
    // Check cache first
    const securitySettings = this.cache.getOrganizationSettings(context.organizationId);
    if (securitySettings) {
      const featureFlags = securitySettings.feature_flags || {};
      const featureFlag = featureFlags[featureName];
      if (!featureFlag) return true;

      if (!featureFlag.enabled) return false;

      // Check rollout percentage
      if (featureFlag.rolloutPercentage) {
        const userHash = this.hashUserId(context.userId);
        const rolloutValue = userHash % 100;
        return rolloutValue <= featureFlag.rolloutPercentage;
      }

      return true;
    }

    // Fallback to database
    const { data: org } = await this.supabase
      .from('organizations')
      .select('security_settings')
      .eq('id', context.organizationId)
      .single();

    const orgSecuritySettings = org?.security_settings || {};
    const featureFlags = orgSecuritySettings.feature_flags || {};

    const featureFlag = featureFlags[featureName];
    if (!featureFlag) return true; // Default to enabled if not configured

    if (!featureFlag.enabled) return false;

    // Check rollout percentage
    if (featureFlag.rolloutPercentage) {
      const userHash = this.hashUserId(context.userId);
      const rolloutValue = userHash % 100;
      return rolloutValue <= featureFlag.rolloutPercentage;
    }

    return true;
  }

  /**
   * Simple hash function for user ID (for feature rollout)
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default DynamicPermissionService;
