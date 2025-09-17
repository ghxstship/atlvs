'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 50 * 1024 * 1024, // 50MB max cache size
  maxAge: 24 * 60 * 60 * 1000, // 24 hours default TTL
  cleanupInterval: 5 * 60 * 1000, // Cleanup every 5 minutes
  strategies: {
    networkFirst: 'network-first',
    cacheFirst: 'cache-first',
    staleWhileRevalidate: 'stale-while-revalidate',
    networkOnly: 'network-only',
    cacheOnly: 'cache-only',
  },
};

// Cache entry interface
interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
  hits: number;
  strategy: string;
  etag?: string;
  headers?: Record<string, string>;
}

// LRU Cache implementation
class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private currentSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, { ...entry, hits: entry.hits + 1 });
    
    return entry;
  }

  set(key: string, entry: CacheEntry): void {
    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size;
      this.cache.delete(key);
    }

    // Evict least recently used if needed
    while (this.currentSize + entry.size > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.delete(firstKey);
      }
    }

    // Add new entry
    this.cache.set(key, entry);
    this.currentSize += entry.size;
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      size: this.currentSize,
      maxSize: this.maxSize,
      entries: this.cache.size,
      utilization: (this.currentSize / this.maxSize) * 100,
    };
  }
}

// IndexedDB wrapper for persistent cache
class PersistentCache {
  private dbName = 'ghxstship-cache';
  private storeName = 'cache-entries';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('strategy', 'strategy');
        }
      };
    });
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && Date.now() - entry.timestamp <= entry.ttl) {
          resolve(entry);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const entry = cursor.value;
          if (Date.now() - entry.timestamp > entry.ttl) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Cache manager singleton
class CacheManager {
  private static instance: CacheManager;
  private memoryCache: LRUCache;
  private persistentCache: PersistentCache;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.memoryCache = new LRUCache(CACHE_CONFIG.maxSize);
    this.persistentCache = new PersistentCache();
    this.startCleanup();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.persistentCache.cleanup().catch(console.error);
    }, CACHE_CONFIG.cleanupInterval);
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  async get<T>(
    key: string,
    fetcher?: () => Promise<T>,
    options?: {
      ttl?: number;
      strategy?: string;
      force?: boolean;
    }
  ): Promise<T | null> {
    const strategy = options?.strategy || CACHE_CONFIG.strategies.cacheFirst;
    
    // Network only - always fetch fresh
    if (strategy === CACHE_CONFIG.strategies.networkOnly) {
      return fetcher ? await fetcher() : null;
    }

    // Try memory cache first
    if (!options?.force) {
      const memEntry = this.memoryCache.get(key);
      if (memEntry) {
        // Stale while revalidate - return cached and fetch in background
        if (strategy === CACHE_CONFIG.strategies.staleWhileRevalidate && fetcher) {
          fetcher().then(data => this.set(key, data, options)).catch(console.error);
        }
        return memEntry.data;
      }
    }

    // Try persistent cache
    if (!options?.force) {
      const persistEntry = await this.persistentCache.get(key);
      if (persistEntry) {
        // Add to memory cache
        this.memoryCache.set(key, persistEntry);
        
        // Stale while revalidate
        if (strategy === CACHE_CONFIG.strategies.staleWhileRevalidate && fetcher) {
          fetcher().then(data => this.set(key, data, options)).catch(console.error);
        }
        return persistEntry.data;
      }
    }

    // Cache only - don't fetch if not in cache
    if (strategy === CACHE_CONFIG.strategies.cacheOnly) {
      return null;
    }

    // Fetch fresh data
    if (fetcher) {
      try {
        const data = await fetcher();
        await this.set(key, data, options);
        return data;
      } catch (error) {
        // Network first - try cache on error
        if (strategy === CACHE_CONFIG.strategies.networkFirst) {
          const fallback = this.memoryCache.get(key) || await this.persistentCache.get(key);
          return fallback ? fallback.data : null;
        }
        throw error;
      }
    }

    return null;
  }

  async set<T>(
    key: string,
    data: T,
    options?: {
      ttl?: number;
      strategy?: string;
      etag?: string;
      headers?: Record<string, string>;
    }
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl: options?.ttl || CACHE_CONFIG.maxAge,
      size: this.calculateSize(data),
      hits: 0,
      strategy: options?.strategy || CACHE_CONFIG.strategies.cacheFirst,
      etag: options?.etag,
      headers: options?.headers,
    };

    // Add to memory cache
    this.memoryCache.set(key, entry);

    // Add to persistent cache
    await this.persistentCache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await this.persistentCache.delete(key);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    // Clear IndexedDB
    if ('indexedDB' in window) {
      await indexedDB.deleteDatabase('ghxstship-cache');
    }
  }

  getStats() {
    return this.memoryCache.getStats();
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// React hook for cache management
export function useCache<T>(
  key: string,
  fetcher?: () => Promise<T>,
  options?: {
    ttl?: number;
    strategy?: string;
    dependencies?: any[];
  }
) {
  const cache = useMemo(() => CacheManager.getInstance(), []);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cache.get(key, fetcher, { ...options, force });
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options?.ttl, options?.strategy]);

  useEffect(() => {
    refresh();
  }, [key, ...(options?.dependencies || [])]);

  return { data, loading, error, refresh };
}

// Prefetch hook for preloading data
export function usePrefetch() {
  const cache = useMemo(() => CacheManager.getInstance(), []);

  const prefetch = useCallback(async <T,>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      strategy?: string;
    }
  ) => {
    await cache.get(key, fetcher, options);
  }, [cache]);

  return prefetch;
}

// Cache invalidation hook
export function useCacheInvalidation() {
  const cache = useMemo(() => CacheManager.getInstance(), []);

  const invalidate = useCallback(async (pattern: string | RegExp) => {
    // For simplicity, clear specific key or all cache
    if (typeof pattern === 'string') {
      await cache.delete(pattern);
    } else {
      // Would need to implement pattern matching
      console.warn('Pattern-based invalidation not yet implemented');
    }
  }, [cache]);

  return invalidate;
}

// Service Worker registration for advanced caching
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.error('SW registration failed:', error);
        });
    });
  }
}

// Export cache manager for direct access
export { CacheManager };

// Export cache strategies
export const CacheStrategies = CACHE_CONFIG.strategies;

import { useState } from 'react';
