#!/bin/bash

# GHXSTSHIP UI Legacy Audit and Cleanup Script
# Performs comprehensive surgical audit of UI system to eliminate all legacy and redundant elements

set -e

echo "================================================"
echo "GHXSTSHIP UI LEGACY AUDIT & CLEANUP"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
UI_DIR="packages/ui/src"
APP_DIR="apps/web/app"
BACKUP_DIR=".backup-ui-cleanup-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo -e "${BLUE}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$UI_DIR" "$BACKUP_DIR/ui-src"
cp -r "$APP_DIR" "$BACKUP_DIR/app"

echo ""
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"
echo ""

# ================================================
# PHASE 1: IDENTIFY DUPLICATE COMPONENTS
# ================================================
echo -e "${YELLOW}PHASE 1: Identifying Duplicate Components${NC}"
echo "----------------------------------------"

# Check for duplicate UnifiedDesignSystem files
echo "Checking for duplicate UnifiedDesignSystem files..."
UNIFIED_FILES=$(find "$UI_DIR" -name "UnifiedDesignSystem.tsx" -type f)
if [ $(echo "$UNIFIED_FILES" | wc -l) -gt 1 ]; then
    echo -e "${RED}✗ Found duplicate UnifiedDesignSystem files:${NC}"
    echo "$UNIFIED_FILES"
    
    # Remove the duplicate in components directory
    if [ -f "$UI_DIR/components/UnifiedDesignSystem.tsx" ]; then
        echo "  Removing duplicate: $UI_DIR/components/UnifiedDesignSystem.tsx"
        rm "$UI_DIR/components/UnifiedDesignSystem.tsx"
    fi
else
    echo -e "${GREEN}✓ No duplicate UnifiedDesignSystem files${NC}"
fi

# Check for duplicate component exports
echo ""
echo "Checking for duplicate component exports..."
DUPLICATE_EXPORTS=$(grep -r "export.*\(Button\|Input\|Card\|Badge\|Select\|Modal\|Drawer\|Sidebar\)" "$UI_DIR" --include="*.ts" --include="*.tsx" | \
    awk -F: '{print $1}' | sort | uniq -c | sort -rn | awk '$1 > 1 {print $2}')

if [ ! -z "$DUPLICATE_EXPORTS" ]; then
    echo -e "${RED}✗ Files with duplicate component exports:${NC}"
    echo "$DUPLICATE_EXPORTS"
else
    echo -e "${GREEN}✓ No duplicate component exports found${NC}"
fi

# ================================================
# PHASE 2: CHECK FOR CONFLICTING IMPORTS
# ================================================
echo ""
echo -e "${YELLOW}PHASE 2: Checking for Conflicting Imports${NC}"
echo "----------------------------------------"

# Check for multiple index files exporting the same components
echo "Analyzing index file exports..."
INDEX_FILES=$(find "$UI_DIR" -name "index.ts" -o -name "index.tsx")
CONFLICTING_EXPORTS=""

for file in $INDEX_FILES; do
    if grep -q "export.*from.*Button\|Input\|Card\|Badge" "$file" 2>/dev/null; then
        echo "  Found exports in: $file"
        CONFLICTING_EXPORTS="$CONFLICTING_EXPORTS$file\n"
    fi
done

if [ ! -z "$CONFLICTING_EXPORTS" ]; then
    echo -e "${YELLOW}⚠ Multiple index files export core components${NC}"
fi

# ================================================
# PHASE 3: IDENTIFY LEGACY PATTERNS
# ================================================
echo ""
echo -e "${YELLOW}PHASE 3: Identifying Legacy Patterns${NC}"
echo "----------------------------------------"

# Check for legacy CSS classes
echo "Checking for legacy CSS patterns..."
LEGACY_CSS=$(grep -r "text-heading-[0-9]\|p-[0-9]\|m-[0-9]\|gap-[0-9]" "$UI_DIR" --include="*.tsx" --include="*.ts" | wc -l)
if [ $LEGACY_CSS -gt 0 ]; then
    echo -e "${RED}✗ Found $LEGACY_CSS instances of legacy CSS patterns${NC}"
