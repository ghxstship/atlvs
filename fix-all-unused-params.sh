#!/bin/bash

echo "Fixing all unused request parameters..."

# List of files with unused _request or request parameters
FILES=(
  "apps/web/app/api/v1/profile/activity/analytics/route.ts"
  "apps/web/app/api/v1/profile/activity/route.ts"
  "apps/web/app/api/v1/profile/contact/analytics/route.ts"
  "apps/web/app/api/v1/profile/contact/route.ts"
  "apps/web/app/api/v1/profile/emergency/analytics/route.ts"
  "apps/web/app/api/v1/profile/emergency/route.ts"
  "apps/web/app/api/v1/profile/endorsements/analytics/route.ts"
  "apps/web/app/api/v1/profile/endorsements/route.ts"
  "apps/web/app/api/v1/profile/health/analytics/route.ts"
  "apps/web/app/api/v1/profile/health/route.ts"
  "apps/web/app/api/v1/profile/history/analytics/route.ts"
  "apps/web/app/api/v1/profile/history/route.ts"
  "apps/web/app/api/v1/profile/job-history/analytics/route.ts"
  "apps/web/app/api/v1/profile/job-history/route.ts"
  "apps/web/app/api/v1/profile/overview/analytics/route.ts"
  "apps/web/app/api/v1/profile/overview/route.ts"
  "apps/web/app/api/v1/profile/performance/analytics/route.ts"
  "apps/web/app/api/v1/profile/performance/route.ts"
  "apps/web/app/api/v1/profile/professional/analytics/route.ts"
  "apps/web/app/api/v1/profile/professional/route.ts"
  "apps/web/app/api/v1/profile/route.ts"
  "apps/web/app/api/v1/profile/travel/analytics/route.ts"
  "apps/web/app/api/v1/profile/travel/route.ts"
  "apps/web/app/api/v1/profile/uniform/analytics/route.ts"
  "apps/web/app/api/v1/profile/uniform/route.ts"
  "apps/web/app/api/v1/programming/call-sheets/route.ts"
  "apps/web/app/api/v1/programming/events/route.ts"
  "apps/web/app/api/v1/programming/itineraries/route.ts"
  "apps/web/app/api/v1/programming/lineups/route.ts"
  "apps/web/app/api/v1/programming/overview/analytics/route.ts"
  "apps/web/app/api/v1/programming/overview/route.ts"
  "apps/web/app/api/v1/programming/performances/route.ts"
  "apps/web/app/api/v1/programming/riders/route.ts"
  "apps/web/app/api/v1/programming/spaces/route.ts"
  "apps/web/app/api/v1/programming/workshops/route.ts"
  "apps/web/app/api/v1/programs/route.ts"
  "apps/web/app/api/v1/projects/route.ts"
  "apps/web/app/api/v1/risks/route.ts"
  "apps/web/app/api/v1/settings/api-keys/route.ts"
  "apps/web/app/api/v1/settings/automations/route.ts"
  "apps/web/app/api/v1/settings/integrations/route.ts"
  "apps/web/app/api/v1/settings/notifications/route.ts"
  "apps/web/app/api/v1/settings/organization/members/route.ts"
  "apps/web/app/api/v1/settings/organization/route.ts"
  "apps/web/app/api/v1/settings/roles/route.ts"
  "apps/web/app/api/v1/settings/route.ts"
  "apps/web/app/api/v1/settings/security/route.ts"
  "apps/web/app/api/v1/settings/sessions/route.ts"
  "apps/web/app/api/v1/settings/teams/route.ts"
  "apps/web/app/api/v1/settings/webhooks/route.ts"
  "apps/web/app/api/v1/tasks/route.ts"
  "apps/web/app/api/v1/vendors/route.ts"
  "apps/web/app/api/v1/webhooks/list/route.ts"
  "apps/web/app/api/v1/webhooks/redrive/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Fix GET functions with request parameter
    sed -i '' 's/export async function GET(request: NextRequest)/export async function GET(_request: NextRequest)/' "$file"
    # Also fix if it's already _request but still showing error (might be on different line)
    sed -i '' 's/export async function GET(_request: NextRequest)/export async function GET(_request: NextRequest)/' "$file"
  fi
done

# Fix settings/billing specific errors
sed -i '' 's/} catch (error) {/} catch (_error) {/' apps/web/app/api/v1/settings/billing/route.ts

# Fix settings/integrations
sed -i '' 's/const { supabase, user, organizationId } = context;/const { user, organizationId } = context;/' apps/web/app/api/v1/settings/integrations/route.ts

# Fix risks/[id]/route.ts - replace any with unknown
sed -i '' 's/as any/as unknown/g' apps/web/app/api/v1/risks/[id]/route.ts

echo "All unused parameters fixed!"
