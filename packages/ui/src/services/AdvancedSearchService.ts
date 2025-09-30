/**
 * Enterprise Advanced Search Service
 * Supports regex, fuzzy search, and comprehensive analytics
 */

import Fuse from 'fuse.js';

export interface SearchOptions {
  query: string;
  type: 'exact' | 'fuzzy' | 'regex' | 'fulltext';
  fields?: string[];
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  highlight?: boolean;
  facets?: string[];
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: Record<string, FacetValue[]>;
  highlights?: Record<string, string[]> | undefined;
  performance: SearchPerformance;
}

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface SearchPerformance {
  duration: number;
  indexUsed: boolean;
  cacheHit: boolean;
  queryComplexity: 'simple' | 'moderate' | 'complex';
}

export interface SearchAnalytics {
  query: string;
  timestamp: Date;
  duration: number;
  resultCount: number;
  clickedResults: string[];
  refinements: string[];
  abandoned: boolean;
  userId?: string;
  sessionId: string;
}

export interface SearchMetrics {
  totalSearches: number;
  averageDuration: number;
  averageResults: number;
  topQueries: QueryMetric[];
  zeroResultQueries: string[];
  clickThroughRate: number;
  refinementRate: number;
  abandonmentRate: number;
}

export interface QueryMetric {
  query: string;
  count: number;
  averageDuration: number;
  averageResults: number;
  clickThroughRate: number;
}

