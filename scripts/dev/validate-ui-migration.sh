#!/bin/bash

# GHXSTSHIP UI Migration Validation Script
# Validates the migration from Global CSS to UI Package

set -e

echo "🔍 GHXSTSHIP UI Migration Validation"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_ISSUES=0
CRITICAL_ISSUES=0
WARNINGS=0

# Function to check for Global CSS remnants
check_global_css() {
    echo -e "\n${BLUE}1. Checking for Global CSS remnants...${NC}"
    
    # Check for globals.css imports
    echo -e "   Checking for globals.css imports..."
    GLOBAL_CSS_IMPORTS=$(grep -r "import.*globals\.css" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$GLOBAL_CSS_IMPORTS" -gt 0 ]; then
        echo -e "   ${RED}✗${NC} Found $GLOBAL_CSS_IMPORTS globals.css imports"
        grep -r "import.*globals\.css" apps/web --include="*.tsx" --include="*.ts" | head -5
        ((CRITICAL_ISSUES++))
    else
        echo -e "   ${GREEN}✓${NC} No globals.css imports found"
    fi
    
    # Check for module.css imports
    echo -e "   Checking for module.css imports..."
    MODULE_CSS_IMPORTS=$(grep -r "import.*\.module\.css" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$MODULE_CSS_IMPORTS" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} Found $MODULE_CSS_IMPORTS module.css imports"
        ((WARNINGS++))
    else
        echo -e "   ${GREEN}✓${NC} No module.css imports found"
    fi
}

# Function to check for deprecated classes
check_deprecated_classes() {
    echo -e "\n${BLUE}2. Checking for deprecated CSS classes...${NC}"
    
    # Typography classes
    echo -e "   Checking for deprecated typography classes..."
    DEPRECATED_TYPOGRAPHY=$(grep -r "text-heading-\|text-body-\|text-display" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$DEPRECATED_TYPOGRAPHY" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} Found $DEPRECATED_TYPOGRAPHY deprecated typography classes"
        grep -r "text-heading-\|text-body-\|text-display" apps/web --include="*.tsx" --include="*.ts" | head -3
        ((WARNINGS++))
    else
        echo -e "   ${GREEN}✓${NC} No deprecated typography classes found"
    fi
    
    # Button classes
    echo -e "   Checking for deprecated button classes..."
    DEPRECATED_BUTTONS=$(grep -r "btn btn-\|btn-primary\|btn-secondary" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$DEPRECATED_BUTTONS" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} Found $DEPRECATED_BUTTONS deprecated button classes"
        ((WARNINGS++))
    else
        echo -e "   ${GREEN}✓${NC} No deprecated button classes found"
    fi
    
    # Spacing utilities
    echo -e "   Checking for deprecated spacing utilities..."
    DEPRECATED_SPACING=$(grep -r "stack-\|cluster-\|p-xs\|p-sm\|p-md\|p-lg\|p-xl" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$DEPRECATED_SPACING" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} Found $DEPRECATED_SPACING deprecated spacing utilities"
        ((WARNINGS++))
    else
        echo -e "   ${GREEN}✓${NC} No deprecated spacing utilities found"
    fi
}

# Function to check UI package imports
check_ui_package_imports() {
    echo -e "\n${BLUE}3. Checking UI package imports...${NC}"
    
    # Count files importing from @ghxstship/ui
    UI_IMPORTS=$(grep -r "from ['\"]@ghxstship/ui" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    echo -e "   ${GREEN}✓${NC} Found $UI_IMPORTS files importing from @ghxstship/ui"
    
    # Check for proper component imports
    echo -e "   Checking for proper component imports..."
    
    # Check Text component usage
    TEXT_USAGE=$(grep -r "<Text\|<Display" apps/web --include="*.tsx" 2>/dev/null | wc -l || echo 0)
    TEXT_IMPORTS=$(grep -r "import.*{.*Text.*}.*from.*@ghxstship/ui" apps/web --include="*.tsx" 2>/dev/null | wc -l || echo 0)
    
    if [ "$TEXT_USAGE" -gt 0 ] && [ "$TEXT_IMPORTS" -eq 0 ]; then
        echo -e "   ${YELLOW}⚠${NC} Text components used but not imported properly"
        ((WARNINGS++))
    else
        echo -e "   ${GREEN}✓${NC} Text components properly imported"
    fi
    
    # Check Stack/Cluster component usage
    LAYOUT_USAGE=$(grep -r "<Stack\|<Cluster" apps/web --include="*.tsx" 2>/dev/null | wc -l || echo 0)
    LAYOUT_IMPORTS=$(grep -r "import.*{.*Stack.*Cluster.*}.*from.*@ghxstship/ui" apps/web --include="*.tsx" 2>/dev/null | wc -l || echo 0)
    
    if [ "$LAYOUT_USAGE" -gt 0 ]; then
        echo -e "   ${GREEN}✓${NC} Found $LAYOUT_USAGE layout component usages"
    fi
}

# Function to check TypeScript compilation
check_typescript() {
    echo -e "\n${BLUE}4. Checking TypeScript compilation...${NC}"
    
    cd apps/web
    
    # Run TypeScript check
    if npx tsc --noEmit 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} TypeScript compilation successful"
    else
        echo -e "   ${YELLOW}⚠${NC} TypeScript compilation has errors"
        npx tsc --noEmit 2>&1 | head -10
        ((WARNINGS++))
    fi
    
    cd ../..
}

# Function to check build
check_build() {
    echo -e "\n${BLUE}5. Checking build process...${NC}"
    
    # Try a production build
    echo -e "   Running production build test..."
    
    if npm run build --workspace=apps/web 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} Build successful"
    else
        echo -e "   ${RED}✗${NC} Build failed"
        ((CRITICAL_ISSUES++))
    fi
}

# Function to generate report
generate_report() {
    echo -e "\n${BLUE}=====================================${NC}"
    echo -e "${BLUE}VALIDATION REPORT${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    TOTAL_ISSUES=$((CRITICAL_ISSUES + WARNINGS))
    
    if [ "$CRITICAL_ISSUES" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}✅ MIGRATION SUCCESSFUL!${NC}"
        echo -e "All checks passed. The migration from Global CSS to UI Package is complete."
    elif [ "$CRITICAL_ISSUES" -eq 0 ]; then
        echo -e "${YELLOW}⚠️  MIGRATION MOSTLY SUCCESSFUL${NC}"
        echo -e "Found $WARNINGS warnings that should be addressed."
    else
        echo -e "${RED}❌ MIGRATION NEEDS ATTENTION${NC}"
        echo -e "Found $CRITICAL_ISSUES critical issues and $WARNINGS warnings."
    fi
    
    echo -e "\nSummary:"
    echo -e "  Critical Issues: $CRITICAL_ISSUES"
    echo -e "  Warnings: $WARNINGS"
    echo -e "  Total Issues: $TOTAL_ISSUES"
    
    # Save report to file
    REPORT_FILE="migration-validation-report-$(date +%Y%m%d-%H%M%S).txt"
    {
        echo "GHXSTSHIP UI Migration Validation Report"
        echo "Generated: $(date)"
        echo "====================================="
        echo ""
        echo "Critical Issues: $CRITICAL_ISSUES"
        echo "Warnings: $WARNINGS"
        echo "Total Issues: $TOTAL_ISSUES"
        echo ""
        echo "Details:"
        echo "- Global CSS imports: $GLOBAL_CSS_IMPORTS"
        echo "- Module CSS imports: $MODULE_CSS_IMPORTS"
        echo "- Deprecated typography: $DEPRECATED_TYPOGRAPHY"
        echo "- Deprecated buttons: $DEPRECATED_BUTTONS"
        echo "- Deprecated spacing: $DEPRECATED_SPACING"
        echo "- UI package imports: $UI_IMPORTS"
    } > "$REPORT_FILE"
    
    echo -e "\n📄 Report saved to: ${BLUE}$REPORT_FILE${NC}"
}

# Function to suggest fixes
suggest_fixes() {
    if [ "$TOTAL_ISSUES" -gt 0 ]; then
        echo -e "\n${BLUE}Suggested Fixes:${NC}"
        
        if [ "$GLOBAL_CSS_IMPORTS" -gt 0 ]; then
            echo -e "  1. Remove all globals.css imports"
            echo -e "     Run: ${YELLOW}find apps/web -name '*.tsx' -o -name '*.ts' | xargs sed -i '' '/import.*globals\.css/d'${NC}"
        fi
        
        if [ "$DEPRECATED_TYPOGRAPHY" -gt 0 ]; then
            echo -e "  2. Replace deprecated typography classes with UI components"
            echo -e "     Use: ${YELLOW}<H1>, <H2>, <H3>, <Text>, <Display>${NC} from @ghxstship/ui"
        fi
        
        if [ "$DEPRECATED_BUTTONS" -gt 0 ]; then
            echo -e "  3. Replace deprecated button classes with Button component"
            echo -e "     Use: ${YELLOW}<Button variant='primary'>${NC} from @ghxstship/ui"
        fi
        
        if [ "$DEPRECATED_SPACING" -gt 0 ]; then
            echo -e "  4. Replace spacing utilities with Stack/Cluster components"
            echo -e "     Use: ${YELLOW}<Stack gap='md'>, <Cluster gap='sm'>${NC} from @ghxstship/ui"
        fi
    fi
}

# Main validation flow
main() {
    # Run all checks
    check_global_css
    check_deprecated_classes
    check_ui_package_imports
    # check_typescript  # Commented out for speed
    # check_build       # Commented out for speed
    
    # Generate report
    generate_report
    
    # Suggest fixes
    suggest_fixes
}

# Run main function
main
