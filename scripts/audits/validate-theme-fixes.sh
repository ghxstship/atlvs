#!/bin/bash

# GHXSTSHIP Theme Fix Validation Script
# Validates that all opacity, z-layer, and theme issues are resolved

echo "🔍 GHXSTSHIP Theme Fix Validation"
echo "================================="

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
APPS_DIR="$REPO_ROOT/apps"
REPORT_FILE="$REPO_ROOT/docs/THEME_FIX_VALIDATION_REPORT.md"

# Create validation report
mkdir -p "$REPO_ROOT/docs"
cat > "$REPORT_FILE" << 'EOF'
# GHXSTSHIP Theme Fix Validation Report

## Validation Results

EOF

echo "📋 Phase 1: Validating NavigationDropdown fixes..."

DROPDOWN_FILE="$APPS_DIR/web/app/_components/marketing/navigation/NavigationDropdown.tsx"
if [ -f "$DROPDOWN_FILE" ]; then
    echo "### ✅ NavigationDropdown Component" >> "$REPORT_FILE"
    echo "**Z-Index Usage:**" >> "$REPORT_FILE"
    if grep -q "z-dropdown\|z-popover\|z-modal-backdrop" "$DROPDOWN_FILE"; then
        echo "- ✅ Uses semantic z-index tokens" >> "$REPORT_FILE"
    else
        echo "- ❌ Still uses hardcoded z-index" >> "$REPORT_FILE"
    fi
    
    echo "**Background Usage:**" >> "$REPORT_FILE"
    if grep -q "bg-solid-popover\|bg-solid-card" "$DROPDOWN_FILE"; then
        echo "- ✅ Uses solid backgrounds" >> "$REPORT_FILE"
    else
        echo "- ❌ May still have transparent backgrounds" >> "$REPORT_FILE"
    fi
    
    echo "**Theme Consistency:**" >> "$REPORT_FILE"
    if grep -q "text-foreground\|border-border" "$DROPDOWN_FILE"; then
        echo "- ✅ Uses semantic color tokens" >> "$REPORT_FILE"
    else
        echo "- ❌ May still use hardcoded colors" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
fi

echo "📋 Phase 2: Checking design system implementation..."

DESIGN_SYSTEM_FILE="$REPO_ROOT/packages/ui/src/styles/unified-design-system.css"
if [ -f "$DESIGN_SYSTEM_FILE" ]; then
    echo "### ✅ Design System Updates" >> "$REPORT_FILE"
    
    if grep -q "z-dropdown\|z-popover\|z-modal" "$DESIGN_SYSTEM_FILE"; then
        echo "- ✅ Z-index scale implemented" >> "$REPORT_FILE"
    else
        echo "- ❌ Z-index scale missing" >> "$REPORT_FILE"
    fi
    
    if grep -q "bg-solid-popover\|backdrop-blur" "$DESIGN_SYSTEM_FILE"; then
        echo "- ✅ Backdrop utilities implemented" >> "$REPORT_FILE"
    else
        echo "- ❌ Backdrop utilities missing" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
fi

echo "📋 Phase 3: Scanning for remaining violations..."

# Check for hardcoded colors
HARDCODED_COLORS=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-gray-[0-9]\|bg-gray-[0-9]\|border-gray-[0-9]\|text-slate-[0-9]\|bg-slate-[0-9]\|border-slate-[0-9]" 2>/dev/null | wc -l)

# Check for hardcoded z-index
HARDCODED_Z_INDEX=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "z-\[[0-9]" 2>/dev/null | wc -l)

# Check for opacity bleeding issues
OPACITY_ISSUES=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "bg-.*\/[0-9][0-9]" 2>/dev/null | wc -l)

