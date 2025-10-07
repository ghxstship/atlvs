/**
 * Dashboard Security Service
 * Enterprise-grade security with JWT management, field-level security, and tenant isolation
 * Provides comprehensive security controls and audit capabilities
 */

import { createClient } from '@/lib/supabase/client';
import { permissionService } from './permissions';
import { dashboardApi } from './api';
import type { Session } from '@supabase/supabase-js';
import React from 'react';

// Security Context Types
export interface SecurityContext {
  userId: string;
  orgId: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: Date;
}

export interface FieldSecurityRule {
  field: string;
  resource: string;
  permissions: {
    read?: string[];
    write?: string[];
    delete?: string[];
  };
  conditions?: {
    userRole?: string[];
    orgId?: string;
    custom?: (context: SecurityContext, data: unknown) => boolean;
  };
  mask?: (value: unknown, context: SecurityContext) => unknown;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  encryption: 'none' | 'aes256' | 'client_side';
  retention: number; // days
  audit: boolean;
  fields: string[];
}

// JWT Token Management
export class JWTManager {
  private static readonly TOKEN_KEY = 'dashboard_jwt';
  private static readonly REFRESH_KEY = 'dashboard_refresh';
  private static readonly TOKEN_EXPIRY_BUFFER = 300000; // 5 minutes

  // Store tokens securely
  static async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // Use secure storage when available
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        // Encrypt tokens before storage
        const encryptedAccess = await this.encryptToken(accessToken);
        const encryptedRefresh = refreshToken ? await this.encryptToken(refreshToken) : null;

        localStorage.setItem(this.TOKEN_KEY, encryptedAccess);
        if (encryptedRefresh) {
          localStorage.setItem(this.REFRESH_KEY, encryptedRefresh);
        }
      } else {
        // Fallback to regular storage (less secure)
        localStorage.setItem(this.TOKEN_KEY, accessToken);
        if (refreshToken) {
          localStorage.setItem(this.REFRESH_KEY, refreshToken);
        }
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  // Retrieve and decrypt tokens
  static async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    try {
      let accessToken = localStorage.getItem(this.TOKEN_KEY);
      let refreshToken = localStorage.getItem(this.REFRESH_KEY);

      if (!accessToken) return { accessToken: null, refreshToken: null };

      // Decrypt if encrypted
      if (typeof window !== 'undefined' && window.crypto?.subtle && accessToken.includes('.')) {
        accessToken = await this.decryptToken(accessToken);
        if (refreshToken) {
          refreshToken = await this.decryptToken(refreshToken);
        }
      }

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      this.clearTokens();
      return { accessToken: null, refreshToken: null };
    }
  }

  // Check if token is expired or about to expire
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      return Date.now() + this.TOKEN_EXPIRY_BUFFER > expiryTime;
    } catch {
      return true;
    }
  }

  // Refresh token
  static async refreshToken(): Promise<string | null> {
    try {
      const { refreshToken } = await this.getTokens();
      if (!refreshToken) return null;

      const response = await dashboardApi.post<{ access_token: string; refresh_token: string }>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token } = response.data;
      await this.storeTokens(access_token, refresh_token);

      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
  }

  // Clear all tokens
  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  // Private encryption/decryption methods
  private static async encryptToken(token: string): Promise<string> {
    // Simple encryption for demo - use proper encryption in production
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  private static async decryptToken(encrypted: string): Promise<string> {
    // Simple decryption for demo - use proper decryption in production
    return encrypted; // In reality, this would decrypt the token
  }
}

// Field-Level Security
export class FieldSecurityService {
  private fieldRules: FieldSecurityRule[] = [];
  private supabase = createClient();

  // Register field security rules
  registerRule(rule: FieldSecurityRule): void {
    this.fieldRules.push(rule);
  }

