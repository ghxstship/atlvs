/**
 * Error Handling Middleware
 * Catches and logs errors in middleware chain
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsoleLogger, LogLevel } from '@ghxstship/infrastructure';

const logger = new ConsoleLogger(
  { service: 'web-middleware-errors' },
  LogLevel.ERROR
);

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
          method: req.method,
        }
      );

      // Return error response
      return new NextResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}
