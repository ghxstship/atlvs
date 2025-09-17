import { NextRequest } from 'next/server';
import { z, ZodSchema, ZodError } from 'zod';
import { CustomApiError, throwValidationError } from './error-handler';
import { ErrorCodes, createValidationError } from '../types/api-errors';

// Common validation schemas
export const CommonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Pagination parameters
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).optional()
  }),

  // Sorting parameters
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Date range filters
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['dateRange']
    }
  ),

  // Search parameters
  search: z.object({
    query: z.string().min(1).max(255).optional(),
    fields: z.array(z.string()).optional()
  }),

  // Organization context
  organizationContext: z.object({
    organizationId: z.string().uuid('Invalid organization ID')
  }),

  // User context
  userContext: z.object({
    userId: z.string().uuid('Invalid user ID')
  }),

  // File upload validation
  fileUpload: z.object({
    name: z.string().min(1).max(255),
    size: z.number().int().min(1).max(100 * 1024 * 1024), // 100MB max
    mimeType: z.string().min(1).max(100),
    content: z.string().optional() // base64 encoded content
  }),

  // Tags validation
  tags: z.array(z.string().min(1).max(50)).max(20),

  // Metadata validation
  metadata: z.record(z.string(), z.any()).optional(),

  // Status enums
  projectStatus: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  userRole: z.enum(['admin', 'manager', 'member', 'viewer']),
  notificationType: z.enum(['info', 'success', 'warning', 'error', 'system'])
};

// Request validation middleware
export class ValidationMiddleware {
  static async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error; // Will be handled by error handler
      }
      throw new CustomApiError(
        ErrorCodes.BAD_REQUEST,
        'Invalid JSON in request body'
      );
    }
  }

  static validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): T {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    try {
      return schema.parse(queryParams);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error; // Will be handled by error handler
      }
      throw new CustomApiError(
        ErrorCodes.BAD_REQUEST,
        'Invalid query parameters'
      );
    }
  }

  static validateParams<T>(
    params: Record<string, string | string[]>,
    schema: ZodSchema<T>
  ): T {
    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error; // Will be handled by error handler
      }
      throw new CustomApiError(
        ErrorCodes.BAD_REQUEST,
        'Invalid path parameters'
      );
    }
  }

  static validateHeaders<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): T {
    const headers = Object.fromEntries(request.headers.entries());
    
    try {
      return schema.parse(headers);
    } catch (error) {
      if (error instanceof ZodError) {
        throw error; // Will be handled by error handler
      }
      throw new CustomApiError(
        ErrorCodes.BAD_REQUEST,
        'Invalid request headers'
      );
    }
  }
}

// Specific validation schemas for different resources
export const AuthSchemas = {
  signIn: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  }),

  signUp: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    fullName: z.string().min(2).max(100),
    organizationName: z.string().min(2).max(100).optional()
  }),

  resetPassword: z.object({
    email: z.string().email('Invalid email address')
  }),

  updatePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
  })
};

export const UserSchemas = {
  create: z.object({
    email: z.string().email(),
    fullName: z.string().min(2).max(100),
    role: CommonSchemas.userRole,
    department: z.string().min(1).max(100).optional(),
    phoneNumber: z.string().min(10).max(20).optional(),
    timezone: z.string().max(50).optional()
  }),

  update: z.object({
    fullName: z.string().min(2).max(100).optional(),
    role: CommonSchemas.userRole.optional(),
    department: z.string().min(1).max(100).optional(),
    phoneNumber: z.string().min(10).max(20).optional(),
    timezone: z.string().max(50).optional(),
    avatarUrl: z.string().url().optional(),
    isActive: z.boolean().optional()
  }),

  filters: z.object({
    role: CommonSchemas.userRole.optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional(),
    search: z.string().min(1).max(255).optional()
  }).merge(CommonSchemas.pagination).merge(CommonSchemas.sorting)
};

