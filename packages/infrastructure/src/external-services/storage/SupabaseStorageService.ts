/**
 * Supabase Storage Service Implementation
 * Implements IStorageService using Supabase Storage
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  IStorageService,
  StorageUploadOptions,
  StorageDownloadOptions,
  StorageDeleteOptions,
  StorageListOptions,
  StorageFile,
  StorageUploadResult,
} from './IStorageService';

export class SupabaseStorageService implements IStorageService {
  constructor(private readonly client: SupabaseClient) {}

  async upload(options: StorageUploadOptions): Promise<StorageUploadResult> {
    const { bucket, path, file, contentType, metadata, isPublic = false } = options;

    const uploadOptions: Record<string, unknown> = {
      contentType,
      upsert: true,
    };

    if (metadata) {
      uploadOptions.metadata = metadata;
    }

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, uploadOptions);

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const url = isPublic
      ? this.getPublicUrl(bucket, path)
      : await this.getSignedUrl(bucket, path, 3600);

    const size = file instanceof Buffer ? file.length : (file as File).size;
    
    return {
      path: data.path,
      url,
      size,
    };
  }

  async download(options: StorageDownloadOptions): Promise<Buffer> {
    const { bucket, path } = options;

    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Storage download failed: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }

  async delete(options: StorageDeleteOptions): Promise<boolean> {
    const { bucket, path } = options;

    const { error } = await this.client.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }

    return true;
  }

  async list(options: StorageListOptions): Promise<StorageFile[]> {
    const { bucket, prefix = '', limit = 100, offset = 0 } = options;

    const { data, error } = await this.client.storage
      .from(bucket)
      .list(prefix, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`Storage list failed: ${error.message}`);
    }

    return data.map((file) => ({
      name: file.name,
      path: `${prefix}/${file.name}`,
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      createdAt: new Date(file.created_at),
      updatedAt: new Date(file.updated_at),
      metadata: file.metadata as Record<string, string>,
    }));
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }
}
