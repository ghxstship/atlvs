'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
  
  // Custom metrics
  renderTime: number;
  componentCount: number;
  memoryUsage: number | null;
  fps: number;
  networkRequests: NetworkRequest[];
  errorCount: number;
  slowComponents: SlowComponent[];
}

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: number;
}

interface SlowComponent {
  name: string;
  renderTime: number;
  props: any;
  timestamp: number;
}

// Performance thresholds
const THRESHOLDS = {
  lcp: { good: 2500, needs_improvement: 4000 },
  fid: { good: 100, needs_improvement: 300 },
  cls: { good: 0.1, needs_improvement: 0.25 },
  fcp: { good: 1800, needs_improvement: 3000 },
  ttfb: { good: 800, needs_improvement: 1800 },
  inp: { good: 200, needs_improvement: 500 },
  renderTime: { good: 16, needs_improvement: 50 },
  fps: { good: 55, needs_improvement: 30 },
  memory: { good: 50, needs_improvement: 100 }, // MB
};

// Performance observer for Core Web Vitals
class PerformanceObserverManager {
  private observers: Map<string, PerformanceObserver> = new Map();
  private metrics: Partial<PerformanceMetrics> = {};
  private callbacks: Set<(metrics: Partial<PerformanceMetrics>) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.notifyCallbacks();
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as any;
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        this.notifyCallbacks();
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // CLS Observer
    try {
      let clsValue = 0;
      let clsEntries: any[] = [];
      
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
        this.metrics.cls = clsValue;
        this.notifyCallbacks();
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Paint timing
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.notifyCallbacks();
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    } catch (e) {
      console.warn('Paint observer not supported');
    }

    // Navigation timing
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      this.metrics.ttfb = timing.responseStart - timing.requestStart;
    }
  }

  subscribe(callback: (metrics: Partial<PerformanceMetrics>) => void) {
    this.callbacks.add(callback);
    // Send current metrics immediately
    callback(this.metrics);
  }

  unsubscribe(callback: (metrics: Partial<PerformanceMetrics>) => void) {
    this.callbacks.delete(callback);
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.metrics));
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
  }

  getMetrics() {
    return this.metrics;
  }
}

// React component profiler
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const TrackedComponent = (props: P) => {
    const renderStartTime = useRef(performance.now());
    
    useEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > THRESHOLDS.renderTime.needs_improvement) {
        if (typeof window !== 'undefined' && (window as any).__PERF_MONITOR__) {
          (window as any).__PERF_MONITOR__.reportSlowComponent({
            name: componentName || Component.displayName || Component.name || 'Unknown',
            renderTime,
            props,
            timestamp: Date.now(),
          });
        }
      }
    });

    return <Component {...props} />;
  };

  TrackedComponent.displayName = `PerformanceTracked(${componentName || Component.displayName || Component.name})`;
  
  return TrackedComponent;
}

// FPS Monitor
class FPSMonitor {
  private lastTime = performance.now();
  private frames = 0;
  private fps = 60;
  private callbacks: Set<(fps: number) => void> = new Set();
  private rafId: number | null = null;

