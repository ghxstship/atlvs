import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ZodSchema } from 'zod';
import { withErrorHandler, CustomApiError } from './error-handler';
import { createValidationMiddleware } from './validation-middleware';
import { ErrorCodes, createSuccessResponse } from '../types/api-errors';
import { Database } from '../types/database';

// Types for middleware context
export interface ApiContext {
  supabase: ReturnType<typeof createClient<Database>>;
  user: {
    id: string;
    email: string;
    role: string;
  };
  organization: {
    id: string;
    slug: string;
    role: string;
  };
  request: NextRequest;
  params?: Record<string, string | string[]>;
}

export interface ApiHandlerConfig<TBody = any, TQuery = any, TParams = any> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requireAuth?: boolean;
  requireOrganization?: boolean;
  requiredPermissions?: string[];
  validation?: {
    body?: ZodSchema<TBody>;
    query?: ZodSchema<TQuery>;
    params?: ZodSchema<TParams>;
  };
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

export interface ApiHandler<TBody = any, TQuery = any, TParams = any> {
  (
    context: ApiContext,
    validated: {
      body?: TBody;
      query?: TQuery;
      params?: TParams;
    }
  ): Promise<NextResponse>;
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

class ApiMiddleware {
  // Authentication middleware
  static async authenticate(request: NextRequest): Promise<{
    supabase: ReturnType<typeof createClient<Database>>;
    user: ApiContext['user'];
  }> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new CustomApiError(ErrorCodes.UNAUTHORIZED, 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new CustomApiError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token');
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new CustomApiError(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch user profile');
    }

    return {
      supabase,
      user: {
        id: user.id,
        email: user.email!,
        role: profile?.role || 'member'
      }
    };
  }

  // Organization context middleware
  static async getOrganizationContext(
    supabase: ReturnType<typeof createClient<Database>>,
    userId: string,
    request: NextRequest
  ): Promise<ApiContext['organization']> {
    // Try to get organization ID from header first
    let organizationId = request.headers.get('x-organization-id');
    
    // If not in header, try to extract from URL path
    if (!organizationId) {
      const url = new URL(request.url);
      const pathMatch = url.pathname.match(/\/api\/organizations\/([^\/]+)/);
      if (pathMatch) {
        organizationId = pathMatch[1];
      }
    }

    if (!organizationId) {
      throw new CustomApiError(ErrorCodes.BAD_REQUEST, 'Organization ID required');
    }

    // Verify user has access to this organization
    const { data: membership, error } = await supabase
      .from('organization_members')
      .select(`
        role,
        organization:organizations(id, slug)
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error || !membership) {
      throw new CustomApiError(ErrorCodes.FORBIDDEN, 'Access denied to organization');
    }

    return {
      id: organizationId,
      slug: membership.organization.slug,
      role: membership.role
    };
  }

  // Permission checking middleware
  static checkPermissions(
    userRole: string,
    organizationRole: string,
    requiredPermissions: string[]
  ): void {
    // Define role hierarchy and permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      manager: [
        'users:read', 'users:create', 'users:update',
        'projects:read', 'projects:create', 'projects:update', 'projects:delete',
        'files:read', 'files:create', 'files:update', 'files:delete',
        'notifications:read', 'notifications:create',
        'settings:read', 'settings:update'
      ],
      member: [
        'users:read',
        'projects:read', 'projects:create', 'projects:update',
        'files:read', 'files:create', 'files:update',
        'notifications:read'
      ],
      viewer: [
        'users:read',
        'projects:read',
        'files:read',
        'notifications:read'
      ]
    };

    const userPermissions = rolePermissions[userRole] || [];
    const orgPermissions = rolePermissions[organizationRole] || [];
    
    // Combine user and organization permissions
    const allPermissions = [...userPermissions, ...orgPermissions];
    
    // Check if user has admin permissions (wildcard)
    if (allPermissions.includes('*')) {
      return;
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      if (!allPermissions.includes(permission)) {
        throw new CustomApiError(
          ErrorCodes.FORBIDDEN,
          `Insufficient permissions. Required: ${permission}`
        );
      }
    }
  }

  // Rate limiting middleware
  static checkRateLimit(
    request: NextRequest,
    config: { requests: number; windowMs: number }
  ): void {
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    const key = `rate_limit:${clientId}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    const current = rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
    } else {
      // Within current window
      if (current.count >= config.requests) {
        throw new CustomApiError(
          ErrorCodes.RATE_LIMITED,
          `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds`
        );
      }
      current.count++;
    }
  }

