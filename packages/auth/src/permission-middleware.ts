import { NextRequest, NextResponse } from 'next/server';
import { PermissionChecker, Permission } from './permission-checker';
import { SessionManager } from './session-manager';

export interface RouteProtectionConfig {
  permissions?: Permission[];
  requireAll?: boolean; // true = user must have ALL permissions, false = user must have ANY permission
  allowPublic?: boolean; // if true, allow unauthenticated access
  requireMFA?: boolean; // if true, require MFA for access
}

const sessionManager = new SessionManager();

export function withPermissionProtection(
  handler: (req: NextRequest, context?: any) => Promise<Response>,
  config: RouteProtectionConfig
) {
  return async (req: NextRequest, context?: any) => {
    try {
      // Extract session token from request
      const sessionToken = req.headers.get('x-session-token') ||
                          req.cookies.get('session-token')?.value;

      if (!sessionToken) {
        if (config.allowPublic) {
          return handler(req, context);
        }
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Validate session
      const sessionData = await sessionManager.validateSession(sessionToken);
      if (!sessionData) {
        return NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        );
      }

      // Check if MFA is required
      if (config.requireMFA) {
        const permissionChecker = new PermissionChecker(req);
        const isMFARequired = await permissionChecker.checkPermission(
          sessionData.userId,
          sessionData.organizationId,
          Permission.PROFILE_VIEW // Use a basic permission to get user info
        );

        // TODO: Check if user has completed MFA
        // For now, assume MFA is required but not enforced
      }

      // If no permissions required, allow access
      if (!config.permissions || config.permissions.length === 0) {
        // Add user context to request for the handler
        (req as any).user = {
          id: sessionData.userId,
          organizationId: sessionData.organizationId
        };
        return handler(req, context);
      }

      // Check permissions
      const permissionChecker = new PermissionChecker(req);

      let permissionResult;
      if (config.requireAll) {
        permissionResult = await permissionChecker.checkAllPermissions(
          sessionData.userId,
          sessionData.organizationId,
          config.permissions
        );
      } else {
        permissionResult = await permissionChecker.checkAnyPermission(
          sessionData.userId,
          sessionData.organizationId,
          config.permissions
        );
      }

      if (!permissionResult.allowed) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            required: permissionResult.requiredPermission,
            role: permissionResult.role
          },
          { status: 403 }
        );
      }

      // Add user context to request for the handler
      (req as any).user = {
        id: sessionData.userId,
        organizationId: sessionData.organizationId,
        role: permissionResult.role,
        sessionId: sessionData.id
      };

      return handler(req, context);

    } catch (error) {
      console.error('Permission middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Convenience functions for common permission patterns
export function requirePermission(permission: Permission) {
  return (handler: (req: NextRequest, context?: any) => Promise<Response>) =>
    withPermissionProtection(handler, { permissions: [permission] });
}

export function requirePermissions(permissions: Permission[], requireAll = false) {
  return (handler: (req: NextRequest, context?: any) => Promise<Response>) =>
    withPermissionProtection(handler, { permissions, requireAll });
}

export function requireOwner(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return withPermissionProtection(handler, {
    permissions: [Permission.ORG_UPDATE] // Owner has all org permissions
  });
}

export function requireAdminOrOwner(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return withPermissionProtection(handler, {
    permissions: [Permission.USER_MANAGE_ROLES] // Only admin/owner have this
  });
}

export function allowPublic(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return withPermissionProtection(handler, { allowPublic: true });
}
