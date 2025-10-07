/**
 * Dashboard Module Database Queries
 * Enterprise-grade database query management
 * Provides optimized queries with caching, pagination, and performance monitoring
 */

import type {
  Dashboard,
  DashboardWidget,
  DashboardMetrics,
  WidgetData,
  DashboardListItem
} from '../types';

import { dashboardApi } from './api';

// Query Types
export interface QueryOptions {
  select?: string;
  filters?: Record<string, unknown>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  includeCount?: boolean;
  cache?: boolean;
  cacheTtl?: number;
}

export interface QueryResult<T> {
  data: T[];
  count?: number;
  hasMore: boolean;
  queryTime: number;
  cached?: boolean;
}

// Dashboard Queries
export class DashboardQueries {
  // Get all dashboards for user/organization
  static async getDashboards(options: QueryOptions = {}): Promise<QueryResult<DashboardListItem>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.get<DashboardListItem[]>('/dashboards', undefined, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });

      const queryTime = Date.now() - startTime;

      return {
        data: response.data || [],
        count: response.data?.length || 0,
        hasMore: false,
        queryTime,
        cached: response.cached
      };
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      throw error;
    }
  }

  // Get single dashboard with widgets
  static async getDashboard(id: string, options: QueryOptions = {}): Promise<Dashboard | null> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.get<Dashboard>(`/dashboards/${id}`, undefined, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });

      const _queryTime = Date.now() - startTime;

      if (!response.data) return null;

      // Fetch widgets separately for better caching
      const widgetsResponse = await dashboardApi.get<DashboardWidget[]>(
        `/dashboards/${id}/widgets`,
        undefined,
        { cache: options.cache !== false, cacheTtl: options.cacheTtl }
      );

      return {
        ...response.data,
        widgets: widgetsResponse.data || []
      };
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  }

  // Get dashboard metrics
  static async getDashboardMetrics(dashboardId: string): Promise<DashboardMetrics | null> {
    try {
      const response = await dashboardApi.get<DashboardMetrics>(`/dashboards/${dashboardId}/metrics`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return null;
    }
  }

  // Search dashboards
  static async searchDashboards(query: string, options: QueryOptions = {}): Promise<QueryResult<DashboardListItem>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.get<DashboardListItem[]>('/dashboards/search', {
        q: query,
        ...options.filters
      }, {
        cache: false // Search results shouldn't be cached
      });

      const queryTime = Date.now() - startTime;

      return {
        data: response.data || [],
        count: response.data?.length || 0,
        hasMore: false,
        queryTime,
        cached: false
      };
    } catch (error) {
      console.error('Error searching dashboards:', error);
      throw error;
    }
  }
}

// Widget Queries
export class WidgetQueries {
  // Get widgets for dashboard
  static async getWidgets(dashboardId: string, options: QueryOptions = {}): Promise<QueryResult<DashboardWidget>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.get<DashboardWidget[]>(`/dashboards/${dashboardId}/widgets`, undefined, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });

      const queryTime = Date.now() - startTime;

      return {
        data: response.data || [],
        count: response.data?.length || 0,
        hasMore: false,
        queryTime,
        cached: response.cached
      };
    } catch (error) {
      console.error('Error fetching widgets:', error);
      throw error;
    }
  }

  // Get single widget
  static async getWidget(id: string, options: QueryOptions = {}): Promise<DashboardWidget | null> {
    try {
      const response = await dashboardApi.get<DashboardWidget>(`/widgets/${id}`, undefined, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });

      return response.data || null;
    } catch (error) {
      console.error('Error fetching widget:', error);
      return null;
    }
  }

  // Get widget data
  static async getWidgetData(widgetId: string, options: QueryOptions = {}): Promise<WidgetData | null> {
    try {
      const response = await dashboardApi.get<WidgetData>(`/widgets/${widgetId}/data`, undefined, {
        cache: false // Widget data should be fresh
      });

      return response.data || null;
    } catch (error) {
      console.error('Error fetching widget data:', error);
      return null;
    }
  }

  // Get widgets by type
  static async getWidgetsByType(type: string, options: QueryOptions = {}): Promise<QueryResult<DashboardWidget>> {
    const startTime = Date.now();

    try {
      const response = await dashboardApi.get<DashboardWidget[]>('/widgets', {
        type,
        ...options.filters
      }, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });

      const queryTime = Date.now() - startTime;

      return {
        data: response.data || [],
        count: response.data?.length || 0,
        hasMore: false,
        queryTime,
        cached: response.cached
      };
    } catch (error) {
      console.error('Error fetching widgets by type:', error);
      throw error;
    }
  }
}

