/**
 * End-to-End Test Suite for Supabase Integration
 * Tests all CRUD operations, auth flows, and enterprise features
 */

import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const TEST_EMAIL = 'test@ghxstship.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_ORG_ID = 'test-org-id';

// Test data
const testProject = {
  name: 'E2E Test Project',
  status: 'planning',
  description: 'Test project for E2E validation'
};

const testTask = {
  title: 'E2E Test Task',
  status: 'pending',
  description: 'Test task for E2E validation'
};

const testCompany = {
  name: 'E2E Test Company',
  email: 'contact@testcompany.com',
  website: 'https://testcompany.com'
};

test.describe('Supabase Integration E2E Tests', () => {
  let supabase: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Authentication Flow', () => {
    test('should sign up new user', async () => {
      await page.goto('/auth/signup');
      
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.fill('[data-testid="confirm-password-input"]', TEST_PASSWORD);
      await page.fill('[data-testid="full-name-input"]', 'Test User');
      
      await page.click('[data-testid="signup-button"]');
      
      // Should redirect to email verification
      await expect(page).toHaveURL(/\/auth\/verify/);
      await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
    });

    test('should sign in existing user', async () => {
      await page.goto('/auth/signin');
      
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      
      await page.click('[data-testid="signin-button"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle failed login', async () => {
      await page.goto('/auth/signin');
      
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', 'WrongPassword');
      
      await page.click('[data-testid="signin-button"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });

    test('should sign out user', async () => {
      // First sign in
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      
      // Then sign out
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="signout-button"]');
      
      // Should redirect to landing page
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Projects CRUD Operations', () => {
    test.beforeEach(async () => {
      // Sign in before each test
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.waitForURL(/\/dashboard/);
      
      // Navigate to projects
      await page.click('[data-testid="nav-projects"]');
      await page.waitForURL(/\/projects/);
    });

    test('should create new project', async () => {
      await page.click('[data-testid="create-project-button"]');
      
      // Fill project form
      await page.fill('[data-testid="project-name-input"]', testProject.name);
      await page.selectOption('[data-testid="project-status-select"]', testProject.status);
      await page.fill('[data-testid="project-description-textarea"]', testProject.description);
      
      await page.click('[data-testid="save-project-button"]');
      
      // Should show success message and new project in list
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator(`[data-testid="project-${testProject.name}"]`)).toBeVisible();
    });

    test('should view project details', async () => {
      // Click on project to open drawer
      await page.click(`[data-testid="project-${testProject.name}"]`);
      
      // Should open project drawer
      await expect(page.locator('[data-testid="project-drawer"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-drawer-title"]')).toContainText(testProject.name);
      
      // Check tabs are present
      await expect(page.locator('[data-testid="details-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="comments-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-tab"]')).toBeVisible();
      await expect(page.locator('[data-testid="files-tab"]')).toBeVisible();
    });

    test('should edit project', async () => {
      await page.click(`[data-testid="project-${testProject.name}"]`);
      await page.click('[data-testid="edit-project-button"]');
      
      // Update project name
      const updatedName = `${testProject.name} - Updated`;
      await page.fill('[data-testid="project-name-input"]', updatedName);
      
      await page.click('[data-testid="save-project-button"]');
      
      // Should show success and updated name
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator(`[data-testid="project-${updatedName}"]`)).toBeVisible();
    });

    test('should add comment to project', async () => {
      await page.click(`[data-testid="project-${testProject.name}"]`);
      await page.click('[data-testid="comments-tab"]');
      
      const commentText = 'This is a test comment';
      await page.fill('[data-testid="comment-input"]', commentText);
      await page.click('[data-testid="add-comment-button"]');
      
      // Should show new comment
      await expect(page.locator('[data-testid="comment-list"]')).toContainText(commentText);
    });

    test('should delete project', async () => {
      await page.click(`[data-testid="project-${testProject.name}"]`);
      await page.click('[data-testid="delete-project-button"]');
      
      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Should show success and project should be removed
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator(`[data-testid="project-${testProject.name}"]`)).not.toBeVisible();
    });
  });

  test.describe('Data Views Integration', () => {
    test.beforeEach(async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.waitForURL(/\/dashboard/);
      await page.click('[data-testid="nav-projects"]');
    });

    test('should switch between data views', async () => {
      // Test Grid View
      await page.click('[data-testid="view-switcher-grid"]');
      await expect(page.locator('[data-testid="data-grid"]')).toBeVisible();
      
      // Test Kanban View
      await page.click('[data-testid="view-switcher-kanban"]');
      await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
      
      // Test Calendar View
      await page.click('[data-testid="view-switcher-calendar"]');
      await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
      
      // Test List View
      await page.click('[data-testid="view-switcher-list"]');
      await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
    });

    test('should filter data', async () => {
      await page.click('[data-testid="filter-button"]');
      await page.selectOption('[data-testid="filter-field-select"]', 'status');
      await page.selectOption('[data-testid="filter-operator-select"]', 'equals');
      await page.selectOption('[data-testid="filter-value-select"]', 'active');
      await page.click('[data-testid="apply-filter-button"]');
      
      // Should show filtered results
      await expect(page.locator('[data-testid="filter-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="filter-indicator"]')).toContainText('status = active');
    });

    test('should sort data', async () => {
      await page.click('[data-testid="sort-button"]');
      await page.selectOption('[data-testid="sort-field-select"]', 'name');
      await page.selectOption('[data-testid="sort-direction-select"]', 'desc');
      await page.click('[data-testid="apply-sort-button"]');
      
      // Should show sort indicator
      await expect(page.locator('[data-testid="sort-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="sort-indicator"]')).toContainText('name ↓');
    });

    test('should search data', async () => {
      const searchTerm = 'test';
      await page.fill('[data-testid="search-input"]', searchTerm);
      await page.press('[data-testid="search-input"]', 'Enter');
      
      // Should show search results
      await expect(page.locator('[data-testid="search-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-indicator"]')).toContainText(`Search: ${searchTerm}`);
    });
  });

  test.describe('Import/Export Operations', () => {
    test.beforeEach(async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.waitForURL(/\/dashboard/);
      await page.click('[data-testid="nav-projects"]');
    });

    test('should export data as CSV', async () => {
      await page.click('[data-testid="export-button"]');
      await page.selectOption('[data-testid="export-format-select"]', 'csv');
      
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="start-export-button"]');
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toContain('.csv');
    });

    test('should export data as JSON', async () => {
      await page.click('[data-testid="export-button"]');
      await page.selectOption('[data-testid="export-format-select"]', 'json');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="start-export-button"]');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toContain('.json');
    });

    test('should import CSV data', async () => {
      await page.click('[data-testid="import-button"]');
      
      // Upload CSV file
      const csvContent = `name,status,description
Test Import Project 1,planning,Imported project 1
Test Import Project 2,active,Imported project 2`;
      
      await page.setInputFiles('[data-testid="import-file-input"]', {
        name: 'test-projects.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent)
      });
      
      await page.click('[data-testid="start-import-button"]');
      
      // Should show import progress
      await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
      
      // Wait for completion
      await expect(page.locator('[data-testid="import-success"]')).toBeVisible();
      
      // Should show imported projects
      await expect(page.locator('[data-testid="project-Test Import Project 1"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-Test Import Project 2"]')).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should receive real-time updates', async () => {
      // Open two browser contexts to simulate multiple users
      const context2 = await page.context().browser()!.newContext();
      const page2 = await context2.newPage();
      
      // Sign in both users
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.click('[data-testid="nav-projects"]');
      
      await page2.goto('/auth/signin');
      await page2.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page2.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page2.click('[data-testid="signin-button"]');
      await page2.click('[data-testid="nav-projects"]');
      
      // Create project in first browser
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Realtime Test Project');
      await page.click('[data-testid="save-project-button"]');
      
      // Should appear in second browser automatically
      await expect(page2.locator('[data-testid="project-Realtime Test Project"]')).toBeVisible({ timeout: 5000 });
      
      await context2.close();
    });
  });

  test.describe('File Upload/Download', () => {
    test.beforeEach(async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.waitForURL(/\/dashboard/);
      await page.click('[data-testid="nav-projects"]');
      
      // Create a test project
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'File Test Project');
      await page.click('[data-testid="save-project-button"]');
      
      // Open project drawer
      await page.click('[data-testid="project-File Test Project"]');
      await page.click('[data-testid="files-tab"]');
    });

    test('should upload file', async () => {
      const fileContent = 'This is a test file content';
      
      await page.setInputFiles('[data-testid="file-upload-input"]', {
        name: 'test-document.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(fileContent)
      });
      
      await page.click('[data-testid="upload-file-button"]');
      
      // Should show uploaded file
      await expect(page.locator('[data-testid="file-test-document.txt"]')).toBeVisible();
    });

    test('should download file', async () => {
      // First upload a file
      await page.setInputFiles('[data-testid="file-upload-input"]', {
        name: 'download-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('Download test content')
      });
      await page.click('[data-testid="upload-file-button"]');
      
      // Then download it
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-file-download-test.txt"]');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('download-test.txt');
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should enforce organization access', async () => {
      // Sign in as user
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      
      // Try to access different organization's data
      await page.goto(`/projects?org=${TEST_ORG_ID}-different`);
      
      // Should show access denied or redirect
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    });

    test('should enforce feature access', async () => {
      // Sign in as user without ATLVS access
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', 'limited@test.com');
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      
      // Try to access ATLVS features
      await page.goto('/projects');
      
      // Should show feature gate
      await expect(page.locator('[data-testid="feature-gate-atlvs"]')).toBeVisible();
      await expect(page.locator('[data-testid="upgrade-button"]')).toBeVisible();
    });
  });

  test.describe('Performance and Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.click('[data-testid="nav-projects"]');
      
      // Simulate network failure
      await page.route('**/rest/v1/**', route => route.abort());
      
      // Try to create project
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Network Error Test');
      await page.click('[data-testid="save-project-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    });

    test('should show loading states', async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      
      // Navigate to projects - should show loading
      await page.click('[data-testid="nav-projects"]');
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
      
      // Should eventually load data
      await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
    });
  });

  test.describe('Audit Logging', () => {
    test('should log user actions', async () => {
      await page.goto('/auth/signin');
      await page.fill('[data-testid="email-input"]', TEST_EMAIL);
      await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
      await page.click('[data-testid="signin-button"]');
      await page.click('[data-testid="nav-projects"]');
      
      // Create a project (this should be logged)
      await page.click('[data-testid="create-project-button"]');
      await page.fill('[data-testid="project-name-input"]', 'Audit Test Project');
      await page.click('[data-testid="save-project-button"]');
      
      // Check audit logs (if accessible in UI)
      await page.goto('/settings');
      await page.click('[data-testid="audit-logs-tab"]');
      
      // Should show the create action
      await expect(page.locator('[data-testid="audit-log-create-projects"]')).toBeVisible();
    });
  });
});

// Utility functions for test setup
async function setupTestData(supabase: any) {
  // Create test organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      id: TEST_ORG_ID,
      name: 'Test Organization',
      is_demo: true
    })
    .select()
    .single();

  return { org };
}

async function cleanupTestData(supabase: any) {
  // Clean up test data
  await supabase
    .from('projects')
    .delete()
    .eq('organization_id', TEST_ORG_ID);
    
  await supabase
    .from('organizations')
    .delete()
    .eq('id', TEST_ORG_ID);
}
