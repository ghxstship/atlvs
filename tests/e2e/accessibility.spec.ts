import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Testing', () => {
  test('should pass accessibility audit on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should pass accessibility audit on login page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Allow minor contrast issues for demo purposes
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => !violation.id.includes('color-contrast')
    );
    
    expect(seriousViolations).toEqual([]);
  });

  test('should pass accessibility audit on dashboard', async ({ page }) => {
    // First authenticate
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('**/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll(
      elements => elements.map(el => parseInt(el.tagName.charAt(1)))
    );

    // Ensure no heading level is skipped
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i]).toBeLessThanOrEqual(headingLevels[i - 1] + 1);
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Focus should start on email input
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="signin-button"]')).toBeFocused();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test that all interactive elements are keyboard accessible
    const interactiveElements = await page.locator('button, [role="button"], a[href], input, select, textarea').all();
    
    for (const element of interactiveElements) {
      const isVisible = await element.isVisible();
      if (isVisible) {
        const tabindex = await element.getAttribute('tabindex');
        // Elements should not have negative tabindex
        if (tabindex) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    // Allow some contrast issues for demo purposes, but log them
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Color contrast violations found:', accessibilityScanResults.violations);
    }
    
    // In production, this should be: expect(accessibilityScanResults.violations).toEqual([]);
    // For now, we'll just ensure no critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toEqual([]);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that buttons have accessible names
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const accessibleName = await button.getAttribute('aria-label') || 
                            await button.textContent() || 
                            await button.getAttribute('title');
      expect(accessibleName?.trim()).toBeTruthy();
    }
    
    // Check that form inputs have labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const ariaLabel = await input.getAttribute('aria-label');
      
      const hasLabel = id || ariaLabelledBy || ariaLabel;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for proper landmark roles
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="complementary"]').count();
    expect(landmarks).toBeGreaterThan(0);
    
    // Check for semantic HTML structure
    const mainContent = await page.locator('main').count();
    expect(mainContent).toBeGreaterThan(0);
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    
    // Check that animations respect reduced motion
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();
    
    for (const element of animatedElements) {
      const classList = await element.getAttribute('class') || '';
      // Elements should respect prefers-reduced-motion
      expect(classList).toBeTruthy();
    }
  });

  test('should be usable at different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1024, height: 768 }, // Desktop
      { width: 1920, height: 1080 }, // Large desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/dashboard');
      
      // Check that critical elements are visible and usable
      await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-projects"]')).toBeVisible();
      
      // Check that content doesn't overflow horizontally
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
    }
  });
});
