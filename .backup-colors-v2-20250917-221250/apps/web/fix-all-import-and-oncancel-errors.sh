#!/bin/bash

# Comprehensive script to fix all remaining import and onCancel errors
echo "🔧 Starting comprehensive import and onCancel fixes..."

# Fix @atlvs/ui imports to @ghxstship/ui
echo "📦 Fixing import paths..."
find app/ -name "*.tsx" -type f -exec sed -i '' 's/@atlvs\/ui/@ghxstship\/ui/g' {} \;

# Fix onCancel undefined errors by adding fallback functions
echo "🔄 Fixing onCancel undefined errors..."
find app/ -name "*.tsx" -type f -exec sed -i '' 's/onClick={onCancel}/onClick={onCancel || (() => {})}/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/onClose={onCancel}/onClose={onCancel || (() => {})}/g' {} \;

# Fix UniversalDrawer imports to regular Drawer
echo "🎨 Fixing Drawer component imports..."
find app/ -name "*.tsx" -type f -exec sed -i '' 's/UniversalDrawer as Drawer/Drawer/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/import { UniversalDrawer }/import { Drawer }/g' {} \;

# Fix size prop to width prop for Drawer components
echo "📏 Fixing Drawer size props..."
find app/ -name "*.tsx" -type f -exec sed -i '' 's/size="lg"/width="lg"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/size="md"/width="md"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/size="sm"/width="sm"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/size="xl"/width="xl"/g' {} \;

echo "🔍 Checking for remaining issues..."
ATLVS_IMPORTS=$(grep -r "@atlvs/ui" app/ --include="*.tsx" | wc -l)
ONCANCEL_ISSUES=$(grep -r "onClick={onCancel}" app/ --include="*.tsx" | grep -v "|| (() => {})" | wc -l)

echo "📊 Results:"
echo "   - @atlvs/ui imports remaining: $ATLVS_IMPORTS"
echo "   - onCancel issues remaining: $ONCANCEL_ISSUES"

if [ "$ATLVS_IMPORTS" -eq 0 ] && [ "$ONCANCEL_ISSUES" -eq 0 ]; then
  echo "🎉 All import and onCancel errors fixed!"
else
  echo "⚠️  Some issues may remain, check build output"
fi
