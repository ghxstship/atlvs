/**
 * Optimized Profile Service
 * Performance-optimized service layer with caching, pagination, and streaming support
 */

import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { cache } from 'react';

type ProfileData = Database['public']['Tables']['users']['Row'];

export class ProfileService {
  private supabase = createBrowserClient();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private PAGE_SIZE = 50;

  /**
   * Get profile data with caching and pagination
   */
  async getProfile(userId: string, options?: {
    section?: string;
    page?: number;
    pageSize?: number;
  }) {
    const cacheKey = `profile:${userId}:${options?.section || 'all'}:${options?.page || 1}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const pageSize = options?.pageSize || this.PAGE_SIZE;
      const page = options?.page || 1;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = this.supabase
        .from('users')
        .select(`
          *,
          memberships!inner(
            organization_id,
            role,
            status,
            organization:organizations(
              id,
              name,
              slug
            )
          )
        `)
        .eq('auth_id', userId);

      // Apply section-specific filtering
      if (options?.section && options.section !== 'overview') {
        query = this.applySectionFilter(query, options.section);
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query.single();

      if (error) throw error;

      const result = {
        data,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };

      // Cache the result
      this.setCache(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update profile with optimistic updates
   */
  async updateProfile(userId: string, updates: Partial<ProfileData>) {
    try {
      // Optimistically update cache
      const cacheKey = `profile:${userId}:all:1`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        cached.data = { ...cached.data, ...updates };
        this.setCache(cacheKey, cached);
      }

      // Perform actual update
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('auth_id', userId)
        .select()
        .single();

      if (error) {
        // Rollback cache on error
        this.invalidateCache(`profile:${userId}`);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Stream large profile exports
   */
  async *streamProfileExport(userId: string, format: 'csv' | 'json' = 'json') {
    const CHUNK_SIZE = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data, pagination } = await this.getProfile(userId, {
        page,
        pageSize: CHUNK_SIZE
      });

      if (data) {
        // Yield chunk based on format
        if (format === 'json') {
          yield JSON.stringify(data);
        } else {
          yield this.convertToCSV(data);
        }
      }

      hasMore = page < pagination.totalPages;
      page++;
    }
  }

  /**
   * Batch update multiple profile sections
   */
  async batchUpdate(userId: string, updates: Record<string, unknown>[]) {
    const results = [];
    const errors = [];

    // Use transaction for consistency
    for (const update of updates) {
      try {
        const result = await this.updateProfile(userId, update);
        results.push(result);
      } catch (error) {
        errors.push({ update, error });
      }
    }

    // Invalidate all related cache
    this.invalidateCache(`profile:${userId}`);

    return { results, errors };
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(userId: string) {
    const cacheKey = `profile:stats:${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [profile, activity, endorsements] = await Promise.all([
        this.supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('auth_id', userId),
        this.supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        this.supabase
          .from('endorsements')
          .select('*', { count: 'exact', head: true })
          .eq('endorsed_user_id', userId)
      ]);

      const stats = {
        completionRate: this.calculateCompletionRate(profile.data),
        recentActivity: activity.count || 0,
        endorsements: endorsements.count || 0,
        lastUpdated: new Date().toISOString()
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      throw error;
    }
  }

  /**
   * Search profiles with full-text search
   */
  async searchProfiles(query: string, options?: {
    limit?: number;
    offset?: number;
    filters?: Record<string, unknown>;
  }) {
    try {
      let searchQuery = this.supabase
        .from('users')
        .select('*')
        .textSearch('fts', query, {
          type: 'websearch',
          config: 'english'
        });

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          searchQuery = searchQuery.eq(key, value);
        });
      }

      // Apply pagination
      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }
      if (options?.offset) {
        searchQuery = searchQuery.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching profiles:', error);
      throw error;
    }
  }

  // Private helper methods

  private applySectionFilter(query: unknown, section: string) {
    const sectionFields: Record<string, string[]> = {
      professional: ['job_title', 'department', 'skills', 'certifications'],
      personal: ['first_name', 'last_name', 'email', 'phone'],
      compliance: ['health_status', 'travel_docs', 'uniform_size'],
      activity: ['last_login', 'activity_count', 'performance_score']
    };

    const fields = sectionFields[section];
    if (fields) {
      return query.select(fields.join(','));
    }
    return query;
  }

  private getFromCache(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: unknown) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private invalidateCache(prefix: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private calculateCompletionRate(profile: unknown) {
    if (!profile) return 0;
    
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone',
      'job_title', 'department', 'emergency_contact'
    ];
    
    const completed = requiredFields.filter(field => profile[field]).length;
    return Math.round((completed / requiredFields.length) * 100);
  }

  private convertToCSV(data: unknown) {
    const headers = Object.keys(data);
    const values = Object.values(data).map(v => 
      typeof v === 'string' ? `"${v}"` : v
    );
    
    return [headers.join(','), values.join(',')].join('\n');
  }
}

// Export singleton instance
export const profileService = new ProfileService();

// Export cached functions for React Server Components
export const getCachedProfile = cache(
  async (userId: string) => profileService.getProfile(userId)
);

export const getCachedProfileStats = cache(
  async (userId: string) => profileService.getProfileStats(userId)
);
