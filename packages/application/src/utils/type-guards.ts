// Comprehensive Type Guards and Runtime Validation
// Provides runtime type checking and validation for enhanced type safety

import {
  UUID,
  Email,
  URL,
  Timestamp,
  StrictServiceResult,
  StrictSuccessResult,
  StrictErrorResult,
  StrictUserEntity,
  StrictProjectEntity,
  StrictOrganizationEntity,
  StrictPaginationParams,
  StrictSortParams,
  StrictQueryParams,
  StrictPerformanceMetrics,
  StrictDatabaseHealthReport,
  StrictAlertRule,
  StrictValidationResult,
  StrictAuditEvent,
  StrictSystemEvent
} from '../types/strict-types';

// Primitive type guards
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = <T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] => {
  if (!Array.isArray(value)) return false;
  if (itemGuard) {
    return value.every(itemGuard);
  }
  return true;
};

export const isNonEmptyString = (value: unknown): value is string => {
  return isString(value) && value.trim().length > 0;
};

export const isPositiveNumber = (value: unknown): value is number => {
  return isNumber(value) && value > 0;
};

export const isNonNegativeNumber = (value: unknown): value is number => {
  return isNumber(value) && value >= 0;
};

// Branded type guards
export const isUUID = (value: unknown): value is UUID => {
  return isString(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export const isEmail = (value: unknown): value is Email => {
  return isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isURL = (value: unknown): value is URL => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const isTimestamp = (value: unknown): value is Timestamp => {
  return isString(value) && !isNaN(Date.parse(value));
};

// Entity type guards
export const isStrictUserEntity = (value: unknown): value is StrictUserEntity => {
  if (!isObject(value)) return false;
  
  return (
    isUUID(value.id) &&
    isTimestamp(value.created_at) &&
    isTimestamp(value.updated_at) &&
    isUUID(value.organization_id) &&
    isEmail(value.email) &&
    isNonEmptyString(value.full_name) &&
    (value.avatar_url === null || isURL(value.avatar_url)) &&
    isBoolean(value.is_active) &&
    (value.last_login_at === null || isTimestamp(value.last_login_at)) &&
    isObject(value.metadata)
  );
};

export const isStrictProjectEntity = (value: unknown): value is StrictProjectEntity => {
  if (!isObject(value)) return false;
  
  const validStatuses = ['active', 'inactive', 'archived'] as const;
  
  return (
    isUUID(value.id) &&
    isTimestamp(value.created_at) &&
    isTimestamp(value.updated_at) &&
    isUUID(value.organization_id) &&
    isNonEmptyString(value.name) &&
    (value.description === null || isString(value.description)) &&
    validStatuses.includes(value.status as any) &&
    isUUID(value.owner_id) &&
    isObject(value.settings) &&
    isArray(value.tags, isString)
  );
};

export const isStrictOrganizationEntity = (value: unknown): value is StrictOrganizationEntity => {
  if (!isObject(value)) return false;
  
  const validTiers = ['free', 'pro', 'enterprise'] as const;
  
  return (
    isUUID(value.id) &&
    isTimestamp(value.created_at) &&
    isTimestamp(value.updated_at) &&
    isUUID(value.organization_id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.slug) &&
    (value.domain === null || isString(value.domain)) &&
    isObject(value.settings) &&
    validTiers.includes(value.subscription_tier as any) &&
    isNonNegativeNumber(value.member_count)
  );
};

// Service result type guards
export const isStrictServiceResult = <T>(
  value: unknown,
  dataGuard?: (data: unknown) => data is T
): value is StrictServiceResult<T> => {
  if (!isObject(value)) return false;
  
  const hasRequiredFields = (
    isBoolean(value.success) &&
    'data' in value &&
    (value.error === null || isString(value.error)) &&
    isTimestamp(value.timestamp) &&
    isUUID(value.requestId)
  );
  
  if (!hasRequiredFields) return false;
  
  if (dataGuard && value.data !== null) {
    return dataGuard(value.data);
  }
  
  return true;
};

export const isStrictSuccessResult = <T>(
  value: unknown,
  dataGuard?: (data: unknown) => data is T
): value is StrictSuccessResult<T> => {
  if (!isStrictServiceResult(value, dataGuard)) return false;
  return value.success === true && value.data !== null && value.error === null;
};

export const isStrictErrorResult = (value: unknown): value is StrictErrorResult => {
  if (!isStrictServiceResult(value)) return false;
  return value.success === false && value.data === null && value.error !== null;
};

// Query parameter type guards
export const isStrictPaginationParams = (value: unknown): value is StrictPaginationParams => {
  if (!isObject(value)) return false;
  
  return (
    isPositiveNumber(value.page) &&
    isPositiveNumber(value.limit) &&
    isNonNegativeNumber(value.offset)
  );
};

export const isStrictSortParams = (value: unknown): value is StrictSortParams => {
  if (!isObject(value)) return false;
  
  return (
    isNonEmptyString(value.sortBy) &&
    (value.sortOrder === 'asc' || value.sortOrder === 'desc')
  );
};

export const isStrictQueryParams = (value: unknown): value is StrictQueryParams => {
  if (!isObject(value)) return false;
  
  return (
    isStrictPaginationParams(value) &&
    isStrictSortParams(value) &&
    isObject(value.filters) &&
    (value.search === undefined || isString(value.search))
  );
};

// Monitoring type guards
export const isStrictPerformanceMetrics = (value: unknown): value is StrictPerformanceMetrics => {
  if (!isObject(value)) return false;
  
  return (
    isNonNegativeNumber(value.responseTime) &&
    isNonNegativeNumber(value.throughput) &&
    isNonNegativeNumber(value.errorRate) &&
    isNonNegativeNumber(value.dbConnections) &&
    isNonNegativeNumber(value.cpuUsage) &&
    isNonNegativeNumber(value.memoryUsage) &&
    isTimestamp(value.timestamp)
  );
};

export const isStrictDatabaseHealthReport = (value: unknown): value is StrictDatabaseHealthReport => {
  if (!isObject(value)) return false;
  
  const validStatuses = ['healthy', 'warning', 'critical'] as const;
  
  return (
    isNonEmptyString(value.tableName) &&
    validStatuses.includes(value.status as any) &&
    isNonNegativeNumber(value.size) &&
    isNonNegativeNumber(value.rowCount) &&
    isNonNegativeNumber(value.indexUsage) &&
    (value.lastVacuum === null || isTimestamp(value.lastVacuum)) &&
    isArray(value.recommendations, isString)
  );
};

export const isStrictAlertRule = (value: unknown): value is StrictAlertRule => {
  if (!isObject(value)) return false;
  
  const validOperators = ['gt', 'lt', 'eq', 'gte', 'lte'] as const;
  const validSeverities = ['low', 'medium', 'high', 'critical'] as const;
  
  return (
    isUUID(value.id) &&
    isNonEmptyString(value.name) &&
    isNonEmptyString(value.metric) &&
    validOperators.includes(value.operator as any) &&
    isNumber(value.threshold) &&
    validSeverities.includes(value.severity as any) &&
    isArray(value.channels, isString) &&
    isPositiveNumber(value.cooldownMinutes) &&
    isBoolean(value.isEnabled) &&
    isUUID(value.createdBy) &&
    isTimestamp(value.createdAt)
  );
};

// Event type guards
export const isStrictAuditEvent = (value: unknown): value is StrictAuditEvent => {
  if (!isObject(value)) return false;
  
  const hasBaseFields = (
    isUUID(value.id) &&
    isNonEmptyString(value.type) &&
    isTimestamp(value.timestamp) &&
    isNonEmptyString(value.source) &&
    isUUID(value.userId) &&
    isUUID(value.organizationId)
  );
  
  if (!hasBaseFields) return false;
  
  return (
    isNonEmptyString(value.action) &&
    isNonEmptyString(value.resource) &&
    isUUID(value.resourceId) &&
    isObject(value.changes) &&
    isObject(value.metadata)
  );
};

export const isStrictSystemEvent = (value: unknown): value is StrictSystemEvent => {
  if (!isObject(value)) return false;
  
  const validLevels = ['info', 'warn', 'error', 'debug'] as const;
  
  const hasBaseFields = (
    isUUID(value.id) &&
    isNonEmptyString(value.type) &&
    isTimestamp(value.timestamp) &&
    isNonEmptyString(value.source) &&
    isUUID(value.userId) &&
    isUUID(value.organizationId)
  );
  
  if (!hasBaseFields) return false;
  
  return (
    validLevels.includes(value.level as any) &&
    isNonEmptyString(value.message) &&
    isObject(value.context) &&
    (value.stackTrace === undefined || isString(value.stackTrace))
  );
};

// Validation result type guard
export const isStrictValidationResult = (value: unknown): value is StrictValidationResult => {
  if (!isObject(value)) return false;
  
  const isStringArray = (arr: unknown): arr is readonly string[] => {
    return isArray(arr, isString);
  };
  
  const isErrorsObject = (obj: unknown): obj is Record<string, readonly string[]> => {
    if (!isObject(obj)) return false;
    return Object.values(obj).every(isStringArray);
  };
  
  return (
    isBoolean(value.isValid) &&
    isErrorsObject(value.errors) &&
    isErrorsObject(value.warnings)
  );
};

// Runtime validation functions
export const validateAndTransform = <T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage: string
): T => {
  if (!guard(value)) {
    throw new Error(errorMessage);
  }
  return value;
};

export const validateArray = <T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T,
  fieldName: string
): T[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Field '${fieldName}' must be an array`);
  }
  
  const invalidIndex = value.findIndex((item, index) => !itemGuard(item));
  if (invalidIndex !== -1) {
    throw new Error(`Invalid item at index ${invalidIndex} in field '${fieldName}'`);
  }
  
  return value as T[];
};

export const validateObject = <T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  fieldName: string
): T => {
  if (!guard(value)) {
    throw new Error(`Field '${fieldName}' has invalid structure or values`);
  }
  return value;
};

// Partial validation for updates
export const validatePartial = <T extends Record<string, unknown>>(
  value: unknown,
  fieldGuards: Partial<{ [K in keyof T]: (value: unknown) => value is T[K] }>,
  fieldName: string
): Partial<T> => {
  if (!isObject(value)) {
    throw new Error(`Field '${fieldName}' must be an object`);
  }
  
  const result: Partial<T> = {};
  
  for (const [key, guard] of Object.entries(fieldGuards)) {
    if (key in value && guard) {
      if (!guard(value[key])) {
        throw new Error(`Invalid value for field '${key}' in '${fieldName}'`);
      }
      (result as any)[key] = value[key];
    }
  }
  
  return result;
};

// Deep validation for nested objects
export const validateNested = <T>(
  value: unknown,
  path: string,
  validator: (value: unknown, path: string) => T
): T => {
  try {
    return validator(value, path);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Validation failed at ${path}: ${error.message}`);
    }
    throw error;
  }
};

