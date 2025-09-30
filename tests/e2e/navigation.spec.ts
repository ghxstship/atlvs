import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should navigate to projects page', async ({ page }) => {
    await page.click('text=Projects')
    await expect(page).toHaveURL('/projects')
    await expect(page.locator('h1')).toContainText('Projects')
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.click('text=Settings')
    await expect(page).toHaveURL('/settings')
    await expect(page.locator('h1')).toContainText('Settings')
  })

  test('should use breadcrumb navigation', async ({ page }) => {
    await page.goto('/projects/123')
    await page.click('nav[aria-label="Breadcrumb"] >> text=Projects')
    await expect(page).toHaveURL('/projects')
  })

  test('should handle browser back button', async ({ page }) => {
    await page.goto('/projects')
    await page.goto('/settings')
    await page.goBack()
    await expect(page).toHaveURL('/projects')
  })
})
