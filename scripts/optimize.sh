#!/bin/bash

# GHXSTSHIP Performance Optimization Script
# 2026 Enterprise Standards
# Version: 1.0.0

set -e

echo "⚡ Starting GHXSTSHIP Performance Optimization..."
echo "================================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Database Optimizations
echo ""
echo "🗄️ Creating Database Optimization Scripts..."
echo "-------------------------------------------"

mkdir -p supabase/optimizations

cat > supabase/optimizations/001_performance_indexes.sql << 'EOF'
-- Performance Optimization Indexes
-- Generated for 2026 Standards

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_org_status 
    ON projects(organization_id, status) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_project_assignee 
    ON tasks(project_id, assignee_user_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_occurred 
    ON audit_logs(organization_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_people_org_department 
    ON people(organization_id, department) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_finance_org_date 
    ON expenses(organization_id, expense_date DESC) 
    WHERE deleted_at IS NULL;

-- Partial indexes for status filtering
CREATE INDEX IF NOT EXISTS idx_projects_active 
    ON projects(organization_id) 
    WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_open 
    ON jobs(organization_id, created_at DESC) 
    WHERE status = 'open' AND deleted_at IS NULL;

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_projects_search 
    ON projects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_people_search 
    ON people USING gin(to_tsvector('english', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(email, '')));

-- JSON indexes for flexible fields
CREATE INDEX IF NOT EXISTS idx_reports_definition 
    ON reports USING gin(definition);

CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata 
    ON audit_logs USING gin(metadata);

ANALYZE;
EOF

cat > supabase/optimizations/002_materialized_views.sql << 'EOF'
-- Materialized Views for Analytics
-- Refresh strategy: Daily for most, hourly for critical

-- Project Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_project_analytics AS
SELECT 
    organization_id,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'active') as active_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
    AVG(EXTRACT(epoch FROM (completed_at - created_at))/86400)::numeric(10,2) as avg_duration_days,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY budget) as median_budget
FROM projects
WHERE deleted_at IS NULL
GROUP BY organization_id;

CREATE UNIQUE INDEX ON mv_project_analytics(organization_id);

-- Financial Summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_financial_summary AS
SELECT 
    organization_id,
    DATE_TRUNC('month', expense_date) as month,
    SUM(amount) FILTER (WHERE type = 'expense') as total_expenses,
    SUM(amount) FILTER (WHERE type = 'revenue') as total_revenue,
    COUNT(DISTINCT project_id) as projects_with_activity,
    AVG(amount)::numeric(10,2) as avg_transaction_amount
FROM finance_transactions
WHERE deleted_at IS NULL
GROUP BY organization_id, DATE_TRUNC('month', expense_date);

CREATE UNIQUE INDEX ON mv_financial_summary(organization_id, month);

-- People Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_people_metrics AS
SELECT 
    organization_id,
    COUNT(*) as total_people,
    COUNT(DISTINCT department) as departments,
    COUNT(*) FILTER (WHERE role = 'manager') as managers,
    AVG(EXTRACT(year FROM AGE(CURRENT_DATE, hire_date)))::numeric(10,1) as avg_tenure_years
FROM people
WHERE status = 'active' AND deleted_at IS NULL
GROUP BY organization_id;

CREATE UNIQUE INDEX ON mv_people_metrics(organization_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_project_analytics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_financial_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_people_metrics;
END;
$$ LANGUAGE plpgsql;
EOF

print_status "Database optimization scripts created"

# 2. Frontend Bundle Optimization
echo ""
echo "📦 Optimizing Frontend Bundles..."
echo "---------------------------------"

cat > apps/web/next.config.optimization.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@supabase/supabase-js',
      'lucide-react',
      'react-hook-form',
      '@radix-ui/react-*',
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Advanced chunking strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10,
            minChunks: 2,
          },
        },
      };
      
      // Module concatenation
      config.optimization.concatenateModules = true;
      
      // Minimize main bundle
      config.optimization.minimize = true;
    }
    
    return config;
  },
};

module.exports = nextConfig;
EOF

print_status "Next.js configuration optimized"

# 3. React Component Optimizations
echo ""
echo "⚛️ Creating React Optimization Utilities..."
echo "------------------------------------------"

mkdir -p packages/ui/src/optimizations

cat > packages/ui/src/optimizations/performance-hooks.ts << 'EOF'
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle } from 'lodash-es';

