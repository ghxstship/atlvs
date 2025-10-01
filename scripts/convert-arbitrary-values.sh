#!/bin/bash

# Convert Common Arbitrary Values to Semantic Tokens
# TRUE 100% Zero Tolerance

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🎯 PHASE 3C: ARBITRARY VALUE CONVERSION"
echo "========================================"
echo ""

# Convert common arbitrary pixel values to semantic tokens
echo "Converting common arbitrary values..."

# [400px] → w-sidebar-wide / h-content-lg
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[400px\]/w-sidebar-wide/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[400px\]/h-content-lg/g'
echo "  ✓ [400px] → semantic tokens"

# [200px] → w-content-narrow / h-content-sm
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[200px\]/w-content-narrow/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[200px\]/h-content-sm/g'
echo "  ✓ [200px] → semantic tokens"

# [300px] → w-content-medium / h-content-md
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[300px\]/w-content-medium/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[300px\]/h-content-md/g'
echo "  ✓ [300px] → semantic tokens"

# [600px] → w-content-large / h-content-xl
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[600px\]/w-content-large/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[600px\]/h-content-xl/g'
echo "  ✓ [600px] → semantic tokens"

# [800px] → w-content-xlarge
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[800px\]/w-content-xlarge/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[800px\]/h-content-xlarge/g'
echo "  ✓ [800px] → semantic tokens"

# [120px] → w-component-xl / h-header-lg
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[120px\]/w-component-xl/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[120px\]/h-header-lg/g'
echo "  ✓ [120px] → semantic tokens"

# [100px] → w-component-lg / h-header-md
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[100px\]/w-component-lg/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[100px\]/h-header-md/g'
echo "  ✓ [100px] → semantic tokens"

# [80px] → w-icon-2xl / h-header-sm
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[80px\]/w-icon-2xl/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[80px\]/h-header-sm/g'
echo "  ✓ [80px] → semantic tokens"

# [60px] → h-toolbar
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[60px\]/h-toolbar/g'
echo "  ✓ [60px] → h-toolbar"

# [320px] → w-container-md
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/w-\[320px\]/w-container-md/g'
echo "  ✓ [320px] → w-container-md"

# Common calc expressions
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[calc(100vh-300px)\]/h-screen-minus-xl/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[calc(100vh-200px)\]/h-screen-minus-toolbar/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[calc(100vh-120px)\]/h-screen-minus-nav/g'
find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i '' 's/h-\[calc(100vh-64px)\]/h-screen-minus-header/g'
echo "  ✓ calc() expressions → semantic tokens"

echo ""
echo "=========================================="
echo "✅ Arbitrary value conversion complete!"
echo ""
