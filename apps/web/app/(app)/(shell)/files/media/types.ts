// Media Assets - Type Definitions
// Specialized type definitions for media asset management

export interface MediaAsset {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  category: 'image' | 'video' | 'audio' | 'other';
  file_url: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string | null;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For video/audio in seconds
  metadata: {
    format?: string;
    codec?: string;
    bitrate?: number;
    resolution?: string;
    fps?: number;
    color_profile?: string;
    [key: string]: unknown;
  };
  tags: string[];
  access_level: 'public' | 'team' | 'restricted' | 'private';
  project_id?: string | null;
  folder_id?: string | null;
  status: 'active' | 'processing' | 'archived' | 'error';
  view_count: number;
  download_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CreateMediaAssetData {
  title: string;
  description?: string;
  category: MediaAsset['category'];
  file_url: string;
  file_size: number;
  file_type: string;
  thumbnail_url?: string;
  dimensions?: MediaAsset['dimensions'];
  duration?: number;
  metadata?: MediaAsset['metadata'];
  tags?: string[];
  access_level?: MediaAsset['access_level'];
  project_id?: string;
  folder_id?: string;
  is_featured?: boolean;
}

export interface UpdateMediaAssetData extends Partial<CreateMediaAssetData> {
  id: string;
}

export interface MediaFilters {
  category?: MediaAsset['category'];
  access_level?: MediaAsset['access_level'];
  project_id?: string;
  folder_id?: string;
  status?: MediaAsset['status'];
  tags?: string[];
  is_featured?: boolean;
  file_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
  size_range?: {
    min: number;
    max: number;
  };
}

export interface MediaStats {
  total_assets: number;
  total_size_bytes: number;
  image_count: number;
  video_count: number;
  audio_count: number;
  total_views: number;
  total_downloads: number;
  featured_count: number;
  by_category: Array<{
    category: MediaAsset['category'];
    count: number;
    total_size: number;
  }>;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}
