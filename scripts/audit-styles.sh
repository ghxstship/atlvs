#!/bin/bash

# ATLVS Style Audit Script
# Comprehensive audit to identify and report style-related issues

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_FILE="$REPO_ROOT/STYLE_AUDIT_REPORT.md"

echo "🎨 ATLVS Style Audit - Starting..."
echo ""

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# ATLVS Style Audit Report
**Generated:** $(date)

## Executive Summary

This report identifies CSS and styling issues across the ATLVS codebase.

---

## Issues Found

EOF

# Function to count occurrences
count_issues() {
  local pattern="$1"
  local path="$2"
  local description="$3"
  
  echo "Checking: $description"
  
  local count=$(grep -r "$pattern" "$path" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$count" -gt 0 ]; then
    echo "### $description" >> "$REPORT_FILE"
    echo "**Count:** $count occurrences" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    grep -rn "$pattern" "$path" 2>/dev/null | head -20 >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
  fi
}

# Check for circular CSS variable references
echo "1. Checking for circular CSS variable references..."
count_issues "var(--color-background))" "$REPO_ROOT/packages/ui/src/styles" "Circular CSS Variable: --color-background"
count_issues "hsl(var(--color-" "$REPO_ROOT/packages/ui/src/styles" "Potential circular references in HSL"

# Check for missing hsl() wrappers
echo "2. Checking for CSS variables used without hsl()..."
count_issues "color: var(--color-" "$REPO_ROOT/packages/ui/src" "Colors used without hsl() wrapper"
count_issues "background-color: var(--color-" "$REPO_ROOT/packages/ui/src" "Background colors without hsl() wrapper"

# Check for hardcoded color values
echo "3. Checking for hardcoded colors..."
count_issues "#[0-9a-fA-F]{6}" "$REPO_ROOT/apps/web/app" "Hardcoded hex colors in app"
count_issues "rgb\(" "$REPO_ROOT/apps/web/app" "Hardcoded RGB colors in app"

# Check for missing Tailwind utilities
echo "4. Checking for inline styles (should use Tailwind)..."
count_issues 'style={{' "$REPO_ROOT/apps/web/app" "Inline styles in React components"

# Check for duplicate Tailwind directives
echo "5. Checking for duplicate @tailwind directives..."
count_issues "@tailwind base" "$REPO_ROOT" "Tailwind base directive usage"
count_issues "@tailwind components" "$REPO_ROOT" "Tailwind components directive usage"
count_issues "@tailwind utilities" "$REPO_ROOT" "Tailwind utilities directive usage"

# Check for missing imports
echo "6. Checking CSS import chain..."
if ! grep -q "@import.*styles.css" "$REPO_ROOT/apps/web/app/globals.css"; then
  echo "### Missing UI Package Styles Import" >> "$REPORT_FILE"
  echo "⚠️ The globals.css does not import @ghxstship/ui styles" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
fi

# Summary
echo "" >> "$REPORT_FILE"
echo "## Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. **Fix Circular References**: Remove all self-referencing CSS variables" >> "$REPORT_FILE"
echo "2. **Use HSL Wrapper**: All color variables should be used with hsl() wrapper" >> "$REPORT_FILE"
echo "3. **Remove Hardcoded Colors**: Use design tokens instead" >> "$REPORT_FILE"
echo "4. **Use Tailwind Classes**: Replace inline styles with utility classes" >> "$REPORT_FILE"
echo "5. **Consolidate Styles**: Ensure single source of truth for design tokens" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo ""
echo "✅ Audit complete! Report saved to: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
