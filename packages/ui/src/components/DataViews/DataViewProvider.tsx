'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ViewType, FilterConfig, SortConfig, GroupConfig, SavedView, ViewState } from './types';

interface DataViewContextType {
  // Configuration and state
  config: DataViewConfig;
  state: ViewState;
  
  // Actions object containing all data operations
  actions: {
    // View state
    setCurrentView: (view: ViewType) => void;
    
    // Data operations
    setSearch: (search: string) => void;
    setFilters: (filters: FilterConfig[]) => void;
    setSorts: (sorts: SortConfig[]) => void;
    setGroups: (groups: GroupConfig[]) => void;
    
    // Selection
    setSelectedRecords: (records: string[]) => void;
    clearSelection: () => void;
    
    // Pagination
    setPagination: (pagination: { page: number; pageSize: number; total: number }) => void;
    
    // View management
    resetView: () => void;
    saveView: (name: string, description?: string) => void;
    loadView: (viewId: string) => void;
    
    // Data actions
    refreshData: () => void;
    exportData: (format: 'csv' | 'excel' | 'json') => void;
    importData: (data: any[]) => void;
  };
  
  // Convenience properties for direct access
  currentView: ViewType;
  search: string;
  filters: FilterConfig[];
  sorts: SortConfig[];
  groups: GroupConfig[];
  selectedRecords: string[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  savedViews: SavedView[];
}

const DataViewContext = createContext<DataViewContextType | null>(null);

type DataViewAction =
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_VIEW_TYPE'; payload: ViewType }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterConfig[] }
  | { type: 'SET_SORTS'; payload: SortConfig[] }
  | { type: 'SET_GROUPS'; payload: GroupConfig[] }
  | { type: 'SET_PAGINATION'; payload: { page: number; pageSize?: number } }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET_VIEW'; payload: ViewState }
  | { type: 'LOAD_VIEW'; payload: Partial<ViewState> };

function dataViewReducer(state: ViewState, action: DataViewAction): ViewState {
  switch (action.type) {
    case 'SET_VIEW_TYPE':
      return { ...state, type: action.payload };
    
    case 'SET_SEARCH':
      return { ...state, search: action.payload, pagination: { ...state.pagination, page: 1 } };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, pagination: { ...state.pagination, page: 1 } };
    
    case 'SET_SORTS':
      return { ...state, sorts: action.payload };
    
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          ...(action.payload.pageSize && { pageSize: action.payload.pageSize }),
        },
      };
    
    case 'SET_SELECTION':
      return { ...state, selection: action.payload };
    
    case 'TOGGLE_SELECTION':
      const isSelected = state.selection.includes(action.payload);
      return {
        ...state,
        selection: isSelected
          ? state.selection.filter(id => id !== action.payload)
          : [...state.selection, action.payload],
      };
    
    case 'SELECT_ALL':
      return { ...state, selection: action.payload };
    
    case 'CLEAR_SELECTION':
      return { ...state, selection: [] };
    
    case 'RESET_VIEW':
      return action.payload;
    
    case 'LOAD_VIEW':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

function createInitialState(config: DataViewConfig): ViewState {
  const initialState: ViewState = {
    loading: false,
    error: null,
    data: [],
    totalCount: 0,
    type: config.defaultView || 'grid',
    fields: config.fields,
    filters: [],
    sorts: [],
    groups: [],
    search: '',
    pagination: { page: 1, pageSize: 25, total: 0 },
    selection: [],
    customConfig: {},
  };
  return initialState;
}

interface DataViewProviderProps {
  config: DataViewConfig;
  children: React.ReactNode;
}

export function DataViewProvider({ config, children }: DataViewProviderProps) {
  const [state, dispatch] = useReducer(dataViewReducer, createInitialState(config));

  // Update pagination total when data changes
  useEffect(() => {
    if (config.data) {
      dispatch({
        type: 'SET_PAGINATION',
        payload: { 
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
        },
      });
    }
  }, [config.data?.length, state.pagination.page, state.pagination.pageSize]);

  const actions = {
    setCurrentView: useCallback((view: ViewType) => {
      dispatch({ type: 'SET_VIEW_TYPE', payload: view });
    }, []),

    setSearch: useCallback((search: string) => {
      dispatch({ type: 'SET_SEARCH', payload: search });
      config.onSearch?.(search);
    }, [config]),

    setFilters: useCallback((filters: FilterConfig[]) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
      config.onFilter?.(filters);
    }, [config]),

    setSorts: useCallback((sorts: SortConfig[]) => {
      dispatch({ type: 'SET_SORTS', payload: sorts });
      config.onSort?.(sorts);
    }, [config]),

    setGroups: useCallback((groups: GroupConfig[]) => {
      dispatch({ type: 'SET_GROUPS', payload: groups });
      config.onGroup?.(groups);
    }, [config]),

    setPagination: useCallback((pagination: { page: number; pageSize: number; total: number }) => {
      dispatch({ type: 'SET_PAGINATION', payload: pagination });
      config.onPaginate?.(pagination.page, pagination.pageSize);
    }, [config]),

    setSelectedRecords: useCallback((records: string[]) => {
      dispatch({ type: 'SET_SELECTION', payload: records });
    }, []),

    toggleSelection: useCallback((id: string) => {
      dispatch({ type: 'TOGGLE_SELECTION', payload: id });
    }, []),

    selectAll: useCallback(() => {
      const allIds = (config.data || []).map(record => record.id);
      dispatch({ type: 'SELECT_ALL', payload: allIds });
    }, [config.data]),

    clearSelection: useCallback(() => {
      dispatch({ type: 'CLEAR_SELECTION' });
    }, []),

    resetView: useCallback(() => {
      const initialState = createInitialState(config);
      dispatch({ type: 'RESET_VIEW', payload: initialState });
    }, [config]),

    saveView: useCallback((name: string, description?: string) => {
      if (config.onSaveView) {
        config.onSaveView({
          name,
          description,
          type: state.type,
          state: {
            filters: state.filters,
            sorts: state.sorts,
            groups: state.groups,
            fields: state.fields,
            customConfig: state.customConfig,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }, [config, state]),

    loadView: useCallback((viewId: string) => {
      const savedView = config.savedViews?.find(view => view.id === viewId);
      if (savedView) {
        dispatch({ type: 'LOAD_VIEW', payload: savedView.state });
        config.onLoadView?.(viewId);
      }
    }, [config]),

    refreshData: useCallback(() => {
      config.onRefresh?.();
    }, [config]),

    exportData: useCallback((format: 'csv' | 'excel' | 'json') => {
      // Export functionality would be implemented here
      console.log('Exporting data in format:', format);
    }, []),

    importData: useCallback((data: any[]) => {
      config.onImport?.(data);
    }, [config]),
  };

  const contextValue: DataViewContextType = {
    state,
    config,
    actions,
    
    // Convenience properties for direct access
    currentView: state.type,
    search: state.search,
    filters: state.filters,
    sorts: state.sorts,
    groups: state.groups,
    selectedRecords: state.selection,
    pagination: state.pagination,
    savedViews: config.savedViews || [],
  };

  return (
    <DataViewContext.Provider value={contextValue}>
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
