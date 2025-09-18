#!/bin/bash

# Fix all Button width props to size props
echo "🔧 Fixing Button width props to size props..."

find app/ -name "*.tsx" -type f -exec sed -i '' 's/width="sm"/size="sm"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/width="md"/size="md"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/width="lg"/size="lg"/g' {} \;
find app/ -name "*.tsx" -type f -exec sed -i '' 's/width="xl"/size="xl"/g' {} \;

echo "🔍 Checking for remaining Button width props..."
BUTTON_WIDTH_ISSUES=$(grep -r 'width="' app/ --include="*.tsx" | grep -c "Button")

echo "📊 Results:"
echo "   - Button width props remaining: $BUTTON_WIDTH_ISSUES"

if [ "$BUTTON_WIDTH_ISSUES" -eq 0 ]; then
  echo "🎉 All Button width props fixed!"
else
  echo "⚠️  Some Button width props may remain"
fi
