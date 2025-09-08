/**
 * Supabase Data Provider for ATLVS DataViews
 * Connects all DataViews components to real Supabase operations with enterprise features
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupabaseDataService, createDataService, type DataServiceConfig } from '@ghxstship/application/lib/supabase/data-service';
import type { DataRecord, FilterConfig, SortConfig, DataViewConfig } from '../types';

interface SupabaseDataContextValue {
  data: DataRecord[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  
  // CRUD Operations
  createRecord: (record: Partial<DataRecord>) => Promise<DataRecord>;
  updateRecord: (id: string, updates: Partial<DataRecord>) => Promise<DataRecord>;
  deleteRecord: (id: string) => Promise<void>;
  
  // Bulk Operations
  bulkCreate: (records: Partial<DataRecord>[]) => Promise<DataRecord[]>;
  bulkUpdate: (updates: { id: string; data: Partial<DataRecord> }[]) => Promise<DataRecord[]>;
  bulkDelete: (ids: string[]) => Promise<void>;
  
  // Query Operations
  search: (query: string) => Promise<void>;
  filter: (filters: FilterConfig[]) => Promise<void>;
  sort: (sorts: SortConfig[]) => Promise<void>;
  refresh: () => Promise<void>;
  
  // Import/Export
  exportData: (format: 'csv' | 'json' | 'xlsx') => Promise<Blob>;
  importData: (data: any[]) => Promise<{ success: DataRecord[]; errors: any[] }>;
  
  // Record Details
  getRecordComments: (recordId: string) => Promise<any[]>;
  addComment: (recordId: string, content: string) => Promise<any>;
  getRecordActivity: (recordId: string) => Promise<any[]>;
  getRecordFiles: (recordId: string) => Promise<any[]>;
  
  // State Management
  currentFilters: FilterConfig[];
  currentSorts: SortConfig[];
  currentSearch: string;
  
  // Optimistic Updates
  optimisticUpdate: (id: string, updates: Partial<DataRecord>) => void;
  revertOptimisticUpdate: (id: string) => void;
}

const SupabaseDataContext = createContext<SupabaseDataContextValue | null>(null);

interface SupabaseDataProviderProps {
  children: React.ReactNode;
  config: DataServiceConfig & {
    pageSize?: number;
    enableOptimistic?: boolean;
  };
}

export function SupabaseDataProvider({ children, config }: SupabaseDataProviderProps) {
  const [service] = useState(() => createDataService(config));
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Query state
  const [currentFilters, setCurrentFilters] = useState<FilterConfig[]>([]);
  const [currentSorts, setCurrentSorts] = useState<SortConfig[]>([]);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Optimistic updates state
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<DataRecord>>>(new Map());

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await service.fetchData({
        filters: currentFilters,
        sorts: currentSorts,
        search: currentSearch,
        page: currentPage,
        limit: config.pageSize || 50
      });
      
      setData(result);
      setTotalCount(result.length); // In real implementation, get total count from separate query
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [service, currentFilters, currentSorts, currentSearch, currentPage, config.pageSize]);

  // Setup realtime subscription
  useEffect(() => {
    const unsubscribe = service.subscribe((newData) => {
      setData(newData);
    });

    loadData();

    return unsubscribe;
  }, [service, loadData]);

  // Apply optimistic updates to data
  const dataWithOptimistic = React.useMemo(() => {
    if (optimisticUpdates.size === 0) return data;
    
    return data.map(record => {
      const optimisticUpdate = optimisticUpdates.get(record.id);
      return optimisticUpdate ? { ...record, ...optimisticUpdate } : record;
    });
  }, [data, optimisticUpdates]);

  // CRUD Operations with optimistic updates
  const createRecord = useCallback(async (record: Partial<DataRecord>): Promise<DataRecord> => {
    try {
      const newRecord = await service.createRecord(record);
      await loadData(); // Refresh data
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
      throw err;
    }
  }, [service, loadData]);

  const updateRecord = useCallback(async (id: string, updates: Partial<DataRecord>): Promise<DataRecord> => {
    try {
      // Apply optimistic update if enabled
      if (config.enableOptimistic) {
        setOptimisticUpdates(prev => new Map(prev).set(id, updates));
      }
      
      const updatedRecord = await service.updateRecord(id, updates);
      
      // Clear optimistic update and refresh
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      
      await loadData();
      return updatedRecord;
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      
      setError(err instanceof Error ? err.message : 'Failed to update record');
      throw err;
    }
  }, [service, loadData, config.enableOptimistic]);

  const deleteRecord = useCallback(async (id: string): Promise<void> => {
    try {
      await service.deleteRecord(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
      throw err;
    }
  }, [service, loadData]);

  // Bulk operations
  const bulkCreate = useCallback(async (records: Partial<DataRecord>[]): Promise<DataRecord[]> => {
    try {
      const newRecords = await service.bulkCreate(records);
      await loadData();
      return newRecords;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk create records');
      throw err;
    }
  }, [service, loadData]);

  const bulkUpdate = useCallback(async (updates: { id: string; data: Partial<DataRecord> }[]): Promise<DataRecord[]> => {
    try {
      const updatedRecords = await service.bulkUpdate(updates);
      await loadData();
      return updatedRecords;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update records');
      throw err;
    }
  }, [service, loadData]);

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    try {
      await service.bulkDelete(ids);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk delete records');
      throw err;
    }
  }, [service, loadData]);

  // Query operations
  const search = useCallback(async (query: string) => {
    setCurrentSearch(query);
    setCurrentPage(1);
  }, []);

  const filter = useCallback(async (filters: FilterConfig[]) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  const sort = useCallback(async (sorts: SortConfig[]) => {
    setCurrentSorts(sorts);
    setCurrentPage(1);
  }, []);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Import/Export
  const exportData = useCallback(async (format: 'csv' | 'json' | 'xlsx'): Promise<Blob> => {
    try {
      return await service.exportData(format, {
        filters: currentFilters,
        sorts: currentSorts,
        search: currentSearch
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, [service, currentFilters, currentSorts, currentSearch]);

  const importData = useCallback(async (data: any[]) => {
    try {
      const result = await service.importData(data);
      await loadData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      throw err;
    }
  }, [service, loadData]);

  // Record details
  const getRecordComments = useCallback(async (recordId: string) => {
    return await service.getRecordComments(recordId);
  }, [service]);

  const addComment = useCallback(async (recordId: string, content: string) => {
    return await service.addComment(recordId, content);
  }, [service]);

  const getRecordActivity = useCallback(async (recordId: string) => {
    return await service.getRecordActivity(recordId);
  }, [service]);

  const getRecordFiles = useCallback(async (recordId: string) => {
    return await service.getRecordFiles(recordId);
  }, [service]);

  // Optimistic update helpers
  const optimisticUpdate = useCallback((id: string, updates: Partial<DataRecord>) => {
    setOptimisticUpdates(prev => new Map(prev).set(id, updates));
  }, []);

  const revertOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const value: SupabaseDataContextValue = {
    data: dataWithOptimistic,
    loading,
    error,
    totalCount,
    
    createRecord,
    updateRecord,
    deleteRecord,
    
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    
    search,
    filter,
    sort,
    refresh,
    
    exportData,
    importData,
    
    getRecordComments,
    addComment,
    getRecordActivity,
    getRecordFiles,
    
    currentFilters,
    currentSorts,
    currentSearch,
    
    optimisticUpdate,
    revertOptimisticUpdate
  };

  return (
    <SupabaseDataContext.Provider value={value}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

export function useSupabaseData() {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
}

// Enhanced DataViewProvider that integrates with Supabase
interface EnhancedDataViewProviderProps {
  children: React.ReactNode;
  config: DataViewConfig & {
    supabaseConfig: DataServiceConfig;
    enableOptimistic?: boolean;
    pageSize?: number;
  };
}

export function EnhancedDataViewProvider({ children, config }: EnhancedDataViewProviderProps) {
  return (
    <SupabaseDataProvider 
      config={{
        ...config.supabaseConfig,
        enableOptimistic: config.enableOptimistic,
        pageSize: config.pageSize
      }}
    >
      <DataViewProviderWrapper config={config}>
        {children}
      </DataViewProviderWrapper>
    </SupabaseDataProvider>
  );
}

// Wrapper that connects Supabase data to DataViewProvider
function DataViewProviderWrapper({ children, config }: { children: React.ReactNode; config: DataViewConfig }) {
  const supabaseData = useSupabaseData();

  // Create enhanced config that uses Supabase operations
  const enhancedConfig: DataViewConfig = {
    ...config,
    data: supabaseData.data,
    onSearch: supabaseData.search,
    onFilter: supabaseData.filter,
    onSort: supabaseData.sort,
    onRefresh: supabaseData.refresh,
    onExport: supabaseData.exportData,
    onImport: supabaseData.importData
  };

  return (
    <DataViewProvider config={enhancedConfig}>
      {children}
    </DataViewProvider>
  );
}

// Import the original DataViewProvider
import { DataViewProvider } from '../DataViewProvider';

// Export EnhancedUniversalDrawer
export { default as EnhancedUniversalDrawer } from '../UniversalDrawer/EnhancedUniversalDrawer';
