/**
 * Real User Monitoring (RUM) Service
 * Session recording and user journey analytics
 */

export interface SessionRecording {
  sessionId: string;
  userId?: string;
  organizationId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  events: UserEvent[];
  metadata: {
    referrer?: string;
    landingPage: string;
    exitPage?: string;
    pagesViewed: number;
    interactions: number;
    errors: number;
    performance: SessionPerformance;
  };
}

export interface UserEvent {
  timestamp: string;
  type: EventType;
  data: Record<string, unknown>;
  url?: string;
  element?: ElementInfo;
  performance?: PerformanceData;
}

export type EventType =
  | 'page_view'
  | 'click'
  | 'input'
  | 'scroll'
  | 'error'
  | 'performance'
  | 'rage_click'
  | 'dead_click'
  | 'custom';

export interface ElementInfo {
  tagName: string;
  className?: string;
  id?: string;
  textContent?: string;
  xpath?: string;
  boundingRect?: DOMRect;
}

export interface PerformanceData {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

export interface SessionPerformance {
  averageLCP: number;
  averageFID: number;
  averageCLS: number;
  slowestPage: string;
  errorRate: number;
}

export interface UserJourney {
  userId: string;
  sessions: SessionRecording[];
  journey: {
    entryPoint: string;
    path: string[];
    conversions: ConversionEvent[];
    dropOffs: DropOffPoint[];
    timeToConversion?: number;
  };
  insights: UserInsight[];
}

export interface ConversionEvent {
  type: string;
  timestamp: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface DropOffPoint {
  page: string;
  reason: 'error' | 'timeout' | 'exit' | 'rage_click';
  timestamp: string;
}

export interface UserInsight {
  type: 'friction' | 'opportunity' | 'bug' | 'ux_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  page: string;
  timestamp: string;
  recommendation?: string;
}

export interface RUMConfig {
  enabled: boolean;
  sampleRate: number; // 0.0 to 1.0
  maxSessionDuration: number; // minutes
  maxEventsPerSession: number;
  captureClicks: boolean;
  captureInputs: boolean;
  captureScroll: boolean;
  captureErrors: boolean;
  capturePerformance: boolean;
  maskSensitiveData: boolean;
  excludedUrls: string[];
  privacySettings: PrivacySettings;
}

export interface PrivacySettings {
  maskPasswords: boolean;
  maskEmails: boolean;
  maskCreditCards: boolean;
  maskPersonalInfo: boolean;
  allowedDomains: string[];
}

class RUMService {
  private config: RUMConfig;
  private currentSession: SessionRecording | null = null;
  private eventQueue: UserEvent[] = [];
  private isInitialized = false;

  constructor(config: RUMConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled || typeof window === 'undefined') return;

    try {
      this.startSession();
      this.attachEventListeners();
      this.initializePerformanceMonitoring();

      this.isInitialized = true;
      console.log('👁️ RUM service initialized');
    } catch (error) {
      console.error('Failed to initialize RUM service:', error);
    }
  }

  private startSession(): void {
    const sessionId = this.generateSessionId();

    this.currentSession = {
      sessionId,
      userId: this.getUserId(),
      organizationId: this.getOrganizationId(),
      startTime: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      events: [],
      metadata: {
        landingPage: window.location.href,
        pagesViewed: 1,
        interactions: 0,
        errors: 0,
        performance: {
          averageLCP: 0,
          averageFID: 0,
          averageCLS: 0,
          slowestPage: '',
          errorRate: 0,
        },
      },
    };

    // Track page view
    this.trackEvent('page_view', {
      url: window.location.href,
      title: document.title,
    });

    // Set up session timeout
    setTimeout(() => {
      this.endSession();
    }, this.config.maxSessionDuration * 60 * 1000);
  }

