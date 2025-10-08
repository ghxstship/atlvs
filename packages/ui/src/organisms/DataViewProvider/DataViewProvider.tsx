/**
 * DataViewProvider — ATLVS Data View Context Provider
 * Provides data view configuration and state management
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ViewType = 
  | 'table' 
  | 'card' 
  | 'list' 
  | 'kanban' 
  | 'calendar' 
  | 'gallery' 
  | 'timeline' 
  | 'chart' 
  | 'gantt' 
  | 'form';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'currency' | 'email' | 'url';
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  options?: Array<{ label: string; value: string }>;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DataViewConfig {
  fields: FieldConfig[];
  defaultView?: ViewType;
  availableViews?: ViewType[];
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableGrouping?: boolean;
  enableExport?: boolean;
}

export interface DataViewContextValue {
  config: DataViewConfig;
  currentView: ViewType;
  filters: FilterConfig[];
  sorts: SortConfig[];
  selectedIds: Set<string>;
  setCurrentView: (view: ViewType) => void;
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  addSort: (sort: SortConfig) => void;
  removeSort: (field: string) => void;
  clearSorts: () => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

const DataViewContext = createContext<DataViewContextValue | undefined>(undefined);

export interface DataViewProviderProps {
  config: DataViewConfig;
  children: ReactNode;
}

export function DataViewProvider({ config, children }: DataViewProviderProps) {
  const [currentView, setCurrentView] = useState<ViewType>(
    config.defaultView || config.availableViews?.[0] || 'table'
  );
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [sorts, setSorts] = useState<SortConfig[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.field === filter.field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        return updated;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const addSort = useCallback((sort: SortConfig) => {
    setSorts(prev => {
      const existing = prev.findIndex(s => s.field === sort.field);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = sort;
        return updated;
      }
      return [...prev, sort];
    });
  }, []);

  const removeSort = useCallback((field: string) => {
    setSorts(prev => prev.filter(s => s.field !== field));
  }, []);

  const clearSorts = useCallback(() => {
    setSorts([]);
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const value: DataViewContextValue = {
    config,
    currentView,
    filters,
    sorts,
    selectedIds,
    setCurrentView,
    addFilter,
    removeFilter,
    clearFilters,
    addSort,
    removeSort,
    clearSorts,
    toggleSelection,
    selectAll,
    clearSelection,
  };

  return (
    <DataViewContext.Provider value={value}>
      {children}
    </DataViewContext.Provider>
  );
}

export function useDataView() {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error('useDataView must be used within a DataViewProvider');
  }
  return context;
}
