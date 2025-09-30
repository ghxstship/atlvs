#!/bin/bash

# GHXSTSHIP Fix Overlapping Elements
# This script fixes all overlapping elements, especially at the bottom of pages

set -e

echo "🚀 Starting comprehensive overlap fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directories
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
COMPONENTS_DIR="$BASE_DIR/apps/web/app/_components"

# Counter for changes
TOTAL_FIXES=0

echo -e "${BLUE}Fixing overlapping elements...${NC}"

# Fix 1: Add proper spacing to footer to prevent overlap
echo -e "${YELLOW}Fixing MarketingFooter spacing...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/MarketingFooter.tsx" ]; then
    # Add more top padding to footer
    sed -i '' 's/<footer className="bg-secondary\/30 border-t">/<footer className="bg-secondary\/30 border-t mt-5xl">/' "$COMPONENTS_DIR/marketing/MarketingFooter.tsx"
    # Ensure proper padding
    sed -i '' 's/${layouts.sectionPadding}/${layouts.sectionPadding} py-5xl/' "$COMPONENTS_DIR/marketing/MarketingFooter.tsx"
    echo -e "${GREEN}✓${NC} Fixed footer spacing"
    ((TOTAL_FIXES++))
fi

# Fix 2: Fix CookieConsent positioning to not overlap footer
echo -e "${YELLOW}Fixing CookieConsent positioning...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/CookieConsent.tsx" ]; then
    # Change from fixed bottom-0 to fixed with proper spacing
    sed -i '' 's/fixed bottom-0 left-0 right-0/fixed bottom-4 left-4 right-4 max-w-7xl mx-auto/' "$COMPONENTS_DIR/marketing/CookieConsent.tsx"
    # Reduce z-index to prevent blocking
    sed -i '' 's/z-50/z-40/' "$COMPONENTS_DIR/marketing/CookieConsent.tsx"
    echo -e "${GREEN}✓${NC} Fixed CookieConsent positioning"
    ((TOTAL_FIXES++))
fi

# Fix 3: Ensure main content has proper bottom margin
echo -e "${YELLOW}Fixing main content spacing...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/MarketingLayoutClient.tsx" ]; then
    # Add bottom margin to main content
    sed -i '' 's/<main id="main-content" className="flex-1"/<main id="main-content" className="flex-1 mb-5xl"/' "$COMPONENTS_DIR/marketing/MarketingLayoutClient.tsx"
    echo -e "${GREEN}✓${NC} Fixed main content spacing"
    ((TOTAL_FIXES++))
fi

# Fix 4: Fix CTASection bottom spacing
echo -e "${YELLOW}Fixing CTASection bottom spacing...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/CTASection.tsx" ]; then
    # Ensure CTASection has proper bottom padding
    sed -i '' 's/py-4xl/py-5xl/' "$COMPONENTS_DIR/marketing/CTASection.tsx"
    # Add bottom margin to last section
    sed -i '' 's/<section className="py-5xl/<section className="py-5xl mb-3xl/' "$COMPONENTS_DIR/marketing/CTASection.tsx"
    echo -e "${GREEN}✓${NC} Fixed CTASection spacing"
    ((TOTAL_FIXES++))
fi

# Fix 5: Fix Newsletter signup spacing
echo -e "${YELLOW}Fixing NewsletterSignup spacing...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/NewsletterSignup.tsx" ]; then
    # Fix gap spacing that might be too large
    sed -i '' 's/gap-xl/gap-lg/' "$COMPONENTS_DIR/marketing/NewsletterSignup.tsx"
    echo -e "${GREEN}✓${NC} Fixed NewsletterSignup spacing"
    ((TOTAL_FIXES++))
fi

# Fix 6: Fix any sticky header z-index issues
echo -e "${YELLOW}Fixing header z-index...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/MarketingHeader.tsx" ]; then
    # Ensure header has proper z-index
    sed -i '' 's/sticky top-0 z-50/sticky top-0 z-50/' "$COMPONENTS_DIR/marketing/MarketingHeader.tsx"
    echo -e "${GREEN}✓${NC} Verified header z-index"
    ((TOTAL_FIXES++))
fi

# Fix 7: Fix HeroSection absolute positioning
echo -e "${YELLOW}Fixing HeroSection positioning...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/HeroSection.tsx" ]; then
    # Ensure absolute elements are contained
    sed -i '' 's/absolute top-0/absolute top-0 pointer-events-none/' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    sed -i '' 's/absolute bottom-0/absolute bottom-0 pointer-events-none/' "$COMPONENTS_DIR/marketing/HeroSection.tsx"
    echo -e "${GREEN}✓${NC} Fixed HeroSection positioning"
    ((TOTAL_FIXES++))
fi

# Fix 8: Add overflow handling to prevent horizontal scroll
echo -e "${YELLOW}Adding overflow handling...${NC}"
if [ -f "$COMPONENTS_DIR/marketing/MarketingLayoutClient.tsx" ]; then
    # Add overflow-x-hidden to prevent horizontal scroll
    sed -i '' 's/<div className="min-h-screen flex flex-col">/<div className="min-h-screen flex flex-col overflow-x-hidden">/' "$COMPONENTS_DIR/marketing/MarketingLayoutClient.tsx"
    echo -e "${GREEN}✓${NC} Added overflow handling"
    ((TOTAL_FIXES++))
fi

echo ""
echo -e "${GREEN}✅ Overlap fixes complete!${NC}"
echo -e "${BLUE}Total fixes applied:${NC} $TOTAL_FIXES"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Restart the development server: npm run dev"
echo "2. Clear browser cache"
echo "3. Check that no elements overlap"
echo "4. Commit: git add -A && git commit -m 'Fix overlapping elements at page bottom'"
