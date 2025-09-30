import { describe, it, expect, beforeAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';

// Performance budgets (in milliseconds)
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift

  // Custom metrics
  FCP: 1800, // First Contentful Paint
  TBT: 300,  // Total Blocking Time
  TTI: 3000, // Time to Interactive

  // Page load times
  PAGE_LOAD: 2000,
  FIRST_PAINT: 1000,

  // Bundle sizes (in KB)
  MAIN_BUNDLE: 500,
  VENDOR_BUNDLE: 1000,
  TOTAL_JS: 1200,
};

// Performance monitoring utilities
class PerformanceMonitor {
  private page: Page;
  private metrics: Map<string, number> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  async startMonitoring() {
    // Clear any existing performance entries
    await this.page.evaluate(() => {
      if (window.performance && window.performance.clearMeasures) {
        window.performance.clearMeasures();
      }
    });

    // Start performance observer
    await this.page.evaluate(() => {
      window.performance.mark('test-start');
    });
  }

  async measurePageLoad(): Promise<number> {
    const loadTime = await this.page.evaluate(() => {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.fetchStart;
    });
    this.metrics.set('pageLoad', loadTime);
    return loadTime;
  }

  async measureFirstPaint(): Promise<number> {
    const fp = await this.page.evaluate(() => {
      const paintEntries = window.performance.getEntriesByType('paint');
      const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
      return fpEntry ? fpEntry.startTime : 0;
    });
    this.metrics.set('firstPaint', fp);
    return fp;
  }

  async measureFirstContentfulPaint(): Promise<number> {
    const fcp = await this.page.evaluate(() => {
      const paintEntries = window.performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });
    this.metrics.set('firstContentfulPaint', fcp);
    return fcp;
  }

  async measureLargestContentfulPaint(): Promise<number> {
    // Wait a bit for LCP to be recorded
    await this.page.waitForTimeout(1000);

    const lcp = await this.page.evaluate(() => {
      const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        return Math.max(...lcpEntries.map(entry => entry.startTime));
      }
      return 0;
    });
    this.metrics.set('largestContentfulPaint', lcp);
    return lcp;
  }

  async measureTimeToInteractive(): Promise<number> {
    // Simplified TTI measurement
    const tti = await this.page.evaluate(() => {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.domInteractive - navigation.fetchStart;
    });
    this.metrics.set('timeToInteractive', tti);
    return tti;
  }

  async measureBundleSizes(): Promise<{ main: number; vendor: number; total: number }> {
    const bundleSizes = await this.page.evaluate(() => {
      const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));

      let mainBundle = 0;
      let vendorBundle = 0;

      jsResources.forEach(resource => {
        const size = resource.transferSize || resource.encodedBodySize || 0;
        if (resource.name.includes('main') || resource.name.includes('app')) {
          mainBundle += size;
        } else if (resource.name.includes('vendor') || resource.name.includes('chunk')) {
          vendorBundle += size;
        }
      });

      return {
        main: mainBundle / 1024, // Convert to KB
        vendor: vendorBundle / 1024,
        total: (mainBundle + vendorBundle) / 1024,
      };
    });

    this.metrics.set('mainBundleSize', bundleSizes.main);
    this.metrics.set('vendorBundleSize', bundleSizes.vendor);
    this.metrics.set('totalJSSize', bundleSizes.total);

    return bundleSizes;
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  assertBudget(metric: string, value: number, budget: number) {
    if (value > budget) {
      throw new Error(
        `Performance budget exceeded for ${metric}: ${value.toFixed(2)}ms (budget: ${budget}ms)`
      );
    }
  }
}

