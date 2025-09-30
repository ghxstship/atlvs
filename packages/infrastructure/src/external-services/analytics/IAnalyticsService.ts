/**
 * Analytics Service Interface - Adapter Pattern
 * Abstracts analytics provider implementation (Google Analytics, Mixpanel, etc.)
 */

export enum EventCategory {
  USER = 'user',
  NAVIGATION = 'navigation',
  INTERACTION = 'interaction',
  TRANSACTION = 'transaction',
  ERROR = 'error',
  PERFORMANCE = 'performance',
}

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
}

export interface AnalyticsUser {
  userId: string;
  email?: string;
  name?: string;
  organizationId?: string;
  properties?: Record<string, unknown>;
}

export interface AnalyticsPageView {
  path: string;
  title?: string;
  referrer?: string;
  userId?: string;
  properties?: Record<string, unknown>;
}

export interface IAnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackPageView(pageView: AnalyticsPageView): Promise<void>;
  identifyUser(user: AnalyticsUser): Promise<void>;
  setUserProperties(userId: string, properties: Record<string, unknown>): Promise<void>;
  flush(): Promise<void>;
}
