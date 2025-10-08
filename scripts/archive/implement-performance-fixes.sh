#!/bin/bash

# GHXSTSHIP Performance Fixes Implementation Script
# Implements critical performance optimizations from audit report

set -e

echo "🚀 GHXSTSHIP Performance Optimization Implementation"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from repository root"
    exit 1
fi

echo "Phase 1: Installing Required Dependencies"
echo "=========================================="

# Install web-vitals for Core Web Vitals tracking
print_status "Installing web-vitals..."
cd apps/web
pnpm add web-vitals

# Install next-pwa for PWA support
print_status "Installing next-pwa..."
pnpm add next-pwa

# Install workbox for advanced caching
print_status "Installing workbox-webpack-plugin..."
pnpm add -D workbox-webpack-plugin

cd ../..

echo ""
echo "Phase 2: Creating Performance Monitoring Infrastructure"
echo "======================================================="

# Create Core Web Vitals tracking
print_status "Creating Core Web Vitals tracking..."
cat > apps/web/lib/monitoring/web-vitals.ts << 'EOF'
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

interface AnalyticsMetric extends Metric {
  page?: string;
  userAgent?: string;
}

function sendToAnalytics(metric: AnalyticsMetric) {
  // Add page context
  metric.page = window.location.pathname;
  metric.userAgent = navigator.userAgent;

  const body = JSON.stringify(metric);
  const url = '/api/analytics/vitals';

  // Use sendBeacon if available for reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, {
      body,
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(console.error);
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }
}

export function initWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
EOF

# Create vitals API endpoint
print_status "Creating vitals API endpoint..."
mkdir -p apps/web/app/api/analytics
cat > apps/web/app/api/analytics/vitals/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Log to console (in production, send to analytics service)
    console.log('Web Vital Received:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: metric.page,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to PostHog, Sentry, or other analytics service
    // Example with PostHog:
    // posthog.capture('web_vital', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   metric_rating: metric.rating,
    //   page: metric.page,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
EOF

# Create memory monitoring
print_status "Creating memory monitoring..."
cat > apps/web/lib/monitoring/memory.ts << 'EOF'
export interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export function getMemoryStats(): MemoryStats | null {
  if (typeof window === 'undefined') return null;
  
  const performance = window.performance as any;
  if (!performance || !performance.memory) return null;

  return {
    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
    jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
    timestamp: Date.now(),
  };
}

export function startMemoryMonitoring(intervalMs: number = 30000) {
  if (typeof window === 'undefined') return;

  const monitorInterval = setInterval(() => {
    const stats = getMemoryStats();
    if (stats) {
      console.log('Memory Usage:', stats);

      // Alert if memory usage exceeds 100MB
      if (stats.usedJSHeapSize > 100) {
        console.warn('High memory usage detected:', stats.usedJSHeapSize, 'MB');
      }

      // Send to analytics
      fetch('/api/analytics/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      }).catch(console.error);
    }
  }, intervalMs);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(monitorInterval);
  });

  return monitorInterval;
}
EOF

# Create memory API endpoint
cat > apps/web/app/api/analytics/memory/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const stats = await request.json();

    console.log('Memory Stats:', stats);

    // TODO: Send to monitoring service
    // Example: Send alert if memory > 100MB

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing memory stats:', error);
    return NextResponse.json(
      { error: 'Failed to process stats' },
      { status: 500 }
    );
  }
}
EOF

echo ""
echo "Phase 3: Creating PWA Configuration"
echo "===================================="

# Create PWA icons directory
print_status "Creating PWA icons directory..."
mkdir -p apps/web/public/icons

print_warning "Manual step required: Add PWA icons to apps/web/public/icons/"
print_warning "  - icon-192x192.png (192x192)"
print_warning "  - icon-512x512.png (512x512)"
print_warning "  - apple-touch-icon.png (180x180)"

# Update manifest.json
print_status "Updating manifest.json..."
cat > apps/web/public/manifest.json << 'EOF'
{
  "name": "GHXSTSHIP - Enterprise Production Management",
  "short_name": "GHXSTSHIP",
  "description": "ATLVS and OPENDECK - Complete enterprise production management platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Projects",
      "short_name": "Projects",
      "description": "Manage projects",
      "url": "/projects",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
EOF

# Create PWA configuration wrapper
print_status "Creating PWA configuration..."
cat > apps/web/next.config.pwa.mjs << 'EOF'
import withPWA from 'next-pwa';

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:woff|woff2|eot|ttf|otf)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'font-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
};

export default function withPWAConfig(nextConfig) {
  return withPWA(pwaConfig)(nextConfig);
}
EOF

echo ""
echo "Phase 4: Creating Load Testing Infrastructure"
echo "=============================================="

# Create load testing directory
print_status "Creating load testing infrastructure..."
mkdir -p tests/load