  // Method validation middleware
  static validateMethod(request: NextRequest, allowedMethod: string): void {
    if (request.method !== allowedMethod) {
      throw new CustomApiError(
        ErrorCodes.METHOD_NOT_ALLOWED,
        `Method ${request.method} not allowed. Expected ${allowedMethod}`
      );
    }
  }
}

// Main API handler wrapper
export function createApiHandler<TBody = any, TQuery = any, TParams = any>(
  config: ApiHandlerConfig<TBody, TQuery, TParams>,
  handler: ApiHandler<TBody, TQuery, TParams>
) {
  return withErrorHandler(async (request: NextRequest, { params }: { params?: Record<string, string | string[]> }) => {
    // Method validation
    if (config.method) {
      ApiMiddleware.validateMethod(request, config.method);
    }

    // Rate limiting
    if (config.rateLimit) {
      ApiMiddleware.checkRateLimit(request, config.rateLimit);
    }

    let context: Partial<ApiContext> = {
      request,
      params
    };

    // Authentication
    if (config.requireAuth !== false) {
      const { supabase, user } = await ApiMiddleware.authenticate(request);
      context.supabase = supabase;
      context.user = user;

      // Organization context
      if (config.requireOrganization !== false) {
        context.organization = await ApiMiddleware.getOrganizationContext(
          supabase,
          user.id,
          request
        );

        // Permission checking
        if (config.requiredPermissions?.length) {
          ApiMiddleware.checkPermissions(
            user.role,
            context.organization.role,
            config.requiredPermissions
          );
        }
      }
    }

    // Input validation
    let validated: any = {};
    if (config.validation) {
      const validator = createValidationMiddleware(config.validation);
      validated = await validator(request, params);
    }

    // Call the actual handler
    const result = await handler(context as ApiContext, validated);
    
    // Add security headers
    result.headers.set('X-Content-Type-Options', 'nosniff');
    result.headers.set('X-Frame-Options', 'DENY');
    result.headers.set('X-XSS-Protection', '1; mode=block');
    
    return result;
  });
}

// Convenience functions for common API patterns
export const createGetHandler = <TQuery = any, TParams = any>(
  config: Omit<ApiHandlerConfig<never, TQuery, TParams>, 'method'>,
  handler: ApiHandler<never, TQuery, TParams>
) => createApiHandler({ ...config, method: 'GET' }, handler);

export const createPostHandler = <TBody = any, TQuery = any, TParams = any>(
  config: Omit<ApiHandlerConfig<TBody, TQuery, TParams>, 'method'>,
  handler: ApiHandler<TBody, TQuery, TParams>
) => createApiHandler({ ...config, method: 'POST' }, handler);

export const createPutHandler = <TBody = any, TQuery = any, TParams = any>(
  config: Omit<ApiHandlerConfig<TBody, TQuery, TParams>, 'method'>,
  handler: ApiHandler<TBody, TQuery, TParams>
) => createApiHandler({ ...config, method: 'PUT' }, handler);

export const createPatchHandler = <TBody = any, TQuery = any, TParams = any>(
  config: Omit<ApiHandlerConfig<TBody, TQuery, TParams>, 'method'>,
  handler: ApiHandler<TBody, TQuery, TParams>
) => createApiHandler({ ...config, method: 'PATCH' }, handler);

export const createDeleteHandler = <TQuery = any, TParams = any>(
  config: Omit<ApiHandlerConfig<never, TQuery, TParams>, 'method'>,
  handler: ApiHandler<never, TQuery, TParams>
) => createApiHandler({ ...config, method: 'DELETE' }, handler);

// Helper function to create standardized success responses
export function createApiResponse<T>(data: T, message?: string, meta?: any) {
  return NextResponse.json(createSuccessResponse(data, message, meta));
}

// Helper function to get pagination info
export function getPaginationInfo(
  query: { page?: number; limit?: number },
  totalCount: number
) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext,
    hasPrevious,
    offset: (page - 1) * limit
  };
}

// Helper function to build Supabase query with filters
export function buildSupabaseQuery(
  query: any,
  filters: Record<string, any>,
  searchFields?: string[]
) {
  let supabaseQuery = query;

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        supabaseQuery = supabaseQuery.in(key, value);
      } else if (typeof value === 'string' && value.includes('*')) {
        // Wildcard search
        supabaseQuery = supabaseQuery.ilike(key, value.replace(/\*/g, '%'));
      } else {
        supabaseQuery = supabaseQuery.eq(key, value);
      }
    }
  });

  // Apply search across multiple fields
  if (filters.search && searchFields?.length) {
    const searchConditions = searchFields.map(field => `${field}.ilike.%${filters.search}%`);
    supabaseQuery = supabaseQuery.or(searchConditions.join(','));
  }

  // Apply sorting
  if (filters.sortBy) {
    const ascending = filters.sortOrder !== 'desc';
    supabaseQuery = supabaseQuery.order(filters.sortBy, { ascending });
  }

  // Apply pagination
  if (filters.limit) {
    supabaseQuery = supabaseQuery.limit(filters.limit);
  }
  if (filters.offset) {
    supabaseQuery = supabaseQuery.range(
      filters.offset,
      filters.offset + (filters.limit || 20) - 1
    );
  }

  return supabaseQuery;
}
