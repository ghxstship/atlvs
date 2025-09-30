import { test, expect } from '@playwright/test';

test.describe('Critical User Workflows', () => {
  test.use({ storageState: 'tests/e2e/auth-state.json' });

  test('should complete full project lifecycle', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to projects
    await page.click('[data-testid="nav-projects"]');
    await page.waitForURL('**/projects');
    
    // Create new project
    await page.click('[data-testid="create-project-button"]');
    await page.waitForSelector('[data-testid="project-form"]');
    
    const projectName = `E2E Test Project ${Date.now()}`;
    await page.fill('[data-testid="project-name-input"]', projectName);
    await page.fill('[data-testid="project-description-input"]', 'Created during E2E testing');
    await page.selectOption('[data-testid="project-status-select"]', 'active');
    await page.click('[data-testid="save-project-button"]');
    
    // Wait for project creation success
    await page.waitForSelector('[data-testid="project-created-notification"]');
    
    // Verify project appears in list
    await expect(page.locator('[data-testid="project-list"]')).toContainText(projectName);
    
    // Edit project
    await page.click(`[data-testid="project-item-${projectName.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="edit-project-button"]`);
    await page.waitForSelector('[data-testid="project-form"]');
    
    await page.fill('[data-testid="project-description-input"]', 'Updated during E2E testing');
    await page.click('[data-testid="save-project-button"]');
    
    // Wait for update success
    await page.waitForSelector('[data-testid="project-updated-notification"]');
    
    // Archive project
    await page.click(`[data-testid="project-item-${projectName.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="archive-project-button"]`);
    await page.click('[data-testid="confirm-archive-button"]');
    
    // Wait for archive success
    await page.waitForSelector('[data-testid="project-archived-notification"]');
    
    // Verify project is archived
    await page.selectOption('[data-testid="status-filter"]', 'archived');
    await expect(page.locator('[data-testid="project-list"]')).toContainText(projectName);
  });

  test('should handle finance workflow end-to-end', async ({ page }) => {
    await page.goto('/finance');
    
    // Create budget
    await page.click('[data-testid="create-budget-tab"]');
    await page.click('[data-testid="create-budget-button"]');
    await page.waitForSelector('[data-testid="budget-form"]');
    
    const budgetName = `E2E Budget ${Date.now()}`;
    await page.fill('[data-testid="budget-name-input"]', budgetName);
    await page.fill('[data-testid="budget-amount-input"]', '10000');
    await page.selectOption('[data-testid="budget-category-select"]', 'equipment');
    await page.click('[data-testid="save-budget-button"]');
    
    await page.waitForSelector('[data-testid="budget-created-notification"]');
    
    // Create expense linked to budget
    await page.click('[data-testid="expenses-tab"]');
    await page.click('[data-testid="create-expense-button"]');
    await page.waitForSelector('[data-testid="expense-form"]');
    
    const expenseDescription = `E2E Expense ${Date.now()}`;
    await page.fill('[data-testid="expense-description-input"]', expenseDescription);
    await page.fill('[data-testid="expense-amount-input"]', '1500');
    await page.selectOption('[data-testid="expense-budget-select"]', budgetName);
    await page.selectOption('[data-testid="expense-category-select"]', 'equipment');
    await page.click('[data-testid="submit-expense-button"]');
    
    await page.waitForSelector('[data-testid="expense-submitted-notification"]');
    
    // Approve expense (assuming user has approval permissions)
    await page.click(`[data-testid="expense-item-${expenseDescription.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="approve-expense-button"]`);
    await page.click('[data-testid="confirm-approve-button"]');
    
    await page.waitForSelector('[data-testid="expense-approved-notification"]');
    
    // Verify budget utilization updated
    await page.click('[data-testid="budgets-tab"]');
    await expect(page.locator(`[data-testid="budget-item-${budgetName.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="budget-utilization"]`)).toContainText('15%');
  });

  test('should complete people management workflow', async ({ page }) => {
    await page.goto('/people');
    
    // Create new team member
    await page.click('[data-testid="create-member-button"]');
    await page.waitForSelector('[data-testid="member-form"]');
    
    const memberEmail = `e2e-member-${Date.now()}@example.com`;
    const memberName = `E2E Member ${Date.now()}`;
    
    await page.fill('[data-testid="member-name-input"]', memberName);
    await page.fill('[data-testid="member-email-input"]', memberEmail);
    await page.selectOption('[data-testid="member-role-select"]', 'member');
    await page.selectOption('[data-testid="member-department-select"]', 'engineering');
    await page.click('[data-testid="invite-member-button"]');
    
    await page.waitForSelector('[data-testid="member-invited-notification"]');
    
    // Verify member appears in pending invitations
    await page.click('[data-testid="pending-tab"]');
    await expect(page.locator('[data-testid="pending-members-list"]')).toContainText(memberEmail);
    
    // Update member permissions
    await page.click('[data-testid="active-tab"]');
    await page.click(`[data-testid="member-item-${memberName.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="edit-permissions-button"]`);
    await page.waitForSelector('[data-testid="permissions-modal"]');
    
    await page.check('[data-testid="permission-projects-create"]');
    await page.check('[data-testid="permission-finance-view"]');
    await page.click('[data-testid="save-permissions-button"]');
    
    await page.waitForSelector('[data-testid="permissions-updated-notification"]');
    
    // Deactivate member
    await page.click(`[data-testid="member-item-${memberName.replace(/\s+/g, '-').toLowerCase()}"] [data-testid="deactivate-member-button"]`);
    await page.fill('[data-testid="deactivation-reason-input"]', 'End-to-end testing');
    await page.click('[data-testid="confirm-deactivate-button"]');
    
    await page.waitForSelector('[data-testid="member-deactivated-notification"]');
  });

  test('should handle settings configuration workflow', async ({ page }) => {
    await page.goto('/settings');
    
    // Update organization settings
    await page.click('[data-testid="organization-tab"]');
    await page.fill('[data-testid="org-name-input"]', 'Updated Org Name');
    await page.fill('[data-testid="org-description-input"]', 'Updated description for E2E testing');
    await page.click('[data-testid="save-org-settings-button"]');
    
    await page.waitForSelector('[data-testid="settings-saved-notification"]');
    
    // Configure team settings
    await page.click('[data-testid="teams-tab"]');
    await page.click('[data-testid="invite-member-button"]');
    await page.fill('[data-testid="invite-email-input"]', `team-member-${Date.now()}@example.com`);
    await page.selectOption('[data-testid="invite-role-select"]', 'viewer');
    await page.click('[data-testid="send-invite-button"]');
    
    await page.waitForSelector('[data-testid="invite-sent-notification"]');
    
    // Update billing settings
    await page.click('[data-testid="billing-tab"]');
    await page.click('[data-testid="manage-billing-button"]');
    
    // This would redirect to Stripe billing portal in real implementation
    await expect(page.url()).toMatch(/stripe\.com|billing/);
    
    // Update notification preferences
    await page.goto('/settings');
    await page.click('[data-testid="notifications-tab"]');
    
    await page.check('[data-testid="email-project-updates"]');
    await page.uncheck('[data-testid="email-marketing"]');
    await page.check('[data-testid="slack-notifications"]');
    await page.click('[data-testid="save-notification-settings-button"]');
    
    await page.waitForSelector('[data-testid="notification-settings-saved-notification"]');
  });

  test('should handle data import/export workflow', async ({ page }) => {
    await page.goto('/projects');
    
    // Export projects data
    await page.click('[data-testid="export-button"]');
    await page.selectOption('[data-testid="export-format-select"]', 'csv');
    await page.check('[data-testid="include-archived-checkbox"]');
    await page.click('[data-testid="start-export-button"]');
    
    await page.waitForSelector('[data-testid="export-completed-notification"]');
    
    // Download should be triggered
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-export-button"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/projects.*\.csv/);
    
    // Test import functionality
    await page.click('[data-testid="import-button"]');
    await page.setInputFiles('[data-testid="file-upload-input"]', 'tests/fixtures/sample-projects.csv');
    await page.click('[data-testid="start-import-button"]');
    
    await page.waitForSelector('[data-testid="import-progress"]');
    
    // Wait for import completion
    await page.waitForSelector('[data-testid="import-completed-notification"]');
    
    // Verify imported data
    await page.reload();
    await expect(page.locator('[data-testid="project-count"]')).toContainText('5'); // Assuming sample data has 5 projects
  });

  test('should handle error recovery workflows', async ({ page }) => {
    // Test network error recovery
    await page.goto('/projects');
    await page.context().setOffline(true);
    
    await page.click('[data-testid="refresh-button"]');
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Restore connection
    await page.context().setOffline(false);
    await page.click('[data-testid="retry-button"]');
    
    await page.waitForSelector('[data-testid="online-indicator"]');
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible();
    
    // Test form validation error recovery
    await page.click('[data-testid="create-project-button"]');
    await page.click('[data-testid="save-project-button"]'); // Submit empty form
    
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    
    // Fill required fields
    await page.fill('[data-testid="project-name-input"]', 'Recovery Test Project');
    await page.fill('[data-testid="project-description-input"]', 'Testing error recovery');
    await page.click('[data-testid="save-project-button"]');
    
    await page.waitForSelector('[data-testid="project-created-notification"]');
    
    // Test session timeout recovery
    await page.context().clearCookies();
    await page.reload();
    
    await page.waitForURL('**/auth/signin');
    
    // Re-authenticate
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    
    await page.waitForURL('**/dashboard');
  });

  test('should handle bulk operations efficiently', async ({ page }) => {
    await page.goto('/projects');
    
    // Select multiple projects
    await page.check('[data-testid="select-all-checkbox"]');
    
    const selectedCount = await page.locator('[data-testid="selected-count"]').textContent();
    expect(parseInt(selectedCount || '0')).toBeGreaterThan(1);
    
    // Perform bulk archive
    await page.click('[data-testid="bulk-actions-button"]');
    await page.click('[data-testid="bulk-archive-option"]');
    await page.click('[data-testid="confirm-bulk-action-button"]');
    
    await page.waitForSelector('[data-testid="bulk-operation-completed-notification"]');
    
    // Verify bulk operation results
    await page.selectOption('[data-testid="status-filter"]', 'archived');
    await expect(page.locator('[data-testid="project-list"]')).toBeVisible();
    
    // Test bulk export
    await page.check('[data-testid="select-all-checkbox"]');
    await page.click('[data-testid="bulk-actions-button"]');
    await page.click('[data-testid="bulk-export-option"]');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="confirm-bulk-export-button"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/bulk-export.*\.csv/);
  });
});