# Create basic load test
cat > tests/load/basic-load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 10000 }, // Spike to 10K users
    { duration: '5m', target: 10000 }, // Stay at 10K users
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Test dashboard (requires auth)
  const dashboardRes = http.get(`${BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
  });
  check(dashboardRes, {
    'dashboard accessible': (r) => r.status === 200 || r.status === 401,
  });

  sleep(2);

  // Test API health endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check passes': (r) => r.status === 200,
    'health check fast': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
EOF

# Create stress test
cat > tests/load/stress-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 10000 },  // Rapid ramp to 10K
    { duration: '5m', target: 20000 },  // Push to 20K
    { duration: '2m', target: 50000 },  // Extreme load
    { duration: '5m', target: 0 },      // Recovery
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // Allow up to 10% errors under stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    'system still responding': (r) => r.status === 200,
    'graceful degradation': (r) => r.status !== 500,
  });
  
  sleep(0.5);
}
EOF

# Create load test README
cat > tests/load/README.md << 'EOF'
# Load Testing for GHXSTSHIP

## Prerequisites

Install k6:
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Running Tests

### Basic Load Test (100 → 10K users)
```bash
k6 run tests/load/basic-load-test.js
```

### With Custom Base URL
```bash
BASE_URL=https://ghxstship.com k6 run tests/load/basic-load-test.js
```

### With Authentication
```bash
API_TOKEN=your_token_here k6 run tests/load/basic-load-test.js
```

### Stress Test (up to 50K users)
```bash
k6 run tests/load/stress-test.js
```

### Output to InfluxDB
```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/load/basic-load-test.js
```

## Interpreting Results

### Key Metrics
- **http_req_duration**: Request duration (p95 should be < 500ms)
- **http_req_failed**: Failed request rate (should be < 1%)
- **http_reqs**: Total requests per second
- **vus**: Virtual users (concurrent users)

### Success Criteria
- ✅ p95 response time < 500ms under normal load
- ✅ p95 response time < 2s under stress
- ✅ Error rate < 1% under normal load
- ✅ Error rate < 10% under extreme stress
- ✅ System recovers gracefully after stress
EOF

echo ""
echo "Phase 5: Creating Database Performance Queries"
echo "==============================================="

# Create database monitoring queries
print_status "Creating database monitoring queries..."
mkdir -p scripts/database
cat > scripts/database/performance-queries.sql << 'EOF'
-- GHXSTSHIP Database Performance Monitoring Queries

-- 1. Cache Hit Ratio (should be > 90%)
SELECT 
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  CASE 
    WHEN sum(heap_blks_hit) + sum(heap_blks_read) = 0 THEN 0
    ELSE round(sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read))::numeric * 100, 2)
  END as cache_hit_ratio_percent
FROM pg_statio_user_tables;

-- 2. Slow Queries (> 100ms)
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 3. Table Sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;

-- 4. Index Usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. Missing Indexes (Sequential Scans on Large Tables)
SELECT 
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_stat_user_tables
WHERE seq_scan > 0
  AND n_live_tup > 10000
  AND schemaname = 'public'
ORDER BY seq_tup_read DESC
LIMIT 20;

-- 6. Bloat Analysis
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_dead_tup,
  n_live_tup,
  round(n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100, 2) AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
  AND schemaname = 'public'
ORDER BY n_dead_tup DESC
LIMIT 20;

-- 7. Active Connections
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections,
  count(*) FILTER (WHERE state = 'idle') as idle_connections,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();

-- 8. Lock Monitoring
SELECT 
  pg_stat_activity.pid,
  pg_stat_activity.usename,
  pg_stat_activity.query,
  pg_locks.mode,
  pg_locks.granted
FROM pg_stat_activity
JOIN pg_locks ON pg_stat_activity.pid = pg_locks.pid
WHERE NOT pg_locks.granted
ORDER BY pg_stat_activity.query_start;
EOF

echo ""
echo "Phase 6: Creating Performance Testing Script"
echo "============================================="

cat > scripts/test-performance.sh << 'EOF'
#!/bin/bash

# Performance Testing Script for GHXSTSHIP

echo "🧪 Running Performance Tests"
echo "============================"

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Install with: brew install k6"
    exit 1
fi

# Start development server if not running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Development server not running. Start with: pnpm dev"
    exit 1
fi

echo ""
echo "Running basic load test..."
k6 run tests/load/basic-load-test.js

echo ""
echo "Performance test complete!"
echo "Review results above for:"
echo "  - Response times (p95 should be < 500ms)"
echo "  - Error rates (should be < 1%)"
echo "  - Request throughput"
EOF

chmod +x scripts/test-performance.sh

echo ""
echo "✅ Performance Fixes Implementation Complete!"
echo "=============================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. 🎨 Add PWA Icons:"
echo "   - Create apps/web/public/icons/icon-192x192.png"
echo "   - Create apps/web/public/icons/icon-512x512.png"
echo "   - Create apps/web/public/icons/apple-touch-icon.png"
echo ""
echo "2. 🔧 Update next.config.mjs:"
echo "   - Import and wrap config with withPWAConfig from next.config.pwa.mjs"
echo "   - Add Supabase Storage domain to images.domains"
echo ""
echo "3. 📊 Initialize Web Vitals:"
echo "   - Add initWebVitals() call to apps/web/app/layout.tsx"
echo "   - Add startMemoryMonitoring() for development"
echo ""
echo "4. 🧪 Install k6 for load testing:"
echo "   brew install k6"
echo ""
echo "5. 🚀 Run performance tests:"
echo "   ./scripts/test-performance.sh"
echo ""
echo "6. 📈 Monitor database performance:"
echo "   psql -f scripts/database/performance-queries.sql"
echo ""
print_status "All automated steps completed successfully!"
