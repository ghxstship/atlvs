'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface NavigationMetric {
  path: string;
  loadTime: number;
  timestamp: number;
  userAction: 'click' | 'keyboard' | 'back' | 'forward' | 'prefetch';
  renderTime?: number;
  ttfb?: number; // Time to first byte
}

interface PerformanceMetrics {
  avgLoadTime: number;
  avgRenderTime: number;
  p95LoadTime: number;
  totalNavigations: number;
  cacheHitRate: number;
  errorRate: number;
}

interface NavigationMetricsProps {
  showInProduction?: boolean;
  pathname?: string;
}

export const NavigationMetrics: React.FC<NavigationMetricsProps> = ({ 
  showInProduction = false,
  pathname 
}) => {
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const [metrics, setMetrics] = useState<NavigationMetric[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgLoadTime: 0,
    avgRenderTime: 0,
    p95LoadTime: 0,
    totalNavigations: 0,
    cacheHitRate: 0,
    errorRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    let paintTime = 0;
    
    // Measure paint time
    const observer = new PerformanceObserver((list: any) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          paintTime = entry.startTime;
        }
      });
    });
    
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.error('Failed to observe paint performance', e);
      }
    }

    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const newMetric: NavigationMetric = {
        path: currentPath,
        loadTime,
        timestamp: Date.now(),
        userAction: 'click',
        renderTime: paintTime,
        ttfb: navigation ? navigation.responseStart - navigation.requestStart : undefined
      };
      
      setMetrics(prev => {
        const updated = [...prev.slice(-99), newMetric];
        updatePerformanceMetrics(updated);
        saveToLocalStorage(updated);
        return updated;
      });
    };

    // Simulate load completion
    const timer = setTimeout(handleLoad, 100);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  const updatePerformanceMetrics = useCallback((allMetrics: NavigationMetric[]) => {
    if (allMetrics.length === 0) return;

    const loadTimes = allMetrics.map(m => m.loadTime).filter(Boolean);
    const renderTimes = allMetrics.map(m => m.renderTime).filter(Boolean) as number[];
    
    // Calculate averages
    const avgLoadTime = loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length;
    const avgRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length 
      : 0;
    
    // Calculate P95
    const sortedLoadTimes = [...loadTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLoadTimes.length * 0.95);
    const p95LoadTime = sortedLoadTimes[p95Index] || 0;
    
    // Calculate cache hit rate (simplified - based on load time threshold)
    const cacheHits = loadTimes.filter(t => t < 100).length;
    const cacheHitRate = (cacheHits / loadTimes.length) * 100;
    
    // Calculate error rate (simplified - based on high load times)
    const errors = loadTimes.filter(t => t > 3000).length;
    const errorRate = (errors / loadTimes.length) * 100;

    setPerformanceMetrics({
      avgLoadTime,
      avgRenderTime,
      p95LoadTime,
      totalNavigations: allMetrics.length,
      cacheHitRate,
      errorRate
    });
  }, []);

  const saveToLocalStorage = useCallback((metricsToSave: NavigationMetric[]) => {
    try {
      localStorage.setItem('nav_metrics', JSON.stringify(metricsToSave.slice(-100)));
    } catch (e) {
      console.error('Failed to save navigation metrics', e);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('nav_metrics');
      if (saved) {
        const parsed = JSON.parse(saved) as NavigationMetric[];
        setMetrics(parsed);
        updatePerformanceMetrics(parsed);
      }
    } catch (e) {
      console.error('Failed to load navigation metrics', e);
    }
  }, [updatePerformanceMetrics]);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Only show in development unless explicitly enabled
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  if (!isDevelopment && !showInProduction) {
    return null;
  }

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-success';
    if (value < thresholds[1]) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 p-sm bg-foreground/80 text-background rounded-lg text-xs font-mono z-50 hover:bg-foreground/90 transition-colors"
        aria-label="Toggle navigation metrics"
      >
        📊
      </button>

      {/* Metrics panel */}
      {isVisible && (
        <div className="fixed bottom-14 right-4 p-md bg-popover/95 text-popover-foreground border border-border rounded-lg text-xs font-mono z-50 min-w-content-medium backdrop-blur-sm">
          <div className="flex justify-between items-center mb-sm">
            <h3 className="text-sm font-bold">Navigation Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close metrics"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-xs">
            <div className="flex justify-between">
              <span>Current Path:</span>
              <span className="text-accent truncate max-w-narrow">{currentPath}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Avg Load Time:</span>
              <span className={getPerformanceColor(performanceMetrics.avgLoadTime, [500, 1500])}>
                {performanceMetrics.avgLoadTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>P95 Load Time:</span>
              <span className={getPerformanceColor(performanceMetrics.p95LoadTime, [1000, 3000])}>
                {performanceMetrics.p95LoadTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Avg Render Time:</span>
              <span className={getPerformanceColor(performanceMetrics.avgRenderTime, [100, 300])}>
                {performanceMetrics.avgRenderTime.toFixed(0)}ms
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Cache Hit Rate:</span>
              <span className={getPerformanceColor(100 - performanceMetrics.cacheHitRate, [30, 70])}>
                {performanceMetrics.cacheHitRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className={getPerformanceColor(performanceMetrics.errorRate, [1, 5])}>
                {performanceMetrics.errorRate.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Total Navigations:</span>
              <span>{performanceMetrics.totalNavigations}</span>
            </div>
          </div>

          {/* Performance indicators */}
          <div className="mt-sm pt-sm border-t border-border">
            <div className="text-small space-y-xs">
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>Good ({`<500ms load, <100ms render`})</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 bg-warning rounded-full"></span>
                <span>Needs Improvement</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                <span>Poor ({`>1500ms load, >300ms render`})</span>
              </div>
            </div>
          </div>

          {/* Clear metrics button */}
          <button
            onClick={() => {
              setMetrics([]);
              localStorage.removeItem('nav_metrics');
              setPerformanceMetrics({
                avgLoadTime: 0,
                avgRenderTime: 0,
                p95LoadTime: 0,
                totalNavigations: 0,
                cacheHitRate: 0,
                errorRate: 0
              });
            }}
            className="mt-sm w-full py-xs px-sm bg-muted hover:bg-muted/80 rounded text-small transition-colors"
          >
            Clear Metrics
          </button>
        </div>
      )}
    </>
  );
};

// Export performance monitoring hook
export const useNavigationPerformance = () => {
  const [metrics, setMetrics] = useState<NavigationMetric[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nav_metrics');
      if (saved) {
        setMetrics(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load metrics', e);
    }
  }, []);

  const trackNavigation = useCallback((metric: Partial<NavigationMetric>) => {
    const newMetric: NavigationMetric = {
      path: metric.path || window.location.pathname,
      loadTime: metric.loadTime || 0,
      timestamp: Date.now(),
      userAction: metric.userAction || 'click',
      ...metric
    };

    setMetrics(prev => {
      const updated = [...prev.slice(-99), newMetric];
      try {
        localStorage.setItem('nav_metrics', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save metrics', e);
      }
      return updated;
    });
  }, []);

  return { metrics, trackNavigation };
};
