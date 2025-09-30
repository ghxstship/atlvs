#!/bin/bash
# GHXSTSHIP Spacing Token Migration Script
# Migrates hardcoded Tailwind spacing utilities to semantic tokens

set -e

echo "🎨 GHXSTSHIP Spacing Token Migration"
echo "===================================="
echo ""

# Define file patterns
FILES="packages/ui/src/components/**/*.tsx"

# Backup before migration
BACKUP_DIR="backups/spacing-migration-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
rsync -av packages/ui/src/components/ "$BACKUP_DIR/" > /dev/null 2>&1
echo "✅ Backup created"
echo ""

# Count total instances before migration
echo "📊 Analyzing current spacing usage..."
TOTAL_BEFORE=$(grep -r "className.*\(p-[0-9]\|m-[0-9]\|gap-[0-9]\)" packages/ui/src/components/ | wc -l | tr -d ' ')
echo "Found $TOTAL_BEFORE hardcoded spacing instances"
echo ""

echo "🔄 Starting migration..."
echo ""

# Padding migrations
echo "  → Migrating padding utilities..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)p-1\([^0-9][^"]*\)"/className="\1p-xs\2"/g' \
  -e 's/className="\([^"]*\)p-2\([^0-9][^"]*\)"/className="\1p-sm\2"/g' \
  -e 's/className="\([^"]*\)p-3\([^0-9][^"]*\)"/className="\1p-sm\2"/g' \
  -e 's/className="\([^"]*\)p-4\([^0-9][^"]*\)"/className="\1p-md\2"/g' \
  -e 's/className="\([^"]*\)p-6\([^0-9][^"]*\)"/className="\1p-lg\2"/g' \
  -e 's/className="\([^"]*\)p-8\([^0-9][^"]*\)"/className="\1p-xl\2"/g' \
  -e 's/className="\([^"]*\)p-12\([^0-9][^"]*\)"/className="\1p-2xl\2"/g' \
  {} \;

# Margin migrations
echo "  → Migrating margin utilities..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)m-1\([^0-9][^"]*\)"/className="\1m-xs\2"/g' \
  -e 's/className="\([^"]*\)m-2\([^0-9][^"]*\)"/className="\1m-sm\2"/g' \
  -e 's/className="\([^"]*\)m-4\([^0-9][^"]*\)"/className="\1m-md\2"/g' \
  -e 's/className="\([^"]*\)m-6\([^0-9][^"]*\)"/className="\1m-lg\2"/g' \
  -e 's/className="\([^"]*\)m-8\([^0-9][^"]*\)"/className="\1m-xl\2"/g' \
  {} \;

# Gap migrations
echo "  → Migrating gap utilities..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)gap-1\([^0-9][^"]*\)"/className="\1gap-xs\2"/g' \
  -e 's/className="\([^"]*\)gap-2\([^0-9][^"]*\)"/className="\1gap-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-3\([^0-9][^"]*\)"/className="\1gap-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-4\([^0-9][^"]*\)"/className="\1gap-md\2"/g' \
  -e 's/className="\([^"]*\)gap-6\([^0-9][^"]*\)"/className="\1gap-lg\2"/g' \
  -e 's/className="\([^"]*\)gap-8\([^0-9][^"]*\)"/className="\1gap-xl\2"/g' \
  {} \;

# Directional padding - X axis
echo "  → Migrating horizontal padding..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)px-1\([^0-9][^"]*\)"/className="\1px-xs\2"/g' \
  -e 's/className="\([^"]*\)px-2\([^0-9][^"]*\)"/className="\1px-sm\2"/g' \
  -e 's/className="\([^"]*\)px-3\([^0-9][^"]*\)"/className="\1px-sm\2"/g' \
  -e 's/className="\([^"]*\)px-4\([^0-9][^"]*\)"/className="\1px-md\2"/g' \
  -e 's/className="\([^"]*\)px-6\([^0-9][^"]*\)"/className="\1px-lg\2"/g' \
  -e 's/className="\([^"]*\)px-8\([^0-9][^"]*\)"/className="\1px-xl\2"/g' \
  {} \;

# Directional padding - Y axis
echo "  → Migrating vertical padding..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)py-1\([^0-9][^"]*\)"/className="\1py-xs\2"/g' \
  -e 's/className="\([^"]*\)py-2\([^0-9][^"]*\)"/className="\1py-sm\2"/g' \
  -e 's/className="\([^"]*\)py-3\([^0-9][^"]*\)"/className="\1py-sm\2"/g' \
  -e 's/className="\([^"]*\)py-4\([^0-9][^"]*\)"/className="\1py-md\2"/g' \
  -e 's/className="\([^"]*\)py-6\([^0-9][^"]*\)"/className="\1py-lg\2"/g' \
  -e 's/className="\([^"]*\)py-8\([^0-9][^"]*\)"/className="\1py-xl\2"/g' \
  {} \;

