import { BaseService, ServiceContext, ServiceResult, PaginationParams, SortParams } from './base-service';

export interface FileRecord {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  url: string | null;
  isPublic: boolean;
  uploadedBy: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileRequest {
  projectId?: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  isPublic?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateFileRequest {
  name?: string;
  isPublic?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FileFilters {
  projectId?: string;
  mimeType?: string;
  isPublic?: boolean;
  uploadedBy?: string;
  tags?: string[];
  search?: string;
  sizeMin?: number;
  sizeMax?: number;
}

export interface FileStats {
  total: number;
  totalSize: number;
  byMimeType: Record<string, number>;
  byProject: Record<string, number>;
  publicFiles: number;
  privateFiles: number;
}

export class FileService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  async getFiles(
    filters: FileFilters = {},
    pagination: PaginationParams = {},
    sorting: SortParams = { sortBy: 'created_at', sortOrder: 'desc' }
  ): Promise<ServiceResult<FileRecord[]>> {
    try {
      let query = this.supabase
        .from('files')
        .select('*')
        .eq('organization_id', this.organizationId);

      // Apply filters
      if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
      }
      if (filters.mimeType) {
        query = query.eq('mime_type', filters.mimeType);
      }
      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }
      if (filters.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,original_name.ilike.%${filters.search}%`);
      }
      if (filters.sizeMin) {
        query = query.gte('size', filters.sizeMin);
      }
      if (filters.sizeMax) {
        query = query.lte('size', filters.sizeMax);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      // Apply sorting and pagination
      query = this.buildSortQuery(query, sorting);
      query = this.buildPaginationQuery(query, pagination);

      const { data, error } = await query;

      if (error) {
        return this.createErrorResult(error.message);
      }

      const files: FileRecord[] = data.map(file => ({
        id: file.id,
        organizationId: file.organization_id,
        projectId: file.project_id,
        name: file.name,
        originalName: file.original_name,
        mimeType: file.mime_type,
        size: file.size,
        storagePath: file.storage_path,
        url: file.url,
        isPublic: file.is_public,
        uploadedBy: file.uploaded_by,
        tags: file.tags || [],
        metadata: file.metadata || {},
        createdAt: file.created_at,
        updatedAt: file.updated_at
      }));

      return this.createSuccessResult(files);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async getFileById(fileId: string): Promise<ServiceResult<FileRecord | null>> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('organization_id', this.organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.createSuccessResult(null);
        }
        return this.createErrorResult(error.message);
      }

      const file: FileRecord = {
        id: data.id,
        organizationId: data.organization_id,
        projectId: data.project_id,
        name: data.name,
        originalName: data.original_name,
        mimeType: data.mime_type,
        size: data.size,
        storagePath: data.storage_path,
        url: data.url,
        isPublic: data.is_public,
        uploadedBy: data.uploaded_by,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(file);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async createFile(request: CreateFileRequest): Promise<ServiceResult<FileRecord>> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .insert({
          organization_id: this.organizationId,
          project_id: request.projectId,
          name: request.name,
          original_name: request.originalName,
          mime_type: request.mimeType,
          size: request.size,
          storage_path: request.storagePath,
          is_public: request.isPublic || false,
          uploaded_by: this.userId,
          tags: request.tags || [],
          metadata: request.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const file: FileRecord = {
        id: data.id,
        organizationId: data.organization_id,
        projectId: data.project_id,
        name: data.name,
        originalName: data.original_name,
        mimeType: data.mime_type,
        size: data.size,
        storagePath: data.storage_path,
        url: data.url,
        isPublic: data.is_public,
        uploadedBy: data.uploaded_by,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(file);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async updateFile(fileId: string, updates: UpdateFileRequest): Promise<ServiceResult<FileRecord>> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .update({
          name: updates.name,
          is_public: updates.isPublic,
          tags: updates.tags,
          metadata: updates.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('organization_id', this.organizationId)
        .select()
        .single();

      if (error) {
        return this.createErrorResult(error.message);
      }

      const file: FileRecord = {
        id: data.id,
        organizationId: data.organization_id,
        projectId: data.project_id,
        name: data.name,
        originalName: data.original_name,
        mimeType: data.mime_type,
        size: data.size,
        storagePath: data.storage_path,
        url: data.url,
        isPublic: data.is_public,
        uploadedBy: data.uploaded_by,
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return this.createSuccessResult(file);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteFile(fileId: string): Promise<ServiceResult<null>> {
    try {
      // First get the file to get storage path for cleanup
      const fileResult = await this.getFileById(fileId);
      if (!fileResult.success || !fileResult.data) {
        return this.createErrorResult('File not found');
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('files')
        .remove([fileResult.data.storagePath]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error } = await this.supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('organization_id', this.organizationId);

      if (error) {
        return this.createErrorResult(error.message);
      }

      return this.createSuccessResult(null);
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }

  async generateSignedUrl(fileId: string, expiresIn: number = 3600): Promise<ServiceResult<{ url: string; expiresAt: string }>> {
    try {
      const fileResult = await this.getFileById(fileId);
      if (!fileResult.success || !fileResult.data) {
        return this.createErrorResult('File not found');
      }

      const { data, error } = await this.supabase.storage
        .from('files')
        .createSignedUrl(fileResult.data.storagePath, expiresIn);

      if (error) {
        return this.createErrorResult(error.message);
      }

      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      return this.createSuccessResult({
        url: data.signedUrl,
        expiresAt
      });
    } catch (error: any) {
      return this.handleDatabaseError(error);
    }
  }
}
