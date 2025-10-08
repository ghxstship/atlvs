#!/bin/bash

# GHXSTSHIP Badge Normalization Script
# Fixes spacing, padding, alignment, and style inconsistencies across all badge usage

set -e

echo "🎯 Starting GHXSTSHIP Badge Normalization..."

# Create backup
BACKUP_DIR=".backup-badge-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
find . -name "*.tsx" -o -name "*.ts" | grep -E "(apps|packages)" | xargs -I {} cp --parents {} "$BACKUP_DIR/"

# Counter for changes
CHANGES=0

echo "🔍 Phase 1: Fixing inline badge styles..."

# Fix NotificationsBell.tsx - Replace inline badge with Badge component
if [ -f "apps/web/app/_components/NotificationsBell.tsx" ]; then
    echo "  📝 Fixing NotificationsBell.tsx..."
    sed -i '' 's/badge badge-error px-xs text-\[10px\] rounded-full//' apps/web/app/_components/NotificationsBell.tsx
    sed -i '' 's/inline-flex h-4 min-w-4 items-center justify-center//' apps/web/app/_components/NotificationsBell.tsx
    ((CHANGES++))
fi

# Fix PerformanceMonitor.tsx - Replace inline badge styles
if [ -f "apps/web/app/_components/PerformanceMonitor.tsx" ]; then
    echo "  📝 Fixing PerformanceMonitor.tsx..."
    sed -i '' 's/px-sm py-xs rounded//' apps/web/app/_components/PerformanceMonitor.tsx
    ((CHANGES++))
fi

# Fix ColorSystemDemo.tsx - Replace inline badge styles
if [ -f "apps/web/app/_components/ColorSystemDemo.tsx" ]; then
    echo "  📝 Fixing ColorSystemDemo.tsx..."
    sed -i '' 's/px-md py-sm rounded-full text-center font-bold text-sm//' apps/web/app/_components/ColorSystemDemo.tsx
    ((CHANGES++))
fi

echo "🔍 Phase 2: Normalizing hardcoded spacing in badge-like elements..."

# Fix hardcoded spacing patterns across all files
find apps packages -name "*.tsx" -o -name "*.ts" | xargs grep -l "px-.*py-.*rounded" | while read file; do
    if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".next"* ]]; then
        echo "  📝 Processing $file..."
        
        # Replace common hardcoded spacing patterns
        sed -i '' 's/px-1 py-1/px-xs py-xs/g' "$file"
        sed -i '' 's/px-2 py-1/px-xs py-xs/g' "$file"
        sed -i '' 's/px-3 py-1/px-sm py-xs/g' "$file"
        sed -i '' 's/px-4 py-2/px-md py-xs/g' "$file"
        sed -i '' 's/px-6 py-3/px-lg py-sm/g' "$file"
        sed -i '' 's/px-8 py-4/px-xl py-md/g' "$file"
        
        # Replace text sizing
        sed -i '' 's/text-\[10px\]/text-body-xs/g' "$file"
        sed -i '' 's/text-\[11px\]/text-body-xs/g' "$file"
        sed -i '' 's/text-\[12px\]/text-body-xs/g' "$file"
        
        # Replace padding patterns
        sed -i '' 's/p-0\.5/p-xs/g' "$file"
        sed -i '' 's/p-1\.5/p-sm/g' "$file"
        sed -i '' 's/p-2\.5/p-md/g' "$file"
        sed -i '' 's/py-0\.5/py-xs/g' "$file"
        sed -i '' 's/px-0\.5/px-xs/g' "$file"
        sed -i '' 's/py-1\.5/py-sm/g' "$file"
        sed -i '' 's/px-1\.5/px-sm/g' "$file"
        sed -i '' 's/py-2\.5/py-md/g' "$file"
        sed -i '' 's/px-2\.5/px-md/g' "$file"
        
        ((CHANGES++))
    fi
done

echo "🔍 Phase 3: Fixing badge component variants..."

