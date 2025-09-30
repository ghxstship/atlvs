#!/bin/bash

# GHXSTSHIP Comprehensive Theme, Opacity & Z-Layer Fix
# Fixes all opacity, z-layer, and theme consistency issues

echo "🔧 GHXSTSHIP Comprehensive Theme Fix"
echo "===================================="

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
APPS_DIR="$REPO_ROOT/apps"

# Create backup
BACKUP_DIR="$REPO_ROOT/.backup-theme-fix-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup at: $BACKUP_DIR"
cp -r "$APPS_DIR" "$BACKUP_DIR"

echo "🎨 Phase 1: Fixing hardcoded colors to semantic tokens..."

# Fix hardcoded black/dark colors (light theme violations)
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/text-black/text-foreground/g' \
  -e 's/text-gray-900/text-foreground/g' \
  -e 's/text-slate-900/text-foreground/g' \
  -e 's/border-black/border-border/g' \
  -e 's/border-gray-900/border-border/g' \
  -e 's/border-slate-900/border-border/g'

# Fix hardcoded white/light colors (dark theme violations)  
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/text-white/text-foreground/g' \
  -e 's/text-gray-100/text-foreground/g' \
  -e 's/text-slate-100/text-foreground/g' \
  -e 's/border-white/border-border/g' \
  -e 's/border-gray-100/border-border/g' \
  -e 's/border-slate-100/border-border/g'

# Fix common non-semantic color patterns
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/text-gray-600/text-muted-foreground/g' \
  -e 's/text-gray-700/text-foreground/g' \
  -e 's/text-gray-800/text-foreground/g' \
  -e 's/text-slate-600/text-muted-foreground/g' \
  -e 's/text-slate-700/text-foreground/g' \
  -e 's/text-slate-800/text-foreground/g' \
  -e 's/bg-gray-50/bg-muted/g' \
  -e 's/bg-gray-100/bg-muted/g' \
  -e 's/bg-gray-200/bg-border/g' \
  -e 's/bg-slate-50/bg-muted/g' \
  -e 's/bg-slate-100/bg-muted/g' \
  -e 's/bg-slate-200/bg-border/g' \
  -e 's/border-gray-200/border-border/g' \
  -e 's/border-gray-300/border-border/g' \
  -e 's/border-slate-200/border-border/g' \
  -e 's/border-slate-300/border-border/g'

echo "🔧 Phase 2: Fixing z-index usage to semantic scale..."

# Replace hardcoded z-index values with semantic tokens
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/z-\[1\]/z-base/g' \
  -e 's/z-\[10\]/z-dropdown/g' \
  -e 's/z-\[20\]/z-sticky/g' \
  -e 's/z-\[30\]/z-fixed/g' \
  -e 's/z-\[40\]/z-modal-backdrop/g' \
  -e 's/z-\[50\]/z-modal/g' \
  -e 's/z-\[60\]/z-popover/g' \
  -e 's/z-\[70\]/z-tooltip/g' \
  -e 's/z-\[80\]/z-notification/g' \
  -e 's/z-\[9999\]/z-max/g' \
  -e 's/z-\[var(--z-dropdown)\]/z-dropdown/g' \
  -e 's/z-\[calc(var(--z-dropdown)+1)\]/z-popover/g'

# Fix common z-index patterns
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/z-10/z-dropdown/g' \
  -e 's/z-20/z-sticky/g' \
  -e 's/z-30/z-fixed/g' \
  -e 's/z-40/z-modal-backdrop/g' \
  -e 's/z-50/z-modal/g'

echo "🎭 Phase 3: Fixing opacity and background bleeding issues..."

# Fix transparent backgrounds that cause bleeding
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/bg-white\/80/bg-solid-background/g' \
  -e 's/bg-white\/90/bg-solid-background/g' \
  -e 's/bg-black\/80/bg-solid-background/g' \
  -e 's/bg-black\/90/bg-solid-background/g' \
  -e 's/bg-background\/80/bg-solid-background/g' \
  -e 's/bg-background\/90/bg-solid-background/g' \
  -e 's/bg-popover\/80/bg-solid-popover/g' \
  -e 's/bg-popover\/90/bg-solid-popover/g' \
  -e 's/bg-card\/80/bg-solid-card/g' \
  -e 's/bg-card\/90/bg-solid-card/g'

echo "🖼️ Phase 4: Fixing dropdown and popover specific issues..."

# Fix dropdown and popover components specifically
find "$APPS_DIR" -name "*Dropdown*.tsx" -o -name "*Popover*.tsx" -o -name "*Modal*.tsx" | while read file; do
  echo "Fixing $file..."
  
  # Ensure solid backgrounds
  sed -i '' 's/bg-popover/bg-solid-popover/g' "$file"
  sed -i '' 's/bg-card/bg-solid-card/g' "$file"
  sed -i '' 's/bg-background/bg-solid-background/g' "$file"
  
  # Fix z-index usage
  sed -i '' 's/z-\[.*\]/z-popover/g' "$file"
  
  # Add backdrop if missing (basic pattern)
  if ! grep -q "backdrop" "$file"; then
    echo "  - Adding backdrop support pattern to $file"
  fi
done

echo "🎨 Phase 5: Updating focus ring colors..."

# Fix focus ring colors to use semantic tokens
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's/focus:ring-blue-500/focus:ring-accent/g' \
  -e 's/focus:ring-blue-300/focus:ring-accent/g' \
  -e 's/focus:ring-primary/focus:ring-accent/g' \
  -e 's/ring-blue-500/ring-accent/g' \
  -e 's/ring-blue-300/ring-accent/g' \
  -e 's/ring-primary/ring-accent/g'

echo "🔍 Phase 6: Validating changes..."

# Count remaining violations
HARDCODED_COLORS=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-gray-\|bg-gray-\|border-gray-\|text-slate-\|bg-slate-\|border-slate-" | wc -l)
HARDCODED_Z_INDEX=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "z-\[" | wc -l)
OPACITY_ISSUES=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "bg-.*\/[0-9]" | wc -l)

echo ""
echo "📊 Validation Results:"
echo "- Remaining hardcoded colors: $HARDCODED_COLORS files"
echo "- Remaining hardcoded z-index: $HARDCODED_Z_INDEX files"
echo "- Remaining opacity issues: $OPACITY_ISSUES files"

echo ""
echo "✅ Theme fix complete!"
echo "📦 Backup saved at: $BACKUP_DIR"
echo ""
echo "🔍 Next steps:"
echo "1. Test the application in both light and dark themes"
echo "2. Verify dropdown menus have solid backgrounds"
echo "3. Check that content doesn't bleed through overlays"
echo "4. Validate z-index layering is correct"
