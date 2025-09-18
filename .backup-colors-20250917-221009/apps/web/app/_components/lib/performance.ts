// Performance optimization utilities for marketing pages
// Ensures optimal loading and runtime performance across all marketing components

export const performance = {
  // Image optimization
  images: {
    // Lazy loading configuration
    lazy: 'loading="lazy"',
    eager: 'loading="eager"',
    
    // Responsive image sizes
    sizes: {
      hero: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
      thumbnail: '(max-width: 768px) 50vw, 25vw',
    },
    
    // Image quality settings
    quality: {
      high: 90,
      medium: 75,
      low: 60,
    },
  },
  
  // Code splitting and dynamic imports
  dynamicImports: {
    // Components that should be loaded on demand (placeholder imports)
    // modal: () => import('../components/ui/Modal'),
    // chart: () => import('../components/ui/Chart'), 
    // calendar: () => import('../components/ui/Calendar'),
  },
  
  // Preloading strategies
  preload: {
    // Critical resources to preload
    fonts: [
      { href: '/fonts/anton-v24-latin-regular.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
    ],
    
    // Critical CSS
    criticalCSS: '/css/critical.css',
    
    // Important pages to prefetch
    prefetchPages: ['/products', '/solutions', '/pricing'],
  },
  
  // Bundle optimization
  bundleOptimization: {
    // Tree shaking configuration
    treeShaking: true,
    
    // Code splitting points
    splitChunks: {
      vendor: ['react', 'react-dom', 'next'],
      ui: ['@ghxstship/ui'],
      utils: ['lucide-react', 'clsx'],
    },
    
    // Compression settings
    compression: {
      gzip: true,
      brotli: true,
    },
  },
  
  // Runtime optimization
  runtime: {
    // Debounce utilities
    debounce: (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // Throttle utilities
    throttle: (func: Function, limit: number) => {
      let inThrottle: boolean;
      return function executedFunction(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    
    // Intersection Observer for lazy loading
    createIntersectionObserver: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      });
    },
  },
  
  // Metrics and monitoring
  metrics: {
    // Core Web Vitals thresholds
    coreWebVitals: {
      LCP: 2500, // Largest Contentful Paint (ms)
      FID: 100,  // First Input Delay (ms)
      CLS: 0.1,  // Cumulative Layout Shift
    },
    
    // Performance budget
    budget: {
      totalSize: '500KB',
      jsSize: '200KB',
      cssSize: '50KB',
      imageSize: '200KB',
    },
  },
} as const;

// Performance monitoring utilities
export const performanceMonitoring = {
  // Measure component render time
  measureRenderTime: (componentName: string, renderFunction: () => void) => {
    if (typeof window !== 'undefined' && window.performance) {
      const start = window.performance.now();
      renderFunction();
      const end = window.performance.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    } else {
      renderFunction();
    }
  },
  
  // Track Core Web Vitals
  trackCoreWebVitals: () => {
    // Implementation would use web-vitals library
    // This is a placeholder for the actual implementation
    if (typeof window !== 'undefined') {
      // Track LCP, FID, CLS, etc.
      console.log('Tracking Core Web Vitals...');
    }
  },
  
  // Monitor bundle size
  analyzeBundleSize: () => {
    // Implementation would analyze webpack bundle
    console.log('Analyzing bundle size...');
  },
} as const;
