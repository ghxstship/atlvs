import { BaseService, ServiceContext, ServiceResult } from './base-service';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
  organizationName?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  organizationId: string;
  role: string;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class AuthService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async signIn(credentials: LoginCredentials): Promise<ServiceResult<AuthSession>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return this.createErrorResult(error.message);
      }

      if (!data.user || !data.session) {
        return this.createErrorResult('Authentication failed');
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return this.createErrorResult('Failed to load user profile');
      }

      const authSession: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          fullName: profile.full_name,
          organizationId: profile.organization_id,
          role: profile.role,
          avatarUrl: profile.avatar_url
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!
      };

      return this.createSuccessResult(authSession);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async signUp(credentials: SignupCredentials): Promise<ServiceResult<{ user: User; needsVerification: boolean }>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            organization_name: credentials.organizationName
          }
        }
      });

      if (error) {
        return this.createErrorResult(error.message);
      }

      if (!data.user) {
        return this.createErrorResult('Failed to create user');
      }

      return this.createSuccessResult({
        user: data.user,
        needsVerification: !data.session
      });
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async signOut(): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getCurrentUser(): Promise<ServiceResult<AuthUser | null>> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        return this.createErrorResult(error.message);
      }

      if (!user) {
        return this.createSuccessResult(null);
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        return this.createErrorResult('Failed to load user profile');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email!,
        fullName: profile.full_name,
        organizationId: profile.organization_id,
        role: profile.role,
        avatarUrl: profile.avatar_url
      };

      return this.createSuccessResult(authUser);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async resetPassword(email: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async refreshSession(): Promise<ServiceResult<AuthSession>> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        return this.createErrorResult(error.message);
      }

      if (!data.user || !data.session) {
        return this.createErrorResult('Failed to refresh session');
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return this.createErrorResult('Failed to load user profile');
      }

      const authSession: AuthSession = {
        user: {
          id: data.user.id,
          email: data.user.email!,
          fullName: profile.full_name,
          organizationId: profile.organization_id,
          role: profile.role,
          avatarUrl: profile.avatar_url
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!
      };

      return this.createSuccessResult(authSession);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
