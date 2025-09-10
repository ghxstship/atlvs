#!/bin/bash

# Fix Select Props - Remove unsupported props from Select components
# This script addresses the systematic issue where Select components are using
# props that don't exist in the SelectProps interface (error, label, required, id)

set -e

echo "🔧 Fixing Select component prop issues..."

# Define the base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web"

# Function to fix Select components in a file
fix_select_props() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Remove error prop from Select components
    sed -i '' '/^[[:space:]]*error={form\.formState\.errors\./d' "$file"
    
    # Remove label prop from Select components (but keep it for Input/Textarea)
    # This is more complex - we need to be selective
    perl -i -pe '
        # Track if we are inside a Select component
        if (/^\s*<Select/) {
            $in_select = 1;
        }
        if ($in_select && /^\s*>/) {
            $in_select = 0;
        }
        # Remove label prop only if inside Select
        if ($in_select && /^\s*label=/) {
            $_ = "";
        }
    ' "$file"
    
    # Remove required prop from Select components
    perl -i -pe '
        if (/^\s*<Select/) {
            $in_select = 1;
        }
        if ($in_select && /^\s*>/) {
            $in_select = 0;
        }
        if ($in_select && /^\s*required\s*$/) {
            $_ = "";
        }
    ' "$file"
    
    # Remove id prop from Select components
    perl -i -pe '
        if (/^\s*<Select/) {
            $in_select = 1;
        }
        if ($in_select && /^\s*>/) {
            $in_select = 0;
        }
        if ($in_select && /^\s*id=/) {
            $_ = "";
        }
    ' "$file"
    
    echo "✅ Fixed: $file"
}

# Find all files with Select error props
echo "🔍 Finding files with Select prop issues..."

FILES_WITH_SELECT_ERRORS=$(find "$BASE_DIR" -name "*.tsx" -exec grep -l "error={form\.formState\.errors\." {} \; | head -20)

if [ -z "$FILES_WITH_SELECT_ERRORS" ]; then
    echo "✅ No files found with Select error props"
else
    echo "📁 Found files with Select prop issues:"
    echo "$FILES_WITH_SELECT_ERRORS"
    echo ""
    
    # Process each file
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            fix_select_props "$file"
        fi
    done <<< "$FILES_WITH_SELECT_ERRORS"
fi

echo ""
echo "🎉 Select prop fixes completed!"
echo "📝 Backup files created with .backup extension"
echo "🧪 Run 'npm run build:core' to verify fixes"
