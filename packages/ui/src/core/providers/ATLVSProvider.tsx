'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UnifiedService } from '../../unified/services/UnifiedService';
import type { FieldConfig } from '../../unified/drawers/UnifiedDrawer';
import type { ViewType } from '../../config/types';

export interface ATLVSConfig {
  entity: string;
  service: UnifiedService<any>;
  fields?: FieldConfig[];
  views?: ViewType[];
  filters?: any[];
  actions?: {
    create?: () => void;
    edit?: (data: any) => void;
    view?: (data: any) => void;
    delete?: (id: string) => void | Promise<void>;
    bulk?: (action: string, ids: string[]) => void | Promise<void>;
  };
  customActions?: any[];
  emptyState?: any;
}

interface ATLVSContextValue {
  config: ATLVSConfig;
  data: any[];
  loading: boolean;
  error: string | null;
  selectedIds: string[];
  viewMode: ViewType;
  filters: Record<string, any>;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  searchQuery: string;
  page: number;
  pageSize: number;
  total: number;
  
  // Actions
  setData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setViewMode: (mode: ViewType) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Operations
  loadData: () => Promise<void>;
  refresh: () => Promise<void>;
  handleCreate: () => void;
  handleEdit: (item: any) => void;
  handleView: (item: any) => void;
  handleDelete: (id: string) => Promise<void>;
  handleBulkAction: (action: string) => Promise<void>;
  handleExport: (format: 'csv' | 'json' | 'xlsx') => Promise<void>;
}

const ATLVSContext = createContext<ATLVSContextValue | null>(null);

export const useATLVS = () => {
  const context = useContext(ATLVSContext);
  if (!context) {
    throw new Error('useATLVS must be used within ATLVSProvider');
  }
  return context;
};

export const ATLVSProvider: React.FC<{
  config: ATLVSConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewType>(config.views?.[0] || 'grid');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Load data when filters, sort, search, or pagination changes
  useEffect(() => {
    loadData();
  }, [filters, sortConfig, searchQuery, page, pageSize]);

  // Set up real-time subscription if service supports it
  useEffect(() => {
    if (!config.service) return;

    const subscription = config.service.subscribe((payload) => {
      // Handle real-time updates
      if (payload.eventType === 'INSERT' && payload.new) {
        setData(prev => [payload.new, ...prev]);
        setTotal(prev => prev + 1);
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setData(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setData(prev => prev.filter(item => item.id !== payload.old.id));
        setTotal(prev => prev - 1);
      }
    }, filters);

    return () => {
      subscription?.unsubscribe();
    };
  }, [config.service, filters]);

  const loadData = async () => {
    if (!config.service) return;

    setLoading(true);
    setError(null);
    
    try {
      const orderBy = sortConfig 
        ? `${sortConfig.key}.${sortConfig.direction}`
        : undefined;

      const result = await config.service.list({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        filters,
        orderBy
      });

      setData(result.data);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await loadData();
  };

  const handleCreate = () => {
    config.actions?.create?.();
  };

  const handleEdit = (item: any) => {
    config.actions?.edit?.(item);
  };

  const handleView = (item: any) => {
    config.actions?.view?.(item);
  };

  const handleDelete = async (id: string) => {
    if (!config.actions?.delete) return;
    
    try {
      await config.actions.delete(id);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!config.actions?.bulk || selectedIds.length === 0) return;
    
    try {
      await config.actions.bulk(action, selectedIds);
      setSelectedIds([]);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Bulk action failed');
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    // Export implementation
    const exportData = selectedIds.length > 0
      ? data.filter(item => selectedIds.includes(item.id))
      : data;

    switch (format) {
      case 'json':
        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, `${config.entity}-export.json`, 'application/json');
        break;
      
      case 'csv':
        const csv = convertToCSV(exportData);
        downloadFile(csv, `${config.entity}-export.csv`, 'text/csv');
        break;
      
      case 'xlsx':
        // Would need a library like xlsx for Excel export
        console.log('Excel export not yet implemented');
        break;
    }
  };

  const value = useMemo(() => ({
    config,
    data,
    loading,
    error,
    selectedIds,
    viewMode,
    filters,
    sortConfig,
    searchQuery,
    page,
    pageSize,
    total,
    setData,
    setLoading,
    setError,
    setSelectedIds,
    setViewMode,
    setFilters,
    setSortConfig,
    setSearchQuery,
    setPage,
    setPageSize,
    loadData,
    refresh,
    handleCreate,
    handleEdit,
    handleView,
    handleDelete,
    handleBulkAction,
    handleExport,
  }), [
    config,
    data,
    loading,
    error,
    selectedIds,
    viewMode,
    filters,
    sortConfig,
    searchQuery,
    page,
    pageSize,
    total,
  ]);

  return (
    <ATLVSContext.Provider value={value}>
      {children}
    </ATLVSContext.Provider>
  );
};

// Helper functions
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value || '').replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

export default ATLVSProvider;
