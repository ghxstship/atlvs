'use client';

import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Card } from '../Card';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Types for lazy loading configuration
export interface LazyLoadConfig {
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  config?: LazyLoadConfig;
  props?: Record<string, any>;
  className?: string;
}

// Default loading fallback component
const DefaultLoadingFallback: React.FC = () => (
  <Card className="p-xl flex items-center justify-center">
    <RefreshCw className="h-6 w-6 animate-spin text-primary mr-sm" />
    <span className="text-muted-foreground/70">Loading component...</span>
  </Card>
);

// Default error boundary component
const DefaultErrorBoundary: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <Card className="p-xl border-destructive bg-destructive/10">
    <div className="flex items-start space-x-sm">
      <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-destructive mb-sm">Component Load Error</h3>
        <p className="text-destructive mb-md">
          Failed to load component: {error.message}
        </p>
        <button
          onClick={retry}
          className="px-md py-sm bg-destructive text-background rounded-md hover:bg-destructive transition-colors"
        >
          Retry Loading
        </button>
      </div>
    </div>
  </Card>
);

// Enhanced lazy component loader with retry logic
export const createLazyComponent = (
  loader: () => Promise<{ default: ComponentType<any> }>,
  config: LazyLoadConfig = {}
): LazyExoticComponent<ComponentType<any>> => {
  const {
    retryAttempts = 3,
    retryDelay = 1000
  } = config;

  let retryCount = 0;

  const enhancedLoader = async (): Promise<{ default: ComponentType<any> }> => {
    try {
      return await loader();
    } catch (error) {
      if (retryCount < retryAttempts) {
        retryCount++;
        console.warn(`Component load failed, retrying (${retryCount}/${retryAttempts})...`, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
        
        return enhancedLoader();
      }
      
      console.error('Component load failed after all retry attempts:', error);
      throw error;
    }
  };

  return lazy(enhancedLoader);
};

// Error boundary class component for lazy loading
class LazyLoadErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
    onRetry: () => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={() => {
            this.setState({ hasError: false, error: null });
            this.props.onRetry();
          }}
        />
      );
    }

    return this.props.children;
  }
}

// Main lazy component loader
export const LazyComponentLoader: React.FC<LazyComponentProps> = ({
  loader,
  config = {},
  props = {},
  className = ''
}) => {
  const [key, setKey] = React.useState(0);
  const {
    fallback: FallbackComponent = DefaultLoadingFallback,
    errorBoundary: ErrorBoundaryComponent = DefaultErrorBoundary
  } = config;

  const LazyComponent = React.useMemo(
    () => createLazyComponent(loader, config),
    [loader, config, key] // Include key to force recreation on retry
  );

  const handleRetry = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className={className}>
      <LazyLoadErrorBoundary
        fallback={ErrorBoundaryComponent}
        onRetry={handleRetry}
      >
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyLoadErrorBoundary>
    </div>
  );
};

// Prebuilt lazy loaders for common component patterns
export const LazyLoaders = {
  // Dashboard components
  MonitoringDashboard: () => createLazyComponent(
    () => import('../monitoring/DatabaseMonitoringDashboard').then(m => ({ default: m.DatabaseMonitoringDashboard }))
  ),
  
  AlertingSystem: () => createLazyComponent(
    () => import('../monitoring/AlertingSystem').then(m => ({ default: m.AlertingSystem }))
  ),
  
  PerformanceMetrics: () => createLazyComponent(
    () => import('../monitoring/PerformanceMetricsChart').then(m => ({ default: m.PerformanceMetricsChart }))
  ),

  // Data view components
  KanbanBoard: () => createLazyComponent(
    () => import('../DataViews/KanbanBoard')
  ),
  
  AdvancedSearchSystem: () => createLazyComponent(
    () => import('../DataViews/AdvancedSearchSystem')
  ),
  
  DatabaseTransactionManager: () => createLazyComponent(
    () => import('../DataViews/DatabaseTransactionManager')
  ),
  
  PerformanceMonitoringSystem: () => createLazyComponent(
    () => import('../DataViews/PerformanceMonitoringSystem')
  ),

  // 3D components (typically heavy)
  Card3D: () => createLazyComponent(
    () => import('../3d/Card3D')
  ),

  // Form components
  Modal: () => createLazyComponent(
    () => import('../Modal')
  ),
  
  Dropdown: () => createLazyComponent(
    () => import('../Dropdown')
  )
};

// Hook for preloading components
export const usePreloadComponent = () => {
  const preloadedComponents = React.useRef(new Set<string>());

  const preload = React.useCallback((
    componentKey: keyof typeof LazyLoaders,
    priority: 'high' | 'low' = 'low'
  ) => {
    if (preloadedComponents.current.has(componentKey)) {
      return;
    }

    const loader = LazyLoaders[componentKey];
    if (!loader) {
      console.warn(`Unknown component key: ${componentKey}`);
      return;
    }

    preloadedComponents.current.add(componentKey);

    if (priority === 'high') {
      // Preload immediately
      loader();
    } else {
      // Preload when browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          loader();
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          loader();
        }, 100);
      }
    }
  }, []);

  const preloadMultiple = React.useCallback((
    components: Array<{ key: keyof typeof LazyLoaders; priority?: 'high' | 'low' }>
  ) => {
    components.forEach(({ key, priority = 'low' }) => {
      preload(key, priority);
    });
  }, [preload]);

  return { preload, preloadMultiple };
};

// Route-based code splitting helper
export const createRouteComponent = (
  loader: () => Promise<{ default: ComponentType<any> }>,
  preloadDependencies?: Array<keyof typeof LazyLoaders>
) => {
  const RouteComponent = createLazyComponent(loader, {
    retryAttempts: 3,
    retryDelay: 1000
  });

  // Wrapper component that handles preloading
  const WrappedComponent: React.FC<any> = (props) => {
    const { preloadMultiple } = usePreloadComponent();

    React.useEffect(() => {
      if (preloadDependencies?.length) {
        preloadMultiple(
          preloadDependencies.map(key => ({ key, priority: 'low' as const }))
        );
      }
    }, [preloadMultiple]);

    return <RouteComponent {...props} />;
  };

  return WrappedComponent;
};

// Bundle size analyzer helper (development only)
export const BundleAnalyzer = {
  logComponentSize: (componentName: string, startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const loadTime = performance.now() - startTime;
      console.log(`📦 Component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`);
    }
  },

  measureComponentLoad: <T extends ComponentType<any>>(
    componentName: string,
    loader: () => Promise<{ default: T }>
  ) => {
    return async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      const result = await loader();
      BundleAnalyzer.logComponentSize(componentName, startTime);
      return result;
    };
  }
};