// Collection validation helpers
export const validateUniqueArray = <T>(
  array: T[],
  keyExtractor: (item: T) => string | number,
  fieldName: string
): T[] => {
  const keys = array.map(keyExtractor);
  const uniqueKeys = new Set(keys);
  
  if (keys.length !== uniqueKeys.size) {
    throw new Error(`Field '${fieldName}' contains duplicate items`);
  }
  
  return array;
};

export const validateEnum = <T extends string>(
  value: unknown,
  validValues: readonly T[],
  fieldName: string
): T => {
  if (!isString(value) || !validValues.includes(value as T)) {
    throw new Error(`Field '${fieldName}' must be one of: ${validValues.join(', ')}`);
  }
  return value as T;
};

// Range validation
export const validateRange = (
  value: unknown,
  min: number,
  max: number,
  fieldName: string
): number => {
  if (!isNumber(value)) {
    throw new Error(`Field '${fieldName}' must be a number`);
  }
  
  if (value < min || value > max) {
    throw new Error(`Field '${fieldName}' must be between ${min} and ${max}`);
  }
  
  return value;
};

export const validateStringLength = (
  value: unknown,
  minLength: number,
  maxLength: number,
  fieldName: string
): string => {
  if (!isString(value)) {
    throw new Error(`Field '${fieldName}' must be a string`);
  }
  
  if (value.length < minLength || value.length > maxLength) {
    throw new Error(`Field '${fieldName}' must be between ${minLength} and ${maxLength} characters`);
  }
  
  return value;
};

// Async validation support
export const validateAsync = async <T>(
  value: unknown,
  asyncValidator: (value: unknown) => Promise<T>,
  fieldName: string
): Promise<T> => {
  try {
    return await asyncValidator(value);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Async validation failed for field '${fieldName}': ${error.message}`);
    }
    throw error;
  }
};

// Batch validation
export const validateBatch = <T>(
  values: unknown[],
  validator: (value: unknown, index: number) => T,
  fieldName: string
): T[] => {
  const results: T[] = [];
  const errors: string[] = [];
  
  values.forEach((value, index) => {
    try {
      results.push(validator(value, index));
    } catch (error) {
      if (error instanceof Error) {
        errors.push(`Item ${index}: ${error.message}`);
      } else {
        errors.push(`Item ${index}: Unknown validation error`);
      }
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Batch validation failed for field '${fieldName}':\n${errors.join('\n')}`);
  }
  
  return results;
};
