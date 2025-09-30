/**
 * Enterprise Alerting System
 * Comprehensive alerting for critical issues, performance, security, and business metrics
 */

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  context: AlertContext;
  timestamp: string;
  resolved?: boolean;
  resolvedAt?: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type AlertType =
  | 'uptime'
  | 'performance'
  | 'error'
  | 'security'
  | 'business'
  | 'infrastructure';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AlertContext {
  userId?: string;
  organizationId?: string;
  module?: string;
  endpoint?: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AlertConfig {
  /** Enable/disable alerting */
  enabled: boolean;
  /** Alert channels */
  channels: AlertChannel[];
  /** Alert rules */
  rules: AlertRule[];
  /** Escalation policies */
  escalation: EscalationPolicy;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook' | 'sms';
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  severity: AlertSeverity;
  condition: AlertCondition;
  cooldownMinutes: number;
  enabled: boolean;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
  threshold: number;
  duration?: number; // Duration in minutes for sustained conditions
}

export interface EscalationPolicy {
  /** Initial notification delay in minutes */
  initialDelayMinutes: number;
  /** Escalation levels */
  levels: EscalationLevel[];
}

export interface EscalationLevel {
  /** Level number (1, 2, 3, etc.) */
  level: number;
  /** Delay after previous level in minutes */
  delayMinutes: number;
  /** Channels to notify */
  channels: AlertChannel[];
  /** Recipients */
  recipients: string[];
}

class AlertingService {
  private config: AlertConfig;
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private cooldowns: Map<string, Date> = new Map();

  constructor(config: AlertConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🚨 Alerting service initialized');

    // Set up periodic cleanup of old alerts
    setInterval(() => this.cleanupOldAlerts(), 60 * 60 * 1000); // Every hour
  }

  async triggerAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    context: AlertContext = {}
  ): Promise<Alert | null> {
    if (!this.config.enabled) return null;

    // Check if alert is in cooldown
    const alertKey = `${type}:${severity}:${title}`;
    const lastAlert = this.cooldowns.get(alertKey);
    if (lastAlert) {
      const cooldownPeriod = this.getCooldownForAlert(type, severity);
      if (Date.now() - lastAlert.getTime() < cooldownPeriod * 60 * 1000) {
        return null; // Still in cooldown
      }
    }

    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      message,
      context,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Check if this alert should be triggered based on rules
    if (!this.shouldTriggerAlert(alert)) {
      return null;
    }

    // Add to active alerts
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Update cooldown
    this.cooldowns.set(alertKey, new Date());

    // Send notifications
    await this.sendNotifications(alert);

    console.log(`🚨 Alert triggered: ${severity.toUpperCase()} - ${title}`);

    return alert;
  }

  async resolveAlert(alertId: string, resolvedBy?: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    if (resolvedBy) {
      alert.acknowledged = true;
      alert.acknowledgedBy = resolvedBy;
      alert.acknowledgedAt = new Date().toISOString();
    }

    // Send resolution notification
    await this.sendResolutionNotification(alert);

    console.log(`✅ Alert resolved: ${alert.title}`);

    return true;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();

    return true;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  getAlertHistory(hours: number = 24): Alert[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert =>
      new Date(alert.timestamp) > cutoff
    );
  }

  private shouldTriggerAlert(alert: Alert): boolean {
    // Check against alert rules
    const matchingRule = this.config.rules.find(rule =>
      rule.type === alert.type &&
      rule.severity === alert.severity &&
      rule.enabled
    );

    if (!matchingRule) return false;

    // For now, always trigger if rule exists
    // In production, this would check the condition against metrics
    return true;
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    const promises = this.config.channels
      .filter(channel => channel.enabled)
      .map(channel => this.sendToChannel(channel, alert));

    await Promise.allSettled(promises);
  }

  private async sendToChannel(channel: AlertChannel, alert: Alert): Promise<void> {
    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmailAlert(channel, alert);
          break;
        case 'slack':
          await this.sendSlackAlert(channel, alert);
          break;
        case 'pagerduty':
          await this.sendPagerDutyAlert(channel, alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(channel, alert);
          break;
        case 'sms':
          await this.sendSMSAlert(channel, alert);
          break;
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel.type}:`, error);
    }
  }

  private async sendEmailAlert(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = channel.config as { to: string[]; from: string };
    // Implementation would integrate with email service (SendGrid, SES, etc.)
    console.log(`📧 Sending email alert to ${config.to.join(', ')}: ${alert.title}`);
  }

  private async sendSlackAlert(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = channel.config as { webhookUrl: string; channel: string };

    const payload = {
      channel: config.channel,
      text: `🚨 *${alert.severity.toUpperCase()} ALERT*\n*${alert.title}*\n${alert.message}`,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        fields: [
          { title: 'Type', value: alert.type, short: true },
          { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true },
        ],
      }],
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status}`);
    }
  }

  private async sendPagerDutyAlert(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = channel.config as { integrationKey: string };

    const payload = {
      routing_key: config.integrationKey,
      event_action: 'trigger',
      dedup_key: alert.id,
      payload: {
        summary: alert.title,
        severity: this.mapSeverityToPagerDuty(alert.severity),
        source: 'ghxstship-monitoring',
        component: alert.type,
        group: alert.context.organizationId || 'system',
        class: alert.type,
        custom_details: alert.context,
      },
    };

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`PagerDuty alert failed: ${response.status}`);
    }
  }

  private async sendWebhookAlert(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = channel.config as { url: string; headers?: Record<string, string> };

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }

  private async sendSMSAlert(channel: AlertChannel, alert: Alert): Promise<void> {
    const config = channel.config as { phoneNumbers: string[] };
    // Implementation would integrate with SMS service (Twilio, etc.)
    console.log(`📱 Sending SMS alert to ${config.phoneNumbers.join(', ')}: ${alert.title}`);
  }

  private async sendResolutionNotification(alert: Alert): Promise<void> {
    // Send resolution notifications to relevant channels
    const resolutionAlert: Alert = {
      ...alert,
      title: `✅ RESOLVED: ${alert.title}`,
      message: `Alert has been resolved`,
    };

    await this.sendNotifications(resolutionAlert);
  }

  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      case 'low': return 'good';
      case 'info': return '#439FE0';
      default: return '#439FE0';
    }
  }

  private mapSeverityToPagerDuty(severity: AlertSeverity): string {
    switch (severity) {
      case 'critical': return 'critical';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  private getCooldownForAlert(type: AlertType, severity: AlertSeverity): number {
    const rule = this.config.rules.find(r => r.type === type && r.severity === severity);
    return rule?.cooldownMinutes || 5; // Default 5 minutes
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldAlerts(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Remove old resolved alerts from active alerts
    for (const [id, alert] of this.activeAlerts) {
      if (alert.resolved && new Date(alert.resolvedAt!) < cutoff) {
        this.activeAlerts.delete(id);
      }
    }

    // Keep only last 1000 alerts in history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }
}

// Default alerting configuration for GHXSTSHIP
export const defaultAlertConfig: AlertConfig = {
  enabled: true,
  channels: [
    {
      type: 'email',
      enabled: true,
      config: {
        to: ['alerts@ghxstship.com', 'engineering@ghxstship.com'],
        from: 'alerts@ghxstship.com',
      },
    },
    {
      type: 'slack',
      enabled: true,
      config: {
        webhookUrl: process.env.SLACK_ALERTS_WEBHOOK_URL || '',
        channel: '#alerts',
      },
    },
    {
      type: 'pagerduty',
      enabled: true,
      config: {
        integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY || '',
      },
    },
  ],
  rules: [
    {
      id: 'uptime-critical',
      name: 'Critical Uptime Alert',
      type: 'uptime',
      severity: 'critical',
      condition: { metric: 'uptime', operator: 'lt', threshold: 99.9 },
      cooldownMinutes: 10,
      enabled: true,
    },
    {
      id: 'error-rate-high',
      name: 'High Error Rate Alert',
      type: 'error',
      severity: 'high',
      condition: { metric: 'error_rate', operator: 'gt', threshold: 5 },
      cooldownMinutes: 15,
      enabled: true,
    },
    {
      id: 'performance-degradation',
      name: 'Performance Degradation',
      type: 'performance',
      severity: 'medium',
      condition: { metric: 'response_time', operator: 'gt', threshold: 5000 },
      cooldownMinutes: 30,
      enabled: true,
    },
    {
      id: 'security-incident',
      name: 'Security Incident',
      type: 'security',
      severity: 'critical',
      condition: { metric: 'security_events', operator: 'gt', threshold: 0 },
      cooldownMinutes: 5,
      enabled: true,
    },
  ],
  escalation: {
    initialDelayMinutes: 5,
    levels: [
      {
        level: 1,
        delayMinutes: 0,
        channels: [{ type: 'slack', enabled: true, config: {} }],
        recipients: ['on-call-engineer'],
      },
      {
        level: 2,
        delayMinutes: 15,
        channels: [
          { type: 'email', enabled: true, config: {} },
          { type: 'pagerduty', enabled: true, config: {} },
        ],
        recipients: ['engineering-lead', 'devops-team'],
      },
      {
        level: 3,
        delayMinutes: 60,
        channels: [
          { type: 'email', enabled: true, config: {} },
          { type: 'sms', enabled: true, config: {} },
        ],
        recipients: ['cto', 'ceo'],
      },
    ],
  },
};

export const alertingService = new AlertingService(defaultAlertConfig);
