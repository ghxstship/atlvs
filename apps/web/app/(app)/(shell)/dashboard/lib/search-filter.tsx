/**
 * Dashboard Advanced Search & Filter Service
 * Enterprise-grade search with fuzzy matching, visual filter builders, and multi-column sorting
 * Provides sophisticated query capabilities with performance optimization
 */

import { dashboardApi } from './api';
import Fuse from 'fuse.js';

// Search Configuration Types
export interface SearchConfig {
  fields: string[];
  weights?: Record<string, number>;
  threshold?: number;
  distance?: number;
  includeScore?: boolean;
  useExtendedSearch?: boolean;
}

export interface FuzzySearchOptions {
  isCaseSensitive?: boolean;
  includeMatches?: boolean;
  includeScore?: boolean;
  shouldSort?: boolean;
  keys: Array<{
    name: string;
    weight?: number;
    getFn?: (obj: unknown) => string;
  }>;
  threshold?: number;
  distance?: number;
  location?: number;
}

// Filter Builder Types
export interface FilterCondition {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'between' | 'is_empty' | 'is_not_empty';
  value: unknown;
  label?: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
  options?: Array<{ label: string; value: unknown }>;
}

export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
  groups?: FilterGroup[];
}

export interface VisualFilterBuilderProps {
  availableFields: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';
    options?: Array<{ label: string; value: unknown }>;
  }>;
  onFilterChange: (filter: FilterGroup) => void;
  initialFilter?: FilterGroup;
}

// Sort Configuration
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  priority?: number;
  nullsFirst?: boolean;
  customComparator?: (a: unknown, b: unknown) => number;
}

export interface MultiColumnSortConfig {
  sorts: SortConfig[];
  stable?: boolean;
}

// Search Service Class
export class AdvancedSearchService {
  private fuseInstances = new Map<string, Fuse<>();;
  private searchCache = new Map<string, { results: unknown[]; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  // Perform fuzzy search
  async fuzzySearch<T>(
    data: T[],
    query: string,
    options: FuzzySearchOptions
  ): Promise<{
    results: T[];
    matches?: unknown[];
    scores?: number[];
  }> {
    const cacheKey = `fuzzy_${query}_${JSON.stringify(options)}`;

    // Check cache
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { results: cached.results as T[] };
    }

    // Create Fuse instance if not exists
    const dataKey = JSON.stringify(data.slice(0, 5)); // Use sample for cache key
    if (!this.fuseInstances.has(dataKey)) {
      this.fuseInstances.set(dataKey, new Fuse(data, options));
    }

    const fuse = this.fuseInstances.get(dataKey)!;
    const searchResults = fuse.search(query);

    const results = searchResults.map(result => result.item);
    const matches = options.includeMatches ? searchResults.map(result => result.matches) : undefined;
    const scores = options.includeScore ? searchResults.map(result => result.score) : undefined;

    // Cache results
    this.searchCache.set(cacheKey, {
      results: results as any[],
      timestamp: Date.now()
    });

    return { results, matches, scores };
  }

  // Perform full-text search with PostgreSQL
  async fullTextSearch(
    query: string,
    fields: string[],
    options: {
      limit?: number;
      offset?: number;
      highlight?: boolean;
      ranking?: boolean;
    } = {}
  ): Promise<{
    results: unknown[];
    total: number;
    highlights?: Record<string, string[]>;
  }> {
    try {
      const response = await dashboardApi.get('/search/fulltext', {
        q: query,
        fields: fields.join(','),
        limit: options.limit?.toString(),
        offset: options.offset?.toString(),
        highlight: options.highlight?.toString(),
        ranking: options.ranking?.toString()
      });

      return response.data;
    } catch (error) {
      console.error('Full-text search failed:', error);
      return { results: [], total: 0 };
    }
  }

