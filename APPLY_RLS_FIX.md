# Apply RLS Security Fix to Supabase

## Quick Apply Method - Use Supabase Dashboard

Since the connection string needs updating, the easiest way is to apply the migration directly through the Supabase Dashboard:

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `qopwaetlenarbnmrzvvs`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the Migration SQL**
   - Open: `supabase/migrations/20251001000000_fix_rls_security_issues.sql`
   - Copy the entire contents

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" or press `Cmd + Enter`

5. **Verify Success**
   - You should see "Success. No rows returned"
   - Check the linter to confirm all 5 errors are resolved

## Alternative: Update Connection String

If you prefer to use the Node.js script, update the connection string in `apply-migration.js`:

```javascript
// Get your connection string from:
// Supabase Dashboard > Project Settings > Database > Connection String
// Choose: "Session mode" and copy the "Connection string"

const connectionString = 'YOUR_NEW_CONNECTION_STRING_HERE';
```

Then run:
```bash
node apply-migration.js
```

## What This Migration Does

### 5 Security Issues Fixed:

1. ✅ **comments** - Verified existing RLS policies
2. ✅ **opportunities** - Confirmed existing RLS (was job_opportunities)  
3. ✅ **project_tags** - Created new table with full RLS
4. ✅ **user_permissions** - Created permission system with RLS
5. ✅ **query_performance_log** - Enabled RLS with admin access

### New Tables Created:

- **project_tags** - Project tagging system
- **user_permissions** - Granular permission management

### Helper Functions Added:

- `user_has_permission(user_id, org_id, permission, resource_type, resource_id)`
- `grant_user_permission(user_id, org_id, permission, resource_type, resource_id, expires_at)`
- `revoke_user_permission(user_id, org_id, permission, resource_type, resource_id)`

## Verification

After applying, verify the fix by checking the Supabase Database Linter:

1. Go to: Database > Linter
2. Confirm: "No issues found"
3. All 5 RLS errors should be resolved

## Rollback (if needed)

If you need to rollback:

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.project_tags CASCADE;
DROP TABLE IF EXISTS public.user_permissions CASCADE;

-- Remove helper functions
DROP FUNCTION IF EXISTS public.user_has_permission CASCADE;
DROP FUNCTION IF EXISTS public.grant_user_permission CASCADE;
DROP FUNCTION IF EXISTS public.revoke_user_permission CASCADE;
```

## Support

See full documentation in: `docs/RLS_SECURITY_FIX.md`
