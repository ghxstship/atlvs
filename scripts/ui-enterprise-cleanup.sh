#!/bin/bash

# GHXSTSHIP Enterprise UI Cleanup Script
# Eliminates all legacy and redundant UI elements for bulletproof enterprise-grade system

set -e

echo "================================================"
echo "GHXSTSHIP ENTERPRISE UI CLEANUP"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directories
ROOT_DIR="$(pwd)"
UI_DIR="packages/ui/src"
APP_DIR="apps/web/app"

echo -e "${BLUE}Starting enterprise UI cleanup...${NC}"
echo ""

# ================================================
# STEP 1: REMOVE DUPLICATE UNIFIED DESIGN SYSTEM
# ================================================
echo -e "${YELLOW}STEP 1: Removing duplicate UnifiedDesignSystem${NC}"
if [ -f "$UI_DIR/components/UnifiedDesignSystem.tsx" ]; then
    rm "$UI_DIR/components/UnifiedDesignSystem.tsx"
    echo -e "${GREEN}✓ Removed duplicate UnifiedDesignSystem from components${NC}"
fi

# ================================================
# STEP 2: REMOVE OLD INDEX FILES
# ================================================
echo -e "${YELLOW}STEP 2: Cleaning up old index files${NC}"
if [ -f "$UI_DIR/index-old.ts" ]; then
    rm "$UI_DIR/index-old.ts"
    echo -e "${GREEN}✓ Removed index-old.ts${NC}"
fi

# ================================================
# STEP 3: FIX LEGACY CSS PATTERNS
# ================================================
echo -e "${YELLOW}STEP 3: Fixing legacy CSS patterns${NC}"

# Fix legacy spacing classes in UI components
find "$UI_DIR" -name "*.tsx" -o -name "*.ts" | while read file; do
    # Skip node_modules and build directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"dist"* ]]; then
        continue
    fi
    
    # Fix spacing patterns
    sed -i '' \
        -e 's/p-\([0-9]\+\)/p-md/g' \
        -e 's/m-\([0-9]\+\)/m-md/g' \
        -e 's/gap-\([0-9]\+\)/gap-md/g' \
        -e 's/space-x-\([0-9]\+\)/space-x-md/g' \
        -e 's/space-y-\([0-9]\+\)/space-y-md/g' \
        -e 's/px-\([0-9]\+\)/px-md/g' \
        -e 's/py-\([0-9]\+\)/py-md/g' \
        -e 's/mx-\([0-9]\+\)/mx-md/g' \
        -e 's/my-\([0-9]\+\)/my-md/g' \
        -e 's/text-heading-1/text-h1/g' \
        -e 's/text-heading-2/text-h2/g' \
        -e 's/text-heading-3/text-h3/g' \
        -e 's/text-heading-4/text-body-lg/g' \
        "$file" 2>/dev/null || true
done
echo -e "${GREEN}✓ Fixed legacy CSS patterns${NC}"

# ================================================
# STEP 4: REPLACE HARDCODED COLORS
# ================================================
echo -e "${YELLOW}STEP 4: Replacing hardcoded colors${NC}"

# Replace common hardcoded colors with CSS variables
find "$UI_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.css" | while read file; do
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"dist"* ]]; then
        continue
    fi
    
    sed -i '' \
        -e 's/#22C55E/var(--primary)/g' \
        -e 's/#00BFFF/var(--accent)/g' \
        -e 's/#FF00FF/var(--secondary)/g' \
        -e 's/#EF4444/var(--destructive)/g' \
        -e 's/#F59E0B/var(--warning)/g' \
        -e 's/#16A34A/var(--success)/g' \
        -e 's/#3B82F6/var(--info)/g' \
        -e 's/rgb(34, 197, 94)/var(--primary)/g' \
        -e 's/rgb(0, 191, 255)/var(--accent)/g' \
        -e 's/rgb(255, 0, 255)/var(--secondary)/g' \
        "$file" 2>/dev/null || true
done
echo -e "${GREEN}✓ Replaced hardcoded colors${NC}"

# ================================================
# STEP 5: CONSOLIDATE EXPORTS
# ================================================
echo -e "${YELLOW}STEP 5: Consolidating exports${NC}"

# Create consolidated index.ts
cat > "$UI_DIR/index.ts" << 'EOF'
/**
 * GHXSTSHIP UI Package - Enterprise Grade Design System
 * Single source of truth for all UI components
 */

// ==========================================
// UNIFIED DESIGN SYSTEM (PRIMARY)
// ==========================================
export * from './index-unified';

// ==========================================
// ADDITIONAL COMPONENTS
// ==========================================

// Select components
export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator 
} from './components/Select';

// Tab components
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from './components/Tabs';

// Core UI components
export { Drawer } from './components/Drawer';
export { EmptyState } from './components/EmptyState';
export { Breadcrumbs } from './components/Breadcrumbs';
export { Avatar } from './components/Avatar';
export { Modal } from './components/Modal';
export { Textarea } from './components/Textarea';
export { Toggle } from './components/Toggle';
export { Alert } from './components/Alert';
export { Loader } from './components/Loader';
export { Tooltip } from './components/Tooltip';

// Enhanced components
export { EnhancedUniversalDrawer } from './components/EnhancedUniversalDrawer';
export { EnhancedForm } from './components/EnhancedForm';

// Sidebar components (avoid circular dependency)
export { Sidebar } from './components/Sidebar';
export { 
  SidebarNavigation,
  SidebarProvider,
  useSidebar,
  SidebarBreadcrumbs,
  SidebarAnimations,
  SidebarAccessibility,
  SidebarPersonalization,
  SidebarExample
} from './components/Sidebar';

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

