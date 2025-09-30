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
  const fs = require('fs');
  if (fs.existsSync('tests/e2e/auth-state.json')) {
    fs.unlinkSync('tests/e2e/auth-state.json');
  }
}

export default globalTeardown;
