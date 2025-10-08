/**
 * Procurement Database Queries Service
 * Handles all database read operations with comprehensive filtering
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Query filter schema
const QueryFilterSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'contains']),
  value: z.any()
});

const QuerySortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc'])
});

const QueryPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

export type QueryFilter = z.infer<typeof QueryFilterSchema>;
export type QuerySort = z.infer<typeof QuerySortSchema>;
export type QueryPagination = z.infer<typeof QueryPaginationSchema>;

export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: QuerySort[];
  pagination?: QueryPagination;
  search?: string;
  searchFields?: string[];
  includes?: string[];
  select?: string[];
}

/**
 * Procurement Queries Service Class
 * Provides comprehensive database querying capabilities
 */
export class ProcurementQueriesService {
  private supabase: unknown;
  private orgId: string;

  constructor(orgId: string) {
    this.orgId = orgId;
    this.supabase = createClient();
  }

  /**
   * Generic query builder with advanced filtering
   */
  private buildQuery(table: string, options: QueryOptions = {}) {
    const {
      filters = [],
      sort = [],
      search,
      searchFields = [],
      includes = [],
      select
    } = options;

    // Build select statement
    const selectFields = select?.join(',') ||
      (includes.length > 0 ? `*, ${includes.join(', ')}` : '*');

    let query = this.supabase
      .from(table)
      .select(selectFields, { count: 'exact' });

    // Apply organization filter
    query = query.eq('organization_id', this.orgId);

    // Apply search
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields
        .map(field => `${field}.ilike.%${search}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    // Apply filters
    filters.forEach(filter => {
      const { field, operator, value } = filter;

      switch (operator) {
        case 'eq':
          query = query.eq(field, value);
          break;
        case 'neq':
          query = query.neq(field, value);
          break;
        case 'gt':
          query = query.gt(field, value);
          break;
        case 'gte':
          query = query.gte(field, value);
          break;
        case 'lt':
          query = query.lt(field, value);
          break;
        case 'lte':
          query = query.lte(field, value);
          break;
        case 'like':
          query = query.like(field, value);
          break;
        case 'ilike':
          query = query.ilike(field, value);
          break;
        case 'in':
          query = query.in(field, value);
          break;
        case 'contains':
          query = query.contains(field, value);
          break;
      }
    });

    // Apply sorting
    sort.forEach(sortOption => {
      query = query.order(sortOption.field, {
        ascending: sortOption.direction === 'asc'
      });
    });

    return query;
  }

  /**
   * Execute query with pagination
   */
  async executeQuery<T>(
    table: string,
    options: QueryOptions = {}
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { pagination } = options;
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;

    const query = this.buildQuery(table, options);

    // Apply pagination
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Query failed: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  }

  /**
   * Get purchase orders with comprehensive filtering
   */
  async getPurchaseOrders(options: QueryOptions = {}) {
    return this.executeQuery('purchase_orders', {
      ...options,
      includes: ['vendor:vendors(name)', 'requested_by:users(name,avatar)'],
      searchFields: ['po_number', 'title', 'description']
    });
  }

  /**
   * Get vendors with filtering
   */
  async getVendors(options: QueryOptions = {}) {
    return this.executeQuery('vendors', {
      ...options,
      searchFields: ['name', 'contact_email']
    });
  }

  /**
   * Get procurement analytics
   */
  async getAnalytics(dateRange?: { start: Date; end: Date }) {
    let query = this.supabase
      .from('purchase_orders')
      .select('total_amount, status, created_at, vendor_id')
      .eq('organization_id', this.orgId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw new Error(`Analytics query failed: ${error.message}`);

    // Calculate metrics
    const totalOrders = data.length;
    const totalValue = data.reduce((sum, order) => sum + order.total_amount, 0);
    const pendingOrders = data.filter(order => order.status === 'pending').length;
    const activeVendors = new Set(data.map(order => order.vendor_id)).size;

    return {
      totalOrders,
      totalValue,
      pendingOrders,
      activeVendors,
      averageOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0
    };
  }

  /**
   * Get procurement dashboard data
   */
  async getDashboardData() {
    const [ordersResult, vendorsResult, analytics] = await Promise.all([
      this.getPurchaseOrders({ pagination: { page: 1, pageSize: 5 } }),
      this.getVendors({ pagination: { page: 1, pageSize: 5 } }),
      this.getAnalytics(),
    ]);

    return {
      recentOrders: ordersResult.data,
      recentVendors: vendorsResult.data,
      analytics
    };
  }

  /**
   * Advanced search across all procurement entities
   */
  async globalSearch(query: string, limit: number = 50) {
    const [orders, vendors] = await Promise.all([
      this.getPurchaseOrders({
        search: query,
        pagination: { page: 1, pageSize: limit / 2 }
      }),
      this.getVendors({
        search: query,
        pagination: { page: 1, pageSize: limit / 2 }
      }),
    ]);

    return {
      orders: orders.data,
      vendors: vendors.data,
      total: orders.total + vendors.total
    };
  }

  /**
   * Get procurement reports data
   */
  async getReports(reportType: 'orders' | 'vendors' | 'spending', dateRange?: { start: Date; end: Date }) {
    switch (reportType) {
      case 'orders':
        return this.getPurchaseOrders({
          filters: dateRange ? [{
            field: 'created_at',
            operator: 'gte',
            value: dateRange.start.toISOString()
          }, {
            field: 'created_at',
            operator: 'lte',
            value: dateRange.end.toISOString()
          }] : []
        });

      case 'vendors':
        return this.getVendors();

      case 'spending':
        const analytics = await this.getAnalytics(dateRange);
        return {
          data: [analytics],
          total: 1,
          page: 1,
          pageSize: 1,
          totalPages: 1
        };

      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}

// Factory function
export function createProcurementQueriesService(orgId: string): ProcurementQueriesService {
  return new ProcurementQueriesService(orgId);
}
