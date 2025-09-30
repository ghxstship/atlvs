#!/bin/bash

# GHXSTSHIP Comprehensive Spacing and Gradient Fix Script
# This script fixes horizontal spacing/padding issues and text gradient visibility problems

set -e

echo "🚀 Starting comprehensive spacing and gradient fixes for GHXSTSHIP..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Counter for changes
TOTAL_FILES=0
TOTAL_CHANGES=0

# Function to fix spacing in a file
fix_spacing() {
    local file=$1
    local changes=0
    
    # Create temporary file
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file"
    
    # Fix horizontal padding (px-N)
    sed -i '' 's/\bpx-1\b/px-xs/g' "$temp_file"
    sed -i '' 's/\bpx-2\b/px-xs/g' "$temp_file"
    sed -i '' 's/\bpx-3\b/px-sm/g' "$temp_file"
    sed -i '' 's/\bpx-4\b/px-md/g' "$temp_file"
    sed -i '' 's/\bpx-5\b/px-lg/g' "$temp_file"
    sed -i '' 's/\bpx-6\b/px-lg/g' "$temp_file"
    sed -i '' 's/\bpx-8\b/px-xl/g' "$temp_file"
    sed -i '' 's/\bpx-10\b/px-2xl/g' "$temp_file"
    sed -i '' 's/\bpx-12\b/px-3xl/g' "$temp_file"
    
    # Fix vertical padding (py-N)
    sed -i '' 's/\bpy-1\b/py-xs/g' "$temp_file"
    sed -i '' 's/\bpy-2\b/py-xs/g' "$temp_file"
    sed -i '' 's/\bpy-3\b/py-sm/g' "$temp_file"
    sed -i '' 's/\bpy-4\b/py-md/g' "$temp_file"
    sed -i '' 's/\bpy-5\b/py-lg/g' "$temp_file"
    sed -i '' 's/\bpy-6\b/py-lg/g' "$temp_file"
    sed -i '' 's/\bpy-8\b/py-xl/g' "$temp_file"
    sed -i '' 's/\bpy-10\b/py-2xl/g' "$temp_file"
    sed -i '' 's/\bpy-12\b/py-3xl/g' "$temp_file"
    
    # Fix all-sides padding (p-N)
    sed -i '' 's/\bp-1\b/p-xs/g' "$temp_file"
    sed -i '' 's/\bp-2\b/p-xs/g' "$temp_file"
    sed -i '' 's/\bp-3\b/p-sm/g' "$temp_file"
    sed -i '' 's/\bp-4\b/p-md/g' "$temp_file"
    sed -i '' 's/\bp-5\b/p-lg/g' "$temp_file"
    sed -i '' 's/\bp-6\b/p-lg/g' "$temp_file"
    sed -i '' 's/\bp-8\b/p-xl/g' "$temp_file"
    sed -i '' 's/\bp-10\b/p-2xl/g' "$temp_file"
    sed -i '' 's/\bp-12\b/p-3xl/g' "$temp_file"
    
    # Fix horizontal margins (mx-N)
    sed -i '' 's/\bmx-1\b/mx-xs/g' "$temp_file"
    sed -i '' 's/\bmx-2\b/mx-xs/g' "$temp_file"
    sed -i '' 's/\bmx-3\b/mx-sm/g' "$temp_file"
    sed -i '' 's/\bmx-4\b/mx-md/g' "$temp_file"
    sed -i '' 's/\bmx-5\b/mx-lg/g' "$temp_file"
    sed -i '' 's/\bmx-6\b/mx-lg/g' "$temp_file"
    sed -i '' 's/\bmx-8\b/mx-xl/g' "$temp_file"
    sed -i '' 's/\bmx-10\b/mx-2xl/g' "$temp_file"
    sed -i '' 's/\bmx-12\b/mx-3xl/g' "$temp_file"
    
    # Fix vertical margins (my-N)
    sed -i '' 's/\bmy-1\b/my-xs/g' "$temp_file"
    sed -i '' 's/\bmy-2\b/my-xs/g' "$temp_file"
    sed -i '' 's/\bmy-3\b/my-sm/g' "$temp_file"
    sed -i '' 's/\bmy-4\b/my-md/g' "$temp_file"
    sed -i '' 's/\bmy-5\b/my-lg/g' "$temp_file"
    sed -i '' 's/\bmy-6\b/my-lg/g' "$temp_file"
    sed -i '' 's/\bmy-8\b/my-xl/g' "$temp_file"
    sed -i '' 's/\bmy-10\b/my-2xl/g' "$temp_file"
    sed -i '' 's/\bmy-12\b/my-3xl/g' "$temp_file"
    
    # Fix all-sides margins (m-N)
    sed -i '' 's/\bm-1\b/m-xs/g' "$temp_file"
    sed -i '' 's/\bm-2\b/m-xs/g' "$temp_file"
    sed -i '' 's/\bm-3\b/m-sm/g' "$temp_file"
    sed -i '' 's/\bm-4\b/m-md/g' "$temp_file"
    sed -i '' 's/\bm-5\b/m-lg/g' "$temp_file"
    sed -i '' 's/\bm-6\b/m-lg/g' "$temp_file"
    sed -i '' 's/\bm-8\b/m-xl/g' "$temp_file"
    sed -i '' 's/\bm-10\b/m-2xl/g' "$temp_file"
    sed -i '' 's/\bm-12\b/m-3xl/g' "$temp_file"
    
    # Fix gaps (gap-N)
    sed -i '' 's/\bgap-1\b/gap-xs/g' "$temp_file"
    sed -i '' 's/\bgap-2\b/gap-xs/g' "$temp_file"
    sed -i '' 's/\bgap-3\b/gap-sm/g' "$temp_file"
    sed -i '' 's/\bgap-4\b/gap-md/g' "$temp_file"
    sed -i '' 's/\bgap-5\b/gap-lg/g' "$temp_file"
    sed -i '' 's/\bgap-6\b/gap-lg/g' "$temp_file"
    sed -i '' 's/\bgap-8\b/gap-xl/g' "$temp_file"
    sed -i '' 's/\bgap-10\b/gap-2xl/g' "$temp_file"
    sed -i '' 's/\bgap-12\b/gap-3xl/g' "$temp_file"
    
    # Fix space-x and space-y
    sed -i '' 's/\bspace-x-1\b/space-x-xs/g' "$temp_file"
    sed -i '' 's/\bspace-x-2\b/space-x-xs/g' "$temp_file"
    sed -i '' 's/\bspace-x-3\b/space-x-sm/g' "$temp_file"
    sed -i '' 's/\bspace-x-4\b/space-x-md/g' "$temp_file"
    sed -i '' 's/\bspace-x-5\b/space-x-lg/g' "$temp_file"
    sed -i '' 's/\bspace-x-6\b/space-x-lg/g' "$temp_file"
    sed -i '' 's/\bspace-x-8\b/space-x-xl/g' "$temp_file"
    
    sed -i '' 's/\bspace-y-1\b/space-y-xs/g' "$temp_file"
    sed -i '' 's/\bspace-y-2\b/space-y-xs/g' "$temp_file"
    sed -i '' 's/\bspace-y-3\b/space-y-sm/g' "$temp_file"
    sed -i '' 's/\bspace-y-4\b/space-y-md/g' "$temp_file"
    sed -i '' 's/\bspace-y-5\b/space-y-lg/g' "$temp_file"
    sed -i '' 's/\bspace-y-6\b/space-y-lg/g' "$temp_file"
    sed -i '' 's/\bspace-y-8\b/space-y-xl/g' "$temp_file"
    
    # Check if file changed
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        changes=1
    else
        rm "$temp_file"
    fi
    
    return $changes
}

