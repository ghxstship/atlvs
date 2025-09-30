/**
 * Assets API Service
 *
 * Enterprise-grade API service handlers for asset management operations.
 * Provides centralized HTTP client with automatic authentication, error handling,
 * retry logic, and request/response interceptors.
 *
 * @module assets/lib/api
 */

import { createClient } from '@supabase/supabase-js';
import {
  Asset, EnrichedAsset,
  Location,
  Maintenance,
  Assignment,
  Audit,
  AssetFilters,
  AssetSort,
  AssetPagination,
  AssetQueryResponse,
  AssetMutationResponse,
  AssetPermissions,
  AssetError
} from '../types';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with enhanced configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'assets-module@v1.0.0'
    }
  }
});

// Request/Response interceptors
class ApiClient {
  private static instance: ApiClient;
  private retryAttempts = 3;
  private retryDelay = 1000;

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempts = this.retryAttempts
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempts > 1 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.executeWithRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    // Retry on network errors, 5xx status codes, and rate limits
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      (error.status >= 500 && error.status < 600) ||
      error.status === 429
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new AssetError(`Authentication error: ${error.message}`, 'AUTH_ERROR', 401);
    if (!session) throw new AssetError('No active session', 'NO_SESSION', 401);
    return session;
  }

  async getOrganizationId(): Promise<string> {
    const session = await this.getSession();
    const { data: membership, error } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (error || !membership?.organization_id) {
      throw new AssetError('Organization access denied', 'ORG_ACCESS_DENIED', 403);
    }

    return membership.organization_id;
  }

  // Asset CRUD Operations
  async getAssets(
    filters: AssetFilters = {},
    sort: AssetSort = { field: 'name', direction: 'asc' },
    pagination: AssetPagination = { page: 1, pageSize: 50 }
  ): Promise<AssetQueryResponse> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      let query = supabase
        .from('assets')
        .select(`
          *,
          location:asset_locations(name),
          assigned_to:users(name,avatar),
          supplier:companies(name)
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      // Apply filters
      if (filters.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.condition?.length) {
        query = query.in('condition', filters.condition);
      }
      if (filters.location_id?.length) {
        query = query.in('location_id', filters.location_id);
      }
      if (filters.assigned_to?.length) {
        query = query.in('assigned_to', filters.assigned_to);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,asset_tag.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new AssetError(`Failed to fetch assets: ${error.message}`, 'FETCH_ERROR', 500);
      }

      return {
        data: data || [],
        pagination: {
          ...pagination,
          total: count || 0
        },
        filters,
        sort
      };
    });
  }

  async getAsset(id: string): Promise<EnrichedAsset> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          location:asset_locations(name),
          assigned_to:users(name,avatar),
          supplier:companies(name)
        `)
        .eq('organization_id', orgId)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new AssetError('Asset not found', 'NOT_FOUND', 404);
        }
        throw new AssetError(`Failed to fetch asset: ${error.message}`, 'FETCH_ERROR', 500);
      }

      return data;
    });
  }

  async createAsset(assetData: Omit<Asset, EnrichedAsset, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<AssetMutationResponse> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('assets')
        .insert({ ...assetData, organization_id: orgId })
        .select()
        .single();

      if (error) {
        throw new AssetError(`Failed to create asset: ${error.message}`, 'CREATE_ERROR', 500);
      }

      // Log audit trail
      await this.logAudit('CREATE', 'assets', data.id, { action: 'asset_created' });

      return {
        data,
        success: true
      };
    });
  }

  async updateAsset(id: string, updates: Partial<Asset>): Promise<AssetMutationResponse> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      // Get current asset for audit trail
      const currentAsset = await this.getAsset(id);

      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('organization_id', orgId)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new AssetError(`Failed to update asset: ${error.message}`, 'UPDATE_ERROR', 500);
      }

      // Log audit trail
      await this.logAudit('UPDATE', 'assets', id, {
        action: 'asset_updated',
        changes: updates,
        previous: currentAsset
      });

      return {
        data,
        success: true
      };
    });
  }

  async deleteAsset(id: string): Promise<{ success: boolean }> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      // Soft delete - update status to retired
      const { error } = await supabase
        .from('assets')
        .update({ status: 'retired', updated_at: new Date().toISOString() })
        .eq('organization_id', orgId)
        .eq('id', id);

      if (error) {
        throw new AssetError(`Failed to delete asset: ${error.message}`, 'DELETE_ERROR', 500);
      }

      // Log audit trail
      await this.logAudit('DELETE', 'assets', id, { action: 'asset_retired' });

      return { success: true };
    });
  }

  // Bulk Operations
  async bulkUpdateAssets(ids: string[], updates: Partial<Asset>): Promise<{ success: boolean; updated: number }> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('assets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('organization_id', orgId)
        .in('id', ids)
        .select('id');

      if (error) {
        throw new AssetError(`Bulk update failed: ${error.message}`, 'BULK_UPDATE_ERROR', 500);
      }

      // Log audit trail for each asset
      for (const asset of data || []) {
        await this.logAudit('UPDATE', 'assets', asset.id, {
          action: 'bulk_asset_updated',
          changes: updates
        });
      }

      return {
        success: true,
        updated: data?.length || 0
      };
    });
  }

  async bulkDeleteAssets(ids: string[]): Promise<{ success: boolean; deleted: number }> {
    const orgId = await this.getOrganizationId();

    return this.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('assets')
        .update({ status: 'retired', updated_at: new Date().toISOString() })
        .eq('organization_id', orgId)
        .in('id', ids)
        .select('id');

      if (error) {
        throw new AssetError(`Bulk delete failed: ${error.message}`, 'BULK_DELETE_ERROR', 500);
      }

      // Log audit trail for each asset
      for (const asset of data || []) {
        await this.logAudit('DELETE', 'assets', asset.id, { action: 'bulk_asset_retired' });
      }

      return {
        success: true,
        deleted: data?.length || 0
      };
    });
  }

  // Permission checking
  async getPermissions(): Promise<AssetPermissions> {
    const session = await this.getSession();
    const orgId = await this.getOrganizationId();

    // Get user role from membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('organization_id', orgId)
      .single();

    const role = membership?.role || 'viewer';

    // Define permissions based on role
    const permissions: Record<string, AssetPermissions> = {
      owner: {
        view: true,
        create: true,
        update: true,
        delete: true,
        assign: true,
        maintain: true,
        audit: true
      },
      admin: {
        view: true,
        create: true,
        update: true,
        delete: true,
        assign: true,
        maintain: true,
        audit: true
      },
      manager: {
        view: true,
        create: true,
        update: true,
        delete: false,
        assign: true,
        maintain: true,
        audit: false
      },
      member: {
        view: true,
        create: false,
        update: false,
        delete: false,
        assign: false,
        maintain: false,
        audit: false
      },
      viewer: {
        view: true,
        create: false,
        update: false,
        delete: false,
        assign: false,
        maintain: false,
        audit: false
      }
    };

    return permissions[role] || permissions.viewer;
  }

  // Audit logging
  private async logAudit(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    table: string,
    recordId: string,
    details: Record<string, any>
  ): Promise<void> {
    const session = await this.getSession();
    const orgId = await this.getOrganizationId();

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: session.user.id,
      action,
      table_name: table,
      record_id: recordId,
      details,
      ip_address: '', // Would be populated by middleware
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Convenience exports
export { supabase };
