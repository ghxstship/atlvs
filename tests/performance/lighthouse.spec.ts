import { test, expect } from '@playwright/test';
import type { Response } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test.describe('Performance Testing with Lighthouse', () => {
  test('should meet performance budgets on home page', async ({ playwright }) => {
    const browser = await playwright.chromium.launch({
      args: ['--remote-debugging-port=9222'],
    });
    
    const page = await browser.newPage();
    await page.goto('/');
    
    const auditConfig = {
      thresholds: {
        performance: 85,
        accessibility: 90,
        'best-practices': 85,
        seo: 85,
        pwa: 80,
      },
      port: 9222,
      disableStorageReset: false,
    };

    await playAudit({
      page,
      ...auditConfig,
    });

    await browser.close();
  });

  test('should meet performance budgets on dashboard', async ({ playwright }) => {
    const browser = await playwright.chromium.launch({
      args: ['--remote-debugging-port=9223'],
    });
    
    const page = await browser.newPage();
    
    // Authenticate first
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('**/dashboard');
    
    const auditConfig = {
      thresholds: {
        performance: 80,
        accessibility: 90,
        'best-practices': 85,
        seo: 85,
        pwa: 80,
      },
      port: 9223,
      disableStorageReset: false,
    };

    await playAudit({
      page,
      ...auditConfig,
    });

    await browser.close();
  });

  test('should have acceptable Core Web Vitals', async ({ page }) => {
    // Start collecting performance metrics
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    
    await page.goto('/dashboard');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Collect Core Web Vitals
    const metrics = await client.send('Performance.getMetrics') as {
      metrics: Array<{ name: string; value: number }>;
    };
    
    const lcp = metrics.metrics.find(m => m.name === 'LargestContentfulPaint');
    const fid = metrics.metrics.find(m => m.name === 'FirstInputDelay');
    const cls = metrics.metrics.find(m => m.name === 'CumulativeLayoutShift');
    
    // LCP should be under 2.5 seconds
    if (lcp) {
      expect(lcp.value).toBeLessThan(2500);
    }
    
    // FID should be under 100ms
    if (fid) {
      expect(fid.value).toBeLessThan(100);
    }
    
    // CLS should be under 0.1
    if (cls) {
      expect(cls.value).toBeLessThan(0.1);
    }
  });

  test('should load critical resources efficiently', async ({ page }) => {
    const resources: string[] = [];
    
    page.on('response', response => {
      resources.push(response.url());
    });
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for optimized resources
    const cssResources = resources.filter(url => url.endsWith('.css'));
    const jsResources = resources.filter(url => url.endsWith('.js'));
    
    // Should have reasonable number of resources
    expect(cssResources.length).toBeLessThan(10);
    expect(jsResources.length).toBeLessThan(20);
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/projects');
    
    // Measure time to load project list
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="project-list"]');
    const loadTime = Date.now() - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check memory usage (if available)
    const memoryUsage = await page.evaluate(() => {
      const navPerformance = window.performance as Performance & { memory?: { usedJSHeapSize: number } };
      return navPerformance.memory?.usedJSHeapSize ?? null;
    });
    
    if (memoryUsage !== null) {
      // Memory usage should be reasonable (< 50MB)
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should maintain performance during user interactions', async ({ page }) => {
    await page.goto('/projects');
    
    // Measure interaction performance
    const interactions: Array<{ url: string; durationMs: number }> = [];
    const requestTimings = new Map<string, number>();
    
    page.on('request', (request) => {
      requestTimings.set(request.url(), Date.now());
    });

    page.on('response', (response) => {
      const url = response.url();
      const startedAt = requestTimings.get(response.request().url());
      if (startedAt) {
        const durationMs = Date.now() - startedAt;
        interactions.push({ url, durationMs });
        requestTimings.delete(response.request().url());
      }
    });
    
    // Perform typical user interactions
    await page.click('[data-testid="create-project-button"]');
    await page.waitForSelector('[data-testid="project-form"]');
    
    await page.fill('[data-testid="project-name-input"]', 'Performance Test Project');
    await page.fill('[data-testid="project-description-input"]', 'Testing performance');
    await page.click('[data-testid="save-project-button"]');
    
    // Wait for save operation
    await page.waitForSelector('[data-testid="project-saved-notification"]');
    
    // Check that interactions completed within reasonable time
    for (const interaction of interactions.slice(-5)) { // Last 5 interactions
      expect(interaction.durationMs).toBeLessThan(1000); // Under 1 second per interaction
    }
  });

  test('should perform well on mobile devices', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    });
    
    const page = await context.newPage();
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Mobile should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);
    
    // Test touch interactions
    await page.tap('[data-testid="nav-menu-button"]');
    await page.waitForSelector('[data-testid="mobile-menu"]');
    
    await context.close();
  });

  test('should handle offline scenarios gracefully', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to perform an action that requires network
    await page.click('[data-testid="refresh-data-button"]');
    
    // Should show offline indicator or cached data
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Should sync when back online
    await page.waitForSelector('[data-testid="online-indicator"]', { timeout: 10000 });
  });

  test('should optimize bundle size', async ({ page }) => {
    // Check bundle size by examining network requests
    const bundleRequests: Array<{ url: string; size: number }> = [];
    
    page.on('response', (response: Response) => {
      const contentLength = response.headers()['content-length'];
      if (!contentLength) return;

      if (response.url().includes('.js')) {
        const size = Number.parseInt(contentLength, 10);
        if (!Number.isNaN(size)) {
          bundleRequests.push({
            url: response.url(),
            size,
          });
        }
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Calculate total JS bundle size
    const totalSize = bundleRequests.reduce<number>((sum, req) => sum + req.size, 0);
    
    // Should be under 2MB total
    expect(totalSize).toBeLessThan(2 * 1024 * 1024);
    
    // Main bundle should be under 500KB
    const mainBundle = bundleRequests.find(req => req.url.includes('main') || req.url.includes('app'));
    if (mainBundle) {
      expect(mainBundle.size).toBeLessThan(500 * 1024);
    }
  });
});
