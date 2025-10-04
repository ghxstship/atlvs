import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  chromium,
  type Browser,
  type ConsoleMessage,
  type Page,
} from 'playwright';

type BundleMetrics = {
  main: number;
  vendor: number;
  total: number;
};

interface WindowWithLcp extends Window {
  _lcp?: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
  };
}

const PERFORMANCE_BUDGETS = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TBT: 300,
  TTI: 3000,
  PAGE_LOAD: 2000,
  FIRST_PAINT: 1000,
  MAIN_BUNDLE: 500,
  VENDOR_BUNDLE: 1000,
  TOTAL_JS: 1200,
};

const JS_EXTENSIONS = ['.js', '.mjs', '.cjs'] as const;

class PerformanceMonitor {
  constructor(private readonly page: Page) {}

  async startMonitoring(): Promise<void> {
    await this.page.evaluate(() => {
      if (window.performance.clearMeasures) {
        window.performance.clearMeasures();
      }
    });

    await this.page.evaluate(() => {
      window.performance.mark('test-start');
    });
  }

  async measurePageLoad(): Promise<number> {
    return this.page.evaluate(() => {
      const navigation = window.performance
        .getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

      if (!navigation) {
        return 0;
      }

      return navigation.loadEventEnd - navigation.fetchStart;
    });
  }

  async measureFirstPaint(): Promise<number> {
    return this.page.evaluate(() => {
      const paintEntries = window.performance.getEntriesByType('paint');
      const entry = paintEntries.find(item => item.name === 'first-paint');
      return entry ? entry.startTime : 0;
    });
  }

  async measureFirstContentfulPaint(): Promise<number> {
    return this.page.evaluate(() => {
      const paintEntries = window.performance.getEntriesByType('paint');
      const entry = paintEntries.find(item => item.name === 'first-contentful-paint');
      return entry ? entry.startTime : 0;
    });
  }

  async measureLargestContentfulPaint(): Promise<number> {
    await this.page.waitForTimeout(1000);

    return this.page.evaluate(() => {
      const entries = window.performance.getEntriesByType('largest-contentful-paint');
      if (!entries.length) {
        return 0;
      }

      return Math.max(...entries.map(entry => entry.startTime));
    });
  }

  async measureTimeToInteractive(): Promise<number> {
    return this.page.evaluate(() => {
      const navigation = window.performance
        .getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

      if (!navigation) {
        return 0;
      }

      return navigation.domInteractive - navigation.fetchStart;
    });
  }

  async measureBundleSizes(): Promise<BundleMetrics> {
    return this.page.evaluate(jsExtensions => {
      const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(resource =>
        jsExtensions.some(ext => resource.name.includes(ext)),
      );

      let mainBundleBytes = 0;
      let vendorBundleBytes = 0;

      for (const resource of jsResources) {
        const size = resource.transferSize || resource.encodedBodySize || 0;

        if (resource.name.includes('main') || resource.name.includes('app')) {
          mainBundleBytes += size;
        } else if (resource.name.includes('vendor') || resource.name.includes('chunk')) {
          vendorBundleBytes += size;
        }
      }

      const kilobyte = 1024;

      return {
        main: mainBundleBytes / kilobyte,
        vendor: vendorBundleBytes / kilobyte,
        total: (mainBundleBytes + vendorBundleBytes) / kilobyte,
      } satisfies BundleMetrics;
    }, JS_EXTENSIONS);
  }

  assertBudget(
    metric: string,
    value: number,
    budget: number,
  ): void {
    if (value > budget) {
      throw new Error(`Performance budget exceeded for ${metric}: ${value.toFixed(2)}ms (budget: ${budget}ms)`);
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

    await page.setViewportSize({ width: 1280, height: 720 });

    await page.addInitScript(() => {
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const typedWindow = window as WindowWithLcp;
          typedWindow._lcp = lastEntry.startTime;
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
    }, 30000);

    it('should maintain bundle size budgets', async () => {
      await page.waitForLoadState('networkidle');

      const bundleSizes = await monitor.measureBundleSizes();
      monitor.assertBudget('Main Bundle Size', bundleSizes.main, PERFORMANCE_BUDGETS.MAIN_BUNDLE);
      monitor.assertBudget('Vendor Bundle Size', bundleSizes.vendor, PERFORMANCE_BUDGETS.VENDOR_BUNDLE);
      monitor.assertBudget('Total JS Size', bundleSizes.total, PERFORMANCE_BUDGETS.TOTAL_JS);
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
    }, 30000);

    it('should handle user interactions efficiently', async () => {
      await page.waitForSelector('[data-testid="dashboard-metrics"]', { timeout: 10000 });

      const startTime = Date.now();

      await page.click('[data-testid="nav-projects"]');
      await page.waitForURL('**/projects');

      const interactionTime = Date.now() - startTime;
      monitor.assertBudget('Navigation Interaction', interactionTime, 500);
    });
  });

