'use client';

/**
 * Offline Support Service
 * Provides offline-first capabilities with service worker and mutation queues
 */

import { useState, useEffect } from 'react';

interface OfflineQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface SyncState {
  isOnline: boolean;
  queueLength: number;
  lastSyncTime: number | null;
  pendingOperations: number;
}

/**
 * Service Worker Registration and Management
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

/**
 * Offline Queue Manager
 * Queues mutations when offline and syncs when back online
 */
export class OfflineQueueManager {
  private queue: OfflineQueueItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private listeners: ((state: SyncState) => void)[] = [];

  constructor() {
    this.loadQueueFromStorage();
    this.setupEventListeners();
  }

  /**
   * Add operation to queue
   */
  async addToQueue(
    operation: OfflineQueueItem['operation'],
    table: string,
    data: any,
    maxRetries = 3
  ): Promise<string> {
    const item: OfflineQueueItem = {
      id: `${operation}_${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
    };

    this.queue.push(item);
    await this.saveQueueToStorage();
    this.notifyListeners();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.sync();
    }

    return item.id;
  }

  /**
   * Force sync queue
   */
  async sync(): Promise<void> {
    if (this.syncInProgress || this.queue.length === 0 || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const itemsToProcess = [...this.queue];

      for (const item of itemsToProcess) {
        try {
          await this.processQueueItem(item);
          // Remove successful item
          this.queue = this.queue.filter(q => q.id !== item.id);
        } catch (error) {
          item.retries++;

          if (item.retries >= item.maxRetries) {
            console.error(`Max retries exceeded for ${item.id}, removing from queue`);
            this.queue = this.queue.filter(q => q.id !== item.id);
          }
        }
      }

      await this.saveQueueToStorage();
      this.notifyListeners();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    // This would integrate with your actual API services
    // For now, we'll simulate the operations
    console.log(`Processing ${item.operation} on ${item.table}:`, item.data);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // In real implementation, call the appropriate service method
    // e.g., await apiService[item.operation](item.table, item.data);
  }

  /**
   * Get current sync state
   */
  getSyncState(): SyncState {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      lastSyncTime: this.getLastSyncTime(),
      pendingOperations: this.queue.length,
    };
  }

  /**
   * Subscribe to sync state changes
   */
  subscribe(callback: (state: SyncState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Clear queue (dangerous - only for testing)
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueueToStorage();
    this.notifyListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.sync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    try {
      localStorage.setItem('offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }

  private getLastSyncTime(): number | null {
    // In a real implementation, track this properly
    return null;
  }

  private notifyListeners(): void {
    const state = this.getSyncState();
    this.listeners.forEach(listener => listener(state));
  }
}

/**
 * Cache Manager for offline data access
 */
export class OfflineCacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  /**
   * Cache data with TTL
   */
  set(key: string, data: any, ttlMs = 3600000): void { // 1 hour default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  /**
   * Get cached data if not expired
   */
  get<T = any>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Clear expired items
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Main Offline Support Service
 */
export class OfflineSupportService {
  private swManager = new ServiceWorkerManager();
  private queueManager = new OfflineQueueManager();
  private cacheManager = new OfflineCacheManager();

  async initialize(): Promise<void> {
    await this.swManager.register();

    // Set up periodic cache cleanup
    setInterval(() => {
      this.cacheManager.clearExpired();
    }, 300000); // Every 5 minutes
  }

  /**
   * Queue an operation for offline sync
   */
  async queueOperation(
    operation: OfflineQueueItem['operation'],
    table: string,
    data: any
  ): Promise<string> {
    return this.queueManager.addToQueue(operation, table, data);
  }

  /**
   * Get current offline/sync status
   */
  getStatus(): SyncState {
    return this.queueManager.getSyncState();
  }

  /**
   * Subscribe to status changes
   */
  subscribeToStatus(callback: (state: SyncState) => void): () => void {
    return this.queueManager.subscribe(callback);
  }

  /**
   * Cache data for offline access
   */
  cacheData(key: string, data: any, ttlMs?: number): void {
    this.cacheManager.set(key, data, ttlMs);
  }

  /**
   * Get cached data
   */
  getCachedData<T = any>(key: string): T | null {
    return this.cacheManager.get<T>(key);
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<void> {
    await this.queueManager.sync();
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    await this.swManager.unregister();
    this.cacheManager.clear();
  }
}

// Singleton instances
let offlineSupportService: OfflineSupportService | null = null;

export function getOfflineSupportService(): OfflineSupportService {
  if (!offlineSupportService) {
    offlineSupportService = new OfflineSupportService();
  }
  return offlineSupportService;
}

export function useOfflineStatus() {
  const service = getOfflineSupportService();
  const [status, setStatus] = useState<SyncState>(service.getStatus());

  useEffect(() => {
    const unsubscribe = service.subscribeToStatus(setStatus);
    return unsubscribe;
  }, []);

  return status;
}
