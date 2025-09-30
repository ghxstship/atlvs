#!/bin/bash
# PRECISE COLOR AUDIT - Detect only actual CSS color codes
set -euo pipefail

echo "🎨 PRECISE COLOR AUDIT - DETECTING ACTUAL CSS COLORS"
echo "=================================================="

# Function to check if a hex code is actually a color (not passport numbers, etc.)
check_actual_colors() {
    local file="$1"
    local violations=0
    
    # Look for hex colors in CSS contexts (color:, background:, border:, etc.)
    if grep -E "(color|background|border|fill|stroke)\s*:\s*#[0-9a-fA-F]{3,6}" "$file" >/dev/null 2>&1; then
        echo "❌ CSS color properties in: $file"
        grep -n -E "(color|background|border|fill|stroke)\s*:\s*#[0-9a-fA-F]{3,6}" "$file" | head -3
        ((violations++))
    fi
    
    # Look for hex colors in className or style attributes
    if grep -E "(className|style).*#[0-9a-fA-F]{3,6}" "$file" >/dev/null 2>&1; then
        echo "❌ Inline hex colors in: $file"
        grep -n -E "(className|style).*#[0-9a-fA-F]{3,6}" "$file" | head -3
        ((violations++))
    fi
    
    # Look for hex colors in CSS files
    if [[ "$file" == *.css ]] && grep -E "#[0-9a-fA-F]{3,6}" "$file" >/dev/null 2>&1; then
        # Exclude CSS custom properties and design token definitions
        if ! grep -E "(--color-|DESIGN_TOKENS)" "$file" >/dev/null 2>&1; then
            echo "❌ CSS hex colors in: $file"
            grep -n "#[0-9a-fA-F]{3,6}" "$file" | head -3
            ((violations++))
        fi
    fi
    
    return $violations
}

total_violations=0

echo "🔍 Scanning for actual CSS color violations..."

# Check packages directory
if [[ -d "packages" ]]; then
    while IFS= read -r -d '' file; do
        if check_actual_colors "$file"; then
            ((total_violations++))
        fi
    done < <(find packages -name "*.ts" -o -name "*.tsx" -o -name "*.css" -print0 2>/dev/null)
fi

# Check apps directory
if [[ -d "apps" ]]; then
    while IFS= read -r -d '' file; do
        if check_actual_colors "$file"; then
            ((total_violations++))
        fi
    done < <(find apps -name "*.ts" -o -name "*.tsx" -o -name "*.css" -print0 2>/dev/null)
fi

echo ""
echo "📊 PRECISE COLOR AUDIT RESULTS:"
echo "   - Total files with actual color violations: $total_violations"

if [[ $total_violations -eq 0 ]]; then
    echo "✅ No actual CSS color violations found!"
    exit 0
else
    echo "❌ Found $total_violations files with actual color violations"
    exit 1
fi
