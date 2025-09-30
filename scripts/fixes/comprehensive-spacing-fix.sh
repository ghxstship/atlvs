#!/bin/bash

# GHXSTSHIP Comprehensive Spacing Fix
# This script ensures all spacing is consistent across the application

set -e

echo "🚀 Starting comprehensive spacing audit and fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directories
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
COMPONENTS_DIR="$BASE_DIR/apps/web/app/_components"
APP_DIR="$BASE_DIR/apps/web/app"

# Counter for changes
TOTAL_FILES=0
TOTAL_CHANGES=0

# Function to fix spacing in a file
fix_spacing_comprehensive() {
    local file=$1
    local changes=0
    
    # Create temporary file
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file"
    
    # Fix container spacing
    sed -i '' 's/container mx-auto px-4/container mx-auto px-lg/g' "$temp_file"
    sed -i '' 's/container mx-auto px-6/container mx-auto px-xl/g' "$temp_file"
    sed -i '' 's/container mx-auto/container mx-auto px-lg/g' "$temp_file"
    
    # Fix section padding
    sed -i '' 's/py-20/py-2xl/g' "$temp_file"
    sed -i '' 's/py-16/py-xl/g' "$temp_file"
    sed -i '' 's/py-12/py-lg/g' "$temp_file"
    sed -i '' 's/py-8/py-md/g' "$temp_file"
    sed -i '' 's/py-4/py-sm/g' "$temp_file"
    
    # Fix margins
    sed -i '' 's/mb-16/mb-xl/g' "$temp_file"
    sed -i '' 's/mb-12/mb-lg/g' "$temp_file"
    sed -i '' 's/mb-8/mb-md/g' "$temp_file"
    sed -i '' 's/mb-6/mb-md/g' "$temp_file"
    sed -i '' 's/mb-4/mb-sm/g' "$temp_file"
    sed -i '' 's/mb-3/mb-sm/g' "$temp_file"
    sed -i '' 's/mb-2/mb-xs/g' "$temp_file"
    sed -i '' 's/mb-1/mb-xs/g' "$temp_file"
    
    sed -i '' 's/mt-12/mt-lg/g' "$temp_file"
    sed -i '' 's/mt-8/mt-md/g' "$temp_file"
    sed -i '' 's/mt-6/mt-md/g' "$temp_file"
    sed -i '' 's/mt-4/mt-sm/g' "$temp_file"
    sed -i '' 's/mt-2/mt-xs/g' "$temp_file"
    
    # Fix gaps - ensure proper semantic tokens
    sed -i '' 's/gap-12/gap-3xl/g' "$temp_file"
    sed -i '' 's/gap-10/gap-2xl/g' "$temp_file"
    sed -i '' 's/gap-8/gap-xl/g' "$temp_file"
    sed -i '' 's/gap-6/gap-lg/g' "$temp_file"
    sed -i '' 's/gap-4/gap-md/g' "$temp_file"
    sed -i '' 's/gap-3/gap-sm/g' "$temp_file"
    sed -i '' 's/gap-2/gap-xs/g' "$temp_file"
    sed -i '' 's/gap-1/gap-xs/g' "$temp_file"
    
    # Fix space utilities
    sed -i '' 's/space-x-8/space-x-xl/g' "$temp_file"
    sed -i '' 's/space-x-6/space-x-lg/g' "$temp_file"
    sed -i '' 's/space-x-4/space-x-md/g' "$temp_file"
    sed -i '' 's/space-x-3/space-x-sm/g' "$temp_file"
    sed -i '' 's/space-x-2/space-x-xs/g' "$temp_file"
    
    sed -i '' 's/space-y-8/space-y-xl/g' "$temp_file"
    sed -i '' 's/space-y-6/space-y-lg/g' "$temp_file"
    sed -i '' 's/space-y-4/space-y-md/g' "$temp_file"
    sed -i '' 's/space-y-3/space-y-sm/g' "$temp_file"
    sed -i '' 's/space-y-2/space-y-xs/g' "$temp_file"
    
    # Fix padding
    sed -i '' 's/\bp-12\b/p-3xl/g' "$temp_file"
    sed -i '' 's/\bp-10\b/p-2xl/g' "$temp_file"
    sed -i '' 's/\bp-8\b/p-xl/g' "$temp_file"
    sed -i '' 's/\bp-6\b/p-lg/g' "$temp_file"
    sed -i '' 's/\bp-5\b/p-lg/g' "$temp_file"
    sed -i '' 's/\bp-4\b/p-md/g' "$temp_file"
    sed -i '' 's/\bp-3\b/p-sm/g' "$temp_file"
    sed -i '' 's/\bp-2\b/p-xs/g' "$temp_file"
    sed -i '' 's/\bp-1\b/p-xs/g' "$temp_file"
    
    # Fix specific patterns
    sed -i '' 's/px-4 py-2/px-md py-xs/g' "$temp_file"
    sed -i '' 's/px-6 py-3/px-lg py-sm/g' "$temp_file"
    sed -i '' 's/px-8 py-4/px-xl py-md/g' "$temp_file"
    
    # Check if file changed
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        changes=1
    else
        rm "$temp_file"
    fi
    
    return $changes
}

# Process marketing components
echo -e "${BLUE}Processing marketing components...${NC}"
find "$COMPONENTS_DIR/marketing" -type f \( -name "*.tsx" -o -name "*.jsx" \) | while read -r file; do
    if fix_spacing_comprehensive "$file"; then
        echo -e "${GREEN}✓${NC} Fixed spacing in: ${file#$BASE_DIR/}"
        ((TOTAL_CHANGES++))
    fi
    ((TOTAL_FILES++))
done

# Process main app pages
echo -e "${BLUE}Processing app pages...${NC}"
find "$APP_DIR" -maxdepth 2 -type f \( -name "*.tsx" -o -name "*.jsx" \) | while read -r file; do
    if fix_spacing_comprehensive "$file"; then
        echo -e "${GREEN}✓${NC} Fixed spacing in: ${file#$BASE_DIR/}"
        ((TOTAL_CHANGES++))
    fi
    ((TOTAL_FILES++))
done

# Fix specific known issues
echo -e "${BLUE}Applying specific fixes...${NC}"

# Fix MarketingHeader navigation spacing
if [ -f "$COMPONENTS_DIR/marketing/MarketingHeader.tsx" ]; then
    sed -i '' 's/cluster-xl/cluster-lg/g' "$COMPONENTS_DIR/marketing/MarketingHeader.tsx"
    echo -e "${GREEN}✓${NC} Fixed navigation spacing in MarketingHeader"
fi

# Fix HeroSection spacing
if [ -f "$COMPONENTS_DIR/marketing/HeroSection.tsx" ]; then
    sed -i '' 's/gap-2xl/gap-xl/g' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    echo -e "${GREEN}✓${NC} Fixed hero section spacing"
fi

echo ""
echo -e "${GREEN}✅ Comprehensive spacing fix complete!${NC}"
echo -e "${BLUE}Files processed:${NC} $TOTAL_FILES"
echo -e "${BLUE}Files modified:${NC} $TOTAL_CHANGES"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart the development server: npm run dev"
echo "2. Clear browser cache"
echo "3. Review the changes visually"
echo "4. Commit: git add -A && git commit -m 'Fix comprehensive spacing issues'"
