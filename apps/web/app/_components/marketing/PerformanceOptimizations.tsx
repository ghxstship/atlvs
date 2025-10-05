'use client';


import { useEffect } from 'react';

// Performance monitoring and optimization utilities
export const PerformanceOptimizations = () => {
  useEffect(() => {
    // Lazy load images with Intersection Observer
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.dataset.src;

            if (!dataSrc) {
              observer.unobserve(img);
              return;
            }

            if (img.src !== dataSrc) {
              img.src = dataSrc;
            }

            img.removeAttribute('data-src');
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload hero images
      const heroImages = [
        '/hero-dashboard.jpg',
        '/hero-atlvs.jpg',
        '/hero-opendeck.jpg'
      ];

      heroImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const criticalFonts = [
        '/fonts/anton-v25-latin-regular.woff2',
        '/fonts/share-tech-v17-latin-regular.woff2'
      ];

      criticalFonts.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Optimize scroll performance
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Add scroll-based optimizations here
          ticking = false;
        });
        ticking = true;
      }
    };

    // Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }

    // Service Worker registration for caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Intentionally swallow service worker registration errors in production
      });
    }

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry | undefined;
        
        // Send to analytics if LCP is poor (>2.5s)
        if (lastEntry && lastEntry.startTime > 2500) {
          // Hook for future analytics reporting of poor LCP
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch {
        // Fallback for browsers that don't support LCP
      }

      // Monitor Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list: PerformanceObserverEntryList) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (layoutShiftEntry.value && !layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        
        // Send to analytics if CLS is poor (>0.1)
        if (clsValue > 0.1) {
          // Hook for future analytics reporting of poor CLS
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch {
        // Fallback for browsers that don't support CLS
      }
    }

    // Initialize optimizations
    preloadCriticalResources();
    window.addEventListener('scroll', optimizeScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', optimizeScroll);
    };
  }, []);

  return null;
};

// Image optimization component
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  [key: string]: unknown;
}) => {
  const imageSrc = priority ? src : undefined;
  const dataSrc = priority ? undefined : src;

  return (
    <img
      src={imageSrc}
      data-src={dataSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${priority ? '' : 'lazy'}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

// Critical CSS inlining utility
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical above-the-fold styles */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-header {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50;
      background: hsl(var(--color-background) / 0.95);
      backdrop-filter: blur(10px);
    }
    
    /* Font display optimization */
    @font-face {
      font-family: var(--font-family-title);
      font-display: swap;
    }
    
    @font-face {
      font-family: var(--font-family-body);
      font-display: swap;
    }
    
    /* Reduce motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;

  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};

// Resource hints component
export const ResourceHints = () => {
  useEffect(() => {
    // DNS prefetch for external domains
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.google-analytics.com',
      'www.googletagmanager.com',
      'connect.facebook.net',
      'snap.licdn.com'
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      if (domain.includes('gstatic')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }, []);

  return null;
};

export default PerformanceOptimizations;
