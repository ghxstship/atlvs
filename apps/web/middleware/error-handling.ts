/**
 * Error Handling Middleware
 * Catches and logs errors in middleware chain
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple logger for Edge runtime
const logger = {
  error: (message: string, error: Error, meta?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error, meta || {});
  }
};

export function errorHandlingMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      // Log error
      logger.error(
        'Middleware error',
        error as Error,
        {
          path: req.nextUrl.pathname,
          method: req.method
        }
      );

      // Return error response
      return new NextResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  };
}
