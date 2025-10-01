#!/bin/bash

# ATLVS Layout Normalization - Automated Remediation
# Zero Tolerance: Convert all hardcoded layouts to semantic tokens

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🔧 ATLVS LAYOUT NORMALIZATION - AUTOMATED REMEDIATION"
echo "======================================================"
echo "Zero Tolerance: 100% Normalized UI Components"
echo ""
echo "⚠️  This will modify files in place. Ensure you have a clean git state."
echo ""
echo "Starting Phase 1: Critical P0 Violations"
echo ""

# Counter for tracking changes
total_files_modified=0

# Function to apply fix and count
apply_fix() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo "  → Fixing: $description"
    
    # Count files before
    files_before=$(find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    # Apply fix using character class boundaries
    find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | while IFS= read -r file; do
        sed -i '' "s/\([^-]\)${pattern}\([^0-9-]\)/\1${replacement}\2/g" "$file" 2>/dev/null || true
        # Also catch start of string and end of string
        sed -i '' "s/^${pattern}\([^0-9-]\)/${replacement}\1/g" "$file" 2>/dev/null || true
        sed -i '' "s/\([^-]\)${pattern}$/\1${replacement}/g" "$file" 2>/dev/null || true
    done
    
    # Count files after
    files_after=$(find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    files_modified=$((files_before - files_after))
    total_files_modified=$((total_files_modified + files_modified))
    
    echo "    ✓ Modified $files_modified files (Before: $files_before, After: $files_after)"
}

echo "📊 PHASE 1: ICON SIZES (w-4 through w-12, h-4 through h-12)"
echo "============================================================"
echo ""
echo "Converting to semantic icon size tokens..."
echo ""

# Icon widths
apply_fix 'w-4' 'w-icon-xs' 'w-4 → w-icon-xs (16px)'
apply_fix 'w-5' 'w-icon-sm' 'w-5 → w-icon-sm (20px)'
apply_fix 'w-6' 'w-icon-md' 'w-6 → w-icon-md (24px)'
apply_fix 'w-8' 'w-icon-lg' 'w-8 → w-icon-lg (32px)'
apply_fix 'w-10' 'w-icon-xl' 'w-10 → w-icon-xl (40px)'
apply_fix 'w-12' 'w-icon-2xl' 'w-12 → w-icon-2xl (48px)'

# Icon heights
apply_fix 'h-4' 'h-icon-xs' 'h-4 → h-icon-xs (16px)'
apply_fix 'h-5' 'h-icon-sm' 'h-5 → h-icon-sm (20px)'
apply_fix 'h-6' 'h-icon-md' 'h-6 → h-icon-md (24px)'
apply_fix 'h-8' 'h-icon-lg' 'h-8 → h-icon-lg (32px)'
apply_fix 'h-10' 'h-icon-xl' 'h-10 → h-icon-xl (40px)'
apply_fix 'h-12' 'h-icon-2xl' 'h-12 → h-icon-2xl (48px)'

echo ""
echo "📊 PHASE 2: COMPONENT SIZES (w-16 through w-32, h-16 through h-32)"
echo "=================================================================="
echo ""

# Component widths
apply_fix 'w-16' 'w-component-md' 'w-16 → w-component-md (64px)'
apply_fix 'w-20' 'w-component-lg' 'w-20 → w-component-lg (80px)'
apply_fix 'w-24' 'w-component-lg' 'w-24 → w-component-lg (96px)'
apply_fix 'w-32' 'w-component-xl' 'w-32 → w-component-xl (128px)'

# Component heights
apply_fix 'h-16' 'h-component-md' 'h-16 → h-component-md (64px)'
apply_fix 'h-20' 'h-component-lg' 'h-20 → h-component-lg (80px)'
apply_fix 'h-24' 'h-component-lg' 'h-24 → h-component-lg (96px)'
apply_fix 'h-32' 'h-component-xl' 'h-32 → h-component-xl (128px)'

echo ""
echo "📊 PHASE 3: CONTAINER SIZES (w-48 through w-96, h-48 through h-96)"
echo "=================================================================="
echo ""

# Container widths
apply_fix 'w-48' 'w-container-xs' 'w-48 → w-container-xs (192px)'
apply_fix 'w-56' 'w-container-xs' 'w-56 → w-container-xs (224px)'
apply_fix 'w-64' 'w-container-sm' 'w-64 → w-container-sm (256px)'
apply_fix 'w-72' 'w-container-sm' 'w-72 → w-container-sm (288px)'
apply_fix 'w-80' 'w-container-md' 'w-80 → w-container-md (320px)'
apply_fix 'w-96' 'w-container-lg' 'w-96 → w-container-lg (384px)'

# Container heights
apply_fix 'h-48' 'h-container-xs' 'h-48 → h-container-xs (192px)'
apply_fix 'h-56' 'h-container-xs' 'h-56 → h-container-xs (224px)'
apply_fix 'h-64' 'h-container-sm' 'h-64 → h-container-sm (256px)'
apply_fix 'h-72' 'h-container-sm' 'h-72 → h-container-sm (288px)'
apply_fix 'h-80' 'h-container-md' 'h-80 → h-container-md (320px)'
apply_fix 'h-96' 'h-container-lg' 'h-96 → h-container-lg (384px)'

echo ""
echo "======================================================"
echo "✅ Layout normalization phase 1 complete!"
echo ""
echo "📊 Summary:"
echo "  Total files modified: $total_files_modified"
echo ""
echo "📝 Next Steps:"
echo "  1. Review changes with: git diff --stat"
echo "  2. Run audit again: ./scripts/audit-layout-normalization.sh"
echo "  3. Proceed with Phase 2: Grid/Flex pattern replacements"
echo "  4. Proceed with Phase 3: Inline style removal (manual review required)"
echo ""
echo "⚠️  Note: Inline styles and arbitrary values require manual review"
echo "    Run: grep -r 'style={{' apps/web packages/ui to find instances"
echo ""
