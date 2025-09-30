#!/bin/bash

echo "Applying final ESLint fixes..."

# Fix all _request parameters that aren't prefixed
find apps/web/app/api -name "*.ts" -exec grep -l "export async function GET(request: NextRequest)" {} \; | while read file; do
  sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/' "$file"
done

# Fix catalog filters schema
sed -i '' '/catalogFiltersSchema/d' apps/web/app/api/v1/procurement/catalog/route.ts

# Fix unused currentPolicy
sed -i '' 's/const currentPolicy = /\/\/ const currentPolicy = /' apps/web/app/api/v1/procurement/approvals/policies/[id]/route.ts

# Fix settings/integrations
sed -i '' 's/const { supabase, user, organizationId } = context;/const { user, organizationId } = context;/' apps/web/app/api/v1/settings/integrations/route.ts

# Fix settings/billing errors
sed -i '' 's/} catch (error) {/} catch (_error) {/' apps/web/app/api/v1/settings/billing/route.ts

# Replace all 'any' types with 'unknown' or specific types
find apps/web/app/api -name "*.ts" -exec sed -i '' 's/: any\[\]/: unknown[]/g' {} \;
find apps/web/app/api -name "*.ts" -exec sed -i '' 's/: any)/: unknown)/g' {} \;
find apps/web/app/api -name "*.ts" -exec sed -i '' 's/<any>/<unknown>/g' {} \;
find apps/web/app/api -name "*.ts" -exec sed -i '' 's/as any/as unknown/g' {} \;
find apps/web/app/api -name "*.ts" -exec sed -i '' 's/Record<string, any>/Record<string, unknown>/g' {} \;

echo "Fixes applied!"
