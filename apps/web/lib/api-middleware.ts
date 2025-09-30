import { NextRequest, NextResponse } from 'next/server';
import { EnhancedAuthService } from '@ghxstship/auth';

/**
 * API middleware wrapper for MFA enforcement on sensitive endpoints
 */
export function withMFAProtection(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    try {
      const authService = new EnhancedAuthService();

      // Check for session token
      const sessionToken = req.cookies.get('session_token')?.value;
      if (!sessionToken) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Validate session
      const sessionResult = await authService.validateSession(sessionToken);
      if (!sessionResult.success) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      // Check if MFA is required for this user/role
      const { membership, organization } = sessionResult;
      const requiresMFA = await checkMFARequired(membership.role, organization?.security_settings);

      if (requiresMFA) {
        // Verify MFA was completed for this session
        const mfaVerified = req.cookies.get('mfa_verified')?.value === 'true';
        if (!mfaVerified) {
          return NextResponse.json(
            { error: 'Multi-factor authentication required' },
            { status: 403 }
          );
        }
      }

      // Add user context to request
      (req as any).user = sessionResult.user;
      (req as any).organization = sessionResult.organization;
      (req as any).membership = sessionResult.membership;
      (req as any).sessionData = sessionResult.sessionData;

      return handler(req, context);
    } catch (error) {
      console.error('MFA protection middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if MFA is required based on role and organization settings
 */
async function checkMFARequired(role: string, orgSecuritySettings?: any): Promise<boolean> {
  // Organization-level MFA policy
  if (orgSecuritySettings?.require_mfa === true) {
    return true;
  }

  // Role-based MFA policy (admin/owner always require MFA)
  if (['owner', 'admin'].includes(role)) {
    return true;
  }

  return false;
}

/**
 * API middleware wrapper for role-based access control
 */
export function withRoleProtection(
  allowedRoles: string[],
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return async (req: NextRequest, context?: any) => {
    const userRole = (req as any).membership?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

/**
 * Combined middleware for MFA + Role protection
 */
export function withSecureAccess(
  allowedRoles: string[] = [],
  handler: (req: NextRequest, context?: any) => Promise<Response>
) {
  return withMFAProtection(withRoleProtection(allowedRoles, handler));
}
