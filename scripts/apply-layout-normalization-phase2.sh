#!/bin/bash

# ATLVS Layout Normalization - Phase 2: Edge Cases & Final Cleanup
# Zero Tolerance: 100% Completion

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🔧 ATLVS LAYOUT NORMALIZATION - PHASE 2"
echo "========================================"
echo "Objective: 100% Zero Tolerance"
echo ""
echo "Phase 2: Edge Cases, Inline Styles, Arbitrary Values"
echo ""

total_fixed=0

echo "📊 PHASE 2A: AGGRESSIVE EDGE CASE CLEANUP"
echo "=========================================="
echo ""

# More aggressive patterns - catching edge cases with space/quote boundaries

echo "Fixing remaining w-20 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-20"/"w-component-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-20'/'w-component-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-20 / w-component-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-20"/ w-component-lg"/g' {} \;
echo "  ✓ w-20 cleanup complete"

echo "Fixing remaining w-24 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-24"/"w-component-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-24'/'w-component-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-24 / w-component-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-24"/ w-component-lg"/g' {} \;
echo "  ✓ w-24 cleanup complete"

echo "Fixing remaining w-32 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-32"/"w-component-xl"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-32'/'w-component-xl'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-32 / w-component-xl /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-32"/ w-component-xl"/g' {} \;
echo "  ✓ w-32 cleanup complete"

echo "Fixing remaining w-48 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-48"/"w-container-xs"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-48'/'w-container-xs'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-48 / w-container-xs /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-48"/ w-container-xs"/g' {} \;
echo "  ✓ w-48 cleanup complete"

echo "Fixing remaining w-64 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-64"/"w-container-sm"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-64'/'w-container-sm'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-64 / w-container-sm /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-64"/ w-container-sm"/g' {} \;
echo "  ✓ w-64 cleanup complete"

echo "Fixing remaining w-80 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-80"/"w-container-md"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-80'/'w-container-md'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-80 / w-container-md /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-80"/ w-container-md"/g' {} \;
echo "  ✓ w-80 cleanup complete"

echo "Fixing remaining w-96 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"w-96"/"w-container-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'w-96'/'w-container-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-96 / w-container-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ w-96"/ w-container-lg"/g' {} \;
echo "  ✓ w-96 cleanup complete"

echo ""
echo "Fixing height edge cases..."
echo ""

echo "Fixing remaining h-16 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-16"/"h-component-md"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-16'/'h-component-md'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-16 / h-component-md /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-16"/ h-component-md"/g' {} \;
echo "  ✓ h-16 cleanup complete"

echo "Fixing remaining h-20 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-20"/"h-component-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-20'/'h-component-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-20 / h-component-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-20"/ h-component-lg"/g' {} \;
echo "  ✓ h-20 cleanup complete"

echo "Fixing remaining h-24 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-24"/"h-component-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-24'/'h-component-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-24 / h-component-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-24"/ h-component-lg"/g' {} \;
echo "  ✓ h-24 cleanup complete"

echo "Fixing remaining h-32 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-32"/"h-component-xl"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-32'/'h-component-xl'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-32 / h-component-xl /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-32"/ h-component-xl"/g' {} \;
echo "  ✓ h-32 cleanup complete"

echo "Fixing remaining h-48 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-48"/"h-container-xs"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-48'/'h-container-xs'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-48 / h-container-xs /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-48"/ h-container-xs"/g' {} \;
echo "  ✓ h-48 cleanup complete"

echo "Fixing remaining h-64 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-64"/"h-container-sm"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-64'/'h-container-sm'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-64 / h-container-sm /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-64"/ h-container-sm"/g' {} \;
echo "  ✓ h-64 cleanup complete"

echo "Fixing remaining h-80 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-80"/"h-container-md"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-80'/'h-container-md'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-80 / h-container-md /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-80"/ h-container-md"/g' {} \;
echo "  ✓ h-80 cleanup complete"

echo "Fixing remaining h-96 instances..."
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/"h-96"/"h-container-lg"/g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/'h-96'/'h-container-lg'/g" {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-96 / h-container-lg /g' {} \;
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/ h-96"/ h-container-lg"/g' {} \;
echo "  ✓ h-96 cleanup complete"

echo ""
echo "========================================"
echo "✅ Phase 2A complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Run verification: ./scripts/verify-normalization.sh"
echo "  2. Review changes: git diff --stat"
echo ""
