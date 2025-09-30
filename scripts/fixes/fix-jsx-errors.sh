#!/bin/bash

echo "🔧 Fixing JSX syntax errors in marketing pages..."

# Fix malformed h3 tags with Text variant
find /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' 's/<h3 <Text variant="[^"]*">/<h3>/g' {} \;

# Fix malformed Badge tags with Text variant
find /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' 's/<Badge variant="[^"]*" <Text variant="[^"]*">/<Badge variant="outline">/g' {} \;

# Fix malformed div tags with Text variant
find /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' 's/<div <Text variant="[^"]*">/<div>/g' {} \;

# Fix any remaining Text component references that are malformed
find /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' 's/<Text variant="[^"]*">//g' {} \;
find /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' 's/<\/Text>//g' {} \;

echo "✅ JSX syntax errors fixed!"
