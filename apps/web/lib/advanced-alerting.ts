/**
 * Advanced Alerting System
 * Intelligent alerting for performance degradation and business metrics
 */

import { alertingService } from './alerting';
import { businessMetricsService } from './business-metrics';

export interface PerformanceAlertRule {
  id: string;
  name: string;
  metric: 'response_time' | 'error_rate' | 'throughput' | 'cpu' | 'memory' | 'disk' | 'network';
  condition: 'gt' | 'lt' | 'eq' | 'ne';
  threshold: number;
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  enabled: boolean;
  description: string;
}

export interface BusinessAlertRule {
  id: string;
  name: string;
  metric: string; // Business metric path (e.g., 'revenue.monthlyRecurringRevenue')
  condition: 'gt' | 'lt' | 'eq' | 'ne' | 'pct_change';
  threshold: number;
  comparisonPeriod: 'hour' | 'day' | 'week' | 'month';
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  enabled: boolean;
  description: string;
}

export interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: string;
  resolvedAt?: string;
  duration?: number; // minutes
  context: Record<string, unknown>;
}

export interface SmartAlertConfig {
  enabled: boolean;
  machineLearning: boolean; // Use ML for anomaly detection
  seasonalAdjustment: boolean; // Adjust for seasonal patterns
  baselinePeriod: number; // days for baseline calculation
  sensitivity: 'low' | 'medium' | 'high';
  autoTuning: boolean; // Automatically adjust thresholds
}

