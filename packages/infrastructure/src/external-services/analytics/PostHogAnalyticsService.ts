/**
 * PostHog Analytics Service Implementation
 * Implements IAnalyticsService using PostHog
 */

import {
  IAnalyticsService,
  AnalyticsEvent,
  AnalyticsUser,
  AnalyticsPageView,
  EventCategory,
} from './IAnalyticsService';

export interface PostHogConfig {
  apiKey: string;
  host?: string;
  flushAt?: number;
  flushInterval?: number;
}

export class PostHogAnalyticsService implements IAnalyticsService {
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(private readonly config: PostHogConfig) {
    // Set up auto-flush
    if (config.flushInterval) {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, config.flushInterval);
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.eventQueue.push(event);

    // Auto-flush if queue is full
    if (this.eventQueue.length >= (this.config.flushAt || 20)) {
      await this.flush();
    }
  }

  async trackPageView(pageView: AnalyticsPageView): Promise<void> {
    await this.trackEvent({
      name: '$pageview',
      category: EventCategory.NAVIGATION,
      properties: {
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        ...pageView.properties,
      },
      userId: pageView.userId,
      timestamp: new Date(),
    });
  }

  async identifyUser(user: AnalyticsUser): Promise<void> {
    await this.trackEvent({
      name: '$identify',
      category: EventCategory.USER,
      properties: {
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        ...user.properties,
      },
      userId: user.userId,
      timestamp: new Date(),
    });
  }

  async setUserProperties(userId: string, properties: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      name: '$set',
      category: EventCategory.USER,
      properties,
      userId,
      timestamp: new Date(),
    });
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // In production, send to PostHog API
      // await fetch(`${this.config.host || 'https://app.posthog.com'}/batch/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     api_key: this.config.apiKey,
      //     batch: events.map(e => ({
      //       event: e.name,
      //       properties: e.properties,
      //       distinct_id: e.userId,
      //       timestamp: e.timestamp,
      //     })),
      //   }),
      // });

      // Mock implementation
      console.log(`[Analytics] Flushed ${events.length} events`);
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
      console.error('[Analytics] Failed to flush events:', error);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    void this.flush();
  }
}
