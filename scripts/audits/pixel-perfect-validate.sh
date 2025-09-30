#!/bin/bash

# Pixel-Perfect Validation Script
# Checks for remaining design token violations

REPO_PATH="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
REPORT_FILE="$REPO_PATH/docs/PIXEL_PERFECT_VALIDATION.md"

echo "🔍 Pixel-Perfect Validation"
echo "============================"
echo ""

# Initialize report
cat > "$REPORT_FILE" << EOF
# Pixel-Perfect Validation Report
Generated: $(date)

## Validation Results

EOF

# Function to check violations
check_violations() {
    local pattern=$1
    local description=$2
    local count=0
    
    count=$(grep -r --include="*.tsx" --include="*.ts" -E "$pattern" "$REPO_PATH" 2>/dev/null | \
        grep -v "node_modules" | \
        grep -v ".next" | \
        grep -v "dist" | \
        grep -v ".backup-" | \
        wc -l | tr -d ' ')
    
    echo "$description: $count violations"
    echo "- $description: **$count** violations" >> "$REPORT_FILE"
    
    return $count
}

echo "### Color System" >> "$REPORT_FILE"
check_violations "(text|bg|border)-(gray|red|blue|green|yellow|purple)-[0-9]+" "Hardcoded colors"

echo "" >> "$REPORT_FILE"
echo "### Spacing System" >> "$REPORT_FILE"
check_violations "\b(p|m|gap|space)-(x|y)?-?[0-9]+\b" "Hardcoded spacing"

echo "" >> "$REPORT_FILE"
echo "### Typography" >> "$REPORT_FILE"
check_violations "\btext-(xs|sm|base|lg|xl|2xl|3xl)\b" "Non-semantic font sizes"
check_violations "\bfont-(thin|light|normal|medium|semibold|bold)\b" "Non-semantic font weights"

echo "" >> "$REPORT_FILE"
echo "### Shadows & Borders" >> "$REPORT_FILE"
check_violations "\bshadow-(sm|md|lg|xl|2xl)\b" "Non-semantic shadows"
check_violations "\brounded-(sm|md|lg|xl|2xl)\b" "Non-semantic border radius"

echo "" >> "$REPORT_FILE"
echo "### Animations" >> "$REPORT_FILE"
check_violations "\bduration-[0-9]+\b" "Hardcoded durations"
check_violations "\btransition-(all|colors|opacity|shadow|transform)\b" "Non-semantic transitions"

# Count total files
TOTAL_FILES=$(find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/.backup-*/*" | wc -l | tr -d ' ')

echo "" >> "$REPORT_FILE"
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- Total files scanned: **$TOTAL_FILES**" >> "$REPORT_FILE"
echo "- Validation completed: $(date)" >> "$REPORT_FILE"

# Check if all violations are resolved
TOTAL_VIOLATIONS=$(grep -o "[0-9]* violations" "$REPORT_FILE" | awk '{sum+=$1} END {print sum}')

echo "" >> "$REPORT_FILE"
if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
    echo "## ✅ VALIDATION PASSED" >> "$REPORT_FILE"
    echo "All design tokens are properly normalized!" >> "$REPORT_FILE"
    echo ""
    echo "✅ VALIDATION PASSED - No violations found!"
else
    echo "## ⚠️ VALIDATION FAILED" >> "$REPORT_FILE"
    echo "Found **$TOTAL_VIOLATIONS** total violations that need to be fixed." >> "$REPORT_FILE"
    echo ""
    echo "⚠️ VALIDATION FAILED - Found $TOTAL_VIOLATIONS violations"
fi

echo ""
echo "Report saved to: $REPORT_FILE"
