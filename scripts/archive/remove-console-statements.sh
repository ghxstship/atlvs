#!/bin/bash
# Remove all console statements from production codebase

echo "🧹 Removing console statements from production codebase..."

# Find all TypeScript/JavaScript files and remove console statements
find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
  if grep -q "console\." "$file"; then
    echo "Processing: $file"
    # Remove console statements but preserve console.error for error logging
    sed -i '' '/console\.\(log\|info\|debug\|warn\|table\|trace\|time\|timeEnd\)/d' "$file"
    # Keep console.error for production error logging
  fi
done

echo "✅ Console statement cleanup complete"

# Count remaining console statements
remaining=$(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -c "console\." | awk '{sum+=$1} END {print sum}')

echo "📊 Console statements remaining: $remaining (should be 0 for production)"
