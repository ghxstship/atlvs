/**
 * Files Permissions Service
 * Row Level Security permission handlers
 * Manages access control and permission evaluation
 */

import { createClient } from '@/lib/supabase/client';
import type { AccessLevel } from '../types';

export class FilesPermissionsService {
  private supabase = createClient();

  /**
   * Check if user has permission to view file
   */
  async canViewFile(fileId: string, userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_view_file', {
        file_id: fileId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return false;
      return data;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has permission to edit file
   */
  async canEditFile(fileId: string, userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_edit_file', {
        file_id: fileId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return false;
      return data;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has permission to delete file
   */
  async canDeleteFile(fileId: string, userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_delete_file', {
        file_id: fileId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return false;
      return data;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has permission to create files in folder
   */
  async canCreateInFolder(folderId: string | null, userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_create_in_folder', {
        folder_id: folderId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return false;
      return data;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has permission to manage folder
   */
  async canManageFolder(folderId: string, userId: string, orgId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('can_manage_folder', {
        folder_id: folderId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return false;
      return data;
    } catch {
      return false;
    }
  }

  /**
   * Get user's access level for a file
   */
  async getFileAccessLevel(fileId: string, userId: string, orgId: string): Promise<AccessLevel | null> {
    try {
      const { data, error } = await this.supabase.rpc('get_file_access_level', {
        file_id: fileId,
        user_id: userId,
        org_id: orgId,
      });

      if (error) return null;
      return data as AccessLevel;
    } catch {
      return null;
    }
  }

  /**
   * Get files user has access to with their permission levels
   */
  async getAccessibleFiles(userId: string, orgId: string, params: {
    limit?: number;
    offset?: number;
    minAccess?: AccessLevel;
  } = {}) {
    try {
      const { data, error } = await this.supabase.rpc('get_accessible_files', {
        user_id: userId,
        org_id: orgId,
        limit_val: params.limit || 50,
        offset_val: params.offset || 0,
        min_access: params.minAccess || 'private',
      });

      if (error) throw error;
      return data;
    } catch {
      return [];
    }
  }

  /**
   * Check bulk permissions for multiple files
   */
  async checkBulkPermissions(fileIds: string[], userId: string, orgId: string, action: 'view' | 'edit' | 'delete'): Promise<{
    allowed: string[];
    denied: string[];
  }> {
    try {
      const { data, error } = await this.supabase.rpc('check_bulk_file_permissions', {
        file_ids: fileIds,
        user_id: userId,
        org_id: orgId,
        action_type: action,
      });

      if (error) throw error;
      return data;
    } catch {
      return { allowed: [], denied: fileIds };
    }
  }

  /**
   * Get user's role in organization
   */
  async getUserRole(userId: string, orgId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .single();

      if (error) return null;
      return data.role;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is admin/owner in organization
   */
  async isAdmin(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, orgId);
    return role === 'owner' || role === 'admin';
  }

  /**
   * Check if user is member of organization
   */
  async isMember(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, orgId);
    return role !== null;
  }

  /**
   * Get organization settings for permissions
   */
  async getOrgSettings(orgId: string): Promise<any> => {
    try {
      const { data, error } = await this.supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (error) return {};
      return data;
    } catch {
      return {};
    }
  }

  /**
   * Log access for audit trail
   */
  async logAccess(fileId: string, userId: string, action: string, metadata?: any): Promise<void> {
    try {
      await this.supabase.rpc('log_file_access', {
        file_id: fileId,
        user_id: userId,
        action_type: action,
        access_metadata: metadata || {},
      });
    } catch (error) {
      // Log access logging failure but don't throw
      console.error('Failed to log file access:', error);
    }
  }

  /**
   * Cache permission checks for performance
   */
  private permissionCache = new Map<string, { result: boolean; expires: number }>();

  async checkPermissionCached(
    fileId: string,
    userId: string,
    orgId: string,
    permission: string,
    ttlMs: number = 300000 // 5 minutes
  ): Promise<boolean> {
    const cacheKey = `${fileId}:${userId}:${orgId}:${permission}`;
    const cached = this.permissionCache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.result;
    }

    let result: boolean;
    switch (permission) {
      case 'view':
        result = await this.canViewFile(fileId, userId, orgId);
        break;
      case 'edit':
        result = await this.canEditFile(fileId, userId, orgId);
        break;
      case 'delete':
        result = await this.canDeleteFile(fileId, userId, orgId);
        break;
      default:
        result = false;
    }

    this.permissionCache.set(cacheKey, {
      result,
      expires: Date.now() + ttlMs,
    });

    return result;
  }
}

export const filesPermissionsService = new FilesPermissionsService();
