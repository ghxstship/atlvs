// ==========================================
// MARKETING ANALYTICS UTILITY
// ==========================================
// Centralized analytics tracking for marketing funnel interactions
// Provides type-safe event tracking with privacy and performance considerations

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
  session_id: string;
  user_id?: string;
  page: string;
  device_type: string;
  user_agent: string;
}

export interface MarketingInteractionEvent extends AnalyticsEvent {
  component: string;
  action: string;
  variant?: string;
  interaction_duration?: number;
  success?: boolean;
  error_message?: string;
}

export class MarketingAnalytics {
  private static instance: MarketingAnalytics;
  private initialized = false;
  private consent = {
    analytics: false,
    performance: false,
    marketing: false,
  };

  private constructor() {}

  static getInstance(): MarketingAnalytics {
    if (!MarketingAnalytics.instance) {
      MarketingAnalytics.instance = new MarketingAnalytics();
    }
    return MarketingAnalytics.instance;
  }

  // Initialize analytics with user consent
  initialize(consent: typeof this.consent): void {
    this.consent = consent;
    this.initialized = true;

    // Check for Do Not Track
    if (this.shouldRespectDoNotTrack()) {
      this.consent = { analytics: false, performance: false, marketing: false };
    }

    if (this.consent.performance) {
      this.initializePerformanceTracking();
    }
  }

  // Core tracking method
  track(eventName: string, properties: Record<string, unknown> = {}): void {
    if (!this.initialized || !this.consent.analytics) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      session_id: this.getSessionId(),
      user_id: this.getUserId(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      device_type: this.getDeviceType(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // Use existing PostHog analytics
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event.name, event.properties);
    }

    // Store locally for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Marketing Analytics Event:', event);
    }
  }

  // Specialized marketing interaction tracking
  trackMarketingInteraction(
    component: string,
    action: string,
    properties: Record<string, unknown> = {}
  ): void {
    const eventName = `marketing.${component}.${action}`;

    this.track(eventName, {
      component_type: component,
      interaction_type: action,
      ...properties,
    });
  }

  // Component-specific tracking methods
  trackCardInteraction(
    cardId: string,
    action: 'hover' | 'click' | 'focus' | 'blur',
    properties: {
      variant?: string;
      position?: number;
      content_id?: string;
      interaction_duration?: number;
      destination?: string;
    } = {}
  ): void {
    this.trackMarketingInteraction('card', action, {
      card_id: cardId,
      ...properties,
    });
  }

  trackCTAInteraction(
    buttonText: string,
    action: 'click' | 'hover' | 'focus',
    properties: {
      variant?: string;
      destination?: string;
      user_intent?: string;
      conversion_value?: number;
      page?: string;
      section?: string;
    } = {}
  ): void {
    this.trackMarketingInteraction('cta', action, {
      button_text: buttonText,
      user_intent: properties.user_intent || this.inferIntent(buttonText),
      ...properties,
    });
  }

  trackFormInteraction(
    formId: string,
    action: 'start' | 'field_focus' | 'field_blur' | 'validation_error' | 'submit',
    properties: {
      field_name?: string;
      field_value_length?: number;
      validation_state?: 'valid' | 'invalid' | 'pending';
      error_message?: string;
      success?: boolean;
      time_to_complete?: number;
    } = {}
  ): void {
    this.trackMarketingInteraction('form', action, {
      form_id: formId,
      ...properties,
    });
  }

  trackPerformanceMetric(
    metric: 'lcp' | 'fid' | 'cls' | 'inp' | 'fcp' | 'ttfb',
    value: number,
    properties: {
      rating?: 'good' | 'needs-improvement' | 'poor';
      device_type?: string;
      connection_type?: string;
    } = {}
  ): void {
    this.track('performance.metric', {
      metric_name: metric,
      metric_value: value,
      rating: properties.rating || this.calculatePerformanceRating(metric, value),
    });
  }

  trackUXSignal(
    signal: 'rage_click' | 'error_interaction' | 'slow_interaction' | 'scroll_bounce',
    properties: {
      element?: string;
      click_count?: number;
      time_window?: number;
      frustration_level?: number;
      page?: string;
    } = {}
  ): void {
    this.track('ux.signal', {
      signal_type: signal,
      ...properties,
    });
  }

  // Utility methods
  private getSessionId(): string {
    if (typeof sessionStorage === 'undefined') return 'server_session';

    let sessionId = sessionStorage.getItem('atlvs_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('atlvs_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    return localStorage.getItem('atlvs_user_id') || undefined;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'server';

    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private shouldRespectDoNotTrack(): boolean {
    if (typeof navigator === 'undefined') return false;

    return navigator.doNotTrack === '1' ||
           (typeof window !== 'undefined' && (window as Window & { doNotTrack?: string }).doNotTrack === '1');
  }

  private inferIntent(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('start') || lowerText.includes('begin') || lowerText.includes('trial')) {
      return 'trial_signup';
    }
    if (lowerText.includes('demo') || lowerText.includes('book') || lowerText.includes('schedule')) {
      return 'demo_request';
    }
    if (lowerText.includes('contact') || lowerText.includes('talk') || lowerText.includes('speak')) {
      return 'contact_sales';
    }
    if (lowerText.includes('learn') || lowerText.includes('more') || lowerText.includes('read')) {
      return 'learn_more';
    }
    return 'general_cta';
  }

  private calculatePerformanceRating(metric: string, value: number): string {
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      case 'inp':
        return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  }

  private initializePerformanceTracking(): void {
    // Set up Web Vitals tracking
    if (typeof window !== 'undefined') {
      this.trackWebVitals();
    }
  }

  private trackWebVitals(): void {
    // Import and initialize web-vitals library
    import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS((metric) => this.trackPerformanceMetric('cls', metric.value));
      onINP((metric) => this.trackPerformanceMetric('inp', metric.value)); // FID replaced by INP
      onFCP((metric) => this.trackPerformanceMetric('fcp', metric.value));
      onLCP((metric) => this.trackPerformanceMetric('lcp', metric.value));
      onTTFB((metric) => this.trackPerformanceMetric('ttfb', metric.value));
    }).catch(() => {
      // Graceful degradation if web-vitals is not available
    });
  }
}

// Global analytics instance
export const analytics = MarketingAnalytics.getInstance();

// React hook for analytics (simplified for now)
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackMarketingInteraction: analytics.trackMarketingInteraction.bind(analytics),
    trackCardInteraction: analytics.trackCardInteraction.bind(analytics),
    trackCTAInteraction: analytics.trackCTAInteraction.bind(analytics),
    trackFormInteraction: analytics.trackFormInteraction.bind(analytics),
  };
}

// Type declarations for external libraries
declare global {
  interface Window {
    posthog?: {
      capture: (name: string, properties: Record<string, unknown>) => void;
    };
    mixpanel?: {
      track: (name: string, properties: Record<string, unknown>) => void;
    };
    gtag?: (...args: unknown[]) => void;
  }
}
