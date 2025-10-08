/**
 * Dashboard Module API Service
 * Enterprise-grade API communication layer
 * Provides centralized API client with interceptors, caching, and error handling
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
// import type { Database } from '@/lib/database.types';

// Request/Response Types
export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: unknown;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
  cacheTtl?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  cached?: boolean;
  timestamp: number;
}

export interface IApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// Cache Configuration
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTtl = 300000; // 5 minutes

  set(key: string, data: unknown, ttl = this.defaultTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(pattern?: RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const [key] of this.cache) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Rate Limiting
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 100; // per window

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const timestamps = this.requests.get(key)!;
    const recentRequests = timestamps.filter(t => t > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(key)) return this.maxRequests;

    const timestamps = this.requests.get(key)!;
    const recentRequests = timestamps.filter(t => t > windowStart);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

// Main API Client Class
export class DashboardApiClient {
  private supabase = createClient();
  private cache = new ApiCache();
  private rateLimiter = new RateLimiter();
  private interceptors = {
    request: [] as Array<(req: ApiRequest) => ApiRequest | Promise<ApiRequest>>,
    response: [] as Array<(res: ApiResponse) => ApiResponse | Promise<ApiResponse>>,
    error: [] as Array<(error: IApiError) => IApiError | Promise<IApiError>>
  };

  constructor() {
    this.setupInterceptors();
  }

  // Interceptor Management
  addRequestInterceptor(interceptor: (req: ApiRequest) => ApiRequest | Promise<ApiRequest>): void {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (res: ApiResponse) => ApiResponse | Promise<ApiResponse>): void {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: IApiError) => IApiError | Promise<IApiError>): void {
    this.interceptors.error.push(interceptor);
  }

  // Core Request Method
  async request<T = unknown>(config: ApiRequest): Promise<ApiResponse<T>> {
    // Rate limiting check
    if (!this.rateLimiter.isAllowed('global')) {
      throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    // Cache check for GET requests
    if (config.method === 'GET' && config.cache !== false) {
      const cacheKey = this.generateCacheKey(config);
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData !== null) {
        return {
          data: cachedData,
          status: 200,
          headers: {},
          cached: true,
          timestamp: Date.now()
        };
      }
    }

    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }

    try {
      // Execute request based on endpoint
      const result = await this.executeRequest<T>(processedConfig);

      // Apply response interceptors
      let processedResult = result;
      for (const interceptor of this.interceptors.response) {
        processedResult = await interceptor(processedResult);
      }

      // Cache successful GET responses
      if (processedConfig.method === 'GET' && processedConfig.cache !== false) {
        const cacheKey = this.generateCacheKey(processedConfig);
        this.cache.set(cacheKey, processedResult.data, processedConfig.cacheTtl);
      }

      return processedResult;
    } catch (error) {
      // Apply error interceptors
      const apiError = this.normalizeError(error);
      let processedError = apiError;
      for (const interceptor of this.interceptors.error) {
        processedError = await interceptor(processedError);
      }
      throw processedError;
    }
  }

  // HTTP Method Shortcuts
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string>,
    config?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'GET',
      params,
      ...config
    });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'POST',
      data,
      ...config
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'PUT',
      data,
      ...config
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'PATCH',
      data,
      ...config
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    config?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      endpoint,
      method: 'DELETE',
      ...config
    });
  }

  // Cache Management
  invalidateCache(pattern?: RegExp): void {
    this.cache.invalidate(pattern);
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  // Rate Limiting
  getRemainingRequests(): number {
    return this.rateLimiter.getRemainingRequests('global');
  }

  // Private Methods
  private setupInterceptors(): void {
    // Auth interceptor
    this.addRequestInterceptor(async (req) => {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.access_token) {
        return {
          ...req,
          headers: {
            ...req.headers,
            Authorization: `Bearer ${session.access_token}`
          }
        };
      }
      return req;
    });

    // Error interceptor for retries
    this.addErrorInterceptor(async (error) => {
      if (error.status >= 500 && error.status < 600) {
        // Retry logic for server errors could be implemented here
        console.warn('Server error detected, consider implementing retry logic');
      }
      return error;
    });
  }

  private async executeRequest<T>(config: ApiRequest): Promise<ApiResponse<T>> {
    const { data, error } = await this.supabase
      .from(config.endpoint as keyof Database['public']['Tables'])
      .select('*');

    if (error) {
      throw new ApiError(error.message, 500, error.code, error.details);
    }

    return {
      data: data as T,
      status: 200,
      headers: {},
      timestamp: Date.now()
    };
  }

  private generateCacheKey(config: ApiRequest): string {
    const params = config.params ? Object.entries(config.params).sort().map(([k, v]) => `${k}=${v}`).join('&') : '';
    return `${config.method}:${config.endpoint}${params ? `?${params}` : ''}`;
  }

  private normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (typeof error === 'object' && error !== null && 'message' in error) {
      return new ApiError(
        (error as any).message || 'Unknown error',
        (error as any).status || 500,
        (error as any).code,
        error
      );
    }

    return new ApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR', error);
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApiClient();

// Export error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Types are already exported above