  describe('Data-Heavy Pages Performance', () => {
    it('should handle large datasets efficiently', async () => {
      await monitor.startMonitoring();
      await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });

      const loadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Projects Page Load', loadTime, PERFORMANCE_BUDGETS.PAGE_LOAD + 500);

      await page.waitForSelector('[data-testid="data-table"]', { timeout: 15000 });

      const renderTime = await monitor.measureTimeToInteractive();
      monitor.assertBudget('Projects TTI', renderTime, PERFORMANCE_BUDGETS.TTI + 1000);
    }, 45000);
  });

  describe('Form Performance', () => {
    it('should handle form interactions efficiently', async () => {
      await page.goto('http://localhost:3000/projects/create');
      await page.waitForSelector('form', { timeout: 10000 });

      const startTime = Date.now();

      await page.fill('[data-testid="project-name"]', 'Performance Test Project');
      await page.fill('[data-testid="project-description"]', 'Testing form performance');
      await page.selectOption('[data-testid="project-status"]', 'active');

      await page.click('[data-testid="submit-button"]');

      const formInteractionTime = Date.now() - startTime;
      monitor.assertBudget('Form Submission', formInteractionTime, 1000);
    }, 30000);
  });

  describe('Memory Usage & Resource Efficiency', () => {
    it('should not have excessive memory leaks', async () => {
      const pagesToVisit: ReadonlyArray<string> = [
        '/dashboard',
        '/projects',
        '/finance',
        '/people',
        '/settings',
      ];

      for (const pagePath of pagesToVisit) {
        await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      }

      const errors: string[] = [];
      page.on('console', (message: ConsoleMessage) => {
        if (message.type() === 'error') {
          errors.push(message.text());
        }
      });

      expect(errors.length).toBe(0);

      const memoryUsage = await page.evaluate(() => {
        if ('memory' in performance) {
          const perfWithMemory = performance as PerformanceWithMemory;
          const { memory } = perfWithMemory;

          if (memory) {
            const kilobyte = 1024;
            return memory.usedJSHeapSize / kilobyte / kilobyte;
          }
        }

        return 0;
      });

      expect(memoryUsage).toBeLessThan(100);
    });
  });

  describe('Mobile Performance', () => {
    it('should perform well on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });

      await monitor.startMonitoring();
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });

      const mobileLoadTime = await monitor.measurePageLoad();
      monitor.assertBudget('Mobile Page Load', mobileLoadTime, PERFORMANCE_BUDGETS.PAGE_LOAD + 500);

      const mobileLcp = await monitor.measureLargestContentfulPaint();
      if (mobileLcp > 0) {
        monitor.assertBudget('Mobile LCP', mobileLcp, PERFORMANCE_BUDGETS.LCP + 1000);
      }
    });
  });

  describe('Critical User Journeys', () => {
    it('should complete create-project workflow within time budget', async () => {
      const startTime = Date.now();

      await page.goto('http://localhost:3000/projects');
      await page.waitForSelector('[data-testid="create-project-button"]');

      await page.click('[data-testid="create-project-button"]');
      await page.waitForURL('**/projects/create');

      await page.fill('[data-testid="project-name"]', 'Critical Path Test Project');
      await page.fill('[data-testid="project-description"]', 'Testing critical user journey');
      await page.selectOption('[data-testid="project-priority"]', 'high');

      await page.click('[data-testid="submit-project"]');
      await page.waitForURL('**/projects');

      const journeyTime = Date.now() - startTime;
      monitor.assertBudget('Create Project Journey', journeyTime, 5000);
    }, 30000);

    it('should complete dashboard-to-details navigation efficiently', async () => {
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForSelector('[data-testid="dashboard-widget"]');

      const startTime = Date.now();

      await page.click('[data-testid="recent-project-link"]');
      await page.waitForURL('**/projects/*');

      const navigationTime = Date.now() - startTime;
      monitor.assertBudget('Dashboard Navigation', navigationTime, 1000);
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle 404 errors gracefully', async () => {
      const startTime = Date.now();

      await page.goto('http://localhost:3000/non-existent-page', { waitUntil: 'networkidle' });

      const errorPageLoadTime = Date.now() - startTime;
      monitor.assertBudget('404 Page Load', errorPageLoadTime, 1000);

      await page.waitForSelector('[data-testid="404-page"]');
    });

    it('should handle network errors gracefully', async () => {
      await page.context().setOffline(true);

      const startTime = Date.now();

      try {
        await page.goto('http://localhost:3000/dashboard', {
          waitUntil: 'networkidle',
          timeout: 5000,
        });
      } catch (error: unknown) {
        expect(error).toBeDefined();
      }

      const errorHandlingTime = Date.now() - startTime;
      expect(errorHandlingTime).toBeLessThan(6000);

      await page.context().setOffline(false);
    });
  });
});
