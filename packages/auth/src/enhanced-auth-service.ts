import { createServerClient } from '@ghxstship/auth';
import { NextRequest } from 'next/server';
import { SessionManager } from './session-manager';
import { SecurityLogger } from './security-logger';

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  organization?: any;
  membership?: any;
  requiresMFA?: boolean;
  mfaFactors?: any[];
  error?: string;
  sessionData?: any;
}

export class EnhancedAuthService {
  private supabase: any;
  private sessionManager: SessionManager;
  private securityLogger: SecurityLogger;

  constructor(request?: NextRequest) {
    this.supabase = createServerClient({
      get: (name: string) => {
        if (request) {
          const c = request.cookies.get(name);
          return c ? { name: c.name, value: c.value } : undefined;
        }
        return undefined;
      },
      set: (name: string, value: string, options) => {
        // Not needed for service operations
      },
      remove: (name: string) => {
        // Not needed for service operations
      }
    });
    this.sessionManager = new SessionManager(request);
    this.securityLogger = new SecurityLogger();
  }

  /**
   * Enhanced sign-in with MFA enforcement and session management
   */
  async signInWithPassword(
    email: string,
    password: string,
    request: NextRequest
  ): Promise<AuthResult> {
    try {
      // First, check for brute force protection
      const ipAddress = this.getClientIP(request);
      const rateLimitCheck = await this.checkRateLimit(ipAddress, '/auth/signin');

      if (!rateLimitCheck.allowed) {
        await this.logSecurityEvent(
          null, null, 'rate_limit_exceeded', 'high',
          { ipAddress, endpoint: '/auth/signin' }, ipAddress, request.headers.get('user-agent') || ''
        );
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Attempt authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle failed login
        await this.handleFailedLogin(email, ipAddress, request);
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user profile and membership
      const { data: profile } = await this.supabase
        .from('users')
        .select(`
          *,
          memberships!inner(
            organization_id,
            role,
            status,
            organization:organizations(
              id,
              name,
              slug,
              security_settings
            )
          )
        `)
        .eq('auth_id', data.user.id)
        .single();

      if (!profile || !profile.memberships?.[0]) {
        return { success: false, error: 'User profile or membership not found' };
      }

      const membership = profile.memberships[0];
      if (membership.status !== 'active') {
        return { success: false, error: 'Account is not active' };
      }

      // Check if MFA is required for this user/role
      const requiresMFA = await this.isMFARequired(profile.id, membership.role, membership.organization.security_settings);

      if (requiresMFA) {
        // Check for verified MFA factors
        const { data: factors, error: mfaError } = await this.supabase.auth.mfa.listFactors();

        if (mfaError) {
          return { success: false, error: 'Failed to check MFA status' };
        }

        const verifiedFactors = factors?.all?.filter((f: any) => f.status === 'verified') || [];

        if (verifiedFactors.length === 0) {
          return { success: false, error: 'Multi-factor authentication is required but not configured' };
        }

        // MFA challenge required
        return {
          success: true,
          user: data.user,
          session: data.session,
          organization: membership.organization,
          membership,
          requiresMFA: true,
          mfaFactors: verifiedFactors,
        };
      }

      // No MFA required, create session
      const sessionData = await this.createUserSession(data.user.id, membership.organization_id, request);

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(profile.id);

      // Log successful authentication
      const deviceFingerprint = SessionManager.getDeviceFingerprint(request);
      await this.securityLogger.logAuthEvent(
        'login_success',
        data.user.id,
        membership.organization_id,
        { email, deviceFingerprint },
        ipAddress,
        request.headers.get('user-agent') || ''
      );

      return {
        success: true,
        user: data.user,
        session: data.session,
        organization: membership.organization,
        membership,
        sessionData,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Complete MFA verification and create session
   */
  async completeMFAAuthentication(
    factorId: string,
    code: string,
    request: NextRequest
  ): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.mfa.verify({
        factorId,
        code,
        challengeId: factorId // Use factorId as challengeId for signin flow
      });

      if (error) {
        await this.securityLogger.logEvent({
          eventType: 'mfa_verification_failed',
          severity: 'medium',
          userId: null,
          organizationId: null,
          details: { factorId },
          ipAddress: this.getClientIP(request),
          userAgent: request.headers.get('user-agent') || '',
        });
        return { success: false, error: error.message };
      }

      // Get user profile and membership
      const { data: profile } = await this.supabase
        .from('users')
        .select(`
          *,
          memberships!inner(
            organization_id,
            role,
            status,
            organization:organizations(
              id,
              name,
              slug
            )
          )
        `)
        .eq('auth_id', data.user.id)
        .single();

      if (!profile || !profile.memberships?.[0]) {
        return { success: false, error: 'User profile or membership not found' };
      }

      const membership = profile.memberships[0];

      // Create session
      const sessionData = await this.createUserSession(data.user.id, membership.organization_id, request);

      await this.securityLogger.logEvent({
        eventType: 'mfa_verification_success',
        severity: 'low',
        userId: data.user.id,
        organizationId: membership.organization_id,
        details: { factorId },
        ipAddress: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || '',
      });

      return {
        success: true,
        user: data.user,
        session: data.session,
        organization: membership.organization,
        membership,
        sessionData,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MFA verification failed'
      };
    }
  }

  /**
   * Sign out user from all sessions
   */
  async signOut(userId: string, request: NextRequest): Promise<void> {
    await this.sessionManager.terminateAllUserSessions(userId);

    await this.securityLogger.logAuthEvent(
      'logout',
      userId,
      undefined,
      { allDevices: true },
      this.getClientIP(request),
      request.headers.get('user-agent') || ''
    );
  }

  /**
   * Validate current session
   */
  async validateSession(sessionToken: string): Promise<AuthResult> {
    const sessionData = await this.sessionManager.validateSession(sessionToken);

    if (!sessionData) {
      return { success: false, error: 'Invalid or expired session' };
    }

    // Get current user data
    const { data: profile } = await this.supabase
      .from('users')
      .select(`
        *,
        memberships!inner(
          organization_id,
          role,
          status,
          organization:organizations(
            id,
            name,
            slug,
            security_settings
          )
        )
      `)
      .eq('id', sessionData.userId)
      .single();

    if (!profile || !profile.memberships?.[0]) {
      return { success: false, error: 'User profile not found' };
    }

    const membership = profile.memberships[0];
    if (membership.status !== 'active') {
      return { success: false, error: 'Account is not active' };
    }

    return {
      success: true,
      user: { id: profile.auth_id },
      organization: membership.organization,
      membership,
      sessionData,
    };
  }

  /**
   * Check if MFA is required for user
   */
  private async isMFARequired(userId: string, role: string, orgSecuritySettings?: any): Promise<boolean> {
    // Organization-level MFA policy
    if (orgSecuritySettings?.require_mfa === true) {
      return true;
    }

    // Role-based MFA policy (admin/owner always require MFA)
    if (['owner', 'admin'].includes(role)) {
      return true;
    }

    // Check if user has MFA enabled
    const { data: user } = await this.supabase
      .from('users')
      .select('mfa_enabled')
      .eq('id', userId)
      .single();

    return user?.mfa_enabled === true;
  }

  /**
   * Create user session after successful authentication
   */
  private async createUserSession(userId: string, organizationId: string, request: NextRequest) {
    const deviceFingerprint = SessionManager.getDeviceFingerprint(request);
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';

    return await this.sessionManager.createSession(
      userId,
      organizationId,
      deviceFingerprint,
      ipAddress,
      userAgent
    );
  }

  private async handleFailedLogin(email: string, ipAddress: string, request: NextRequest): Promise<void> {
    // Increment failed login attempts
    const { data: user } = await this.supabase
      .from('users')
      .select('id, failed_login_attempts, account_locked_until')
      .eq('email', email)
      .single();

    let attempts = 1; // Default value

    if (user) {
      attempts = (user.failed_login_attempts || 0) + 1;
      const lockedUntil = attempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes lockout
        : null;

      await this.supabase
        .from('users')
        .update({
          failed_login_attempts: attempts,
          account_locked_until: lockedUntil,
          last_login_at: new Date(),
          last_login_ip: ipAddress,
        })
        .eq('id', user.id);
    }

    // Log security event
    await this.securityLogger.logAuthEvent(
      'login_failure',
      user?.id || null,
      user?.id || null,
      { attempts, email, ipAddress },
      ipAddress,
      request.headers.get('user-agent') || ''
    );
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedLoginAttempts(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: new Date(),
      })
      .eq('id', userId);
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean }> {
    const { data } = await this.supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: 'ip',
      p_endpoint: endpoint,
      p_limit: 5, // 5 attempts per hour for auth endpoints
    });

    return { allowed: data };
  }

  private async logSecurityEvent(
    organizationId: string | null,
    userId: string | null,
    eventType: string,
    severity: string,
    details: any,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    // Use raw SQL to handle null UUID values properly
    await this.supabase.rpc('log_security_event', {
      p_organization_id: organizationId as any,
      p_user_id: userId as any,
      p_event_type: eventType,
      p_severity: severity,
      p_details: details,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for') ||
           request.headers.get('x-real-ip') ||
           request.ip ||
           'unknown';
  }
}

export default EnhancedAuthService;
