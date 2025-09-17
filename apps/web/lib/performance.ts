/**
 * Performance monitoring utilities for Core Web Vitals tracking
 * Implements enterprise-grade performance monitoring with real-time metrics
 */

export interface PerformanceMetrics {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface PerformanceConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  reportingEndpoint?: string;
  sampleRate?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private config: PerformanceConfig;
  private observer?: PerformanceObserver;

  constructor(config: PerformanceConfig = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      sampleRate: 1.0,
      ...config
    };

    if (typeof window !== 'undefined') {
      this.initializeObserver();
      this.trackNavigationTiming();
    }
  }

  private initializeObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe Core Web Vitals
      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      // Observe additional metrics
      this.observer.observe({ entryTypes: ['paint', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        this.reportMetric('LCP', entry.startTime);
        break;
      
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        const fidValue = fidEntry.processingStart - fidEntry.startTime;
        this.metrics.fid = fidValue;
        this.reportMetric('FID', fidValue);
        break;
      
      case 'layout-shift':
        const clsEntry = entry as any; // LayoutShift interface not widely supported
        if (!clsEntry.hadRecentInput) {
          const currentCls = this.metrics.cls || 0;
          this.metrics.cls = currentCls + clsEntry.value;
          this.reportMetric('CLS', this.metrics.cls!);
        }
        break;
      
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.reportMetric('FCP', entry.startTime);
        }
        break;
    }
  }

  private trackNavigationTiming() {
    // Track TTFB using Navigation Timing API
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      // Fallback for older browsers
      window.addEventListener('load', () => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navTiming) {
          this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
          this.reportMetric('TTFB', this.metrics.ttfb);
        }
      });
    }
  }

  private reportMetric(name: string, value: number) {
    if (this.config.enableLogging) {
      console.log(`Performance Metric - ${name}:`, value);
    }

    if (this.config.enableReporting && Math.random() <= (this.config.sampleRate || 1)) {
      this.sendToAnalytics(name, value);
    }

    // Emit custom event for application-level handling
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-metric', {
        detail: { name, value, timestamp: Date.now() }
      }));
    }
  }

  private async sendToAnalytics(name: string, value: number) {
    if (!this.config.reportingEndpoint) return;

    try {
      await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.warn('Failed to report performance metric:', error);
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getScore(): { score: number; grade: string } {
    const { lcp, fid, cls } = this.metrics;
    
    // Calculate score based on Core Web Vitals thresholds
    let score = 0;
    let totalMetrics = 0;

    if (lcp !== undefined) {
      score += lcp <= 2500 ? 100 : lcp <= 4000 ? 50 : 0;
      totalMetrics++;
    }

    if (fid !== undefined) {
      score += fid <= 100 ? 100 : fid <= 300 ? 50 : 0;
      totalMetrics++;
    }

    if (cls !== undefined) {
      score += cls <= 0.1 ? 100 : cls <= 0.25 ? 50 : 0;
      totalMetrics++;
    }

    const finalScore = totalMetrics > 0 ? score / totalMetrics : 0;
    const grade = finalScore >= 90 ? 'A' : finalScore >= 75 ? 'B' : finalScore >= 50 ? 'C' : 'F';

    return { score: finalScore, grade };
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initializePerformanceMonitoring(config?: PerformanceConfig): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor(config);
  }
  return performanceMonitor;
}

export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor?.getMetrics() || {};
}

export function getPerformanceScore(): { score: number; grade: string } {
  return performanceMonitor?.getScore() || { score: 0, grade: 'F' };
}

// React hook for performance monitoring
export function usePerformanceMonitoring(): { 
  metrics: PerformanceMetrics; 
  score: { score: number; grade: string }; 
  monitor?: PerformanceMonitor 
} {
  if (typeof window === 'undefined') {
    return { metrics: {}, score: { score: 0, grade: 'F' } };
  }

  const monitor = initializePerformanceMonitoring();
  
  return {
    metrics: monitor.getMetrics(),
    score: monitor.getScore(),
    monitor
  };
}
