import { test, expect } from '@playwright/test';

test.describe('Demo Seed Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate
    await page.goto('/login');
    // Add authentication steps here based on your auth setup
  });

  test('should load demo data successfully', async ({ page }) => {
    await page.goto('/people');
    
    // Check for empty state
    await expect(page.getByText('Load Demo')).toBeVisible();
    
    // Click load demo button
    await page.getByText('Load Demo').click();
    
    // Wait for demo data to load
    await expect(page.getByText('Captain J. Sparrow')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Molly \'Grog\' Teague')).toBeVisible();
    
    // Verify demo data appears in other modules
    await page.goto('/jobs');
    await expect(page.getByText('Dock Build — Night Shift')).toBeVisible();
    
    await page.goto('/finance');
    await expect(page.getByText('Event Budget — Blackwater Reverb')).toBeVisible();
    await expect(page.getByText('$75,000')).toBeVisible();
  });

  test('should open drawer for demo records', async ({ page }) => {
    await page.goto('/people');
    
    // Load demo data first
    await page.getByText('Load Demo').click();
    await expect(page.getByText('Captain J. Sparrow')).toBeVisible({ timeout: 10000 });
    
    // Click on a person record
    await page.getByText('Captain J. Sparrow').click();
    
    // Verify drawer opens with tabs
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Edit' })).toBeVisible();
    
    // Check details content
    await expect(page.getByText('captain@blackwaterfleet.com')).toBeVisible();
    await expect(page.getByText('Producer')).toBeVisible();
  });

  test('should handle demo data across all modules', async ({ page }) => {
    await page.goto('/programming');
    
    // Load demo and verify activations
    await page.getByText('Load Demo').click();
    await expect(page.getByText('Main Deck Stage + Neon Rig')).toBeVisible({ timeout: 10000 });
    
    // Test procurement module
    await page.goto('/procurement');
    await expect(page.getByText('Phantom PA Stack — Rent')).toBeVisible();
    await expect(page.getByText('Blackwater Audio Co')).toBeVisible();
    
    // Test pipeline module
    await page.goto('/pipeline');
    await page.getByRole('tab', { name: 'Training' }).click();
    // Training data should be loaded from demo seed
  });

  test('should maintain demo data state across navigation', async ({ page }) => {
    await page.goto('/people');
    await page.getByText('Load Demo').click();
    await expect(page.getByText('Captain J. Sparrow')).toBeVisible({ timeout: 10000 });
    
    // Navigate to different modules and verify data persists
    await page.goto('/jobs');
    await expect(page.getByText('Dock Build — Night Shift')).toBeVisible();
    
    await page.goto('/finance');
    await expect(page.getByText('$75,000')).toBeVisible();
    
    // Return to people and verify data still there
    await page.goto('/people');
    await expect(page.getByText('Captain J. Sparrow')).toBeVisible();
  });
});
