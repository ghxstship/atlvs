# Database Caching Strategy

## Overview
This document outlines the comprehensive caching strategy for GHXSTSHIP to optimize performance, reduce database load, and improve user experience across all application layers.

## Multi-Layer Caching Architecture

### 1. Browser-Level Caching

#### Service Worker Caching
- **Static Assets**: Cache CSS, JS, images, fonts with Cache-First strategy
- **API Responses**: Cache GET requests with Network-First strategy
- **Offline Support**: IndexedDB for offline queue and critical data

#### HTTP Caching Headers
```typescript
// Static assets
Cache-Control: public, max-age=31536000, immutable

// API responses
Cache-Control: private, max-age=300, stale-while-revalidate=3600

// User-specific data
Cache-Control: private, no-cache, must-revalidate
```

### 2. Application-Level Caching

#### React Query/SWR Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,  // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});
```

#### Local Storage Caching
```typescript
// User preferences and session data
const userCache = {
  preferences: localStorage.getItem('user_preferences'),
  theme: localStorage.getItem('theme'),
  language: localStorage.getItem('language'),
};

// Feature flags and configuration
const configCache = {
  features: localStorage.getItem('feature_flags'),
  apiEndpoints: localStorage.getItem('api_config'),
};
```

### 3. API-Level Caching

#### Response Caching
```typescript
// Cache successful GET responses
const cache = new Map();

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
    return cached.data;
  }
  return null;
}

function setCachedResponse(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

#### Request Deduplication
```typescript
const pendingRequests = new Map();

function deduplicateRequest(key: string, requestFn: () => Promise<any>) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}
```

### 4. Database-Level Caching

#### Supabase Edge Functions Caching
```typescript
// Edge function for cached analytics data
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const cacheKey = `analytics_${Date.now()}`;
  const cachedData = await getFromCache(cacheKey);

  if (cachedData) {
    return new Response(JSON.stringify(cachedData), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Compute analytics data
  const data = await computeAnalytics();

  // Cache for 5 minutes
  await setCache(cacheKey, data, 300);

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

#### Materialized Views
```sql
-- Materialized view for dashboard analytics
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  organization_id,
  COUNT(*) as total_projects,
  SUM(budget) as total_budget,
  AVG(progress) as avg_progress,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects
FROM projects
WHERE organization_id IS NOT NULL
GROUP BY organization_id;

-- Refresh every 15 minutes
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh
SELECT cron.schedule('refresh-dashboard-stats', '*/15 * * * *', 'SELECT refresh_dashboard_stats();');
```

### 5. Infrastructure-Level Caching

#### Redis Implementation (Future)
```typescript
// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Cache wrapper
class RedisCache {
  async get(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 300) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
```

#### CDN Caching Strategy
- **Static Assets**: Cloudflare/CDN with long TTL
- **API Responses**: Short TTL with cache purging on updates
- **User Content**: Regional caching with invalidation webhooks

## Cache Invalidation Strategies

### 1. Time-Based Expiration
```typescript
// Automatic expiration
const CACHE_TTL = {
  user: 300,        // 5 minutes
  projects: 600,    // 10 minutes
  analytics: 1800,  // 30 minutes
  static: 86400,    // 24 hours
};
```

### 2. Event-Based Invalidation
```typescript
// Invalidate related caches when data changes
const invalidationRules = {
  'project:updated': ['projects', 'dashboard', 'analytics'],
  'user:updated': ['user', 'teams', 'permissions'],
  'organization:updated': ['org', 'billing', 'settings'],
};

function invalidateCache(entity: string, action: string) {
  const patterns = invalidationRules[`${entity}:${action}`] || [];
  patterns.forEach(pattern => {
    cache.invalidate(`${pattern}:*`);
  });
}
```

### 3. Manual Invalidation
```typescript
// Admin cache management
app.post('/api/admin/cache/invalidate', async (req, res) => {
  const { pattern } = req.body;

  if (!pattern) {
    return res.status(400).json({ error: 'Pattern required' });
  }

  try {
    await cache.invalidate(pattern);
    res.json({ success: true, pattern });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Performance Monitoring

### Cache Hit Ratios
```typescript
// Monitor cache performance
const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,

  get hitRatio() {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }
};

// Track cache operations
function trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete') {
  cacheMetrics[operation]++;
}
```

### Cache Size Monitoring
```typescript
// Monitor cache memory usage
function getCacheStats() {
  const stats = {
    size: cache.size,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };

  // Log warning if cache is too large
  if (stats.size > 10000) {
    console.warn('Cache size exceeded threshold:', stats.size);
  }

  return stats;
}
```

## Cache Warming Strategies

### 1. Startup Cache Warming
```typescript
// Warm up critical caches on application startup
async function warmCaches() {
  const warmingTasks = [
    // Cache user permissions
    cache.set('permissions:admin', await getAdminPermissions(), 3600),

    // Cache common configuration
    cache.set('config:features', await getFeatureFlags(), 1800),

    // Cache static data
    cache.set('countries', await getCountries(), 86400),
  ];

  await Promise.allSettled(warmingTasks);
  console.log('Cache warming completed');
}
```

### 2. Predictive Caching
```typescript
// Cache likely-to-be-needed data
function predictAndCache(userId: string, currentPage: string) {
  const predictions = {
    dashboard: ['projects', 'tasks', 'notifications'],
    projects: ['team_members', 'project_files', 'milestones'],
    settings: ['user_profile', 'organization_settings'],
  };

  const toCache = predictions[currentPage] || [];
  toCache.forEach(async (key) => {
    const data = await fetchDataForUser(key, userId);
    cache.set(`${key}:${userId}`, data, 300);
  });
}
```

## Best Practices

### 1. Cache Key Naming
```typescript
// Consistent key patterns
const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userProjects: (userId: string) => `user:${userId}:projects`,
  project: (id: string) => `project:${id}`,
  organization: (id: string) => `organization:${id}`,
};
```

### 2. Error Handling
```typescript
// Graceful cache failures
async function safeCacheGet(key: string) {
  try {
    return await cache.get(key);
  } catch (error) {
    console.error('Cache error:', error);
    return null; // Don't fail the operation
  }
}
```

### 3. Cache Compression
```typescript
// Compress large cache entries
function compressData(data: any): string {
  return JSON.stringify(data); // Could use gzip compression
}

function decompressData(compressed: string): any {
  return JSON.parse(compressed);
}
```

## Security Considerations

### 1. Cache Poisoning Prevention
- Validate cache keys
- Sanitize cache data
- Implement cache key signing

### 2. Sensitive Data Handling
- Never cache sensitive information
- Use encrypted caching for PII
- Implement proper cache invalidation for security events

## Monitoring and Alerting

### Key Metrics
- Cache hit ratio (>80% target)
- Cache size and memory usage
- Cache invalidation frequency
- Cache warming time
- Cache error rates

### Alerting Rules
- Cache hit ratio < 70%
- Cache memory usage > 80%
- Cache warming failures
- High cache error rates

## Implementation Roadmap

### Phase 1: Browser & Application Caching ✅
- Service worker implementation
- React Query optimization
- Local storage caching

### Phase 2: API & Database Caching 🔄
- Response caching
- Materialized views
- Request deduplication

### Phase 3: Infrastructure Caching 🚀
- Redis implementation
- CDN optimization
- Global caching strategy

---

*Last Updated: 2025-09-29*
