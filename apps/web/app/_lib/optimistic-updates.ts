/**
 * Universal Optimistic Updates System
 * Provides optimistic UI updates for all modules
 */

import { useState, useCallback } from 'react';

export interface OptimisticState<T> {
  data: T[];
  isOptimistic: boolean;
  pendingOperations: Map<string, 'create' | 'update' | 'delete'>;
}

export interface OptimisticOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdates<T extends { id: string }>(
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingOperations, setPendingOperations] = useState<Map<string, 'create' | 'update' | 'delete'>(new Map());

  /**
   * Optimistically create an item
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optimisticCreate = useCallback(
    async (
      newItem: T,
      apiCall: () => Promise<T>,
      options: OptimisticOptions = {}
    ): Promise<T | null> => {
      // Add optimistic item immediately
      setData(prev => [newItem, ...prev]);
      setPendingOperations(prev => new Map(prev).set(newItem.id, 'create'));

      try {
        // Make actual API call
        const result = await apiCall();
        
        // Replace optimistic item with real data
        setData(prev => prev.map(item => item.id === newItem.id ? result : item));
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(newItem.id);
          return next;
        });
        
        options.onSuccess?.();
        return result;
      } catch (error) {
        // Rollback on error
        setData(prev => prev.filter(item => item.id !== newItem.id));
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(newItem.id);
          return next;
        });
        
        options.onError?.(error as Error);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /**
   * Optimistically update an item
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optimisticUpdate = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      apiCall: () => Promise<T>,
      options: OptimisticOptions = {}
    ): Promise<T | null> => {
      // Store original for rollback
      const original = data.find(item => item.id === id);
      if (!original) return null;

      // Apply optimistic update immediately
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      setPendingOperations(prev => new Map(prev).set(id, 'update'));

      try {
        // Make actual API call
        const result = await apiCall();
        
        // Replace with real data
        setData(prev => prev.map(item => item.id === id ? result : item));
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        
        options.onSuccess?.();
        return result;
      } catch (error) {
        // Rollback on error
        setData(prev => prev.map(item => item.id === id ? original : item));
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        
        options.onError?.(error as Error);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  /**
   * Optimistically delete an item
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const optimisticDelete = useCallback(
    async (
      id: string,
      apiCall: () => Promise<void>,
      options: OptimisticOptions = {}
    ): Promise<boolean> => {
      // Store original for rollback
      const original = data.find(item => item.id === id);
      if (!original) return false;

      // Remove optimistically
      setData(prev => prev.filter(item => item.id !== id));
      setPendingOperations(prev => new Map(prev).set(id, 'delete'));

      try {
        // Make actual API call
        await apiCall();
        
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        
        options.onSuccess?.();
        return true;
      } catch (error) {
        // Rollback on error
        setData(prev => [...prev, original]);
        setPendingOperations(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        
        options.onError?.(error as Error);
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  /**
   * Check if an item has pending operations
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isPending = useCallback(
    (id: string): boolean => {
      return pendingOperations.has(id);
    },
    [pendingOperations]
  );

  /**
   * Get pending operation type for an item
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPendingOperation = useCallback(
    (id: string): 'create' | 'update' | 'delete' | null => {
      return pendingOperations.get(id) || null;
    },
    [pendingOperations]
  );

  return {
    data,
    setData,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    isPending,
    getPendingOperation,
    hasPendingOperations: pendingOperations.size > 0
  };
}

/**
 * Helper to create optimistic ID
 */
export function createOptimisticId(): string {
  return `optimistic_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