# Check for light/dark theme violations
LIGHT_THEME_VIOLATIONS=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-black\|text-gray-900\|border-black" 2>/dev/null | wc -l)
DARK_THEME_VIOLATIONS=$(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-white\|text-gray-100\|border-white" 2>/dev/null | wc -l)

echo "### 🔍 Remaining Issues Scan" >> "$REPORT_FILE"
echo "| Issue Type | Count | Status |" >> "$REPORT_FILE"
echo "|------------|-------|--------|" >> "$REPORT_FILE"
echo "| Hardcoded Colors | $HARDCODED_COLORS | $([ $HARDCODED_COLORS -eq 0 ] && echo "✅ Fixed" || echo "❌ Needs Fix") |" >> "$REPORT_FILE"
echo "| Hardcoded Z-Index | $HARDCODED_Z_INDEX | $([ $HARDCODED_Z_INDEX -eq 0 ] && echo "✅ Fixed" || echo "❌ Needs Fix") |" >> "$REPORT_FILE"
echo "| Opacity Issues | $OPACITY_ISSUES | $([ $OPACITY_ISSUES -eq 0 ] && echo "✅ Fixed" || echo "❌ Needs Fix") |" >> "$REPORT_FILE"
echo "| Light Theme Violations | $LIGHT_THEME_VIOLATIONS | $([ $LIGHT_THEME_VIOLATIONS -eq 0 ] && echo "✅ Fixed" || echo "❌ Needs Fix") |" >> "$REPORT_FILE"
echo "| Dark Theme Violations | $DARK_THEME_VIOLATIONS | $([ $DARK_THEME_VIOLATIONS -eq 0 ] && echo "✅ Fixed" || echo "❌ Needs Fix") |" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "📋 Phase 4: Testing specific components..."

# Test key components that commonly have these issues
COMPONENTS_TO_TEST=(
    "NavigationDropdown.tsx"
    "Modal.tsx"
    "Popover.tsx"
    "Dropdown.tsx"
    "Dialog.tsx"
    "Tooltip.tsx"
)

echo "### 🧪 Component-Specific Tests" >> "$REPORT_FILE"
for component in "${COMPONENTS_TO_TEST[@]}"; do
    COMPONENT_FILES=$(find "$APPS_DIR" -name "*$component" 2>/dev/null)
    if [ -n "$COMPONENT_FILES" ]; then
        echo "**$component:**" >> "$REPORT_FILE"
        echo "$COMPONENT_FILES" | while read file; do
            if [ -f "$file" ]; then
                echo "- Found: $file" >> "$REPORT_FILE"
                
                # Check for solid backgrounds
                if grep -q "bg-solid-\|bg-popover\|bg-card\|bg-background" "$file"; then
                    echo "  - ✅ Has solid background" >> "$REPORT_FILE"
                else
                    echo "  - ⚠️ May need solid background" >> "$REPORT_FILE"
                fi
                
                # Check for proper z-index
                if grep -q "z-dropdown\|z-popover\|z-modal" "$file"; then
                    echo "  - ✅ Uses semantic z-index" >> "$REPORT_FILE"
                else
                    echo "  - ⚠️ May need z-index fix" >> "$REPORT_FILE"
                fi
            fi
        done
        echo "" >> "$REPORT_FILE"
    fi
done

# Calculate overall score
TOTAL_ISSUES=$((HARDCODED_COLORS + HARDCODED_Z_INDEX + OPACITY_ISSUES + LIGHT_THEME_VIOLATIONS + DARK_THEME_VIOLATIONS))
if [ $TOTAL_ISSUES -eq 0 ]; then
    SCORE="100%"
    STATUS="✅ PERFECT"
elif [ $TOTAL_ISSUES -le 5 ]; then
    SCORE="95%"
    STATUS="✅ EXCELLENT"
elif [ $TOTAL_ISSUES -le 10 ]; then
    SCORE="85%"
    STATUS="⚠️ GOOD"
else
    SCORE="70%"
    STATUS="❌ NEEDS WORK"
fi

echo "## 📊 Overall Assessment" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Theme Consistency Score: $SCORE**" >> "$REPORT_FILE"
echo "**Status: $STATUS**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Total Issues Found: $TOTAL_ISSUES**" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo "🎉 **CONGRATULATIONS!** All theme consistency issues have been resolved!" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "✅ Opacity and z-layer issues fixed" >> "$REPORT_FILE"
    echo "✅ NavigationDropdown bleeding through resolved" >> "$REPORT_FILE"
    echo "✅ Light/dark theme colors normalized" >> "$REPORT_FILE"
    echo "✅ Semantic design tokens used exclusively" >> "$REPORT_FILE"
else
    echo "## 🔧 Recommended Actions" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    if [ $HARDCODED_COLORS -gt 0 ]; then
        echo "1. **Fix remaining hardcoded colors** ($HARDCODED_COLORS files)" >> "$REPORT_FILE"
        echo "   - Replace with semantic tokens (text-foreground, border-border, etc.)" >> "$REPORT_FILE"
    fi
    if [ $HARDCODED_Z_INDEX -gt 0 ]; then
        echo "2. **Fix remaining hardcoded z-index** ($HARDCODED_Z_INDEX files)" >> "$REPORT_FILE"
        echo "   - Replace with semantic z-index scale (z-dropdown, z-popover, etc.)" >> "$REPORT_FILE"
    fi
    if [ $OPACITY_ISSUES -gt 0 ]; then
        echo "3. **Fix remaining opacity issues** ($OPACITY_ISSUES files)" >> "$REPORT_FILE"
        echo "   - Replace transparent backgrounds with solid alternatives" >> "$REPORT_FILE"
    fi
fi

echo ""
echo "📊 Validation Summary:"
echo "- Theme Consistency Score: $SCORE"
echo "- Status: $STATUS"
echo "- Total Issues: $TOTAL_ISSUES"
echo ""
echo "📄 Full report saved to: $REPORT_FILE"