class AdvancedAlertingService {
  private performanceRules: PerformanceAlertRule[] = [];
  private businessRules: BusinessAlertRule[] = [];
  private alertHistory: AlertHistory[] = [];
  private activeAlerts: Map<string, AlertHistory> = new Map();
  private config: SmartAlertConfig;
  private baselines: Map<string, number[]> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: SmartAlertConfig = {}) {
    this.config = {
      enabled: true,
      machineLearning: false,
      seasonalAdjustment: true,
      baselinePeriod: 7, // 7 days
      sensitivity: 'medium',
      autoTuning: true,
      ...config,
    };

    this.initializeDefaultRules();
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return;

    console.log('🔔 Advanced alerting service initialized');

    // Start monitoring
    this.startMonitoring();

    // Load historical data for baseline calculation
    await this.loadHistoricalData();
  }

  private initializeDefaultRules(): void {
    // Performance alert rules
    this.performanceRules = [
      {
        id: 'response_time_p95',
        name: 'High Response Time (P95)',
        metric: 'response_time',
        condition: 'gt',
        threshold: 2000, // 2 seconds
        duration: 5, // 5 minutes
        severity: 'high',
        cooldown: 15,
        enabled: true,
        description: 'P95 response time exceeds 2 seconds for 5+ minutes',
      },
      {
        id: 'error_rate_critical',
        name: 'Critical Error Rate',
        metric: 'error_rate',
        condition: 'gt',
        threshold: 5, // 5%
        duration: 2,
        severity: 'critical',
        cooldown: 10,
        enabled: true,
        description: 'Error rate exceeds 5% for 2+ minutes',
      },
      {
        id: 'cpu_usage_high',
        name: 'High CPU Usage',
        metric: 'cpu',
        condition: 'gt',
        threshold: 80, // 80%
        duration: 10,
        severity: 'medium',
        cooldown: 30,
        enabled: true,
        description: 'CPU usage exceeds 80% for 10+ minutes',
      },
      {
        id: 'memory_usage_critical',
        name: 'Critical Memory Usage',
        metric: 'memory',
        condition: 'gt',
        threshold: 90, // 90%
        duration: 5,
        severity: 'critical',
        cooldown: 15,
        enabled: true,
        description: 'Memory usage exceeds 90% for 5+ minutes',
      },
      {
        id: 'throughput_drop',
        name: 'Throughput Drop',
        metric: 'throughput',
        condition: 'lt',
        threshold: 50, // 50% of baseline
        duration: 3,
        severity: 'high',
        cooldown: 20,
        enabled: true,
        description: 'Throughput drops below 50% of baseline for 3+ minutes',
      },
    ];

    // Business alert rules
    this.businessRules = [
      {
        id: 'mrr_drop',
        name: 'MRR Drop',
        metric: 'revenue.monthlyRecurringRevenue',
        condition: 'pct_change',
        threshold: -10, // 10% drop
        comparisonPeriod: 'month',
        severity: 'critical',
        cooldown: 1440, // 24 hours
        enabled: true,
        description: 'Monthly recurring revenue drops by 10% or more',
      },
      {
        id: 'churn_spike',
        name: 'Churn Rate Spike',
        metric: 'revenue.churnRate',
        condition: 'gt',
        threshold: 5, // 5%
        comparisonPeriod: 'month',
        severity: 'high',
        cooldown: 720, // 12 hours
        enabled: true,
        description: 'Monthly churn rate exceeds 5%',
      },
      {
        id: 'conversion_drop',
        name: 'Conversion Rate Drop',
        metric: 'conversion.checkoutConversion',
        condition: 'pct_change',
        threshold: -15, // 15% drop
        comparisonPeriod: 'week',
        severity: 'high',
        cooldown: 360, // 6 hours
        enabled: true,
        description: 'Checkout conversion rate drops by 15% or more',
      },
      {
        id: 'dau_drop',
        name: 'DAU Drop',
        metric: 'userEngagement.dailyActiveUsers',
        condition: 'pct_change',
        threshold: -20, // 20% drop
        comparisonPeriod: 'day',
        severity: 'critical',
        cooldown: 120, // 2 hours
        enabled: true,
        description: 'Daily active users drop by 20% or more',
      },
      {
        id: 'runway_critical',
        name: 'Runway Critical',
        metric: 'financial.runway',
        condition: 'lt',
        threshold: 6, // 6 months
        comparisonPeriod: 'month',
        severity: 'critical',
        cooldown: 1440, // 24 hours
        enabled: true,
        description: 'Runway drops below 6 months',
      },
    ];
  }

  private startMonitoring(): void {
    // Check every 2 minutes
    this.checkInterval = setInterval(() => {
      this.performAlertChecks();
    }, 2 * 60 * 1000);
  }

  private async performAlertChecks(): Promise<void> {
    try {
      // Check performance alerts
      await this.checkPerformanceAlerts();

      // Check business alerts
      await this.checkBusinessAlerts();

      // Update baselines
      if (this.config.autoTuning) {
        await this.updateBaselines();
      }

      // Clean up resolved alerts
      this.cleanupResolvedAlerts();

    } catch (error) {
      console.error('Error during alert checks:', error);
    }
  }

  private async checkPerformanceAlerts(): Promise<void> {
    // This would integrate with actual performance monitoring systems
    // For now, we'll simulate with mock data
    const performanceMetrics = await this.getCurrentPerformanceMetrics();

    for (const rule of this.performanceRules) {
      if (!rule.enabled) continue;

      const currentValue = performanceMetrics[rule.metric];
      if (currentValue === undefined) continue;

      const isTriggered = this.evaluateCondition(currentValue, rule.condition, rule.threshold);

      if (isTriggered) {
        await this.triggerPerformanceAlert(rule, currentValue, performanceMetrics);
      }
    }
  }

  private async checkBusinessAlerts(): Promise<void> {
    const businessMetrics = await businessMetricsService.getMetrics();

    for (const rule of this.businessRules) {
      if (!rule.enabled) continue;

      const currentValue = this.getBusinessMetricValue(businessMetrics, rule.metric);
      if (currentValue === null) continue;

      let isTriggered = false;

      if (rule.condition === 'pct_change') {
        const baselineValue = await this.getBaselineValue(rule.metric, rule.comparisonPeriod);
        if (baselineValue !== null) {
          const pctChange = ((currentValue - baselineValue) / baselineValue) * 100;
          isTriggered = Math.abs(pctChange) >= Math.abs(rule.threshold);
        }
      } else {
        isTriggered = this.evaluateCondition(currentValue, rule.condition, rule.threshold);
      }

      if (isTriggered) {
        await this.triggerBusinessAlert(rule, currentValue, businessMetrics);
      }
    }
  }

  private async triggerPerformanceAlert(
    rule: PerformanceAlertRule,
    currentValue: number,
    context: Record<string, unknown>
  ): Promise<void> {
    const alertId = `perf_${rule.id}_${Date.now()}`;

    // Check if alert is already active
    if (this.activeAlerts.has(alertId)) return;

    const alert: AlertHistory = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      triggeredAt: new Date().toISOString(),
      context,
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Send alert
    await alertingService.triggerAlert(
      'performance',
      rule.severity,
      rule.name,
      rule.description,
      {
        metric: rule.metric,
        currentValue,
        threshold: rule.threshold,
        ruleId: rule.id,
        context,
      }
    );

    console.log(`🚨 Performance alert triggered: ${rule.name} (${currentValue} ${rule.condition} ${rule.threshold})`);
  }

  private async triggerBusinessAlert(
    rule: BusinessAlertRule,
    currentValue: number,
    context: Record<string, unknown>
  ): Promise<void> {
    const alertId = `biz_${rule.id}_${Date.now()}`;

    // Check if alert is already active
    if (this.activeAlerts.has(alertId)) return;

    const alert: AlertHistory = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      triggeredAt: new Date().toISOString(),
      context,
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Send alert
    await alertingService.triggerAlert(
      'business',
      rule.severity,
      rule.name,
      rule.description,
      {
        metric: rule.metric,
        currentValue,
        threshold: rule.threshold,
        ruleId: rule.id,
        context,
      }
    );

    console.log(`🚨 Business alert triggered: ${rule.name} (${currentValue})`);
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'ne': return value !== threshold;
      default: return false;
    }
  }

  private getBusinessMetricValue(metrics: any, path: string): number | null {
    const keys = path.split('.');
    let value = metrics;

    for (const key of keys) {
      value = value?.[key];
    }

    return typeof value === 'number' ? value : null;
  }

  private async getCurrentPerformanceMetrics(): Promise<Record<string, number>>> {
    // This would integrate with actual monitoring systems
    // Mock data for demonstration
    return {
      response_time: Math.random() * 3000 + 500, // 500-3500ms
      error_rate: Math.random() * 2, // 0-2%
      throughput: Math.random() * 1000 + 500, // 500-1500 req/sec
      cpu: Math.random() * 40 + 30, // 30-70%
      memory: Math.random() * 30 + 40, // 40-70%
      disk: Math.random() * 20 + 50, // 50-70%
      network: Math.random() * 100 + 200, // 200-300 Mbps
    };
  }

  private async getBaselineValue(metric: string, period: string): Promise<number | null> {
    const baselineData = this.baselines.get(metric);
    if (!baselineData || baselineData.length === 0) return null;

    // Calculate baseline based on period
    const periods = {
      hour: 1,
      day: 24,
      week: 168,
      month: 720, // 30 days
    };

    const hours = periods[period as keyof typeof periods] || 24;
    const dataPoints = Math.min(baselineData.length, hours);

    if (dataPoints === 0) return null;

    // Return average of last N data points
    const recentData = baselineData.slice(-dataPoints);
    return recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
  }

  private async updateBaselines(): Promise<void> {
    const metrics = await this.getCurrentPerformanceMetrics();

    for (const [metric, value] of Object.entries(metrics)) {
      if (!this.baselines.has(metric)) {
        this.baselines.set(metric, []);
      }

      const data = this.baselines.get(metric)!;
      data.push(value);

      // Keep only last 7 days of data (168 hours)
      if (data.length > 168) {
        data.shift();
      }
    }
  }

  private cleanupResolvedAlerts(): void {
    const now = new Date();

    // Mark alerts as resolved after 1 hour if no longer triggered
    for (const [alertId, alert] of this.activeAlerts) {
      const ageMinutes = (now.getTime() - new Date(alert.triggeredAt).getTime()) / (1000 * 60);

      if (ageMinutes > 60) { // 1 hour
        alert.resolvedAt = now.toISOString();
        alert.duration = ageMinutes;
        this.activeAlerts.delete(alertId);
      }
    }

    // Keep only last 1000 alerts in history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
  }

  private async loadHistoricalData(): Promise<void> {
    // Load historical data for baseline calculation
    // This would load from persistent storage
    console.log('Loading historical alert data...');
  }

  // Public API methods
  addPerformanceRule(rule: PerformanceAlertRule): void {
    this.performanceRules.push(rule);
  }

  addBusinessRule(rule: BusinessAlertRule): void {
    this.businessRules.push(rule);
  }

  updateRule(ruleId: string, updates: Partial<PerformanceAlertRule | BusinessAlertRule>): void {
    // Update performance rules
    const perfIndex = this.performanceRules.findIndex(r => r.id === ruleId);
    if (perfIndex !== -1) {
      this.performanceRules[perfIndex] = { ...this.performanceRules[perfIndex], ...updates };
      return;
    }

    // Update business rules
    const bizIndex = this.businessRules.findIndex(r => r.id === ruleId);
    if (bizIndex !== -1) {
      this.businessRules[bizIndex] = { ...this.businessRules[bizIndex], ...updates };
    }
  }

  removeRule(ruleId: string): void {
    this.performanceRules = this.performanceRules.filter(r => r.id !== ruleId);
    this.businessRules = this.businessRules.filter(r => r.id !== ruleId);
  }

  getActiveAlerts(): AlertHistory[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(hours: number = 24): AlertHistory[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert =>
      new Date(alert.triggeredAt) > cutoff
    );
  }

  getRules(): { performance: PerformanceAlertRule[]; business: BusinessAlertRule[] } {
    return {
      performance: this.performanceRules,
      business: this.businessRules,
    };
  }

  async getAlertAnalytics(): Promise<any> => {
    const history = this.getAlertHistory(168); // Last 7 days

    return {
      totalAlerts: history.length,
      bySeverity: {
        critical: history.filter(a => a.severity === 'critical').length,
        high: history.filter(a => a.severity === 'high').length,
        medium: history.filter(a => a.severity === 'medium').length,
        low: history.filter(a => a.severity === 'low').length,
      },
      byType: {
        performance: history.filter(a => a.ruleId.startsWith('perf_')).length,
        business: history.filter(a => a.ruleId.startsWith('biz_')).length,
      },
      averageResolutionTime: this.calculateAverageResolutionTime(history),
      mostTriggeredRules: this.getMostTriggeredRules(history),
    };
  }

  private calculateAverageResolutionTime(alerts: AlertHistory[]): number {
    const resolvedAlerts = alerts.filter(a => a.resolvedAt && a.duration);
    if (resolvedAlerts.length === 0) return 0;

    const totalDuration = resolvedAlerts.reduce((sum, a) => sum + (a.duration || 0), 0);
    return totalDuration / resolvedAlerts.length;
  }

  private getMostTriggeredRules(alerts: AlertHistory[]): Array<{ ruleId: string; count: number }> {
    const ruleCounts: Record<string, number> = {};

    alerts.forEach(alert => {
      ruleCounts[alert.ruleId] = (ruleCounts[alert.ruleId] || 0) + 1;
    });

    return Object.entries(ruleCounts)
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Default configuration
export const defaultSmartAlertConfig: SmartAlertConfig = {
  enabled: true,
  machineLearning: false,
  seasonalAdjustment: true,
  baselinePeriod: 7,
  sensitivity: 'medium',
  autoTuning: true,
};

export const advancedAlertingService = new AdvancedAlertingService(defaultSmartAlertConfig);
