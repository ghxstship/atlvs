/**
 * Files Mutations Service
 * Data mutation operations with transaction management
 * Handles create, update, delete with rollback capabilities
 */

import { createClient } from '@/lib/supabase/client';
import type { CreateAssetInput, UpdateAssetInput, DigitalAsset } from '../types';

export class FilesMutationsService {
  private supabase = createClient();

  /**
   * Create file with transaction management
   */
  async createFile(input: CreateAssetInput, orgId: string, userId: string) {
    const { data, error } = await this.supabase.rpc('create_file_transaction', {
      file_data: input,
      org_id: orgId,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update file with optimistic locking
   */
  async updateFile(id: string, input: UpdateAssetInput, userId: string, version?: number) {
    const { data, error } = await this.supabase.rpc('update_file_optimistic', {
      file_id: id,
      update_data: input,
      user_id: userId,
      expected_version: version,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Bulk update files
   */
  async bulkUpdateFiles(updates: Array<{ id: string; data: UpdateAssetInput }>, userId: string) {
    const { data, error } = await this.supabase.rpc('bulk_update_files', {
      updates: updates,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete file
   */
  async softDeleteFile(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('soft_delete_file', {
      file_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Hard delete file (admin only)
   */
  async hardDeleteFile(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('hard_delete_file', {
      file_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Bulk delete files
   */
  async bulkDeleteFiles(ids: string[], userId: string, soft: boolean = true) {
    const { data, error } = await this.supabase.rpc('bulk_delete_files', {
      file_ids: ids,
      user_id: userId,
      soft_delete: soft,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Restore soft-deleted file
   */
  async restoreFile(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('restore_file', {
      file_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create file version
   */
  async createFileVersion(fileId: string, versionData: unknown, userId: string) {
    const { data, error } = await this.supabase.rpc('create_file_version', {
      file_id: fileId,
      version_data: versionData,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Move file to folder
   */
  async moveFileToFolder(fileId: string, folderId: string, userId: string) {
    const { data, error } = await this.supabase.rpc('move_file_to_folder', {
      file_id: fileId,
      folder_id: folderId,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create folder
   */
  async createFolder(name: string, parentId: string | null, orgId: string, userId: string) {
    const { data, error } = await this.supabase.rpc('create_file_folder', {
      folder_name: name,
      parent_folder_id: parentId,
      org_id: orgId,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Update folder
   */
  async updateFolder(id: string, updates: { name?: string; parent_id?: string }, userId: string) {
    const { data, error } = await this.supabase.rpc('update_file_folder', {
      folder_id: id,
      folder_updates: updates,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Delete folder
   */
  async deleteFolder(id: string, userId: string) {
    const { data, error } = await this.supabase.rpc('delete_file_folder', {
      folder_id: id,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }
}

export const filesMutationsService = new FilesMutationsService();
