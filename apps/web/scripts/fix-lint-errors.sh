#!/bin/bash

# Fix ESLint errors systematically
# This script fixes common patterns across all files

set -e

APPS_WEB="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web"
cd "$APPS_WEB"

echo "🔧 Fixing lint errors systematically..."

# Function to fix apostrophes in files
fix_apostrophes() {
  local file="$1"
  echo "  Fixing apostrophes in: $file"
  
  # Replace common apostrophes with &apos;
  perl -i -pe "s/don't/don\&apos;t/g" "$file"
  perl -i -pe "s/doesn't/doesn\&apos;t/g" "$file"
  perl -i -pe "s/We've/We\&apos;ve/g" "$file"
  perl -i -pe "s/you've/you\&apos;ve/g" "$file"
  perl -i -pe "s/won't/won\&apos;t/g" "$file"
  perl -i -pe "s/can't/can\&apos;t/g" "$file"
  perl -i -pe "s/I've/I\&apos;ve/g" "$file"
  perl -i -pe "s/it's/it\&apos;s/g" "$file"
  perl -i -pe "s/let's/let\&apos;s/g" "$file"
  perl -i -pe "s/that's/that\&apos;s/g" "$file"
  perl -i -pe "s/what's/what\&apos;s/g" "$file"
  perl -i -pe "s/here's/here\&apos;s/g" "$file"
  perl -i -pe "s/there's/there\&apos;s/g" "$file"
  perl -i -pe "s/we'll/we\&apos;ll/g" "$file"
  perl -i -pe "s/you'll/you\&apos;ll/g" "$file"
  perl -i -pe "s/they'll/they\&apos;ll/g" "$file"
}

# Fix all onboarding step files
echo "📝 Fixing onboarding step files..."

ONBOARDING_DIR="app/auth/onboarding/steps"

for file in "$ONBOARDING_DIR"/*.tsx; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    fix_apostrophes "$file"
  fi
done

# Fix verify-email page
if [ -f "app/auth/verify-email/page.tsx" ]; then
  echo "Processing: app/auth/verify-email/page.tsx"
  fix_apostrophes "app/auth/verify-email/page.tsx"
fi

echo "✅ Apostrophe fixes complete!"
echo ""
echo "🔧 Now fixing Card component imports..."

# Files that need Card component imports fixed
CARD_FILES=(
  "app/auth/onboarding/steps/EmailVerificationStep.tsx"
  "app/auth/onboarding/steps/FinalConfirmationStep.tsx"
  "app/auth/onboarding/steps/OrganizationSetupStep.tsx"
  "app/auth/onboarding/steps/PlanSelectionStep.tsx"
  "app/auth/onboarding/steps/ProfileCompletionStep.tsx"
  "app/auth/onboarding/steps/TeamInvitationStep.tsx"
  "app/auth/onboarding/steps/VerifyEmailStep.tsx"
)

for file in "${CARD_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing Card imports in: $file"
    
    # Check if the file already has Card imports
    if grep -q "from '@ghxstship/ui'" "$file"; then
      # Add CardTitle, CardDescription, CardContent to existing import
      perl -i -pe 's/from (\047|")@ghxstship\/ui(\047|")/from $1@ghxstship\/ui$2/; 
                    if (/import.*Card.*from (\047|")@ghxstship\/ui(\047|")/) { 
                      s/Card,/Card, CardHeader, CardTitle, CardDescription, CardContent,/ unless /CardContent/;
                      s/Card([^,])/Card, CardHeader, CardTitle, CardDescription, CardContent$1/ unless /CardContent/;
                    }' "$file"
    fi
  fi
done

echo "✅ Card component import fixes complete!"
echo ""

echo "🎯 All systematic fixes applied successfully!"
