'use client';

import { useState, useCallback, useTransition } from 'react';

export interface OptimisticUpdateConfig<T> {
  data: T[];
  onUpdate: (updates: T[]) => Promise<void>;
}

export function useOptimisticUpdate<T extends { id: string }>(
  config: OptimisticUpdateConfig<T>
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(config.data);
  const [isPending, startTransition] = useTransition();

  const optimisticCreate = useCallback(async (item: T) => {
    // Immediately update UI
    setOptimisticData(prev => [item, ...prev]);
    
    // Sync with server
    startTransition(async () => {
      try {
        await config.onUpdate([item, ...config.data]);
      } catch (error) {
        // Rollback on error
        setOptimisticData(config.data);
        throw error;
      }
    });
  }, [config]);

  const optimisticUpdate = useCallback(async (id: string, updates: Partial<T>) => {
    // Immediately update UI
    setOptimisticData(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
    
    // Sync with server
    startTransition(async () => {
      try {
        const updated = config.data.map(item =>
          item.id === id ? { ...item, ...updates } : item
        );
        await config.onUpdate(updated);
      } catch (error) {
        // Rollback on error
        setOptimisticData(config.data);
        throw error;
      }
    });
  }, [config]);

  const optimisticDelete = useCallback(async (id: string) => {
    // Immediately update UI
    setOptimisticData(prev => prev.filter(item => item.id !== id));
    
    // Sync with server
    startTransition(async () => {
      try {
        const filtered = config.data.filter(item => item.id !== id);
        await config.onUpdate(filtered);
      } catch (error) {
        // Rollback on error
        setOptimisticData(config.data);
        throw error;
      }
    });
  }, [config]);

  return {
    data: optimisticData,
    isPending,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
  };
}
