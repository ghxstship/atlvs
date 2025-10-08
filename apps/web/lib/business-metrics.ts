/**
 * Business Metrics Tracking Service
 * Comprehensive business intelligence and KPI monitoring
 */

export interface BusinessMetrics {
  revenue: RevenueMetrics;
  conversion: ConversionMetrics;
  userEngagement: UserEngagementMetrics;
  product: ProductMetrics;
  financial: FinancialMetrics;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  revenueByPlan: Record<string, number>;
  revenueByRegion: Record<string, number>;
  revenueGrowth: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  churnRate: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
}

export interface ConversionMetrics {
  visitorToLead: number;
  leadToCustomer: number;
  freeToPaid: number;
  trialToPaid: number;
  cartAbandonmentRate: number;
  checkoutConversion: number;
  funnelDropOff: Record<string, number>;
}

export interface UserEngagementMetrics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  sessionDuration: number;
  pageViewsPerSession: number;
  bounceRate: number;
  retentionRate: {
    day1: number;
    day7: number;
    day30: number;
  };
  featureUsage: Record<string, number>;
}

export interface ProductMetrics {
  totalOrganizations: number;
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  moduleAdoption: Record<string, number>;
  featureUsage: Record<string, {
    total: number;
    active: number;
    adoption: number;
  }>;
  apiUsage: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export interface FinancialMetrics {
  grossMargin: number;
  netMargin: number;
  burnRate: number;
  runway: number; // months
  customerPaybackPeriod: number;
  operatingExpenses: Record<string, number>;
  costPerAcquisition: number;
}

export interface MetricThreshold {
  metric: string;
  warning: number;
  critical: number;
  comparison: 'gt' | 'lt' | 'eq';
}

export interface BusinessAlert {
  id: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
}

class BusinessMetricsService {
  private metrics: BusinessMetrics | null = null;
  private thresholds: MetricThreshold[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeThresholds();
  }

  async initialize(): Promise<void> {
    console.log('📊 Business metrics service initialized');

    // Update metrics every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 5 * 60 * 1000);

    // Initial update
    await this.updateMetrics();
  }

