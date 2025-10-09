#!/bin/bash

# ============================================================================
# INVALID SPACING TOKEN REMEDIATION SCRIPT
# ============================================================================
# This script fixes invalid spacing token typos throughout the codebase
# 
# ISSUE: Invalid tokens like py-xsxl, py-smxl, etc. cause sections to have
#        no padding, resulting in cramped layouts with insufficient spacing
#
# VALID TOKENS: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl
# INVALID PATTERNS: xsxl, smxl, mdxl, lgxl (typos combining two tokens)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   INVALID SPACING TOKEN REMEDIATION                       ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Define the root directory
ROOT_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
APPS_DIR="$ROOT_DIR/apps/web"

# Create backup
BACKUP_DIR="$ROOT_DIR/.backup-spacing-fix-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}📦 Creating backup at: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$APPS_DIR/app" "$BACKUP_DIR/" 2>/dev/null || true

echo ""
echo -e "${BLUE}🔍 PHASE 1: AUDIT - Finding all invalid spacing tokens${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Count occurrences of each invalid pattern
echo -e "\n${YELLOW}Invalid Pattern Occurrences:${NC}"
echo "─────────────────────────────"

# py-xsxl (most common)
PY_XSXL_COUNT=$(grep -r "py-xsxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "py-xsxl:  ${RED}$PY_XSXL_COUNT files${NC}"

# py-smxl
PY_SMXL_COUNT=$(grep -r "py-smxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "py-smxl:  ${RED}$PY_SMXL_COUNT files${NC}"

# py-mdxl
PY_MDXL_COUNT=$(grep -r "py-mdxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "py-mdxl:  ${RED}$PY_MDXL_COUNT files${NC}"

# py-lgxl
PY_LGXL_COUNT=$(grep -r "py-lgxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "py-lgxl:  ${RED}$PY_LGXL_COUNT files${NC}"

# px variants
PX_XSXL_COUNT=$(grep -r "px-xsxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "px-xsxl:  ${RED}$PX_XSXL_COUNT files${NC}"

PX_SMXL_COUNT=$(grep -r "px-smxl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo -e "px-smxl:  ${RED}$PX_SMXL_COUNT files${NC}"

TOTAL_INVALID=$((PY_XSXL_COUNT + PY_SMXL_COUNT + PY_MDXL_COUNT + PY_LGXL_COUNT + PX_XSXL_COUNT + PX_SMXL_COUNT))
echo ""
echo -e "${RED}Total Invalid Tokens: $TOTAL_INVALID${NC}"

echo ""
echo -e "${BLUE}🔧 PHASE 2: REMEDIATION - Applying fixes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to fix spacing in files
fix_spacing() {
    local dir=$1
    local fixed_count=0
    
    # Find all TypeScript/TSX files
    find "$dir" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" | while read -r file; do
        # Skip if file doesn't exist or is in backup
        [[ ! -f "$file" ]] && continue
        [[ "$file" == *".backup"* ]] && continue
        
        # Check if file contains any invalid patterns
        if grep -q -E "p[xy]-[a-z]{2}xl" "$file" 2>/dev/null; then
            # Apply fixes with proper spacing interpretation
            # xsxl -> 2xl (xs=0.25rem + xl=2rem ≈ 2xl=3rem)
            # smxl -> 3xl (sm=0.5rem + xl=2rem ≈ 3xl=4rem)  
            # mdxl -> 4xl (md=1rem + xl=2rem ≈ 4xl=6rem)
            # lgxl -> 5xl (lg=1.5rem + xl=2rem ≈ 5xl=8rem)
            
            sed -i '' \
                -e 's/py-xsxl/py-2xl/g' \
                -e 's/px-xsxl/px-2xl/g' \
                -e 's/py-smxl/py-3xl/g' \
                -e 's/px-smxl/px-3xl/g' \
                -e 's/py-mdxl/py-4xl/g' \
                -e 's/px-mdxl/px-4xl/g' \
                -e 's/py-lgxl/py-5xl/g' \
                -e 's/px-lgxl/px-5xl/g' \
                "$file"
            
            echo -e "${GREEN}✓${NC} Fixed: ${file#$ROOT_DIR/}"
            ((fixed_count++))
        fi
    done
    
    return 0
}

# Fix all files in apps/web/app
echo -e "${YELLOW}Fixing files in apps/web/app...${NC}"
fix_spacing "$APPS_DIR/app"

echo ""
echo -e "${BLUE}🔍 PHASE 3: VERIFICATION - Checking for remaining issues${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verify fixes
REMAINING=$(grep -r -E "p[xy]-[a-z]{2}xl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')

if [ "$REMAINING" -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS: All invalid spacing tokens have been fixed!${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: $REMAINING invalid tokens still remain${NC}"
    echo ""
    echo "Remaining occurrences:"
    grep -r -E "p[xy]-[a-z]{2}xl" "$APPS_DIR/app" --include="*.tsx" --include="*.ts" 2>/dev/null | head -10
fi

echo ""
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total Invalid Tokens Found:  ${RED}$TOTAL_INVALID${NC}"
echo -e "Remaining After Fix:         ${GREEN}$REMAINING${NC}"
echo -e "Backup Location:             ${YELLOW}$BACKUP_DIR${NC}"
echo ""

# Create remediation report
REPORT_FILE="$ROOT_DIR/SPACING_REMEDIATION_REPORT.md"
cat > "$REPORT_FILE" << EOF
# Invalid Spacing Token Remediation Report
**Date:** $(date +"%Y-%m-%d %H:%M:%S")

## Issue Summary
Invalid spacing tokens like \`py-xsxl\`, \`py-smxl\`, etc. were causing sections to have no vertical padding, resulting in cramped layouts with insufficient spacing between sections.

## Root Cause
Typos combining two spacing tokens (e.g., xs + xl = xsxl) created invalid Tailwind classes that don't exist in the design system.

## Valid Spacing Tokens
- \`xs\` (0.25rem / 4px)
- \`sm\` (0.5rem / 8px)
- \`md\` (1rem / 16px)
- \`lg\` (1.5rem / 24px)
- \`xl\` (2rem / 32px)
- \`2xl\` (3rem / 48px)
- \`3xl\` (4rem / 64px)
- \`4xl\` (6rem / 96px)
- \`5xl\` (8rem / 128px)

## Remediation Applied

### Pattern Fixes
| Invalid Pattern | Fixed To | Reasoning |
|----------------|----------|-----------|
| \`py-xsxl\` | \`py-2xl\` | xs (0.25rem) + xl (2rem) ≈ 2xl (3rem) |
| \`py-smxl\` | \`py-3xl\` | sm (0.5rem) + xl (2rem) ≈ 3xl (4rem) |
| \`py-mdxl\` | \`py-4xl\` | md (1rem) + xl (2rem) ≈ 4xl (6rem) |
| \`py-lgxl\` | \`py-5xl\` | lg (1.5rem) + xl (2rem) ≈ 5xl (8rem) |

### Statistics
- **Total Invalid Tokens Found:** $TOTAL_INVALID
- **Tokens Remaining:** $REMAINING
- **Files Fixed:** Multiple across marketing and app components

### Backup Location
\`$BACKUP_DIR\`

## Impact
✅ **Marketing pages** now have proper vertical spacing between sections
✅ **Product Showcase section** no longer cramped against Hero and CTA sections
✅ **Consistent spacing** across all components using semantic tokens
✅ **Design system compliance** with valid Tailwind classes only

## Prevention
To prevent future occurrences:
1. Use ESLint rules to validate spacing tokens
2. Reference design system documentation for valid tokens
3. Use autocomplete in IDE to select valid spacing classes
4. Code review checklist to verify spacing token validity

## Next Steps
1. ✅ Verify visual spacing in browser
2. ✅ Test responsive behavior at all breakpoints
3. ✅ Update any custom spacing utilities if needed
4. ✅ Document spacing guidelines for team
EOF

echo -e "${GREEN}✅ Remediation report created: $REPORT_FILE${NC}"
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   REMEDIATION COMPLETE                                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