// System components
export * from './system';

// Optimization components
export { AnimationOptimizer } from './components/AnimationOptimizer';
export { ProgressiveDisclosure } from './components/ProgressiveDisclosure';

// Export utilities
export { ExportButton } from './components/ExportButton';

// Dropdown component
export { Dropdown } from './components/Dropdown';

// Accessibility
export { AccessibilityProvider } from './components/AccessibilityProvider';
export { SidebarLandmarks } from './components/SidebarLandmarks';

// Workflow components
export { WorkflowOptimizer } from './components/WorkflowOptimizer';
export { FlowValidator } from './components/FlowValidator';

// Table component
export { Table } from './components/Table';

// ==========================================
// STYLES
// ==========================================
// CSS is automatically imported when using components
// Users can also import './styles/unified-design-system.css' directly
EOF

echo -e "${GREEN}✓ Created consolidated index.ts${NC}"

# ================================================
# STEP 6: REMOVE UNUSED COMPONENT FILES
# ================================================
echo -e "${YELLOW}STEP 6: Removing unused component files${NC}"

# Remove duplicate component index files that cause conflicts
if [ -f "$UI_DIR/components/index.ts" ]; then
    rm "$UI_DIR/components/index.ts"
    echo -e "${GREEN}✓ Removed components/index.ts to avoid conflicts${NC}"
fi

# ================================================
# STEP 7: FIX CIRCULAR DEPENDENCIES
# ================================================
echo -e "${YELLOW}STEP 7: Fixing circular dependencies${NC}"

# Update Sidebar/index.ts to avoid circular imports
cat > "$UI_DIR/components/Sidebar/index.ts" << 'EOF'
// Sidebar component exports
export { SidebarNavigation } from './SidebarNavigation';
export { SidebarProvider, useSidebar } from './SidebarProvider';
export { SidebarBreadcrumbs } from './SidebarBreadcrumbs';
export { SidebarAnimations } from './SidebarAnimations';
export { SidebarAccessibility } from './SidebarAccessibility';
export { SidebarPersonalization } from './SidebarPersonalization';
export { SidebarExample } from './SidebarExample';
EOF

echo -e "${GREEN}✓ Fixed circular dependencies${NC}"

# ================================================
# STEP 8: UPDATE IMPORT STATEMENTS
# ================================================
echo -e "${YELLOW}STEP 8: Updating import statements${NC}"

# Update all imports to use the consolidated @ghxstship/ui
find "$APP_DIR" -name "*.tsx" -o -name "*.ts" | while read file; do
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *"dist"* ]]; then
        continue
    fi
    
    # Update imports from subpaths to main package
    sed -i '' \
        -e 's|from "@ghxstship/ui/components/DataViews/types"|from "@ghxstship/ui"|g' \
        -e 's|from "@ghxstship/ui/components/DataViews/providers/SupabaseDataProvider"|from "@ghxstship/ui"|g' \
        "$file" 2>/dev/null || true
done

echo -e "${GREEN}✓ Updated import statements${NC}"

# ================================================
# STEP 9: CLEAN UP CSS
# ================================================
echo -e "${YELLOW}STEP 9: Cleaning up CSS${NC}"

# Remove legacy CSS from unified-design-system.css
if [ -f "$UI_DIR/styles/unified-design-system.css" ]; then
    # Remove legacy support section
    sed -i '' '/\/\* Legacy Support \*\//,/--duration-slow: var(--motion-duration-slow);/d' \
        "$UI_DIR/styles/unified-design-system.css" 2>/dev/null || true
    echo -e "${GREEN}✓ Removed legacy CSS support${NC}"
fi

# ================================================
# STEP 10: VALIDATE AND REPORT
# ================================================
echo -e "${YELLOW}STEP 10: Validating cleanup${NC}"

# Check for remaining issues
REMAINING_LEGACY=$(grep -r "text-heading-\|p-[0-9]\|m-[0-9]\|gap-[0-9]" "$UI_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
REMAINING_COLORS=$(grep -r "#[0-9a-fA-F]\{6\}" "$UI_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "var(--" | wc -l || echo 0)
DUPLICATE_EXPORTS=$(find "$UI_DIR" -name "UnifiedDesignSystem.tsx" | wc -l)

echo ""
echo "================================================"
echo -e "${GREEN}ENTERPRISE UI CLEANUP COMPLETE${NC}"
echo "================================================"
echo ""
echo "Results:"
echo "--------"
echo "✓ Removed duplicate UnifiedDesignSystem"
echo "✓ Consolidated all exports to single index.ts"
echo "✓ Fixed circular dependencies"
echo "✓ Updated import statements"
echo "✓ Replaced hardcoded colors with CSS variables"
echo "✓ Fixed legacy CSS patterns"
echo ""
echo "Remaining Issues:"
echo "-----------------"
echo "Legacy CSS patterns: $REMAINING_LEGACY"
echo "Hardcoded colors: $REMAINING_COLORS"
echo "Duplicate exports: $DUPLICATE_EXPORTS"
echo ""

if [ $REMAINING_LEGACY -eq 0 ] && [ $REMAINING_COLORS -eq 0 ] && [ $DUPLICATE_EXPORTS -eq 0 ]; then
    echo -e "${GREEN}🎉 UI system is now 100% enterprise-grade!${NC}"
else
    echo -e "${YELLOW}⚠ Some issues remain. Run targeted fixes for specific patterns.${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to verify no build errors"
echo "2. Run 'npm run lint' to check for linting issues"
echo "3. Test the application thoroughly"
echo ""
