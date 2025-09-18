// Standardized API Error Types and Schemas
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  validationErrors?: ValidationError[];
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standard Error Codes
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_URL: 'INVALID_URL',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',

  // Resource Management
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',

  // Business Logic
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DEPENDENCY_VIOLATION: 'DEPENDENCY_VIOLATION',

  // System & Infrastructure
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // File Operations
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // Organization & Multi-tenancy
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
  ORGANIZATION_INACTIVE: 'ORGANIZATION_INACTIVE',
  TENANT_ISOLATION_VIOLATION: 'TENANT_ISOLATION_VIOLATION',

  // Generic
  BAD_REQUEST: 'BAD_REQUEST',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  NOT_ACCEPTABLE: 'NOT_ACCEPTABLE',
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// HTTP Status Code Mappings
export const ErrorStatusMappings: Record<ErrorCode, number> = {
  // 400 Bad Request
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.VALIDATION_FAILED]: 400,
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
  [ErrorCodes.VALUE_TOO_LONG]: 400,
  [ErrorCodes.VALUE_TOO_SHORT]: 400,
  [ErrorCodes.INVALID_EMAIL]: 400,
  [ErrorCodes.INVALID_URL]: 400,
  [ErrorCodes.INVALID_DATE]: 400,
  [ErrorCodes.INVALID_ENUM_VALUE]: 400,
  [ErrorCodes.INVALID_FILE_TYPE]: 400,
  [ErrorCodes.FILE_TOO_LARGE]: 400,

  // 401 Unauthorized
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.TOKEN_INVALID]: 401,

  // 403 Forbidden
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 403,
  [ErrorCodes.TENANT_ISOLATION_VIOLATION]: 403,

  // 404 Not Found
  [ErrorCodes.RESOURCE_NOT_FOUND]: 404,
  [ErrorCodes.FILE_NOT_FOUND]: 404,
  [ErrorCodes.ORGANIZATION_NOT_FOUND]: 404,

  // 405 Method Not Allowed
  [ErrorCodes.METHOD_NOT_ALLOWED]: 405,

  // 406 Not Acceptable
  [ErrorCodes.NOT_ACCEPTABLE]: 406,

  // 409 Conflict
  [ErrorCodes.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCodes.RESOURCE_CONFLICT]: 409,
  [ErrorCodes.BUSINESS_RULE_VIOLATION]: 409,
  [ErrorCodes.DEPENDENCY_VIOLATION]: 409,

  // 415 Unsupported Media Type
  [ErrorCodes.UNSUPPORTED_MEDIA_TYPE]: 415,

  // 422 Unprocessable Entity
  [ErrorCodes.RESOURCE_LOCKED]: 422,
  [ErrorCodes.RESOURCE_EXPIRED]: 422,
  [ErrorCodes.ORGANIZATION_INACTIVE]: 422,

  // 429 Too Many Requests
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.QUOTA_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.STORAGE_ERROR]: 500,
  [ErrorCodes.UPLOAD_FAILED]: 500,

  // 502 Bad Gateway
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 502,

  // 503 Service Unavailable
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,

  // 504 Gateway Timeout
  [ErrorCodes.TIMEOUT_ERROR]: 504,
  [ErrorCodes.NETWORK_ERROR]: 504
};

// Error Message Templates
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'Authentication required',
  [ErrorCodes.FORBIDDEN]: 'Access denied',
  [ErrorCodes.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ErrorCodes.TOKEN_INVALID]: 'Invalid authentication token',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions for this operation',

  [ErrorCodes.VALIDATION_FAILED]: 'Validation failed',
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 'Required field is missing',
  [ErrorCodes.INVALID_FORMAT]: 'Invalid format',
  [ErrorCodes.VALUE_TOO_LONG]: 'Value exceeds maximum length',
  [ErrorCodes.VALUE_TOO_SHORT]: 'Value is below minimum length',
  [ErrorCodes.INVALID_EMAIL]: 'Invalid email address',
  [ErrorCodes.INVALID_URL]: 'Invalid URL format',
  [ErrorCodes.INVALID_DATE]: 'Invalid date format',
  [ErrorCodes.INVALID_ENUM_VALUE]: 'Invalid enum value',

  [ErrorCodes.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ErrorCodes.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCodes.RESOURCE_CONFLICT]: 'Resource conflict',
  [ErrorCodes.RESOURCE_LOCKED]: 'Resource is locked',
  [ErrorCodes.RESOURCE_EXPIRED]: 'Resource has expired',

  [ErrorCodes.OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  [ErrorCodes.BUSINESS_RULE_VIOLATION]: 'Business rule violation',
  [ErrorCodes.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorCodes.DEPENDENCY_VIOLATION]: 'Cannot delete resource with dependencies',

  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCodes.DATABASE_ERROR]: 'Database error',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCodes.NETWORK_ERROR]: 'Network error',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timeout',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',

  [ErrorCodes.FILE_NOT_FOUND]: 'File not found',
  [ErrorCodes.FILE_TOO_LARGE]: 'File size exceeds limit',
  [ErrorCodes.INVALID_FILE_TYPE]: 'Invalid file type',
  [ErrorCodes.STORAGE_ERROR]: 'Storage error',
  [ErrorCodes.UPLOAD_FAILED]: 'File upload failed',

  [ErrorCodes.ORGANIZATION_NOT_FOUND]: 'Organization not found',
  [ErrorCodes.ORGANIZATION_INACTIVE]: 'Organization is inactive',
  [ErrorCodes.TENANT_ISOLATION_VIOLATION]: 'Tenant isolation violation',

  [ErrorCodes.BAD_REQUEST]: 'Bad request',
  [ErrorCodes.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ErrorCodes.NOT_ACCEPTABLE]: 'Not acceptable',
  [ErrorCodes.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported media type'
};

// Error Factory Functions
export function createApiError(
  code: ErrorCode,
  message?: string,
  details?: Record<string, any>,
  path?: string,
  requestId?: string
): ApiError {
  return {
    code,
    message: message || ErrorMessages[code],
    details,
    timestamp: new Date().toISOString(),
    path,
    requestId
  };
}

export function createValidationError(
  field: string,
  code: ErrorCode,
  message?: string,
  value?: any
): ValidationError {
  return {
    field,
    code,
    message: message || ErrorMessages[code],
    value
  };
}

export function createErrorResponse(
  error: ApiError,
  validationErrors?: ValidationError[]
): ApiErrorResponse {
  return {
    success: false,
    error,
    validationErrors
  };
}

export function createSuccessResponse<T>(
  data: T,
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  }
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta
  };
}

// Type Guards
export function isApiError(response: any): response is ApiErrorResponse {
  return response && response.success === false && response.error;
}

export function isApiSuccess<T>(response: any): response is ApiSuccessResponse<T> {
  return response && response.success === true && response.data !== undefined;
}
