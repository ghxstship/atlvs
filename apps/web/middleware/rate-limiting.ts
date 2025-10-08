/**
 * Rate Limiting Middleware
 * Protects against abuse and DDoS
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

export function rateLimitingMiddleware(
  req: NextRequest,
  config: RateLimitConfig = defaultConfig
): NextResponse | null {
  // Get client identifier (IP or user ID)
  const clientId = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    // Create new window
    entry = {
      count: 1,
      resetAt: now + config.windowMs
    };
    rateLimitMap.set(clientId, entry);
    return null; // Allow request
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': entry.resetAt.toString()
        }
      }
    );
  }

  // Allow request and add rate limit headers
  return null; // Will be handled by next middleware
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // Cleanup every minute
