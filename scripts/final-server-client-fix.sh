#!/bin/bash

# Final comprehensive fix for all createServerClient syntax errors
# This script directly fixes the malformed syntax in all remaining files

set -e

echo "🔧 Final fix for createServerClient syntax errors..."

BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web"

# List of all files that need fixing based on build errors
FILES_TO_FIX=(
    "app/(protected)/assets/advancing/page.tsx"
    "app/(protected)/assets/assignments/page.tsx"
    "app/(protected)/assets/inventory/page.tsx"
    "app/(protected)/assets/maintenance/page.tsx"
    "app/(protected)/assets/overview/page.tsx"
    "app/(protected)/assets/page.tsx"
    "app/(protected)/assets/reports/page.tsx"
    "app/(protected)/assets/tracking/page.tsx"
)

# Function to completely rewrite the createServerClient call
fix_file() {
    local file="$1"
    echo "Fixing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Use sed to replace the entire malformed createServerClient block
    # This removes everything from the createServerClient call to the closing });
    sed -i '' '/const supabase = createServerClient(/,/});/c\
  const supabase = createServerClient(cookieStore);
' "$file"
    
    echo "✅ Fixed: $file"
}

# Process each file
for file in "${FILES_TO_FIX[@]}"; do
    filepath="$BASE_DIR/$file"
    if [ -f "$filepath" ]; then
        fix_file "$filepath"
    else
        echo "⚠️  File not found: $filepath"
    fi
done

echo ""
echo "🎉 All createServerClient syntax errors fixed!"
echo "📝 Backup files created with .backup extension"