# Function to fix text gradients
fix_gradients() {
    local file=$1
    local changes=0
    
    # Create temporary file
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file"
    
    # Fix gradient text classes - ensure proper Tailwind gradient syntax
    # Replace any broken gradient text implementations with working ones
    sed -i '' 's/bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent/text-gradient-primary/g' "$temp_file"
    sed -i '' 's/bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent/text-gradient-primary/g' "$temp_file"
    sed -i '' 's/bg-gradient-to-r from-success to-accent bg-clip-text text-transparent/text-gradient-success/g' "$temp_file"
    
    # Fix gradient backgrounds
    sed -i '' 's/bg-gradient-to-br from-background via-background to-muted\/20/bg-gradient-subtle/g' "$temp_file"
    sed -i '' 's/bg-gradient-to-b from-background to-muted/bg-gradient-subtle/g' "$temp_file"
    
    # Check if file changed
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        changes=1
    else
        rm "$temp_file"
    fi
    
    return $changes
}

# Process all TypeScript/JavaScript files
echo -e "${BLUE}Processing TypeScript and JavaScript files...${NC}"

find "$BASE_DIR" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" | while read -r file; do
    
    if fix_spacing "$file"; then
        echo -e "${GREEN}✓${NC} Fixed spacing in: ${file#$BASE_DIR/}"
        ((TOTAL_CHANGES++))
    fi
    
    if fix_gradients "$file"; then
        echo -e "${GREEN}✓${NC} Fixed gradients in: ${file#$BASE_DIR/}"
        ((TOTAL_CHANGES++))
    fi
    
    ((TOTAL_FILES++))
done

echo ""
echo -e "${GREEN}✅ Spacing and gradient fixes complete!${NC}"
echo -e "${BLUE}Files processed:${NC} $TOTAL_FILES"
echo -e "${BLUE}Files modified:${NC} $TOTAL_CHANGES"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the changes with: git diff"
echo "2. Test the application locally"
echo "3. Commit the changes: git add -A && git commit -m 'Fix horizontal spacing and text gradients'"
