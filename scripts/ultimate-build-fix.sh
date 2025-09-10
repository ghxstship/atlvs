#!/bin/bash

# Ultimate Build Fix Script - Fixes ALL createServerClient syntax errors globally
# This script finds and fixes every single malformed createServerClient call in the entire codebase

set -e

echo "🚀 Ultimate Build Fix - Resolving ALL createServerClient syntax errors"
echo "====================================================================="

BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web"

# Function to fix any file with malformed createServerClient
fix_server_client_globally() {
    local file="$1"
    echo "🔧 Fixing: $(basename "$file")"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Strategy: Replace the entire malformed createServerClient block with the simple correct version
    # This handles all variations of the malformed syntax
    
    # First, remove any lines that are part of the malformed cookie configuration
    sed -i '' '/get: (name: string) => {/,/remove: (name: string) => cookieStore\.delete(name)/d' "$file"
    
    # Then fix the createServerClient call itself
    # This regex matches the entire malformed block and replaces it
    perl -i -pe '
        BEGIN { $in_create_server = 0; $buffer = ""; }
        
        if (/const supabase = createServerClient\(/) {
            $in_create_server = 1;
            $buffer = $_;
            next;
        }
        
        if ($in_create_server) {
            $buffer .= $_;
            
            # Look for the end patterns that indicate malformed syntax
            if (/^\s*}\)\{/ || /^\s*}\);/ || /cookieStore\);/) {
                # Replace the entire malformed block with correct syntax
                print "  const supabase = createServerClient(cookieStore);\n";
                $in_create_server = 0;
                $buffer = "";
                next;
            }
            
            # Skip printing while we are collecting the malformed block
            next;
        }
        
        # Print normal lines
        print;
    ' "$file"
    
    echo "✅ Fixed: $(basename "$file")"
}

# Find ALL page.tsx files with createServerClient issues
echo "🔍 Scanning entire codebase for createServerClient syntax errors..."

# Find all page.tsx files that contain createServerClient
ALL_PAGE_FILES=$(find "$BASE_DIR" -name "page.tsx" -type f -exec grep -l "createServerClient" {} \;)

echo "📁 Found $(echo "$ALL_PAGE_FILES" | wc -l) files with createServerClient"

# Check each file for malformed syntax patterns
FILES_TO_FIX=""
for file in $ALL_PAGE_FILES; do
    if grep -q "process\.env\.NEXT_PUBLIC_SUPABASE_URL" "$file" 2>/dev/null || \
       grep -q "}){" "$file" 2>/dev/null || \
       grep -q ")cookieStore);" "$file" 2>/dev/null || \
       grep -q "get: (name: string) =>" "$file" 2>/dev/null; then
        FILES_TO_FIX="$FILES_TO_FIX$file\n"
    fi
done

if [ -z "$FILES_TO_FIX" ]; then
    echo "✅ No files found with createServerClient syntax issues"
else
    echo "🎯 Files requiring fixes:"
    echo -e "$FILES_TO_FIX"
    echo ""
    
    # Process each file
    echo -e "$FILES_TO_FIX" | while IFS= read -r file; do
        if [ -n "$file" ] && [ -f "$file" ]; then
            fix_server_client_globally "$file"
        fi
    done
fi

echo ""
echo "🎉 Ultimate build fix completed!"
echo "📝 All backup files created with .backup extension"
echo ""
echo "🧪 Testing build..."
