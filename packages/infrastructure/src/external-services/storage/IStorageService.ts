/**
 * Storage Service Interface - Adapter Pattern
 * Abstracts cloud storage provider implementation (S3, Supabase Storage, etc.)
 */

export interface StorageUploadOptions {
  bucket: string;
  path: string;
  file: File | Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface StorageDownloadOptions {
  bucket: string;
  path: string;
}

export interface StorageDeleteOptions {
  bucket: string;
  path: string;
}

export interface StorageListOptions {
  bucket: string;
  prefix?: string;
  limit?: number;
  offset?: number;
}

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  contentType: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  path: string;
  url: string;
  size: number;
}

export interface IStorageService {
  upload(options: StorageUploadOptions): Promise<StorageUploadResult>;
  download(options: StorageDownloadOptions): Promise<Buffer>;
  delete(options: StorageDeleteOptions): Promise<boolean>;
  list(options: StorageListOptions): Promise<StorageFile[]>;
  getPublicUrl(bucket: string, path: string): string;
  getSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string>;
}