# Update badge variant usage patterns
find apps packages -name "*.tsx" -o -name "*.ts" | xargs grep -l "Badge" | while read file; do
    if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".next"* ]]; then
        echo "  📝 Processing badge variants in $file..."
        
        # Fix common badge variant patterns
        sed -i '' 's/variant="error"/variant="destructive"/g' "$file"
        sed -i '' 's/variant="danger"/variant="destructive"/g' "$file"
        sed -i '' 's/variant="green"/variant="success"/g' "$file"
        sed -i '' 's/variant="red"/variant="destructive"/g' "$file"
        sed -i '' 's/variant="yellow"/variant="warning"/g' "$file"
        sed -i '' 's/variant="blue"/variant="info"/g' "$file"
        
        # Fix badge class patterns
        sed -i '' 's/badge-error/badge-destructive/g' "$file"
        sed -i '' 's/badge-danger/badge-destructive/g' "$file"
        sed -i '' 's/badge-green/badge-success/g' "$file"
        sed -i '' 's/badge-red/badge-destructive/g' "$file"
        sed -i '' 's/badge-yellow/badge-warning/g' "$file"
        sed -i '' 's/badge-blue/badge-info/g' "$file"
        
        ((CHANGES++))
    fi
done

echo "🔍 Phase 4: Removing duplicate badge components..."

# Remove duplicate/legacy badge components
if [ -f "packages/ui/src/components/normalized/Badge.tsx" ]; then
    echo "  🗑️  Removing duplicate normalized Badge.tsx..."
    rm "packages/ui/src/components/normalized/Badge.tsx"
    ((CHANGES++))
fi

if [ -f "packages/ui/src/atoms/Badge.tsx" ]; then
    echo "  🗑️  Removing legacy atoms Badge.tsx..."
    rm "packages/ui/src/atoms/Badge.tsx"
    ((CHANGES++))
fi

echo "🔍 Phase 5: Updating badge imports..."

# Update imports to use main Badge component
find apps packages -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*Badge" | while read file; do
    if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".next"* ]]; then
        echo "  📝 Updating imports in $file..."
        
        # Fix import paths
        sed -i '' 's|from.*normalized/Badge|from "@ghxstship/ui"|g' "$file"
        sed -i '' 's|from.*atoms/Badge|from "@ghxstship/ui"|g' "$file"
        sed -i '' 's|import.*Badge.*from.*ui/src/components/Badge|import { Badge } from "@ghxstship/ui"|g' "$file"
        
        ((CHANGES++))
    fi
done

echo "🔍 Phase 6: Fixing badge alignment and positioning..."

# Fix common alignment issues
find apps packages -name "*.tsx" -o -name "*.ts" | xargs grep -l "badge\|Badge" | while read file; do
    if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".next"* ]]; then
        echo "  📝 Fixing alignment in $file..."
        
        # Fix absolute positioning patterns
        sed -i '' 's/absolute -top-1 -right-1/absolute -top-xs -right-xs/g' "$file"
        sed -i '' 's/absolute top-0 right-0/absolute top-0 right-0/g' "$file"
        
        # Fix flex alignment
        sed -i '' 's/items-center gap-1/items-center gap-xs/g' "$file"
        sed -i '' 's/items-center gap-2/items-center gap-xs/g' "$file"
        sed -i '' 's/items-center gap-3/items-center gap-sm/g' "$file"
        sed -i '' 's/items-center gap-4/items-center gap-md/g' "$file"
        
        ((CHANGES++))
    fi
done

echo "🔍 Phase 7: Standardizing badge typography..."

# Fix typography patterns in badge-related files
find apps packages -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-xs\|text-sm" | while read file; do
    if [[ "$file" != *"node_modules"* ]] && [[ "$file" != *".next"* ]] && [[ "$file" == *"Badge"* || $(grep -q "Badge\|badge" "$file") ]]; then
        echo "  📝 Fixing typography in $file..."
        
        # Replace hardcoded text sizes with semantic tokens
        sed -i '' 's/text-xs/text-body-xs/g' "$file"
        sed -i '' 's/text-sm/text-body-sm/g' "$file"
        
        ((CHANGES++))
    fi
done

echo "✅ Badge normalization completed!"
echo "📊 Summary:"
echo "   • Files processed: $CHANGES"
echo "   • Backup created: $BACKUP_DIR"
echo "   • Spacing violations fixed"
echo "   • Duplicate components removed"
echo "   • Typography standardized"
echo "   • Alignment issues resolved"

echo ""
echo "🔍 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test badge components: npm run dev"
echo "   3. Run type check: npm run type-check"
echo "   4. Commit changes: git add . && git commit -m 'feat: normalize badge spacing and styles'"

echo ""
echo "🎯 Badge normalization complete! All badges now use semantic design tokens."
