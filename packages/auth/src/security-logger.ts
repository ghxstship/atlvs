import { createServerClient } from '@ghxstship/auth';

export interface SecurityEvent {
  organizationId?: string | null;
  userId?: string | null;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
}

export class SecurityLogger {
  private supabase: any;

  constructor() {
    this.supabase = createServerClient({
      get: () => undefined,
      set: () => {},
      remove: () => {}
    });
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    eventType: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'mfa_enabled' | 'mfa_disabled',
    userId?: string,
    organizationId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = this.getAuthEventSeverity(eventType);

    await this.logEvent({
      organizationId,
      userId,
      eventType,
      severity,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log authorization/permission events
   */
  async logAuthzEvent(
    userId: string,
    organizationId: string,
    eventType: 'permission_granted' | 'permission_revoked' | 'role_changed' | 'access_denied',
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = eventType === 'access_denied' ? 'high' : 'medium';

    await this.logEvent({
      organizationId,
      userId,
      eventType,
      severity,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(
    eventType: 'suspicious_login' | 'unusual_access_pattern' | 'brute_force_attempt' | 'data_exfiltration_attempt',
    details: any,
    userId?: string,
    organizationId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      organizationId,
      userId,
      eventType,
      severity: 'high',
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    eventType: 'data_export' | 'data_view' | 'data_modify' | 'bulk_operation',
    userId: string,
    organizationId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = eventType === 'data_export' ? 'medium' : 'low';

    await this.logEvent({
      organizationId,
      userId,
      eventType,
      severity,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log system security events
   */
  async logSystemEvent(
    eventType: 'rate_limit_exceeded' | 'suspicious_traffic' | 'security_policy_violation',
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      eventType,
      severity: 'medium',
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Generic security event logging
   */
  async logEvent(event: SecurityEvent): Promise<void> {
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
      // Fallback logging if database logging fails
      console.error('Failed to log security event:', error, event);
    }
  }

  /**
   * Log user activity for audit trails
   */
  async logUserActivity(
    userId: string,
    organizationId: string,
    action: string,
    resource: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      organizationId,
      userId,
      eventType: 'user_activity',
      severity: 'low',
      details: {
        action,
        resource,
        ...details,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Get security events for monitoring
   */
  async getSecurityEvents(
    organizationId?: string,
    severity?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    let query = this.supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Get audit logs for compliance
   */
  async getAuditLogs(
    organizationId?: string,
    userId?: string,
    tableName?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (tableName) {
      query = query.eq('table_name', tableName);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  private getAuthEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'login_success':
      case 'logout':
      case 'password_change':
      case 'mfa_enabled':
      case 'mfa_disabled':
        return 'low';
      case 'login_failure':
        return 'medium';
      default:
        return 'medium';
    }
  }
}

export default SecurityLogger;
