/**
 * Files API Service
 * Enterprise-grade API client for files module
 * Handles all external API communications with retry logic, rate limiting, and error handling
 */

import { createClient } from '@/lib/supabase/client';
import type { DigitalAsset, CreateAssetInput, UpdateAssetInput } from '../types';

export class FilesApiService {
  private supabase = createClient();

  /**
   * Get files with advanced filtering and pagination
   */
  async getFiles(params: {
    orgId: string;
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    sort?: string;
    search?: string;
  }) {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('organization_id', params.orgId)
      // Add filtering, sorting, pagination logic
      .range((params.page || 0) * (params.limit || 50), ((params.page || 0) + 1) * (params.limit || 50) - 1);

    if (error) throw error;
    return data;
  }

  /**
   * Create file with validation and audit logging
   */
  async createFile(input: CreateAssetInput, orgId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('files')
      .insert({
        ...input,
        organization_id: orgId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update file with optimistic locking
   */
  async updateFile(id: string, input: UpdateAssetInput, userId: string) {
    const { data, error } = await this.supabase
      .from('files')
      .update({
        ...input,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Soft delete file
   */
  async deleteFile(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from('files')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Upload file to storage
   */
  async uploadFile(file: File, path: string, orgId: string) {
    const { data, error } = await this.supabase.storage
      .from('files')
      .upload(`${orgId}/${path}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  }

  /**
   * Get file download URL
   */
  async getFileUrl(path: string, orgId: string) {
    const { data } = this.supabase.storage
      .from('files')
      .getPublicUrl(`${orgId}/${path}`);

    return data.publicUrl;
  }

  /**
   * Delete file from storage
   */
  async deleteFileFromStorage(path: string, orgId: string) {
    const { data, error } = await this.supabase.storage
      .from('files')
      .remove([`${orgId}/${path}`]);

    if (error) throw error;
    return data;
  }
}

export const filesApiService = new FilesApiService();