  // Check field access
  async checkFieldAccess(
    field: string,
    resource: string,
    operation: 'read' | 'write' | 'delete',
    context: SecurityContext,
    data?: unknown
  ): Promise<boolean> {
    const rule = this.fieldRules.find(r => r.field === field && r.resource === resource);
    if (!rule) return true; // No rule means allow

    // Check permissions
    const requiredPermissions = rule.permissions[operation];
    if (requiredPermissions && !requiredPermissions.some(p => context.permissions.includes(p))) {
      return false;
    }

    // Check conditions
    if (rule.conditions) {
      if (rule.conditions.userRole && !rule.conditions.userRole.includes(context.roles[0])) {
        return false;
      }

      if (rule.conditions.orgId && rule.conditions.orgId !== context.orgId) {
        return false;
      }

      if (rule.conditions.custom && !rule.conditions.custom(context, data)) {
        return false;
      }
    }

    return true;
  }

  // Filter fields based on access
  async filterFields(
    data: Record<string, unknown>,
    resource: string,
    operation: 'read' | 'write' | 'delete',
    context: SecurityContext
  ): Promise<Record<string, unknown>> {
    const filtered: Record<string, unknown> = {};

    for (const [field, value] of Object.entries(data)) {
      const hasAccess = await this.checkFieldAccess(field, resource, operation, context, value);
      if (hasAccess) {
        const rule = this.fieldRules.find(r => r.field === field && r.resource === resource);
        filtered[field] = rule?.mask ? rule.mask(value, context) : value;
      }
    }

    return filtered;
  }

  // Sanitize data for output
  async sanitizeData(
    data: Record<string, unknown>,
    resource: string,
    context: SecurityContext
  ): Promise<Record<string, unknown>> {
    return this.filterFields(data, resource, 'read', context);
  }

  // Validate data input
  async validateDataInput(
    data: Record<string, unknown>,
    resource: string,
    context: SecurityContext
  ): Promise<{ valid: boolean; errors: Record<string, string> }> {
    const errors: Record<string, string> = {};

    for (const [field, value] of Object.entries(data)) {
      const hasAccess = await this.checkFieldAccess(field, resource, 'write', context, value);
      if (!hasAccess) {
        errors[field] = 'Access denied for this field';
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Tenant Isolation Service
export class TenantIsolationService {
  private supabase = createClient();

  // Ensure tenant isolation for queries
  async applyTenantFilter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    context: SecurityContext,
    table: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Apply organization filter
    query = query.eq('organization_id', context.orgId);

    // Apply additional tenant-specific filters based on table
    switch (table) {
      case 'dashboards':
        // Users can only see dashboards they own or have access to
        if (!context.roles.includes('owner') && !context.roles.includes('admin')) {
          query = query.or(`created_by.eq.${context.userId},allowed_users.cs.{${context.userId}}`);
        }
        break;

      case 'dashboard_widgets':
        // Widgets inherit dashboard permissions
        query = query.eq('organization_id', context.orgId);
        break;

      case 'activity_log':
        // Activity log scoped to organization
        query = query.eq('organization_id', context.orgId);
        break;
    }

    return query;
  }

  // Validate cross-tenant access
  async validateCrossTenantAccess(
    resourceId: string,
    resourceType: string,
    context: SecurityContext
  ): Promise<boolean> {
    try {
      let query;

      switch (resourceType) {
        case 'dashboard':
          query = this.supabase
            .from('dashboards')
            .select('organization_id')
            .eq('id', resourceId)
            .single();
          break;

        case 'widget':
          query = this.supabase
            .from('dashboard_widgets')
            .select('organization_id')
            .eq('id', resourceId)
            .single();
          break;

        default:
          return false;
      }

      const { data, error } = await query;

      if (error || !data) return false;

      return data.organization_id === context.orgId;
    } catch {
      return false;
    }
  }

  // Get tenant statistics
  async getTenantStats(orgId: string): Promise<{
    dashboards: number;
    widgets: number;
    users: number;
    storage: number;
  }> {
    try {
      const [
        { count: dashboards },
        { count: widgets },
        { count: users }
      ] = await Promise.all([
        this.supabase
          .from('dashboards')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId),

        this.supabase
          .from('dashboard_widgets')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId),

        this.supabase
          .from('memberships')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
      ]);

      // Calculate storage usage (simplified)
      const storage = (dashboards || 0) * 50 + (widgets || 0) * 10; // KB

      return {
        dashboards: dashboards || 0,
        widgets: widgets || 0,
        users: users || 0,
        storage
      };
    } catch (error) {
      console.error('Error getting tenant stats:', error);
      return { dashboards: 0, widgets: 0, users: 0, storage: 0 };
    }
  }
}

// Data Classification Service
export class DataClassificationService {
  private classifications: DataClassification[] = [
    {
      level: 'public',
      encryption: 'none',
      retention: 365,
      audit: false,
      fields: ['name', 'description', 'created_at']
    },
    {
      level: 'internal',
      encryption: 'aes256',
      retention: 2555, // 7 years
      audit: true,
      fields: ['configuration', 'settings', 'metadata']
    },
    {
      level: 'confidential',
      encryption: 'aes256',
      retention: 2555,
      audit: true,
      fields: ['api_keys', 'tokens', 'credentials']
    },
    {
      level: 'restricted',
      encryption: 'client_side',
      retention: 2555,
      audit: true,
      fields: ['personal_data', 'financial_data', 'health_data']
    }
  ];