  // Perform semantic search
  async semanticSearch(
    query: string,
    options: {
      model?: 'text-embedding-ada-002' | 'text-embedding-3-small';
      threshold?: number;
      limit?: number;
      includeMetadata?: boolean;
    } = {}
  ): Promise<{
    results: unknown[];
    scores: number[];
    metadata?: unknown[];
  }> {
    try {
      const response = await dashboardApi.post('/search/semantic', {
        query,
        ...options
      });

      return response.data;
    } catch (error) {
      console.error('Semantic search failed:', error);
      return { results: [], scores: [] };
    }
  }

  // Hybrid search (combines multiple search methods)
  async hybridSearch(
    query: string,
    data: unknown[],
    options: {
      fuzzyWeight?: number;
      semanticWeight?: number;
      textWeight?: number;
      fuzzyOptions?: FuzzySearchOptions;
    } = {}
  ): Promise<{
    results: unknown[];
    combinedScore: number[];
    breakdown: Record<string, number[]>;
  }> {
    const {
      fuzzyWeight = 0.4,
      semanticWeight = 0.3,
      textWeight = 0.3,
      fuzzyOptions
    } = options;

    try {
      // Perform different search types in parallel
      const [fuzzyResults, semanticResults, textResults] = await Promise.all([
        fuzzyOptions ? this.fuzzySearch(data, query, fuzzyOptions) : Promise.resolve({ results: [] }),
        this.semanticSearch(query, { limit: data.length }),
        this.fullTextSearch(query, ['name', 'description', 'content'], { limit: data.length })
      ]);

      // Combine and score results
      const resultMap = new Map<string, {
        item: unknown;
        fuzzyScore?: number;
        semanticScore?: number;
        textScore?: number;
        combinedScore: number;
      }>();

      // Process fuzzy results
      fuzzyResults.results.forEach((item, index) => {
        const id = this.getItemId(item);
        const existing = resultMap.get(id) || { item, combinedScore: 0 };
        existing.fuzzyScore = (fuzzyResults as any).scores?.[index] || 0;
        existing.combinedScore += (1 - (existing.fuzzyScore || 0)) * fuzzyWeight;
        resultMap.set(id, existing);
      });

      // Process semantic results
      semanticResults.results.forEach((item, index) => {
        const id = this.getItemId(item);
        const existing = resultMap.get(id) || { item, combinedScore: 0 };
        existing.semanticScore = semanticResults.scores[index];
        existing.combinedScore += existing.semanticScore * semanticWeight;
        resultMap.set(id, existing);
      });

      // Process text results
      textResults.results.forEach((item) => {
        const id = this.getItemId(item);
        const existing = resultMap.get(id) || { item, combinedScore: 0 };
        existing.textScore = 0.8; // Simplified scoring
        existing.combinedScore += existing.textScore * textWeight;
        resultMap.set(id, existing);
      });

      // Sort by combined score
      const sortedResults = Array.from(resultMap.values())
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .map(result => result.item);

      const scores = Array.from(resultMap.values())
        .sort((a, b) => b.combinedScore - a.combinedScore)
        .map(result => result.combinedScore);

      return {
        results: sortedResults,
        combinedScore: scores,
        breakdown: {
          fuzzy: Array.from(resultMap.values()).map(r => r.fuzzyScore || 0),
          semantic: Array.from(resultMap.values()).map(r => r.semanticScore || 0),
          text: Array.from(resultMap.values()).map(r => r.textScore || 0)
        }
      };
    } catch (error) {
      console.error('Hybrid search failed:', error);
      return { results: [], combinedScore: [], breakdown: {} };
    }
  }

  private getItemId(item: unknown): string {
    return item.id || item._id || JSON.stringify(item);
  }

  // Clear search cache
  clearCache(): void {
    this.searchCache.clear();
    this.fuseInstances.clear();
  }
}

// Filter Builder Service
export class FilterBuilderService {
  // Build filter query from visual filter
  buildQuery(filter: FilterGroup): Record<string, unknown> {
    return this.buildGroupQuery(filter);
  }

