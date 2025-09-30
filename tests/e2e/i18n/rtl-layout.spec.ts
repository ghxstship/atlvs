/**
 * RTL Layout End-to-End Tests
 * Comprehensive testing for Arabic and Hebrew language support
 */

import { test, expect } from '@playwright/test';

// Test both RTL languages
const RTL_LOCALES = ['ar', 'he'] as const;

test.describe('RTL Layout Support', () => {
  
  for (const locale of RTL_LOCALES) {
    const languageName = locale === 'ar' ? 'Arabic' : 'Hebrew';
    
    test.describe(`${languageName} (${locale})`, () => {
      
      test('should set correct HTML dir attribute', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        
        // Check HTML dir attribute
        const htmlDir = await page.locator('html').getAttribute('dir');
        expect(htmlDir).toBe('rtl');
      });
      
      test('should mirror navigation layout', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        
        // Sidebar should be on the right
        const sidebar = page.locator('[data-testid="sidebar"]');
        if (await sidebar.count() > 0) {
          const position = await sidebar.evaluate(el => {
            const rect = el.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            return rect.right === windowWidth ? 'right' : 'left';
          });
          expect(position).toBe('right');
        }
      });
      
      test('should mirror button groups', async ({ page }) => {
        await page.goto(`/projects?locale=${locale}`);
        
        // Check that action buttons are right-aligned
        const actionButtons = page.locator('[data-testid="data-actions"]');
        if (await actionButtons.count() > 0) {
          const textAlign = await actionButtons.evaluate(el => 
            window.getComputedStyle(el).textAlign
          );
          expect(['right', 'end']).toContain(textAlign);
        }
      });
      
      test('should flip directional icons', async ({ page }) => {
        await page.goto(`/projects?locale=${locale}`);
        
        // Check for chevron icons (should be flipped)
        const chevrons = page.locator('[data-icon="chevron-right"]');
        if (await chevrons.count() > 0) {
          const transform = await chevrons.first().evaluate(el => 
            window.getComputedStyle(el).transform
          );
          // Should have scaleX(-1) transform for RTL
          expect(transform).toContain('scaleX(-1)');
        }
      });
      
      test('should handle form layouts correctly', async ({ page }) => {
        await page.goto(`/projects/create?locale=${locale}`);
        
        // Form labels should be right-aligned
        const labels = page.locator('label');
        if (await labels.count() > 0) {
          const textAlign = await labels.first().evaluate(el => 
            window.getComputedStyle(el).textAlign
          );
          expect(['right', 'end']).toContain(textAlign);
        }
      });
      
      test('should handle table layouts', async ({ page }) => {
        await page.goto(`/projects?locale=${locale}`);
        
        // Tables should mirror column order
        const table = page.locator('table').first();
        if (await table.count() > 0) {
          const direction = await table.evaluate(el => 
            window.getComputedStyle(el).direction
          );
          expect(direction).toBe('rtl');
        }
      });
      
      test('should handle drawer/modal positioning', async ({ page }) => {
        await page.goto(`/projects?locale=${locale}`);
        
        // Click create button to open drawer
        const createBtn = page.locator('[data-testid="create-project-btn"]');
        if (await createBtn.count() > 0) {
          await createBtn.click();
          
          // Drawer should slide from left in RTL
          const drawer = page.locator('[role="dialog"]');
          await expect(drawer).toBeVisible();
          
          const position = await drawer.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return rect.left === 0 ? 'left' : 'right';
          });
          expect(position).toBe('left');
        }
      });
      
      test('should handle breadcrumbs correctly', async ({ page }) => {
        await page.goto(`/projects/123?locale=${locale}`);
        
        const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
        if (await breadcrumbs.count() > 0) {
          // Breadcrumb separators should be flipped
          const separator = breadcrumbs.locator('.breadcrumb-separator').first();
          if (await separator.count() > 0) {
            const content = await separator.textContent();
            // Should show ← instead of → in RTL
            expect(content).toMatch(/[←]/);
          }
        }
      });
      
      test('should handle date pickers', async ({ page }) => {
        await page.goto(`/projects/create?locale=${locale}`);
        
        const datePicker = page.locator('[data-testid="date-picker"]');
        if (await datePicker.count() > 0) {
          await datePicker.click();
          
          // Calendar should be RTL
          const calendar = page.locator('[role="dialog"] [data-calendar]');
          const direction = await calendar.evaluate(el => 
            window.getComputedStyle(el).direction
          );
          expect(direction).toBe('rtl');
        }
      });
      
      test('should handle tooltips positioning', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        
        // Hover over an element with tooltip
        const tooltipTrigger = page.locator('[data-tooltip]').first();
        if (await tooltipTrigger.count() > 0) {
          await tooltipTrigger.hover();
          
          const tooltip = page.locator('[role="tooltip"]');
          await expect(tooltip).toBeVisible();
        }
      });
      
      test('should handle dropdown menus', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        
        const dropdown = page.locator('[data-testid="user-menu"]');
        if (await dropdown.count() > 0) {
          await dropdown.click();
          
          const menu = page.locator('[role="menu"]');
          await expect(menu).toBeVisible();
          
          // Menu items should be right-aligned
          const menuItem = menu.locator('[role="menuitem"]').first();
          const textAlign = await menuItem.evaluate(el => 
            window.getComputedStyle(el).textAlign
          );
          expect(['right', 'end']).toContain(textAlign);
        }
      });
      
      test('should handle complex layouts (dashboard)', async ({ page }) => {
        await page.goto(`/dashboard?locale=${locale}`);
        
        // Check that grid layout mirrors correctly
        const cards = page.locator('[data-testid="dashboard-card"]');
        if (await cards.count() > 1) {
          const firstCard = cards.first();
          const lastCard = cards.last();
          
          const firstRect = await firstCard.boundingBox();
          const lastRect = await lastCard.boundingBox();
          
          if (firstRect && lastRect) {
            // In RTL, first card should be on the right
            expect(firstRect.x).toBeGreaterThan(lastRect.x);
          }
        }
      });
      
      test('should handle bidirectional text correctly', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        
        // Elements with mixed LTR/RTL content should use bidi-isolate
        const mixedContent = page.locator('[data-bidi="mixed"]');
        if (await mixedContent.count() > 0) {
          const unicodeBidi = await mixedContent.evaluate(el => 
            window.getComputedStyle(el).unicodeBidi
          );
          expect(unicodeBidi).toBe('isolate');
        }
      });
      
      test('visual regression - homepage', async ({ page }) => {
        await page.goto(`/?locale=${locale}`);
        await page.waitForLoadState('networkidle');
        
        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot(`${locale}-homepage.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
      
      test('visual regression - projects page', async ({ page }) => {
        await page.goto(`/projects?locale=${locale}`);
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`${locale}-projects.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
      
      test('visual regression - create form', async ({ page }) => {
        await page.goto(`/projects/create?locale=${locale}`);
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`${locale}-create-form.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      });
      
    });
  }
  
  test('should switch between LTR and RTL seamlessly', async ({ page }) => {
    // Start with English (LTR)
    await page.goto('/?locale=en');
    let htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('ltr');
    
    // Switch to Arabic (RTL)
    const localeSwitcher = page.locator('[data-testid="locale-switcher"]');
    if (await localeSwitcher.count() > 0) {
      await localeSwitcher.click();
      await page.locator('[data-locale="ar"]').click();
      
      // Wait for transition
      await page.waitForTimeout(300);
      
      // Check dir changed
      htmlDir = await page.locator('html').getAttribute('dir');
      expect(htmlDir).toBe('rtl');
      
      // Verify layout mirrored
      const sidebar = page.locator('[data-testid="sidebar"]');
      if (await sidebar.count() > 0) {
        const position = await sidebar.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const windowWidth = window.innerWidth;
          return rect.right === windowWidth ? 'right' : 'left';
        });
        expect(position).toBe('right');
      }
    }
  });
});

test.describe('RTL Accessibility', () => {
  
  test('keyboard navigation should work in RTL', async ({ page }) => {
    await page.goto('/?locale=ar');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Arrow keys in dropdowns should work correctly
    const dropdown = page.locator('[data-testid="user-menu"]');
    if (await dropdown.count() > 0) {
      await dropdown.click();
      
      // ArrowLeft should move to next item in RTL
      await page.keyboard.press('ArrowLeft');
      
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });
  
  test('screen reader announcements should be correct in RTL', async ({ page }) => {
    await page.goto('/?locale=ar');
    
    // Check ARIA labels
    const buttons = page.locator('button[aria-label]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify aria-label is in correct language
    if (count > 0) {
      const ariaLabel = await buttons.first().getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});
