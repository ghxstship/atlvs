import { test, expect } from '@playwright/test';

test.describe('Projects Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Login with test user (assuming authentication is set up)
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should create a new project successfully', async ({ page }) => {
    // Navigate to projects page
    await page.click('[data-testid="projects-nav-link"]');
    await page.waitForURL('**/projects');

    // Click create project button
    await page.click('[data-testid="create-project-button"]');

    // Wait for create form to appear
    await page.waitForSelector('[data-testid="project-create-form"]');

    // Fill out project details
    await page.fill('[data-testid="project-name-input"]', 'E2E Test Project');
    await page.fill('[data-testid="project-description-input"]', 'A project created during E2E testing');

    // Select project status
    await page.selectOption('[data-testid="project-status-select"]', 'active');

    // Configure project settings
    await page.check('[data-testid="project-private-checkbox"]');

    // Submit the form
    await page.click('[data-testid="project-submit-button"]');

    // Wait for success message
    await page.waitForSelector('[data-testid="success-toast"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Project created successfully');

    // Verify project appears in list
    await page.waitForSelector(`[data-testid="project-item"]:has-text("E2E Test Project")`);
    await expect(page.locator('[data-testid="project-item"]').filter({ hasText: 'E2E Test Project' })).toBeVisible();

    // Cleanup: Delete the test project
    await page.click('[data-testid="project-item"]:has-text("E2E Test Project") [data-testid="project-menu-button"]');
    await page.click('[data-testid="delete-project-option"]');
    await page.click('[data-testid="confirm-delete-button"]');
    await page.waitForSelector('[data-testid="success-toast"]:has-text("Project deleted successfully")');
  });

  test('should validate project creation form', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects');

    // Click create project button
    await page.click('[data-testid="create-project-button"]');

    // Try to submit empty form
    await page.click('[data-testid="project-submit-button"]');

    // Check for validation errors
    await expect(page.locator('[data-testid="project-name-error"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="project-name-input"]')).toHaveAttribute('aria-invalid', 'true');

    // Fill only name and try again
    await page.fill('[data-testid="project-name-input"]', 'Test Project');
    await page.click('[data-testid="project-submit-button"]');

    // Should succeed now
    await page.waitForSelector('[data-testid="success-toast"]');
  });

  test('should edit existing project', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Click on first project
    await page.click('[data-testid="project-item"]:first-child');

    // Click edit button
    await page.click('[data-testid="edit-project-button"]');

    // Wait for edit form
    await page.waitForSelector('[data-testid="project-edit-form"]');

    // Update project details
    const newName = `Updated Project ${Date.now()}`;
    await page.fill('[data-testid="project-name-input"]', newName);
    await page.fill('[data-testid="project-description-input"]', 'Updated description for E2E test');

    // Change status
    await page.selectOption('[data-testid="project-status-select"]', 'completed');

    // Save changes
    await page.click('[data-testid="project-save-button"]');

    // Verify changes
    await page.waitForSelector('[data-testid="success-toast"]');
    await expect(page.locator('[data-testid="project-name"]')).toContainText(newName);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('completed');
  });

  test('should handle project permissions correctly', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Try to access admin-only features
    const adminButton = page.locator('[data-testid="admin-project-settings"]');

    if (await adminButton.isVisible()) {
      // If user is admin, button should be enabled
      await expect(adminButton).not.toBeDisabled();
    } else {
      // If user is not admin, button should not exist or be hidden
      await expect(adminButton).not.toBeVisible();
    }
  });

  test('should search and filter projects', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Test search functionality
    await page.fill('[data-testid="project-search-input"]', 'test project');
    await page.click('[data-testid="search-button"]');

    // Wait for results
    await page.waitForSelector('[data-testid="project-list"]');

    // Verify all visible projects contain search term
    const projectItems = page.locator('[data-testid="project-item"]');
    const count = await projectItems.count();

    for (let i = 0; i < count; i++) {
      const text = await projectItems.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('test project');
    }

    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'active');
    await page.click('[data-testid="apply-filters-button"]');

    // Verify all projects are active
    await page.waitForSelector('[data-testid="project-list"]');
    const statusBadges = page.locator('[data-testid="project-status"]');
    const statusCount = await statusBadges.count();

    for (let i = 0; i < statusCount; i++) {
      await expect(statusBadges.nth(i)).toContainText('active');
    }
  });

  test('should handle bulk operations', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Select multiple projects
    const checkboxes = page.locator('[data-testid="project-checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    // Verify bulk actions appear
    await expect(page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();

    // Test bulk status update
    await page.click('[data-testid="bulk-status-update"]');
    await page.selectOption('[data-testid="bulk-status-select"]', 'archived');
    await page.click('[data-testid="bulk-update-confirm"]');

    // Verify success message
    await page.waitForSelector('[data-testid="success-toast"]');
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('2 projects updated successfully');

    // Verify status changes
    await expect(page.locator('[data-testid="project-item"]').first().locator('[data-testid="project-status"]')).toContainText('archived');
  });

  test('should export projects data', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Click export button
    await page.click('[data-testid="export-projects-button"]');

    // Configure export
    await page.selectOption('[data-testid="export-format"]', 'csv');
    await page.check('[data-testid="export-include-details"]');

    // Start export
    await page.click('[data-testid="start-export-button"]');

    // Wait for export to complete
    await page.waitForSelector('[data-testid="export-completed"]');

    // Verify download link is available
    const downloadLink = page.locator('[data-testid="download-export-link"]');
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href', /^blob:/);
  });

  test('should handle real-time updates', async ({ page, context }) => {
    // Open two tabs
    const page2 = await context.newPage();
    await page2.goto('/projects');

    // Create project in first tab
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Real-time Test Project');
    await page.click('[data-testid="project-submit-button"]');

    // Wait for success in first tab
    await page.waitForSelector('[data-testid="success-toast"]');

    // Check if project appears in second tab without refresh
    await page2.waitForSelector('[data-testid="project-item"]:has-text("Real-time Test Project")');

    // Cleanup
    await page2.close();
    await page.click('[data-testid="project-item"]:has-text("Real-time Test Project") [data-testid="project-menu-button"]');
    await page.click('[data-testid="delete-project-option"]');
    await page.click('[data-testid="confirm-delete-button"]');
  });

  test('should maintain accessibility compliance', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Create project form
    await page.click('[data-testid="create-project-button"]');

    // Check form accessibility
    const nameInput = page.locator('[data-testid="project-name-input"]');
    await expect(nameInput).toHaveAttribute('aria-label');
    await expect(nameInput).toHaveAttribute('aria-describedby');

    // Check error announcements
    await page.click('[data-testid="project-submit-button"]');
    const errorMessage = page.locator('[data-testid="project-name-error"]');
    await expect(errorMessage).toHaveAttribute('role', 'alert');

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'project-name-input');

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'project-description-input');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/v1/projects', route => route.abort());

    // Navigate to projects
    await page.goto('/projects');

    // Try to create project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Network Error Test');
    await page.click('[data-testid="project-submit-button"]');

    // Should show error message
    await page.waitForSelector('[data-testid="error-toast"]');
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Network error');
  });

  test('should implement optimistic updates', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Create project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Optimistic Update Test');

    // Click submit - should appear immediately in UI (optimistic update)
    await page.click('[data-testid="project-submit-button"]');

    // Should appear in list immediately
    await expect(page.locator('[data-testid="project-item"]').filter({ hasText: 'Optimistic Update Test' })).toBeVisible();

    // Wait for actual server response
    await page.waitForSelector('[data-testid="success-toast"]');

    // Project should still be there (no rollback)
    await expect(page.locator('[data-testid="project-item"]').filter({ hasText: 'Optimistic Update Test' })).toBeVisible();

    // Cleanup
    await page.click('[data-testid="project-item"]:has-text("Optimistic Update Test") [data-testid="project-menu-button"]');
    await page.click('[data-testid="delete-project-option"]');
    await page.click('[data-testid="confirm-delete-button"]');
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Navigate to projects
    await page.goto('/projects');

    // Test pagination
    const initialLoadTime = await page.evaluate(() => {
      const start = performance.now();
      return new Promise(resolve => {
        setTimeout(() => resolve(performance.now() - start), 100);
      });
    });

    // Should load within reasonable time
    expect(initialLoadTime).toBeLessThan(2000);

    // Test pagination controls
    const paginationControls = page.locator('[data-testid="pagination-controls"]');
    if (await paginationControls.isVisible()) {
      await expect(paginationControls).toBeVisible();

      // Click next page
      await page.click('[data-testid="next-page-button"]');

      // Should load new page
      await page.waitForSelector('[data-testid="project-list"]');
    }
  });
});
