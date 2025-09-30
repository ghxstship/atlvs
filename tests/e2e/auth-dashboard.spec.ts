import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should sign in successfully', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in credentials
    await page.fill('[data-testid="email-input"]', process.env.TEST_USER_EMAIL!);
    await page.fill('[data-testid="password-input"]', process.env.TEST_USER_PASSWORD!);

    // Submit form
    await page.click('[data-testid="signin-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Should see dashboard content
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');

    // Submit form
    await page.click('[data-testid="signin-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Invalid credentials');
  });
});

test.describe('Dashboard', () => {
  test.use({ storageState: 'tests/e2e/auth-state.json' });

  test('should load dashboard with key metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show loading state initially
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();

    // Should load dashboard content
    await expect(page.locator('[data-testid="dashboard-metrics"]')).toBeVisible();

    // Should show key performance indicators
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-metrics"]')).toBeVisible();
  });

  test('should navigate to different modules', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Projects module
    await page.click('[data-testid="nav-projects"]');
    await expect(page).toHaveURL(/.*\/projects/);

    // Click on Finance module
    await page.click('[data-testid="nav-finance"]');
    await expect(page).toHaveURL(/.*\/finance/);

    // Click on People module
    await page.click('[data-testid="nav-people"]');
    await expect(page).toHaveURL(/.*\/people/);
  });
});
