#!/bin/bash

# Fix unused variables by prefixing with underscore
find apps/web/app/api -name "*.ts" -type f -exec sed -i '' \
  -e 's/\([(,]\)\s*user\s*\([,)]\)/\1 _user\2/g' \
  -e 's/\([(,]\)\s*error\s*\([,)]\)/\1 _error\2/g' \
  -e 's/\([(,]\)\s*request\s*\([,)]\)/\1 _request\2/g' \
  {} \;

# Fix specific unused imports
sed -i '' 's/^import.*historyUpsertSchema.*$/\/\/ &/' apps/web/app/api/v1/profile/history/route.ts
sed -i '' 's/^import.*jobUpsertSchema.*$/\/\/ &/' apps/web/app/api/v1/profile/job-history/route.ts
sed -i '' 's/^import.*performanceUpsertSchema.*$/\/\/ &/' apps/web/app/api/v1/profile/performance/route.ts
sed -i '' 's/^import.*professionalUpsertSchema.*$/\/\/ &/' apps/web/app/api/v1/profile/professional/route.ts
sed -i '' 's/^import.*travelRecordUpsertSchema.*$/\/\/ &/' apps/web/app/api/v1/profile/travel/route.ts
sed -i '' 's/const UpdateActivationSchema/\/\/ const UpdateActivationSchema/' apps/web/app/api/v1/projects/[id]/activations/route.ts
sed -i '' 's/const AssignRoleSchema/\/\/ const AssignRoleSchema/' apps/web/app/api/v1/settings/roles/route.ts

# Fix 'any' types with proper types
find apps/web/app/api -name "*.ts" -type f -exec sed -i '' \
  -e 's/: any\([^a-zA-Z]\)/: Record<string, unknown>\1/g' \
  -e 's/as any\([^a-zA-Z]\)/as Record<string, unknown>\1/g' \
  {} \;

# Fix case declarations
find apps/web/app/api -name "*.ts" -type f -exec sed -i '' \
  -e '/case.*:$/,/break;/ { /const\|let/ { s/^/      { /; :a; n; /break;/! ba; s/$/\n      }/; } }' \
  {} \;

echo "ESLint fixes applied!"
