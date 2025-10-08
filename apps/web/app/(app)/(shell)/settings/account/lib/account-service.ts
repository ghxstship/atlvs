/**
 * Account Service Layer
 * ATLVS Architecture Compliance
 */

import { createBrowserClient } from '@ghxstship/auth';
import type {
  UserProfile,
  UserSession,
  ApiKey,
  TwoFactorAuth,
  AccountRecord,
  ProfileFormData,
  PasswordFormData,
  ApiKeyFormData,
  AccountSearchParams,
  AccountStatistics,
  AccountAuditLog,
  AccountExportOptions,
  AccountFilterOptions
} from '../types';

class AccountService {
  private supabase = createBrowserClient();

  /**
   * Profile Management
   */
  async getProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(data: ProfileFormData): Promise<UserProfile> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: updatedProfile, error } = await this.supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Log the profile update
      await this.logAuditEvent('profile_update', data, user.id);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async changePassword(data: PasswordFormData): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: data.new_password
      });

      if (error) throw error;

      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        await this.logAuditEvent('password_change', {}, user.id);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  /**
   * Session Management
   */
  async getSessions(): Promise<UserSession[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await this.logAuditEvent('session_revoke', { sessionId }, user.id);
    } catch (error) {
      console.error('Error revoking session:', error);
      throw new Error('Failed to revoke session');
    }
  }

  async revokeAllSessions(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('is_current', true);

      if (error) throw error;

      await this.logAuditEvent('session_revoke', { action: 'revoke_all' }, user.id);
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      throw new Error('Failed to revoke all sessions');
    }
  }

  /**
   * API Key Management
   */
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw new Error('Failed to fetch API keys');
    }
  }

  async createApiKey(data: ApiKeyFormData): Promise<ApiKey> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate API key
      const keyPrefix = 'ghxst_';
      const keyValue = keyPrefix + this.generateRandomString(32);

      const { data: newApiKey, error } = await this.supabase
        .from('api_keys')
        .insert([{
          ...data,
          user_id: user.id,
          key_prefix: keyPrefix,
          key_hash: await this.hashApiKey(keyValue),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await this.logAuditEvent('api_key_create', { name: data.name }, user.id);

      return { ...newApiKey, key_value: keyValue }; // Return full key only once
    } catch (error) {
      console.error('Error creating API key:', error);
      throw new Error('Failed to create API key');
    }
  }

  async revokeApiKey(keyId: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (error) throw error;

      await this.logAuditEvent('api_key_revoke', { keyId }, user.id);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Two-Factor Authentication
   */
  async getTwoFactor(): Promise<TwoFactorAuth | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('user_two_factor')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching 2FA:', error);
      throw new Error('Failed to fetch 2FA settings');
    }
  }

  async setupTwoFactor(): Promise<string> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate TOTP secret and QR code
      const secret = this.generateTotpSecret();
      const qrCode = this.generateQrCode(user.email!, secret);

      // Store temporary secret
      await this.supabase
        .from('user_two_factor_temp')
        .upsert({
          user_id: user.id,
          secret,
          created_at: new Date().toISOString()
        });

      return qrCode;
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw new Error('Failed to setup 2FA');
    }
  }

  async enableTwoFactor(code: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify the code and enable 2FA
      const isValid = await this.verifyTotpCode(user.id, code);
      if (!isValid) throw new Error('Invalid verification code');

      // Move from temp to permanent
      const { data: tempData } = await this.supabase
        .from('user_two_factor_temp')
        .select('secret')
        .eq('user_id', user.id)
        .single();

      if (!tempData) throw new Error('Setup not found');

      const backupCodes = this.generateBackupCodes();

      await this.supabase
        .from('user_two_factor')
        .upsert({
          user_id: user.id,
          secret: tempData.secret,
          backup_codes: backupCodes,
          is_enabled: true,
          created_at: new Date().toISOString()
        });

      // Clean up temp data
      await this.supabase
        .from('user_two_factor_temp')
        .delete()
        .eq('user_id', user.id);

      await this.logAuditEvent('2fa_enable', {}, user.id);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      throw new Error('Failed to enable 2FA');
    }
  }

  async disableTwoFactor(code: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const isValid = await this.verifyTotpCode(user.id, code);
      if (!isValid) throw new Error('Invalid verification code');

      await this.supabase
        .from('user_two_factor')
        .update({ is_enabled: false })
        .eq('user_id', user.id);

      await this.logAuditEvent('2fa_disable', {}, user.id);
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw new Error('Failed to disable 2FA');
    }
  }

  /**
   * Account Records for ATLVS DataViews
   */
  async getAccountRecords(params?: AccountSearchParams): Promise<AccountRecord[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Combine data from multiple sources into unified records
      const [profile, sessions, apiKeys, twoFactor] = await Promise.all([
        this.getProfile(),
        this.getSessions(),
        this.getApiKeys(),
        this.getTwoFactor(),
      ]);

      const records: AccountRecord[] = [];

      // Profile record
      if (profile) {
        records.push({
          id: `profile-${profile.id}`,
          type: 'profile',
          name: 'User Profile',
          value: profile.name,
          description: `Email: ${profile.email}`,
          status: 'active',
          category: 'personal',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          metadata: profile
        });
      }

      // Session records
      sessions.forEach(session => {
        records.push({
          id: `session-${session.id}`,
          type: 'session',
          name: `Session ${session.id.substring(0, 8)}`,
          value: session.ip_address,
          description: `${session.user_agent} - ${session.location || 'Unknown location'}`,
          status: session.is_current ? 'active' : 'inactive',
          category: 'sessions',
          created_at: session.created_at,
          updated_at: session.last_active,
          metadata: session
        });
      });

      // API Key records
      apiKeys.forEach(key => {
        records.push({
          id: `apikey-${key.id}`,
          type: 'api_key',
          name: key.name,
          value: key.key_prefix + '***',
          description: `Permissions: ${key.permissions.join(', ')}`,
          status: key.is_active ? 'active' : 'revoked',
          category: 'api',
          created_at: key.created_at,
          updated_at: key.last_used || key.created_at,
          metadata: key
        });
      });

      // 2FA record
      if (twoFactor) {
        records.push({
          id: `2fa-${twoFactor.id}`,
          type: 'security',
          name: 'Two-Factor Authentication',
          value: twoFactor.is_enabled ? 'Enabled' : 'Disabled',
          description: `Last used: ${twoFactor.last_used || 'Never'}`,
          status: twoFactor.is_enabled ? 'active' : 'inactive',
          category: 'security',
          created_at: twoFactor.created_at,
          updated_at: twoFactor.last_used || twoFactor.created_at,
          metadata: twoFactor
        });
      }

      // Apply filters
      let filteredRecords = records;

      if (params?.query) {
        filteredRecords = filteredRecords.filter(record =>
          record.name.toLowerCase().includes(params.query!.toLowerCase()) ||
          record.description.toLowerCase().includes(params.query!.toLowerCase())
        );
      }

      if (params?.type) {
        filteredRecords = filteredRecords.filter(record => record.type === params.type);
      }

      if (params?.status) {
        filteredRecords = filteredRecords.filter(record => record.status === params.status);
      }

      if (params?.category) {
        filteredRecords = filteredRecords.filter(record => record.category === params.category);
      }

      return filteredRecords.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching account records:', error);
      throw new Error('Failed to fetch account records');
    }
  }

  /**
   * Statistics
   */
  async getStatistics(): Promise<AccountStatistics> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [sessions, apiKeys, profile] = await Promise.all([
        this.getSessions(),
        this.getApiKeys(),
        this.getProfile(),
      ]);

      const activeSessions = sessions.filter(s => s.is_current).length;
      const activeApiKeys = apiKeys.filter(k => k.is_active).length;
      
      // Calculate security score
      let securityScore = 50; // Base score
      if (await this.getTwoFactor()?.then(tf => tf?.is_enabled)) securityScore += 30;
      if (activeSessions <= 2) securityScore += 10;
      if (activeApiKeys <= 3) securityScore += 10;

      return {
        totalSessions: sessions.length,
        activeSessions,
        totalApiKeys: apiKeys.length,
        activeApiKeys,
        securityScore: Math.min(securityScore, 100),
        lastLoginDate: sessions[0]?.created_at || profile?.created_at || '',
        accountAge: profile ? Math.floor(
          (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ) : 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  /**
   * Audit Logs
   */
  async getAuditLogs(): Promise<AccountAuditLog[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('account_audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Export
   */
  async exportRecords(options: AccountExportOptions): Promise<Blob> {
    try {
      const records = await this.getAccountRecords();

      if (options.format === 'json') {
        const exportData = options.includeMetadata 
          ? records 
          : records.map(({ id, name, type, value, description, status, category }) => ({
              id, name, type, value, description, status, category
            }));

        return new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
      } else if (options.format === 'csv') {
        const headers = options.includeMetadata
          ? ['ID', 'Name', 'Type', 'Value', 'Description', 'Status', 'Category', 'Created', 'Updated']
          : ['ID', 'Name', 'Type', 'Value', 'Description', 'Status', 'Category'];

        const rows = records.map(record => {
          const baseRow = [
            record.id,
            record.name,
            record.type,
            record.value,
            record.description,
            record.status,
            record.category,
          ];

          if (options.includeMetadata) {
            return [...baseRow, record.created_at, record.updated_at];
          }

          return baseRow;
        });

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        return new Blob([csvContent], { type: 'text/csv' });
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Error exporting records:', error);
      throw new Error('Failed to export records');
    }
  }

  /**
   * Private helper methods
   */
  private async logAuditEvent(
    action: string,
    details: unknown,
    userId: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('account_audit_logs')
        .insert([{
          user_id: userId,
          action,
          details,
          ip_address: 'unknown', // Would be populated by middleware
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private generateTotpSecret(): string {
    return this.generateRandomString(32);
  }

  private generateQrCode(email: string, secret: string): string {
    // In a real implementation, this would generate a proper QR code
    return `otpauth://totp/GHXSTSHIP:${email}?secret=${secret}&issuer=GHXSTSHIP`;
  }

  private async verifyTotpCode(userId: string, code: string): Promise<boolean> {
    // In a real implementation, this would verify the TOTP code
    // For now, we'll accept any 6-digit code
    return /^\d{6}$/.test(code);
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRandomString(8));
    }
    return codes;
  }
}

export const accountService = new AccountService();
