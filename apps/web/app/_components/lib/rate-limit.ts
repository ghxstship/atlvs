import { NextRequest } from 'next/server';

// Simple rate limiting implementation
// Rate limiting with in-memory cache for development
// In production, replace with Redis-based solution

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitRecord>();

export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000 // 1 minute default
): Promise<{ success: boolean; remaining?: number }> {
  const key = `rate_limit_${identifier}`;
  const now = Date.now();
  
  const record = cache.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset window if expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }
  
  // Increment count
  record.count++;
  cache.set(key, record);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    for (const [k, v] of cache.entries()) {
      if (now > v.resetTime) {
        cache.delete(k);
      }
    }
  }
  
  return { success: true, remaining: maxRequests - record.count };
}
