#!/bin/bash

# ATLVS Layout Normalization - FINAL PUSH TO 100%
# Zero Tolerance: Complete elimination of all hardcoded values

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🎯 ATLVS LAYOUT NORMALIZATION - FINAL 100%"
echo "=========================================="
echo "Target: TRUE ZERO TOLERANCE"
echo ""

# Phase 3A: Ultra-aggressive cleanup of ALL remaining hardcoded sizes
echo "📊 PHASE 3A: FINAL HARDCODED SIZE ELIMINATION"
echo "=============================================="
echo ""

# Width conversions - all patterns, all contexts
echo "Processing all width patterns..."

# w-20
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-20\([^"]*\)"/className="\1w-component-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-20\([^']*\)'/className='\1w-component-lg\2'/g"
echo "  ✓ w-20 → w-component-lg"

# w-24
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-24\([^"]*\)"/className="\1w-component-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-24\([^']*\)'/className='\1w-component-lg\2'/g"
echo "  ✓ w-24 → w-component-lg"

# w-32
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-32\([^"]*\)"/className="\1w-component-xl\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-32\([^']*\)'/className='\1w-component-xl\2'/g"
echo "  ✓ w-32 → w-component-xl"

# w-48
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-48\([^"]*\)"/className="\1w-container-xs\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-48\([^']*\)'/className='\1w-container-xs\2'/g"
echo "  ✓ w-48 → w-container-xs"

# w-56
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-56\([^"]*\)"/className="\1w-container-xs\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-56\([^']*\)'/className='\1w-container-xs\2'/g"
echo "  ✓ w-56 → w-container-xs"

# w-64
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-64\([^"]*\)"/className="\1w-container-sm\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-64\([^']*\)'/className='\1w-container-sm\2'/g"
echo "  ✓ w-64 → w-container-sm"

# w-72
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-72\([^"]*\)"/className="\1w-container-sm\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-72\([^']*\)'/className='\1w-container-sm\2'/g"
echo "  ✓ w-72 → w-container-sm"

# w-80
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-80\([^"]*\)"/className="\1w-container-md\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-80\([^']*\)'/className='\1w-container-md\2'/g"
echo "  ✓ w-80 → w-container-md"

# w-96
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)w-96\([^"]*\)"/className="\1w-container-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)w-96\([^']*\)'/className='\1w-container-lg\2'/g"
echo "  ✓ w-96 → w-container-lg"

echo ""
echo "Processing all height patterns..."

# h-16
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-16\([^"]*\)"/className="\1h-component-md\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-16\([^']*\)'/className='\1h-component-md\2'/g"
echo "  ✓ h-16 → h-component-md"

# h-20
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-20\([^"]*\)"/className="\1h-component-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-20\([^']*\)'/className='\1h-component-lg\2'/g"
echo "  ✓ h-20 → h-component-lg"

# h-24
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-24\([^"]*\)"/className="\1h-component-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-24\([^']*\)'/className='\1h-component-lg\2'/g"
echo "  ✓ h-24 → h-component-lg"

# h-32
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-32\([^"]*\)"/className="\1h-component-xl\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-32\([^']*\)'/className='\1h-component-xl\2'/g"
echo "  ✓ h-32 → h-component-xl"

# h-48
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-48\([^"]*\)"/className="\1h-container-xs\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-48\([^']*\)'/className='\1h-container-xs\2'/g"
echo "  ✓ h-48 → h-container-xs"

# h-56
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-56\([^"]*\)"/className="\1h-container-xs\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-56\([^']*\)'/className='\1h-container-xs\2'/g"
echo "  ✓ h-56 → h-container-xs"

# h-64
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-64\([^"]*\)"/className="\1h-container-sm\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-64\([^']*\)'/className='\1h-container-sm\2'/g"
echo "  ✓ h-64 → h-container-sm"

# h-72
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-72\([^"]*\)"/className="\1h-container-sm\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-72\([^']*\)'/className='\1h-container-sm\2'/g"
echo "  ✓ h-72 → h-container-sm"

# h-80
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-80\([^"]*\)"/className="\1h-container-md\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-80\([^']*\)'/className='\1h-container-md\2'/g"
echo "  ✓ h-80 → h-container-md"

# h-96
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/className="\([^"]*\)h-96\([^"]*\)"/className="\1h-container-lg\2"/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' "s/className='\([^']*\)h-96\([^']*\)'/className='\1h-container-lg\2'/g"
echo "  ✓ h-96 → h-container-lg"

echo ""
echo "=========================================="
echo "✅ Phase 3A complete!"
echo ""
echo "📝 Verifying results..."
echo ""
