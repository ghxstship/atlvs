#!/bin/bash

# ============================================================================
# ATLVS Color Token Normalization Script
# ============================================================================
# Replaces hardcoded hex colors with semantic design tokens across the codebase
# Usage: ./scripts/normalize-color-tokens.sh
# ============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🎨 ATLVS Color Token Normalization"
echo "=================================="
echo ""

# Create backup
BACKUP_DIR=".backup-color-tokens-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -R apps/web/app "$BACKUP_DIR/"
echo "✅ Backup created"
echo ""

# Color mapping reference
declare -A COLOR_MAP=(
  # Grays (muted/border)
  ["#6b7280"]="hsl(var(--color-muted-foreground))"
  ["#9ca3af"]="hsl(var(--color-muted-foreground))"
  ["#d1d5db"]="hsl(var(--color-border))"
  ["#e5e7eb"]="hsl(var(--border-subtle))"
  ["#f3f4f6"]="hsl(var(--surface-muted))"
  ["#f9fafb"]="hsl(var(--surface-subtle))"
  
  # Blues (info)
  ["#3b82f6"]="hsl(var(--color-info))"
  ["#2563eb"]="hsl(var(--color-info))"
  ["#1d4ed8"]="hsl(var(--color-info))"
  ["#60a5fa"]="hsl(var(--color-info))"
  
  # Greens (success/primary)
  ["#10b981"]="hsl(var(--color-success))"
  ["#059669"]="hsl(var(--color-success))"
  ["#34d399"]="hsl(var(--color-success))"
  ["#22c55e"]="hsl(var(--color-success))"
  
  # Oranges/Yellows (warning)
  ["#f59e0b"]="hsl(var(--color-warning))"
  ["#d97706"]="hsl(var(--color-warning))"
  ["#fbbf24"]="hsl(var(--color-warning))"
  ["#f97316"]="hsl(var(--color-warning))"
  
  # Reds (destructive)
  ["#ef4444"]="hsl(var(--color-destructive))"
  ["#dc2626"]="hsl(var(--color-destructive))"
  ["#f87171"]="hsl(var(--color-destructive))"
  
  # Purples/Pinks (accent variations)
  ["#a855f7"]="hsl(var(--color-accent))"
  ["#9333ea"]="hsl(var(--color-accent))"
  ["#ec4899"]="hsl(var(--color-accent))"
)

# Files to process
TARGET_DIRS=(
  "apps/web/app/_components"
  "apps/web/app/(app)"
  "apps/web/app/(marketing)"
)

echo "🔍 Scanning for hardcoded colors..."
echo ""

# Find all TypeScript/TSX files with hex colors
FILES_WITH_COLORS=()
for dir in "${TARGET_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    while IFS= read -r file; do
      FILES_WITH_COLORS+=("$file")
    done < <(find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "#[0-9a-fA-F]\{6\}" {} \;)
  fi
done

TOTAL_FILES=${#FILES_WITH_COLORS[@]}
echo "📊 Found $TOTAL_FILES files with hardcoded colors"
echo ""

if [ $TOTAL_FILES -eq 0 ]; then
  echo "✨ No hardcoded colors found - codebase is already normalized!"
  exit 0
fi

# Process each file
PROCESSED=0
SKIPPED=0

for file in "${FILES_WITH_COLORS[@]}"; do
  echo "🔧 Processing: $file"
  
  # Skip if file doesn't exist (edge case)
  if [ ! -f "$file" ]; then
    echo "   ⚠️  File not found, skipping"
    ((SKIPPED++))
    continue
  fi
  
  # Create temp file
  TEMP_FILE="${file}.tmp"
  cp "$file" "$TEMP_FILE"
  
  # Apply replacements
  CHANGES_MADE=false
  for hex in "${!COLOR_MAP[@]}"; do
    token="${COLOR_MAP[$hex]}"
    
    # Replace in various contexts
    # 1. color: '#hex' -> color: 'token'
    if sed -i '' "s/color: ['\"]${hex}['\"]\\([,;]\\)/color: '${token}'\\1/g" "$TEMP_FILE" 2>/dev/null; then
      CHANGES_MADE=true
    fi
    
    # 2. color='#hex' -> color='token'
    if sed -i '' "s/color=['\"]${hex}['\"]\\([,;]\\)/color='${token}'\\1/g" "$TEMP_FILE" 2>/dev/null; then
      CHANGES_MADE=true
    fi
    
    # 3. backgroundColor: '#hex' -> backgroundColor: 'token'
    if sed -i '' "s/backgroundColor: ['\"]${hex}['\"]\\([,;]\\)/backgroundColor: '${token}'\\1/g" "$TEMP_FILE" 2>/dev/null; then
      CHANGES_MADE=true
    fi
    
    # 4. bg-[#hex] -> style with token (for inline Tailwind)
    if sed -i '' "s/\\[${hex}\\]/'${token}'/g" "$TEMP_FILE" 2>/dev/null; then
      CHANGES_MADE=true
    fi
  done
  
  # If changes were made, replace original file
  if [ "$CHANGES_MADE" = true ]; then
    mv "$TEMP_FILE" "$file"
    echo "   ✅ Updated"
    ((PROCESSED++))
  else
    rm "$TEMP_FILE"
    echo "   ⏭️  No matching colors found"
    ((SKIPPED++))
  fi
done

echo ""
echo "=================================="
echo "✨ Normalization Complete!"
echo "=================================="
echo "📊 Statistics:"
echo "   • Total files scanned: $TOTAL_FILES"
echo "   • Files updated: $PROCESSED"
echo "   • Files skipped: $SKIPPED"
echo ""
echo "📦 Backup location: $BACKUP_DIR"
echo ""
echo "🔍 Next Steps:"
echo "   1. Review changes: git diff"
echo "   2. Test the application visually"
echo "   3. Run: pnpm typecheck"
echo "   4. Commit changes if satisfied"
echo ""
echo "💡 To restore backup:"
echo "   cp -R $BACKUP_DIR/app apps/web/"
echo ""
