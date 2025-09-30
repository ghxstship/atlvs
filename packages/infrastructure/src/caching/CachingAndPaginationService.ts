/**
 * Caching and Pagination Service
 * Provides Redis caching and cursor-based pagination for high-volume endpoints
 */

import { Redis } from '@upstash/redis';

interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix: string;
  enableCompression?: boolean;
}

interface PaginationOptions {
  cursor?: string;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Redis Cache Manager
 */
export class RedisCacheManager {
  private client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  private defaultConfig: CacheConfig = {
    ttl: 300, // 5 minutes
    keyPrefix: 'ghxstship:',
    enableCompression: false,
  };

  /**
   * Get cached value
   */
  async get<T = any>(key: string, config?: Partial<CacheConfig>): Promise<T | null> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const fullKey = `${fullConfig.keyPrefix}${key}`;

    try {
      const cached = await this.client.get(fullKey);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  async set<T = any>(
    key: string,
    value: T,
    config?: Partial<CacheConfig>
  ): Promise<void> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const fullKey = `${fullConfig.keyPrefix}${key}`;

    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(fullKey, fullConfig.ttl, serializedValue);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string, config?: Partial<CacheConfig>): Promise<void> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const fullKey = `${fullConfig.keyPrefix}${key}`;

    try {
      await this.client.del(fullKey);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache with prefix
   */
  async clearPrefix(prefix: string, config?: Partial<CacheConfig>): Promise<void> {
    const fullConfig = { ...this.defaultConfig, ...config };
    const pattern = `${fullConfig.keyPrefix}${prefix}*`;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.warn('Cache clear prefix error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    // Basic stats - in production you'd integrate with Redis monitoring
    return {
      totalKeys: 0,
      memoryUsage: '0B',
    };
  }
}

/**
 * Cursor-based Pagination Manager
 */
export class CursorPaginationManager {
  /**
   * Create cursor from record data
   */
  createCursor(record: any, sortBy: string): string {
    // Create a composite cursor using sort field + ID for stability
    const sortValue = record[sortBy];
    const id = record.id;

    // Base64 encode for URL safety
    const cursorData = JSON.stringify({ [sortBy]: sortValue, id });
    return Buffer.from(cursorData).toString('base64');
  }

  /**
   * Decode cursor to get pagination parameters
   */
  decodeCursor(cursor: string): { [key: string]: any } {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString();
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Invalid cursor format');
    }
  }

  /**
   * Build pagination query for Supabase
   */
  buildPaginationQuery(
    query: any,
    options: PaginationOptions,
    tableName: string
  ): any {
    let paginatedQuery = query;

    // Apply sorting
    if (options.sortBy) {
      paginatedQuery = paginatedQuery.order(options.sortBy, {
        ascending: options.sortOrder === 'asc'
      });
    }

    // Apply cursor-based pagination
    if (options.cursor) {
      try {
        const cursorData = this.decodeCursor(options.cursor);
        const sortField = options.sortBy || 'created_at';

        // For simplicity, we'll use greater than comparison
        // In production, you'd want more sophisticated cursor logic
        paginatedQuery = paginatedQuery.gt(sortField, cursorData[sortField]);
      } catch (error) {
        console.warn('Invalid cursor, ignoring:', error);
      }
    }

    // Apply limit (add 1 to check if there are more records)
    paginatedQuery = paginatedQuery.limit(options.limit + 1);

    return paginatedQuery;
  }

  /**
   * Process paginated results
   */
  processResults<T>(
    rawResults: T[],
    options: PaginationOptions
  ): PaginatedResult<T> {
    const hasMore = rawResults.length > options.limit;
    const data = hasMore ? rawResults.slice(0, options.limit) : rawResults;

    let nextCursor: string | undefined;
    if (hasMore && data.length > 0) {
      const lastRecord = data[data.length - 1];
      const sortBy = options.sortBy || 'created_at';
      nextCursor = this.createCursor(lastRecord, sortBy);
    }

    return {
      data,
      nextCursor,
      hasMore,
    };
  }
}

/**
 * Cached Query Executor
 * Combines caching and pagination for high-performance queries
 */
export class CachedQueryExecutor {
  private cache = new RedisCacheManager();
  private pagination = new CursorPaginationManager();

