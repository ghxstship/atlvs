'use client';

// Offline Manager Hook - Handles offline functionality and sync
// Integrates with Service Worker for offline-first architecture

import { useState, useEffect, useCallback } from 'react';

// Type declarations for Background Sync API
declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    };
  }
}

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingRequests: number;
  lastSyncTime: number | null;
}

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  timestamp: number;
}

export function useOfflineManager() {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingRequests: 0,
    lastSyncTime: null
  });

  // Register service worker and set up message handling
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered:', registration);

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      }).catch(error => {
        console.error('Service Worker registration failed:', error);
      });
    }

    // Handle online/offline events
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when coming back online
      triggerSync();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // Handle messages from service worker
  const handleServiceWorkerMessage = useCallback((event: MessageEvent) => {
    const { type, ...data } = event.data;

    switch (type) {
      case 'SYNC_COMPLETE':
        setState(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: data.timestamp,
          pendingRequests: 0 // Reset count after sync
        }));
        break;

      case 'SYNC_SUCCESS':
        // Update pending requests count
        updatePendingRequestsCount();
        break;

      case 'SYNC_FAILED':
        console.warn('Sync failed for request:', data);
        break;

      default:
        break;
    }
  }, []);

  // Update pending requests count from IndexedDB
  const updatePendingRequestsCount = useCallback(async () => {
    try {
      const count = await getPendingRequestsCount();
      setState(prev => ({ ...prev, pendingRequests: count }));
    } catch (error) {
      console.error('Failed to get pending requests count:', error);
    }
  }, []);

  // Get pending requests count from IndexedDB
  const getPendingRequestsCount = async (): Promise<number> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ghxstship-offline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const countRequest = store.count();

        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => resolve(0);
      };

      request.onerror = () => resolve(0);
    });
  };

  // Trigger manual sync
  const triggerSync = useCallback(async () => {
    if (!state.isOnline) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Request background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-data');
      } else {
        // Fallback: manually trigger sync via message
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'SYNC_QUEUE' });
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [state.isOnline]);

  // Get queued requests for display
  const getQueuedRequests = useCallback(async (): Promise<QueuedRequest[]> => {
    return new Promise((resolve) => {
      const request = indexedDB.open('ghxstship-offline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const index = store.index('timestamp');
        const getRequest = index.getAll();

        getRequest.onsuccess = () => {
          const requests = getRequest.result.map(item => ({
            id: item.id,
            url: item.url,
            method: item.method,
            timestamp: item.timestamp
          }));
          resolve(requests);
        };

        getRequest.onerror = () => resolve([]);
      };

      request.onerror = () => resolve([]);
    });
  }, []);

  // Clear all queued requests (admin function)
  const clearQueuedRequests = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('ghxstship-offline', 1);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          setState(prev => ({ ...prev, pendingRequests: 0 }));
          resolve();
        };

        clearRequest.onerror = () => reject(clearRequest.error);
      };

      request.onerror = () => reject(request.error);
    });
  }, []);

  // Update pending requests count on mount
  useEffect(() => {
    updatePendingRequestsCount();
  }, [updatePendingRequestsCount]);

  return {
    ...state,
    triggerSync,
    getQueuedRequests,
    clearQueuedRequests,
    updatePendingRequestsCount
  };
}

// Hook for optimistic updates with offline support
export function useOptimisticUpdate() {
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  const addOptimisticUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => new Set(prev).add(id));
  }, []);

  const removeOptimisticUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const isOptimisticUpdate = useCallback((id: string) => {
    return pendingUpdates.has(id);
  }, [pendingUpdates]);

  return {
    addOptimisticUpdate,
    removeOptimisticUpdate,
    isOptimisticUpdate,
    pendingUpdatesCount: pendingUpdates.size
  };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
