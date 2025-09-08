/**
 * Supabase Storage Service with Enterprise Features
 * Handles file uploads, downloads, and management with RLS enforcement
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export interface FileUploadOptions {
  bucket: string;
  path: string;
  file: File;
  organizationId: string;
  userId: string;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

export interface FileRecord {
  id: string;
  name: string;
  path: string;
  bucket: string;
  size: number;
  mime_type: string;
  organization_id: string;
  table_name?: string;
  record_id?: string;
  created_by: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export class SupabaseStorageService {
  private supabase;

  constructor() {
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async uploadFile(options: FileUploadOptions): Promise<FileRecord> {
    const { bucket, path, file, organizationId, userId, metadata, onProgress } = options;

    // Generate unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniquePath = `${path}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          organizationId,
          userId,
          originalName: file.name,
          ...metadata
        }
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Create file record in database
    const fileRecord = {
      name: file.name,
      path: uniquePath,
      bucket,
      size: file.size,
      mime_type: file.type,
      organization_id: organizationId,
      created_by: userId,
      metadata: {
        originalName: file.name,
        ...metadata
      }
    };

    const { data: dbData, error: dbError } = await this.supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await this.supabase.storage.from(bucket).remove([uniquePath]);
      throw new Error(`Failed to create file record: ${dbError.message}`);
    }

    return dbData;
  }

  async uploadMultipleFiles(files: File[], options: Omit<FileUploadOptions, 'file'>): Promise<FileRecord[]> {
    const results: FileRecord[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile({ ...options, file });
        results.push(result);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some files failed to upload:', errors);
    }

    return results;
  }

  async getFileUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to get file URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
  }

  async deleteFile(fileId: string, organizationId: string): Promise<void> {
    // Get file record
    const { data: fileRecord, error: fetchError } = await this.supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch file record: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await this.supabase.storage
      .from(fileRecord.bucket)
      .remove([fileRecord.path]);

    if (storageError) {
      throw new Error(`Failed to delete file from storage: ${storageError.message}`);
    }

    // Delete from database
    const { error: dbError } = await this.supabase
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('organization_id', organizationId);

    if (dbError) {
      throw new Error(`Failed to delete file record: ${dbError.message}`);
    }
  }

  async getFilesByRecord(tableName: string, recordId: string, organizationId: string): Promise<FileRecord[]> {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
  }

  async attachFileToRecord(fileId: string, tableName: string, recordId: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('files')
      .update({
        table_name: tableName,
        record_id: recordId
      })
      .eq('id', fileId)
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Failed to attach file to record: ${error.message}`);
    }
  }

  async getFilePreview(bucket: string, path: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600, {
        transform: {
          width: options?.width,
          height: options?.height,
          quality: options?.quality
        }
      });

    if (error) {
      throw new Error(`Failed to get file preview: ${error.message}`);
    }

    return data.signedUrl;
  }

  async searchFiles(organizationId: string, query: string, filters?: {
    bucket?: string;
    mimeType?: string;
    tableName?: string;
    createdBy?: string;
    dateRange?: { start: string; end: string };
  }): Promise<FileRecord[]> {
    let queryBuilder = this.supabase
      .from('files')
      .select('*')
      .eq('organization_id', organizationId);

    // Apply search
    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    // Apply filters
    if (filters?.bucket) {
      queryBuilder = queryBuilder.eq('bucket', filters.bucket);
    }

    if (filters?.mimeType) {
      queryBuilder = queryBuilder.ilike('mime_type', `${filters.mimeType}%`);
    }

    if (filters?.tableName) {
      queryBuilder = queryBuilder.eq('table_name', filters.tableName);
    }

    if (filters?.createdBy) {
      queryBuilder = queryBuilder.eq('created_by', filters.createdBy);
    }

    if (filters?.dateRange) {
      queryBuilder = queryBuilder
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to search files: ${error.message}`);
    }

    return data || [];
  }

  async getStorageUsage(organizationId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byMimeType: Record<string, { count: number; size: number }>;
    byBucket: Record<string, { count: number; size: number }>;
  }> {
    const { data, error } = await this.supabase
      .from('files')
      .select('bucket, mime_type, size')
      .eq('organization_id', organizationId);

    if (error) {
      throw new Error(`Failed to get storage usage: ${error.message}`);
    }

    const stats = {
      totalFiles: data.length,
      totalSize: data.reduce((sum, file) => sum + (file.size || 0), 0),
      byMimeType: {} as Record<string, { count: number; size: number }>,
      byBucket: {} as Record<string, { count: number; size: number }>
    };

    data.forEach(file => {
      // By MIME type
      if (!stats.byMimeType[file.mime_type]) {
        stats.byMimeType[file.mime_type] = { count: 0, size: 0 };
      }
      stats.byMimeType[file.mime_type].count++;
      stats.byMimeType[file.mime_type].size += file.size || 0;

      // By bucket
      if (!stats.byBucket[file.bucket]) {
        stats.byBucket[file.bucket] = { count: 0, size: 0 };
      }
      stats.byBucket[file.bucket].count++;
      stats.byBucket[file.bucket].size += file.size || 0;
    });

    return stats;
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  isVideoFile(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
  }

  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  isDocumentFile(mimeType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    
    return documentTypes.includes(mimeType);
  }
}

export const storageService = new SupabaseStorageService();