else
    echo -e "${GREEN}✓ No legacy CSS patterns found${NC}"
fi

# Check for hardcoded colors
echo "Checking for hardcoded colors..."
HARDCODED_COLORS=$(grep -r "#[0-9a-fA-F]\{6\}\|rgb\|rgba" "$UI_DIR" --include="*.tsx" --include="*.ts" --include="*.css" | \
    grep -v "var(--" | grep -v "// " | grep -v "/\*" | wc -l)
if [ $HARDCODED_COLORS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Found $HARDCODED_COLORS instances of hardcoded colors${NC}"
else
    echo -e "${GREEN}✓ No hardcoded colors found${NC}"
fi

# ================================================
# PHASE 4: ANALYZE IMPORT USAGE
# ================================================
echo ""
echo -e "${YELLOW}PHASE 4: Analyzing Import Usage${NC}"
echo "----------------------------------------"

# Check for inconsistent imports from @ghxstship/ui
echo "Analyzing @ghxstship/ui imports..."
IMPORT_PATTERNS=$(grep -r "from ['\"]@ghxstship/ui" "$APP_DIR" --include="*.tsx" --include="*.ts" | \
    sed "s/.*from ['\"]@ghxstship\/ui\([^'\"]*\).*/\1/" | sort | uniq)

echo "Import patterns found:"
if [ ! -z "$IMPORT_PATTERNS" ]; then
    echo "$IMPORT_PATTERNS" | while read pattern; do
        COUNT=$(grep -r "from ['\"]@ghxstship/ui$pattern" "$APP_DIR" --include="*.tsx" --include="*.ts" | wc -l)
        echo "  @ghxstship/ui$pattern: $COUNT occurrences"
    done
else
    echo "  None found"
fi

# ================================================
# PHASE 5: CLEANUP REDUNDANT FILES
# ================================================
echo ""
echo -e "${YELLOW}PHASE 5: Cleaning Up Redundant Files${NC}"
echo "----------------------------------------"

# Remove duplicate component files
COMPONENTS_TO_CHECK="Button Input Card Badge Select Modal Drawer Sidebar"
for component in $COMPONENTS_TO_CHECK; do
    FILES=$(find "$UI_DIR" -name "$component.tsx" -type f)
    FILE_COUNT=$(echo "$FILES" | wc -l)
    
    if [ $FILE_COUNT -gt 1 ]; then
        echo -e "${YELLOW}Found $FILE_COUNT files for $component:${NC}"
        echo "$FILES"
        # Keep only the one in components directory
        echo "$FILES" | while read file; do
            if [[ ! "$file" =~ "$UI_DIR/components/$component.tsx" ]]; then
                echo "  Would remove: $file"
                # Uncomment to actually remove: rm "$file"
            fi
        done
    fi
done

# ================================================
# PHASE 6: FIX EXPORT STRUCTURE
# ================================================
echo ""
echo -e "${YELLOW}PHASE 6: Fixing Export Structure${NC}"
echo "----------------------------------------"

# Consolidate exports to single index file
echo "Consolidating exports..."

# Create new consolidated index if needed
cat > "$UI_DIR/index.ts.new" << 'EOF'
/**
 * GHXSTSHIP UI Package - Enterprise Grade Design System
 * Single source of truth for all UI components
 */

// Core exports from unified system
export * from './index-unified';

// Additional components not in unified
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/Select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
export { Drawer } from './components/Drawer';
export { EmptyState } from './components/EmptyState';
export { Breadcrumbs } from './components/Breadcrumbs';
export { Avatar } from './components/Avatar';
export { EnhancedUniversalDrawer } from './components/EnhancedUniversalDrawer';

// Sidebar components
export * from './components/Sidebar';

// Navigation components
export * from './components/Navigation';

// DataViews components
export * from './components/DataViews';

// Monitoring components
export * from './components/monitoring';

// 3D components
export * from './components/3d';

// Architecture components
export * from './components/architecture';
EOF

echo -e "${GREEN}✓ Created consolidated index structure${NC}"

# ================================================
# PHASE 7: VALIDATE IMPORTS
# ================================================
echo ""
echo -e "${YELLOW}PHASE 7: Validating Imports${NC}"
echo "----------------------------------------"

# Check for circular dependencies
echo "Checking for circular dependencies..."
CIRCULAR_DEPS=$(find "$UI_DIR" -name "*.ts" -o -name "*.tsx" | while read file; do
    IMPORTS=$(grep "from ['\"]\./" "$file" 2>/dev/null | sed "s/.*from ['\"]\.\/\([^'\"]*\).*/\1/")
    for import in $IMPORTS; do
        IMPORT_FILE="$UI_DIR/$import"
        if [ -f "$IMPORT_FILE.ts" ] || [ -f "$IMPORT_FILE.tsx" ]; then
            if grep -q "from.*$(basename $file .tsx | sed 's/\.ts$//')" "$IMPORT_FILE"* 2>/dev/null; then
                echo "Circular: $file <-> $import"
            fi
        fi
    done
done)

if [ ! -z "$CIRCULAR_DEPS" ]; then
    echo -e "${RED}✗ Found circular dependencies:${NC}"
    echo "$CIRCULAR_DEPS"
else
    echo -e "${GREEN}✓ No circular dependencies found${NC}"
fi

# ================================================
# PHASE 8: REMOVE UNUSED EXPORTS
# ================================================
echo ""
echo -e "${YELLOW}PHASE 8: Identifying Unused Exports${NC}"
echo "----------------------------------------"

# Find exported components that are never imported
echo "Analyzing component usage..."
EXPORTED_COMPONENTS=$(grep -r "export.*\(class\|function\|const\|interface\|type\)" "$UI_DIR" --include="*.ts" --include="*.tsx" | \
    sed 's/.*export.*\(class\|function\|const\|interface\|type\) \([A-Za-z0-9_]*\).*/\2/' | sort | uniq)

UNUSED_EXPORTS=""
for component in $EXPORTED_COMPONENTS; do
    # Check if component is imported anywhere
    USAGE=$(grep -r "import.*$component\|from.*$component" "$APP_DIR" "$UI_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -v "export" | wc -l)
    
    if [ $USAGE -eq 0 ]; then
        UNUSED_EXPORTS="$UNUSED_EXPORTS$component\n"
    fi
done

if [ ! -z "$UNUSED_EXPORTS" ]; then
    echo -e "${YELLOW}⚠ Potentially unused exports (sample):${NC}"
    echo -e "$UNUSED_EXPORTS" | head -10
else
    echo -e "${GREEN}✓ All exports appear to be in use${NC}"
fi

# ================================================
# SUMMARY
# ================================================
echo ""
echo "================================================"
echo -e "${GREEN}AUDIT COMPLETE${NC}"
echo "================================================"
echo ""
echo "Summary of findings:"
echo "-------------------"
echo "1. Duplicate components: Check output above"
echo "2. Legacy CSS patterns: $LEGACY_CSS instances"
echo "3. Hardcoded colors: $HARDCODED_COLORS instances"
echo "4. Export structure: Consolidated"
echo ""
echo "Recommendations:"
echo "1. Remove duplicate UnifiedDesignSystem in components/"
echo "2. Use single index.ts for all exports"
echo "3. Replace legacy CSS with semantic tokens"
echo "4. Replace hardcoded colors with CSS variables"
echo "5. Remove unused component exports"
echo ""
echo -e "${BLUE}Backup saved to: $BACKUP_DIR${NC}"
echo ""
echo "To apply fixes, run:"
echo "  mv $UI_DIR/index.ts.new $UI_DIR/index.ts"
echo ""
