'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface CachedRoute {
  data?: any;
  timestamp: number;
  prefetched: boolean;
}

interface NavigationCache {
  routes: Map<string, CachedRoute>;
  prefetchRoute: (path: string) => Promise<void>;
  prefetchRoutes: (paths: string[]) => Promise<void>;
  getCachedRoute: (path: string) => CachedRoute | null;
  clearCache: () => void;
  invalidate: (pattern?: string) => void;
}

const NavigationCacheContext = createContext<NavigationCache | null>(null);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached routes

export const NavigationCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routes] = useState(new Map<string, CachedRoute>());

  const prefetchRoute = useCallback(async (path: string) => {
    if (routes.has(path)) {
      const cached = routes.get(path);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return; // Still fresh
      }
    }

    try {
      // Create prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      link.as = 'document';
      document.head.appendChild(link);
      
      // Store in cache
      routes.set(path, { 
        prefetched: true, 
        timestamp: Date.now() 
      });

      // Cleanup old entries if cache is too large
      if (routes.size > MAX_CACHE_SIZE) {
        const sortedEntries = Array.from(routes.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        // Remove oldest 10 entries
        for (let i = 0; i < 10; i++) {
          routes.delete(sortedEntries[i][0]);
        }
      }
    } catch (error) {
      console.error(`Failed to prefetch route: ${path}`, error);
    }
  }, [routes]);

  const prefetchRoutes = useCallback(async (paths: string[]) => {
    await Promise.all(paths.map(path => prefetchRoute(path)));
  }, [prefetchRoute]);

  const getCachedRoute = useCallback((path: string): CachedRoute | null => {
    const cached = routes.get(path);
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      routes.delete(path);
      return null;
    }
    
    return cached;
  }, [routes]);

  const clearCache = useCallback(() => {
    routes.clear();
  }, [routes]);

  const invalidate = useCallback((pattern?: string) => {
    if (!pattern) {
      clearCache();
      return;
    }

    // Remove entries matching pattern
    const regex = new RegExp(pattern);
    Array.from(routes.keys()).forEach(key => {
      if (regex.test(key)) {
        routes.delete(key);
      }
    });
  }, [routes, clearCache]);

  // Cleanup old cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      routes.forEach((value, key) => {
        if (now - value.timestamp > CACHE_TTL) {
          routes.delete(key);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [routes]);

  return (
    <NavigationCacheContext.Provider 
      value={{ 
        routes, 
        prefetchRoute, 
        prefetchRoutes,
        getCachedRoute, 
        clearCache,
        invalidate
      }}
    >
      {children}
    </NavigationCacheContext.Provider>
  );
};

export const useNavigationCache = () => {
  const context = useContext(NavigationCacheContext);
  if (!context) {
    throw new Error('useNavigationCache must be used within NavigationCacheProvider');
  }
  return context;
};

// Hook to prefetch routes on hover
export const usePrefetchOnHover = () => {
  const { prefetchRoute } = useNavigationCache();
  
  return useCallback((path: string) => {
    const timeoutId = setTimeout(() => {
      prefetchRoute(path);
    }, 100); // Small delay to avoid prefetching on quick mouse movements
    
    return () => clearTimeout(timeoutId);
  }, [prefetchRoute]);
};
