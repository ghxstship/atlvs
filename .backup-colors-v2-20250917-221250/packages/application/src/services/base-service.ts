import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

export interface ServiceContext {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  userId: string;
}

export interface ServiceResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export abstract class BaseService {
  protected supabase: SupabaseClient<Database>;
  protected organizationId: string;
  protected userId: string;

  constructor(context: ServiceContext) {
    this.supabase = context.supabase;
    this.organizationId = context.organizationId;
    this.userId = context.userId;
  }

  protected async handleDatabaseError<T>(error: any): Promise<ServiceResult<T>> {
    console.error('Database error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    } as ServiceResult<T>;
  }

  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return {
      success: true,
      data
    };
  }

  protected createErrorResult<T>(error: string): ServiceResult<T> {
    return {
      success: false,
      error
    } as ServiceResult<T>;
  }

  protected buildPaginationQuery(query: any, params: PaginationParams) {
    if (params.limit) {
      query = query.limit(params.limit);
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    return query;
  }

  protected buildSortQuery(query: any, params: SortParams) {
    if (params.sortBy) {
      query = query.order(params.sortBy, { ascending: params.sortOrder !== 'desc' });
    }
    return query;
  }
}
