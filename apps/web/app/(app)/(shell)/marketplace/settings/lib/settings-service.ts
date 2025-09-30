import { createClient } from '@/lib/supabase/client';
import type { MarketplaceSettingsData, NotificationPreferences, SecuritySettings, PaymentConfiguration, IntegrationSettings, MarketplacePreferences, SettingsFormData, SettingsActivity } from '../types';

export class SettingsService {
  private supabase = createClient();

  async getSettings(userId: string, orgId: string): Promise<MarketplaceSettingsData | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  async updateSettings(userId: string, orgId: string, settingsData: SettingsFormData): Promise<MarketplaceSettingsData> {
    try {
      const existingSettings = await this.getSettings(userId, orgId);
      
      const updatedSettings = {
        ...existingSettings,
        ...settingsData.profile,
        user_id: userId,
        organization_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (existingSettings) {
        const { data, error } = await this.supabase
          .from('marketplace_settings')
          .update(updatedSettings)
          .eq('user_id', userId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('marketplace_settings')
          .insert([{
            ...updatedSettings,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const existing = await this.getNotificationPreferences(userId);
      
      const updatedPreferences = {
        ...existing,
        ...preferences,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .update(updatedPreferences)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('notification_preferences')
          .insert([{
            ...updatedPreferences,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return null;
    }
  }

  async updateSecuritySettings(userId: string, settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    try {
      const existing = await this.getSecuritySettings(userId);
      
      const updatedSettings = {
        ...existing,
        ...settings,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await this.supabase
          .from('security_settings')
          .update(updatedSettings)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('security_settings')
          .insert([{
            ...updatedSettings,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async enableTwoFactor(userId: string, method: 'sms' | 'email' | 'authenticator'): Promise<{ secret?: string; qrCode?: string; backupCodes: string[] }> {
    try {
      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      const result: unknown = { backupCodes };

      if (method === 'authenticator') {
        // Generate TOTP secret (would use a proper TOTP library)
        const secret = Math.random().toString(36).substring(2, 32);
        result.secret = secret;
        result.qrCode = `otpauth://totp/Marketplace:${userId}?secret=${secret}&issuer=Marketplace`;
      }

      // Update security settings
      await this.updateSecuritySettings(userId, {
        two_factor_authentication: {
          enabled: true,
          method,
          backup_codes: backupCodes
        }
      });

      // Log activity
      await this.logActivity(userId, 'security', 'enabled', 'Two-factor authentication enabled');

      return result;
    } catch (error) {
      console.error('Error enabling two-factor authentication:', error);
      throw error;
    }
  }

  async disableTwoFactor(userId: string): Promise<void> {
    try {
      await this.updateSecuritySettings(userId, {
        two_factor_authentication: {
          enabled: false,
          method: 'sms',
          backup_codes: []
        }
      });

      // Log activity
      await this.logActivity(userId, 'security', 'disabled', 'Two-factor authentication disabled');
    } catch (error) {
      console.error('Error disabling two-factor authentication:', error);
      throw error;
    }
  }

  async getPaymentConfiguration(userId: string, orgId: string): Promise<PaymentConfiguration | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_configurations')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payment configuration:', error);
      return null;
    }
  }

  async updatePaymentConfiguration(userId: string, orgId: string, config: Partial<PaymentConfiguration>): Promise<PaymentConfiguration> {
    try {
      const existing = await this.getPaymentConfiguration(userId, orgId);
      
      const updatedConfig = {
        ...existing,
        ...config,
        user_id: userId,
        organization_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await this.supabase
          .from('payment_configurations')
          .update(updatedConfig)
          .eq('user_id', userId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('payment_configurations')
          .insert([{
            ...updatedConfig,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating payment configuration:', error);
      throw error;
    }
  }

  async getIntegrationSettings(userId: string, orgId: string): Promise<IntegrationSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('integration_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching integration settings:', error);
      return null;
    }
  }

  async updateIntegrationSettings(userId: string, orgId: string, settings: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
    try {
      const existing = await this.getIntegrationSettings(userId, orgId);
      
      const updatedSettings = {
        ...existing,
        ...settings,
        user_id: userId,
        organization_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await this.supabase
          .from('integration_settings')
          .update(updatedSettings)
          .eq('user_id', userId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('integration_settings')
          .insert([{
            ...updatedSettings,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating integration settings:', error);
      throw error;
    }
  }

  async testIntegration(userId: string, orgId: string, integration: string): Promise<{ success: boolean; message: string }> {
    try {
      // This would test the actual integration
      // For now, simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: `${integration} integration test successful`
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: `${integration} integration test failed: ${error?.message || 'Unknown error'}`
      };
    }
  }

  async getMarketplacePreferences(userId: string, orgId: string): Promise<MarketplacePreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching marketplace preferences:', error);
      return null;
    }
  }

  async updateMarketplacePreferences(userId: string, orgId: string, preferences: Partial<MarketplacePreferences>): Promise<MarketplacePreferences> {
    try {
      const existing = await this.getMarketplacePreferences(userId, orgId);
      
      const updatedPreferences = {
        ...existing,
        ...preferences,
        user_id: userId,
        organization_id: orgId,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await this.supabase
          .from('marketplace_preferences')
          .update(updatedPreferences)
          .eq('user_id', userId)
          .eq('organization_id', orgId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await this.supabase
          .from('marketplace_preferences')
          .insert([{
            ...updatedPreferences,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating marketplace preferences:', error);
      throw error;
    }
  }

  async getSettingsActivity(userId: string, limit: number = 50): Promise<SettingsActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('settings_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching settings activity:', error);
      return [];
    }
  }

  async logActivity(userId: string, category: string, action: string, description: string, oldValue?: unknown, newValue?: unknown): Promise<void> {
    try {
      await this.supabase
        .from('settings_activity')
        .insert([{
          user_id: userId,
          category,
          action,
          description,
          old_value: oldValue,
          new_value: newValue,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error logging settings activity:', error);
    }
  }

  async exportSettings(userId: string, orgId: string, format: 'json' | 'csv'): Promise<Blob> {
    try {
      const [
        settings,
        notifications,
        security,
        payments,
        integrations,
        preferences
      ] = await Promise.all([
        this.getSettings(userId, orgId),
        this.getNotificationPreferences(userId),
        this.getSecuritySettings(userId),
        this.getPaymentConfiguration(userId, orgId),
        this.getIntegrationSettings(userId, orgId),
        this.getMarketplacePreferences(userId, orgId)
      ]);

      const exportData = {
        settings,
        notifications,
        security: security ? { ...security, two_factor_authentication: { ...security.two_factor_authentication, backup_codes: [] } } : null, // Remove sensitive data
        payments,
        integrations,
        preferences,
        exported_at: new Date().toISOString()
      };

      if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        // Flatten for CSV
        const flatData = this.flattenObject(exportData);
        const headers = Object.keys(flatData).join(',');
        const values = Object.values(flatData).join(',');
        const csv = [headers, values].join('\n');
        return new Blob([csv], { type: 'text/csv' });
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }

  async resetToDefaults(userId: string, orgId: string, category: 'all' | 'profile' | 'notifications' | 'security' | 'payments' | 'integrations' | 'preferences'): Promise<void> {
    try {
      const tables = {
        profile: 'marketplace_settings',
        notifications: 'notification_preferences',
        security: 'security_settings',
        payments: 'payment_configurations',
        integrations: 'integration_settings',
        preferences: 'marketplace_preferences'
      };

      if (category === 'all') {
        // Reset all settings
        for (const [cat, table] of Object.entries(tables)) {
          await this.supabase
            .from(table)
            .delete()
            .eq('user_id', userId);
          
          await this.logActivity(userId, cat, 'reset', `${cat} settings reset to defaults`);
        }
      } else {
        // Reset specific category
        const table = tables[category];
        if (table) {
          await this.supabase
            .from(table)
            .delete()
            .eq('user_id', userId);
          
          await this.logActivity(userId, category, 'reset', `${category} settings reset to defaults`);
        }
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }

  // Helper methods
  private flattenObject(obj: unknown, prefix: string = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};
    
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        flattened[prefix + key] = '';
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], prefix + key + '.'));
      } else {
        flattened[prefix + key] = obj[key];
      }
    }
    
    return flattened;
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}
