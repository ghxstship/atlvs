import type {
  DigitalAsset,
  CreateAssetData,
  UpdateAssetData,
  AssetFilters,
  AssetStats,
  AssetAnalytics
} from '../types';

interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

function buildQueryString(params: Record<string, string | number | boolean | undefined | null>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
}

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Files service request failed');
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as Promise<T>;
}

export class FilesService {
  async getAssets(organizationId?: string, options?: {
    page?: number;
    perPage?: number;
    filters?: AssetFilters;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    search?: string;
    format?: 'json' | 'csv';
    folderId?: string;
  }): Promise<{ data?: ListResponse<DigitalAsset>; error?: string }> {
    try {
      const query = buildQueryString({
        page: options?.page,
        limit: options?.perPage,
        category: options?.filters?.category,
        status: options?.filters?.status,
        access_level: options?.filters?.access_level,
        project_id: options?.filters?.project_id,
        folder_id: options?.folderId || options?.filters?.folder_id,
        search: options?.search,
        sort_field: options?.sortField,
        sort_direction: options?.sortDirection,
        format: options?.format ?? 'json'
      });

      const path = query ? `/api/v1/files?${query}` : '/api/v1/files';
      const result = await http<ListResponse<DigitalAsset>>(path);
      return { data: result };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to fetch assets' };
    }
  }

  async exportResources(filters?: AssetFilters, format: 'json' | 'csv' = 'csv'): Promise<Blob> {
    const query = buildQueryString({
      category: filters?.category,
      status: filters?.status,
      access_level: filters?.access_level,
      project_id: filters?.project_id,
      folder_id: filters?.folder_id,
      format
    });

    const response = await fetch(`/api/v1/files?${query}`, {
      headers: {
        Accept: format === 'csv' ? 'text/csv' : 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export resources');
    }

    return response.blob();
  }

  async getAsset(id: string): Promise<DigitalAsset> {
    return http<DigitalAsset>(`/api/v1/files/${id}`);
  }

  async createAsset(payload: CreateAssetData): Promise<DigitalAsset> {
    return http<DigitalAsset>('/api/v1/files', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async updateAsset(id: string, payload: UpdateAssetData): Promise<DigitalAsset> {
    return http<DigitalAsset>(`/api/v1/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  }

  async updateAssetsBulk(ids: string[], payload: UpdateAssetData): Promise<void> {
    await http(`/api/v1/files`, {
      method: 'PATCH',
      body: JSON.stringify({ ids, data: payload })
    });
  }

  async deleteResource(id: string): Promise<void> {
    await http(`/api/v1/files/${id}`, { method: 'DELETE' });
  }

  async deleteResources(ids: string[]): Promise<void> {
    await http('/api/v1/files', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
  }

  async incrementViewCount(id: string): Promise<void> {
    await http(`/api/v1/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ view_count: { increment: 1 } })
    });
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await http(`/api/v1/files/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ download_count: { increment: 1 } })
    });
  }

  // Get resource statistics
  async getResourceStats(): Promise<AssetStats> {
    try {
      return await http<AssetStats>('/api/v1/files/stats');
    } catch (error) {
      // Return default stats if API fails
      return {
        total_assets: 0,
        active_assets: 0,
        archived_assets: 0,
        featured_assets: 0,
        total_views: 0,
        total_downloads: 0,
        total_storage_used: 0,
        categories_count: 0,
        folders_count: 0,
        active_users: 0
      };
    }
  }

  async getResourceAnalytics(): Promise<AssetAnalytics> {
    try {
      return await http<AssetAnalytics>('/api/v1/files/analytics');
    } catch (error) {
      // Return default analytics if API fails
      return {
        views_by_day: [],
        downloads_by_day: [],
        popular_assets: [],
        category_distribution: [],
        storage_by_category: [],
        access_level_distribution: []
      };
    }
  }
}
