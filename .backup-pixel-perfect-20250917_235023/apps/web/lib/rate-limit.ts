import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

// In-memory fallback bucket
const memoryBuckets = new Map<string, { tokens: number; resetAt: number }>();

function getClientId(req: NextRequest) {
  const xfwd = req.headers.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0].trim();
  // NextRequest ip may not be present in all adapters; fallback to UA
  return req.headers.get('user-agent') || 'anonymous';
}

export function getRatelimiter(windowSec = 60, max = 30) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, `${windowSec} s`) });
    return {
      async limit(key: string) {
        const res = await ratelimit.limit(key);
        return { success: res.success, limit: max, reset: res.reset, remaining: res.remaining };
      }
    };
  }
  // Fallback: simple in-memory token bucket per key
  return {
    async limit(key: string) {
      const now = Date.now();
      const bucket = memoryBuckets.get(key);
      const windowMs = windowSec * 1000;
      if (!bucket || bucket.resetAt < now) {
        memoryBuckets.set(key, { tokens: max - 1, resetAt: now + windowMs });
        return { success: true, limit: max, reset: new Date(now + windowMs), remaining: max - 1 };
      }
      if (bucket.tokens <= 0) {
        return { success: false, limit: max, reset: new Date(bucket.resetAt), remaining: 0 };
      }
      bucket.tokens -= 1;
      memoryBuckets.set(key, bucket);
      return { success: true, limit: max, reset: new Date(bucket.resetAt), remaining: bucket.tokens };
    }
  };
}

export async function rateLimitRequest(req: NextRequest, keyPrefix = 'rl', windowSec = 60, max = 30) {
  const id = `${keyPrefix}:${getClientId(req)}`;
  const rl = getRatelimiter(windowSec, max);
  return rl.limit(id);
}
