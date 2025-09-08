import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Add authentication steps here
  });

  test('should pass accessibility audit on people module', async ({ page }) => {
    await page.goto('/people');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on drawer components', async ({ page }) => {
    await page.goto('/people');
    
    // Load demo data
    await page.getByText('Load Demo').click();
    await expect(page.getByText('Captain J. Sparrow')).toBeVisible({ timeout: 10000 });
    
    // Open drawer
    await page.getByText('Captain J. Sparrow').click();
    
    // Check drawer has proper ARIA attributes
    const drawer = page.locator('[role="dialog"]');
    await expect(drawer).toBeVisible();
    
    // Check tab navigation
    const detailsTab = page.getByRole('tab', { name: 'Details' });
    const editTab = page.getByRole('tab', { name: 'Edit' });
    
    await expect(detailsTab).toHaveAttribute('aria-selected', 'true');
    await expect(editTab).toHaveAttribute('aria-selected', 'false');
    
    // Test keyboard navigation
    await editTab.press('Enter');
    await expect(editTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should have tooltips for all icon-only controls', async ({ page }) => {
    await page.goto('/pipeline');
    
    // Check tab buttons have tooltips
    const manningTab = page.getByRole('tab', { name: /manning/i });
    const trainingTab = page.getByRole('tab', { name: /training/i });
    
    await expect(manningTab).toHaveAttribute('title');
    await expect(trainingTab).toHaveAttribute('title');
    
    // Check create button has accessible label
    const createButton = page.getByRole('button', { name: /create/i });
    await expect(createButton).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/jobs');
    
    // Load demo data
    await page.getByText('Load Demo').click();
    await expect(page.getByText('Dock Build — Night Shift')).toBeVisible({ timeout: 10000 });
    
    // Test tab navigation through records
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key to open drawer
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    
    // Test Escape to close drawer
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tab', { name: 'Details' })).not.toBeVisible();
  });

  test('should have proper form validation messages', async ({ page }) => {
    await page.goto('/finance');
    
    // Click create button
    await page.getByText('Create').click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Check for accessible error messages
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible();
    
    // Check form fields have proper labels and error associations
    const nameField = page.locator('#name');
    await expect(nameField).toHaveAttribute('aria-describedby');
  });

  test('should pass accessibility audit on all main modules', async ({ page }) => {
    const modules = ['/people', '/jobs', '/finance', '/procurement', '/pipeline', '/programming'];
    
    for (const module of modules) {
      await page.goto(module);
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should have skip links for keyboard users', async ({ page }) => {
    await page.goto('/people');
    
    // Press Tab to reveal skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.getByText('Skip to main content');
    await expect(skipLink).toBeVisible();
    
    // Test skip link functionality
    await skipLink.click();
    const mainContent = page.locator('main');
    await expect(mainContent).toBeFocused();
  });
});
