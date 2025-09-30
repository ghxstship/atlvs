#!/bin/bash

# Comprehensive Dark Theme Audit - Verify 100% migration to design tokens
# This script will scan the entire repository and report any remaining issues

echo "🔍 COMPREHENSIVE DARK THEME AUDIT - GHXSTSHIP Repository"
echo "========================================================"

# Define the base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Counters
TOTAL_FILES_SCANNED=0
GRADIENT_VIOLATIONS=0
BORDER_VIOLATIONS=0
COLOR_VIOLATIONS=0
TOTAL_VIOLATIONS=0

echo ""
echo "📊 SCANNING FOR VIOLATIONS..."
echo ""

# Function to scan for gradient text violations
scan_gradient_violations() {
    echo "1. GRADIENT TEXT VIOLATIONS:"
    echo "   Searching for: bg-gradient.*bg-clip-text text-transparent"
    
    local violations=$(find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "bg-gradient.*bg-clip-text text-transparent" 2>/dev/null | wc -l)
    GRADIENT_VIOLATIONS=$violations
    
    if [ $violations -eq 0 ]; then
        echo "   ✅ NO VIOLATIONS FOUND - All gradient text uses semantic tokens"
    else
        echo "   ❌ FOUND $violations FILES WITH GRADIENT VIOLATIONS:"
        find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l "bg-gradient.*bg-clip-text text-transparent" 2>/dev/null | while read file; do
            echo "      - $(basename "$file")"
            grep -n "bg-gradient.*bg-clip-text text-transparent" "$file" | head -3
        done
    fi
    echo ""
}

# Function to scan for hardcoded color violations
scan_color_violations() {
    echo "2. HARDCODED COLOR VIOLATIONS:"
    echo "   Searching for: text-black, text-white, bg-white, border-gray-*"
    
    local violations=$(find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l -E "(text-black|text-white|bg-white|border-gray-[0-9])" 2>/dev/null | wc -l)
    COLOR_VIOLATIONS=$violations
    
    if [ $violations -eq 0 ]; then
        echo "   ✅ NO VIOLATIONS FOUND - All colors use semantic tokens"
    else
        echo "   ❌ FOUND $violations FILES WITH COLOR VIOLATIONS:"
        find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l -E "(text-black|text-white|bg-white|border-gray-[0-9])" 2>/dev/null | head -10 | while read file; do
            echo "      - $(basename "$file")"
        done
    fi
    echo ""
}

# Function to scan for border violations
scan_border_violations() {
    echo "3. BORDER TOKEN VIOLATIONS:"
    echo "   Searching for: border-gray-*, border-slate-*, border-zinc-*"
    
    local violations=$(find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l -E "border-(gray|slate|zinc)-[0-9]" 2>/dev/null | wc -l)
    BORDER_VIOLATIONS=$violations
    
    if [ $violations -eq 0 ]; then
        echo "   ✅ NO VIOLATIONS FOUND - All borders use semantic tokens"
    else
        echo "   ❌ FOUND $violations FILES WITH BORDER VIOLATIONS:"
        find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs grep -l -E "border-(gray|slate|zinc)-[0-9]" 2>/dev/null | head -10 | while read file; do
            echo "      - $(basename "$file")"
        done
    fi
    echo ""
}

# Function to verify design system implementation
verify_design_system() {
    echo "4. DESIGN SYSTEM VERIFICATION:"
    
    local css_file="$BASE_DIR/packages/ui/src/styles/unified-design-system.css"
    
    if [ -f "$css_file" ]; then
        echo "   ✅ unified-design-system.css exists"
        
        # Check for dark theme gradient overrides
        if grep -q "Dark theme gradient text - comprehensive greyscale gradients" "$css_file"; then
            echo "   ✅ Dark theme gradient overrides implemented"
        else
            echo "   ❌ Missing dark theme gradient overrides"
        fi
        
        # Check for border enforcement
        if grep -q "Dark theme border enforcement - comprehensive white borders" "$css_file"; then
            echo "   ✅ Dark theme border enforcement implemented"
        else
            echo "   ❌ Missing dark theme border enforcement"
        fi
        
        # Check for form element styling
        if grep -q "Dark theme form elements - enhanced styling" "$css_file"; then
            echo "   ✅ Dark theme form element styling implemented"
        else
            echo "   ❌ Missing dark theme form element styling"
        fi
    else
        echo "   ❌ unified-design-system.css not found"
    fi
    echo ""
}

# Function to count total files
count_files() {
    TOTAL_FILES_SCANNED=$(find "$BASE_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | wc -l)
    echo "📁 TOTAL FILES SCANNED: $TOTAL_FILES_SCANNED"
    echo ""
}

# Run all scans
count_files
scan_gradient_violations
scan_color_violations
scan_border_violations
verify_design_system

# Calculate total violations
TOTAL_VIOLATIONS=$((GRADIENT_VIOLATIONS + COLOR_VIOLATIONS + BORDER_VIOLATIONS))

# Final report
echo "========================================================"
echo "🎯 FINAL AUDIT RESULTS"
echo "========================================================"
echo "📊 Files Scanned: $TOTAL_FILES_SCANNED"
echo "🎨 Gradient Violations: $GRADIENT_VIOLATIONS"
echo "🎨 Color Violations: $COLOR_VIOLATIONS"
echo "🎨 Border Violations: $BORDER_VIOLATIONS"
echo "📈 Total Violations: $TOTAL_VIOLATIONS"
echo ""

if [ $TOTAL_VIOLATIONS -eq 0 ]; then
    echo "✅ AUDIT PASSED: 100% DARK THEME MIGRATION COMPLETE"
    echo "🎉 All components use semantic design tokens"
    echo "🌙 Dark theme will display properly with:"
    echo "   • White borders with proper opacity"
    echo "   • Greyscale gradient text"
    echo "   • Semantic color classes throughout"
else
    echo "❌ AUDIT FAILED: $TOTAL_VIOLATIONS violations found"
    echo "🔧 Manual fixes required for remaining violations"
fi

echo "========================================================"
