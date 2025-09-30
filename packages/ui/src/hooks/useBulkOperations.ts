import { useState, useCallback } from 'react';

export interface BulkOperationsConfig {
  onDelete?: (ids: string[]) => Promise<void>;
  onUpdate?: (ids: string[], updates: any) => Promise<void>;
  onExport?: (ids: string[], format: 'csv' | 'json') => Promise<void>;
}

export function useBulkOperations(config: BulkOperationsConfig) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const bulkDelete = useCallback(async () => {
    if (!config.onDelete || selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      await config.onDelete(selectedIds);
      clearSelection();
    } finally {
      setIsProcessing(false);
    }
  }, [config, selectedIds, clearSelection]);

  const bulkUpdate = useCallback(async (updates: any) => {
    if (!config.onUpdate || selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      await config.onUpdate(selectedIds, updates);
      clearSelection();
    } finally {
      setIsProcessing(false);
    }
  }, [config, selectedIds, clearSelection]);

  const bulkExport = useCallback(async (format: 'csv' | 'json') => {
    if (!config.onExport || selectedIds.length === 0) return;
    
    setIsProcessing(true);
    try {
      await config.onExport(selectedIds, format);
    } finally {
      setIsProcessing(false);
    }
  }, [config, selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.length,
    isProcessing,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    bulkUpdate,
    bulkExport,
  };
}
