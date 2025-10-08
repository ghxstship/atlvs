#!/bin/bash

# Migration script for UI component updates
# Migrates deprecated Card and Badge components to new API

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_APP_DIR="$REPO_ROOT/apps/web"

echo "🔄 Starting UI Component Migration..."
echo "Working directory: $WEB_APP_DIR"

# Function to process files
migrate_files() {
  local pattern=$1
  local description=$2
  
  echo ""
  echo "📝 $description"
  
  find "$WEB_APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec grep -l "$pattern" {} + 2>/dev/null | while read -r file; do
    echo "  Processing: ${file#$WEB_APP_DIR/}"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Apply transformations
    sed -i '' \
      -e 's/variant="outline"/variant="secondary"/g' \
      -e 's/variant="destructive"/variant="error"/g' \
      -e "s/variant='outline'/variant='secondary'/g" \
      -e "s/variant='destructive'/variant='error'/g" \
      "$file"
  done
}

# Migrate Badge variants
echo ""
echo "🏷️  Migrating Badge variants..."
echo "  - outline → secondary"
echo "  - destructive → error"

find "$WEB_APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec grep -l 'Badge.*variant=' {} + 2>/dev/null | while read -r file; do
  echo "  Processing: ${file#$WEB_APP_DIR/}"
  cp "$file" "$file.bak"
  
  sed -i '' \
    -e 's/variant="outline"/variant="secondary"/g' \
    -e 's/variant="destructive"/variant="error"/g' \
    -e "s/variant='outline'/variant='secondary'/g" \
    -e "s/variant='destructive'/variant='error'/g" \
    "$file"
done

echo ""
echo "✅ Badge migration complete"

# Migrate Card components (requires manual intervention for structural changes)
echo ""
echo "⚠️  Card component migration requires manual intervention"
echo "📋 Files using deprecated Card subcomponents:"
echo ""

find "$WEB_APP_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -exec grep -l 'CardTitle\|CardDescription\|CardContent' {} + 2>/dev/null | head -20 | while read -r file; do
  echo "  - ${file#$WEB_APP_DIR/}"
done

echo ""
echo "📝 Card API changes required:"
echo "  Old: <Card><CardHeader><CardTitle>...</CardTitle><CardDescription>...</CardDescription></CardHeader><CardContent>...</CardContent></Card>"
echo "  New: <Card><CardHeader><h3>...</h3><p>...</p></CardHeader><CardBody>...</CardBody></Card>"

echo ""
echo "🔧 Migration summary:"
echo "  ✅ Badge variants updated automatically"
echo "  ⚠️  Card components need manual review"
echo ""
echo "💾 Backups created with .bak extension"
echo "🗑️  To remove backups: find $WEB_APP_DIR -name '*.bak' -delete"

exit 0
