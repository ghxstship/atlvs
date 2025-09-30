/**
 * i18n Performance Monitoring Utilities
 * Track translation lookup times and performance metrics
 */

export interface PerformanceMetrics {
  translationLookups: number;
  totalTime: number;
  averageTime: number;
  slowestLookup: number;
  fastestLookup: number;
}

class I18nPerformanceMonitor {
  private metrics: {
    lookups: number[];
    totalLookups: number;
  } = {
    lookups: [],
    totalLookups: 0,
  };

  private readonly maxSamples = 1000;
  private readonly performanceTarget = 100; // ms

  /**
   * Record a translation lookup time
   */
  recordLookup(timeMs: number): void {
    this.metrics.lookups.push(timeMs);
    this.metrics.totalLookups++;

    // Keep only last N samples to prevent memory issues
    if (this.metrics.lookups.length > this.maxSamples) {
      this.metrics.lookups.shift();
    }

    // Warn if lookup exceeds target
    if (timeMs > this.performanceTarget) {
      console.warn(
        `[i18n Performance] Slow translation lookup: ${timeMs}ms (target: ${this.performanceTarget}ms)`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const lookups = this.metrics.lookups;

    if (lookups.length === 0) {
      return {
        translationLookups: 0,
        totalTime: 0,
        averageTime: 0,
        slowestLookup: 0,
        fastestLookup: 0,
      };
    }

    const totalTime = lookups.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / lookups.length;
    const slowestLookup = Math.max(...lookups);
    const fastestLookup = Math.min(...lookups);

    return {
      translationLookups: this.metrics.totalLookups,
      totalTime,
      averageTime,
      slowestLookup,
      fastestLookup,
    };
  }

  /**
   * Check if performance meets target
   */
  meetsTarget(): boolean {
    const metrics = this.getMetrics();
    return metrics.averageTime <= this.performanceTarget;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      lookups: [],
      totalLookups: 0,
    };
  }

  /**
   * Log performance report
   */
  logReport(): void {
    const metrics = this.getMetrics();
    const meetsTarget = this.meetsTarget();

    console.group('[i18n Performance Report]');
    console.log(`Total Lookups: ${metrics.translationLookups}`);
    console.log(`Average Time: ${metrics.averageTime.toFixed(2)}ms`);
    console.log(`Fastest: ${metrics.fastestLookup.toFixed(2)}ms`);
    console.log(`Slowest: ${metrics.slowestLookup.toFixed(2)}ms`);
    console.log(`Target: ${this.performanceTarget}ms`);
    console.log(`Status: ${meetsTarget ? '✅ PASS' : '❌ FAIL'}`);
    console.groupEnd();
  }
}

// Global instance
const performanceMonitor = new I18nPerformanceMonitor();

/**
 * Measure translation lookup performance
 */
export function measureTranslationLookup<T>(
  fn: () => T,
  key?: string
): T {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  performanceMonitor.recordLookup(duration);

  if (process.env.NODE_ENV === 'development' && key) {
    console.debug(`[i18n] Translation lookup "${key}": ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Get performance metrics
 */
export function getI18nPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor.getMetrics();
}

/**
 * Check if i18n performance meets target
 */
export function i18nPerformanceMeetsTarget(): boolean {
  return performanceMonitor.meetsTarget();
}

/**
 * Reset performance metrics
 */
export function resetI18nPerformanceMetrics(): void {
  performanceMonitor.reset();
}

/**
 * Log performance report
 */
export function logI18nPerformanceReport(): void {
  performanceMonitor.logReport();
}

/**
 * Performance monitoring hook for React components
 */
export function useI18nPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Log report on page unload
    window.addEventListener('beforeunload', () => {
      if (process.env.NODE_ENV === 'development') {
        logI18nPerformanceReport();
      }
    });
  }

  return {
    getMetrics: getI18nPerformanceMetrics,
    meetsTarget: i18nPerformanceMeetsTarget,
    reset: resetI18nPerformanceMetrics,
    logReport: logI18nPerformanceReport,
  };
}
