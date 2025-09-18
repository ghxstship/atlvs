// Bundle Optimization Utilities
// Provides tools for analyzing and optimizing bundle sizes

export interface BundleMetrics {
  chunkName: string;
  size: number;
  loadTime: number;
  dependencies: string[];
  isAsync: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface OptimizationReport {
  totalSize: number;
  asyncChunks: number;
  syncChunks: number;
  duplicatedModules: string[];
  recommendations: OptimizationRecommendation[];
  metrics: BundleMetrics[];
}

export interface OptimizationRecommendation {
  type: 'code-split' | 'lazy-load' | 'tree-shake' | 'dedupe' | 'preload';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedSavings: number;
  module?: string;
}

// Bundle size analyzer
export class BundleAnalyzer {
  private static metrics: Map<string, BundleMetrics> = new Map();
  private static loadTimes: Map<string, number> = new Map();

  static recordChunkLoad(chunkName: string, startTime: number, size?: number) {
    const loadTime = performance.now() - startTime;
    
    this.loadTimes.set(chunkName, loadTime);
    
    if (size) {
      this.metrics.set(chunkName, {
        chunkName,
        size,
        loadTime,
        dependencies: [],
        isAsync: true,
        priority: this.calculatePriority(chunkName, loadTime)
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
    }
  }

  static recordModuleSize(moduleName: string, size: number) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Module "${moduleName}": ${(size / 1024).toFixed(2)}KB`);
    }
  }

  private static calculatePriority(chunkName: string, loadTime: number): 'high' | 'medium' | 'low' {
    // Critical routes get high priority
    if (chunkName.includes('dashboard') || chunkName.includes('auth')) {
      return 'high';
    }
    
    // Fast loading chunks get medium priority
    if (loadTime < 100) {
      return 'medium';
    }
    
    return 'low';
  }

  static getMetrics(): BundleMetrics[] {
    return Array.from(this.metrics.values());
  }

  static generateReport(): OptimizationReport {
    const metrics = this.getMetrics();
    const totalSize = metrics.reduce((sum, metric) => sum + metric.size, 0);
    const asyncChunks = metrics.filter(m => m.isAsync).length;
    const syncChunks = metrics.filter(m => !m.isAsync).length;

    const recommendations = this.generateRecommendations(metrics);

    return {
      totalSize,
      asyncChunks,
      syncChunks,
      duplicatedModules: [], // Would be populated by webpack analysis
      recommendations,
      metrics
    };
  }

  private static generateRecommendations(metrics: BundleMetrics[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Large chunks that should be split
    metrics.forEach(metric => {
      if (metric.size > 500000) { // 500KB
        recommendations.push({
          type: 'code-split',
          priority: 'high',
          description: `Split large chunk "${metric.chunkName}" (${(metric.size / 1024).toFixed(0)}KB)`,
          estimatedSavings: metric.size * 0.3,
          module: metric.chunkName
        });
      }

      // Slow loading chunks
      if (metric.loadTime > 1000) { // 1 second
        recommendations.push({
          type: 'lazy-load',
          priority: 'medium',
          description: `Lazy load slow chunk "${metric.chunkName}" (${metric.loadTime.toFixed(0)}ms)`,
          estimatedSavings: 0,
          module: metric.chunkName
        });
      }
    });

    return recommendations;
  }

  static reset() {
    this.metrics.clear();
    this.loadTimes.clear();
  }
}

// Webpack optimization configuration helper
export const webpackOptimizations = {
  // Code splitting configuration
  splitChunks: {
    chunks: 'all' as const,
    cacheGroups: {
      // Vendor libraries
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
        chunks: 'all' as const,
      },
      
      // Common utilities
      common: {
        name: 'common',
        minChunks: 2,
        priority: 5,
        chunks: 'all' as const,
        enforce: true,
      },
      
      // UI components
      ui: {
        test: /[\\/]src[\\/]components[\\/]/,
        name: 'ui-components',
        priority: 8,
        chunks: 'all' as const,
      },
      
      // Monitoring components (heavy)
      monitoring: {
        test: /[\\/]src[\\/]components[\\/]monitoring[\\/]/,
        name: 'monitoring',
        priority: 9,
        chunks: 'async' as const,
      },
      
      // Data view components (heavy)
      dataViews: {
        test: /[\\/]src[\\/]components[\\/]DataViews[\\/]/,
        name: 'data-views',
        priority: 9,
        chunks: 'async' as const,
      },
      
      // 3D components (very heavy)
      threeDComponents: {
        test: /[\\/]src[\\/]components[\\/]3d[\\/]/,
        name: '3d-components',
        priority: 15,
        chunks: 'async' as const,
      }
    }
  },

  // Module concatenation for better tree shaking
  concatenateModules: true,

  // Minimize configuration
  minimize: true,
  
  // Remove unused exports
  usedExports: true,
  
  // Side effects configuration for tree shaking
  sideEffects: false
};

// Tree shaking helper
export const treeShakingOptimizations = {
  // Mark packages as side-effect free
  sideEffectFreePackages: [
    'lodash-es',
    'date-fns',
    'ramda',
    'rxjs/operators'
  ],

  // Babel plugin configuration for tree shaking
  babelPlugins: [
    ['import', {
      libraryName: 'lodash',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }, 'lodash'],
    ['import', {
      libraryName: 'date-fns',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }, 'date-fns']
  ]
};

// Performance budget configuration
export const performanceBudgets = {
  // Asset size limits
  maxAssetSize: 500000, // 500KB
  maxEntrypointSize: 1000000, // 1MB
  
  // Chunk size limits by type
  chunkSizeLimits: {
    vendor: 800000, // 800KB
    common: 200000, // 200KB
    async: 300000, // 300KB
  },

  // Performance hints
  hints: 'warning' as const,
  
  // Filter function for performance warnings
  assetFilter: (assetFilename: string) => {
    return !assetFilename.endsWith('.map');
  }
};

// Dynamic import helper with error handling
export const createDynamicImport = <T>(
  importFn: () => Promise<T>,
  chunkName: string,
  retryAttempts = 3
): (() => Promise<T>) => {
  return async (): Promise<T> => {
    const startTime = performance.now();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const result = await importFn();
        BundleAnalyzer.recordChunkLoad(chunkName, startTime);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryAttempts) {
          console.warn(`Dynamic import failed (attempt ${attempt}/${retryAttempts}):`, error);
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    console.error(`Dynamic import failed after ${retryAttempts} attempts:`, lastError);
    throw lastError;
  };
};

// Preload helper for critical resources
export const preloadResource = (
  href: string,
  as: 'script' | 'style' | 'font' | 'image' = 'script',
  crossorigin?: 'anonymous' | 'use-credentials'
) => {
  if (typeof document === 'undefined') return;

  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }

  document.head.appendChild(link);
};

// Prefetch helper for non-critical resources
export const prefetchResource = (href: string) => {
  if (typeof document === 'undefined') return;

  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;

  document.head.appendChild(link);
};

// Resource hints manager
export class ResourceHintsManager {
  private static preloadedResources = new Set<string>();
  private static prefetchedResources = new Set<string>();

  static preload(href: string, as: 'script' | 'style' | 'font' | 'image' = 'script') {
    if (this.preloadedResources.has(href)) return;
    
    this.preloadedResources.add(href);
    preloadResource(href, as);
  }

  static prefetch(href: string) {
    if (this.prefetchedResources.has(href)) return;
    
    this.prefetchedResources.add(href);
    prefetchResource(href);
  }

  static preloadCriticalChunks(chunkNames: string[]) {
    chunkNames.forEach(chunkName => {
      // This would be populated with actual chunk URLs in a real implementation
      const chunkUrl = `/chunks/${chunkName}.js`;
      this.preload(chunkUrl);
    });
  }

  static prefetchRouteChunks(routeNames: string[]) {
    routeNames.forEach(routeName => {
      // This would be populated with actual route chunk URLs
      const chunkUrl = `/chunks/route-${routeName}.js`;
      this.prefetch(chunkUrl);
    });
  }

  static getStats() {
    return {
      preloadedCount: this.preloadedResources.size,
      prefetchedCount: this.prefetchedResources.size,
      preloadedResources: Array.from(this.preloadedResources),
      prefetchedResources: Array.from(this.prefetchedResources)
    };
  }
}

// Bundle size monitoring hook
export const useBundleMonitoring = () => {
  const [report, setReport] = React.useState<OptimizationReport | null>(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateReport = () => {
      const newReport = BundleAnalyzer.generateReport();
      setReport(newReport);
    };

    // Update report every 5 seconds in development
    const interval = setInterval(updateReport, 5000);
    
    // Initial report
    updateReport();

    return () => clearInterval(interval);
  }, []);

  return report;
};

// Export configuration for Next.js
export const nextJsOptimizations = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'lodash-es'
    ]
  },
  
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        ...webpackOptimizations
      };

      // Add performance budgets
      config.performance = performanceBudgets;
    }

    // Bundle analyzer in development
    if (dev && !isServer) {
      config.plugins.push({
        apply: (compiler: any) => {
          compiler.hooks.done.tap('BundleAnalyzer', () => {
            console.log('📊 Bundle analysis complete');
          });
        }
      });
    }

    return config;
  }
};
