/**
 * Enterprise-grade rate limiting and API throttling implementation
 * Supports multiple algorithms and distributed rate limiting
 */

import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private redis?: Redis;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig, redis?: Redis) {
    this.redis = redis;
    this.config = {
      keyGenerator: (req) => req.ip || 'anonymous',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      ...config
    };
  }

  async checkLimit(request: any): Promise<RateLimitResult> {
    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (this.redis) {
      return this.checkLimitRedis(key, now, windowStart);
    } else {
      return this.checkLimitMemory(key, now, windowStart);
    }
  }

  private async checkLimitRedis(key: string, now: number, windowStart: number): Promise<RateLimitResult> {
    const pipeline = this.redis!.pipeline();
    
    // Remove old entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    
    // Set expiration
    pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));

    const results = await pipeline.exec();
    const count = (results[1] as number) || 0;
    
    const remaining = Math.max(0, this.config.maxRequests - count - 1);
    const resetTime = now + this.config.windowMs;
    
    return {
      success: count < this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
      retryAfter: count >= this.config.maxRequests ? Math.ceil(this.config.windowMs / 1000) : undefined
    };
  }

  private memoryStore = new Map<string, number[]>();

  private checkLimitMemory(key: string, now: number, windowStart: number): RateLimitResult {
    const requests = this.memoryStore.get(key) || [];
    
    // Remove old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    // Add current request
    validRequests.push(now);
    
    // Update store
    this.memoryStore.set(key, validRequests);
    
    const remaining = Math.max(0, this.config.maxRequests - validRequests.length);
    const resetTime = now + this.config.windowMs;
    
    return {
      success: validRequests.length <= this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining,
      resetTime,
      retryAfter: validRequests.length > this.config.maxRequests ? Math.ceil(this.config.windowMs / 1000) : undefined
    };
  }

  private generateKey(request: any): string {
    const baseKey = this.config.keyGenerator(request);
    return `rate_limit:${baseKey}`;
  }

  // Clean up memory store periodically
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.memoryStore.entries()) {
      const validRequests = requests.filter(time => time > now - this.config.windowMs);
      if (validRequests.length === 0) {
        this.memoryStore.delete(key);
      } else {
        this.memoryStore.set(key, validRequests);
      }
    }
  }
}

// Middleware factory for Next.js API routes
export function createRateLimitMiddleware(config: RateLimitConfig, redis?: Redis) {
  const limiter = new RateLimiter(config, redis);

  return async function rateLimitMiddleware(req: any, res: any, next?: () => void) {
    try {
      const result = await limiter.checkLimit(req);

      // Set standard headers
      if (config.standardHeaders) {
        res.setHeader('X-RateLimit-Limit', result.limit);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      }

      // Set legacy headers
      if (config.legacyHeaders) {
        res.setHeader('X-Rate-Limit-Limit', result.limit);
        res.setHeader('X-Rate-Limit-Remaining', result.remaining);
        res.setHeader('X-Rate-Limit-Reset', Math.ceil(result.resetTime / 1000));
      }

      if (!result.success) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }
        
        return res.status(429).json({
          error: config.message || 'Too many requests',
          retryAfter: result.retryAfter
        });
      }

      if (next) {
        next();
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiter fails
      if (next) {
        next();
      }
    }
  };
}

// Predefined rate limit configurations
export const RateLimitPresets = {
  // Very strict - for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },
  
  // Standard API rate limit
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20
  },
  
  // General web requests
  web: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000
  }
} as const;

// Utility function to get client IP
export function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// Advanced rate limiter with multiple windows
export class SlidingWindowRateLimiter {
  private redis?: Redis;
  private windows: { windowMs: number; maxRequests: number }[];

  constructor(windows: { windowMs: number; maxRequests: number }[], redis?: Redis) {
    this.windows = windows.sort((a, b) => a.windowMs - b.windowMs);
    this.redis = redis;
  }

  async checkLimit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    
    for (const window of this.windows) {
      const windowStart = now - window.windowMs;
      const result = await this.checkWindowLimit(key, window, now, windowStart);
      
      if (!result.success) {
        return result;
      }
    }

    // All windows passed, record the request
    await this.recordRequest(key, now);
    
    return {
      success: true,
      limit: this.windows[0].maxRequests,
      remaining: this.windows[0].maxRequests - 1,
      resetTime: now + this.windows[0].windowMs
    };
  }

  private async checkWindowLimit(
    key: string, 
    window: { windowMs: number; maxRequests: number }, 
    now: number, 
    windowStart: number
  ): Promise<RateLimitResult> {
    if (this.redis) {
      const count = await this.redis.zcount(`${key}:${window.windowMs}`, windowStart, now);
      return {
        success: count < window.maxRequests,
        limit: window.maxRequests,
        remaining: Math.max(0, window.maxRequests - count - 1),
        resetTime: now + window.windowMs,
        retryAfter: count >= window.maxRequests ? Math.ceil(window.windowMs / 1000) : undefined
      };
    }

    // Memory fallback (simplified)
    return {
      success: true,
      limit: window.maxRequests,
      remaining: window.maxRequests - 1,
      resetTime: now + window.windowMs
    };
  }

  private async recordRequest(key: string, now: number) {
    if (this.redis) {
      const pipeline = this.redis.pipeline();
      
      for (const window of this.windows) {
        const windowKey = `${key}:${window.windowMs}`;
        const windowStart = now - window.windowMs;
        
        pipeline.zremrangebyscore(windowKey, 0, windowStart);
        pipeline.zadd(windowKey, { score: now, member: `${now}-${Math.random()}` });
        pipeline.expire(windowKey, Math.ceil(window.windowMs / 1000));
      }
      
      await pipeline.exec();
    }
  }
}
