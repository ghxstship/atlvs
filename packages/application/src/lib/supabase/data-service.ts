/**
 * Enterprise Supabase Data Service Layer
 * Provides real-time CRUD operations for all ATLVS modules with RLS enforcement
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import type { DataRecord, FilterConfig, SortConfig } from '@ghxstship/ui/components/DataViews/types';

export interface DataServiceConfig {
  table: string;
  organizationId: string;
  userId: string;
  realtime?: boolean;
  rls?: boolean;
}

export interface QueryOptions {
  filters?: FilterConfig[];
  sorts?: SortConfig[];
  search?: string;
  page?: number;
  limit?: number;
  select?: string;
}

export interface MutationOptions {
  optimistic?: boolean;
  skipRealtime?: boolean;
}

export class SupabaseDataService {
  private supabase;
  private config: DataServiceConfig;
  private realtimeChannel?: any;
  private subscribers = new Set<(data: DataRecord[]) => void>();

  constructor(config: DataServiceConfig) {
    this.config = config;
    this.supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (config.realtime) {
      this.setupRealtime();
    }
  }

  private setupRealtime() {
    this.realtimeChannel = this.supabase
      .channel(`${this.config.table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.config.table,
          filter: `organization_id=eq.${this.config.organizationId}`
        },
        (payload) => {
          this.handleRealtimeChange(payload);
        }
      )
      .subscribe();
  }

  private handleRealtimeChange(payload: any) {
    // Notify all subscribers of data changes
    this.subscribers.forEach(callback => {
      // Re-fetch data and notify subscribers
      this.fetchData().then(callback);
    });
  }

  subscribe(callback: (data: DataRecord[]) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  async fetchData(options: QueryOptions = {}): Promise<DataRecord[]> {
    let query = this.supabase
      .from(this.config.table)
      .select(options.select || '*');

    // Apply organization filter for RLS
    if (this.config.rls !== false) {
      query = query.eq('organization_id', this.config.organizationId);
    }

    // Apply search
    if (options.search) {
      // Implement full-text search across searchable columns
      query = query.or(`name.ilike.%${options.search}%,title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Apply filters
    if (options.filters) {
      options.filters.forEach(filter => {
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.field, filter.value);
            break;
          case 'contains':
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
          case 'startsWith':
            query = query.ilike(filter.field, `${filter.value}%`);
            break;
          case 'endsWith':
            query = query.ilike(filter.field, `%${filter.value}`);
            break;
          case 'greaterThan':
            query = query.gt(filter.field, filter.value);
            break;
          case 'lessThan':
            query = query.lt(filter.field, filter.value);
            break;
          case 'between':
            if (Array.isArray(filter.value) && filter.value.length === 2) {
              query = query.gte(filter.field, filter.value[0]).lte(filter.field, filter.value[1]);
            }
            break;
          case 'in':
            if (Array.isArray(filter.value)) {
              query = query.in(filter.field, filter.value);
            }
            break;
        }
      });
    }

    // Apply sorting
    if (options.sorts) {
      options.sorts.forEach(sort => {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      });
    }

    // Apply pagination
    if (options.page && options.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch ${this.config.table}: ${error.message}`);
    }

    return data || [];
  }

  async createRecord(record: Partial<DataRecord>, options: MutationOptions = {}): Promise<DataRecord> {
    const recordWithMeta = {
      ...record,
      organization_id: this.config.organizationId,
      created_by: this.config.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from(this.config.table)
      .insert(recordWithMeta)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.config.table}: ${error.message}`);
    }

    return data;
  }

  async updateRecord(id: string, updates: Partial<DataRecord>, options: MutationOptions = {}): Promise<DataRecord> {
    const updatesWithMeta = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from(this.config.table)
      .update(updatesWithMeta)
      .eq('id', id)
      .eq('organization_id', this.config.organizationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.config.table}: ${error.message}`);
    }

    return data;
  }

  async deleteRecord(id: string, options: MutationOptions = {}): Promise<void> {
    const { error } = await this.supabase
      .from(this.config.table)
      .delete()
      .eq('id', id)
      .eq('organization_id', this.config.organizationId);

    if (error) {
      throw new Error(`Failed to delete ${this.config.table}: ${error.message}`);
    }
  }

  async bulkCreate(records: Partial<DataRecord>[], options: MutationOptions = {}): Promise<DataRecord[]> {
    const recordsWithMeta = records.map(record => ({
      ...record,
      organization_id: this.config.organizationId,
      created_by: this.config.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await this.supabase
      .from(this.config.table)
      .insert(recordsWithMeta)
      .select();

    if (error) {
      throw new Error(`Failed to bulk create ${this.config.table}: ${error.message}`);
    }

    return data || [];
  }

  async bulkUpdate(updates: { id: string; data: Partial<DataRecord> }[], options: MutationOptions = {}): Promise<DataRecord[]> {
    const results: DataRecord[] = [];

    // Execute updates in parallel
    const promises = updates.map(async ({ id, data }) => {
      return this.updateRecord(id, data, options);
    });

    const updatedRecords = await Promise.all(promises);
    return updatedRecords;
  }

  async bulkDelete(ids: string[], options: MutationOptions = {}): Promise<void> {
    const { error } = await this.supabase
      .from(this.config.table)
      .delete()
      .in('id', ids)
      .eq('organization_id', this.config.organizationId);

    if (error) {
      throw new Error(`Failed to bulk delete ${this.config.table}: ${error.message}`);
    }
  }

  async exportData(format: 'csv' | 'json' | 'xlsx', options: QueryOptions = {}): Promise<Blob> {
    const data = await this.fetchData({ ...options, limit: undefined, page: undefined });

    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      case 'csv':
        const csv = this.convertToCSV(data);
        return new Blob([csv], { type: 'text/csv' });
      
      case 'xlsx':
        // For XLSX, we'd use a library like xlsx
        throw new Error('XLSX export not implemented yet');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: DataRecord[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  async importData(data: any[], validate = true): Promise<{ success: DataRecord[]; errors: any[] }> {
    const success: DataRecord[] = [];
    const errors: any[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        if (validate) {
          // Basic validation - extend as needed
          if (!data[i].name && !data[i].title) {
            throw new Error('Name or title is required');
          }
        }

        const record = await this.createRecord(data[i]);
        success.push(record);
      } catch (error) {
        errors.push({
          row: i + 1,
          data: data[i],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success, errors };
  }

  async getRecordComments(recordId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        profiles:created_by (
          full_name,
          avatar_url
        )
      `)
      .eq('table_name', this.config.table)
      .eq('record_id', recordId)
      .eq('organization_id', this.config.organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }

    return data || [];
  }

  async addComment(recordId: string, content: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('comments')
      .insert({
        organization_id: this.config.organizationId,
        table_name: this.config.table,
        record_id: recordId,
        body: content,
        created_by: this.config.userId
      })
      .select(`
        *,
        profiles:created_by (
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }

    return data;
  }

  async getRecordActivity(recordId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:created_by (
          full_name,
          avatar_url
        )
      `)
      .eq('table_name', this.config.table)
      .eq('record_id', recordId)
      .eq('organization_id', this.config.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }

    return data || [];
  }

  async getRecordFiles(recordId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('files')
      .select('*')
      .eq('table_name', this.config.table)
      .eq('record_id', recordId)
      .eq('organization_id', this.config.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
  }

  destroy() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }
    this.subscribers.clear();
  }
}

// Factory function for creating data services
export function createDataService(config: DataServiceConfig): SupabaseDataService {
  return new SupabaseDataService(config);
}

// Hook for React components
export function useDataService(config: DataServiceConfig) {
  const [service] = useState(() => createDataService(config));
  
  useEffect(() => {
    return () => service.destroy();
  }, [service]);

  return service;
}
