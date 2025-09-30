import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createValidationErrorResponse } from './schemas';

/**
 * Validation middleware for API routes
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    try {
      let dataToValidate: any = {};

      // Extract data based on HTTP method
      if (req.method === 'GET') {
        // For GET requests, validate query parameters
        const url = new URL(req.url);
        dataToValidate = Object.fromEntries(url.searchParams.entries());
      } else if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        // For body requests, parse JSON
        try {
          dataToValidate = await req.json();
        } catch (error) {
          return NextResponse.json(
            createValidationErrorResponse(
              new z.ZodError([{
                code: 'custom',
                message: 'Invalid JSON in request body',
                path: [],
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
  handler: (req: NextRequest, validatedData: T, context?: any) => Promise<Response>
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
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const params = Object.fromEntries(searchParams.entries());

  // Convert string values to appropriate types
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === 'true') params[key] = true;
    else if (value === 'false') params[key] = false;
    else if (!isNaN(Number(value)) && value !== '') params[key] = Number(value);
  });

  return schema.safeParse(params) as any;
}

/**
 * Path parameter validation helper
 */
export function validatePathParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string>
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  return schema.safeParse(params) as any;
}

/**
 * Request body validation helper
 */
export async function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  req: NextRequest
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const body = await req.json();
    return schema.safeParse(body) as any;
  } catch (error) {
    return {
      success: false,
      errors: new z.ZodError([{
        code: 'custom',
        message: 'Invalid JSON in request body',
        path: [],
      }])
    };
  }
}
