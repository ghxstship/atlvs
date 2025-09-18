// Strict Type Definitions for Enhanced Type Safety
// This file provides comprehensive type definitions with strict null checks and runtime validation

// Utility types for strict type checking
export type NonNullable<T> = T extends null | undefined ? never : T;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Branded types for type safety
export type Brand<T, B> = T & { readonly __brand: B };
export type UUID = Brand<string, 'UUID'>;
export type Email = Brand<string, 'Email'>;
export type URL = Brand<string, 'URL'>;
export type Timestamp = Brand<string, 'Timestamp'>;
export type JSONString = Brand<string, 'JSONString'>;

// Strict service result types
export interface StrictServiceResult<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: string | null;
  readonly timestamp: Timestamp;
  readonly requestId: UUID;
}

export interface StrictSuccessResult<T> extends StrictServiceResult<T> {
  readonly success: true;
  readonly data: NonNullable<T>;
  readonly error: null;
}

export interface StrictErrorResult extends StrictServiceResult<null> {
  readonly success: false;
  readonly data: null;
  readonly error: NonNullable<string>;
}

// Database entity base types with strict constraints
export interface StrictEntityBase {
  readonly id: UUID;
  readonly created_at: Timestamp;
  readonly updated_at: Timestamp;
  readonly organization_id: UUID;
}

export interface StrictUserEntity extends StrictEntityBase {
  readonly email: Email;
  readonly full_name: string;
  readonly avatar_url: URL | null;
  readonly is_active: boolean;
  readonly last_login_at: Timestamp | null;
  readonly metadata: Record<string, unknown>;
}

export interface StrictProjectEntity extends StrictEntityBase {
  readonly name: string;
  readonly description: string | null;
  readonly status: 'active' | 'inactive' | 'archived';
  readonly owner_id: UUID;
  readonly settings: Record<string, unknown>;
  readonly tags: readonly string[];
}

export interface StrictOrganizationEntity extends StrictEntityBase {
  readonly name: string;
  readonly slug: string;
  readonly domain: string | null;
  readonly settings: Record<string, unknown>;
  readonly subscription_tier: 'free' | 'pro' | 'enterprise';
  readonly member_count: number;
}

// API request/response types with strict validation
export interface StrictPaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly offset: number;
}

export interface StrictSortParams {
  readonly sortBy: string;
  readonly sortOrder: 'asc' | 'desc';
}

export interface StrictFilterParams {
  readonly filters: Record<string, unknown>;
  readonly search?: string;
}

export interface StrictQueryParams extends StrictPaginationParams, StrictSortParams, StrictFilterParams {}

export interface StrictPaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
  readonly meta: {
    readonly requestId: UUID;
    readonly timestamp: Timestamp;
    readonly duration: number;
  };
}

// Service context with strict typing
export interface StrictServiceContext {
  readonly supabase: any; // TODO: Add proper Supabase client type
  readonly organizationId: UUID;
  readonly userId: UUID;
  readonly requestId: UUID;
  readonly timestamp: Timestamp;
}

// Monitoring and metrics types
export interface StrictPerformanceMetrics {
  readonly responseTime: number;
  readonly throughput: number;
  readonly errorRate: number;
  readonly dbConnections: number;
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly timestamp: Timestamp;
}

export interface StrictDatabaseHealthReport {
  readonly tableName: string;
  readonly status: 'healthy' | 'warning' | 'critical';
  readonly size: number;
  readonly rowCount: number;
  readonly indexUsage: number;
  readonly lastVacuum: Timestamp | null;
  readonly recommendations: readonly string[];
}

export interface StrictAlertRule {
  readonly id: UUID;
  readonly name: string;
  readonly metric: string;
  readonly operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  readonly threshold: number;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly channels: readonly string[];
  readonly cooldownMinutes: number;
  readonly isEnabled: boolean;
  readonly createdBy: UUID;
  readonly createdAt: Timestamp;
}

// Form validation types
export interface StrictValidationRule<T> {
  readonly field: keyof T;
  readonly validator: (value: unknown) => boolean;
  readonly message: string;
  readonly required: boolean;
}

export interface StrictValidationResult {
  readonly isValid: boolean;
  readonly errors: Record<string, readonly string[]>;
  readonly warnings: Record<string, readonly string[]>;
}

// Component props with strict typing
export interface StrictComponentProps {
  readonly className?: string;
  readonly testId?: string;
  readonly ariaLabel?: string;
  readonly children?: React.ReactNode;
}

export interface StrictDataComponentProps<T> extends StrictComponentProps {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly onRefresh?: () => void;
}

export interface StrictFormComponentProps<T> extends StrictComponentProps {
  readonly initialValues: T;
  readonly validationRules: readonly StrictValidationRule<T>[];
  readonly onSubmit: (values: T) => Promise<StrictServiceResult<unknown>>;
  readonly onCancel?: () => void;
  readonly disabled?: boolean;
}

