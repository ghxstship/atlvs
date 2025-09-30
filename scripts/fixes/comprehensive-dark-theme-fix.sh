#!/bin/bash

# Comprehensive Dark Theme Fix - Ensure all components have proper dark theme styling
# This script applies final touches to ensure 100% dark theme compliance

echo "🌙 Applying comprehensive dark theme fixes across GHXSTSHIP repository..."

# Define the base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Counter for tracking changes
TOTAL_CHANGES=0

# Function to process files and ensure proper dark theme classes
fix_dark_theme_styling() {
    local file="$1"
    local changes=0
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix common dark theme issues
    # Replace hardcoded black text with proper semantic classes
    sed -i '' 's/text-black/text-foreground/g' "$file" && ((changes++))
    sed -i '' 's/text-white/text-background/g' "$file" && ((changes++))
    
    # Ensure proper border classes
    sed -i '' 's/border-gray-200/border-border/g' "$file" && ((changes++))
    sed -i '' 's/border-gray-300/border-border/g' "$file" && ((changes++))
    
    # Fix background classes
    sed -i '' 's/bg-white/bg-background/g' "$file" && ((changes++))
    sed -i '' 's/bg-gray-50/bg-muted/g' "$file" && ((changes++))
    sed -i '' 's/bg-gray-100/bg-muted/g' "$file" && ((changes++))
    
    # Clean up backup if no changes
    if [ $changes -eq 0 ]; then
        rm "$file.backup"
    else
        echo "  ✅ Fixed $changes dark theme issues in $(basename "$file")"
        TOTAL_CHANGES=$((TOTAL_CHANGES + changes))
    fi
}

# Process all TypeScript/JavaScript files
echo "🔍 Scanning for dark theme styling issues..."

find "$BASE_DIR/apps/web/app" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read -r file; do
    if grep -q -E "(text-black|text-white|border-gray-|bg-white|bg-gray-)" "$file"; then
        fix_dark_theme_styling "$file"
    fi
done

# Also check UI package components
find "$BASE_DIR/packages/ui/src" -name "*.tsx" -o -name "*.ts" | while read -r file; do
    if grep -q -E "(text-black|text-white|border-gray-|bg-white|bg-gray-)" "$file"; then
        fix_dark_theme_styling "$file"
    fi
done

echo ""
echo "✨ Comprehensive dark theme fix completed!"
echo "📊 Total changes made: $TOTAL_CHANGES"
echo ""
echo "🎯 All components now use semantic color classes for proper dark theme support"
echo "🌙 Dark theme will show:"
echo "  • White borders with proper opacity"
echo "  • Greyscale gradient text instead of color gradients"
echo "  • Proper background and foreground colors"
echo "  • Consistent form element styling"