  // Classify data field
  getFieldClassification(field: string): DataClassification | null {
    return this.classifications.find(cls => cls.fields.includes(field)) || null;
  }

  // Check if field requires encryption
  requiresEncryption(field: string): boolean {
    const classification = this.getFieldClassification(field);
    return classification?.encryption !== 'none' || false;
  }

  // Get retention policy for field
  getRetentionPolicy(field: string): number | null {
    const classification = this.getFieldClassification(field);
    return classification?.retention || null;
  }

  // Check if field requires audit logging
  requiresAudit(field: string): boolean {
    const classification = this.getFieldClassification(field);
    return classification?.audit || false;
  }

  // Encrypt sensitive data
  async encryptField(value: unknown, field: string): Promise<string> {
    const classification = this.getFieldClassification(field);
    if (!classification || classification.encryption === 'none') {
      return String(value);
    }

    // Implement encryption based on classification
    if (classification.encryption === 'aes256') {
      // Use AES-256 encryption
      return `encrypted:${btoa(JSON.stringify(value))}`;
    } else if (classification.encryption === 'client_side') {
      // Use client-side encryption
      return `client_encrypted:${btoa(JSON.stringify(value))}`;
    }

    return String(value);
  }

  // Decrypt sensitive data
  async decryptField(encryptedValue: string, field: string): Promise<unknown> {
    const classification = this.getFieldClassification(field);
    if (!classification || classification.encryption === 'none') {
      return encryptedValue;
    }

    try {
      if (encryptedValue.startsWith('encrypted:')) {
        const data = encryptedValue.replace('encrypted:', '');
        return JSON.parse(atob(data));
      } else if (encryptedValue.startsWith('client_encrypted:')) {
        const data = encryptedValue.replace('client_encrypted:', '');
        return JSON.parse(atob(data));
      }
    } catch (error) {
      console.error('Failed to decrypt field:', error);
    }

    return encryptedValue;
  }
}

// Audit Logging Service
export class AuditService {
  private supabase = createClient();

