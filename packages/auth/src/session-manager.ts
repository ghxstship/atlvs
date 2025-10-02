import 'server-only';
import { createServerClient } from '@ghxstship/auth';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Session configuration
const SESSION_CONFIG = {
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  sessionCleanupInterval: 60 * 60 * 1000, // 1 hour
  maxSessionsPerUser: 5,
  jwtRotationInterval: 5 * 60 * 1000, // 5 minutes
};

export interface SessionData {
  id: string;
  userId: string;
  organizationId: string;
  sessionToken: string;
  refreshToken: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location?: any;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

export class SessionManager {
  private supabase: any;
  private request?: NextRequest;

  constructor(request?: NextRequest) {
    this.request = request;
    // Note: Supabase client is now created lazily to avoid cookies() 
    // being called during build time / outside request scope
  }

  private async getSupabaseClient() {
    if (this.supabase) {
      return this.supabase;
    }

    const cookieStore = await cookies();
    this.supabase = createServerClient({
      get: (name: string) => {
        if (this.request) {
          const c = this.request.cookies.get(name);
          return c ? { name: c.name, value: c.value } : undefined;
        }
        return cookieStore.get(name);
      },
      set: (name: string, value: string, options) => {
        cookieStore.set(name, value, options);
      },
      remove: (name: string) => {
        cookieStore.delete(name);
      }
    });
    return this.supabase;
  }

  /**
   * Create a new session for authenticated user
   */
  async createSession(
    userId: string,
    organizationId: string,
    deviceFingerprint: string,
    ipAddress: string,
    userAgent: string,
    location?: any
  ): Promise<SessionData> {
    // Clean up expired sessions first
    await this.cleanupExpiredSessions(userId);

    // Check session limit
    const activeSessions = await this.getActiveSessions(userId);
    if (activeSessions.length >= SESSION_CONFIG.maxSessionsPerUser) {
      // Terminate oldest session
      await this.terminateSession(activeSessions[0].id);
    }

    const sessionToken = this.generateSecureToken();
    const refreshToken = this.generateSecureToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_CONFIG.accessTokenExpiry);

    const sessionData: Omit<SessionData, 'createdAt'> = {
      id: crypto.randomUUID(),
      userId,
      organizationId,
      sessionToken,
      refreshToken,
      deviceFingerprint,
      ipAddress,
      userAgent,
      location,
      isActive: true,
      lastActivity: now,
      expiresAt,
    };

    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        id: sessionData.id,
        user_id: sessionData.userId,
        session_token: sessionData.sessionToken,
        refresh_token: sessionData.refreshToken,
        device_fingerprint: sessionData.deviceFingerprint,
        ip_address: sessionData.ipAddress,
        user_agent: sessionData.userAgent,
        location: sessionData.location,
        is_active: sessionData.isActive,
        last_activity: sessionData.lastActivity,
        expires_at: sessionData.expiresAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Log security event
    await supabase.rpc('log_security_event', {
      p_organization_id: organizationId,
      p_user_id: userId,
      p_event_type: 'login_success',
      p_severity: 'low',
      p_details: { deviceFingerprint, ipAddress, userAgent },
    });

    return {
      ...sessionData,
      createdAt: new Date(data.created_at),
    };
  }

  /**
   * Validate and refresh session if needed
   */
  async validateSession(sessionToken: string): Promise<SessionData | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const session: SessionData = {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      sessionToken: data.session_token,
      refreshToken: data.refresh_token,
      deviceFingerprint: data.device_fingerprint,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      location: data.location,
      isActive: data.is_active,
      lastActivity: new Date(data.last_activity),
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at),
    };

    const now = new Date();

    // Check if session is expired
    if (session.expiresAt <= now) {
      // Try to refresh session
      const refreshedSession = await this.refreshSession(session.refreshToken);
      if (refreshedSession) {
        return refreshedSession;
      } else {
        await this.terminateSession(session.id);
        return null;
      }
    }

    // Check if JWT rotation is needed
    const timeSinceCreation = now.getTime() - session.createdAt.getTime();
    if (timeSinceCreation > SESSION_CONFIG.jwtRotationInterval) {
      return await this.rotateSession(session);
    }

    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity: now })
      .eq('id', session.id);

    return session;
  }

  /**
   * Refresh an expired session using refresh token
   */
  async refreshSession(refreshToken: string): Promise<SessionData | null> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const now = new Date();
    const refreshTokenExpiry = new Date(data.created_at);
    refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() + SESSION_CONFIG.refreshTokenExpiry);

    // Check if refresh token is expired
    if (refreshTokenExpiry <= now) {
      await this.terminateSession(data.id);
      return null;
    }

    // Generate new session token and extend expiry
    const newSessionToken = this.generateSecureToken();
    const newExpiresAt = new Date(now.getTime() + SESSION_CONFIG.accessTokenExpiry);

    const { data: updatedSession, error: updateError } = await supabase
      .from('user_sessions')
      .update({
        session_token: newSessionToken,
        last_activity: now,
        expires_at: newExpiresAt,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) return null;

    return {
      id: updatedSession.id,
      userId: updatedSession.user_id,
      organizationId: updatedSession.organization_id,
      sessionToken: updatedSession.session_token,
      refreshToken: updatedSession.refresh_token,
      deviceFingerprint: updatedSession.device_fingerprint,
      ipAddress: updatedSession.ip_address,
      userAgent: updatedSession.user_agent,
      location: updatedSession.location,
      isActive: updatedSession.is_active,
      lastActivity: new Date(updatedSession.last_activity),
      expiresAt: new Date(updatedSession.expires_at),
      createdAt: new Date(updatedSession.created_at),
    };
  }

  /**
   * Rotate session tokens for security
   */
  private async rotateSession(session: SessionData): Promise<SessionData> {
    const newSessionToken = this.generateSecureToken();
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + SESSION_CONFIG.accessTokenExpiry);

    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        session_token: newSessionToken,
        last_activity: now,
        expires_at: newExpiresAt,
      })
      .eq('id', session.id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...session,
      sessionToken: data.session_token,
      lastActivity: new Date(data.last_activity),
      expiresAt: new Date(data.expires_at),
    };
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        expires_at: new Date(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Terminate all sessions for a user (logout from all devices)
   */
  async terminateAllUserSessions(userId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        expires_at: new Date(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<SessionData[]> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((session: any) => ({
      id: session.id,
      userId: session.user_id,
      organizationId: session.organization_id,
      sessionToken: session.session_token,
      refreshToken: session.refresh_token,
      deviceFingerprint: session.device_fingerprint,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      location: session.location,
      isActive: session.is_active,
      lastActivity: new Date(session.last_activity),
      expiresAt: new Date(session.expires_at),
      createdAt: new Date(session.created_at),
    }));
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(userId?: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    const now = new Date();
    let query = supabase
      .from('user_sessions')
      .update({
        is_active: false,
      })
      .lt('expires_at', now);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;
  }

  /**
   * Generate cryptographically secure token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get device fingerprint from request
   */
  static getDeviceFingerprint(req: NextRequest): string {
    const userAgent = req.headers.get('user-agent') || '';
    const acceptLanguage = req.headers.get('accept-language') || '';
    const acceptEncoding = req.headers.get('accept-encoding') || '';

    return crypto
      .createHash('sha256')
      .update(`${userAgent}${acceptLanguage}${acceptEncoding}`)
      .digest('hex');
  }
}

export default SessionManager;
