#!/bin/bash

# GHXSTSHIP Pixel-Perfect UI Normalization Audit Script
# This script performs a comprehensive audit of UI spacing, padding, and alignment issues

echo "================================================"
echo "GHXSTSHIP PIXEL-PERFECT UI NORMALIZATION AUDIT"
echo "================================================"
echo ""

# Configuration
PROJECT_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
REPORT_FILE="$PROJECT_ROOT/docs/PIXEL_PERFECT_AUDIT_REPORT.md"
TEMP_DIR="/tmp/ghxstship_audit"

# Create temp directory
mkdir -p "$TEMP_DIR"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# GHXSTSHIP Pixel-Perfect UI Normalization Audit Report

Generated: $(date)

## Executive Summary

This report provides a comprehensive analysis of UI inconsistencies across the GHXSTSHIP codebase, focusing on spacing, padding, alignment, and other visual normalization issues.

## Design Token System

### Approved Spacing Scale
- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)
- `--spacing-4xl`: 6rem (96px)
- `--spacing-5xl`: 8rem (128px)

### Semantic Classes
- Padding: `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl`, `p-2xl`, `p-3xl`, `p-4xl`, `p-5xl`
- Margin: `m-xs`, `m-sm`, `m-md`, `m-lg`, `m-xl`, `m-2xl`, `m-3xl`, `m-4xl`, `m-5xl`
- Gap: `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `gap-xl`, `gap-2xl`, `gap-3xl`

---

## Audit Results

EOF

echo "Starting comprehensive UI audit..."

# Function to count violations in a category
count_violations() {
    local pattern=$1
    local description=$2
    local count=$(grep -r "$pattern" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    echo "$count"
}

# 1. SPACING VIOLATIONS
echo ""
echo "### 1. SPACING VIOLATIONS" >> "$REPORT_FILE"
echo "Analyzing spacing violations..."

# Hardcoded padding violations
echo "" >> "$REPORT_FILE"
echo "#### Hardcoded Padding Classes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

# Count specific padding violations
for i in 0 1 2 3 4 5 6 7 8 9 10 12 14 16 20 24 32 40 48 56 64 72 80 96; do
    count=$(grep -r "p-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "p-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "px-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "px-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "py-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "py-$i: $count violations" >> "$REPORT_FILE"
    fi
done

echo '```' >> "$REPORT_FILE"

# Hardcoded margin violations
echo "" >> "$REPORT_FILE"
echo "#### Hardcoded Margin Classes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