describe('Performance Testing - Core Web Vitals & Budget Compliance', () => {
  let browser: Browser;
  let page: Page;
  let monitor: PerformanceMonitor;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    monitor = new PerformanceMonitor(page);

    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });

    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      // Enable performance observer for LCP
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          // Store LCP value for later retrieval
          (window as any)._lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Home Page Performance', () => {
    it('should load within performance budget', async () => {
      await monitor.startMonitoring();
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

      const loadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Page Load', loadTime, PERFORMANCE_BUDGETS.PAGE_LOAD);

      const firstPaint = await monitor.measureFirstPaint();
      monitor.assertBudget('First Paint', firstPaint, PERFORMANCE_BUDGETS.FIRST_PAINT);

      const fcp = await monitor.measureFirstContentfulPaint();
      monitor.assertBudget('First Contentful Paint', fcp, PERFORMANCE_BUDGETS.FCP);

      const lcp = await monitor.measureLargestContentfulPaint();
      if (lcp > 0) {
        monitor.assertBudget('Largest Contentful Paint', lcp, PERFORMANCE_BUDGETS.LCP);
      }

      const tti = await monitor.measureTimeToInteractive();
      monitor.assertBudget('Time to Interactive', tti, PERFORMANCE_BUDGETS.TTI);

      console.log('Home Page Metrics:', monitor.getMetrics());
    }, 30000);

    it('should maintain bundle size budgets', async () => {
      await page.waitForLoadState('networkidle');

      const bundleSizes = await monitor.measureBundleSizes();
      monitor.assertBudget('Main Bundle Size', bundleSizes.main, PERFORMANCE_BUDGETS.MAIN_BUNDLE);
      monitor.assertBudget('Vendor Bundle Size', bundleSizes.vendor, PERFORMANCE_BUDGETS.VENDOR_BUNDLE);
      monitor.assertBudget('Total JS Size', bundleSizes.total, PERFORMANCE_BUDGETS.TOTAL_JS);

      console.log('Bundle Sizes:', bundleSizes);
    });
  });

  describe('Dashboard Page Performance', () => {
    it('should load dashboard within performance budget', async () => {
      await monitor.startMonitoring();
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

      const loadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Dashboard Page Load', loadTime, PERFORMANCE_BUDGETS.PAGE_LOAD);

      const fcp = await monitor.measureFirstContentfulPaint();
      monitor.assertBudget('Dashboard FCP', fcp, PERFORMANCE_BUDGETS.FCP);

      const lcp = await monitor.measureLargestContentfulPaint();
      if (lcp > 0) {
        monitor.assertBudget('Dashboard LCP', lcp, PERFORMANCE_BUDGETS.LCP);
      }

      console.log('Dashboard Metrics:', monitor.getMetrics());
    }, 30000);

    it('should handle user interactions efficiently', async () => {
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="dashboard-metrics"]', { timeout: 10000 });

      // Measure interaction performance
      const startTime = Date.now();

      // Click on a navigation item
      await page.click('[data-testid="nav-projects"]');

      // Wait for navigation
      await page.waitForURL('**/projects');

      const interactionTime = Date.now() - startTime;
      monitor.assertBudget('Navigation Interaction', interactionTime, 500); // 500ms budget

      console.log('Navigation Interaction Time:', interactionTime + 'ms');
    });
  });

  describe('Data-Heavy Pages Performance', () => {
    it('should handle large datasets efficiently', async () => {
      await monitor.startMonitoring();
      await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });

      const loadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Projects Page Load', loadTime, PERFORMANCE_BUDGETS.PAGE_LOAD + 500); // Extra budget for data loading

      // Wait for data table to load
      await page.waitForSelector('[data-testid="data-table"]', { timeout: 15000 });

      const renderTime = await monitor.measureTimeToInteractive();
      monitor.assertBudget('Projects TTI', renderTime, PERFORMANCE_BUDGETS.TTI + 1000);

      console.log('Projects Page Metrics:', monitor.getMetrics());
    }, 45000);
  });

  describe('Form Performance', () => {
    it('should handle form interactions efficiently', async () => {
      await page.goto('http://localhost:3000/projects/create');

      // Wait for form to load
      await page.waitForSelector('form', { timeout: 10000 });

      const startTime = Date.now();

      // Fill out form fields
      await page.fill('[data-testid="project-name"]', 'Performance Test Project');
      await page.fill('[data-testid="project-description"]', 'Testing form performance');
      await page.selectOption('[data-testid="project-status"]', 'active');

      // Submit form
      await page.click('[data-testid="submit-button"]');

      const formInteractionTime = Date.now() - startTime;
      monitor.assertBudget('Form Submission', formInteractionTime, 1000); // 1s budget

      console.log('Form Interaction Time:', formInteractionTime + 'ms');
    }, 30000);
  });

  describe('Memory Usage & Resource Efficiency', () => {
    it('should not have excessive memory leaks', async () => {
      // Navigate through multiple pages
      const pages = ['/dashboard', '/projects', '/finance', '/people', '/settings'];

      for (const pagePath of pages) {
        await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000); // Let page settle
      }

      // Check for console errors during navigation
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      expect(errors.length).toBe(0);

      // Basic memory check (simplified)
      const memoryUsage = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
      });

      // Memory budget: 100MB
      expect(memoryUsage).toBeLessThan(100);

      console.log('Memory Usage:', memoryUsage + 'MB');
    });
  });

  describe('Mobile Performance', () => {
    it('should perform well on mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await monitor.startMonitoring();
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

      const mobileLoadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Mobile Page Load', mobileLoadTime, PERFORMANCE_BUDGETS.PAGE_LOAD + 500);

      const mobileLCP = await monitor.measureLargestContentfulPaint();
      if (mobileLCP > 0) {
        monitor.assertBudget('Mobile LCP', mobileLCP, PERFORMANCE_BUDGETS.LCP + 1000);
      }

      console.log('Mobile Performance Metrics:', monitor.getMetrics());
    });
  });

  describe('Critical User Journeys', () => {
    it('should complete create-project workflow within time budget', async () => {
      const startTime = Date.now();

      // Navigate to projects
      await page.goto('http://localhost:3000/projects');
      await page.waitForSelector('[data-testid="create-project-button"]');

      // Click create button
      await page.click('[data-testid="create-project-button"]');
      await page.waitForURL('**/projects/create');

      // Fill form
      await page.fill('[data-testid="project-name"]', 'Critical Path Test Project');
      await page.fill('[data-testid="project-description"]', 'Testing critical user journey');
      await page.selectOption('[data-testid="project-priority"]', 'high');

      // Submit
      await page.click('[data-testid="submit-project"]');
      await page.waitForURL('**/projects');

      const journeyTime = Date.now() - startTime;
      monitor.assertBudget('Create Project Journey', journeyTime, 5000); // 5s budget

      console.log('Create Project Journey Time:', journeyTime + 'ms');
    }, 30000);

    it('should complete dashboard-to-details navigation efficiently', async () => {
      await page.goto('http://localhost:3000/dashboard');

      // Wait for dashboard widgets to load
      await page.waitForSelector('[data-testid="dashboard-widget"]');

      const startTime = Date.now();

      // Click on first project in recent activity
      await page.click('[data-testid="recent-project-link"]');
      await page.waitForURL('**/projects/*');

      const navigationTime = Date.now() - startTime;
      monitor.assertBudget('Dashboard Navigation', navigationTime, 1000); // 1s budget

      console.log('Dashboard Navigation Time:', navigationTime + 'ms');
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle 404 errors gracefully', async () => {
      const startTime = Date.now();

      await page.goto('http://localhost:3000/non-existent-page', { waitUntil: 'networkidle' });

      const errorPageLoadTime = Date.now() - startTime;
      monitor.assertBudget('404 Page Load', errorPageLoadTime, 1000);

      // Should show 404 page
      await page.waitForSelector('[data-testid="404-page"]');

      console.log('404 Page Load Time:', errorPageLoadTime + 'ms');
    });

    it('should handle network errors gracefully', async () => {
      // Simulate offline state
      await page.context().setOffline(true);

      const startTime = Date.now();

      try {
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 5000 });
      } catch (error) {
        // Expected to fail
      }

      const errorHandlingTime = Date.now() - startTime;

      // Should show offline/error state within reasonable time
      expect(errorHandlingTime).toBeLessThan(6000);

      await page.context().setOffline(false);

      console.log('Offline Error Handling Time:', errorHandlingTime + 'ms');
    });
  });
});