  private buildGroupQuery(group: FilterGroup): Record<string, unknown> {
    const conditions = group.conditions.map(condition => this.buildConditionQuery(condition));
    const subGroups = group.groups?.map(subGroup => this.buildGroupQuery(subGroup)) || [];

    const allQueries = [...conditions, ...subGroups];

    if (allQueries.length === 0) return {};

    if (allQueries.length === 1) return allQueries[0];

    // Combine with AND/OR logic
    return {
      [group.logic.toLowerCase()]: allQueries
    };
  }

  private buildConditionQuery(condition: FilterCondition): Record<string, unknown> {
    const { field, operator, value } = condition;

    switch (operator) {
      case 'eq':
        return { [field]: value };
      case 'ne':
        return { [`${field}_ne`]: value };
      case 'gt':
        return { [`${field}_gt`]: value };
      case 'lt':
        return { [`${field}_lt`]: value };
      case 'gte':
        return { [`${field}_gte`]: value };
      case 'lte':
        return { [`${field}_lte`]: value };
      case 'contains':
        return { [`${field}_contains`]: value };
      case 'starts_with':
        return { [`${field}_starts_with`]: value };
      case 'ends_with':
        return { [`${field}_ends_with`]: value };
      case 'in':
        return { [`${field}_in`]: Array.isArray(value) ? value : [value] };
      case 'not_in':
        return { [`${field}_not_in`]: Array.isArray(value) ? value : [value] };
      case 'between':
        const [min, max] = Array.isArray(value) ? value : [value, value];
        return { [`${field}_gte`]: min, [`${field}_lte`]: max };
      case 'is_empty':
        return { [`${field}_is_empty`]: true };
      case 'is_not_empty':
        return { [`${field}_is_not_empty`]: true };
      default:
        return { [field]: value };
    }
  }

  // Validate filter configuration
  validateFilter(filter: FilterGroup): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateGroup = (group: FilterGroup, path = '') => {
      if (!group.conditions && (!group.groups || group.groups.length === 0)) {
        errors.push(`${path}Filter group must have conditions or subgroups`);
      }

      group.conditions.forEach((condition, index) => {
        if (!condition.field) {
          errors.push(`${path}Condition ${index + 1}: Field is required`);
        }
        if (!condition.operator) {
          errors.push(`${path}Condition ${index + 1}: Operator is required`);
        }
        if (condition.value === undefined || condition.value === null) {
          errors.push(`${path}Condition ${index + 1}: Value is required`);
        }
      });

      group.groups?.forEach((subGroup, index) => {
        validateGroup(subGroup, `${path}Group ${index + 1}: `);
      });
    };

    validateGroup(filter);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Export filter as SQL-like query
  exportAsSQL(filter: FilterGroup): string {
    const buildSQL = (group: FilterGroup): string => {
      const conditions: string[] = [];
      const subGroups: string[] = [];

      group.conditions.forEach(condition => {
        const { field, operator, value } = condition;
        let sqlOperator: string;
        let sqlValue: string;

        switch (operator) {
          case 'eq': sqlOperator = '='; sqlValue = `'${value}'`; break;
          case 'ne': sqlOperator = '!='; sqlValue = `'${value}'`; break;
          case 'gt': sqlOperator = '>'; sqlValue = `'${value}'`; break;
          case 'lt': sqlOperator = '<'; sqlValue = `'${value}'`; break;
          case 'gte': sqlOperator = '>='; sqlValue = `'${value}'`; break;
          case 'lte': sqlOperator = '<='; sqlValue = `'${value}'`; break;
          case 'contains': sqlOperator = 'LIKE'; sqlValue = `'%${value}%'`; break;
          case 'starts_with': sqlOperator = 'LIKE'; sqlValue = `'${value}%'`; break;
          case 'ends_with': sqlOperator = 'LIKE'; sqlValue = `'%${value}%'`; break;
          default: sqlOperator = '='; sqlValue = `'${value}'`; break;
        }

        conditions.push(`${field} ${sqlOperator} ${sqlValue}`);
      });

      group.groups?.forEach(subGroup => {
        subGroups.push(`(${buildSQL(subGroup)})`);
      });

      const allParts = [...conditions, ...subGroups];
      return allParts.join(` ${group.logic} `);
    };

    return buildSQL(filter);
  }
}

