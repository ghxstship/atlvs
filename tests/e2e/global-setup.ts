import { chromium, type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
  // Setup test database with test data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Clean up existing test data
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Create test organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      id: 'test-org-id',
      name: 'Test Organization',
      slug: 'test-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Create test user
  const { data: user } = await supabase.auth.admin.createUser({
    email: 'test@example.com',
    password: 'testpassword123',
    email_confirm: true,
    user_metadata: {
      name: 'Test User',
    },
  });

  if (user.user) {
    // Create membership
    await supabase.from('memberships').insert({
      user_id: user.user.id,
      organization_id: org.id,
      role: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Store test credentials for tests
    process.env.TEST_USER_ID = user.user.id;
    process.env.TEST_ORG_ID = org.id;
    process.env.TEST_USER_EMAIL = 'test@example.com';
    process.env.TEST_USER_PASSWORD = 'testpassword123';
  }

  // Setup browser context with auth
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to login page and authenticate
  await page.goto('/auth/signin');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'testpassword123');
  await page.click('[data-testid="signin-button"]');
  await page.waitForURL('**/dashboard');

  // Save authentication state
  await page.context().storageState({ path: 'tests/e2e/auth-state.json' });
  await browser.close();
}

export default globalSetup;
