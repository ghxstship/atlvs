'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Note: Avoid importing Supabase types to keep UI package dependency-free
// type SupabaseClient = any;
import { Button } from '../Button';
import { Input } from '../Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select';
import { Badge } from '../Badge';
import { 
  Search, 
  Filter, 
  X, 
  Plus, 
  Save, 
  History,
  Zap,
  Database,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { FilterConfig, FieldConfig, SortConfig } from './types';

interface AdvancedSearchSystemProps {
  tableName: string;
  supabase: any;
  fields: FieldConfig[];
  onSearch: (query: string, filters: FilterConfig[], sorts: SortConfig[]) => void;
  onSaveSearch: (search: SavedSearch) => void;
  savedSearches?: SavedSearch[];
  className?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterConfig[];
  sorts: SortConfig[];
  createdAt: Date;
  isShared?: boolean;
}

interface QueryBuilder {
  conditions: QueryCondition[];
  logic: 'AND' | 'OR';
}

interface QueryCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  dataType: string;
}

type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains' 
  | 'starts_with' | 'ends_with'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in'
  | 'between' | 'not_between'
  | 'is_null' | 'is_not_null'
  | 'regex' | 'full_text_search';

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'Equals',
  not_equals: 'Not Equals',
  contains: 'Contains',
  not_contains: 'Does Not Contain',
  starts_with: 'Starts With',
  ends_with: 'Ends With',
  gt: 'Greater Than',
  gte: 'Greater Than or Equal',
  lt: 'Less Than',
  lte: 'Less Than or Equal',
  in: 'In List',
  not_in: 'Not In List',
  between: 'Between',
  not_between: 'Not Between',
  is_null: 'Is Empty',
  is_not_null: 'Is Not Empty',
  regex: 'Matches Pattern',
  full_text_search: 'Full Text Search'
};

const FIELD_TYPE_OPERATORS: Record<string, FilterOperator[]> = {
  text: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'in', 'not_in', 'is_null', 'is_not_null', 'regex', 'full_text_search'],
  number: ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between', 'not_between', 'in', 'not_in', 'is_null', 'is_not_null'],
  date: ['equals', 'not_equals', 'gt', 'gte', 'lt', 'lte', 'between', 'not_between', 'is_null', 'is_not_null'],
  boolean: ['equals', 'not_equals', 'is_null', 'is_not_null'],
  select: ['equals', 'not_equals', 'in', 'not_in', 'is_null', 'is_not_null'],
  array: ['contains', 'not_contains', 'in', 'not_in', 'is_null', 'is_not_null']
};

