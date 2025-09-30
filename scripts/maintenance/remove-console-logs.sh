#!/bin/bash

echo "🔧 Removing console statements from production code..."

cd "/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Remove console.log, console.error, console.warn, console.debug, console.info
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | grep -v build | while read file; do
  sed -i '' '/console\.\(log\|error\|warn\|debug\|info\)/d' "$file"
done

echo "✅ Console statements removed!"
