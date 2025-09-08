/**
 * Enhanced Supabase Auth Service with Enterprise Features
 * Handles authentication, authorization, role claims, and session management
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  organizations: Array<{
    id: string;
    name: string;
    role: string;
    permissions: string[];
  }>;
  entitlements: {
    feature_atlvs: boolean;
    feature_opendeck: boolean;
    feature_ghxstship: boolean;
  };
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export class SupabaseAuthService {
  private supabase;
  private authState: AuthState = {
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false
  };
  private listeners = new Set<(state: AuthState) => void>();

  constructor() {
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initialize();
  }

  private async initialize() {
    try {
      // Get initial session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }

      if (session) {
        await this.handleAuthStateChange(session);
      }

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        await this.handleAuthStateChange(session);
      });

      this.authState.initialized = true;
      this.authState.loading = false;
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.authState.loading = false;
      this.authState.initialized = true;
      this.notifyListeners();
    }
  }

  private async handleAuthStateChange(session: Session | null) {
    this.authState.session = session;
    this.authState.user = session?.user || null;

    if (session?.user) {
      try {
        const profile = await this.loadUserProfile(session.user.id);
        this.authState.profile = profile;
      } catch (error) {
        console.error('Error loading user profile:', error);
        this.authState.profile = null;
      }
    } else {
      this.authState.profile = null;
    }

    this.authState.loading = false;
    this.notifyListeners();
  }

  private async loadUserProfile(userId: string): Promise<UserProfile | null> {
    // Load user profile with organizations and entitlements
    const { data: profile, error: profileError } = await this.supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        role,
        user_entitlements (
          feature_atlvs,
          feature_opendeck,
          feature_ghxstship
        )
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to load profile: ${profileError.message}`);
    }

    // Load user organizations
    const { data: memberships, error: membershipsError } = await this.supabase
      .from('organization_memberships')
      .select(`
        role,
        permissions,
        organizations (
          id,
          name
        )
      `)
      .eq('user_id', userId);

    if (membershipsError) {
      throw new Error(`Failed to load memberships: ${membershipsError.message}`);
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      organizations: memberships?.map(m => ({
        id: m.organizations.id,
        name: m.organizations.name,
        role: m.role,
        permissions: m.permissions || []
      })) || [],
      entitlements: {
        feature_atlvs: profile.user_entitlements?.feature_atlvs || false,
        feature_opendeck: profile.user_entitlements?.feature_opendeck || false,
        feature_ghxstship: profile.user_entitlements?.feature_ghxstship || false
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Public API
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.authState);
    
    return () => this.listeners.delete(listener);
  }

  getState(): AuthState {
    return { ...this.authState };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signInWithProvider(provider: 'google' | 'github' | 'microsoft') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateProfile(updates: Partial<UserProfile>) {
    if (!this.authState.user) {
      throw new Error('No authenticated user');
    }

    // Update auth user metadata
    if (updates.full_name || updates.avatar_url) {
      const { error: authError } = await this.supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          avatar_url: updates.avatar_url
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }
    }

    // Update profile table
    const { error: profileError } = await this.supabase
      .from('users')
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url
      })
      .eq('id', this.authState.user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Reload profile
    const profile = await this.loadUserProfile(this.authState.user.id);
    this.authState.profile = profile;
    this.notifyListeners();
  }

  // Authorization helpers
  hasFeatureAccess(feature: 'atlvs' | 'opendeck' | 'ghxstship'): boolean {
    if (!this.authState.profile) return false;
    
    switch (feature) {
      case 'atlvs':
        return this.authState.profile.entitlements.feature_atlvs;
      case 'opendeck':
        return this.authState.profile.entitlements.feature_opendeck;
      case 'ghxstship':
        return this.authState.profile.entitlements.feature_ghxstship;
      default:
        return false;
    }
  }

  hasRoleInOrganization(organizationId: string, role: string): boolean {
    if (!this.authState.profile) return false;
    
    const org = this.authState.profile.organizations.find(o => o.id === organizationId);
    return org?.role === role;
  }

  hasPermissionInOrganization(organizationId: string, permission: string): boolean {
    if (!this.authState.profile) return false;
    
    const org = this.authState.profile.organizations.find(o => o.id === organizationId);
    return org?.permissions.includes(permission) || false;
  }

  canAccessOrganization(organizationId: string): boolean {
    if (!this.authState.profile) return false;
    
    return this.authState.profile.organizations.some(o => o.id === organizationId);
  }

  getCurrentOrganization(): { id: string; name: string; role: string } | null {
    if (!this.authState.profile || this.authState.profile.organizations.length === 0) {
      return null;
    }
    
    // Return first organization for now - in a real app, this would be user-selected
    const org = this.authState.profile.organizations[0];
    return {
      id: org.id,
      name: org.name,
      role: org.role
    };
  }

  // JWT token helpers
  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token || null;
  }

  async refreshSession(): Promise<Session | null> {
    const { data: { session }, error } = await this.supabase.auth.refreshSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    
    return session;
  }

  // MFA methods
  async enrollMFA(factorType: 'totp' = 'totp') {
    const { data, error } = await this.supabase.auth.mfa.enroll({
      factorType,
      friendlyName: 'Authenticator App'
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async verifyMFA(factorId: string, challengeId: string, code: string) {
    const { data, error } = await this.supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async unenrollMFA(factorId: string) {
    const { data, error } = await this.supabase.auth.mfa.unenroll({
      factorId
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

// Singleton instance
export const authService = new SupabaseAuthService();

// React hook
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(authService.getState());

  React.useEffect(() => {
    return authService.subscribe(setAuthState);
  }, []);

  return {
    ...authState,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    signInWithProvider: authService.signInWithProvider.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    hasFeatureAccess: authService.hasFeatureAccess.bind(authService),
    hasRoleInOrganization: authService.hasRoleInOrganization.bind(authService),
    hasPermissionInOrganization: authService.hasPermissionInOrganization.bind(authService),
    canAccessOrganization: authService.canAccessOrganization.bind(authService),
    getCurrentOrganization: authService.getCurrentOrganization.bind(authService),
    getAccessToken: authService.getAccessToken.bind(authService),
    refreshSession: authService.refreshSession.bind(authService),
    enrollMFA: authService.enrollMFA.bind(authService),
    verifyMFA: authService.verifyMFA.bind(authService),
    unenrollMFA: authService.unenrollMFA.bind(authService)
  };
}

// Add React import
import React from 'react';