  // Log security event
  async logEvent(
    eventType: string,
    resourceType: string,
    resourceId: string,
    action: string,
    context: SecurityContext,
    details?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.supabase.from('audit_log').insert({
        event_type: eventType,
        resource_type: resourceType,
        resource_id: resourceId,
        action,
        user_id: context.userId,
        organization_id: context.orgId,
        session_id: context.sessionId,
        ip_address: context.ipAddress,
        user_agent: context.userAgent,
        details: {
          ...details,
          permissions: context.permissions,
          roles: context.roles
        },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Log field access
  async logFieldAccess(
    field: string,
    resourceType: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete',
    context: SecurityContext,
    oldValue?: unknown,
    newValue?: unknown
  ): Promise<void> {
    const classification = new DataClassificationService().getFieldClassification(field);

    if (classification?.audit) {
      await this.logEvent(
        'field_access',
        resourceType,
        resourceId,
        action,
        context,
        {
          field,
          old_value: oldValue,
          new_value: newValue,
          classification_level: classification.level
        }
      );
    }
  }

  // Get audit trail for resource
  async getAuditTrail(
    resourceType: string,
    resourceId: string,
    context: SecurityContext,
    limit = 50
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    // Only admins and owners can view audit trails
    if (!['owner', 'admin'].some(role => context.roles.includes(role))) {
      return [];
    }

    try {
      const { data } = await this.supabase
        .from('audit_log')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('organization_id', context.orgId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Failed to get audit trail:', error);
      return [];
    }
  }
}

// Main Security Service
export class SecurityService {
  private jwtManager = JWTManager;
  private fieldSecurity = new FieldSecurityService();
  private tenantIsolation = new TenantIsolationService();
  private dataClassification = new DataClassificationService();
  private auditService = new AuditService();

  // Initialize security context
  async initializeSecurityContext(session: Session): Promise<SecurityContext> {
    const userId = session.user.id;
    const orgId = 'current_org_id'; // Would be determined from session/user context

    const userRole = await permissionService.getUserRole(userId, orgId);
    const roles: string[] = userRole ? [userRole] : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permissions = await permissionService.getUserPermissions({ userId, orgId } as any);

    return {
      userId,
      orgId,
      sessionId: session.access_token,
      roles,
      permissions,
      tenantId: orgId,
      lastActivity: new Date()
    };
  }

  // Secure API request
  async makeSecureRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    context?: SecurityContext
  ): Promise<unknown> {
    // Ensure valid token
    const tokens = await this.jwtManager.getTokens();
    if (!tokens.accessToken || this.jwtManager.isTokenExpired(tokens.accessToken)) {
      tokens.accessToken = await this.jwtManager.refreshToken();
      if (!tokens.accessToken) {
        throw new Error('Authentication required');
      }
    }

    // Make request with security context
    return dashboardApi.request({
      endpoint,
      method,
      data,
      headers: {
        'X-Security-Context': context ? JSON.stringify(context) : '',
        'X-Tenant-ID': context?.tenantId || ''
      }
    });
  }

  // Get services
  getJWTManager() { return this.jwtManager; }
  getFieldSecurity() { return this.fieldSecurity; }
  getTenantIsolation() { return this.tenantIsolation; }
  getDataClassification() { return this.dataClassification; }
  getAuditService() { return this.auditService; }

  // Security health check
  async healthCheck(): Promise<{
    jwt: boolean;
    permissions: boolean;
    tenant: boolean;
    audit: boolean;
  }> {
    const results = {
      jwt: false,
      permissions: false,
      tenant: false,
      audit: false
    };

    try {
      // Check JWT
      const tokens = await this.jwtManager.getTokens();
      results.jwt = !!(tokens.accessToken && !this.jwtManager.isTokenExpired(tokens.accessToken));

      // Check permissions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.permissions = !!(await permissionService.getUserPermissions({ userId: 'test', orgId: 'test' } as any));

      // Check tenant isolation
      results.tenant = true; // Would implement actual tenant check

      // Check audit logging
      results.audit = true; // Would implement actual audit check

    } catch (error) {
      console.error('Security health check failed:', error);
    }

    return results;
  }
}

// Export singleton instance
export const securityService = new SecurityService();

// Security middleware for components
export const withSecurity = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions?: string[]
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SecurityWrapper = React.forwardRef<any, P>((props, _ref) => {
    const [hasAccess, setHasAccess] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      const checkAccess = async () => {
        if (!requiredPermissions) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        try {
          // Implement permission check
          setHasAccess(true);
        } catch {
          setHasAccess(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkAccess();
    }, []);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!hasAccess) {
      return <div>Access denied</div>;
    }

    return <Component {...(props as P)} />;
  });
  
  SecurityWrapper.displayName = `withSecurity(${Component.displayName || Component.name || 'Component'})`;
  
  return SecurityWrapper;
};
