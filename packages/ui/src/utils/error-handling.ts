/**
 * ENTERPRISE ERROR HANDLING UTILITIES
 * Zero-Tolerance Error Management System
 */

// =============================================================================
// ERROR TYPES AND INTERFACES
// =============================================================================

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly stack?: string;
}

export interface ValidationError extends AppError {
  readonly field: string;
  readonly value: unknown;
}

export interface NetworkError extends AppError {
  readonly status: number;
  readonly url: string;
  readonly method: string;
}

export interface DatabaseError extends AppError {
  readonly query?: string;
  readonly table?: string;
}

// =============================================================================
// ERROR FACTORY FUNCTIONS
// =============================================================================

export const createAppError = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): AppError => ({
  code,
  message,
  details,
  timestamp: new Date(),
  stack: new Error().stack,
});

export const createValidationError = (
  field: string,
  value: unknown,
  message: string
): ValidationError => ({
  ...createAppError('VALIDATION_ERROR', message),
  field,
  value,
});

export const createNetworkError = (
  status: number,
  url: string,
  method: string,
  message: string
): NetworkError => ({
  ...createAppError('NETWORK_ERROR', message),
  status,
  url,
  method,
});

export const createDatabaseError = (
  message: string,
  query?: string,
  table?: string
): DatabaseError => ({
  ...createAppError('DATABASE_ERROR', message),
  query,
  table,
});

// =============================================================================
// RESULT PATTERN IMPLEMENTATION
// =============================================================================

export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export const tryCatch = async <T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => AppError
): Promise<Result<T, AppError>> => {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    const appError = errorHandler 
      ? errorHandler(error)
      : createAppError(
          'UNKNOWN_ERROR',
          error instanceof Error ? error.message : 'An unknown error occurred',
          { originalError: error }
        );
    return failure(appError);
  }
};

export const tryCatchSync = <T>(
  fn: () => T,
  errorHandler?: (error: unknown) => AppError
): Result<T, AppError> => {
  try {
    const data = fn();
    return success(data);
  } catch (error) {
    const appError = errorHandler 
      ? errorHandler(error)
      : createAppError(
          'UNKNOWN_ERROR',
          error instanceof Error ? error.message : 'An unknown error occurred',
          { originalError: error }
        );
    return failure(appError);
  }
};

// =============================================================================
// ERROR BOUNDARY UTILITIES
// =============================================================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export const createErrorBoundaryState = (): ErrorBoundaryState => ({
  hasError: false,
});

export const handleErrorBoundaryError = (error: Error): ErrorBoundaryState => ({
  hasError: true,
  error: createAppError(
    'COMPONENT_ERROR',
    error.message,
    { stack: error.stack }
  ),
});

// =============================================================================
// ERROR LOGGING AND REPORTING
// =============================================================================

export interface ErrorReporter {
  report(error: AppError): void;
}

export class ConsoleErrorReporter implements ErrorReporter {
  report(error: AppError): void {
    console.error('🚨 Application Error:', {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      details: error.details,
      stack: error.stack,
    });
  }
}

export class ProductionErrorReporter implements ErrorReporter {
  constructor(private readonly endpoint: string) {}

  report(error: AppError): void {
    // In production, send to monitoring service
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          timestamp: error.timestamp.toISOString(),
          details: error.details,
        },
      }),
    }).catch(() => {
      // Fallback to console if reporting fails
      console.error('Failed to report error:', error);
    });
  }
}

// Global error reporter instance
let globalErrorReporter: ErrorReporter = new ConsoleErrorReporter();

export const setErrorReporter = (reporter: ErrorReporter): void => {
  globalErrorReporter = reporter;
};

export const reportError = (error: AppError): void => {
  globalErrorReporter.report(error);
};

// =============================================================================
// RETRY UTILITIES
// =============================================================================

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: 'linear' | 'exponential';
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, delay: 1000, backoff: 'exponential' }
): Promise<Result<T, AppError>> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return success(result);
    } catch (error) {
      lastError = error;
      
      if (attempt < options.maxAttempts) {
        const delay = options.backoff === 'exponential' 
          ? options.delay * Math.pow(2, attempt - 1)
          : options.delay * attempt;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return failure(createAppError(
    'RETRY_FAILED',
    `Failed after ${options.maxAttempts} attempts`,
    { lastError, attempts: options.maxAttempts }
  ));
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export const validateRequired = <T>(
  value: T | null | undefined,
  field: string
): Result<T, ValidationError> => {
  if (value === null || value === undefined || value === '') {
    return failure(createValidationError(field, value, `${field} is required`));
  }
  return success(value);
};

export const validateEmail = (
  email: string,
  field: string = 'email'
): Result<string, ValidationError> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return failure(createValidationError(field, email, 'Invalid email format'));
  }
  return success(email);
};

export const validateMinLength = (
  value: string,
  minLength: number,
  field: string
): Result<string, ValidationError> => {
  if (value.length < minLength) {
    return failure(createValidationError(
      field,
      value,
      `${field} must be at least ${minLength} characters`
    ));
  }
  return success(value);
};
