#!/bin/bash

# GHXSTSHIP Comprehensive Theme, Opacity & Z-Layer Audit
# Identifies all opacity, z-layer, and theme consistency issues

echo "🔍 GHXSTSHIP Theme, Opacity & Z-Layer Audit"
echo "=============================================="

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
APPS_DIR="$REPO_ROOT/apps"
REPORT_FILE="$REPO_ROOT/docs/THEME_OPACITY_AUDIT_REPORT.md"

# Create report file
mkdir -p "$REPO_ROOT/docs"
cat > "$REPORT_FILE" << 'EOF'
# GHXSTSHIP Theme, Opacity & Z-Layer Audit Report

## Issues Identified

### 1. Opacity & Z-Layer Issues
EOF

echo "📋 Phase 1: Scanning for opacity and z-layer issues..."

# Find files with potential opacity issues
echo "### Files with potential opacity bleeding:" >> "$REPORT_FILE"
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs grep -l "opacity-" | while read file; do
    echo "- $file" >> "$REPORT_FILE"
    grep -n "opacity-" "$file" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

# Find files with z-index usage
echo "### Files with z-index usage:" >> "$REPORT_FILE"
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.css" | xargs grep -l "z-\|z\[" | while read file; do
    echo "- $file" >> "$REPORT_FILE"
    grep -n "z-\|z\[" "$file" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

echo "📋 Phase 2: Scanning for theme consistency violations..."

# Find hardcoded colors that should be semantic
echo "### 2. Theme Consistency Violations" >> "$REPORT_FILE"
echo "### Files with hardcoded colors (should use semantic tokens):" >> "$REPORT_FILE"

# Light theme violations (hardcoded dark colors)
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-black\|text-gray-900\|text-slate-900\|border-black\|border-gray-900" | while read file; do
    echo "**Light theme violations in $file:**" >> "$REPORT_FILE"
    grep -n "text-black\|text-gray-900\|text-slate-900\|border-black\|border-gray-900" "$file" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

# Dark theme violations (hardcoded light colors)
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-white\|text-gray-100\|text-slate-100\|border-white\|border-gray-100" | while read file; do
    echo "**Dark theme violations in $file:**" >> "$REPORT_FILE"
    grep -n "text-white\|text-gray-100\|text-slate-100\|border-white\|border-gray-100" "$file" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

# Find files using non-semantic color classes
find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-gray-\|bg-gray-\|border-gray-\|text-slate-\|bg-slate-\|border-slate-" | while read file; do
    echo "**Non-semantic color usage in $file:**" >> "$REPORT_FILE"
    grep -n "text-gray-\|bg-gray-\|border-gray-\|text-slate-\|bg-slate-\|border-slate-" "$file" | head -10 >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

echo "📋 Phase 3: Scanning NavigationDropdown specifically..."

# NavigationDropdown specific issues
DROPDOWN_FILE="$APPS_DIR/web/app/_components/marketing/navigation/NavigationDropdown.tsx"
if [ -f "$DROPDOWN_FILE" ]; then
    echo "### 3. NavigationDropdown Specific Issues" >> "$REPORT_FILE"
    echo "**Current z-index usage:**" >> "$REPORT_FILE"
    grep -n "z-\|z\[" "$DROPDOWN_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "**Current opacity usage:**" >> "$REPORT_FILE"
    grep -n "opacity-\|bg-.*/" "$DROPDOWN_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    echo "**Current background usage:**" >> "$REPORT_FILE"
    grep -n "bg-" "$DROPDOWN_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

echo "📋 Phase 4: Generating recommendations..."

cat >> "$REPORT_FILE" << 'EOF'

## Recommendations

### 1. Z-Index Scale Implementation
Create comprehensive z-index scale in design system:
```css
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-modal-backdrop: 40;
--z-modal: 50;
--z-popover: 60;
--z-tooltip: 70;
--z-notification: 80;
--z-max: 9999;
```

### 2. Opacity & Backdrop Fixes
- Replace transparent backgrounds with solid theme-aware backgrounds
- Add proper backdrop blur/overlay for dropdowns
- Ensure all popover/dropdown content has solid backgrounds

### 3. Theme Consistency Normalization
- Replace all hardcoded colors with semantic tokens
- Light theme: dark text/borders (text-foreground, border-border)
- Dark theme: light text/borders (text-foreground, border-border)
- Use semantic color utilities exclusively

### 4. NavigationDropdown Specific Fixes
- Add solid backdrop with blur effect
- Implement proper z-index hierarchy
- Ensure dropdown content doesn't bleed through
- Add theme-aware solid backgrounds

EOF

echo "✅ Audit complete! Report saved to: $REPORT_FILE"
echo ""
echo "📊 Summary:"
echo "- Opacity issues: $(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "opacity-" | wc -l) files"
echo "- Z-index usage: $(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "z-\|z\[" | wc -l) files"
echo "- Theme violations: $(find "$APPS_DIR" -name "*.tsx" -o -name "*.ts" | xargs grep -l "text-gray-\|bg-gray-\|border-gray-" | wc -l) files"