// Event types with strict constraints
export interface StrictEventBase {
  readonly id: UUID;
  readonly type: string;
  readonly timestamp: Timestamp;
  readonly source: string;
  readonly userId: UUID;
  readonly organizationId: UUID;
}

export interface StrictAuditEvent extends StrictEventBase {
  readonly action: string;
  readonly resource: string;
  readonly resourceId: UUID;
  readonly changes: Record<string, { readonly before: unknown; readonly after: unknown }>;
  readonly metadata: Record<string, unknown>;
}

export interface StrictSystemEvent extends StrictEventBase {
  readonly level: 'info' | 'warn' | 'error' | 'debug';
  readonly message: string;
  readonly context: Record<string, unknown>;
  readonly stackTrace?: string;
}

// Configuration types
export interface StrictAppConfig {
  readonly database: {
    readonly url: URL;
    readonly poolSize: number;
    readonly timeout: number;
    readonly ssl: boolean;
  };
  readonly auth: {
    readonly jwtSecret: string;
    readonly tokenExpiry: number;
    readonly refreshTokenExpiry: number;
  };
  readonly monitoring: {
    readonly enabled: boolean;
    readonly metricsInterval: number;
    readonly alertingEnabled: boolean;
  };
  readonly features: {
    readonly [key: string]: boolean;
  };
}

// Type predicates and guards
export const isUUID = (value: unknown): value is UUID => {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export const isEmail = (value: unknown): value is Email => {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isURL = (value: unknown): value is URL => {
  try {
    new URL(value as string);
    return true;
  } catch {
    return false;
  }
};

export const isTimestamp = (value: unknown): value is Timestamp => {
  return typeof value === 'string' && !isNaN(Date.parse(value));
};

export const isStrictServiceResult = <T>(value: unknown): value is StrictServiceResult<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    'error' in value &&
    'timestamp' in value &&
    'requestId' in value &&
    typeof (value as any).success === 'boolean' &&
    isTimestamp((value as any).timestamp) &&
    isUUID((value as any).requestId)
  );
};

export const isStrictSuccessResult = <T>(value: StrictServiceResult<T>): value is StrictSuccessResult<T> => {
  return value.success === true && value.data !== null && value.error === null;
};

export const isStrictErrorResult = <T>(value: StrictServiceResult<T>): value is StrictErrorResult => {
  return value.success === false && value.data === null && value.error !== null;
};

// Runtime validation helpers
export const validateRequired = <T>(value: T | null | undefined, fieldName: string): NonNullable<T> => {
  if (value === null || value === undefined) {
    throw new Error(`Required field '${fieldName}' is missing or null`);
  }
  return value as NonNullable<T>;
};

export const validateUUID = (value: unknown, fieldName: string): UUID => {
  if (!isUUID(value)) {
    throw new Error(`Field '${fieldName}' must be a valid UUID`);
  }
  return value;
};

export const validateEmail = (value: unknown, fieldName: string): Email => {
  if (!isEmail(value)) {
    throw new Error(`Field '${fieldName}' must be a valid email address`);
  }
  return value;
};

export const validateURL = (value: unknown, fieldName: string): URL => {
  if (!isURL(value)) {
    throw new Error(`Field '${fieldName}' must be a valid URL`);
  }
  return value;
};

export const validateTimestamp = (value: unknown, fieldName: string): Timestamp => {
  if (!isTimestamp(value)) {
    throw new Error(`Field '${fieldName}' must be a valid timestamp`);
  }
  return value;
};

// Type assertion helpers
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};

export const exhaustiveCheck = (value: never): never => {
  throw new Error(`Exhaustive check failed. Received: ${value}`);
};

// Utility functions for type safety
export const createStrictServiceResult = <T>(
  success: boolean,
  data: T | null,
  error: string | null,
  requestId: UUID,
  timestamp: Timestamp
): StrictServiceResult<T> => {
  return {
    success,
    data,
    error,
    timestamp,
    requestId
  } as const;
};

export const createStrictSuccessResult = <T>(
  data: NonNullable<T>,
  requestId: UUID,
  timestamp: Timestamp
): StrictSuccessResult<T> => {
  return {
    success: true,
    data,
    error: null,
    timestamp,
    requestId
  } as const;
};

export const createStrictErrorResult = (
  error: NonNullable<string>,
  requestId: UUID,
  timestamp: Timestamp
): StrictErrorResult => {
  return {
    success: false,
    data: null,
    error,
    timestamp,
    requestId
  } as const;
};

// Type-safe object manipulation
export const pickStrict = <T, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

export const omitStrict = <T, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> => {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
};

// Deep readonly utility
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// Type-safe environment variable access
export const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Required environment variable '${name}' is not set`);
  }
  return value;
};

export const getEnvVarAsNumber = (name: string, defaultValue?: number): number => {
  const value = getEnvVar(name, defaultValue?.toString());
  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new Error(`Environment variable '${name}' must be a valid number`);
  }
  return numValue;
};

export const getEnvVarAsBoolean = (name: string, defaultValue?: boolean): boolean => {
  const value = getEnvVar(name, defaultValue?.toString());
  return value.toLowerCase() === 'true';
};
