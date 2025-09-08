/**
 * Comprehensive Audit Logging and Observability Service
 * Tracks all user actions, system events, and performance metrics for enterprise compliance
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export interface AuditEvent {
  id?: string;
  organization_id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at?: string;
}

export interface PerformanceMetric {
  id?: string;
  organization_id: string;
  user_id?: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  context?: Record<string, any>;
  created_at?: string;
}

export interface SecurityEvent {
  id?: string;
  organization_id: string;
  user_id?: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_export' | 'data_import' | 'password_change' | 'mfa_enabled' | 'mfa_disabled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export class AuditService {
  private supabase;
  private sessionId: string;
  private performanceBuffer: PerformanceMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    this.sessionId = this.generateSessionId();
    this.startPerformanceBufferFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private startPerformanceBufferFlush() {
    this.flushInterval = setInterval(() => {
      this.flushPerformanceBuffer();
    }, 30000); // Flush every 30 seconds
  }

  private async flushPerformanceBuffer() {
    if (this.performanceBuffer.length === 0) return;

    try {
      const metrics = [...this.performanceBuffer];
      this.performanceBuffer = [];

      const { error } = await this.supabase
        .from('performance_metrics')
        .insert(metrics);

      if (error) {
        console.error('Failed to flush performance metrics:', error);
        // Re-add failed metrics to buffer
        this.performanceBuffer.unshift(...metrics);
      }
    } catch (error) {
      console.error('Error flushing performance buffer:', error);
    }
  }

  // Audit logging methods
  async logAction(event: Omit<AuditEvent, 'id' | 'created_at' | 'ip_address' | 'user_agent' | 'session_id'>): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        ...event,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        session_id: this.sessionId,
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(auditEvent);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  async logCreate(organizationId: string, userId: string, tableName: string, recordId: string, newValues: Record<string, any>, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      table_name: tableName,
      record_id: recordId,
      new_values: newValues,
      metadata
    });
  }

  async logUpdate(organizationId: string, userId: string, tableName: string, recordId: string, oldValues: Record<string, any>, newValues: Record<string, any>, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'update',
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      metadata
    });
  }

  async logDelete(organizationId: string, userId: string, tableName: string, recordId: string, oldValues: Record<string, any>, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'delete',
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      metadata
    });
  }

  async logBulkAction(organizationId: string, userId: string, action: string, tableName: string, recordCount: number, metadata?: Record<string, any>): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: `bulk_${action}`,
      table_name: tableName,
      metadata: {
        ...metadata,
        record_count: recordCount
      }
    });
  }

  async logDataExport(organizationId: string, userId: string, tableName: string, format: string, recordCount: number, filters?: Record<string, any>): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'export',
      table_name: tableName,
      metadata: {
        format,
        record_count: recordCount,
        filters
      }
    });
  }

  async logDataImport(organizationId: string, userId: string, tableName: string, recordCount: number, successCount: number, errorCount: number): Promise<void> {
    await this.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'import',
      table_name: tableName,
      metadata: {
        total_records: recordCount,
        success_count: successCount,
        error_count: errorCount
      }
    });
  }

  // Security event logging
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'created_at' | 'ip_address' | 'user_agent'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('security_events')
        .insert(securityEvent);

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  async logLogin(organizationId: string, userId: string, method: string): Promise<void> {
    await this.logSecurityEvent({
      organization_id: organizationId,
      user_id: userId,
      event_type: 'login',
      severity: 'low',
      details: { method }
    });
  }

  async logFailedLogin(organizationId: string, email: string, reason: string): Promise<void> {
    await this.logSecurityEvent({
      organization_id: organizationId,
      event_type: 'failed_login',
      severity: 'medium',
      details: { email, reason }
    });
  }

  async logPermissionDenied(organizationId: string, userId: string, resource: string, action: string): Promise<void> {
    await this.logSecurityEvent({
      organization_id: organizationId,
      user_id: userId,
      event_type: 'permission_denied',
      severity: 'high',
      details: { resource, action }
    });
  }

  // Performance monitoring
  trackPerformance(organizationId: string, userId: string, metricName: string, value: number, unit: string, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      organization_id: organizationId,
      user_id: userId,
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit,
      context,
      created_at: new Date().toISOString()
    };

    this.performanceBuffer.push(metric);

    // Flush immediately if buffer is getting large
    if (this.performanceBuffer.length >= 100) {
      this.flushPerformanceBuffer();
    }
  }

  trackPageLoad(organizationId: string, userId: string, page: string, loadTime: number): void {
    this.trackPerformance(organizationId, userId, 'page_load_time', loadTime, 'milliseconds', { page });
  }

  trackApiCall(organizationId: string, userId: string, endpoint: string, duration: number, status: number): void {
    this.trackPerformance(organizationId, userId, 'api_call_duration', duration, 'milliseconds', { 
      endpoint, 
      status,
      success: status >= 200 && status < 300
    });
  }

  trackDatabaseQuery(organizationId: string, userId: string, table: string, operation: string, duration: number, recordCount?: number): void {
    this.trackPerformance(organizationId, userId, 'database_query_duration', duration, 'milliseconds', { 
      table, 
      operation,
      record_count: recordCount
    });
  }

  trackUserAction(organizationId: string, userId: string, action: string, duration: number): void {
    this.trackPerformance(organizationId, userId, 'user_action_duration', duration, 'milliseconds', { action });
  }

  // Analytics and reporting
  async getAuditLogs(organizationId: string, filters?: {
    userId?: string;
    tableName?: string;
    action?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<AuditEvent[]> {
    let query = this.supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('organization_id', organizationId);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 100);

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  async getSecurityEvents(organizationId: string, filters?: {
    eventType?: string;
    severity?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  }): Promise<SecurityEvent[]> {
    let query = this.supabase
      .from('security_events')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 100);

    if (error) {
      throw new Error(`Failed to fetch security events: ${error.message}`);
    }

    return data || [];
  }

  async getPerformanceMetrics(organizationId: string, filters?: {
    metricName?: string;
    dateRange?: { start: string; end: string };
    aggregation?: 'avg' | 'min' | 'max' | 'sum' | 'count';
  }): Promise<any[]> {
    // This would typically use a more sophisticated query with aggregations
    let query = this.supabase
      .from('performance_metrics')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.metricName) {
      query = query.eq('metric_name', filters.metricName);
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Failed to fetch performance metrics: ${error.message}`);
    }

    return data || [];
  }

  // Compliance reporting
  async generateComplianceReport(organizationId: string, dateRange: { start: string; end: string }): Promise<{
    auditSummary: any;
    securitySummary: any;
    performanceSummary: any;
    dataAccess: any;
  }> {
    const [auditLogs, securityEvents, performanceMetrics] = await Promise.all([
      this.getAuditLogs(organizationId, { dateRange }),
      this.getSecurityEvents(organizationId, { dateRange }),
      this.getPerformanceMetrics(organizationId, { dateRange })
    ]);

    return {
      auditSummary: {
        totalActions: auditLogs.length,
        actionsByType: this.groupBy(auditLogs, 'action'),
        actionsByTable: this.groupBy(auditLogs, 'table_name'),
        actionsByUser: this.groupBy(auditLogs, 'user_id')
      },
      securitySummary: {
        totalEvents: securityEvents.length,
        eventsByType: this.groupBy(securityEvents, 'event_type'),
        eventsBySeverity: this.groupBy(securityEvents, 'severity'),
        failedLogins: securityEvents.filter(e => e.event_type === 'failed_login').length
      },
      performanceSummary: {
        totalMetrics: performanceMetrics.length,
        metricsByName: this.groupBy(performanceMetrics, 'metric_name'),
        averageValues: this.calculateAverages(performanceMetrics)
      },
      dataAccess: {
        exports: auditLogs.filter(log => log.action === 'export').length,
        imports: auditLogs.filter(log => log.action === 'import').length,
        bulkOperations: auditLogs.filter(log => log.action.startsWith('bulk_')).length
      }
    };
  }

  // Utility methods
  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private calculateAverages(metrics: PerformanceMetric[]): Record<string, number> {
    const grouped = metrics.reduce((groups, metric) => {
      if (!groups[metric.metric_name]) {
        groups[metric.metric_name] = [];
      }
      groups[metric.metric_name].push(metric.metric_value);
      return groups;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped).reduce((averages, [name, values]) => {
      averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return averages;
    }, {} as Record<string, number>);
  }

  private async getClientIP(): Promise<string> {
    try {
      // In a real implementation, you might use a service to get the client IP
      // For now, return a placeholder
      return 'client_ip';
    } catch {
      return 'unknown';
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushPerformanceBuffer();
  }
}

export const auditService = new AuditService();