// Advanced Sorting Service
export class AdvancedSortService {
  // Multi-column sorting with priority
  sort<T>(
    data: T[],
    config: MultiColumnSortConfig
  ): T[] {
    const { sorts, stable = true } = config;

    return [...data].sort((a, b) => {
      for (const sort of sorts) {
        const { field, direction, nullsFirst = false, customComparator } = sort;

        let aValue = (a as any)[field];
        let bValue = (b as any)[field];

        // Handle nulls
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return nullsFirst ? -1 : 1;
        if (bValue == null) return nullsFirst ? 1 : -1;

        // Use custom comparator if provided
        if (customComparator) {
          const result = customComparator(aValue, bValue);
          if (result !== 0) return direction === 'desc' ? -result : result;
          continue;
        }

        // Default comparison
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          // Convert to strings for comparison
          comparison = String(aValue).localeCompare(String(bValue));
        }

        if (comparison !== 0) {
          return direction === 'desc' ? -comparison : comparison;
        }
      }

      // If all sorts are equal, maintain stable sort if requested
      return stable ? 0 : 0;
    });
  }

  // Natural sorting for alphanumeric strings
  naturalSort(a: string, b: string): number {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  }

  // Semantic versioning sort
  semverSort(a: string, b: string): number {
    const parseVersion = (v: string) => v.split('.').map(n => parseInt(n, 10));
    const aParts = parseVersion(a);
    const bParts = parseVersion(b);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  // Priority-based sorting (handles multiple sort criteria)
  prioritySort<T>(
    data: T[],
    priorities: Array<{
      field: string;
      direction: 'asc' | 'desc';
      weight: number;
    }>
  ): T[] {
    return [...data].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      for (const priority of priorities) {
        const aValue = (a as any)[priority.field];
        const bValue = (b as any)[priority.field];

        if (aValue == null && bValue == null) continue;
        if (aValue == null) scoreA -= priority.weight;
        if (bValue == null) scoreB -= priority.weight;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const diff = aValue - bValue;
          scoreA += diff * (priority.direction === 'asc' ? 1 : -1) * priority.weight;
          scoreB += -diff * (priority.direction === 'asc' ? 1 : -1) * priority.weight;
        }
      }

      return scoreB - scoreA;
    });
  }
}

// Export singleton instances
export const advancedSearch = new AdvancedSearchService();
export const filterBuilder = new FilterBuilderService();
export const advancedSort = new AdvancedSortService();

// React hooks for easy integration
export const useAdvancedSearch = () => {
  return React.useMemo(() => ({
    fuzzySearch: advancedSearch.fuzzySearch.bind(advancedSearch),
    fullTextSearch: advancedSearch.fullTextSearch.bind(advancedSearch),
    semanticSearch: advancedSearch.semanticSearch.bind(advancedSearch),
    hybridSearch: advancedSearch.hybridSearch.bind(advancedSearch),
    clearCache: advancedSearch.clearCache.bind(advancedSearch)
  }), []);
};

export const useFilterBuilder = () => {
  return React.useMemo(() => ({
    buildQuery: filterBuilder.buildQuery.bind(filterBuilder),
    validateFilter: filterBuilder.validateFilter.bind(filterBuilder),
    exportAsSQL: filterBuilder.exportAsSQL.bind(filterBuilder)
  }), []);
};

export const useAdvancedSort = () => {
  return React.useMemo(() => ({
    sort: advancedSort.sort.bind(advancedSort),
    naturalSort: advancedSort.naturalSort.bind(advancedSort),
    semverSort: advancedSort.semverSort.bind(advancedSort),
    prioritySort: advancedSort.prioritySort.bind(advancedSort)
  }), []);
};
