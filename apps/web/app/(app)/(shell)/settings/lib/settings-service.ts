/**
 * Settings Service Layer
 * ATLVS Architecture Compliance
 */

import { createBrowserClient } from '@ghxstship/auth';
import type {
  Setting,
  SettingRecord,
  SettingsFormData,
  SettingsSearchParams,
  SettingsStatistics,
  SettingsAuditLog,
  SettingsExportOptions,
  SettingsImportResult,
  SettingsFilterOptions,
} from '../types';

class SettingsService {
  private supabase = createBrowserClient();

  /**
   * Fetch all settings with optional filtering and pagination
   */
  async getSettings(params?: SettingsSearchParams): Promise<SettingRecord[]> {
    try {
      let query = this.supabase
        .from('organization_settings')
        .select('*')
        .order('updated_at', { ascending: false });

      // Apply filters
      if (params?.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params?.category) {
        query = query.eq('category', params.category);
      }

      if (params?.type) {
        query = query.eq('type', params.type);
      }

      if (params?.is_public !== undefined) {
        query = query.eq('is_public', params.is_public);
      }

      if (params?.is_editable !== undefined) {
        query = query.eq('is_editable', params.is_editable);
      }

      if (params?.created_after) {
        query = query.gte('created_at', params.created_after);
      }

      if (params?.created_before) {
        query = query.lte('created_at', params.created_before);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(this.transformToRecord) || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  /**
   * Get a single setting by ID
   */
  async getSetting(id: string): Promise<SettingRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('organization_settings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? this.transformToRecord(data) : null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw new Error('Failed to fetch setting');
    }
  }

  /**
   * Create a new setting
   */
  async createSetting(data: SettingsFormData): Promise<SettingRecord> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const settingData = {
        ...data,
        organization_id: membership.organization_id,
        created_by: user.id,
        updated_by: user.id,
      };

      const { data: newSetting, error } = await this.supabase
        .from('organization_settings')
        .insert([settingData])
        .select()
        .single();

      if (error) throw error;

      // Log the creation
      await this.logAuditEvent(newSetting.id, 'create', null, settingData, user.id);

      return this.transformToRecord(newSetting);
    } catch (error) {
      console.error('Error creating setting:', error);
      throw new Error('Failed to create setting');
    }
  }

  /**
   * Update an existing setting
   */
  async updateSetting(id: string, data: Partial<SettingsFormData>): Promise<SettingRecord> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current setting for audit log
      const currentSetting = await this.getSetting(id);
      if (!currentSetting) throw new Error('Setting not found');

      const updateData = {
        ...data,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedSetting, error } = await this.supabase
        .from('organization_settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log the update
      await this.logAuditEvent(id, 'update', currentSetting, updateData, user.id);

      return this.transformToRecord(updatedSetting);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw new Error('Failed to update setting');
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(id: string): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current setting for audit log
      const currentSetting = await this.getSetting(id);
      if (!currentSetting) throw new Error('Setting not found');

      const { error } = await this.supabase
        .from('organization_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log the deletion
      await this.logAuditEvent(id, 'delete', currentSetting, null, user.id);
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw new Error('Failed to delete setting');
    }
  }

  /**
   * Bulk delete settings
   */
  async bulkDeleteSettings(ids: string[]): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current settings for audit logs
      const currentSettings = await Promise.all(
        ids.map(id => this.getSetting(id))
      );