/**
 * Debounced callback hook for expensive operations
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useMemo(
    () => debounce((...args) => callbackRef.current(...args), delay) as T,
    [delay, ...deps]
  );
}

/**
 * Throttled callback hook for frequent events
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useMemo(
    () => throttle((...args) => callbackRef.current(...args), delay) as T,
    [delay, ...deps]
  );
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options]);
  
  return isIntersecting;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}
EOF

print_status "Performance hooks created"

# 4. Service Worker for Caching
echo ""
echo "🔧 Creating Service Worker..."
echo "-----------------------------"

cat > apps/web/public/sw.js << 'EOF'
// Service Worker for GHXSTSHIP
// Version: 1.0.0

const CACHE_NAME = 'ghxstship-v1';
const RUNTIME_CACHE = 'ghxstship-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/fonts/anton.woff2',
  '/fonts/share-tech.woff2',
  '/fonts/share-tech-mono.woff2',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip admin and API routes
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/admin/')) return;
  
  // Handle static assets (cache first)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Handle pages (network first)
  event.respondWith(
    fetch(request)
      .then((response) => {
        return caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
EOF

print_status "Service Worker created"

# 5. Performance Monitoring Setup
echo ""
echo "📊 Setting up Performance Monitoring..."
echo "---------------------------------------"

cat > apps/web/lib/monitoring/performance.ts << 'EOF'
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface PerformanceMetrics {
  CLS: number | null;
  FID: number | null;
  FCP: number | null;
  LCP: number | null;
  TTFB: number | null;
  INP: number | null;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    INP: null,
  };
  
  constructor() {
    this.initializeMonitoring();
  }
  
  private initializeMonitoring() {
    // Core Web Vitals
    onCLS((metric) => {
      this.metrics.CLS = metric.value;
      this.reportMetric('CLS', metric.value);
    });
    
    onFID((metric) => {
      this.metrics.FID = metric.value;
      this.reportMetric('FID', metric.value);
    });
    
    onFCP((metric) => {
      this.metrics.FCP = metric.value;
      this.reportMetric('FCP', metric.value);
    });
    
    onLCP((metric) => {
      this.metrics.LCP = metric.value;
      this.reportMetric('LCP', metric.value);
    });
    
    onTTFB((metric) => {
      this.metrics.TTFB = metric.value;
      this.reportMetric('TTFB', metric.value);
    });
    
    onINP((metric) => {
      this.metrics.INP = metric.value;
      this.reportMetric('INP', metric.value);
    });
    
    // Custom performance marks
    this.measurePageLoad();
    this.measureResourceTiming();
  }
  
  private measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData) {
          const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
          this.reportMetric('PageLoad', pageLoadTime);
        }
      });
    }
  }
  
  private measureResourceTiming() {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const criticalResources = resources.filter(
        (r) => r.initiatorType === 'script' || r.initiatorType === 'css'
      );
      
      const totalLoadTime = criticalResources.reduce(
        (acc, r) => acc + (r.responseEnd - r.startTime),
        0
      );
      
      if (totalLoadTime > 0) {
        this.reportMetric('CriticalResources', totalLoadTime);
      }
    }
  }
  
  private reportMetric(name: string, value: number) {
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();
EOF

print_status "Performance monitoring setup complete"

# 6. Create optimization report
echo ""
echo "📝 Generating Optimization Report..."
echo "-----------------------------------"

cat > OPTIMIZATION_REPORT.md << 'EOF'
# Optimization Report
Generated: $(date)

## Database Optimizations Applied
- ✅ Composite indexes for common queries
- ✅ Partial indexes for status filtering
- ✅ Full-text search indexes
- ✅ JSON field indexes
- ✅ Materialized views for analytics

## Frontend Optimizations Applied
- ✅ Next.js bundle optimization config
- ✅ Code splitting strategy
- ✅ React performance hooks
- ✅ Service Worker for caching
- ✅ Web Vitals monitoring

## Performance Targets
- LCP (Largest Contentful Paint): < 1.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 200ms
- Bundle Size: < 200KB (initial)

## Implementation Checklist
1. [ ] Apply database migrations: `pnpm supabase db push`
2. [ ] Update Next.js config: `cp next.config.optimization.js next.config.js`
3. [ ] Register Service Worker in _app.tsx
4. [ ] Import performance hooks in components
5. [ ] Test with Lighthouse

## Monitoring Setup
- Web Vitals tracking configured
- Custom performance metrics
- Resource timing analysis
- Real User Monitoring (RUM) ready

## Next Steps
1. Run performance tests: `pnpm test:performance`
2. Analyze bundle: `pnpm analyze`
3. Deploy to staging for testing
4. Monitor metrics for 24 hours
EOF

print_status "Optimization report generated"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Optimization setup completed!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Review OPTIMIZATION_REPORT.md"
echo "2. Apply database optimizations"
echo "3. Update Next.js configuration"
echo "4. Test performance improvements"