  /**
   * Execute cached paginated query
   */
  async executePaginatedQuery<T = any>(
    queryKey: string,
    queryFn: () => Promise<T[]>,
    options: PaginationOptions,
    cacheConfig?: Partial<CacheConfig>
  ): Promise<PaginatedResult<T>> {
    // Try cache first
    const cached = await this.cache.get<PaginatedResult<T>>(queryKey, cacheConfig);
    if (cached) {
      return cached;
    }

    // Execute query
    const rawResults = await queryFn();

    // Process pagination
    const result = this.pagination.processResults(rawResults, options);

    // Cache result
    await this.cache.set(queryKey, result, cacheConfig);

    return result;
  }

  /**
   * Execute cached single query
   */
  async executeSingleQuery<T = any>(
    queryKey: string,
    queryFn: () => Promise<T>,
    cacheConfig?: Partial<CacheConfig>
  ): Promise<T> {
    // Try cache first
    const cached = await this.cache.get<T>(queryKey, cacheConfig);
    if (cached) {
      return cached;
    }

    // Execute query
    const result = await queryFn();

    // Cache result
    await this.cache.set(queryKey, result, cacheConfig);

    return result;
  }

  /**
   * Invalidate cache patterns
   */
  async invalidateCache(pattern: string): Promise<void> {
    await this.cache.clearPrefix(pattern);
  }

  /**
   * Warm up cache for frequently accessed data
   */
  async warmupCache<T = any>(
    queries: Array<{
      key: string;
      queryFn: () => Promise<T>;
      config?: Partial<CacheConfig>;
    }>
  ): Promise<void> {
    const promises = queries.map(({ key, queryFn, config }) =>
      this.executeSingleQuery(key, queryFn, config)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cache.getStats();
  }
}

/**
 * Query Optimization Helper
 */
export class QueryOptimizer {
  /**
   * Analyze query performance and suggest optimizations
   */
  analyzeQuery(query: string, executionTime: number): {
    suggestions: string[];
    severity: 'low' | 'medium' | 'high';
  } {
    const suggestions: string[] = [];

    // Check for common optimization opportunities
    if (query.includes('SELECT *')) {
      suggestions.push('Consider selecting only required columns instead of SELECT *');
    }

    if (query.includes('LIKE') && !query.includes('ILIKE')) {
      suggestions.push('Consider using ILIKE for case-insensitive text searches');
    }

    if (executionTime > 1000) {
      suggestions.push('Query execution time exceeds 1s - consider adding indexes');
    }

    if (executionTime > 5000) {
      suggestions.push('Query execution time exceeds 5s - critical performance issue');
    }

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (executionTime > 5000) severity = 'high';
    else if (executionTime > 1000) severity = 'medium';

    return { suggestions, severity };
  }

  /**
   * Generate optimal index suggestions based on query patterns
   */
  suggestIndexes(queryPatterns: string[]): string[] {
    const suggestions: string[] = [];

    const hasOrgFilters = queryPatterns.some(q => q.includes('organization_id'));
    const hasProjectFilters = queryPatterns.some(q => q.includes('project_id'));
    const hasStatusFilters = queryPatterns.some(q => q.includes('status'));
    const hasDateFilters = queryPatterns.some(q => q.includes('created_at') || q.includes('updated_at'));

    if (hasOrgFilters) {
      suggestions.push('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_id ON table_name (organization_id)');
    }

    if (hasProjectFilters) {
      suggestions.push('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_org ON table_name (organization_id, project_id)');
    }

    if (hasStatusFilters) {
      suggestions.push('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_status ON table_name (status)');
    }

    if (hasDateFilters) {
      suggestions.push('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_created_at ON table_name (created_at DESC)');
    }

    return suggestions;
  }
}

// Singleton instances
let redisCacheManager: RedisCacheManager | null = null;
let cursorPaginationManager: CursorPaginationManager | null = null;
let cachedQueryExecutor: CachedQueryExecutor | null = null;
let queryOptimizer: QueryOptimizer | null = null;

export function getRedisCacheManager(): RedisCacheManager {
  if (!redisCacheManager) {
    redisCacheManager = new RedisCacheManager();
  }
  return redisCacheManager;
}

export function getCursorPaginationManager(): CursorPaginationManager {
  if (!cursorPaginationManager) {
    cursorPaginationManager = new CursorPaginationManager();
  }
  return cursorPaginationManager;
}

export function getCachedQueryExecutor(): CachedQueryExecutor {
  if (!cachedQueryExecutor) {
    cachedQueryExecutor = new CachedQueryExecutor();
  }
  return cachedQueryExecutor;
}

export function getQueryOptimizer(): QueryOptimizer {
  if (!queryOptimizer) {
    queryOptimizer = new QueryOptimizer();
  }
  return queryOptimizer;
}