      const { error } = await this.supabase
        .from('organization_settings')
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Log the deletions
      await Promise.all(
        ids.map((id, index) => 
          this.logAuditEvent(id, 'delete', currentSettings[index], null, user.id)
        )
      );
    } catch (error) {
      console.error('Error bulk deleting settings:', error);
      throw new Error('Failed to delete settings');
    }
  }

  /**
   * Get settings statistics
   */
  async getStatistics(): Promise<SettingsStatistics> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      // Get total count
      const { count: totalSettings } = await this.supabase
        .from('organization_settings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', membership.organization_id);

      // Get counts by category
      const { data: categoryData } = await this.supabase
        .from('organization_settings')
        .select('category')
        .eq('organization_id', membership.organization_id);

      const settingsByCategory = categoryData?.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get public settings count
      const { count: publicSettings } = await this.supabase
        .from('organization_settings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', membership.organization_id)
        .eq('is_public', true);

      // Get editable settings count
      const { count: editableSettings } = await this.supabase
        .from('organization_settings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', membership.organization_id)
        .eq('is_editable', true);

      // Get recently updated count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentlyUpdated } = await this.supabase
        .from('organization_settings')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', membership.organization_id)
        .gte('updated_at', sevenDaysAgo.toISOString());

      return {
        totalSettings: totalSettings || 0,
        settingsByCategory,
        publicSettings: publicSettings || 0,
        editableSettings: editableSettings || 0,
        recentlyUpdated: recentlyUpdated || 0,
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  /**
   * Get filter options for advanced filtering
   */
  async getFilterOptions(): Promise<SettingsFilterOptions> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: membership } = await this.supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) throw new Error('No active organization membership');

      const { data: settings } = await this.supabase
        .from('organization_settings')
        .select('category, type, is_public, is_editable')
        .eq('organization_id', membership.organization_id);

      if (!settings) return { categories: [], types: [], publicOptions: [], editableOptions: [] };

      // Count categories
      const categoryCount = settings.reduce((acc, setting) => {
        acc[setting.category] = (acc[setting.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count types
      const typeCount = settings.reduce((acc, setting) => {
        acc[setting.type] = (acc[setting.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count public/private
      const publicCount = settings.filter(s => s.is_public).length;
      const privateCount = settings.length - publicCount;

      // Count editable/readonly
      const editableCount = settings.filter(s => s.is_editable).length;
      const readonlyCount = settings.length - editableCount;

      return {
        categories: Object.entries(categoryCount).map(([value, count]) => ({
          value: value as unknown,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count,
        })),
        types: Object.entries(typeCount).map(([value, count]) => ({
          value: value as unknown,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count,
        })),
        publicOptions: [
          { value: true, label: 'Public', count: publicCount },
          { value: false, label: 'Private', count: privateCount },
        ],
        editableOptions: [
          { value: true, label: 'Editable', count: editableCount },
          { value: false, label: 'Read-only', count: readonlyCount },
        ],
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw new Error('Failed to fetch filter options');
    }
  }

  /**
   * Export settings data
   */
  async exportSettings(options: SettingsExportOptions): Promise<Blob> {
    try {
      const params: SettingsSearchParams = {};
      
      if (options.categories?.length) {
        // For multiple categories, we'll need to fetch them separately
        // This is a simplified implementation
      }

      if (options.dateRange) {
        params.created_after = options.dateRange.start;
        params.created_before = options.dateRange.end;
      }

      const settings = await this.getSettings(params);

      if (options.format === 'json') {
        const exportData = options.includeMetadata 
          ? settings 
          : settings.map(({ id, name, category, value, description, type }) => ({
              id, name, category, value, description, type
            }));

        return new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
      } else if (options.format === 'csv') {
        const headers = options.includeMetadata
          ? ['ID', 'Name', 'Category', 'Value', 'Description', 'Type', 'Public', 'Editable', 'Created', 'Updated']
          : ['ID', 'Name', 'Category', 'Value', 'Description', 'Type'];

        const rows = settings.map(setting => {
          const baseRow = [
            setting.id,
            setting.name,
            setting.category,
            setting.value,
            setting.description,
            setting.type,
          ];

          if (options.includeMetadata) {
            return [
              ...baseRow,
              setting.is_public,
              setting.is_editable,
              setting.created_at,
              setting.updated_at,
            ];
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
      console.error('Error exporting settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  /**
   * Get audit logs for settings
   */
  async getAuditLogs(settingId?: string): Promise<SettingsAuditLog[]> {
    try {
      let query = this.supabase
        .from('settings_audit_logs')
        .select(`
          *,
          user:users(name, email)
        `)
        .order('timestamp', { ascending: false });

      if (settingId) {
        query = query.eq('setting_id', settingId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(log => ({
        ...log,
        user_name: log.user?.name || log.user?.email || 'Unknown User',
      })) || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Log audit events
   */
  private async logAuditEvent(
    settingId: string,
    action: 'create' | 'update' | 'delete',
    oldValue: unknown,
    newValue: unknown,
    userId: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('settings_audit_logs')
        .insert([{
          setting_id: settingId,
          action,
          old_value: oldValue,
          new_value: newValue,
          user_id: userId,
          timestamp: new Date().toISOString(),
        }]);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw here as audit logging shouldn't break the main operation
    }
  }

  /**
   * Transform database record to SettingRecord
   */
  private transformToRecord(data: unknown): SettingRecord {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value),
      description: data.description || '',
      type: data.type,
      is_public: String(data.is_public),
      is_editable: String(data.is_editable),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

export const settingsService = new SettingsService();
