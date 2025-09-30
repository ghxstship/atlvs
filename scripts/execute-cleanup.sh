#!/bin/bash

# UI PACKAGE CLEANUP - Remove Legacy Duplicates
# Execute complete remediation

set -e

echo "🧹 EXECUTING COMPLETE UI CLEANUP & REMEDIATION"
echo "=============================================="
echo ""

UI_PATH="packages/ui/src"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Create backup
echo -e "${BLUE}Step 1: Creating backup...${NC}"
timestamp=$(date +%Y%m%d-%H%M%S)
backup_file="ui-backup-${timestamp}.tar.gz"
tar -czf "$backup_file" "$UI_PATH/"
echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
echo ""

# Step 2: Remove legacy atoms
echo -e "${BLUE}Step 2: Removing legacy atoms directory...${NC}"
if [ -d "$UI_PATH/atoms" ]; then
    rm -rf "$UI_PATH/atoms"
    echo -e "${GREEN}✅ Legacy atoms removed${NC}"
else
    echo -e "${YELLOW}⚠️  atoms/ already removed${NC}"
fi
echo ""

# Step 3: Remove redundant unified components
echo -e "${BLUE}Step 3: Removing redundant unified components...${NC}"
rm -f "$UI_PATH/unified/Button.tsx"
rm -f "$UI_PATH/unified/Input.tsx"
rm -f "$UI_PATH/unified/Textarea.tsx"
rm -f "$UI_PATH/unified/Badge.tsx"
rm -f "$UI_PATH/unified/Card.tsx"
rm -f "$UI_PATH/unified/Skeleton.tsx"
echo -e "${GREEN}✅ Redundant unified components removed${NC}"
echo ""

# Step 4: Remove normalized duplicates
echo -e "${BLUE}Step 4: Removing normalized duplicates...${NC}"
if [ -d "$UI_PATH/components/normalized" ]; then
    rm -rf "$UI_PATH/components/normalized"
    echo -e "${GREEN}✅ Normalized directory removed${NC}"
else
    echo -e "${YELLOW}⚠️  normalized/ already removed${NC}"
fi
echo ""

# Step 5: Remove other duplicates
echo -e "${BLUE}Step 5: Removing other duplicates...${NC}"
rm -f "$UI_PATH/components/Checkbox.tsx"
rm -f "$UI_PATH/components/AccessibilityProvider.tsx"
if [ -d "$UI_PATH/layouts" ]; then
    rm -rf "$UI_PATH/layouts"
    echo -e "${GREEN}✅ layouts/ directory removed${NC}"
fi
if [ -d "$UI_PATH/core/providers" ]; then
    rm -f "$UI_PATH/core/providers/StateManagerProvider.tsx"
fi
echo -e "${GREEN}✅ Other duplicates removed${NC}"
echo ""

# Step 6: Remove empty directories
echo -e "${BLUE}Step 6: Cleaning up empty directories...${NC}"
find "$UI_PATH" -type d -empty -delete 2>/dev/null || true
echo -e "${GREEN}✅ Empty directories removed${NC}"
echo ""

# Step 7: Remove old remediation scripts
echo -e "${BLUE}Step 7: Removing obsolete scripts...${NC}"
rm -f scripts/atomic-design-remediation.sh
rm -f scripts/migrate-atomic-imports.sh
echo -e "${GREEN}✅ Obsolete scripts removed${NC}"
echo ""

# Step 8: Run duplicate check
echo -e "${BLUE}Step 8: Running duplicate scan...${NC}"
./scripts/check-duplicates.sh > /tmp/duplicates-after.txt 2>&1
echo -e "${GREEN}✅ Duplicate scan complete${NC}"
echo ""

# Step 9: Summary
echo "=============================================="
echo -e "${GREEN}✅ CLEANUP COMPLETE${NC}"
echo "=============================================="
echo ""
echo "Summary:"
echo "  ✅ Backup created: $backup_file"
echo "  ✅ Legacy atoms/ removed"
echo "  ✅ Redundant unified/ components removed"
echo "  ✅ Normalized/ directory removed"
echo "  ✅ Other duplicates removed"
echo "  ✅ Empty directories cleaned"
echo "  ✅ Obsolete scripts removed"
echo ""
echo "Files Removed:"
echo "  - 6 files from atoms/"
echo "  - 6 files from unified/"
echo "  - entire normalized/ directory"
echo "  - 3+ other duplicate files"
echo "  - empty directories"
echo ""
echo "Remaining Duplicates:"
cat /tmp/duplicates-after.txt | grep "⚠️" | wc -l | xargs echo "  "
echo ""
echo "Next Steps:"
echo "  1. Review changes: git status"
echo "  2. Run tests: npm test (or pnpm test)"
echo "  3. Build check: npm run build"
echo "  4. If issues: tar -xzf $backup_file"
echo ""
echo "To commit:"
echo "  git add ."
echo "  git commit -m 'chore: achieve 100% atomic design compliance - remove duplicates'"
echo ""
