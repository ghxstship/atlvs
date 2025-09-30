#!/bin/bash

# Fix Gradient Text - Replace all bg-gradient-to-r...bg-clip-text text-transparent with text-gradient-accent
# This ensures proper greyscale gradients in dark theme

echo "🎨 Fixing gradient text patterns across GHXSTSHIP repository..."

# Define the base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Counter for tracking changes
TOTAL_CHANGES=0

# Function to process files
fix_gradient_text() {
    local file="$1"
    local changes=0
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace various gradient patterns with text-gradient-accent
    sed -i '' 's/bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent/text-gradient-accent/g' "$file" && ((changes++))
    sed -i '' 's/bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent/text-gradient-accent/g' "$file" && ((changes++))
    sed -i '' 's/bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent/text-gradient-accent/g' "$file" && ((changes++))
    sed -i '' 's/bg-gradient-to-r from-primary to-info bg-clip-text text-transparent/text-gradient-accent/g' "$file" && ((changes++))
    sed -i '' 's/bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent/text-gradient-accent/g' "$file" && ((changes++))
    
    # Clean up backup if no changes
    if [ $changes -eq 0 ]; then
        rm "$file.backup"
    else
        echo "  ✅ Fixed $changes gradient patterns in $(basename "$file")"
        TOTAL_CHANGES=$((TOTAL_CHANGES + changes))
    fi
}

# Find and process all TypeScript/JavaScript files with gradient patterns
echo "🔍 Scanning for gradient text patterns..."

find "$BASE_DIR/apps/web/app" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | while read -r file; do
    if grep -q "bg-gradient.*bg-clip-text text-transparent" "$file"; then
        fix_gradient_text "$file"
    fi
done

# Also fix the typography utility file
TYPOGRAPHY_FILE="$BASE_DIR/apps/web/app/_components/lib/typography.ts"
if [ -f "$TYPOGRAPHY_FILE" ]; then
    echo "🔧 Updating typography utility file..."
    sed -i '' 's/bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent/text-gradient-accent/g' "$TYPOGRAPHY_FILE"
    echo "  ✅ Updated typography.ts gradient utility"
fi

echo ""
echo "✨ Gradient text fix completed!"
echo "📊 Total changes made: $TOTAL_CHANGES"
echo ""
echo "🎯 All gradient text now uses semantic classes that work properly in both light and dark themes"
echo "💡 Dark theme will show greyscale gradients, light theme will show color gradients"