# Directional padding - Individual sides
echo "  → Migrating individual side padding..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)pt-1\([^0-9][^"]*\)"/className="\1pt-xs\2"/g' \
  -e 's/className="\([^"]*\)pt-2\([^0-9][^"]*\)"/className="\1pt-sm\2"/g' \
  -e 's/className="\([^"]*\)pt-3\([^0-9][^"]*\)"/className="\1pt-sm\2"/g' \
  -e 's/className="\([^"]*\)pt-4\([^0-9][^"]*\)"/className="\1pt-md\2"/g' \
  -e 's/className="\([^"]*\)pt-6\([^0-9][^"]*\)"/className="\1pt-lg\2"/g' \
  -e 's/className="\([^"]*\)pb-1\([^0-9][^"]*\)"/className="\1pb-xs\2"/g' \
  -e 's/className="\([^"]*\)pb-2\([^0-9][^"]*\)"/className="\1pb-sm\2"/g' \
  -e 's/className="\([^"]*\)pb-3\([^0-9][^"]*\)"/className="\1pb-sm\2"/g' \
  -e 's/className="\([^"]*\)pb-4\([^0-9][^"]*\)"/className="\1pb-md\2"/g' \
  -e 's/className="\([^"]*\)pb-6\([^0-9][^"]*\)"/className="\1pb-lg\2"/g' \
  -e 's/className="\([^"]*\)pl-1\([^0-9][^"]*\)"/className="\1pl-xs\2"/g' \
  -e 's/className="\([^"]*\)pl-2\([^0-9][^"]*\)"/className="\1pl-sm\2"/g' \
  -e 's/className="\([^"]*\)pl-3\([^0-9][^"]*\)"/className="\1pl-sm\2"/g' \
  -e 's/className="\([^"]*\)pl-4\([^0-9][^"]*\)"/className="\1pl-md\2"/g' \
  -e 's/className="\([^"]*\)pl-6\([^0-9][^"]*\)"/className="\1pl-lg\2"/g' \
  -e 's/className="\([^"]*\)pr-1\([^0-9][^"]*\)"/className="\1pr-xs\2"/g' \
  -e 's/className="\([^"]*\)pr-2\([^0-9][^"]*\)"/className="\1pr-sm\2"/g' \
  -e 's/className="\([^"]*\)pr-3\([^0-9][^"]*\)"/className="\1pr-sm\2"/g' \
  -e 's/className="\([^"]*\)pr-4\([^0-9][^"]*\)"/className="\1pr-md\2"/g' \
  -e 's/className="\([^"]*\)pr-6\([^0-9][^"]*\)"/className="\1pr-lg\2"/g' \
  {} \;

# Directional margin - X axis
echo "  → Migrating horizontal margin..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)mx-1\([^0-9][^"]*\)"/className="\1mx-xs\2"/g' \
  -e 's/className="\([^"]*\)mx-2\([^0-9][^"]*\)"/className="\1mx-sm\2"/g' \
  -e 's/className="\([^"]*\)mx-4\([^0-9][^"]*\)"/className="\1mx-md\2"/g' \
  -e 's/className="\([^"]*\)mx-6\([^0-9][^"]*\)"/className="\1mx-lg\2"/g' \
  {} \;

# Directional margin - Y axis
echo "  → Migrating vertical margin..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)my-1\([^0-9][^"]*\)"/className="\1my-xs\2"/g' \
  -e 's/className="\([^"]*\)my-2\([^0-9][^"]*\)"/className="\1my-sm\2"/g' \
  -e 's/className="\([^"]*\)my-4\([^0-9][^"]*\)"/className="\1my-md\2"/g' \
  -e 's/className="\([^"]*\)my-6\([^0-9][^"]*\)"/className="\1my-lg\2"/g' \
  {} \;

# Directional gap
echo "  → Migrating directional gap..."
find packages/ui/src/components -name "*.tsx" -type f -exec sed -i '' \
  -e 's/className="\([^"]*\)gap-x-1\([^0-9][^"]*\)"/className="\1gap-x-xs\2"/g' \
  -e 's/className="\([^"]*\)gap-x-2\([^0-9][^"]*\)"/className="\1gap-x-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-x-3\([^0-9][^"]*\)"/className="\1gap-x-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-x-4\([^0-9][^"]*\)"/className="\1gap-x-md\2"/g' \
  -e 's/className="\([^"]*\)gap-y-1\([^0-9][^"]*\)"/className="\1gap-y-xs\2"/g' \
  -e 's/className="\([^"]*\)gap-y-2\([^0-9][^"]*\)"/className="\1gap-y-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-y-3\([^0-9][^"]*\)"/className="\1gap-y-sm\2"/g' \
  -e 's/className="\([^"]*\)gap-y-4\([^0-9][^"]*\)"/className="\1gap-y-md\2"/g' \
  {} \;

echo ""
echo "✅ Migration complete!"
echo ""

# Count instances after migration
TOTAL_AFTER=$(grep -r "className.*\(p-[0-9]\|m-[0-9]\|gap-[0-9]\)" packages/ui/src/components/ 2>/dev/null | wc -l | tr -d ' ')
MIGRATED=$((TOTAL_BEFORE - TOTAL_AFTER))

echo "📊 Migration Results:"
echo "  • Before: $TOTAL_BEFORE hardcoded instances"
echo "  • After: $TOTAL_AFTER hardcoded instances"
echo "  • Migrated: $MIGRATED instances"
echo ""

if [ "$TOTAL_AFTER" -eq 0 ]; then
  echo "🎉 Perfect! All hardcoded spacing utilities have been migrated!"
else
  echo "⚠️  Warning: $TOTAL_AFTER hardcoded instances remain"
  echo "   These may require manual review (edge cases, responsive utilities, etc.)"
fi

echo ""
echo "📝 Next Steps:"
echo "  1. Review changes: git diff packages/ui/src/components/"
echo "  2. Run tests: pnpm test"
echo "  3. Check visual regression: pnpm test:visual"
echo "  4. Commit changes: git add . && git commit -m 'refactor: migrate to semantic spacing tokens'"
echo ""
echo "💾 Backup location: $BACKUP_DIR"
echo "   To restore: rsync -av $BACKUP_DIR/ packages/ui/src/components/"
echo ""
echo "✨ Migration script completed successfully!"
