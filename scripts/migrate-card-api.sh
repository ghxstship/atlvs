#!/bin/bash

# Card API Migration Script
# Migrates deprecated Card subcomponents to new API
# Old: CardTitle, CardDescription, CardContent
# New: Use native HTML elements in CardHeader + CardBody

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_APP_DIR="$REPO_ROOT/apps/web"

echo "🔄 Starting Card API Migration..."
echo "Working directory: $WEB_APP_DIR"
echo ""

# Count files before migration
CARD_FILES=$(find "$WEB_APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec grep -l 'CardTitle\|CardDescription\|CardContent' {} + 2>/dev/null | wc -l | tr -d ' ')

echo "📊 Found $CARD_FILES files using deprecated Card API"
echo ""

if [ "$CARD_FILES" -eq 0 ]; then
  echo "✅ No files need migration!"
  exit 0
fi

echo "⚠️  IMPORTANT: This migration requires manual review"
echo "The script will:"
echo "  1. Update imports to remove CardTitle, CardDescription, CardContent"
echo "  2. Add CardBody import"
echo "  3. Flag files for manual content migration"
echo ""
echo "You must manually:"
echo "  1. Replace <CardTitle> with <h3 className=\"font-semibold\">"
echo "  2. Replace <CardDescription> with <p className=\"text-sm text-muted-foreground\">"
echo "  3. Replace <CardContent> with <CardBody>"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 1
fi

echo ""
echo "🔧 Processing files..."
echo ""

# Create migration report
REPORT_FILE="$REPO_ROOT/CARD_MIGRATION_REPORT.md"
echo "# Card API Migration Report" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Generated**: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "## Files Requiring Manual Migration" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

PROCESSED=0

find "$WEB_APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec grep -l 'CardTitle\|CardDescription\|CardContent' {} + 2>/dev/null | while read -r file; do
  PROCESSED=$((PROCESSED + 1))
  REL_PATH="${file#$WEB_APP_DIR/}"
  echo "  Processing: $REL_PATH"
  
  # Create backup
  cp "$file" "$file.card-migration.bak"
  
  # Count occurrences
  TITLE_COUNT=$(grep -o 'CardTitle' "$file" | wc -l | tr -d ' ')
  DESC_COUNT=$(grep -o 'CardDescription' "$file" | wc -l | tr -d ' ')
  CONTENT_COUNT=$(grep -o 'CardContent' "$file" | wc -l | tr -d ' ')
  
  # Update imports - remove deprecated subcomponents from imports
  sed -i '' \
    -e 's/CardTitle, CardDescription, CardContent, //g' \
    -e 's/CardTitle, CardDescription, //g' \
    -e 's/CardDescription, CardContent, //g' \
    -e 's/CardTitle, CardContent, //g' \
    -e 's/, CardTitle, CardDescription, CardContent//g' \
    -e 's/, CardTitle, CardDescription//g' \
    -e 's/, CardDescription, CardContent//g' \
    -e 's/, CardTitle, CardContent//g' \
    -e 's/CardTitle, //g' \
    -e 's/CardDescription, //g' \
    -e 's/CardContent, //g' \
    -e 's/, CardTitle//g' \
    -e 's/, CardDescription//g' \
    -e 's/, CardContent//g' \
    "$file"
  
  # Ensure CardBody is imported if not already
  if grep -q "import.*Card.*from" "$file" && ! grep -q "CardBody" "$file"; then
    sed -i '' 's/\(import.*{\)\(.*Card[^}]*\)\(}.*from.*\)/\1\2, CardBody\3/g' "$file"
  fi
  
  # Add to report
  echo "### $REL_PATH" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "- **CardTitle**: $TITLE_COUNT occurrences" >> "$REPORT_FILE"
  echo "- **CardDescription**: $DESC_COUNT occurrences" >> "$REPORT_FILE"
  echo "- **CardContent**: $CONTENT_COUNT occurrences" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "**Manual actions required**:" >> "$REPORT_FILE"
  echo '```tsx' >> "$REPORT_FILE"
  echo "// Replace CardTitle with:" >> "$REPORT_FILE"
  echo '<h3 className="font-semibold text-lg">Title</h3>' >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "// Replace CardDescription with:" >> "$REPORT_FILE"
  echo '<p className="text-sm text-muted-foreground">Description</p>' >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "// Replace CardContent with:" >> "$REPORT_FILE"
  echo '<CardBody>Content</CardBody>' >> "$REPORT_FILE"
  echo '```' >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
done

echo ""
echo "✅ Import updates complete!"
echo ""
echo "📝 Migration report created: $REPORT_FILE"
echo ""
echo "⚠️  NEXT STEPS:"
echo "  1. Review files marked in the report"
echo "  2. Manually replace component usage as documented"
echo "  3. Test each file after migration"
echo "  4. Run build to verify: npm run build"
echo ""
echo "💾 Backups created with .card-migration.bak extension"
echo "🗑️  To remove backups after verification:"
echo "     find $WEB_APP_DIR -name '*.card-migration.bak' -delete"
echo ""

exit 0