export const ProjectSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    status: CommonSchemas.projectStatus.optional(),
    priority: CommonSchemas.priority.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    managerId: CommonSchemas.uuid.optional(),
    clientId: CommonSchemas.uuid.optional(),
    tags: CommonSchemas.tags.optional(),
    metadata: CommonSchemas.metadata
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate']
    }
  ),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: CommonSchemas.projectStatus.optional(),
    priority: CommonSchemas.priority.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    managerId: CommonSchemas.uuid.optional(),
    clientId: CommonSchemas.uuid.optional(),
    tags: CommonSchemas.tags.optional(),
    metadata: CommonSchemas.metadata
  }),

  filters: z.object({
    status: CommonSchemas.projectStatus.optional(),
    priority: CommonSchemas.priority.optional(),
    managerId: CommonSchemas.uuid.optional(),
    clientId: CommonSchemas.uuid.optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().min(1).max(255).optional(),
    startDateFrom: z.string().datetime().optional(),
    startDateTo: z.string().datetime().optional(),
    endDateFrom: z.string().datetime().optional(),
    endDateTo: z.string().datetime().optional()
  }).merge(CommonSchemas.pagination).merge(CommonSchemas.sorting)
};

export const FileSchemas = {
  create: z.object({
    projectId: CommonSchemas.uuid.optional(),
    name: z.string().min(1).max(255),
    originalName: z.string().min(1).max(255),
    mimeType: z.string().min(1).max(100),
    size: z.number().int().min(1).max(100 * 1024 * 1024), // 100MB
    storagePath: z.string().min(1).max(500),
    isPublic: z.boolean().optional(),
    tags: CommonSchemas.tags.optional(),
    metadata: CommonSchemas.metadata
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    isPublic: z.boolean().optional(),
    tags: CommonSchemas.tags.optional(),
    metadata: CommonSchemas.metadata
  }),

  filters: z.object({
    projectId: CommonSchemas.uuid.optional(),
    mimeType: z.string().optional(),
    isPublic: z.boolean().optional(),
    uploadedBy: CommonSchemas.uuid.optional(),
    tags: z.array(z.string()).optional(),
    search: z.string().min(1).max(255).optional(),
    sizeMin: z.number().int().min(0).optional(),
    sizeMax: z.number().int().min(0).optional()
  }).merge(CommonSchemas.pagination).merge(CommonSchemas.sorting)
};

export const NotificationSchemas = {
  create: z.object({
    userId: CommonSchemas.uuid,
    type: CommonSchemas.notificationType,
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    data: CommonSchemas.metadata,
    expiresAt: z.string().datetime().optional()
  }),

  broadcast: z.object({
    userIds: z.array(CommonSchemas.uuid).min(1).max(1000),
    type: CommonSchemas.notificationType,
    title: z.string().min(1).max(255),
    message: z.string().min(1).max(2000),
    data: CommonSchemas.metadata,
    expiresAt: z.string().datetime().optional()
  }),

  filters: z.object({
    type: CommonSchemas.notificationType.optional(),
    isRead: z.boolean().optional(),
    userId: CommonSchemas.uuid.optional(),
    search: z.string().min(1).max(255).optional()
  }).merge(CommonSchemas.pagination).merge(CommonSchemas.sorting)
};

export const OrganizationSchemas = {
  update: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
    description: z.string().max(2000).optional(),
    logoUrl: z.string().url().optional(),
    website: z.string().url().optional(),
    industry: z.string().min(1).max(100).optional(),
    size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
    location: z.string().min(1).max(255).optional(),
    timezone: z.string().max(50).optional(),
    settings: z.record(z.string(), z.any()).optional(),
    isActive: z.boolean().optional()
  }),

  validateSlug: z.object({
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  })
};

// Helper function to create validation middleware for API routes
export function createValidationMiddleware<
  TBody = any,
  TQuery = any,
  TParams = any,
  THeaders = any
>(config: {
  body?: ZodSchema<TBody>;
  query?: ZodSchema<TQuery>;
  params?: ZodSchema<TParams>;
  headers?: ZodSchema<THeaders>;
}) {
  return async (
    request: NextRequest,
    params?: Record<string, string | string[]>
  ): Promise<{
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    headers?: THeaders;
  }> => {
    const result: any = {};

    if (config.body) {
      result.body = await ValidationMiddleware.validateBody(request, config.body);
    }

    if (config.query) {
      result.query = ValidationMiddleware.validateQuery(request, config.query);
    }

    if (config.params && params) {
      result.params = ValidationMiddleware.validateParams(params, config.params);
    }

    if (config.headers) {
      result.headers = ValidationMiddleware.validateHeaders(request, config.headers);
    }

    return result;
  };
}
