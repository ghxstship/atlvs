import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export interface ServiceConfig<T> {
  table: string;
  schema: z.ZodSchema<T>;
  includes?: string[];
  orderBy?: string;
  searchFields?: string[];
  filters?: Record<string, any>;
  transforms?: {
    beforeCreate?: (data: Partial<T>) => Partial<T>;
    afterFetch?: (data: T) => T;
    beforeUpdate?: (data: Partial<T>) => Partial<T>;
  };
  cache?: {
    enabled?: boolean;
    ttl?: number; // Time to live in milliseconds
    key?: (params: any) => string;
  };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  select?: string[];
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{ data: any; error: Error }>;
  total: number;
}

// Cache implementation
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  
  set(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now() + ttl });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}

export class UnifiedService<T extends { id: string }> {
  private supabase: any;
  private cache: SimpleCache<any>;
  
  constructor(
    private config: ServiceConfig<T>,
    supabaseUrl?: string,
    supabaseKey?: string
  ) {
    // Allow injection of Supabase client for testing
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else if (typeof window !== 'undefined') {
      // Client-side: use environment variables
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    
    this.cache = new SimpleCache();
  }

  /**
   * List records with pagination, search, and filtering
   */
  async list(params: ListParams = {}): Promise<ListResult<T>> {
    // Check cache if enabled
    if (this.config.cache?.enabled) {
      const cacheKey = this.config.cache.key?.(params) || JSON.stringify(params);
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    const {
      page = 1,
      limit = 20,
      search,
      filters = {},
      orderBy,
      select = []
    } = params;
    
    // Build select statement
    const selectFields = select.length > 0 
      ? select.join(',')
      : this.config.includes?.length 
        ? `*, ${this.config.includes.join(', ')}`
        : '*';
    
    let query = this.supabase
      .from(this.config.table)
      .select(selectFields, { count: 'exact' });

    // Apply search
    if (search && this.config.searchFields?.length) {
      const searchConditions = this.config.searchFields
        .map(field => `${field}.ilike.%${search}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    // Apply filters
    const allFilters = { ...this.config.filters, ...filters };
    Object.entries(allFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      // Handle different filter operators
      if (typeof value === 'object' && value.operator) {
        switch (value.operator) {
          case 'gt':
            query = query.gt(key, value.value);
            break;
          case 'gte':
            query = query.gte(key, value.value);
            break;
          case 'lt':
            query = query.lt(key, value.value);
            break;
          case 'lte':
            query = query.lte(key, value.value);
            break;
          case 'like':
            query = query.like(key, value.value);
            break;
          case 'ilike':
            query = query.ilike(key, value.value);
            break;
          case 'in':
            query = query.in(key, value.value);
            break;
          case 'contains':
            query = query.contains(key, value.value);
            break;
          case 'containedBy':
            query = query.containedBy(key, value.value);
            break;
          case 'is':
            query = query.is(key, value.value);
            break;
          default:
            query = query.eq(key, value.value);
        }
      } else {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    const orderByField = orderBy || this.config.orderBy || 'created_at.desc';
    const [field, direction = 'asc'] = orderByField.split('.');
    query = query.order(field, { ascending: direction === 'asc' });

    // Apply pagination
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;
    
    if (error) throw new Error(`Failed to list ${this.config.table}: ${error.message}`);
    
    // Apply after fetch transform
    let transformedData = data as T[];
    if (this.config.transforms?.afterFetch) {
      transformedData = transformedData.map(this.config.transforms.afterFetch);
    }
    
    const result: ListResult<T> = {
      data: transformedData,
      total: count || 0,
      page,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
    
    // Cache result if enabled
    if (this.config.cache?.enabled) {
      const cacheKey = this.config.cache.key?.(params) || JSON.stringify(params);
      this.cache.set(cacheKey, result, this.config.cache.ttl || 60000);
    }
    
    return result;
  }

  /**
   * Get a single record by ID
   */
  async get(id: string, options?: { select?: string[] }): Promise<T> {
    const selectFields = options?.select?.join(',') ||
      (this.config.includes?.length ? `*, ${this.config.includes.join(', ')}` : '*');
    
    const { data, error } = await this.supabase
      .from(this.config.table)
      .select(selectFields)
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to get ${this.config.table} ${id}: ${error.message}`);
    
    // Apply after fetch transform
    let result = data as T;
    if (this.config.transforms?.afterFetch) {
      result = this.config.transforms.afterFetch(result);
    }
    
    return this.config.schema.parse(result);
  }

  /**
   * Create a new record
   */
  async create(input: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    // Validate input
    const validated = this.config.schema
      .omit({ id: true, created_at: true, updated_at: true } as any)
      .parse(input);
    
    // Apply before create transform
    let data = validated;
    if (this.config.transforms?.beforeCreate) {
      data = this.config.transforms.beforeCreate(data as any) as any;
    }
    
    const { data: created, error } = await this.supabase
      .from(this.config.table)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Failed to create ${this.config.table}: ${error.message}`);
    
    // Clear cache
    if (this.config.cache?.enabled) {
      this.cache.clear();
    }
    
    return this.config.schema.parse(created);
  }

  /**
   * Update an existing record
   */
  async update(id: string, input: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    // Validate input
    const validated = this.config.schema
      .partial()
      .omit({ id: true, created_at: true, updated_at: true } as any)
      .parse(input);
    
    // Apply before update transform
    let data = validated;
    if (this.config.transforms?.beforeUpdate) {
      data = this.config.transforms.beforeUpdate(data as any) as any;
    }
    
    const { data: updated, error } = await this.supabase
      .from(this.config.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update ${this.config.table} ${id}: ${error.message}`);
    
    // Clear cache
    if (this.config.cache?.enabled) {
      this.cache.clear();
    }
    
    return this.config.schema.parse(updated);
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.config.table)
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete ${this.config.table} ${id}: ${error.message}`);
    
    // Clear cache
    if (this.config.cache?.enabled) {
      this.cache.clear();
    }
  }

  /**
   * Bulk create records
   */
  async bulkCreate(items: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<BulkOperationResult<T>> {
    const result: BulkOperationResult<T> = {
      successful: [],
      failed: [],
      total: items.length,
    };
    
    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      try {
        // Validate and transform batch
        const validated = batch.map(item => {
          const valid = this.config.schema
            .omit({ id: true, created_at: true, updated_at: true } as any)
            .parse(item);
          
          if (this.config.transforms?.beforeCreate) {
            return this.config.transforms.beforeCreate(valid as any);
          }
          return valid;
        });
        
        const { data, error } = await this.supabase
          .from(this.config.table)
          .insert(validated)
          .select();
        
        if (error) throw error;
        
        result.successful.push(...(data as T[]));
      } catch (error: any) {
        batch.forEach(item => {
          result.failed.push({ data: item, error });
        });
      }
    }
    
    // Clear cache
    if (this.config.cache?.enabled) {
      this.cache.clear();
    }
    
    return result;
  }

  /**
   * Bulk update records
   */
  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<BulkOperationResult<T>> {
    const result: BulkOperationResult<T> = {
      successful: [],
      failed: [],
      total: updates.length,
    };
    
    // Process updates individually (Supabase doesn't support bulk updates with different values)
    for (const update of updates) {
      try {
        const updated = await this.update(update.id, update.data);
        result.successful.push(updated);
      } catch (error: any) {
        result.failed.push({ data: update, error });
      }
    }
    
    return result;
  }

  /**
   * Bulk delete records
   */
  async bulkDelete(ids: string[]): Promise<BulkOperationResult<{ id: string }>> {
    const result: BulkOperationResult<{ id: string }> = {
      successful: [],
      failed: [],
      total: ids.length,
    };
    
    try {
      const { error } = await this.supabase
        .from(this.config.table)
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      
      result.successful = ids.map(id => ({ id }));
    } catch (error: any) {
      ids.forEach(id => {
        result.failed.push({ data: { id }, error });
      });
    }
    
    // Clear cache
    if (this.config.cache?.enabled) {
      this.cache.clear();
    }
    
    return result;
  }

  /**
   * Count records matching filters
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    let query = this.supabase
      .from(this.config.table)
      .select('*', { count: 'exact', head: true });
    
    // Apply filters
    const allFilters = { ...this.config.filters, ...filters };
    Object.entries(allFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { count, error } = await query;
    
    if (error) throw new Error(`Failed to count ${this.config.table}: ${error.message}`);
    
    return count || 0;
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.config.table)
      .select('id')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check existence: ${error.message}`);
    }
    
    return !!data;
  }

  /**
   * Subscribe to real-time changes
   */
  subscribe(
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      old: T | null;
      new: T | null;
    }) => void,
    filters?: Record<string, any>
  ) {
    const channel = this.supabase
      .channel(`${this.config.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.config.table,
          filter: filters ? this.buildFilterString(filters) : undefined,
        },
        (payload: any) => {
          callback({
            eventType: payload.eventType,
            old: payload.old,
            new: payload.new,
          });
          
          // Clear cache on changes
          if (this.config.cache?.enabled) {
            this.cache.clear();
          }
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
      },
    };
  }

  /**
   * Build filter string for real-time subscriptions
   */
  private buildFilterString(filters: Record<string, any>): string {
    return Object.entries(filters)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&');
  }

  /**
   * Execute raw SQL query (use with caution)
   */
  async raw<R = any>(query: string, params?: any[]): Promise<R[]> {
    const { data, error } = await this.supabase.rpc('exec_sql', {
      query,
      params: params || [],
    });
    
    if (error) throw new Error(`Failed to execute raw query: ${error.message}`);
    
    return data as R[];
  }

  /**
   * Clear service cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
