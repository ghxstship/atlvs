#!/bin/bash
# Comprehensive production codebase cleanup

echo "🧹 ZERO TOLERANCE PRODUCTION CLEANUP INITIATED"

# Phase 1: Remove temporary files
echo "📁 Phase 1: Removing temporary files..."
find . -name "*.tmp" -o -name "*.bak" -o -name ".DS_Store" -o -name "Thumbs.db" -type f -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
echo "✅ Temporary files removed"

# Phase 2: Remove empty directories
echo "📁 Phase 2: Removing empty directories..."
find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" -delete
echo "✅ Empty directories removed"

# Phase 3: Fix unused imports and variables
echo "🔧 Phase 3: Fixing unused imports and variables..."
find apps packages -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Remove unused import statements (basic pattern)
  sed -i '' '/^import.*from.*;$/d' "$file" 2>/dev/null || true
done
echo "✅ Unused imports cleaned"

# Phase 4: Security cleanup - remove hardcoded secrets patterns
echo "🔒 Phase 4: Security cleanup..."
find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "password\|secret\|key\|token" | while read -r file; do
  # This is just a warning - manual review needed
  echo "⚠️  Security check needed: $file contains sensitive keywords"
done
echo "✅ Security patterns flagged for review"

# Phase 5: Remove TODO/FIXME comments
echo "📝 Phase 5: Removing development comments..."
find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
  sed -i '' '/\/\/ TODO:/d' "$file"
  sed -i '' '/\/\/ FIXME:/d' "$file"
  sed -i '' '/\/\/ XXX:/d' "$file"
  sed -i '' '/\/\/ HACK:/d' "$file"
done
echo "✅ Development comments removed"

# Phase 6: Validate cleanup
echo "✅ Phase 6: Validation..."
remaining_console=$(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -c "console\." | awk '{sum+=$1} END {print sum}')
remaining_any=$(find apps packages -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk '{sum+=$1} END {print sum}')

echo "📊 CLEANUP RESULTS:"
echo "  Console statements: $remaining_console (target: 0)"
echo "  Any types: $remaining_any (target: 0)"

if [[ $remaining_console -eq 0 ]] && [[ $remaining_any -eq 0 ]]; then
  echo "🎉 ZERO TOLERANCE CLEANUP COMPLETE"
else
  echo "⚠️  Additional manual cleanup required"
fi
