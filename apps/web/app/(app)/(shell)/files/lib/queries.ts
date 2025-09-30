/**
 * Files Queries Service
 * Database query optimization and management
 * Handles complex queries, caching, and performance optimization
 */

import { createClient } from '@/lib/supabase/client';
import type { DigitalAsset } from '../types';

export class FilesQueriesService {
  private supabase = createClient();

  /**
   * Optimized file list query with joins and aggregations
   */
  async getFilesWithStats(orgId: string, params: {
    search?: string;
    filters?: Record<string, any>;
    sort?: { field: string; direction: 'asc' | 'desc' };
    page?: number;
    limit?: number;
  }) {
    let query = this.supabase
      .from('files')
      .select(`
        *,
        versions:file_versions(count),
        downloads:file_downloads(count),
        access_logs:file_access_logs(count)
      `)
      .eq('organization_id', orgId);

    // Apply search
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,tags.ilike.%${params.search}%`);
    }

    // Apply filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
    }

    // Apply sorting
    if (params.sort) {
      query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
    }

    // Apply pagination
    if (params.page !== undefined && params.limit) {
      const from = params.page * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  /**
   * Get file by ID with all related data
   */
  async getFileById(id: string, orgId: string) {
    const { data, error } = await this.supabase
      .from('files')
      .select(`
        *,
        versions:file_versions(*),
        downloads:file_downloads(*),
        access_logs:file_access_logs(*),
        comments:file_comments(*),
        tags:file_tags(*)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Analytics queries for dashboard
   */
  async getFileAnalytics(orgId: string) {
    const { data, error } = await this.supabase
      .rpc('get_file_analytics', { org_id: orgId });

    if (error) throw error;
    return data;
  }

  /**
   * Get files by folder
   */
  async getFilesByFolder(folderId: string, orgId: string) {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('organization_id', orgId)
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get folder structure
   */
  async getFolderStructure(orgId: string) {
    const { data, error } = await this.supabase
      .from('file_folders')
      .select(`
        *,
        files:files(count)
      `)
      .eq('organization_id', orgId)
      .order('name');

    if (error) throw error;
    return data;
  }

  /**
   * Search files with advanced full-text search
   */
  async searchFiles(orgId: string, query: string, options: {
    category?: string;
    type?: string;
    dateRange?: { start: string; end: string };
    limit?: number;
  } = {}) {
    let searchQuery = this.supabase
      .from('files')
      .select('*')
      .eq('organization_id', orgId)
      .textSearch('search_vector', query);

    if (options.category) {
      searchQuery = searchQuery.eq('category', options.category);
    }

    if (options.type) {
      searchQuery = searchQuery.eq('file_type', options.type);
    }

    if (options.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', options.dateRange.start)
        .lte('created_at', options.dateRange.end);
    }

    const { data, error } = await searchQuery.limit(options.limit || 50);

    if (error) throw error;
    return data;
  }
}

export const filesQueriesService = new FilesQueriesService();
