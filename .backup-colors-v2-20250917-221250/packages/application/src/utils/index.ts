// Error handling and API utilities
export * from './error-handler';
export * from './validation-middleware';
export * from './api-middleware';
export * from './api-logger';
export * from './api-metrics';
export * from './health-check';

// Re-export commonly used types and utilities
export type {
  ApiError,
  ValidationError,
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode
} from '../types/api-errors';

export {
  ErrorCodes,
  createSuccessResponse,
  createErrorResponse,
  createValidationError
} from '../types/api-errors';

// Convenience exports for quick access
export {
  CustomApiError,
  throwUnauthorized,
  throwForbidden,
  throwNotFound,
  throwConflict,
  throwValidationError,
  throwBusinessRuleViolation,
  throwRateLimited
} from './error-handler';

export {
  CommonSchemas,
  ValidationMiddleware,
  AuthSchemas,
  UserSchemas,
  ProjectSchemas,
  FileSchemas,
  NotificationSchemas,
  OrganizationSchemas
} from './validation-middleware';

export {
  createGetHandler,
  createPostHandler,
  createPutHandler,
  createPatchHandler,
  createDeleteHandler,
  createApiResponse,
  getPaginationInfo,
  buildSupabaseQuery
} from './api-middleware';

export {
  logger,
  LogLevel,
  RequestTimer,
  ServiceTimer,
  DatabaseTimer
} from './api-logger';

export {
  metrics,
  ApiMetrics,
  HealthMetrics,
  PerformanceMonitor
} from './api-metrics';

export {
  healthChecker,
  HealthCheckUtils,
  createHealthCheckEndpoint
} from './health-check';

export type {
  LogContext,
  LogEntry,
  Metric,
  Counter,
  Gauge,
  Histogram,
  Timer,
  HealthStatus,
  HealthCheckResult,
  ServiceHealthCheck,
  ApiContext,
  ApiHandlerConfig,
  ApiHandler
} from './api-logger';
