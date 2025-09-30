import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';

export interface AuditEvent {
  userId?: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode?: number;
  userAgent?: string;
  ipAddress?: string;
  requestSize?: number;
  responseSize?: number;
  duration?: number;
  sessionId?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogger {
  private supabase: any;

  constructor() {
    this.supabase = createServerClient({
      get: () => undefined,
      set: () => {},
      remove: () => {},
    });
  }

  /**
   * Log API access event
   */
  async logApiAccess(event: AuditEvent): Promise<void> {
    try {
      const logData = {
        organization_id: event.organizationId,
        user_id: event.userId,
        table_name: event.resource,
        record_id: event.resourceId,
        action: event.action,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        session_id: null, // Would need to be populated from session context
        correlation_id: crypto.randomUUID(),
      };

      // Insert audit log
      const { error: auditError } = await this.supabase
        .from('audit_logs')
        .insert(logData);

      if (auditError) {
        console.error('Failed to insert audit log:', auditError);
      }

      // Log security events for high-risk actions
      if (event.severity === 'high' || event.severity === 'critical') {
        const { error: securityError } = await this.supabase.rpc('log_security_event', {
          p_organization_id: event.organizationId,
          p_user_id: event.userId,
          p_event_type: `api_${event.action}`,
          p_severity: event.severity,
          p_details: {
            resource: event.resource,
            resourceId: event.resourceId,
            method: event.method,
            path: event.path,
            statusCode: event.statusCode,
            duration: event.duration,
            ...event.details,
          },
          p_ip_address: event.ipAddress,
          p_user_agent: event.userAgent,
        });

        if (securityError) {
          console.error('Failed to insert security event:', securityError);
        }
      }

    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit logging failures shouldn't break the API
    }
  }

  /**
   * Create audit middleware for API routes
   */
  createAuditMiddleware() {
    return async (request: NextRequest, response: NextResponse) => {
      const startTime = Date.now();
      const url = new URL(request.url);

      // Skip audit for certain endpoints
      const skipAudit = [
        '/api/health',
        '/api/csrf-token',
        '/api/auth/',
      ].some(path => url.pathname.startsWith(path));

      if (skipAudit) {
        return response;
      }

      try {
        // Extract user context (this would be populated by auth middleware)
        const userId = request.headers.get('x-user-id');
        const organizationId = request.headers.get('x-organization-id');

        // Calculate request size
        const requestSize = this.calculateRequestSize(request);

        // Wait for response to complete to capture status and size
        const originalResponse = response.clone();
        const responseBody = await originalResponse.text();
        const responseSize = new Blob([responseBody]).size;

        const duration = Date.now() - startTime;

        // Determine action based on HTTP method
        let action = 'UNKNOWN';
        switch (request.method) {
          case 'GET': action = 'SELECT'; break;
          case 'POST': action = 'INSERT'; break;
          case 'PUT':
          case 'PATCH': action = 'UPDATE'; break;
          case 'DELETE': action = 'DELETE'; break;
        }

        // Extract resource from path
        const resource = this.extractResourceFromPath(url.pathname);

        // Determine severity based on action and resource
        const severity = this.determineSeverity(action, resource, response.status);

        await this.logApiAccess({
          userId: userId || undefined,
          organizationId: organizationId || undefined,
          action,
          resource,
          method: request.method,
          path: url.pathname,
          statusCode: response.status,
          userAgent: request.headers.get('user-agent') || undefined,
          ipAddress: request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    request.ip || undefined,
          requestSize,
          responseSize,
          duration,
          severity,
          details: {
            query: Object.fromEntries(url.searchParams),
            responseTime: duration,
          },
        });

        return response;

      } catch (error) {
        console.error('Audit middleware error:', error);
        return response;
      }
    };
  }

  /**
   * Extract resource name from API path
   */
  private extractResourceFromPath(pathname: string): string {
    const pathParts = pathname.split('/').filter(Boolean);

    // Handle API versioning
    if (pathParts[0] === 'api' && pathParts[1]?.match(/^v\d+$/)) {
      return pathParts[2] || 'unknown';
    }

    if (pathParts[0] === 'api') {
      return pathParts[1] || 'unknown';
    }

    return pathParts[0] || 'unknown';
  }

  /**
   * Determine severity level for audit event
   */
  private determineSeverity(action: string, resource: string, statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
    // Critical actions
    if (action === 'DELETE' && ['users', 'organizations', 'settings'].includes(resource)) {
      return 'critical';
    }

    // High-risk actions
    if (action === 'DELETE' ||
        (action === 'UPDATE' && ['users', 'memberships', 'settings'].includes(resource))) {
      return 'high';
    }

    // Medium-risk actions
    if (['INSERT', 'UPDATE'].includes(action) &&
        ['finance', 'contracts', 'permissions'].includes(resource)) {
      return 'medium';
    }

    // Error responses
    if (statusCode >= 400) {
      return 'medium';
    }

    // Default
    return 'low';
  }

  /**
   * Calculate approximate request size
   */
  private calculateRequestSize(request: NextRequest): number {
    let size = 0;

    // Add URL length
    size += request.url.length;

    // Add headers size (approximate)
    for (const [key, value] of request.headers.entries()) {
      size += key.length + value.length + 2; // +2 for ': '
    }

    // Note: Request body size calculation would require consuming the stream
    // which might interfere with the actual request processing

    return size;
  }

  /**
   * Get severity level for auth events
   */
  private getAuthEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'login_success':
      case 'logout':
      case 'password_change':
      case 'mfa_enabled':
      case 'mfa_disabled':
        return 'low';
      case 'login_failure':
      case 'session_expired':
        return 'medium';
      case 'account_locked':
        return 'high';
      default:
        return 'medium';
    }
  }

  /**
   * Log security events to the security_events table
   */
  private async logSecurityEvent(event: {
    organizationId?: string | null;
    userId?: string | null;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    try {
      await this.supabase.rpc('log_security_event', {
        p_organization_id: event.organizationId,
        p_user_id: event.userId,
        p_event_type: event.eventType,
        p_severity: event.severity,
        p_details: event.details,
        p_ip_address: event.ipAddress,
        p_user_agent: event.userAgent,
        p_session_id: event.sessionId,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log authentication events with enhanced details
   */
  async logAuthEvent(
    eventType: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'session_expired' | 'account_locked',
    userId: string,
    organizationId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    const severity = this.getAuthEventSeverity(eventType);

    await this.logApiAccess({
      userId,
      organizationId,
      action: 'AUTH',
      resource: 'authentication',
      method: 'POST',
      path: `/auth/${eventType}`,
      severity,
      ipAddress,
      userAgent,
      sessionId,
      details: {
        eventType,
        sessionId,
        timestamp: new Date().toISOString(),
        ...details,
      },
    });

    // Also log to security events for high-severity auth events
    if (severity === 'high' || severity === 'critical') {
      await this.logSecurityEvent({
        organizationId,
        userId,
        eventType,
        severity,
        details,
        ipAddress,
        userAgent,
        sessionId,
      });
    }
  }

  /**
   * Log RBAC changes (role and permission modifications)
   */
  async logRBACChange(
    eventType: 'role_granted' | 'role_revoked' | 'role_changed' | 'permission_granted' | 'permission_revoked' | 'user_added_to_org' | 'user_removed_from_org',
    userId: string,
    organizationId: string,
    targetUserId: string,
    details: {
      oldRole?: string;
      newRole?: string;
      permission?: string;
      resource?: string;
      reason?: string;
    },
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    await this.logApiAccess({
      userId,
      organizationId,
      action: eventType.toUpperCase(),
      resource: 'rbac',
      resourceId: targetUserId,
      method: 'POST',
      path: `/api/v1/rbac/${eventType}`,
      severity: 'high', // RBAC changes are always high severity
      ipAddress,
      userAgent,
      sessionId,
      details: {
        eventType,
        targetUserId,
        timestamp: new Date().toISOString(),
        ...details,
      },
    });

    // Always log RBAC changes to security events
    await this.logSecurityEvent({
      organizationId,
      userId,
      eventType,
      severity: 'high',
      details: {
        targetUserId,
        ...details,
      },
      ipAddress,
      userAgent,
      sessionId,
    });
  }

  /**
   * Log access control events
   */
  async logAccessEvent(
    eventType: 'access_granted' | 'access_denied' | 'access_attempt' | 'permission_check_failed',
    userId: string,
    organizationId: string,
    details: {
      resource: string;
      action: string;
      reason?: string;
      requiredRole?: string;
      userRole?: string;
    },
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    const severity = eventType === 'access_denied' ? 'high' : 'medium';

    await this.logApiAccess({
      userId,
      organizationId,
      action: 'ACCESS',
      resource: details.resource,
      method: 'GET',
      path: `/api/v1/${details.resource}`,
      severity,
      ipAddress,
      userAgent,
      sessionId,
      details: {
        eventType,
        requestedAction: details.action,
        timestamp: new Date().toISOString(),
        ...details,
      },
    });

    // Log access denied events to security events
    if (eventType === 'access_denied') {
      await this.logSecurityEvent({
        organizationId,
        userId,
        eventType,
        severity: 'high',
        details,
        ipAddress,
        userAgent,
        sessionId,
      });
    }
  }

  /**
   * Log data export events
   */
  async logDataExport(
    userId: string,
    organizationId: string,
    resource: string,
    recordCount: number,
    format: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logApiAccess({
      userId,
      organizationId,
      action: 'EXPORT',
      resource,
      method: 'GET',
      path: `/api/v1/${resource}/export`,
      severity: 'medium',
      ipAddress,
      userAgent,
      details: {
        recordCount,
        format,
        exportedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Log bulk operation events
   */
  async logBulkOperation(
    userId: string,
    organizationId: string,
    action: string,
    resource: string,
    recordCount: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logApiAccess({
      userId,
      organizationId,
      action: action.toUpperCase(),
      resource,
      method: 'POST',
      path: `/api/v1/${resource}/bulk`,
      severity: recordCount > 100 ? 'high' : 'medium',
      ipAddress,
      userAgent,
      details: {
        recordCount,
        operationType: 'bulk',
        executedAt: new Date().toISOString(),
      },
    });
  }
}

// Singleton instance
let auditLogger: AuditLogger | null = null;

export function getAuditLogger(): AuditLogger {
  if (!auditLogger) {
    auditLogger = new AuditLogger();
  }
  return auditLogger;
}

export default AuditLogger;
