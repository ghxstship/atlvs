#!/bin/bash

# GHXSTSHIP Zero Tolerance Design Token Audit & Fix Script
# Identifies and converts all hardcoded design values to semantic design tokens

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
REPORT_FILE="$REPO_ROOT/docs/HARDCODED_VALUES_AUDIT_REPORT.md"
APPS_DIR="$REPO_ROOT/apps/web"
PACKAGES_DIR="$REPO_ROOT/packages"

echo "🔍 GHXSTSHIP Zero Tolerance Design Token Audit"
echo "================================================"
echo ""

# Create report header
cat > "$REPORT_FILE" << 'EOF'
# Hardcoded Design Values Audit Report
**Generated:** $(date)
**Status:** Zero Tolerance Enforcement

## Executive Summary
This report identifies all hardcoded design values that must be converted to semantic design tokens from the unified design system.

## Design Token Reference

### Spacing Tokens
- `p-1, p-2` → `p-xs` (4px)
- `p-3` → `p-sm` (8px / 12px)
- `p-4` → `p-md` (16px)
- `p-6` → `p-lg` (24px)
- `p-8` → `p-xl` (32px)
- `p-12` → `p-2xl` (48px)
- `p-16` → `p-3xl` (64px)

Same pattern applies to: `px-`, `py-`, `m-`, `mx-`, `my-`, `gap-`, `space-x-`, `space-y-`

### Border Radius Tokens
- `rounded-sm` → `rounded-sm` (0.125rem) ✓
- `rounded` → `rounded-base` (0.25rem)
- `rounded-md` → `rounded-md` (0.375rem) ✓
- `rounded-lg` → `rounded-lg` (0.5rem) ✓
- `rounded-xl` → `rounded-xl` (0.75rem) ✓
- `rounded-2xl` → `rounded-2xl` (1rem) ✓
- `rounded-3xl` → `rounded-3xl` (1.5rem) ✓
- `rounded-full` → `rounded-full` ✓

### Text Size Tokens
- `text-xs` → `text-xs` ✓
- `text-sm` → `text-sm` ✓
- `text-base` → `text-base` ✓
- `text-lg` → `text-lg` ✓
- `text-xl` → `text-xl` ✓
- `text-2xl` → `text-2xl` ✓

### Width/Height Tokens
- `w-4, h-4` → `w-4 h-4` (icon size - acceptable)
- `w-8, h-8` → `w-8 h-8` (icon size - acceptable)
- `w-full` → `w-full` ✓
- `h-screen` → `h-screen` ✓

## Violations Found

EOF

echo "📊 Scanning for hardcoded spacing values..."

# Function to count violations
count_violations() {
    local pattern=$1
    local description=$2
    local count=$(find "$APPS_DIR" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    echo "- $description: **$count files**" >> "$REPORT_FILE"
    echo "  $description: $count files"
}

# Spacing violations
echo "" >> "$REPORT_FILE"
echo "### Spacing Violations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_violations '\bp-[0-9]\b' "Padding (p-1, p-2, p-3, etc.)"
count_violations '\bpx-[0-9]\b' "Horizontal padding (px-1, px-2, etc.)"
count_violations '\bpy-[0-9]\b' "Vertical padding (py-1, py-2, etc.)"
count_violations '\bm-[0-9]\b' "Margin (m-1, m-2, etc.)"
count_violations '\bmx-[0-9]\b' "Horizontal margin (mx-1, mx-2, etc.)"
count_violations '\bmy-[0-9]\b' "Vertical margin (my-1, my-2, etc.)"
count_violations '\bgap-[0-9]\b' "Gap (gap-1, gap-2, etc.)"
count_violations '\bspace-x-[0-9]\b' "Horizontal space (space-x-1, etc.)"
count_violations '\bspace-y-[0-9]\b' "Vertical space (space-y-1, etc.)"

# Additional violations
echo "" >> "$REPORT_FILE"
echo "### Additional Violations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

count_violations '\bw-[0-9][0-9]\b' "Width values (w-10, w-20, etc.)"
count_violations '\bh-[0-9][0-9]\b' "Height values (h-10, h-20, etc.)"
count_violations '\bmin-w-[0-9]\b' "Min-width values"
count_violations '\bmin-h-[0-9]\b' "Min-height values"
count_violations '\bmax-w-[0-9]\b' "Max-width values (excluding max-w-xs, max-w-sm, etc.)"
count_violations '\bmax-h-[0-9]\b' "Max-height values"

echo "" >> "$REPORT_FILE"
echo "## Conversion Mapping" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "# Spacing Conversions" >> "$REPORT_FILE"
echo "p-1, p-2 → p-xs    # 4px" >> "$REPORT_FILE"
echo "p-3 → p-sm         # 8-12px" >> "$REPORT_FILE"
echo "p-4 → p-md         # 16px" >> "$REPORT_FILE"
echo "p-6 → p-lg         # 24px" >> "$REPORT_FILE"
echo "p-8 → p-xl         # 32px" >> "$REPORT_FILE"
echo "p-12 → p-2xl       # 48px" >> "$REPORT_FILE"
echo "p-16 → p-3xl       # 64px" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Same pattern for:" >> "$REPORT_FILE"
echo "- px-*, py-* (directional padding)" >> "$REPORT_FILE"
echo "- m-*, mx-*, my-* (margins)" >> "$REPORT_FILE"
echo "- gap-* (flexbox/grid gaps)" >> "$REPORT_FILE"
echo "- space-x-*, space-y-* (space between)" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Automated Fix Commands" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Run the following commands to automatically fix violations:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo '```bash' >> "$REPORT_FILE"
echo "# Fix padding values" >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-1\b/p-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-2\b/p-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-3\b/p-sm/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-4\b/p-md/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-6\b/p-lg/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-8\b/p-xl/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-12\b/p-2xl/g" {} +' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Fix horizontal padding" >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-1\b/px-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-2\b/px-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-3\b/px-sm/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-4\b/px-md/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-6\b/px-lg/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-8\b/px-xl/g" {} +' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Fix vertical padding" >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-1\b/py-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-2\b/py-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-3\b/py-sm/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-4\b/py-md/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-6\b/py-lg/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-8\b/py-xl/g" {} +' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Fix margins" >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-1\b/m-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-2\b/m-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-3\b/m-sm/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-4\b/m-md/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-6\b/m-lg/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-8\b/m-xl/g" {} +' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "# Fix gaps" >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-1\b/gap-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-2\b/gap-xs/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-3\b/gap-sm/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-4\b/gap-md/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-6\b/gap-lg/g" {} +' >> "$REPORT_FILE"
echo 'find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-8\b/gap-xl/g" {} +' >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Status" >> "$REPORT_FILE"
echo "- [ ] Audit completed" >> "$REPORT_FILE"
echo "- [ ] Automated fixes applied" >> "$REPORT_FILE"
echo "- [ ] Manual review completed" >> "$REPORT_FILE"
echo "- [ ] Zero tolerance achieved" >> "$REPORT_FILE"

echo ""
echo "✅ Audit report generated: $REPORT_FILE"
echo ""
echo "📝 Next Steps:"
echo "1. Review the audit report"
echo "2. Run the automated fix commands"
echo "3. Test the application"
echo "4. Commit the changes"