  async destroy(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async getMetrics(): Promise<BusinessMetrics> {
    if (!this.metrics) {
      await this.updateMetrics();
    }
    return this.metrics!;
  }

  async updateMetrics(): Promise<void> {
    try {
      const [
        revenueMetrics,
        conversionMetrics,
        userEngagementMetrics,
        productMetrics,
        financialMetrics,
      ] = await Promise.all([
        this.calculateRevenueMetrics(),
        this.calculateConversionMetrics(),
        this.calculateUserEngagementMetrics(),
        this.calculateProductMetrics(),
        this.calculateFinancialMetrics(),
      ]);

      this.metrics = {
        revenue: revenueMetrics,
        conversion: conversionMetrics,
        userEngagement: userEngagementMetrics,
        product: productMetrics,
        financial: financialMetrics
      };

      // Check for alerts
      await this.checkThresholds();

      console.log('📊 Business metrics updated');
    } catch (error) {
      console.error('Failed to update business metrics:', error);
    }
  }

  private async calculateRevenueMetrics(): Promise<RevenueMetrics> {
    // This would integrate with Stripe and database queries
    // For now, return mock data structure
    return {
      totalRevenue: 125000,
      monthlyRecurringRevenue: 8500,
      annualRecurringRevenue: 102000,
      averageRevenuePerUser: 125,
      revenueByPlan: {
        starter: 15000,
        professional: 45000,
        enterprise: 65000
      },
      revenueByRegion: {
        'US': 75000,
        'EU': 35000,
        'APAC': 15000
      },
      revenueGrowth: {
        monthly: 12.5,
        quarterly: 8.3,
        yearly: 45.2
      },
      churnRate: 2.1,
      customerLifetimeValue: 1500,
      customerAcquisitionCost: 250
    };
  }

  private async calculateConversionMetrics(): Promise<ConversionMetrics> {
    return {
      visitorToLead: 0.032, // 3.2%
      leadToCustomer: 0.085, // 8.5%
      freeToPaid: 0.025, // 2.5%
      trialToPaid: 0.15, // 15%
      cartAbandonmentRate: 0.68, // 68%
      checkoutConversion: 0.42, // 42%
      funnelDropOff: {
        landing: 0.7,
        signup: 0.85,
        onboarding: 0.95,
        first_payment: 0.42
      }
    };
  }

  private async calculateUserEngagementMetrics(): Promise<UserEngagementMetrics> {
    return {
      dailyActiveUsers: 1250,
      monthlyActiveUsers: 8500,
      sessionDuration: 12.5, // minutes
      pageViewsPerSession: 8.3,
      bounceRate: 0.32, // 32%
      retentionRate: {
        day1: 0.85,
        day7: 0.65,
        day30: 0.42
      },
      featureUsage: {
        dashboard: 0.95,
        projects: 0.78,
        finance: 0.65,
        people: 0.58,
        jobs: 0.45
      }
    };
  }

  private async calculateProductMetrics(): Promise<ProductMetrics> {
    return {
      totalOrganizations: 450,
      totalUsers: 1200,
      activeProjects: 320,
      completedProjects: 180,
      moduleAdoption: {
        dashboard: 0.98,
        projects: 0.85,
        finance: 0.72,
        people: 0.68,
        jobs: 0.55,
        marketplace: 0.35,
        companies: 0.42
      },
      featureUsage: {
        file_upload: { total: 5000, active: 4500, adoption: 0.9 },
        real_time_updates: { total: 8000, active: 7500, adoption: 0.94 },
        bulk_actions: { total: 3000, active: 2800, adoption: 0.93 },
        advanced_search: { total: 6000, active: 5200, adoption: 0.87 },
        export_import: { total: 2500, active: 2300, adoption: 0.92 }
      },
      apiUsage: {
        totalRequests: 2500000,
        averageResponseTime: 145,
        errorRate: 0.002, // 0.2%
      }
    };
  }

  private async calculateFinancialMetrics(): Promise<FinancialMetrics> {
    return {
      grossMargin: 0.75, // 75%
      netMargin: 0.15, // 15%
      burnRate: 25000, // $25k/month
      runway: 18, // 18 months
      customerPaybackPeriod: 16, // months
      operatingExpenses: {
        engineering: 15000,
        marketing: 8000,
        operations: 5000,
        sales: 12000,
        other: 3000
      },
      costPerAcquisition: 250
    };
  }

  private initializeThresholds(): void {
    this.thresholds = [
      { metric: 'revenue.monthlyRecurringRevenue', warning: 8000, critical: 7000, comparison: 'lt' },
      { metric: 'conversion.checkoutConversion', warning: 0.35, critical: 0.30, comparison: 'lt' },
      { metric: 'userEngagement.dailyActiveUsers', warning: 1000, critical: 800, comparison: 'lt' },
      { metric: 'product.apiUsage.errorRate', warning: 0.005, critical: 0.01, comparison: 'gt' },
      { metric: 'financial.runway', warning: 12, critical: 6, comparison: 'lt' },
      { metric: 'business.churnRate', warning: 3.0, critical: 5.0, comparison: 'gt' },
    ];
  }

  private async checkThresholds(): Promise<void> {
    if (!this.metrics) return;

    const alerts: BusinessAlert[] = [];

    for (const threshold of this.thresholds) {
      const currentValue = this.getMetricValue(threshold.metric);

      if (currentValue === null) continue;

      let severity: 'warning' | 'critical' | null = null;

      if (threshold.comparison === 'gt' && currentValue > threshold.critical) {
        severity = 'critical';
      } else if (threshold.comparison === 'gt' && currentValue > threshold.warning) {
        severity = 'warning';
      } else if (threshold.comparison === 'lt' && currentValue < threshold.critical) {
        severity = 'critical';
      } else if (threshold.comparison === 'lt' && currentValue < threshold.warning) {
        severity = 'warning';
      }

      if (severity) {
        alerts.push({
          id: `business_alert_${Date.now()}_${threshold.metric}`,
          metric: threshold.metric,
          currentValue,
          threshold: severity === 'critical' ? threshold.critical : threshold.warning,
          severity,
          message: `${threshold.metric} is ${severity}: ${currentValue} ${threshold.comparison === 'gt' ? '>' : '<'} ${severity === 'critical' ? threshold.critical : threshold.warning}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Send alerts if any
    for (const alert of alerts) {
      await this.triggerBusinessAlert(alert);
    }
  }

  private getMetricValue(metricPath: string): number | null {
    if (!this.metrics) return null;

    const path = metricPath.split('.');
    let value: any = this.metrics;

    for (const key of path) {
      value = value?.[key];
    }

    return typeof value === 'number' ? value : null;
  }

  private async triggerBusinessAlert(alert: BusinessAlert): Promise<void> {
    // Import alerting service dynamically to avoid circular dependency
    const { alertingService } = await import('./alerting');

    await alertingService.triggerAlert(
      'business',
      alert.severity,
      `Business Metric Alert: ${alert.metric}`,
      alert.message,
      {
        metric: alert.metric,
        currentValue: alert.currentValue,
        threshold: alert.threshold,
        metadata: alert
      }
    );
  }

  async getRevenueReport(period: 'month' | 'quarter' | 'year' = 'month'): Promise<any> {
    // Generate detailed revenue reports
    const metrics = await this.getMetrics();
    return {
      period,
      data: metrics.revenue,
      trends: await this.calculateRevenueTrends(period),
      forecasts: await this.generateRevenueForecasts()
    };
  }

  async getConversionFunnel(): Promise<any> {
    const metrics = await this.getMetrics();
    return {
      stages: [
        { name: 'Visitors', count: 10000, conversion: 1.0 },
        { name: 'Leads', count: 320, conversion: metrics.conversion.visitorToLead },
        { name: 'Customers', count: 27, conversion: metrics.conversion.leadToCustomer },
      ],
      dropOffPoints: metrics.conversion.funnelDropOff
    };
  }

  async getKPIDashboard(): Promise<any> {
    const metrics = await this.getMetrics();

    return {
      primary: {
        mrr: metrics.revenue.monthlyRecurringRevenue,
        churn: metrics.revenue.churnRate,
        dau: metrics.userEngagement.dailyActiveUsers,
        conversion: metrics.conversion.checkoutConversion
      },
      secondary: {
        ltv: metrics.revenue.customerLifetimeValue,
        cac: metrics.revenue.customerAcquisitionCost,
        retention: metrics.userEngagement.retentionRate,
        runway: metrics.financial.runway
      },
      trends: await this.calculateKPITrends()
    };
  }

  private async calculateRevenueTrends(period: string): Promise<any> {
    // Calculate revenue trends over time
    return {
      growth: 12.5,
      projected: 9500,
      historical: [8000, 8200, 8500, 8800, 9200, 9500]
    };
  }

  private async generateRevenueForecasts(): Promise<any> {
    return {
      conservative: 105000,
      realistic: 118000,
      optimistic: 135000,
      confidence: 0.85
    };
  }

  private async calculateKPITrends(): Promise<any> {
    return {
      mrr: { current: 8500, change: 12.5, trend: 'up' },
      churn: { current: 2.1, change: -0.3, trend: 'down' },
      dau: { current: 1250, change: 8.2, trend: 'up' },
      conversion: { current: 42, change: 2.1, trend: 'up' }
    };
  }
}

export const businessMetricsService = new BusinessMetricsService();
