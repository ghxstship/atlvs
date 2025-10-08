import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createValidationErrorResponse } from './schemas';

/**
 * Validation middleware for API routes
 */
export function withValidation<T, C = unknown>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T, context?: C) => Promise<Response>
) {
  return async (req: NextRequest, context?: C) => {
    try {
      let dataToValidate: unknown = {};

      // Extract data based on HTTP method
      if (req.method === 'GET') {
        // For GET requests, validate query parameters
        const url = new URL(req.url);
        dataToValidate = Object.fromEntries(url.searchParams.entries());
      } else if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        // For body requests, parse JSON
        try {
          dataToValidate = await req.json();
        } catch {
          return NextResponse.json(
            createValidationErrorResponse(
              new z.ZodError([{
                code: 'custom',
                message: 'Invalid JSON in request body',
                path: []
              }])
            ),
            { status: 400 }
          );
        }
      }

      // Validate the data
      const validationResult = schema.safeParse(dataToValidate);

      if (!validationResult.success) {
        return NextResponse.json(
          createValidationErrorResponse(validationResult.error),
          { status: 400 }
        );
      }

      // Call the handler with validated data
      return handler(req, validationResult.data, context);
    } catch (error) {
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Combined middleware for validation + other protections
 */
export function withSecureValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T, context?: unknown) => Promise<Response>
) {
  // Combine with other security middlewares
  return withValidation(schema, handler);
}

/**
 * Query parameter validation helper
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): z.SafeParseReturnType<Record<string, unknown>, T> {
  const params: Record<string, unknown> = Object.fromEntries(searchParams.entries());

  // Convert string values to appropriate types
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === 'true') params[key] = true;
    else if (value === 'false') params[key] = false;
    else if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) {
      params[key] = Number(value);
    }
  });

  return schema.safeParse(params);
}

/**
 * Path parameter validation helper
 */
export function validatePathParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string>
): z.SafeParseReturnType<Record<string, string>, T> {
  return schema.safeParse(params);
}

/**
 * Request body validation helper
 */
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  req: NextRequest
): Promise<z.SafeParseReturnType<unknown, T>> {
  try {
    const body = await req.json();
    return schema.safeParse(body);
  } catch {
    return {
      success: false,
      error: new z.ZodError([{
        code: 'custom',
        message: 'Invalid JSON in request body',
        path: []
      }])
    };
  }
}
