import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  ApiError, 
  ApiErrorResponse, 
  ValidationError,
  ErrorCodes, 
  ErrorStatusMappings,
  createApiError,
  createValidationError,
  createErrorResponse 
} from '../types/api-errors';

export class ApiErrorHandler {
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getPathFromRequest(request: NextRequest): string {
    return `${request.method} ${request.nextUrl.pathname}`;
  }

  static handleError(
    error: unknown,
    request?: NextRequest,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    const id = requestId || this.generateRequestId();
    const path = request ? this.getPathFromRequest(request) : undefined;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return this.handleValidationError(error, path, id);
    }

    // Handle custom API errors
    if (this.isCustomApiError(error)) {
      return this.handleCustomApiError(error, path, id);
    }

    // Handle Supabase errors
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error, path, id);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return this.handleGenericError(error, path, id);
    }

    // Handle unknown errors
    return this.handleUnknownError(error, path, id);
  }

  private static handleValidationError(
    zodError: ZodError,
    path?: string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    const validationErrors: ValidationError[] = zodError.errors.map(err => {
      const field = err.path.join('.');
      let code = ErrorCodes.VALIDATION_FAILED;
      
      // Map Zod error codes to our error codes
      switch (err.code) {
        case 'invalid_type':
          code = ErrorCodes.INVALID_FORMAT;
          break;
        case 'too_small':
          code = ErrorCodes.VALUE_TOO_SHORT;
          break;
        case 'too_big':
          code = ErrorCodes.VALUE_TOO_LONG;
          break;
        case 'invalid_string':
          if (err.validation === 'email') {
            code = ErrorCodes.INVALID_EMAIL;
          } else if (err.validation === 'url') {
            code = ErrorCodes.INVALID_URL;
          } else {
            code = ErrorCodes.INVALID_FORMAT;
          }
          break;
        case 'invalid_enum_value':
          code = ErrorCodes.INVALID_ENUM_VALUE;
          break;
        case 'invalid_date':
          code = ErrorCodes.INVALID_DATE;
          break;
        default:
          code = ErrorCodes.VALIDATION_FAILED;
      }

      return createValidationError(field, code, err.message, err.received);
    });

    const apiError = createApiError(
      ErrorCodes.VALIDATION_FAILED,
      'Request validation failed',
      { zodErrors: zodError.errors },
      path,
      requestId
    );

    const response = createErrorResponse(apiError, validationErrors);
    return NextResponse.json(response, { 
      status: ErrorStatusMappings[ErrorCodes.VALIDATION_FAILED] 
    });
  }

  private static handleCustomApiError(
    error: CustomApiError,
    path?: string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    const apiError = createApiError(
      error.code,
      error.message,
      error.details,
      path,
      requestId
    );

    const response = createErrorResponse(apiError, error.validationErrors);
    const status = ErrorStatusMappings[error.code] || 500;

    return NextResponse.json(response, { status });
  }

  private static handleSupabaseError(
    error: any,
    path?: string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    let code = ErrorCodes.DATABASE_ERROR;
    let message = 'Database operation failed';

    // Map common Supabase error codes
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': // Not found
          code = ErrorCodes.RESOURCE_NOT_FOUND;
          message = 'Resource not found';
          break;
        case '23505': // Unique violation
          code = ErrorCodes.RESOURCE_ALREADY_EXISTS;
          message = 'Resource already exists';
          break;
        case '23503': // Foreign key violation
          code = ErrorCodes.DEPENDENCY_VIOLATION;
          message = 'Cannot delete resource with dependencies';
          break;
        case '42501': // Insufficient privilege
          code = ErrorCodes.INSUFFICIENT_PERMISSIONS;
          message = 'Insufficient permissions';
          break;
        default:
          code = ErrorCodes.DATABASE_ERROR;
          message = error.message || 'Database error';
      }
    }

    const apiError = createApiError(
      code,
      message,
      { 
        supabaseCode: error.code,
        supabaseMessage: error.message,
        hint: error.hint 
      },
      path,
      requestId
    );

    const response = createErrorResponse(apiError);
    const status = ErrorStatusMappings[code];

    return NextResponse.json(response, { status });
  }

  private static handleGenericError(
    error: Error,
    path?: string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    // Log the error for debugging
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      path,
      requestId
    });

    const apiError = createApiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? {
        originalMessage: error.message,
        stack: error.stack
      } : undefined,
      path,
      requestId
    );

    const response = createErrorResponse(apiError);
    return NextResponse.json(response, { 
      status: ErrorStatusMappings[ErrorCodes.INTERNAL_SERVER_ERROR] 
    });
  }

  private static handleUnknownError(
    error: unknown,
    path?: string,
    requestId?: string
  ): NextResponse<ApiErrorResponse> {
    console.error('Unknown API Error:', { error, path, requestId });

    const apiError = createApiError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined,
      path,
      requestId
    );

    const response = createErrorResponse(apiError);
    return NextResponse.json(response, { 
      status: ErrorStatusMappings[ErrorCodes.INTERNAL_SERVER_ERROR] 
    });
  }

  private static isCustomApiError(error: unknown): error is CustomApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as any).code === 'string'
    );
  }

  private static isSupabaseError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'message' in error) &&
      // Check for common Supabase error properties
      ('hint' in error || 'details' in error || String(error).includes('supabase'))
    );
  }
}

// Custom API Error class for throwing structured errors
export class CustomApiError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly validationErrors?: ValidationError[];

  constructor(
    code: string,
    message?: string,
    details?: Record<string, any>,
    validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'CustomApiError';
    this.code = code;
    this.details = details;
    this.validationErrors = validationErrors;
  }
}

// Convenience functions for throwing common errors
export const throwUnauthorized = (message?: string, details?: Record<string, any>) => {
  throw new CustomApiError(ErrorCodes.UNAUTHORIZED, message, details);
};

export const throwForbidden = (message?: string, details?: Record<string, any>) => {
  throw new CustomApiError(ErrorCodes.FORBIDDEN, message, details);
};

export const throwNotFound = (resource: string, id?: string) => {
  throw new CustomApiError(
    ErrorCodes.RESOURCE_NOT_FOUND,
    `${resource} not found`,
    { resource, id }
  );
};

export const throwConflict = (message?: string, details?: Record<string, any>) => {
  throw new CustomApiError(ErrorCodes.RESOURCE_CONFLICT, message, details);
};

export const throwValidationError = (
  message: string,
  validationErrors: ValidationError[]
) => {
  throw new CustomApiError(
    ErrorCodes.VALIDATION_FAILED,
    message,
    undefined,
    validationErrors
  );
};

export const throwBusinessRuleViolation = (message: string, details?: Record<string, any>) => {
  throw new CustomApiError(ErrorCodes.BUSINESS_RULE_VIOLATION, message, details);
};

export const throwRateLimitExceeded = (details?: Record<string, any>) => {
  throw new CustomApiError(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded',
    details
  );
};

// API Route wrapper for consistent error handling
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args.find(arg => arg instanceof NextRequest) as NextRequest | undefined;
      return ApiErrorHandler.handleError(error, request);
    }
  };
}
