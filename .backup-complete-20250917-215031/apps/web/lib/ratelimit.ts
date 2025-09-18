import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  const redis = new Redis({ url, token });
  limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'), analytics: false });
  return limiter;
}

export async function limitRequest(req: NextRequest, keyHint?: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const org = req.headers.get('x-org-id') || 'global';
  const key = `rate:${keyHint ?? 'default'}:${org}:${ip}`;
  const lim = getLimiter();
  if (!lim) {
    // If rate limiter is not configured, allow by default (no-op)
    return { success: true, limit: 0, reset: 0, remaining: 0 } as any;
  }
  return lim.limit(key);
}