export function AdvancedSearchSystem({
  tableName,
  supabase,
  fields,
  onSearch,
  onSaveSearch,
  savedSearches = [],
  className = ''
}: AdvancedSearchSystemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [queryBuilder, setQueryBuilder] = useState<QueryBuilder>({
    conditions: [],
    logic: 'AND'
  });
  const [sorts, setSorts] = useState<SortConfig[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem(`search_history_${tableName}`);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, [tableName]);

  // Generate search suggestions based on field values
  const generateSearchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      // Get unique values from text fields for suggestions
      const textFields = fields.filter(f => f.type === 'text' || f.type === 'select');
      const suggestions: string[] = [];

      for (const field of textFields.slice(0, 3)) { // Limit to 3 fields for performance
        const { data } = await supabase
          .from(tableName)
          .select(field.key)
          .ilike(field.key, `%${query}%`)
          .limit(5);

        if (data) {
          data.forEach((row: any) => {
            const value = row[field.key as any];
            if (value && typeof value === 'string' && !suggestions.includes(value)) {
              suggestions.push(value);
            }
          });
        }
      }

      setSearchSuggestions(suggestions.slice(0, 10));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  }, [fields, tableName, supabase]);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSearchSuggestions(globalQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [globalQuery, generateSearchSuggestions]);

  // Add condition to query builder
  const addCondition = useCallback(() => {
    const newCondition: QueryCondition = {
      id: `condition_${Date.now()}`,
      field: fields[0]?.key || '',
      operator: 'equals',
      value: '',
      dataType: fields[0]?.type || 'text'
    };

    setQueryBuilder(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  }, [fields]);

  // Update condition
  const updateCondition = useCallback((id: string, updates: Partial<QueryCondition>) => {
    setQueryBuilder(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  }, []);

  // Remove condition
  const removeCondition = useCallback((id: string) => {
    setQueryBuilder(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  }, []);

  // Convert query builder to Supabase filters
  const buildSupabaseQuery = useCallback(() => {
    const filters: FilterConfig[] = [];

    queryBuilder.conditions.forEach(condition => {
      if (condition.field && condition.value !== '' && condition.value !== null) {
        filters.push({
          field: condition.field,
          operator: condition.operator as any,
          value: condition.value
        });
      }
    });

    return filters;
  }, [queryBuilder]);

  // Execute search
  const executeSearch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      const filters = buildSupabaseQuery();
      
      // Add to search history
      if (globalQuery && !searchHistory.includes(globalQuery)) {
        const newHistory = [globalQuery, ...searchHistory.slice(0, 9)];
        setSearchHistory(newHistory);
        localStorage.setItem(`search_history_${tableName}`, JSON.stringify(newHistory));
      }

      onSearch(globalQuery, filters, sorts);
    } catch (error) {
      console.error('Search execution failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [globalQuery, buildSupabaseQuery, sorts, searchHistory, tableName, onSearch]);

  // Save search
  const handleSaveSearch = useCallback(() => {
    if (!saveSearchName.trim()) return;

    const savedSearch: SavedSearch = {
      id: `search_${Date.now()}`,
      name: saveSearchName,
      query: globalQuery,
      filters: buildSupabaseQuery(),
      sorts,
      createdAt: new Date()
    };

    onSaveSearch(savedSearch);
    setShowSaveDialog(false);
    setSaveSearchName('');
  }, [saveSearchName, globalQuery, buildSupabaseQuery, sorts, onSaveSearch]);

  // Load saved search
  const loadSavedSearch = useCallback((search: SavedSearch) => {
    setGlobalQuery(search.query);
    setSorts(search.sorts);
    
    // Convert filters back to query builder conditions
    const conditions: QueryCondition[] = search.filters.map((filter, index) => ({
      id: `condition_${Date.now()}_${index}`,
      field: filter.field,
      operator: filter.operator as FilterOperator,
      value: filter.value,
      dataType: fields.find(f => f.key === filter.field)?.type || 'text'
    }));

    setQueryBuilder(prev => ({ ...prev, conditions }));
    executeSearch();
  }, [fields, executeSearch]);

  // Render condition value input
  const renderValueInput = useCallback((condition: QueryCondition) => {
    const field = fields.find(f => f.key === condition.field);
    
    if (condition.operator === 'is_null' || condition.operator === 'is_not_null') {
      return null;
    }

    switch (field?.type) {
      case 'select':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(condition.id, { value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter number..."
            className="w-32"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            className="w-40"
          />
        );

      case 'boolean':
        return (
          <Select
            value={String(!!condition.value)}
            onValueChange={(value) => updateCondition(condition.id, { value: value === 'true' })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter value..."
            className="w-48"
          />
        );
    }
  }, [fields, updateCondition]);

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Global Search Bar */}
      <div className="p-md border-b border-border">
        <div className="flex items-center gap-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search across all fields with AI-powered suggestions..."
              className="pl-2xl pr-md"
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            />
            
            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md mt-xs shadow-lg z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-sm py-sm hover:bg-muted/50 text-sm"
                    onClick={() => setGlobalQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={executeSearch}
            disabled={isSearching}
            className="px-lg"
          >
            {isSearching ? (
              <Database className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4" />
            Advanced
            {isExpanded ? <ChevronDown className="h-4 w-4 ml-xs" /> : <ChevronRight className="h-4 w-4 ml-xs" />}
          </Button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-sm flex items-center gap-sm">
            <History className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-xs">
              {searchHistory.slice(0, 5).map((query, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer text-xs"
                  onClick={() => setGlobalQuery(query)}
                >
                  {query}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Search Panel */}
      {isExpanded && (
        <div className="p-md space-y-md">
          {/* Query Builder */}
          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Advanced Filters</h3>
              <div className="flex items-center gap-sm">
                <Select
                  value={queryBuilder.logic}
                  onValueChange={(value) => setQueryBuilder(prev => ({ ...prev, logic: value as 'AND' | 'OR' }))}
                >
                  <option value="AND">Match All (AND)</option>
                  <option value="OR">Match Any (OR)</option>
                </Select>
                <Button size="sm" onClick={addCondition}>
                  <Plus className="h-3 w-3" />
                  Add Filter
                </Button>
              </div>
            </div>

            {queryBuilder.conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-sm p-sm bg-muted rounded-md">
                {index > 0 && (
                  <span className="text-xs font-medium text-muted-foreground px-sm">
                    {queryBuilder.logic}
                  </span>
                )}

                <Select
                  value={condition.field}
                  onValueChange={(field) => {
                    const fieldConfig = fields.find(f => f.key === field);
                    updateCondition(condition.id, { 
                      field, 
                      dataType: fieldConfig?.type || 'text',
                      operator: FIELD_TYPE_OPERATORS[fieldConfig?.type || 'text'][0]
                    });
                  }}
                >
                  {fields.map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(operator) => updateCondition(condition.id, { operator: operator as FilterOperator })}
                >
                  {FIELD_TYPE_OPERATORS[condition.dataType]?.map(op => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </Select>

                {renderValueInput(condition)}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCondition(condition.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="space-y-xs">
              <h3 className="text-sm font-medium">Saved Searches</h3>
              <div className="flex flex-wrap gap-sm">
                {savedSearches.map(search => (
                  <Badge
                    key={search.id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => loadSavedSearch(search)}
                  >
                    <Zap className="h-3 w-3 mr-xs" />
                    {search.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-sm border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!globalQuery && queryBuilder.conditions.length === 0}
            >
              <Save className="h-4 w-4 mr-xs" />
              Save Search
            </Button>

            <div className="flex items-center gap-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGlobalQuery('');
                  setQueryBuilder({ conditions: [], logic: 'AND' });
                  setSorts([]);
                }}
              >
                Clear All
              </Button>
              <Button onClick={executeSearch} disabled={isSearching}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-lg rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-md">Save Search</h3>
            <Input
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="mb-md"
            />
            <div className="flex justify-end gap-sm">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
