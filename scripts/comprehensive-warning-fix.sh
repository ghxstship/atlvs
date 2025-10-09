#!/bin/bash
set -e

echo "🔧 Comprehensive Warning Fix - No Shortcuts"
echo "============================================"

WEB_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web"

# Step 1: Fix missing alt attributes on images
echo "📸 Step 1: Adding alt attributes to all images..."
find "$WEB_DIR/app/(app)/(shell)/files/media" -name "*.tsx" -exec sed -i '' 's/<img src={\([^}]*\)}\([^>]*\)\/>/<img src={\1}\2 alt="" \/>/g' {} \;

# Step 2: Fix design system spacing violations
echo "🎨 Step 2: Fixing design system spacing..."
find "$WEB_DIR/app" -type f -name "*.tsx" -exec sed -i '' \
  -e 's/className="\([^"]*\)gap-0\.5/className="\1gap-xs/g' \
  -e 's/className="\([^"]*\)py-0\.5/className="\1py-xs/g' \
  -e 's/className="\([^"]*\)px-sm py-0\.5/className="\1px-sm py-xs/g' \
  {} \;

echo "✅ Automated fixes applied!"
echo "🔍 Now run lint to check remaining warnings..."
