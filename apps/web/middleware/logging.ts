/**
 * Logging Middleware
 * Simple console logging for Edge runtime compatibility
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple logger for Edge runtime
const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(`[INFO] ${message}`, meta || {});
  }
};

export function loggingMiddleware(req: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    userAgent: req.headers.get('user-agent') || 'unknown'
  });

  // Clone response to add headers
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  
  // Log response (in production, use async logging)
  const duration = Date.now() - startTime;
  logger.info('Request completed', {
    requestId,
    duration,
    status: response.status
  });

  return response;
}
