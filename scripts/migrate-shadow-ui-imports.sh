#!/bin/bash

# Migrate Shadow UI Imports to @ghxstship/ui
# Updates all files that import from _components/ui to use @ghxstship/ui

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
WEB_ROOT="$REPO_ROOT/apps/web"

echo "Migrating shadow UI imports to @ghxstship/ui..."
echo ""

# List of files with shadow UI imports
FILES_WITH_IMPORTS=(
  "$WEB_ROOT/app/auth/onboarding/OnboardingFlow.tsx"
  "$WEB_ROOT/app/(app)/(shell)/analytics/reports/ReportsClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/finance/revenue/RevenueClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/finance/budgets/BudgetsClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/jobs/assignments/AssignmentsClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/people/overview/OverviewClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/procurement/categories/CategoriesClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/dashboard/widgets/MetricWidget.tsx"
  "$WEB_ROOT/app/(app)/(shell)/pipeline/overview/OverviewClient.tsx"
  "$WEB_ROOT/app/(app)/(shell)/pipeline/training/TrainingClient.tsx"
)

for file in "${FILES_WITH_IMPORTS[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating: ${file#$WEB_ROOT/}"
    
    # Replace shadow UI imports with @ghxstship/ui imports
    # Pattern 1: import { ... } from "../../../../_components/ui"
    sed -i '' 's|from ['\''"]\.\./.*/\.\._components/ui['\''"]|from '\''@ghxstship/ui'\''|g' "$file"
    
    # Pattern 2: import { ... } from '../../../../_components/ui'
    sed -i '' 's|from ['\''"]\.\./.*/app/_components/ui['\''"]|from '\''@ghxstship/ui'\''|g' "$file"
    
    # Pattern 3: Any remaining relative paths to _components/ui
    sed -i '' 's|from ['\''"].*_components/ui['\''"]|from '\''@ghxstship/ui'\''|g' "$file"
    
    echo "  ✓ Updated imports"
  fi
done

echo ""
echo "✓ All shadow UI imports migrated to @ghxstship/ui"
echo ""
