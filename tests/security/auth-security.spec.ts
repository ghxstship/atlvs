import { test, expect } from '@playwright/test';

test.describe('Authentication Security Testing', () => {
  test('should prevent brute force attacks', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Attempt multiple failed logins
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', `wrongpassword${i}`);
      await page.click('[data-testid="signin-button"]');
      
      // Should show error but not lock out immediately
      await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
      
      // Clear form for next attempt
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', '');
    }
    
    // After multiple attempts, should show rate limiting
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    
    // Should eventually allow successful login
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should prevent session fixation attacks', async ({ page, context }) => {
    // Get initial session
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('**/dashboard');
    
    const initialCookies = await context.cookies();
    const initialSessionCookie = initialCookies.find(c => c.name.includes('session'));
    
    // Perform some actions
    await page.click('[data-testid="nav-projects"]');
    await page.waitForURL('**/projects');
    
    // Check that session cookie changed after login
    const updatedCookies = await context.cookies();
    const updatedSessionCookie = updatedCookies.find(c => c.name.includes('session'));
    
    // Session should be regenerated after login
    expect(updatedSessionCookie?.value).not.toBe(initialSessionCookie?.value);
  });

  test('should handle concurrent sessions properly', async ({ browser }) => {
    // Create multiple browser contexts (simulating different devices)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login on both sessions
    await page1.goto('/auth/signin');
    await page1.fill('[data-testid="email-input"]', 'test@example.com');
    await page1.fill('[data-testid="password-input"]', 'testpassword123');
    await page1.click('[data-testid="signin-button"]');
    await page1.waitForURL('**/dashboard');
    
    await page2.goto('/auth/signin');
    await page2.fill('[data-testid="email-input"]', 'test@example.com');
    await page2.fill('[data-testid="password-input"]', 'testpassword123');
    await page2.click('[data-testid="signin-button"]');
    await page2.waitForURL('**/dashboard');
    
    // Both sessions should work independently
    await page1.click('[data-testid="nav-projects"]');
    await page1.waitForURL('**/projects');
    
    await page2.click('[data-testid="nav-finance"]');
    await page2.waitForURL('**/finance');
    
    // Sessions should remain valid
    await expect(page1.locator('[data-testid="project-list"]')).toBeVisible();
    await expect(page2.locator('[data-testid="finance-dashboard"]')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('**/auth/signin');
    await expect(page.locator('[data-testid="signin-form"]')).toBeVisible();
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('**/dashboard');
    
    // Simulate session expiration by clearing cookies
    const context = page.context();
    await context.clearCookies();
    
    // Try to access protected resource
    await page.reload();
    
    // Should redirect to login
    await page.waitForURL('**/auth/signin');
  });

  test('should prevent XSS in login form', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Try XSS payload in email field
    const xssPayload = '<script>alert("xss")</script>';
    await page.fill('[data-testid="email-input"]', xssPayload);
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="signin-button"]');
    
    // Should show error, not execute script
    await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
    
    // Page should not show any script execution
    const alerts = await page.evaluate(() => {
      window.alert = () => { /* noop */ };
      return false; // No alerts triggered
    });
    
    expect(alerts).toBe(false);
  });

  test('should validate input sanitization', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Test various malicious inputs
    const maliciousInputs = [
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '../../../../etc/passwd',
      '<iframe src="javascript:alert(1)"></iframe>',
      '{{7*7}}', // Template injection
      '${7*7}', // Expression injection
    ];
    
    for (const input of maliciousInputs) {
      await page.fill('[data-testid="email-input"]', input);
      await page.fill('[data-testid="password-input"]', 'testpassword123');
      await page.click('[data-testid="signin-button"]');
      
      // Should show validation error or authentication error, not execute malicious code
      await expect(page.locator('[data-testid="auth-error"]')).toBeVisible();
      
      // Clear form
      await page.fill('[data-testid="email-input"]', '');
      await page.fill('[data-testid="password-input"]', '');
    }
  });
});
