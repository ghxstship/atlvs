#!/bin/bash

# Comprehensive fix for all import-related errors
set -e

APPS_WEB="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web"
cd "$APPS_WEB"

echo "🔧 Fixing all UnifiedInput and Card imports across codebase..."

# Replace UnifiedInput with Input in all TypeScript files
echo "📝 Replacing UnifiedInput with Input..."
find app -name "*.tsx" -o -name "*.ts" | while read file; do
  if grep -q "UnifiedInput" "$file" 2>/dev/null; then
    echo "  Fixing: $file"
    perl -i -pe 's/UnifiedInput/Input/g' "$file"
  fi
done

echo "✅ UnifiedInput replaced with Input!"

# Fix imports - add Input where missing
echo "📝 Ensuring Input is imported..."
find app -name "*.tsx" | while read file; do
  # Check if file uses Input but doesn't import it
  if grep -q "<Input" "$file" && ! grep -q "import.*Input" "$file" 2>/dev/null; then
    echo "  Adding Input import to: $file"
    # Add Input to existing @ghxstship/ui import if it exists
    if grep -q "from '@ghxstship/ui'" "$file"; then
      perl -i -pe "s/from '@ghxstship\/ui'/from '\@ghxstship\/ui'/ and s/({[^}]*)(})/\$1, Input\$2/ if /from '\@ghxstship\/ui'/ && !/Input/" "$file"
    fi
  fi
done

echo "✅ Input imports fixed!"

# Fix Card component imports - add CardTitle, CardDescription, CardContent where missing
echo "📝 Fixing Card component imports..."
find app -name "*.tsx" | while read file; do
  # Check if file uses Card components but doesn't import them
  if (grep -q "<CardTitle" "$file" || grep -q "<CardDescription" "$file" || grep -q "<CardContent" "$file") 2>/dev/null; then
    if ! grep -q "CardTitle" "$file" 2>/dev/null; then
      echo "  Adding Card components to: $file"
      # Add Card components to existing @ghxstship/ui import
      if grep -q "from '@ghxstship/ui'" "$file"; then
        perl -i -pe "
          if (/from (\047|')@ghxstship\/ui(\047|')/ && !/CardTitle/) {
            s/Card,/Card, CardHeader, CardTitle, CardDescription, CardContent,/;
            s/Card([^,])/Card, CardHeader, CardTitle, CardDescription, CardContent\$1/ unless /CardContent/;
          }
        " "$file"
      fi
    fi
  fi
done

echo "✅ Card component imports fixed!"

# Remove Textarea where it's used but should be textarea (HTML element)
echo "📝 Fixing Textarea usage..."
find app -name "*.tsx" | while read file; do
  if grep -q "<Textarea" "$file" && ! grep -q "import.*Textarea" "$file" 2>/dev/null; then
    echo "  Replacing Textarea with textarea in: $file"
    perl -i -pe 's/<Textarea/<textarea/g; s/<\/Textarea>/<\/textarea>/g' "$file"
  fi
done

echo "✅ Textarea fixed!"

echo "🎯 All import fixes applied successfully!"
