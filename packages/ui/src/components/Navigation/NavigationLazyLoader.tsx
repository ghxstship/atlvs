/**
 * Navigation Lazy Loading System
 * Performance optimization with code splitting and dynamic imports
 */

'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { navigationTokens } from '../../tokens/navigation';

// =============================================================================
// LAZY LOADING UTILITIES
// =============================================================================

interface LazyComponentProps {
  fallback?: React.ReactNode;
  delay?: number;
}

// Enhanced lazy loading with error boundaries
export const createLazyComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback || <NavigationSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// =============================================================================
// NAVIGATION SKELETONS
// =============================================================================

export const NavigationSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-[var(--nav-spacing-xs)]">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-[var(--nav-height-item)] bg-[hsl(var(--nav-bg-secondary))] rounded-[var(--nav-radius-md)] mx-[var(--nav-spacing-xs)]"
        style={{
          animationDelay: `${i * 50}ms`,
          animationDuration: '1.5s',
        }}
      />
    ))}
  </div>
);

export const SidebarSkeleton: React.FC = () => (
  <div className="w-[var(--nav-width-expanded)] bg-[hsl(var(--nav-bg-accent))] border-r border-[hsl(var(--nav-border-default))] animate-pulse">
    {/* Header skeleton */}
    <div className="p-[var(--nav-spacing-md)] border-b border-[hsl(var(--nav-border-default))]">
      <div className="h-icon-md bg-[hsl(var(--nav-bg-secondary))] rounded-[var(--nav-radius-md)]" />
    </div>
    
    {/* Search skeleton */}
    <div className="p-[var(--nav-spacing-md)]">
      <div className="h-icon-xl bg-[hsl(var(--nav-bg-secondary))] rounded-[var(--nav-radius-md)]" />
    </div>
    
    {/* Navigation skeleton */}
    <div className="px-[var(--nav-spacing-xs)] space-y-[var(--nav-spacing-xs)]">
      <NavigationSkeleton />
    </div>
  </div>
);

export const BreadcrumbSkeleton: React.FC = () => (
  <div className="flex items-center gap-[var(--nav-spacing-xs)] animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <React.Fragment key={i}>
        <div className="h-icon-xs w-component-md bg-[hsl(var(--nav-bg-secondary))] rounded-[var(--nav-radius-sm)]" />
        {i < 2 && <div className="w-1 h-1 bg-[hsl(var(--nav-fg-muted))] rounded-full" />}
      </React.Fragment>
    ))}
  </div>
);

// =============================================================================
// LAZY LOADED COMPONENTS
// =============================================================================

// Placeholder components for lazy loading
const NavigationAIPlaceholder = () => (
  <div className="p-[var(--nav-spacing-md)] text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-muted))]">
    Loading AI features...
  </div>
);

const NavigationMetricsPlaceholder = () => (
  <div className="p-[var(--nav-spacing-md)] text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-muted))]">
    Loading metrics...
  </div>
);

const SidebarPersonalizationPlaceholder = () => (
  <div className="p-[var(--nav-spacing-md)] text-[var(--nav-text-sm)] text-[hsl(var(--nav-fg-muted))]">
    Loading personalization...
  </div>
);

const SidebarAnimationsPlaceholder = () => <NavigationSkeleton />;

// Advanced navigation features (loaded on demand)
export const LazyNavigationAI = React.lazy(() => 
  Promise.resolve({ default: NavigationAIPlaceholder })
);

export const LazyNavigationMetrics = React.lazy(() =>
  Promise.resolve({ default: NavigationMetricsPlaceholder })
);

// Specialized sidebar features  
export const LazySidebarPersonalization = React.lazy(() =>
  Promise.resolve({ default: SidebarPersonalizationPlaceholder })
);

export const LazySidebarAnimations = React.lazy(() =>
  Promise.resolve({ default: SidebarAnimationsPlaceholder })
);

// =============================================================================
// PROGRESSIVE LOADING HOOK
// =============================================================================

interface ProgressiveLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export const useProgressiveLoading = (
  ref: React.RefObject<HTMLElement>,
  options: ProgressiveLoadingOptions = {}
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const { threshold = 0.1, rootMargin = '50px', delay = 0 } = options;

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          if (delay > 0) {
            setTimeout(() => setShouldLoad(true), delay);
          } else {
            setShouldLoad(true);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, delay]);

  return { isVisible, shouldLoad };
};

// =============================================================================
// ROUTE-BASED CODE SPLITTING
// =============================================================================

interface RouteModule {
  component: ComponentType<any>;
  preload?: () => Promise<void>;
}

const routeModules = new Map<string, RouteModule>();

export const registerRouteModule = (
  path: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  const preload = async () => {
    try {
      await importFn();
    } catch (error) {
      console.error(`Failed to preload route module: ${path}`, error);
    }
  };

  const LazyComponent = createLazyComponent(importFn);

  routeModules.set(path, {
    component: LazyComponent,
    preload,
  });
};

export const getRouteModule = (path: string): RouteModule | null => {
  return routeModules.get(path) || null;
};

export const preloadRouteModule = async (path: string): Promise<void> => {
  const module = routeModules.get(path);
  if (module?.preload) {
    await module.preload();
  }
};

// =============================================================================
// BUNDLE SPLITTING UTILITIES
// =============================================================================

// Critical navigation components (loaded immediately)
export const criticalComponents = [
  'SidebarNavigation',
  'Breadcrumbs',
  'NavigationItem',
] as const;

// Enhanced navigation features (loaded on interaction)
export const enhancedComponents = [
  'NavigationAI',
  'NavigationMetrics',
  'SidebarPersonalization',
  'SidebarAnimations',
] as const;

// Utility to check if component should be loaded immediately
export const isCriticalComponent = (componentName: string): boolean => {
  return criticalComponents.includes(componentName as any);
};

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

interface LoadingMetrics {
  componentName: string;
  loadTime: number;
  bundleSize?: number;
  cacheHit: boolean;
}

const loadingMetrics: LoadingMetrics[] = [];

export const trackComponentLoad = (
  componentName: string,
  startTime: number,
  cacheHit: boolean = false
) => {
  const loadTime = performance.now() - startTime;
  
  loadingMetrics.push({
    componentName,
    loadTime,
    cacheHit,
  });

  // Log slow loading components
  if (loadTime > 1000) {
    console.warn(`Slow loading component detected: ${componentName} (${loadTime.toFixed(2)}ms)`);
  }
};

export const getLoadingMetrics = (): LoadingMetrics[] => {
  return [...loadingMetrics];
};

export const clearLoadingMetrics = (): void => {
  loadingMetrics.length = 0;
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export * from './NavigationCache';

export default {
  createLazyComponent,
  NavigationSkeleton,
  SidebarSkeleton,
  BreadcrumbSkeleton,
  LazyNavigationAI,
  LazyNavigationMetrics,
  LazySidebarPersonalization,
  LazySidebarAnimations,
  useProgressiveLoading,
  registerRouteModule,
  getRouteModule,
  preloadRouteModule,
  trackComponentLoad,
  getLoadingMetrics,
  clearLoadingMetrics,
};
