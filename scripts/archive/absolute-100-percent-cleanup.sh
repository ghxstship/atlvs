#!/bin/bash

# ABSOLUTE 100% ZERO TOLERANCE
# Fix every single remaining violation - zero exceptions

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🎯 ABSOLUTE 100% CLEANUP - ZERO EXCEPTIONS"
echo "==========================================="
echo ""

total_fixed=0

# Fix min-h-96 → min-h-container-lg
echo "Fixing min-h-96..."
find apps/web packages/ui -type f -name "*.tsx" -exec sed -i '' 's/min-h-96/min-h-container-lg/g' {} \;
echo "  ✓ min-h-96 fixed"

# Fix max-h-96 → max-h-container-lg
echo "Fixing max-h-96..."
find apps/web packages/ui -type f -name "*.tsx" -exec sed -i '' 's/max-h-96/max-h-container-lg/g' {} \;
echo "  ✓ max-h-96 fixed"

# Fix template literals and edge cases for p-4
echo "Fixing remaining p-4 patterns..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'\([^']*\) p-4\([^']*\)'/'\1 p-md\2'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/`\([^`]*\) p-4\([^`]*\)`/`\1 p-md\2`/g' {} \;
echo "  ✓ p-4 patterns fixed"

# Fix gap-2xl occurrences that got caught
echo "Fixing gap-2xl false positives..."
find apps/web packages/ui -type f -name "*.tsx" -exec sed -i '' 's/gap-xs xl/gap-2xl/g' {} \;
echo "  ✓ gap-2xl restored"

# Fix animation classes (slide-in-from-top-4 etc - these should stay)
echo "Restoring animation classes..."
find apps/web packages/ui -type f -name "*.tsx" -exec sed -i '' 's/slide-in-from-top-md/slide-in-from-top-4/g' {} \;
find apps/web packages/ui -type f -name "*.tsx" -exec sed -i '' 's/slide-out-to-top-md/slide-out-to-top-4/g' {} \;
echo "  ✓ Animation classes restored (these are Tailwind built-ins)"

echo ""
echo "=========================================="
echo "✅ All systematic replacements complete!"
echo "=========================================="
echo ""
