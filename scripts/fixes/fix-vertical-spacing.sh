#!/bin/bash

# GHXSTSHIP Comprehensive Vertical Spacing Fix
# This script ensures all vertical spacing is consistent and properly sized

set -e

echo "🚀 Starting comprehensive vertical spacing audit and fix..."

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

# Function to fix vertical spacing in a file
fix_vertical_spacing() {
    local file=$1
    local changes=0
    
    # Create temporary file
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file"
    
    # Fix section vertical padding - increase for better breathing room
    sed -i '' 's/\bpy-xl\b/py-3xl/g' "$temp_file"
    sed -i '' 's/\bpy-2xl\b/py-3xl/g' "$temp_file"
    sed -i '' 's/\bpt-xl\b/pt-3xl/g' "$temp_file"
    sed -i '' 's/\bpb-xl\b/pb-3xl/g' "$temp_file"
    
    # Fix heading margins - ensure proper spacing
    sed -i '' 's/\bmb-xs\b/mb-sm/g' "$temp_file"
    sed -i '' 's/\bmb-sm\b/mb-md/g' "$temp_file"
    sed -i '' 's/\bmb-md\b/mb-lg/g' "$temp_file"
    sed -i '' 's/\bmb-lg\b/mb-xl/g' "$temp_file"
    sed -i '' 's/\bmb-xl\b/mb-2xl/g' "$temp_file"
    
    # Fix paragraph and content spacing
    sed -i '' 's/\bmt-xs\b/mt-sm/g' "$temp_file"
    sed -i '' 's/\bmt-sm\b/mt-md/g' "$temp_file"
    sed -i '' 's/\bmt-md\b/mt-lg/g' "$temp_file"
    sed -i '' 's/\bmt-lg\b/mt-xl/g' "$temp_file"
    
    # Fix stack utilities for better vertical rhythm
    sed -i '' 's/stack-xs/stack-sm/g' "$temp_file"
    sed -i '' 's/stack-sm/stack-md/g' "$temp_file"
    sed -i '' 's/stack-md/stack-lg/g' "$temp_file"
    sed -i '' 's/stack-lg/stack-xl/g' "$temp_file"
    
    # Fix specific patterns for better spacing
    sed -i '' 's/py-sm rounded/py-md rounded/g' "$temp_file"
    sed -i '' 's/py-xs rounded/py-sm rounded/g' "$temp_file"
    
    # Fix card padding for better internal spacing
    sed -i '' 's/\bp-md\b/p-lg/g' "$temp_file"
    sed -i '' 's/\bp-lg\b/p-xl/g' "$temp_file"
    sed -i '' 's/\bp-xl\b/p-2xl/g' "$temp_file"
    
    # Fix vertical gaps in grids and flex
    sed -i '' 's/gap-sm/gap-md/g' "$temp_file"
    sed -i '' 's/gap-md/gap-lg/g' "$temp_file"
    sed -i '' 's/gap-lg/gap-xl/g' "$temp_file"
    
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
echo -e "${BLUE}Processing marketing components for vertical spacing...${NC}"
find "$COMPONENTS_DIR/marketing" -type f \( -name "*.tsx" -o -name "*.jsx" \) | while read -r file; do
    if fix_vertical_spacing "$file"; then
        echo -e "${GREEN}✓${NC} Fixed vertical spacing in: ${file#$BASE_DIR/}"
        ((TOTAL_CHANGES++))
    fi
    ((TOTAL_FILES++))
done

# Fix specific components that need special attention
echo -e "${BLUE}Applying targeted vertical spacing fixes...${NC}"

# Fix CTASection - needs more breathing room
if [ -f "$COMPONENTS_DIR/marketing/CTASection.tsx" ]; then
    sed -i '' 's/py-3xl/py-4xl/g' "$COMPONENTS_DIR/marketing/CTASection.tsx"
    sed -i '' 's/mb-2xl/mb-3xl/g' "$COMPONENTS_DIR/marketing/CTASection.tsx"
    echo -e "${GREEN}✓${NC} Enhanced vertical spacing in CTASection"
fi

# Fix HeroSection - needs proper vertical rhythm
if [ -f "$COMPONENTS_DIR/marketing/HeroSection.tsx" ]; then
    sed -i '' 's/stack-xl/stack-2xl/g' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    sed -i '' 's/py-32/py-3xl/g' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    sed -i '' 's/pt-8/pt-xl/g' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    echo -e "${GREEN}✓${NC} Enhanced vertical spacing in HeroSection"
fi

# Fix ProductHighlights - better card spacing
if [ -f "$COMPONENTS_DIR/marketing/ProductHighlights.tsx" ]; then
    sed -i '' 's/gap-xl/gap-2xl/g' "$COMPONENTS_DIR/marketing/ProductHighlights.tsx"
    echo -e "${GREEN}✓${NC} Enhanced vertical spacing in ProductHighlights"
fi

# Fix FeatureGrid - better grid spacing
if [ -f "$COMPONENTS_DIR/marketing/FeatureGrid.tsx" ]; then
    sed -i '' 's/gap-xl/gap-2xl/g' "$COMPONENTS_DIR/marketing/FeatureGrid.tsx"
    echo -e "${GREEN}✓${NC} Enhanced vertical spacing in FeatureGrid"
fi

echo ""
echo -e "${GREEN}✅ Vertical spacing fix complete!${NC}"
echo -e "${BLUE}Files processed:${NC} $TOTAL_FILES"
echo -e "${BLUE}Files modified:${NC} $TOTAL_CHANGES"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart the development server: npm run dev"
echo "2. Clear browser cache"
echo "3. Review the vertical spacing visually"
echo "4. Commit: git add -A && git commit -m 'Fix vertical spacing for better visual hierarchy'"
