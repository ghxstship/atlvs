#!/bin/bash

# Fix unused variables by prefixing with underscore
FILES=(
  "apps/web/app/api/v1/profile/contact/analytics/route.ts"
  "apps/web/app/api/v1/procurement/catalog/route.ts"
  "apps/web/app/api/v1/procurement/products/route.ts"
  "apps/web/app/api/v1/procurement/requests/[id]/route.ts"
  "apps/web/app/api/v1/procurement/requests/route.ts"
  "apps/web/app/api/v1/procurement/services/route.ts"
  "apps/web/app/api/v1/profile/endorsements/route.ts"
  "apps/web/app/api/v1/projects/[id]/activations/route.ts"
  "apps/web/app/api/v1/settings/billing/route.ts"
  "apps/web/app/api/v1/settings/integrations/route.ts"
  "apps/web/app/api/v1/settings/roles/route.ts"
)

echo "Fixing unused variables..."

# Fix contact analytics
sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/' apps/web/app/api/v1/profile/contact/analytics/route.ts

# Fix procurement catalog
sed -i '' 's/import {$/import {/' apps/web/app/api/v1/procurement/catalog/route.ts
sed -i '' '/catalogFiltersSchema,/d' apps/web/app/api/v1/procurement/catalog/route.ts

# Fix procurement products
sed -i '' 's/const updateProductSchema/const _updateProductSchema/' apps/web/app/api/v1/procurement/products/route.ts

# Fix procurement services
sed -i '' 's/const updateServiceSchema/const _updateServiceSchema/' apps/web/app/api/v1/procurement/services/route.ts

# Fix procurement requests
sed -i '' "s/import { z } from 'zod';//" apps/web/app/api/v1/procurement/requests/route.ts
sed -i '' "s/import { z } from 'zod';//" apps/web/app/api/v1/procurement/requests/[id]/route.ts

# Fix endorsements
sed -i '' 's/endorsementUpsertSchema,//' apps/web/app/api/v1/profile/endorsements/route.ts
sed -i '' 's/const { supabase, user, error } = await requireAuth();/const { supabase, error } = await requireAuth();/' apps/web/app/api/v1/profile/endorsements/route.ts

# Fix projects activations
sed -i '' 's/const UpdateActivationSchema/const _UpdateActivationSchema/' apps/web/app/api/v1/projects/[id]/activations/route.ts

# Fix settings billing
sed -i '' 's/const { supabase, organizationId } = context;/const { organizationId } = context;/' apps/web/app/api/v1/settings/billing/route.ts
sed -i '' 's/} catch (error) {/} catch (_error) {/' apps/web/app/api/v1/settings/billing/route.ts

# Fix settings integrations
sed -i '' 's/const { supabase, user, organizationId } = context;/const { user, organizationId } = context;/' apps/web/app/api/v1/settings/integrations/route.ts

# Fix settings roles
sed -i '' 's/const AssignRoleSchema/const _AssignRoleSchema/' apps/web/app/api/v1/settings/roles/route.ts

echo "Fixing case declarations..."

# Fix endorsements case declarations
sed -i '' 's/case '\''approve'\'':$/case '\''approve'\'': {/' apps/web/app/api/v1/profile/endorsements/route.ts
sed -i '' 's/case '\''reject'\'':$/case '\''reject'\'': {/' apps/web/app/api/v1/profile/endorsements/route.ts
sed -i '' '/case '\''approve'\'':/,/return NextResponse.json(updatedEndorsement);/{
  s/return NextResponse.json(updatedEndorsement);/return NextResponse.json(updatedEndorsement);\n        }/
}' apps/web/app/api/v1/profile/endorsements/route.ts
sed -i '' '/case '\''reject'\'':/,/return NextResponse.json(updatedEndorsement);/{
  s/return NextResponse.json(updatedEndorsement);/return NextResponse.json(updatedEndorsement);\n        }/
}' apps/web/app/api/v1/profile/endorsements/route.ts

echo "Done fixing lint errors!"
