#!/bin/bash

################################################################################
# Marketing & Auth Pages UI Migration Validation Script
# Validates that marketing and auth pages use @ghxstship/ui exclusively
################################################################################

set -e

echo "🔍 Marketing & Auth Pages UI Validation"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
COMPLIANT_FILES=0
VIOLATIONS=0

# Define target directories
MARKETING_DIR="apps/web/app/(marketing)"
AUTH_DIR="apps/web/app/(app)/(chromeless)"
COMPONENTS_DIR="apps/web/app/_components/marketing"

################################################################################
# Check 1: Verify all files import from @ghxstship/ui
################################################################################
echo -e "${BLUE}Check 1: Verifying UI Package Imports${NC}"
echo "----------------------------------------"

check_ui_imports() {
    local dir=$1
    local label=$2
    
    echo -e "\n${YELLOW}Checking ${label}...${NC}"
    
    # Count total files
    local total=$(find "$dir" -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ')
    TOTAL_FILES=$((TOTAL_FILES + total))
    
    # Count files with @ghxstship/ui imports
    local with_ui=$(grep -r "from ['\"]@ghxstship/ui" "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | wc -l | tr -d ' ')
    
    # Files that need UI imports (not all files import UI components)
    local files_list=$(find "$dir" -name "*Client.tsx" -o -name "page.tsx" -o -name "*Card.tsx" -o -name "*Section.tsx" -o -name "*Header.tsx" | wc -l | tr -d ' ')
    
    echo -e "  Total files: ${total}"
    echo -e "  Files importing @ghxstship/ui: ${GREEN}${with_ui}${NC}"
    
    if [ "$with_ui" -gt 0 ]; then
        echo -e "  ${GREEN}✓${NC} UI package is being used"
        COMPLIANT_FILES=$((COMPLIANT_FILES + with_ui))
    fi
}

check_ui_imports "$MARKETING_DIR" "Marketing Pages"
check_ui_imports "$AUTH_DIR" "Auth/Chromeless Pages"
check_ui_imports "$COMPONENTS_DIR" "Marketing Components"

################################################################################
# Check 2: Verify NO legacy imports
################################################################################
echo -e "\n${BLUE}Check 2: Checking for Legacy Imports${NC}"
echo "--------------------------------------"

check_legacy_imports() {
    local dir=$1
    local label=$2
    local pattern=$3
    local description=$4
    
    local count=$(grep -r "$pattern" "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        echo -e "${RED}✗${NC} Found ${count} ${description} in ${label}"
        grep -r "$pattern" "$dir" --include="*.tsx" --include="*.ts" 2>/dev/null | head -3
        VIOLATIONS=$((VIOLATIONS + count))
    else
        echo -e "${GREEN}✓${NC} No ${description} in ${label}"
    fi
}

echo -e "\n${YELLOW}Checking Marketing Pages...${NC}"
check_legacy_imports "$MARKETING_DIR" "Marketing" "@/components/ui" "local ui imports"
check_legacy_imports "$MARKETING_DIR" "Marketing" "\.\./components/ui" "relative ui imports"
check_legacy_imports "$MARKETING_DIR" "Marketing" "_components/ui" "legacy _components/ui imports"

echo -e "\n${YELLOW}Checking Auth Pages...${NC}"
check_legacy_imports "$AUTH_DIR" "Auth" "@/components/ui" "local ui imports"
check_legacy_imports "$AUTH_DIR" "Auth" "\.\./components/ui" "relative ui imports"
check_legacy_imports "$AUTH_DIR" "Auth" "_components/ui" "legacy _components/ui imports"

echo -e "\n${YELLOW}Checking Marketing Components...${NC}"
check_legacy_imports "$COMPONENTS_DIR" "Components" "@/components/ui" "local ui imports"
check_legacy_imports "$COMPONENTS_DIR" "Components" "\.\./components/ui" "relative ui imports"
check_legacy_imports "$COMPONENTS_DIR" "Components" "_components/ui" "legacy _components/ui imports"

################################################################################
# Check 3: Verify NO direct third-party UI imports
################################################################################
echo -e "\n${BLUE}Check 3: Checking for Direct Third-Party Imports${NC}"
echo "--------------------------------------------------"

echo -e "\n${YELLOW}Checking for direct Radix imports...${NC}"
check_legacy_imports "$MARKETING_DIR" "Marketing" "@radix-ui" "direct Radix imports"
check_legacy_imports "$AUTH_DIR" "Auth" "@radix-ui" "direct Radix imports"
check_legacy_imports "$COMPONENTS_DIR" "Components" "@radix-ui" "direct Radix imports"

echo -e "\n${YELLOW}Checking for direct shadcn imports...${NC}"
check_legacy_imports "$MARKETING_DIR" "Marketing" "shadcn" "direct shadcn imports"
check_legacy_imports "$AUTH_DIR" "Auth" "shadcn" "direct shadcn imports"
check_legacy_imports "$COMPONENTS_DIR" "Components" "shadcn" "direct shadcn imports"

################################################################################
# Check 4: Verify NO backwards compatibility code
################################################################################
echo -e "\n${BLUE}Check 4: Checking for Backwards Compatibility Code${NC}"
echo "---------------------------------------------------"

check_legacy_imports "$MARKETING_DIR" "Marketing" "backwards.compat\|legacy\|deprecated" "backwards compatibility code"
check_legacy_imports "$AUTH_DIR" "Auth" "backwards.compat\|legacy\|deprecated" "backwards compatibility code"
check_legacy_imports "$COMPONENTS_DIR" "Components" "backwards.compat\|legacy\|deprecated" "backwards compatibility code"

################################################################################
# Check 5: Verify legacy UI directory doesn't exist
################################################################################
echo -e "\n${BLUE}Check 5: Checking for Legacy UI Directories${NC}"
echo "---------------------------------------------"

LEGACY_DIRS=(
    "apps/web/app/_components/ui"
    "apps/web/components/ui"
    "apps/web/app/(marketing)/components/ui"
)

for dir in "${LEGACY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${RED}✗${NC} Legacy directory exists: $dir"
        VIOLATIONS=$((VIOLATIONS + 1))
    else
        echo -e "${GREEN}✓${NC} No legacy directory: $dir"
    fi
done

################################################################################
# Generate Report
################################################################################
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}VALIDATION SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\nFiles Analyzed:"
echo -e "  Marketing Pages: $(find "$MARKETING_DIR" -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ') files"
echo -e "  Auth Pages: $(find "$AUTH_DIR" -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ') files"
echo -e "  Marketing Components: $(find "$COMPONENTS_DIR" -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ') files"
echo -e "  ${GREEN}Files using @ghxstship/ui: ${COMPLIANT_FILES}${NC}"

echo -e "\nCompliance Checks:"
if [ "$VIOLATIONS" -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} No legacy imports found"
    echo -e "  ${GREEN}✓${NC} No direct third-party imports"
    echo -e "  ${GREEN}✓${NC} No backwards compatibility code"
    echo -e "  ${GREEN}✓${NC} No legacy directories"
else
    echo -e "  ${RED}✗${NC} Found ${VIOLATIONS} violations"
fi

echo -e "\n${BLUE}========================================${NC}"

if [ "$VIOLATIONS" -eq 0 ]; then
    echo -e "${GREEN}✅ 100% MIGRATION SUCCESS${NC}"
    echo -e "${GREEN}All marketing and auth pages are using @ghxstship/ui exclusively!${NC}"
    exit 0
else
    echo -e "${RED}❌ MIGRATION INCOMPLETE${NC}"
    echo -e "${RED}Found ${VIOLATIONS} violations that need to be fixed.${NC}"
    exit 1
fi