for i in 0 1 2 3 4 5 6 7 8 9 10 12 14 16 20 24 32 40 48 56 64 72 80 96; do
    count=$(grep -r "m-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "m-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "mx-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "mx-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "my-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "my-$i: $count violations" >> "$REPORT_FILE"
    fi
done

echo '```' >> "$REPORT_FILE"

# Gap violations
echo "" >> "$REPORT_FILE"
echo "#### Hardcoded Gap Classes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

for i in 0 1 2 3 4 5 6 7 8 9 10 12 14 16 20 24 32; do
    count=$(grep -r "gap-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "gap-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "gap-x-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "gap-x-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "gap-y-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "gap-y-$i: $count violations" >> "$REPORT_FILE"
    fi
done

echo '```' >> "$REPORT_FILE"

# Space violations
echo "" >> "$REPORT_FILE"
echo "#### Hardcoded Space Classes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

for i in 0 1 2 3 4 5 6 7 8 9 10 12 14 16 20 24 32; do
    count=$(grep -r "space-x-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "space-x-$i: $count violations" >> "$REPORT_FILE"
    fi
    
    count=$(grep -r "space-y-$i[^0-9]" "$PROJECT_ROOT" \
        --include="*.tsx" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "space-y-$i: $count violations" >> "$REPORT_FILE"
    fi
done

echo '```' >> "$REPORT_FILE"

# 2. ALIGNMENT ISSUES
echo ""
echo "### 2. ALIGNMENT ISSUES" >> "$REPORT_FILE"
echo "Analyzing alignment issues..."

echo '```' >> "$REPORT_FILE"

# Check for inconsistent flexbox alignment
flex_start=$(grep -r "items-start" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
flex_center=$(grep -r "items-center" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
flex_end=$(grep -r "items-end" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
justify_start=$(grep -r "justify-start" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
justify_center=$(grep -r "justify-center" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
justify_between=$(grep -r "justify-between" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)

echo "Flexbox Alignment Usage:" >> "$REPORT_FILE"
echo "  items-start: $flex_start occurrences" >> "$REPORT_FILE"
echo "  items-center: $flex_center occurrences" >> "$REPORT_FILE"
echo "  items-end: $flex_end occurrences" >> "$REPORT_FILE"
echo "  justify-start: $justify_start occurrences" >> "$REPORT_FILE"
echo "  justify-center: $justify_center occurrences" >> "$REPORT_FILE"
echo "  justify-between: $justify_between occurrences" >> "$REPORT_FILE"

echo '```' >> "$REPORT_FILE"

# 3. INCONSISTENT SIZING
echo ""
echo "### 3. INCONSISTENT SIZING" >> "$REPORT_FILE"
echo "Analyzing sizing inconsistencies..."

echo '```' >> "$REPORT_FILE"

# Check for hardcoded width/height values
width_violations=$(grep -r "w-\[" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
height_violations=$(grep -r "h-\[" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
size_violations=$(grep -r "size-\[" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)

echo "Hardcoded Dimensions:" >> "$REPORT_FILE"
echo "  Arbitrary width values (w-[...]): $width_violations" >> "$REPORT_FILE"
echo "  Arbitrary height values (h-[...]): $height_violations" >> "$REPORT_FILE"
echo "  Arbitrary size values (size-[...]): $size_violations" >> "$REPORT_FILE"

echo '```' >> "$REPORT_FILE"

# 4. BORDER RADIUS INCONSISTENCIES
echo ""
echo "### 4. BORDER RADIUS INCONSISTENCIES" >> "$REPORT_FILE"
echo "Analyzing border radius usage..."

echo '```' >> "$REPORT_FILE"

# Check for non-semantic border radius
rounded_none=$(grep -r "rounded-none" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_sm=$(grep -r "rounded-sm" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded=$(grep -r 'rounded"' "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_md=$(grep -r "rounded-md" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_lg=$(grep -r "rounded-lg" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_xl=$(grep -r "rounded-xl" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_2xl=$(grep -r "rounded-2xl" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_3xl=$(grep -r "rounded-3xl" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
rounded_full=$(grep -r "rounded-full" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)

echo "Border Radius Usage:" >> "$REPORT_FILE"
echo "  rounded-none: $rounded_none" >> "$REPORT_FILE"
echo "  rounded-sm: $rounded_sm" >> "$REPORT_FILE"
echo "  rounded: $rounded" >> "$REPORT_FILE"
echo "  rounded-md: $rounded_md" >> "$REPORT_FILE"
echo "  rounded-lg: $rounded_lg" >> "$REPORT_FILE"
echo "  rounded-xl: $rounded_xl" >> "$REPORT_FILE"
echo "  rounded-2xl: $rounded_2xl" >> "$REPORT_FILE"
echo "  rounded-3xl: $rounded_3xl" >> "$REPORT_FILE"
echo "  rounded-full: $rounded_full" >> "$REPORT_FILE"

echo '```' >> "$REPORT_FILE"

# 5. SHADOW INCONSISTENCIES
echo ""
echo "### 5. SHADOW INCONSISTENCIES" >> "$REPORT_FILE"
echo "Analyzing shadow usage..."

echo '```' >> "$REPORT_FILE"

shadow_sm=$(grep -r "shadow-sm" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow=$(grep -r 'shadow"' "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow_md=$(grep -r "shadow-md" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow_lg=$(grep -r "shadow-lg" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow_xl=$(grep -r "shadow-xl" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow_2xl=$(grep -r "shadow-2xl" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)
shadow_none=$(grep -r "shadow-none" "$PROJECT_ROOT" --include="*.tsx" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.next 2>/dev/null | wc -l)

echo "Shadow Usage:" >> "$REPORT_FILE"
echo "  shadow-none: $shadow_none" >> "$REPORT_FILE"
echo "  shadow-sm: $shadow_sm" >> "$REPORT_FILE"
echo "  shadow: $shadow" >> "$REPORT_FILE"
echo "  shadow-md: $shadow_md" >> "$REPORT_FILE"
echo "  shadow-lg: $shadow_lg" >> "$REPORT_FILE"
echo "  shadow-xl: $shadow_xl" >> "$REPORT_FILE"
echo "  shadow-2xl: $shadow_2xl" >> "$REPORT_FILE"

echo '```' >> "$REPORT_FILE"

# 6. FILES WITH MOST VIOLATIONS
echo ""
echo "### 6. FILES WITH MOST VIOLATIONS" >> "$REPORT_FILE"
echo "Identifying files with most spacing violations..."

echo '```' >> "$REPORT_FILE"
echo "Top 20 Files with Hardcoded Spacing:" >> "$REPORT_FILE"

# Find files with most violations
grep -r "p-[0-9]\|px-[0-9]\|py-[0-9]\|m-[0-9]\|mx-[0-9]\|my-[0-9]\|gap-[0-9]\|space-[xy]-[0-9]" "$PROJECT_ROOT" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | \
    cut -d: -f1 | sort | uniq -c | sort -rn | head -20 | \
    while read count file; do
        relative_path=${file#$PROJECT_ROOT/}
        echo "  $count violations: $relative_path" >> "$REPORT_FILE"
    done

echo '```' >> "$REPORT_FILE"

# 7. COMPONENT ANALYSIS
echo ""
echo "### 7. COMPONENT-SPECIFIC ISSUES" >> "$REPORT_FILE"
echo "Analyzing specific component patterns..."

# Check Button components
echo "" >> "$REPORT_FILE"
echo "#### Button Component Patterns" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

button_files=$(find "$PROJECT_ROOT" -name "*[Bb]utton*.tsx" -o -name "*[Bb]utton*.jsx" 2>/dev/null | grep -v node_modules | grep -v .next)
button_count=$(echo "$button_files" | wc -l)
echo "Found $button_count button-related files" >> "$REPORT_FILE"

# Check for inconsistent button padding
for file in $button_files; do
    if [ -f "$file" ]; then
        violations=$(grep -c "p-[0-9]\|px-[0-9]\|py-[0-9]" "$file" 2>/dev/null || echo 0)
        if [ "$violations" -gt 0 ]; then
            relative_path=${file#$PROJECT_ROOT/}
            echo "  $relative_path: $violations hardcoded padding values" >> "$REPORT_FILE"
        fi
    fi
done

echo '```' >> "$REPORT_FILE"

# Check Card components
echo "" >> "$REPORT_FILE"
echo "#### Card Component Patterns" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

card_files=$(find "$PROJECT_ROOT" -name "*[Cc]ard*.tsx" -o -name "*[Cc]ard*.jsx" 2>/dev/null | grep -v node_modules | grep -v .next)
card_count=$(echo "$card_files" | wc -l)
echo "Found $card_count card-related files" >> "$REPORT_FILE"

for file in $card_files; do
    if [ -f "$file" ]; then
        violations=$(grep -c "p-[0-9]\|px-[0-9]\|py-[0-9]" "$file" 2>/dev/null || echo 0)
        if [ "$violations" -gt 0 ]; then
            relative_path=${file#$PROJECT_ROOT/}
            echo "  $relative_path: $violations hardcoded padding values" >> "$REPORT_FILE"
        fi
    fi
done

echo '```' >> "$REPORT_FILE"

# 8. SUMMARY AND RECOMMENDATIONS
echo ""
echo "## Summary Statistics" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Calculate totals
total_padding=$(grep -r "p-[0-9]\|px-[0-9]\|py-[0-9]\|pt-[0-9]\|pb-[0-9]\|pl-[0-9]\|pr-[0-9]" "$PROJECT_ROOT" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)

total_margin=$(grep -r "m-[0-9]\|mx-[0-9]\|my-[0-9]\|mt-[0-9]\|mb-[0-9]\|ml-[0-9]\|mr-[0-9]" "$PROJECT_ROOT" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)

total_gap=$(grep -r "gap-[0-9]\|gap-x-[0-9]\|gap-y-[0-9]" "$PROJECT_ROOT" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)

total_space=$(grep -r "space-x-[0-9]\|space-y-[0-9]" "$PROJECT_ROOT" \
    --include="*.tsx" --include="*.jsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist 2>/dev/null | wc -l)

total_violations=$((total_padding + total_margin + total_gap + total_space))

echo "| Category | Violations |" >> "$REPORT_FILE"
echo "|----------|------------|" >> "$REPORT_FILE"
echo "| Padding | $total_padding |" >> "$REPORT_FILE"
echo "| Margin | $total_margin |" >> "$REPORT_FILE"
echo "| Gap | $total_gap |" >> "$REPORT_FILE"
echo "| Space | $total_space |" >> "$REPORT_FILE"
echo "| **Total** | **$total_violations** |" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## Remediation Plan" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Phase 1: Immediate Actions (Critical)" >> "$REPORT_FILE"
echo "1. Run automated migration script to convert hardcoded values to semantic tokens" >> "$REPORT_FILE"
echo "2. Fix top 20 files with most violations" >> "$REPORT_FILE"
echo "3. Standardize button and card component spacing" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Phase 2: Component Standardization (High Priority)" >> "$REPORT_FILE"
echo "1. Create spacing presets for common patterns" >> "$REPORT_FILE"
echo "2. Implement consistent alignment patterns" >> "$REPORT_FILE"
echo "3. Standardize shadow and border radius usage" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Phase 3: System-Wide Normalization (Medium Priority)" >> "$REPORT_FILE"
echo "1. Implement ESLint rules to prevent future violations" >> "$REPORT_FILE"
echo "2. Create component spacing guidelines" >> "$REPORT_FILE"
echo "3. Add pre-commit hooks for spacing validation" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Mapping Guide" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "Padding/Margin Mapping:" >> "$REPORT_FILE"
echo "  p-0, m-0 → p-0, m-0 (keep as is)" >> "$REPORT_FILE"
echo "  p-1, m-1 → p-xs, m-xs (4px)" >> "$REPORT_FILE"
echo "  p-2, m-2 → p-sm, m-sm (8px)" >> "$REPORT_FILE"
echo "  p-3, m-3 → p-sm, m-sm (12px → 8px)" >> "$REPORT_FILE"
echo "  p-4, m-4 → p-md, m-md (16px)" >> "$REPORT_FILE"
echo "  p-5, m-5 → p-lg, m-lg (20px → 24px)" >> "$REPORT_FILE"
echo "  p-6, m-6 → p-lg, m-lg (24px)" >> "$REPORT_FILE"
echo "  p-8, m-8 → p-xl, m-xl (32px)" >> "$REPORT_FILE"
echo "  p-10, m-10 → p-2xl, m-2xl (40px → 48px)" >> "$REPORT_FILE"
echo "  p-12, m-12 → p-2xl, m-2xl (48px)" >> "$REPORT_FILE"
echo "  p-16, m-16 → p-3xl, m-3xl (64px)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Gap/Space Mapping:" >> "$REPORT_FILE"
echo "  gap-1, space-x-1, space-y-1 → gap-xs (4px)" >> "$REPORT_FILE"
echo "  gap-2, space-x-2, space-y-2 → gap-sm (8px)" >> "$REPORT_FILE"
echo "  gap-3, space-x-3, space-y-3 → gap-sm (12px → 8px)" >> "$REPORT_FILE"
echo "  gap-4, space-x-4, space-y-4 → gap-md (16px)" >> "$REPORT_FILE"
echo "  gap-5, space-x-5, space-y-5 → gap-lg (20px → 24px)" >> "$REPORT_FILE"
echo "  gap-6, space-x-6, space-y-6 → gap-lg (24px)" >> "$REPORT_FILE"
echo "  gap-8, space-x-8, space-y-8 → gap-xl (32px)" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo ""
echo "================================================"
echo "Audit Complete!"
echo "Report saved to: $REPORT_FILE"
echo "Total violations found: $total_violations"
echo "================================================"

# Clean up
rm -rf "$TEMP_DIR"