  start() {
    const measure = () => {
      this.frames++;
      const currentTime = performance.now();
      
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
        this.frames = 0;
        this.lastTime = currentTime;
        this.callbacks.forEach(callback => callback(this.fps));
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  subscribe(callback: (fps: number) => void) {
    this.callbacks.add(callback);
  }

  unsubscribe(callback: (fps: number) => void) {
    this.callbacks.delete(callback);
  }

  getFPS() {
    return this.fps;
  }
}

// Network monitor
class NetworkMonitor {
  private requests: NetworkRequest[] = [];
  private callbacks: Set<(requests: NetworkRequest[]) => void> = new Set();
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;

  constructor() {
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.interceptFetch();
    this.interceptXHR();
  }

  private interceptFetch() {
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const [resource, init] = args;
      const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.href : resource.url;
      const method = init?.method || 'GET';

      try {
        const response = await this.originalFetch(...args);
        const duration = performance.now() - startTime;
        
        const request: NetworkRequest = {
          url,
          method,
          duration,
          size: parseInt(response.headers.get('content-length') || '0'),
          status: response.status,
          timestamp: Date.now(),
        };
        
        this.addRequest(request);
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        const request: NetworkRequest = {
          url,
          method,
          duration,
          size: 0,
          status: 0,
          timestamp: Date.now(),
        };
        
        this.addRequest(request);
        throw error;
      }
    };
  }

  private interceptXHR() {
    const self = this;
    
    XMLHttpRequest.prototype.open = function(...args: any[]) {
      const [method, url] = args;
      const startTime = performance.now();
      
      this.addEventListener('loadend', function() {
        const duration = performance.now() - startTime;
        
        const request: NetworkRequest = {
          url,
          method,
          duration,
          size: parseInt(this.getResponseHeader('content-length') || '0'),
          status: this.status,
          timestamp: Date.now(),
        };
        
        self.addRequest(request);
      });
      
      return self.originalXHROpen.apply(this, args as any);
    };
  }

  private addRequest(request: NetworkRequest) {
    this.requests.push(request);
    // Keep only last 100 requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }
    this.notifyCallbacks();
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.requests));
  }

  subscribe(callback: (requests: NetworkRequest[]) => void) {
    this.callbacks.add(callback);
  }

  unsubscribe(callback: (requests: NetworkRequest[]) => void) {
    this.callbacks.delete(callback);
  }

  getRequests() {
    return this.requests;
  }

  destroy() {
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    this.callbacks.clear();
  }
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
    renderTime: 0,
    componentCount: 0,
    memoryUsage: null,
    fps: 60,
    networkRequests: [],
    errorCount: 0,
    slowComponents: [],
  });

  const observerRef = useRef<PerformanceObserverManager>();
  const fpsMonitorRef = useRef<FPSMonitor>();
  const networkMonitorRef = useRef<NetworkMonitor>();

  useEffect(() => {
    // Initialize monitors
    observerRef.current = new PerformanceObserverManager();
    fpsMonitorRef.current = new FPSMonitor();
    networkMonitorRef.current = new NetworkMonitor();

    // Subscribe to metrics
    observerRef.current.subscribe((webVitals) => {
      setMetrics(prev => ({ ...prev, ...webVitals }));
    });

    fpsMonitorRef.current.subscribe((fps) => {
      setMetrics(prev => ({ ...prev, fps }));
    });

    networkMonitorRef.current.subscribe((networkRequests) => {
      setMetrics(prev => ({ ...prev, networkRequests }));
    });

    // Start FPS monitoring
    fpsMonitorRef.current.start();

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
        }));
      }
    }, 1000);

    // Monitor component count
    const countInterval = setInterval(() => {
      const allElements = document.querySelectorAll('*');
      setMetrics(prev => ({
        ...prev,
        componentCount: allElements.length,
      }));
    }, 2000);

    // Setup global performance monitor
    if (typeof window !== 'undefined') {
      (window as any).__PERF_MONITOR__ = {
        reportSlowComponent: (component: SlowComponent) => {
          setMetrics(prev => ({
            ...prev,
            slowComponents: [...prev.slowComponents.slice(-9), component],
          }));
        },
        reportError: () => {
          setMetrics(prev => ({
            ...prev,
            errorCount: prev.errorCount + 1,
          }));
        },
      };
    }

    // Cleanup
    return () => {
      observerRef.current?.destroy();
      fpsMonitorRef.current?.stop();
      networkMonitorRef.current?.destroy();
      clearInterval(memoryInterval);
      clearInterval(countInterval);
      
      if (typeof window !== 'undefined') {
        delete (window as any).__PERF_MONITOR__;
      }
    };
  }, []);

  return metrics;
}

