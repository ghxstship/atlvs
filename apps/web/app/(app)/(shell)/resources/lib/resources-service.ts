/**
 * Resources Service Layer
 * Centralized business logic for Resources module operations
 */

import { createBrowserClient } from '@ghxstship/auth';

export interface Resource {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  type: 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
  category: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  tags: string[];
  download_count: number;
  view_count: number;
  is_featured: boolean;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  thumbnail_url?: string;
  version?: string;
  language?: string;
  visibility?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export class ResourcesService {
  private supabase = createBrowserClient();

  /**
   * Get all resources for organization
   */
  async getResources(organizationId: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<{ items: Resource[]; total: number }> {
    try {
      let query = this.supabase
        .from('resources')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        items: (data as Resource[]) || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching resources:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * Create new resource
   */
  async createResource(organizationId: string, userId: string, resource: Partial<Resource>): Promise<Resource | null> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .insert({
          ...resource,
          organization_id: organizationId,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          download_count: 0,
          view_count: 0,
          is_featured: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      return null;
    }
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string): Promise<{
    totalResources: number;
    publishedResources: number;
    featuredResources: number;
    totalViews: number;
    totalDownloads: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('resources')
        .select('id, status, is_featured, view_count, download_count')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const stats = {
        totalResources: data?.length || 0,
        publishedResources: data?.filter(r => r.status === 'published').length || 0,
        featuredResources: data?.filter(r => r.is_featured).length || 0,
        totalViews: data?.reduce((sum, r) => sum + (r.view_count || 0), 0) || 0,
        totalDownloads: data?.reduce((sum, r) => sum + (r.download_count || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalResources: 0,
        publishedResources: 0,
        featuredResources: 0,
        totalViews: 0,
        totalDownloads: 0
      };
    }
  }
}

export const resourcesService = new ResourcesService();
