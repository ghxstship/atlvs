import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { Permission, PERMISSION_MATRIX, UserRole } from '@ghxstship/auth';
import { getPermissionCache } from '@ghxstship/auth';

// Security context for requests
export interface SecurityContext {
  userId: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  membershipStatus: string;
}

// Authorization middleware configuration
export interface AuthConfig {
  requiredPermissions?: Permission[];
  requireAll?: boolean; // true = AND, false = OR
  allowPublic?: boolean;
  requireMFA?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

// Rate limiting store (in production, use Redis)
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  check(key: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // New window
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false; // Rate limited
    }

    record.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Cleanup rate limit store every minute
setInterval(() => rateLimitStore.cleanup(), 60000);

/**
 * Enterprise RBAC Authorization Middleware
 * Provides comprehensive role-based access control with caching and audit logging
 */
export class AuthorizationMiddleware {
  private static instance: AuthorizationMiddleware;
  private permissionCache = getPermissionCache();

  static getInstance(): AuthorizationMiddleware {
    if (!AuthorizationMiddleware.instance) {
      AuthorizationMiddleware.instance = new AuthorizationMiddleware();
    }
    return AuthorizationMiddleware.instance;
  }

  /**
   * Main authorization middleware function
   */
  async authorize(
    request: NextRequest,
    config: AuthConfig = {}
  ): Promise<{ authorized: boolean; context?: SecurityContext; response?: NextResponse }> {
    try {
      // Check rate limiting first
      if (config.rateLimit) {
        const clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        request.ip ||
                        'unknown';

        const rateLimitKey = `${clientIP}:${request.nextUrl.pathname}`;
        const allowed = rateLimitStore.check(
          rateLimitKey,
          config.rateLimit.windowMs,
          config.rateLimit.maxRequests
        );

        if (!allowed) {
          await this.logSecurityEvent(null, null, 'rate_limit_exceeded', 'medium', {
            ip_address: clientIP,
            user_agent: request.headers.get('user-agent'),
            path: request.nextUrl.pathname
          });

          return {
            authorized: false,
            response: NextResponse.json(
              { error: 'Rate limit exceeded' },
              { status: 429 }
            )
          };
        }
      }

      const supabase = createServerClient({
        get: (name: string) => request.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      });

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Handle public routes
      if (config.allowPublic) {
        if (!user) {
          // Public access allowed
          return { authorized: true };
        }
        // User is authenticated, continue with auth checks
      } else if (!user) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        };
      }

      if (userError || !user) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Invalid authentication' },
            { status: 401 }
          )
        };
      }

      // Get user membership and permissions
      const context = await this.getSecurityContext(user.id);

      if (!context) {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'User membership not found' },
            { status: 403 }
          )
        };
      }

      // Check membership status
      if (context.membershipStatus !== 'active') {
        return {
          authorized: false,
          response: NextResponse.json(
            { error: 'Account not active' },
            { status: 403 }
          )
        };
      }

      // Check MFA requirement
      if (config.requireMFA) {
        const { data: mfaEnabled } = await supabase
          .from('users')
          .select('mfa_enabled')
          .eq('id', user.id)
          .single();

        if (!mfaEnabled?.mfa_enabled) {
          return {
            authorized: false,
            response: NextResponse.json(
              { error: 'MFA required' },
              { status: 403 }
            )
          };
        }
      }

      // Check permissions
      if (config.requiredPermissions && config.requiredPermissions.length > 0) {
        const hasPermission = config.requireAll
          ? config.requiredPermissions.every(perm => context.permissions.includes(perm))
          : config.requiredPermissions.some(perm => context.permissions.includes(perm));

        if (!hasPermission) {
          // Log authorization failure
          await this.logSecurityEvent(
            context.organizationId,
            context.userId,
            'permission_denied',
            'medium',
            {
              required_permissions: config.requiredPermissions,
              user_permissions: context.permissions,
              require_all: config.requireAll,
              path: request.nextUrl.pathname
            }
          );

          return {
            authorized: false,
            response: NextResponse.json(
              { error: 'Insufficient permissions' },
              { status: 403 }
            )
          };
        }
      }

      return { authorized: true, context };

    } catch (error) {
      console.error('Authorization middleware error:', error);
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Authorization failed' },
          { status: 500 }
        )
      };
    }
  }

  /**
   * Get security context for a user
   */
  private async getSecurityContext(userId: string): Promise<SecurityContext | null> {
    const supabase = createServerClient({
      get: () => null, // Server-side only
      set: () => {},
      remove: () => {},
    });

    try {
      // Get membership information
      const { data: membership, error } = await supabase
        .from('memberships')
        .select('organization_id, role, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !membership) {
        return null;
      }

      // Check cache first
      let permissions = this.permissionCache.getPermissions(userId, membership.organization_id);

      if (!permissions) {
        // Calculate permissions from role matrix
        permissions = PERMISSION_MATRIX[membership.role as UserRole] || [];

        // Cache permissions
        this.permissionCache.setPermissions(userId, membership.organization_id, permissions);
      }

      return {
        userId,
        organizationId: membership.organization_id,
        role: membership.role as UserRole,
        permissions,
        membershipStatus: membership.status,
      };
    } catch (error) {
      console.error('Failed to get security context:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: Permission, organizationId?: string): Promise<boolean> {
    const context = await this.getSecurityContext(userId);
    if (!context) return false;

    if (organizationId && context.organizationId !== organizationId) {
      return false;
    }

    return context.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissions: Permission[], organizationId?: string): Promise<boolean> {
    const context = await this.getSecurityContext(userId);
    if (!context) return false;

    if (organizationId && context.organizationId !== organizationId) {
      return false;
    }

    return permissions.some(perm => context.permissions.includes(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: string, permissions: Permission[], organizationId?: string): Promise<boolean> {
    const context = await this.getSecurityContext(userId);
    if (!context) return false;

    if (organizationId && context.organizationId !== organizationId) {
      return false;
    }

    return permissions.every(perm => context.permissions.includes(perm));
  }

  /**
   * Invalidate user permission cache
   */
  invalidateUserCache(userId: string): void {
    this.permissionCache.invalidateUserCache(userId);
  }

  /**
   * Invalidate organization permission cache
   */
  invalidateOrganizationCache(organizationId: string): void {
    this.permissionCache.invalidateOrganizationCache(organizationId);
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(
    organizationId: string | null,
    userId: string | null,
    eventType: string,
    severity: string,
    details: any
  ): Promise<void> {
    try {
      const supabase = createServerClient({
        get: () => null,
        set: () => {},
        remove: () => {},
      });

      await supabase.rpc('log_security_event', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_event_type: eventType,
        p_severity: severity,
        p_details: details
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Convenience functions
export const authMiddleware = AuthorizationMiddleware.getInstance();

export function withAuth(
  config: AuthConfig = {}
) {
  return async function authHandler(
    request: NextRequest,
    handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const result = await authMiddleware.authorize(request, config);

    if (!result.authorized) {
      return result.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, result.context!);
  };
}

export function requirePermission(permission: Permission) {
  return withAuth({ requiredPermissions: [permission] });
}

export function requireAnyPermission(permissions: Permission[]) {
  return withAuth({ requiredPermissions: permissions, requireAll: false });
}

export function requireAllPermissions(permissions: Permission[]) {
  return withAuth({ requiredPermissions: permissions, requireAll: true });
}

export function requireRole(role: UserRole) {
  // This would need additional role checking logic
  return withAuth({});
}

export function requireMFA() {
  return withAuth({ requireMFA: true });
}

export function publicRoute() {
  return withAuth({ allowPublic: true });
}
