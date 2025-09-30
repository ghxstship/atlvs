#!/bin/bash

# GHXSTSHIP Semantic Color Token Audit Script
# This script audits and reports all color token violations in the repository

echo "================================================"
echo "GHXSTSHIP SEMANTIC COLOR TOKEN AUDIT"
echo "================================================"
echo ""

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
REPORT_FILE="$REPO_ROOT/docs/COLOR_TOKEN_AUDIT_REPORT.md"

# Create report directory if it doesn't exist
mkdir -p "$REPO_ROOT/docs"

# Initialize report
cat > "$REPORT_FILE" << EOF
# GHXSTSHIP Semantic Color Token Audit Report
Generated: $(date)

## Executive Summary
This report identifies all color token violations in the GHXSTSHIP repository where hardcoded colors are used instead of semantic design tokens.

## Key Requirements
1. **Titles/Headers**: Must use foreground color (black), NOT accent color
2. **Gradients**: Must use proper gradient classes with correct application
3. **Badges**: Must use semantic color tokens with proper opacity
4. **Backgrounds**: Must use semantic bg- classes
5. **Borders**: Must use semantic border- classes  
6. **Shadows**: Must use semantic shadow- classes

## Color Token Mapping

### Text Colors (Semantic)
- \`text-foreground\` - Primary text (black/white based on theme)
- \`text-muted-foreground\` - Secondary text
- \`text-accent\` - Accent color text (green)
- \`text-primary\` - Primary brand color
- \`text-destructive\` - Error/danger text
- \`text-success\` - Success text
- \`text-warning\` - Warning text

### Background Colors (Semantic)
- \`bg-background\` - Main background
- \`bg-muted\` - Muted background
- \`bg-card\` - Card background
- \`bg-accent\` - Accent background
- \`bg-primary\` - Primary background
- \`bg-destructive\` - Error background
- \`bg-success\` - Success background
- \`bg-warning\` - Warning background

### Border Colors (Semantic)
- \`border-border\` - Default border
- \`border-accent\` - Accent border
- \`border-primary\` - Primary border
- \`border-destructive\` - Error border
- \`border-success\` - Success border
- \`border-warning\` - Warning border

---

## Violations Found

EOF

echo "Analyzing repository for color token violations..."
echo ""

# Function to count violations in a category
count_violations() {
    local pattern="$1"
    local description="$2"
    local count=$(find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.next/*" \
        -not -path "*/dist/*" \
        -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l)
    echo "$count"
}

# 1. Check for hardcoded Tailwind text colors
echo "### 1. Hardcoded Text Colors" >> "$REPORT_FILE"
echo "Files using hardcoded Tailwind text colors instead of semantic tokens:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for hardcoded text colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "text-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    violations=$(grep -o "text-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9][0-9]*" "$file" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
    echo "- \`$relative_path\`: $violations" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

# 2. Check for hardcoded background colors
echo "### 2. Hardcoded Background Colors" >> "$REPORT_FILE"
echo "Files using hardcoded Tailwind background colors instead of semantic tokens:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for hardcoded background colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "bg-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    violations=$(grep -o "bg-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9][0-9]*" "$file" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
    echo "- \`$relative_path\`: $violations" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

# 3. Check for hardcoded border colors
echo "### 3. Hardcoded Border Colors" >> "$REPORT_FILE"
echo "Files using hardcoded Tailwind border colors instead of semantic tokens:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for hardcoded border colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "border-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    violations=$(grep -o "border-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9][0-9]*" "$file" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
    echo "- \`$relative_path\`: $violations" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

# 4. Check for incorrect title/header colors
echo "### 4. Incorrect Title/Header Colors" >> "$REPORT_FILE"
echo "Files where titles/headers use accent color instead of foreground:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for incorrect title colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "text-\(heading\|display\|h[1-6]\).*text-\(accent\|primary\|green\)" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    echo "- \`$relative_path\`" >> "$REPORT_FILE"
done

# Also check for className patterns with accent on headers
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "<h[1-6].*text-\(accent\|primary\|green\)" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    echo "- \`$relative_path\` (h tag with accent color)" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

# 5. Check for missing/incorrect gradient implementations
echo "### 5. Gradient Implementation Issues" >> "$REPORT_FILE"
echo "Files with potential gradient issues:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for gradient issues..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "gradient\|from-\|to-\|via-" {} \; 2>/dev/null | while read file; do
    # Check if file uses gradient but doesn't have proper gradient classes
    if ! grep -q "text-gradient\|bg-gradient" "$file"; then
        relative_path="${file#$REPO_ROOT/}"
        echo "- \`$relative_path\` (uses gradient syntax but may lack proper classes)" >> "$REPORT_FILE"
    fi
done
echo "" >> "$REPORT_FILE"

# 6. Check for hardcoded shadow values
echo "### 6. Hardcoded Shadow Values" >> "$REPORT_FILE"
echo "Files using hardcoded shadow values instead of semantic tokens:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for hardcoded shadows..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "shadow-\(sm\|md\|lg\|xl\|2xl\|inner\|none\)[^-]" {} \; 2>/dev/null | while read file; do
    # Check if it's not using our semantic shadow classes
    if ! grep -q "shadow-\(surface\|elevated\|floating\|modal\|popover\|hover\|active\|focus\|primary\|success\|warning\|error\|glass\)" "$file"; then
        relative_path="${file#$REPO_ROOT/}"
        violations=$(grep -o "shadow-\(sm\|md\|lg\|xl\|2xl\|inner\|none\)" "$file" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
        echo "- \`$relative_path\`: $violations" >> "$REPORT_FILE"
    fi
done
echo "" >> "$REPORT_FILE"

# 7. Check for ring colors
echo "### 7. Hardcoded Ring/Focus Colors" >> "$REPORT_FILE"
echo "Files using hardcoded ring colors instead of semantic tokens:" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Checking for hardcoded ring colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -exec grep -l "ring-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" {} \; 2>/dev/null | while read file; do
    relative_path="${file#$REPO_ROOT/}"
    violations=$(grep -o "ring-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9][0-9]*" "$file" | sort | uniq | tr '\n' ', ' | sed 's/,$//')
    echo "- \`$relative_path\`: $violations" >> "$REPORT_FILE"
done
echo "" >> "$REPORT_FILE"

# Summary statistics
echo "## Summary Statistics" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

text_violations=$(count_violations "text-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" "Text color violations")
bg_violations=$(count_violations "bg-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" "Background color violations")
border_violations=$(count_violations "border-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" "Border color violations")
ring_violations=$(count_violations "ring-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" "Ring color violations")

echo "- **Text Color Violations**: $text_violations files" >> "$REPORT_FILE"
echo "- **Background Color Violations**: $bg_violations files" >> "$REPORT_FILE"
echo "- **Border Color Violations**: $border_violations files" >> "$REPORT_FILE"
echo "- **Ring Color Violations**: $ring_violations files" >> "$REPORT_FILE"
echo "- **Total Files with Violations**: $((text_violations + bg_violations + border_violations + ring_violations)) files" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "## Recommended Actions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. Run \`semantic-color-fix.sh\` to automatically fix violations" >> "$REPORT_FILE"
echo "2. Review gradient implementations for proper class usage" >> "$REPORT_FILE"
echo "3. Ensure all titles use \`text-foreground\` not \`text-accent\`" >> "$REPORT_FILE"
echo "4. Replace all hardcoded colors with semantic tokens" >> "$REPORT_FILE"
echo "5. Update shadow utilities to use semantic shadow classes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Display summary
echo ""
echo "================================================"
echo "AUDIT COMPLETE"
echo "================================================"
echo ""
echo "Summary:"
echo "- Text Color Violations: $text_violations files"
echo "- Background Color Violations: $bg_violations files"
echo "- Border Color Violations: $border_violations files"
echo "- Ring Color Violations: $ring_violations files"
echo ""
echo "Full report saved to: $REPORT_FILE"
echo ""
echo "To fix violations, run: ./semantic-color-fix.sh"
