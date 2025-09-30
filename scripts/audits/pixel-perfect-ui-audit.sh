#!/bin/bash

# Pixel-Perfect UI Audit Script
# Comprehensive analysis of UI layer for design token normalization

REPO_PATH="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
REPORT_FILE="$REPO_PATH/docs/PIXEL_PERFECT_UI_AUDIT.md"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🔍 Starting Pixel-Perfect UI Audit..."
echo "=================================="

# Initialize report
cat > "$REPORT_FILE" << EOF
# Pixel-Perfect UI Audit Report
Generated: $(date)

## Executive Summary
Comprehensive pixel-level audit of the GHXSTSHIP UI layer to identify all design inconsistencies and hardcoded values.

## Audit Categories

### 1. Color System Violations
EOF

echo "Analyzing color violations..."

# Color violations - find hardcoded colors
echo "#### Hardcoded Hex Colors" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" --include="*.css" -E "#[0-9a-fA-F]{3,8}" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    head -50 >> "$REPORT_FILE" 2>/dev/null
echo '```' >> "$REPORT_FILE"

echo "#### Hardcoded RGB/RGBA Colors" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" --include="*.css" -E "rgb\(|rgba\(" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    head -50 >> "$REPORT_FILE" 2>/dev/null
echo '```' >> "$REPORT_FILE"

echo "#### Non-Semantic Tailwind Colors" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "(text|bg|border)-(gray|red|blue|green|yellow|purple|pink|indigo)-[0-9]+" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 2. Spacing System Violations
EOF

echo "Analyzing spacing violations..."

# Spacing violations
echo "#### Hardcoded Pixel Values" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" --include="*.css" -E "[0-9]+px" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    grep -v "font-size" | grep -v "line-height" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "#### Non-Semantic Spacing Classes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "(p|m|gap|space)-(x|y)?-?[0-9]+" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 3. Border & Radius Violations
EOF

echo "Analyzing border violations..."

echo "#### Hardcoded Border Widths" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "border-[0-9]" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "#### Hardcoded Border Radius" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "rounded-(none|sm|md|lg|xl|2xl|3xl|full)" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances using Tailwind defaults (should use semantic tokens)" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 4. Shadow System Violations
EOF

echo "Analyzing shadow violations..."

echo "#### Non-Semantic Shadows" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "shadow-(sm|md|lg|xl|2xl|inner|none)" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 5. Typography Violations
EOF

echo "Analyzing typography violations..."

echo "#### Hardcoded Font Sizes" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances using Tailwind defaults" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "#### Hardcoded Font Weights" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 6. Animation & Transition Violations
EOF

echo "Analyzing animation violations..."

echo "#### Hardcoded Transitions" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "transition-(all|colors|opacity|shadow|transform)" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "#### Hardcoded Durations" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "duration-[0-9]+" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances found" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 7. State Violations
EOF

echo "Analyzing state violations..."

echo "#### Inconsistent Hover States" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "hover:(bg|text|border)-(gray|red|blue|green)-[0-9]+" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances with hardcoded hover colors" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

echo "#### Inconsistent Focus States" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
grep -r --include="*.tsx" --include="*.ts" -E "focus:(ring|border|outline)-(blue|indigo|purple)-[0-9]+" "$REPO_PATH" | \
    grep -v "node_modules" | grep -v ".next" | grep -v "dist" | \
    wc -l >> "$REPORT_FILE"
echo " instances with hardcoded focus colors" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 8. Component-Level Analysis
EOF

echo "Analyzing component consistency..."

# Analyze key component directories
COMPONENT_DIRS=(
    "packages/ui/src/components"
    "apps/web/app/_components"
    "apps/web/app/(app)/(shell)"
    "apps/web/app/(marketing)"
)

for dir in "${COMPONENT_DIRS[@]}"; do
    if [ -d "$REPO_PATH/$dir" ]; then
        echo "#### $dir" >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
        find "$REPO_PATH/$dir" -name "*.tsx" -o -name "*.ts" | wc -l >> "$REPORT_FILE"
        echo " component files to normalize" >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
    fi
done

cat >> "$REPORT_FILE" << EOF

## Priority Normalization Areas

### Critical (P0)
1. Color system - Replace all hardcoded colors with semantic tokens
2. Spacing system - Replace all numeric spacing with semantic tokens
3. Typography - Normalize all text styles to design tokens

### High (P1)
1. Border system - Standardize border widths and radii
2. Shadow system - Create semantic shadow scale
3. State management - Normalize hover/focus/active states

### Medium (P2)
1. Animation system - Standardize transitions and durations
2. Icon system - Normalize icon sizes and colors
3. Layout system - Standardize container widths and breakpoints

## Recommended Design Token Structure

\`\`\`css
:root {
  /* Colors - Semantic */
  --color-background: ...;
  --color-foreground: ...;
  --color-primary: ...;
  --color-secondary: ...;
  --color-accent: ...;
  --color-muted: ...;
  --color-success: ...;
  --color-warning: ...;
  --color-destructive: ...;
  --color-info: ...;
  
  /* Spacing - T-shirt sizes */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
  --spacing-5xl: 8rem;
  
  /* Radius - Semantic */
  --radius-none: 0;
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows - Elevation */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;
  --shadow-xl: ...;
  --shadow-2xl: ...;
  
  /* Typography - Scales */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  
  /* Animation - Timing */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 1000ms;
  
  /* Z-index - Layers */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-notification: 80;
}
\`\`\`

## Next Steps
1. Create comprehensive design token system
2. Build automated migration scripts
3. Update all components to use semantic tokens
4. Implement ESLint rules for enforcement
5. Add CI/CD validation
6. Create component library documentation

EOF

echo "✅ Audit complete! Report saved to: $REPORT_FILE"
echo ""
echo "Summary of violations found:"
echo "----------------------------"
grep -E "[0-9]+ instances" "$REPORT_FILE" | head -10

# Generate statistics
TOTAL_FILES=$(find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | wc -l)
echo ""
echo "Total files to process: $TOTAL_FILES"
