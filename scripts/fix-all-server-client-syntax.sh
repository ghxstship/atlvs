#!/bin/bash

# Comprehensive fix for all createServerClient syntax errors
# This script finds and fixes all corrupted createServerClient calls across the entire codebase

set -e

echo "🔧 Fixing all createServerClient syntax errors..."

BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web"

# Function to fix a single file
fix_server_client_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix the corrupted createServerClient syntax patterns
    # Pattern 1: )cookieStore); at the end
    sed -i '' 's/)cookieStore);/);/g' "$file"
    
    # Pattern 2: }){ at the end with extra cookie config
    perl -i -pe '
        BEGIN { $in_create_server = 0; }
        if (/createServerClient\(/) {
            $in_create_server = 1;
        }
        if ($in_create_server && /^\s*}\)\{/) {
            # Replace the malformed ending with proper closing
            $_ = "  );\n";
            $in_create_server = 0;
            # Skip the next few lines that are part of the malformed config
            $skip_lines = 5;
        }
        if ($skip_lines > 0) {
            $skip_lines--;
            $_ = "";
        }
    ' "$file"
    
    # Remove any remaining malformed cookie configuration blocks
    sed -i '' '/get: (name: string) => {/,/};/d' "$file"
    
    # Ensure proper createServerClient call format
    perl -i -pe '
        if (/createServerClient\(/) {
            # Look for the pattern and replace with simple cookieStore call
            s/createServerClient\([^)]*\)/createServerClient(cookieStore)/g;
        }
    ' "$file"
    
    echo "✅ Fixed: $file"
}

# Find all page.tsx files that might have createServerClient issues
echo "🔍 Finding files with createServerClient syntax issues..."

# Look for files with the problematic patterns
FILES_WITH_ISSUES=$(find "$BASE_DIR" -name "page.tsx" -type f -exec grep -l "createServerClient" {} \; | while read -r file; do
    if grep -q ")cookieStore);" "$file" 2>/dev/null || grep -q "}){" "$file" 2>/dev/null; then
        echo "$file"
    fi
done)

if [ -z "$FILES_WITH_ISSUES" ]; then
    echo "✅ No files found with createServerClient syntax issues"
else
    echo "📁 Found files with syntax issues:"
    echo "$FILES_WITH_ISSUES"
    echo ""
    
    # Process each file
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            fix_server_client_file "$file"
        fi
    done <<< "$FILES_WITH_ISSUES"
fi

echo ""
echo "🎉 All createServerClient syntax fixes completed!"
echo "📝 Backup files created with .backup extension"
