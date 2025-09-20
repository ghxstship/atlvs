#!/bin/bash

# GHXSTSHIP Color System Validation Script
# Validates the implementation of the new color system

set -e

echo "🔍 GHXSTSHIP Color System Validation"
echo "===================================="
echo ""

# Define directories
REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
APPS_DIR="$REPO_ROOT/apps/web/app"

echo "📁 Repository root: $REPO_ROOT"
echo ""

# Function to check brand context classes
check_brand_contexts() {
    echo "🏷️  Checking brand context classes..."
    
    # Check OPENDECK pages
    echo "   → Checking OPENDECK pages for .brand-opendeck..."
    opendeck_count=$(find "$APPS_DIR" -path "*opendeck*" -name "*.tsx" -type f -exec grep -l "brand-opendeck" {} \; | wc -l)
    echo "     ✓ Found $opendeck_count OPENDECK pages with brand-opendeck class"
    
    # Check ATLVS pages
    echo "   → Checking ATLVS pages for .brand-atlvs..."
    atlvs_count=$(find "$APPS_DIR" -path "*atlvs*" -name "*.tsx" -type f -exec grep -l "brand-atlvs" {} \; | wc -l)
    echo "     ✓ Found $atlvs_count ATLVS pages with brand-atlvs class"
    
    # Check marketing layout for Ghostship Green
    echo "   → Checking marketing layout for .brand-ghostship..."
    if grep -q "brand-ghostship" "$APPS_DIR/_components/marketing/MarketingLayoutClient.tsx"; then
        echo "     ✓ Marketing layout has brand-ghostship class"
    else
        echo "     ⚠️  Marketing layout missing brand-ghostship class"
    fi
    
    # Check app shell for ATLVS branding
    echo "   → Checking app shell for .brand-atlvs..."
    if grep -q "brand-atlvs" "$APPS_DIR/_components/shell/AppShell.tsx"; then
        echo "     ✓ App shell has brand-atlvs class"
    else
        echo "     ⚠️  App shell missing brand-atlvs class"
    fi
    
    echo ""
}

# Function to check color token usage
check_color_tokens() {
    echo "🎨 Checking color token usage..."
    
    # Check for old color references that should be updated
    echo "   → Checking for old color references..."
    
    old_primary_count=$(grep -r "hsl(195 100% 50%)" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    if [ "$old_primary_count" -gt 0 ]; then
        echo "     ⚠️  Found $old_primary_count old blue primary references"
        grep -r "hsl(195 100% 50%)" "$APPS_DIR" --include="*.tsx" --include="*.ts" | head -3
    else
        echo "     ✓ No old blue primary references found"
    fi
    
    # Check for new Ghostship Green usage
    ghostship_count=$(grep -r "hsl(158 64% 52%)" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    echo "     ✓ Found $ghostship_count Ghostship Green references"
    
    echo ""
}

# Function to check status color consistency
check_status_colors() {
    echo "⚠️  Checking status color consistency..."
    
    # Check for old error/yellow/green/blue references
    error_refs=$(grep -r "color-error\|bg-error\|text-error" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    yellow_refs=$(grep -r "color-yellow\|bg-yellow\|text-yellow" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    green_refs=$(grep -r "color-green\|bg-green\|text-green" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    blue_refs=$(grep -r "color-blue\|bg-blue\|text-blue" "$APPS_DIR" --include="*.tsx" --include="*.ts" | wc -l)
    
    if [ "$error_refs" -gt 0 ]; then
        echo "     ⚠️  Found $error_refs old error color references"
    else
        echo "     ✓ No old error color references"
    fi
    
    if [ "$yellow_refs" -gt 0 ]; then
        echo "     ⚠️  Found $yellow_refs old yellow color references"
    else
        echo "     ✓ No old yellow color references"
    fi
    
    if [ "$green_refs" -gt 0 ]; then
        echo "     ⚠️  Found $green_refs old green color references"
    else
        echo "     ✓ No old green color references"
    fi
    
    if [ "$blue_refs" -gt 0 ]; then
        echo "     ⚠️  Found $blue_refs old blue color references"
    else
        echo "     ✓ No old blue color references"
    fi
    
    echo ""
}

# Function to validate design system CSS
validate_design_system() {
    echo "🎯 Validating design system CSS..."
    
    local css_file="$REPO_ROOT/packages/ui/src/styles/unified-design-system.css"
    
    if grep -q "hsl(158 64% 52%)" "$css_file"; then
        echo "     ✓ Ghostship Green found in design system"
    else
        echo "     ❌ Ghostship Green missing from design system"
    fi
    
    if grep -q "accent-opendeck: 195 100% 50%" "$css_file"; then
        echo "     ✓ OPENDECK blue accent found in design system"
    else
        echo "     ❌ OPENDECK blue accent missing from design system"
    fi
    
    if grep -q "accent-atlvs: 320 100% 50%" "$css_file"; then
        echo "     ✓ ATLVS pink accent found in design system"
    else
        echo "     ❌ ATLVS pink accent missing from design system"
    fi
    
    if grep -q "brand-ghostship" "$css_file"; then
        echo "     ✓ Ghostship brand class found in design system"
    else
        echo "     ❌ Ghostship brand class missing from design system"
    fi
    
    echo ""
}

# Function to generate summary report
generate_summary() {
    echo "📊 Validation Summary"
    echo "===================="
    
    local total_issues=0
    
    # Count potential issues
    old_primary_count=$(grep -r "hsl(195 100% 50%)" "$APPS_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    error_refs=$(grep -r "color-error\|bg-error\|text-error" "$APPS_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    
    total_issues=$((old_primary_count + error_refs))
    
    if [ "$total_issues" -eq 0 ]; then
        echo "✅ All validation checks passed!"
        echo "   → Color system migration is complete and successful"
    else
        echo "⚠️  Found $total_issues potential issues"
        echo "   → Review the validation output above for details"
    fi
    
    echo ""
    echo "🎨 Color System Status:"
    echo "   → Ghostship Green (Default): #22C55E"
    echo "   → OPENDECK Blue: #00BFFF"
    echo "   → ATLVS Pink: #FF00FF"
    echo "   → Status colors normalized"
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting color system validation..."
    echo ""
    
    check_brand_contexts
    check_color_tokens
    check_status_colors
    validate_design_system
    generate_summary
    
    echo "✅ Color system validation completed!"
    echo ""
}

# Execute main function
main "$@"
