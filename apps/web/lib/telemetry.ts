import { createBrowserClient } from '@ghxstship/auth';

type TelemetryProperties = Record<string, unknown>;

export interface TelemetryEvent {
  event: string;
  properties?: TelemetryProperties;
  userId?: string;
  organizationId?: string;
  timestamp?: string;
}

export interface TelemetryContext {
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  referrer?: string;
}

class TelemetryService {
  private context: TelemetryContext = {};
  private queue: TelemetryEvent[] = [];
  private isInitialized = false;
  private supabase = createBrowserClient();

  async initialize(context: Partial<TelemetryContext>): Promise<void> {
    this.context = { ...this.context, ...context };
    this.isInitialized = true;

    // Process any queued events
    await this.flushQueue();

    // Set up automatic context updates
    if (typeof window !== 'undefined') {
      this.context.userAgent = navigator.userAgent;
      this.context.sessionId = this.generateSessionId();
    }
  }

  async track(event: string, properties: TelemetryProperties = {}): Promise<void> {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties: {
        ...properties,
        ...this.getContextProperties()
      },
      userId: this.context.userId,
      organizationId: this.context.organizationId,
      timestamp: new Date().toISOString()
    };

    if (!this.isInitialized) {
      this.queue.push(telemetryEvent);
      return;
    }

    await this.sendEvent(telemetryEvent);
  }

  async identify(userId: string, traits: TelemetryProperties = {}): Promise<void> {
    this.context.userId = userId;
    
    await this.track('User Identified', {
      userId,
      ...traits
    });
  }

  async page(name: string, properties: TelemetryProperties = {}): Promise<void> {
    await this.track('Page Viewed', {
      page: name,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      ...properties
    });
  }

  async error(error: Error, context: TelemetryProperties = {}): Promise<void> {
    await this.track('Error Occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    });
  }

  private async sendEvent(event: TelemetryEvent): Promise<void> {
    try {
      // Store in Supabase audit_logs table
      const { error } = await this.supabase
        .from('audit_logs')
        .insert({
          action: event.event,
          resource_type: 'telemetry',
          resource_id: null,
          user_id: event.userId,
          organization_id: event.organizationId,
          metadata: event.properties,
          occurred_at: event.timestamp
        });

      if (error) {
        console.error('Failed to send telemetry event:', error);
      }

      // Also send to external analytics if configured
      if (typeof window !== 'undefined') {
        const analytics = (window as unknown as {
          analytics?: { track: (name: string, props?: TelemetryProperties) => void };
        }).analytics;

        analytics?.track(event.event, event.properties);
      }
    } catch (error) {
      console.error('Telemetry error:', error);
    }
  }

  private async flushQueue(): Promise<void> {
    const events = [...this.queue];
    this.queue = [];

    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  private getContextProperties(): TelemetryProperties {
    const properties: TelemetryProperties = {};

    if (typeof window !== 'undefined') {
      properties.url = window.location.href;
      properties.pathname = window.location.pathname;
      properties.search = window.location.search;
      properties.referrer = document.referrer;
      properties.userAgent = navigator.userAgent;
      properties.language = navigator.language;
      properties.screenResolution = `${screen.width}x${screen.height}`;
      properties.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
      properties.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    return properties;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Performance tracking
  async trackPerformance(metric: string, value: number, unit = 'ms'): Promise<void> {
    await this.track('Performance Metric', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  // Feature usage tracking
  async trackFeatureUsage(feature: string, action: string, metadata: TelemetryProperties = {}): Promise<void> {
    await this.track('Feature Used', {
      feature,
      action,
      ...metadata
    });
  }

  // Business metrics tracking
  async trackBusinessMetric(metric: string, value: number, metadata: TelemetryProperties = {}): Promise<void> {
    await this.track('Business Metric', {
      metric,
      value,
      ...metadata
    });
  }
}

// Global telemetry instance
export const telemetry = new TelemetryService();

// React hook for telemetry
export function useTelemetry() {
  return {
    track: telemetry.track.bind(telemetry),
    identify: telemetry.identify.bind(telemetry),
    page: telemetry.page.bind(telemetry),
    error: telemetry.error.bind(telemetry),
    trackPerformance: telemetry.trackPerformance.bind(telemetry),
    trackFeatureUsage: telemetry.trackFeatureUsage.bind(telemetry),
    trackBusinessMetric: telemetry.trackBusinessMetric.bind(telemetry)
  };
}

// Utility functions for common tracking patterns
export const trackModuleAction = (module: string, action: string, metadata: TelemetryProperties = {}) => {
  return telemetry.track(`${module} ${action}`, {
    module,
    action,
    ...metadata
  });
};

export const trackDrawerInteraction = (drawer: string, action: 'opened' | 'closed' | 'tab_changed', metadata: TelemetryProperties = {}) => {
  return telemetry.track('Drawer Interaction', {
    drawer,
    action,
    ...metadata
  });
};

export const trackFormSubmission = (form: string, success: boolean, metadata: TelemetryProperties = {}) => {
  return telemetry.track('Form Submission', {
    form,
    success,
    ...metadata
  });
};

export const trackSearchQuery = (module: string, query: string, resultsCount: number) => {
  return telemetry.track('Search Query', {
    module,
    query: query.length > 0 ? 'non_empty' : 'empty', // Don't log actual search terms for privacy
    queryLength: query.length,
    resultsCount
  });
};

export const trackDemoDataLoad = (module: string, organizationId: string) => {
  return telemetry.track('Demo Data Loaded', {
    module,
    organizationId
  });
};

// Initialize telemetry when module loads
if (typeof window !== 'undefined') {
  // Auto-initialize with basic context
  void telemetry.initialize({
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
}