// Performance dashboard component
export function PerformanceDashboard() {
  const metrics = usePerformanceMonitor();
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'vitals' | 'network' | 'components'>('vitals');

  const getMetricStatus = (value: number | null, thresholds: { good: number; needs_improvement: number }) => {
    if (value === null) return 'secondary';
    if (value <= thresholds.good) return 'success';
    if (value <= thresholds.needs_improvement) return 'warning';
    return 'destructive';
  };

  const formatMetric = (value: number | null, unit = 'ms') => {
    if (value === null) return 'N/A';
    return `${Math.round(value)}${unit}`;
  };

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all ${isMinimized ? 'w-48' : 'w-96'}`}>
      <Card className="shadow-2xl border-2">
        <CardHeader className="p-md cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Performance Monitor</h3>
            <div className="flex items-center gap-sm">
              <Badge variant={metrics.fps < THRESHOLDS.fps.needs_improvement ? 'destructive' : metrics.fps < THRESHOLDS.fps.good ? 'warning' : 'success'}>
                {metrics.fps} FPS
              </Badge>
              <button className="text-xs">
                {isMinimized ? '▲' : '▼'}
              </button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-md pt-0">
            {/* Tab Navigation */}
            <div className="flex gap-sm mb-4">
              <button
                className={`px-sm py-xs text-xs rounded ${selectedTab === 'vitals' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setSelectedTab('vitals')}
              >
                Web Vitals
              </button>
              <button
                className={`px-sm py-xs text-xs rounded ${selectedTab === 'network' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setSelectedTab('network')}
              >
                Network
              </button>
              <button
                className={`px-sm py-xs text-xs rounded ${selectedTab === 'components' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                onClick={() => setSelectedTab('components')}
              >
                Components
              </button>
            </div>

            {/* Web Vitals Tab */}
            {selectedTab === 'vitals' && (
              <div className="space-y-xs">
                <div className="grid grid-cols-2 gap-sm">
                  <div className="p-sm bg-muted rounded">
                    <div className="text-xs text-muted-foreground">LCP</div>
                    <div className="flex items-center gap-xs">
                      <Badge variant={getMetricStatus(metrics.lcp, THRESHOLDS.lcp)} className="text-xs">
                        {formatMetric(metrics.lcp)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-sm bg-muted rounded">
                    <div className="text-xs text-muted-foreground">FID</div>
                    <div className="flex items-center gap-xs">
                      <Badge variant={getMetricStatus(metrics.fid, THRESHOLDS.fid)} className="text-xs">
                        {formatMetric(metrics.fid)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-sm bg-muted rounded">
                    <div className="text-xs text-muted-foreground">CLS</div>
                    <div className="flex items-center gap-xs">
                      <Badge variant={getMetricStatus(metrics.cls, THRESHOLDS.cls)} className="text-xs">
                        {formatMetric(metrics.cls, '')}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-sm bg-muted rounded">
                    <div className="text-xs text-muted-foreground">FCP</div>
                    <div className="flex items-center gap-xs">
                      <Badge variant={getMetricStatus(metrics.fcp, THRESHOLDS.fcp)} className="text-xs">
                        {formatMetric(metrics.fcp)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="p-sm bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Memory Usage</span>
                    <Badge variant={metrics.memoryUsage && metrics.memoryUsage > THRESHOLDS.memory.needs_improvement ? 'destructive' : 'secondary'} className="text-xs">
                      {metrics.memoryUsage ? `${metrics.memoryUsage} MB` : 'N/A'}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-sm bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">DOM Elements</span>
                    <Badge variant="secondary" className="text-xs">
                      {metrics.componentCount}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Network Tab */}
            {selectedTab === 'network' && (
              <div className="gap-sm max-h-64 overflow-y-auto">
                {metrics.networkRequests.slice(-10).reverse().map((req, index) => (
                  <div key={index} className="p-sm bg-muted rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="truncate flex-1 mr-2">{new URL(req.url).pathname}</span>
                      <div className="flex gap-xs">
                        <Badge variant={req.status >= 400 ? 'destructive' : req.status >= 300 ? 'warning' : 'success'} className="text-xs">
                          {req.status}
                        </Badge>
                        <Badge variant={req.duration > 1000 ? 'warning' : 'secondary'} className="text-xs">
                          {Math.round(req.duration)}ms
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {metrics.networkRequests.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-md">
                    No network requests yet
                  </div>
                )}
              </div>
            )}

            {/* Components Tab */}
            {selectedTab === 'components' && (
              <div className="gap-sm max-h-64 overflow-y-auto">
                {metrics.slowComponents.map((comp, index) => (
                  <div key={index} className="p-sm bg-muted rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{comp.name}</span>
                      <Badge variant="warning" className="text-xs">
                        {Math.round(comp.renderTime)}ms
                      </Badge>
                    </div>
                  </div>
                ))}
                {metrics.slowComponents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-md">
                    No slow components detected
                  </div>
                )}
                
                {metrics.errorCount > 0 && (
                  <div className="p-sm bg-destructive/10 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Errors Detected</span>
                      <Badge variant="destructive" className="text-xs">
                        {metrics.errorCount}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Export performance utilities
export const Performance = {
  monitor: usePerformanceMonitor,
  track: withPerformanceTracking,
  Dashboard: PerformanceDashboard,
};
