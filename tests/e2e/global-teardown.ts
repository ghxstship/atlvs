import { unlinkSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

async function globalTeardown() {
  // Clean up test data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Clean up test data
  await supabase.from('organizations').delete().eq('id', 'test-org-id');
  await supabase.auth.admin.deleteUser(process.env.TEST_USER_ID!);

  // Clean up stored auth state
  if (existsSync('tests/e2e/auth-state.json')) {
    unlinkSync('tests/e2e/auth-state.json');
  }
}

export default globalTeardown;