export class AdvancedSearchService {
  private supabase: any;
  private searchCache = new Map<string, { result: any; timestamp: number }>();
  private analyticsBuffer: SearchAnalytics[] = [];
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private ANALYTICS_BATCH_SIZE = 50;
  private sessionId = this.generateSessionId();

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Perform advanced search with multiple strategies
   */
  async search<T = any>(options: SearchOptions): Promise<SearchResult<T>> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(options);
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        performance: {
          ...cached.performance,
          cacheHit: true,
        },
      };
    }

    let result: SearchResult<T>;

    switch (options.type) {
      case 'regex':
        result = await this.regexSearch<T>(options);
        break;
      case 'fuzzy':
        result = await this.fuzzySearch<T>(options);
        break;
      case 'fulltext':
        result = await this.fulltextSearch<T>(options);
        break;
      default:
        result = await this.exactSearch<T>(options);
    }

    // Add performance metrics
    const duration = performance.now() - startTime;
    result.performance = {
      duration,
      indexUsed: options.type === 'fulltext',
      cacheHit: false,
      queryComplexity: this.getQueryComplexity(options),
    };

    // Cache result
    this.setCache(cacheKey, result);

    // Track analytics
    this.trackSearch({
      query: options.query,
      timestamp: new Date(),
      duration,
      resultCount: result.total,
      clickedResults: [],
      refinements: [],
      abandoned: false,
      sessionId: this.sessionId,
    });

    return result;
  }

  /**
   * Regex search implementation
   */
  private async regexSearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    try {
      // Validate regex pattern
      const regex = new RegExp(options.query, 'gi');
      
      // For client-side regex search, we need to fetch data first
      const { data, error, count } = await this.supabase
        .from(this.getTableFromContext())
        .select('*', { count: 'exact' })
        .limit(1000); // Limit for performance

      if (error) throw error;

      // Apply regex filter
      const filtered = (data || []).filter((item: any) => {
        if (options.fields && options.fields.length > 0) {
          return options.fields.some(field => {
            const value = this.getNestedValue(item, field);
            return regex.test(String(value));
          });
        } else {
          // Search all string fields
          return Object.values(item).some(value => 
            typeof value === 'string' && regex.test(value)
          );
        }
      });

      // Apply additional filters
      const finalResults = this.applyFilters(filtered, options.filters);

      // Apply sorting
      const sorted = this.applySort(finalResults, options.sort);

      // Apply pagination
      const paginated = this.applyPagination(sorted, options.pagination);

      // Generate highlights if requested
      const highlights = options.highlight 
        ? this.generateHighlights(paginated.items, regex, options.fields)
        : undefined;

      return {
        items: paginated.items,
        total: finalResults.length,
        page: paginated.page,
        pageSize: paginated.pageSize,
        totalPages: paginated.totalPages,
        highlights: highlights || undefined,
        performance: {} as SearchPerformance, // Will be filled by caller
      };
    } catch (error) {
      console.error('Regex search error:', error);
      throw new Error('Invalid regex pattern');
    }
  }

  /**
   * Fuzzy search using Fuse.js
   */
  private async fuzzySearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    // Fetch data for fuzzy search
    const { data, error } = await this.supabase
      .from(this.getTableFromContext())
      .select('*')
      .limit(1000);

    if (error) throw error;

    // Configure Fuse.js
    const fuseOptions: Fuse.IFuseOptions<any> = {
      keys: options.fields || Object.keys(data?.[0] || {}),
      threshold: 0.3,
      location: 0,
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: options.highlight,
    };

    const fuse = new Fuse(data || [], fuseOptions);
    const results = fuse.search(options.query);

    // Extract items and scores
    const items = results.map((r: any) => r.item);
    const scores = results.map((r: any) => r.score);

    // Apply additional filters
    const filtered = this.applyFilters(items, options.filters);

    // Apply pagination
    const paginated = this.applyPagination(filtered, options.pagination);

    // Generate highlights from matches
    const highlights = options.highlight && results[0]?.matches
      ? this.generateFuzzyHighlights(results)
      : undefined;

    return {
      items: paginated.items,
      total: filtered.length,
      page: paginated.page,
      pageSize: paginated.pageSize,
      totalPages: paginated.totalPages,
      highlights: highlights || undefined,
      performance: {} as SearchPerformance,
    };
  }

  /**
   * Full-text search using database
   */
  private async fulltextSearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    let query = this.supabase
      .from(this.getTableFromContext())
      .select('*', { count: 'exact' });

    // Apply full-text search
    if (options.fields && options.fields.length === 1) {
      // Search specific field
      query = query.textSearch(options.fields[0], options.query, {
        type: 'websearch',
        config: 'english',
      });
    } else {
      // Search all text fields (assuming 'fts' column exists)
      query = query.textSearch('fts', options.query, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply sorting
    if (options.sort) {
      query = query.order(options.sort.field, {
        ascending: options.sort.direction === 'asc',
      });
    }

    // Apply pagination
    if (options.pagination) {
      const { page, pageSize } = options.pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Generate facets if requested
    const facets = options.facets 
      ? await this.generateFacets(options.facets, options.filters)
      : undefined;

    return {
      items: data || [],
      total: count || 0,
      page: options.pagination?.page || 1,
      pageSize: options.pagination?.pageSize || (data?.length || 0),
      totalPages: Math.ceil((count || 0) / (options.pagination?.pageSize || 1)),
      facets,
      performance: {} as SearchPerformance,
    };
  }

  /**
   * Exact search
   */
  private async exactSearch<T>(options: SearchOptions): Promise<SearchResult<T>> {
    let query = this.supabase
      .from(this.getTableFromContext())
      .select('*', { count: 'exact' });

    // Apply exact match filters
    if (options.fields && options.fields.length > 0) {
      // Search specific fields
      const orConditions = options.fields.map(field => 
        `${field}.ilike.%${options.query}%`
      ).join(',');
      query = query.or(orConditions);
    } else {
      // Search all text fields
      query = query.ilike('*', `%${options.query}%`);
    }

    // Apply additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply sorting
    if (options.sort) {
      query = query.order(options.sort.field, {
        ascending: options.sort.direction === 'asc',
      });
    }

    // Apply pagination
    if (options.pagination) {
      const { page, pageSize } = options.pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      items: data || [],
      total: count || 0,
      page: options.pagination?.page || 1,
      pageSize: options.pagination?.pageSize || (data?.length || 0),
      totalPages: Math.ceil((count || 0) / (options.pagination?.pageSize || 1)),
      performance: {} as SearchPerformance,
    };
  }

  /**
   * Track search analytics
   */
  private trackSearch(analytics: SearchAnalytics) {
    this.analyticsBuffer.push(analytics);

    // Batch send analytics
    if (this.analyticsBuffer.length >= this.ANALYTICS_BATCH_SIZE) {
      this.flushAnalytics();
    }
  }

  /**
   * Track clicked search result
   */
  trackClick(query: string, resultId: string) {
    const lastSearch = this.analyticsBuffer
      .filter(a => a.query === query)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (lastSearch) {
      lastSearch.clickedResults.push(resultId);
    }
  }

  /**
   * Track search refinement
   */
  trackRefinement(originalQuery: string, refinedQuery: string) {
    const lastSearch = this.analyticsBuffer
      .filter(a => a.query === originalQuery)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (lastSearch) {
      lastSearch.refinements.push(refinedQuery);
    }
  }

  /**
   * Get search analytics metrics
   */
  async getSearchMetrics(
    timeRange?: { start: Date; end: Date }
  ): Promise<SearchMetrics> {
    // Flush pending analytics
    await this.flushAnalytics();

    // Fetch analytics from database
    let query = this.supabase
      .from('search_analytics')
      .select('*');

    if (timeRange) {
      query = query
        .gte('timestamp', timeRange.start.toISOString())
        .lte('timestamp', timeRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate metrics
    const analytics = data || [];
    const totalSearches = analytics.length;
    const averageDuration = analytics.reduce((sum, a) => sum + a.duration, 0) / totalSearches || 0;
    const averageResults = analytics.reduce((sum, a) => sum + a.result_count, 0) / totalSearches || 0;

    // Top queries
    const queryGroups = this.groupBy(analytics, 'query');
    const topQueries: QueryMetric[] = Object.entries(queryGroups)
      .map(([query, items]) => ({
        query,
        count: items.length,
        averageDuration: items.reduce((sum, a) => sum + a.duration, 0) / items.length,
        averageResults: items.reduce((sum, a) => sum + a.result_count, 0) / items.length,
        clickThroughRate: items.filter(a => a.clicked_results?.length > 0).length / items.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Zero result queries
    const zeroResultQueries = analytics
      .filter(a => a.result_count === 0)
      .map(a => a.query)
      .filter((v, i, a) => a.indexOf(v) === i);

    // Click-through rate
    const searchesWithClicks = analytics.filter(a => a.clicked_results?.length > 0).length;
    const clickThroughRate = searchesWithClicks / totalSearches || 0;

    // Refinement rate
    const searchesWithRefinements = analytics.filter(a => a.refinements?.length > 0).length;
    const refinementRate = searchesWithRefinements / totalSearches || 0;

    // Abandonment rate
    const abandonedSearches = analytics.filter(a => a.abandoned).length;
    const abandonmentRate = abandonedSearches / totalSearches || 0;

    return {
      totalSearches,
      averageDuration,
      averageResults,
      topQueries,
      zeroResultQueries,
      clickThroughRate,
      refinementRate,
      abandonmentRate,
    };
  }

  /**
   * Get search suggestions based on history
   */
  async getSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('search_analytics')
      .select('query')
      .ilike('query', `${prefix}%`)
      .order('timestamp', { ascending: false })
      .limit(limit * 3); // Get more to deduplicate

    if (error) throw error;

    // Deduplicate and return top suggestions
    const unique = Array.from(new Set(data?.map(d => d.query) || []));
    return unique.slice(0, limit);
  }

  /**
   * Flush analytics buffer to database
   */
  private async flushAnalytics() {
    if (this.analyticsBuffer.length === 0) return;

    const batch = [...this.analyticsBuffer];
    this.analyticsBuffer = [];

    try {
      const { error } = await this.supabase
        .from('search_analytics')
        .insert(
          batch.map(a => ({
            query: a.query,
            timestamp: a.timestamp.toISOString(),
            duration: a.duration,
            result_count: a.resultCount,
            clicked_results: a.clickedResults,
            refinements: a.refinements,
            abandoned: a.abandoned,
            user_id: a.userId,
            session_id: a.sessionId,
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error flushing search analytics:', error);
      // Re-add to buffer on error
      this.analyticsBuffer.unshift(...batch);
    }
  }

  // Helper methods

  private getTableFromContext(): string {
    // Get from current route or context
    const path = window.location.pathname;
    const module = path.split('/')[1];
    return module || 'users';
  }

  private getCacheKey(options: SearchOptions): string {
    return JSON.stringify({
      query: options.query,
      type: options.type,
      fields: options.fields,
      filters: options.filters,
      sort: options.sort,
    });
  }

  private getFromCache(key: string) {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    return null;
  }

  private setCache(key: string, result: any) {
    this.searchCache.set(key, {
      result,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.searchCache.size > 100) {
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }
  }

  private getQueryComplexity(options: SearchOptions): SearchPerformance['queryComplexity'] {
    if (options.type === 'regex') return 'complex';
    if (options.type === 'fuzzy' || options.facets) return 'moderate';
    return 'simple';
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  private applyFilters(items: any[], filters?: Record<string, any>): any[] {
    if (!filters) return items;

    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        const itemValue = this.getNestedValue(item, key);
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        return itemValue === value;
      });
    });
  }

  private applySort(items: any[], sort?: { field: string; direction: 'asc' | 'desc' }): any[] {
    if (!sort) return items;

    return [...items].sort((a, b) => {
      const aValue = this.getNestedValue(a, sort.field);
      const bValue = this.getNestedValue(b, sort.field);

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private applyPagination(
    items: any[],
    pagination?: { page: number; pageSize: number }
  ): {
    items: any[];
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    if (!pagination) {
      return {
        items,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
      };
    }

    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: items.slice(start, end),
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    };
  }

  private generateHighlights(
    items: any[],
    regex: RegExp,
    fields?: string[]
  ): Record<string, string[]> {
    const highlights: Record<string, string[]> = {};

    items.forEach((item, index) => {
      const itemHighlights: string[] = [];

      const searchFields = fields || Object.keys(item);
      searchFields.forEach(field => {
        const value = String(this.getNestedValue(item, field));
        const matches = value.match(regex);
        if (matches) {
          matches.forEach(match => {
            const start = Math.max(0, value.indexOf(match) - 20);
            const end = Math.min(value.length, value.indexOf(match) + match.length + 20);
            const highlight = '...' + value.substring(start, end) + '...';
            itemHighlights.push(highlight);
          });
        }
      });

      if (itemHighlights.length > 0) {
        highlights[item.id || index] = itemHighlights;
      }
    });

    return highlights;
  }

  private generateFuzzyHighlights(results: Fuse.FuseResult<any>[]): Record<string, string[]> {
    const highlights: Record<string, string[]> = {};

    results.forEach(result => {
      if (result.matches) {
        const itemHighlights: string[] = [];
        
        result.matches.forEach(match => {
          if (match.indices) {
            const value = String(match.value);
            match.indices.forEach(([start, end]) => {
              const contextStart = Math.max(0, start - 20);
              const contextEnd = Math.min(value.length, end + 20);
              const highlight = 
                '...' + 
                value.substring(contextStart, start) +
                '<mark>' + value.substring(start, end + 1) + '</mark>' +
                value.substring(end + 1, contextEnd) +
                '...';
              itemHighlights.push(highlight);
            });
          }
        });

        if (itemHighlights.length > 0) {
          highlights[result.item.id || result.refIndex] = itemHighlights;
        }
      }
    });

    return highlights;
  }

  private async generateFacets(
    facetFields: string[],
    currentFilters?: Record<string, any>
  ): Promise<Record<string, FacetValue[]>> {
    const facets: Record<string, FacetValue[]> = {};

    for (const field of facetFields) {
      const { data, error } = await this.supabase
        .from(this.getTableFromContext())
        .select(field)
        .limit(1000);

      if (!error && data) {
        const values = data.map(d => d[field]).filter(Boolean);
        const counts = values.reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        facets[field] = Object.entries(counts)
          .map(([value, count]) => ({
            value,
            count,
            selected: currentFilters?.[field] === value,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }
    }

    return facets;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export factory function for creating service instances
export const createAdvancedSearchService = (supabaseClient: any) => {
  return new AdvancedSearchService(supabaseClient);
};
