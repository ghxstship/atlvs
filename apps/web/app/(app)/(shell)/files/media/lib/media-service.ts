// Media Service Layer
// Business logic and data access for Media Assets

import { createBrowserClient } from '@ghxstship/auth';
import type { 
  MediaAsset, 
  CreateMediaAssetData, 
  UpdateMediaAssetData,
  MediaFilters,
  MediaStats,
  MediaUploadProgress
} from '../types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export class MediaService {
  private supabase = createBrowserClient();

  // Get all media assets for an organization
  async getMediaAssets(
    orgId: string,
    options?: {
      page?: number;
      perPage?: number;
      filters?: MediaFilters;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      search?: string;
    }
  ): Promise<ApiResponse<PaginatedResponse<MediaAsset>>> {
    try {
      let query = this.supabase
        .from('files')
        .select(`
          *,
          project:projects(id, name),
          folder:asset_folders(id, name, path),
          uploaded_by_user:users!created_by(id, email, full_name)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .in('category', ['image', 'video', 'audio']);

      // Apply search
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      // Apply filters
      if (options?.filters) {
        const { category, access_level, project_id, folder_id, status, tags, is_featured, file_type, date_range, size_range } = options.filters;
        
        if (category) query = query.eq('category', category);
        if (access_level) query = query.eq('access_level', access_level);
        if (project_id) query = query.eq('project_id', project_id);
        if (folder_id) query = query.eq('folder_id', folder_id);
        if (status) query = query.eq('status', status);
        if (file_type) query = query.ilike('file_type', `%${file_type}%`);
        if (is_featured !== undefined) query = query.eq('is_featured', is_featured);
        if (tags && tags.length > 0) {
          query = query.overlaps('tags', tags);
        }
        if (date_range) {
          query = query.gte('created_at', date_range.start);
          query = query.lte('created_at', date_range.end);
        }
        if (size_range) {
          query = query.gte('file_size', size_range.min);
          query = query.lte('file_size', size_range.max);
        }
      }

      // Apply sorting
      const sortField = options?.sortField || 'created_at';
      const sortDirection = options?.sortDirection || 'desc';
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const page = options?.page || 1;
      const perPage = options?.perPage || 50;
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return {
        data: {
          data: data || [],
          total: count || 0,
          page,
          per_page: perPage,
          total_pages: Math.ceil((count || 0) / perPage),
        }
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get a single media asset by ID
  async getMediaAsset(id: string, orgId: string): Promise<ApiResponse<MediaAsset>>> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select(`
          *,
          project:projects(id, name),
          folder:asset_folders(id, name, path),
          uploaded_by_user:users!created_by(id, email, full_name)
        `)
        .eq('id', id)
        .eq('organization_id', orgId)
        .in('category', ['image', 'video', 'audio'])
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: data as MediaAsset };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a new media asset
  async createMediaAsset(orgId: string, data: CreateMediaAssetData): Promise<ApiResponse<MediaAsset>>> {
    try {
      const { data: asset, error } = await this.supabase
        .from('files')
        .insert({
          organization_id: orgId,
          ...data,
          status: 'active',
          view_count: 0,
          download_count: 0,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: asset as MediaAsset };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update a media asset
  async updateMediaAsset(orgId: string, data: UpdateMediaAssetData): Promise<ApiResponse<MediaAsset>>> {
    try {
      const { id, ...updateData } = data;
      
      const { data: asset, error } = await this.supabase
        .from('files')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data: asset as MediaAsset };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete a media asset
  async deleteMediaAsset(id: string, orgId: string): Promise<ApiResponse<void>>> {
    try {
      const { error } = await this.supabase
        .from('files')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get media statistics
  async getMediaStats(orgId: string): Promise<ApiResponse<MediaStats>>> {
    try {
      const { data, error } = await this.supabase
        .from('files')
        .select('category, file_size, view_count, download_count, is_featured')
        .eq('organization_id', orgId)
        .in('category', ['image', 'video', 'audio']);

      if (error) {
        return { error: error.message };
      }

      const assets = data || [];
      const stats: MediaStats = {
        total_assets: assets.length,
        total_size_bytes: assets.reduce((sum, asset) => sum + (asset.file_size || 0), 0),
        image_count: assets.filter(asset => asset.category === 'image').length,
        video_count: assets.filter(asset => asset.category === 'video').length,
        audio_count: assets.filter(asset => asset.category === 'audio').length,
        total_views: assets.reduce((sum, asset) => sum + (asset.view_count || 0), 0),
        total_downloads: assets.reduce((sum, asset) => sum + (asset.download_count || 0), 0),
        featured_count: assets.filter(asset => asset.is_featured).length,
        by_category: [
          {
            category: 'image' as const,
            count: assets.filter(asset => asset.category === 'image').length,
            total_size: assets.filter(asset => asset.category === 'image').reduce((sum, asset) => sum + (asset.file_size || 0), 0),
          },
          {
            category: 'video' as const,
            count: assets.filter(asset => asset.category === 'video').length,
            total_size: assets.filter(asset => asset.category === 'video').reduce((sum, asset) => sum + (asset.file_size || 0), 0),
          },
          {
            category: 'audio' as const,
            count: assets.filter(asset => asset.category === 'audio').length,
            total_size: assets.filter(asset => asset.category === 'audio').reduce((sum, asset) => sum + (asset.file_size || 0), 0),
          },
        ],
      };

      return { data: stats };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Increment view count
  async incrementViewCount(id: string, orgId: string): Promise<ApiResponse<void>>> {
    try {
      const { error } = await this.supabase.rpc('increment_view_count', {
        asset_id: id,
        org_id: orgId
      });

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Increment download count
  async incrementDownloadCount(id: string, orgId: string): Promise<ApiResponse<void>>> {
    try {
      const { error } = await this.supabase.rpc('increment_download_count', {
        asset_id: id,
        org_id: orgId
      });

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Upload media file
  async uploadMediaFile(
    file: File,
    orgId: string,
    onProgress?: (progress: MediaUploadProgress) => void
  ): Promise<ApiResponse<{ url: string; size: number; type: string }>> {
    try {
      const fileName = `${orgId}/${Date.now()}-${file.name}`;
      
      const { data, error } = await this.supabase.storage
        .from('media-assets')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            if (onProgress) {
              onProgress({
                loaded: progress.loaded,
                total: progress.total,
                percentage: Math.round((progress.loaded / progress.total) * 100),
                status: 'uploading'
              });
            }
          }
        });

      if (error) {
        return { error: error.message };
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from('media-assets')
        .getPublicUrl(fileName);

      return {
        data: {
          url: publicUrl,
          size: file.size,
          type: file.type
        }
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
