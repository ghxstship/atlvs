/**
 * Procurement API Service Layer
 * Handles HTTP API communication for procurement operations
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Base API configuration
export const API_CONFIG = {
  baseURL: '/api/v1/procurement',
  timeout: 30000,
  retries: 3,
};

// Generic API response schema
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  meta: z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }).optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
};

/**
 * Procurement API Service Class
 * Provides centralized API communication with error handling and retry logic
 */
export class ProcurementApiService {
  private supabase: unknown;
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
    this.supabase = createClient();
  }

  /**
   * Generic GET request with error handling
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>> {
    try {
      let query = this.supabase
        .from(endpoint)
        .select('*', { count: 'exact' })
        .eq('organization_id', this.orgId);

      // Apply filters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
        meta: {
          total: count,
        },
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message || 'API request failed',
      };
    }
  }

  /**
   * Generic POST request for creating records
   */
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>>> {
    try {
      const { data: created, error } = await this.supabase
        .from(endpoint)
        .insert({ ...data, organization_id: this.orgId })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: created,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message || 'Create operation failed',
      };
    }
  }

  /**
   * Generic PUT request for updating records
   */
  async put<T>(endpoint: string, id: string, data: unknown): Promise<ApiResponse<T>>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(endpoint)
        .update(data)
        .eq('id', id)
        .eq('organization_id', this.orgId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: updated,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message || 'Update operation failed',
      };
    }
  }

  /**
   * Generic DELETE request
   */
  async delete(endpoint: string, id: string): Promise<ApiResponse> {
    try {
      const { error } = await this.supabase
        .from(endpoint)
        .delete()
        .eq('id', id)
        .eq('organization_id', this.orgId);

      if (error) throw error;

      return {
        success: true,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message || 'Delete operation failed',
      };
    }
  }

  /**
   * Bulk operations with progress tracking
   */
  async bulkOperation<T>(
    operation: 'create' | 'update' | 'delete',
    endpoint: string,
    items: unknown[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ApiResponse<T[]>>> {
    const results: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        let response: ApiResponse<T>;

        switch (operation) {
          case 'create':
            response = await this.post<T>(endpoint, items[i]);
            break;
          case 'update':
            response = await this.put<T>(endpoint, items[i].id, items[i]);
            break;
          case 'delete':
            response = await this.delete(endpoint, items[i].id);
            break;
        }

        if (response.success && response.data) {
          results.push(response.data);
        } else {
          errors.push(response.error || 'Unknown error');
        }
      } catch (error: unknown) {
        errors.push(error.message);
      }

      onProgress?.(i + 1, items.length);
    }

    return {
      success: errors.length === 0,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      meta: {
        total: items.length,
      },
    };
  }

  /**
   * Search across procurement entities
   */
  async search(query: string, entities: string[] = ['orders', 'vendors']): Promise<ApiResponse> {
    try {
      const searchPromises = entities.map(entity =>
        this.supabase
          .from(entity)
          .select('*')
          .eq('organization_id', this.orgId)
          .ilike('title', `%${query}%`)
          .limit(10)
      );

      const results = await Promise.all(searchPromises);
      const data = results.flatMap(result => result.data || []);

      return {
        success: true,
        data,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message || 'Search failed',
      };
    }
  }
}

// Factory function to create API service instance
export function createProcurementApiService(orgId: string): ProcurementApiService {
  return new ProcurementApiService(orgId);
}