  private attachEventListeners(): void {
    if (!this.config.captureClicks) return;

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        this.trackClick(event, target);
      }
    }, true);

    // Input tracking
    if (this.config.captureInputs) {
      document.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        if (target && (target.type === 'text' || target.type === 'email' || target.type === 'password')) {
          this.trackInput(event, target);
        }
      }, true);
    }

    // Scroll tracking
    if (this.config.captureScroll) {
      let scrollTimeout: NodeJS.Timeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScroll();
        }, 100);
      });
    }

    // Error tracking
    if (this.config.captureErrors) {
      window.addEventListener('error', (event) => {
        this.trackError(event);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackUnhandledRejection(event);
      });
    }

    // Page visibility tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched tabs or minimized
        this.trackEvent('visibility_hidden', {});
      } else {
        this.trackEvent('visibility_visible', {});
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private initializePerformanceMonitoring(): void {
    if (!this.config.capturePerformance) return;

    // Use Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackPerformance({
          lcp: lastEntry.startTime,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.trackPerformance({
            fid: entry.processingStart - entry.startTime,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackPerformance({ cls: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance({
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            ttfb: navigation.responseStart - navigation.requestStart,
          });
        }
      }, 0);
    });
  }

  private trackClick(event: MouseEvent, target: HTMLElement): void {
    const elementInfo = this.getElementInfo(target);

    // Detect rage clicks (multiple clicks in short time on same element)
    if (this.detectRageClick(elementInfo, event.timeStamp)) {
      this.trackEvent('rage_click', {
        element: elementInfo,
        clickCount: 3,
        timeWindow: 1000,
      });
      return;
    }

    // Detect dead clicks (clicks on non-interactive elements)
    if (this.isDeadClick(target)) {
      this.trackEvent('dead_click', {
        element: elementInfo,
        reason: 'non_interactive',
      });
      return;
    }

    this.trackEvent('click', {
      element: elementInfo,
      x: event.clientX,
      y: event.clientY,
    });
  }

  private trackInput(event: Event, target: HTMLInputElement): void {
    const value = this.config.maskSensitiveData && target.type === 'password'
      ? '***masked***'
      : target.value;

    this.trackEvent('input', {
      element: this.getElementInfo(target),
      inputType: target.type,
      valueLength: value.length,
      hasValue: value.length > 0,
    });
  }

  private trackScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;

    this.trackEvent('scroll', {
      scrollTop,
      scrollPercent: Math.round(scrollPercent),
      maxScroll: scrollHeight,
    });
  }

  private trackError(event: ErrorEvent): void {
    this.trackEvent('error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });

    if (this.currentSession) {
      this.currentSession.metadata.errors++;
    }
  }

  private trackUnhandledRejection(event: PromiseRejectionEvent): void {
    this.trackEvent('error', {
      type: 'unhandled_promise_rejection',
      reason: event.reason?.toString(),
      stack: event.reason?.stack,
    });

    if (this.currentSession) {
      this.currentSession.metadata.errors++;
    }
  }

  private trackPerformance(data: PerformanceData): void {
    this.trackEvent('performance', data);
  }

  private trackEvent(type: EventType, data: Record<string, unknown>): void {
    if (!this.currentSession) return;

    const event: UserEvent = {
      timestamp: new Date().toISOString(),
      type,
      data,
      url: window.location.href,
    };

    this.eventQueue.push(event);

    if (this.currentSession) {
      this.currentSession.metadata.interactions++;

      // Limit events per session
      if (this.eventQueue.length >= this.config.maxEventsPerSession) {
        this.flushEvents();
      }
    }
  }

  private detectRageClick(elementInfo: ElementInfo, timestamp: number): boolean {
    // Check for 3+ clicks on same element within 1 second
    const recentClicks = this.eventQueue
      .filter(e => e.type === 'click' &&
                   e.timestamp &&
                   (timestamp - new Date(e.timestamp).getTime()) < 1000 &&
                   this.elementsEqual(e.element, elementInfo))
      .length;

    return recentClicks >= 2; // Plus current click = 3
  }

  private isDeadClick(element: HTMLElement): boolean {
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem'];

    return !interactiveTags.includes(element.tagName) &&
           !interactiveRoles.includes(element.getAttribute('role') || '') &&
           !element.onclick &&
           !element.getAttribute('onclick');
  }

  private getElementInfo(element: HTMLElement): ElementInfo {
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: this.shouldCaptureText(element) ? element.textContent?.substring(0, 100) : undefined,
      xpath: this.getXPath(element),
      boundingRect: element.getBoundingClientRect(),
    };
  }

  private shouldCaptureText(element: HTMLElement): boolean {
    // Don't capture sensitive text content
    if (this.config.privacySettings.maskPersonalInfo) {
      return !element.matches('input, textarea, [data-sensitive]');
    }
    return true;
  }

  private getXPath(element: HTMLElement): string {
    if (element.id) return `//*[@id="${element.id}"]`;

    const parts = [];
    let current: HTMLElement | null = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE &&
            (sibling as HTMLElement).tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.tagName.toLowerCase();
      const pathSegment = index ? `${tagName}[${index + 1}]` : tagName;
      parts.unshift(pathSegment);

      current = current.parentElement;
    }

    return parts.length ? `/${parts.join('/')}` : '';
  }

  private elementsEqual(a?: ElementInfo, b?: ElementInfo): boolean {
    if (!a || !b) return false;
    return a.tagName === b.tagName &&
           a.id === b.id &&
           a.className === b.className;
  }

  private endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = new Date(this.currentSession.endTime).getTime() -
                                   new Date(this.currentSession.startTime).getTime();

    this.currentSession.metadata.exitPage = window.location.href;
    this.currentSession.events = [...this.eventQueue];

    // Calculate final performance metrics
    this.calculateSessionPerformance();

    // Send session data
    this.sendSessionData();

    this.currentSession = null;
    this.eventQueue = [];
  }

  private calculateSessionPerformance(): void {
    if (!this.currentSession) return;

    const performanceEvents = this.currentSession.events.filter(e => e.type === 'performance');

    if (performanceEvents.length === 0) return;

    const lcpValues = performanceEvents.map(e => e.performance?.lcp).filter(Boolean) as number[];
    const fidValues = performanceEvents.map(e => e.performance?.fid).filter(Boolean) as number[];
    const clsValues = performanceEvents.map(e => e.performance?.cls).filter(Boolean) as number[];

    this.currentSession.metadata.performance = {
      averageLCP: lcpValues.length > 0 ? lcpValues.reduce((a, b) => a + b) / lcpValues.length : 0,
      averageFID: fidValues.length > 0 ? fidValues.reduce((a, b) => a + b) / fidValues.length : 0,
      averageCLS: clsValues.length > 0 ? clsValues.reduce((a, b) => a + b) / clsValues.length : 0,
      slowestPage: window.location.href,
      errorRate: this.currentSession.metadata.errors / Math.max(this.currentSession.metadata.interactions, 1),
    };
  }

  private async sendSessionData(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // Sample based on configured rate
      if (Math.random() > this.config.sampleRate) return;

      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentSession),
      });

      if (!response.ok) {
        console.error('Failed to send session data:', response.status);
      }
    } catch (error) {
      console.error('Error sending session data:', error);
    }
  }

  private flushEvents(): void {
    // Send current batch of events
    if (this.eventQueue.length > 0) {
      this.sendSessionData();
      this.eventQueue = [];
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string | undefined {
    // Try to get from various sources
    return (window as any).userId || localStorage.getItem('userId') || undefined;
  }

  private getOrganizationId(): string | undefined {
    return (window as any).organizationId || localStorage.getItem('organizationId') || undefined;
  }

  // Public API methods
  async getUserJourney(userId: string): Promise<UserJourney | null> {
    // This would fetch from backend
    return null;
  }

  async getSessionInsights(sessionId: string): Promise<UserInsight[]> {
    // This would analyze session data for insights
    return [];
  }

  async getFrictionPoints(): Promise<UserInsight[]> {
    // This would identify common friction points across sessions
    return [];
  }
}

// Default RUM configuration
export const defaultRUMConfig: RUMConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1, // 10% of sessions
  maxSessionDuration: 60, // 60 minutes
  maxEventsPerSession: 1000,
  captureClicks: true,
  captureInputs: false, // Disabled for privacy
  captureScroll: true,
  captureErrors: true,
  capturePerformance: true,
  maskSensitiveData: true,
  excludedUrls: ['/admin', '/private'],
  privacySettings: {
    maskPasswords: true,
    maskEmails: true,
    maskCreditCards: true,
    maskPersonalInfo: true,
    allowedDomains: ['ghxstship.com'],
  },
};

export const rumService = new RUMService(defaultRUMConfig);
