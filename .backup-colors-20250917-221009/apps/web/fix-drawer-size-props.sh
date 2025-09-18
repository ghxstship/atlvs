#!/bin/bash

# Fix all Drawer size props back to width props (Drawer uses width, Button uses size)
echo "🔧 Fixing Drawer size props back to width props..."

# Find all Drawer components and fix size to width
find app/ -name "*.tsx" -type f -exec grep -l "Drawer" {} \; | while read file; do
  # Only change size to width for Drawer components, not Button components
  sed -i '' '/Drawer/,/>/s/size="/width="/g' "$file"
done

echo "🔍 Checking for remaining Drawer size props..."
DRAWER_SIZE_ISSUES=$(grep -r '<Drawer' app/ --include="*.tsx" | grep -c 'size=')

echo "📊 Results:"
echo "   - Drawer size props remaining: $DRAWER_SIZE_ISSUES"

if [ "$DRAWER_SIZE_ISSUES" -eq 0 ]; then
  echo "🎉 All Drawer size props fixed!"
else
  echo "⚠️  Some Drawer size props may remain"
fi