// Analytics Queries
export class AnalyticsQueries {
  // Get cross-module analytics data
  static async getAnalyticsData(
    modules: string[],
    dateRange?: { start: string; end: string },
    options: QueryOptions = {}
  ): Promise<Record<string, unknown>> {
    try {
      const params: Record<string, string> = {
        modules: modules.join(',')
      };

      if (dateRange) {
        params.start_date = dateRange.start;
        params.end_date = dateRange.end;
      }

      const response = await dashboardApi.get<Record<string, unknown>>('/analytics/data', params, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl || 300000 // 5 minutes
      });

      return response.data || {};
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return {};
    }
  }

  // Get module-specific metrics
  static async getModuleMetrics(modules: string[], options: QueryOptions = {}): Promise<DashboardMetrics[]> {
    try {
      const response = await dashboardApi.get<DashboardMetrics[]>(`/analytics/modules/${modules.join(',')}/metrics`, undefined, {
        cache: options.cache !== false,
        cacheTtl: options.cacheTtl
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching module metrics:', error);
      return [];
    }
  }

  // Get real-time data for widgets
  static async getRealtimeData(widgetIds: string[]): Promise<Record<string, WidgetData>> {
    try {
      const response = await dashboardApi.post<Record<string, WidgetData>>('/analytics/realtime', {
        widget_ids: widgetIds
      }, {
        cache: false // Real-time data should never be cached
      });

      return response.data || {};
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      return {};
    }
  }
}

// Performance Monitoring
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private queryStats = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    lastExecuted: number;
    slowestQuery: number;
  }>();

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  recordQuery(queryName: string, executionTime: number): void {
    const existing = this.queryStats.get(queryName);

    if (existing) {
      existing.count++;
      existing.totalTime += executionTime;
      existing.avgTime = existing.totalTime / existing.count;
      existing.lastExecuted = Date.now();
      existing.slowestQuery = Math.max(existing.slowestQuery, executionTime);
    } else {
      this.queryStats.set(queryName, {
        count: 1,
        totalTime: executionTime,
        avgTime: executionTime,
        lastExecuted: Date.now(),
        slowestQuery: executionTime
      });
    }
  }

  getQueryStats(queryName?: string) {
    if (queryName) {
      return this.queryStats.get(queryName) || null;
    }

    return Object.fromEntries(this.queryStats.entries());
  }

  getSlowQueries(threshold = 1000): Array<{ name: string; stats: unknown }> {
    return Array.from(this.queryStats.entries())
      .filter(([, stats]) => stats.avgTime > threshold)
      .map(([name, stats]) => ({ name, stats }))
      .sort((a, b) => (b.stats as any).avgTime - (a.stats as any).avgTime);
  }

  reset(): void {
    this.queryStats.clear();
  }
}

// Export performance monitor instance
export const queryPerformanceMonitor = QueryPerformanceMonitor.getInstance();

// Query builder utility
export class QueryBuilder {
  private query: QueryOptions = {};

  select(fields: string): QueryBuilder {
    this.query.select = fields;
    return this;
  }

  where(filters: Record<string, unknown>): QueryBuilder {
    this.query.filters = { ...this.query.filters, ...filters };
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder {
    this.query.sort = this.query.sort || [];
    this.query.sort.push({ field, direction });
    return this;
  }

  limit(limit: number): QueryBuilder {
    this.query.limit = limit;
    return this;
  }

  offset(offset: number): QueryBuilder {
    this.query.offset = offset;
    return this;
  }

  includeCount(): QueryBuilder {
    this.query.includeCount = true;
    return this;
  }

  cache(ttl?: number): QueryBuilder {
    this.query.cache = true;
    this.query.cacheTtl = ttl;
    return this;
  }

  noCache(): QueryBuilder {
    this.query.cache = false;
    return this;
  }

  build(): QueryOptions {
    return { ...this.query };
  }
}

// Export query builder factory
export const query = () => new QueryBuilder();
