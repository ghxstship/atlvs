#!/bin/bash

# GHXSTSHIP Zero Tolerance Design Token Fix Application
# Automatically converts all hardcoded design values to semantic design tokens

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
cd "$REPO_ROOT"

echo "🔧 GHXSTSHIP Zero Tolerance Design Token Fixes"
echo "================================================"
echo ""
echo "⚠️  This will modify files in place. Ensure you have a backup or git commit."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

echo ""
echo "🚀 Applying automated fixes..."
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
    files_before=$(find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    # Apply fix
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/$pattern/$replacement/g" {} + 2>/dev/null || true
    
    # Count files after
    files_after=$(find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    files_modified=$((files_before - files_after))
    total_files_modified=$((total_files_modified + files_modified))
    
    echo "    ✓ Modified $files_modified files"
}

# ==========================================
# PADDING FIXES
# ==========================================
echo "📦 Fixing padding values..."
apply_fix '\bp-1\b' 'p-xs' 'p-1 → p-xs'
apply_fix '\bp-2\b' 'p-xs' 'p-2 → p-xs'
apply_fix '\bp-3\b' 'p-sm' 'p-3 → p-sm'
apply_fix '\bp-4\b' 'p-md' 'p-4 → p-md'
apply_fix '\bp-5\b' 'p-md' 'p-5 → p-md'
apply_fix '\bp-6\b' 'p-lg' 'p-6 → p-lg'
apply_fix '\bp-8\b' 'p-xl' 'p-8 → p-xl'
apply_fix '\bp-10\b' 'p-xl' 'p-10 → p-xl'
apply_fix '\bp-12\b' 'p-2xl' 'p-12 → p-2xl'
apply_fix '\bp-16\b' 'p-3xl' 'p-16 → p-3xl'
echo ""

# ==========================================
# HORIZONTAL PADDING FIXES
# ==========================================
echo "📦 Fixing horizontal padding values..."
apply_fix '\bpx-1\b' 'px-xs' 'px-1 → px-xs'
apply_fix '\bpx-2\b' 'px-xs' 'px-2 → px-xs'
apply_fix '\bpx-3\b' 'px-sm' 'px-3 → px-sm'
apply_fix '\bpx-4\b' 'px-md' 'px-4 → px-md'
apply_fix '\bpx-5\b' 'px-md' 'px-5 → px-md'
apply_fix '\bpx-6\b' 'px-lg' 'px-6 → px-lg'
apply_fix '\bpx-8\b' 'px-xl' 'px-8 → px-xl'
apply_fix '\bpx-10\b' 'px-xl' 'px-10 → px-xl'
apply_fix '\bpx-12\b' 'px-2xl' 'px-12 → px-2xl'
echo ""

# ==========================================
# VERTICAL PADDING FIXES
# ==========================================
echo "📦 Fixing vertical padding values..."
apply_fix '\bpy-1\b' 'py-xs' 'py-1 → py-xs'
apply_fix '\bpy-2\b' 'py-xs' 'py-2 → py-xs'
apply_fix '\bpy-3\b' 'py-sm' 'py-3 → py-sm'
apply_fix '\bpy-4\b' 'py-md' 'py-4 → py-md'
apply_fix '\bpy-5\b' 'py-md' 'py-5 → py-md'
apply_fix '\bpy-6\b' 'py-lg' 'py-6 → py-lg'
apply_fix '\bpy-8\b' 'py-xl' 'py-8 → py-xl'
apply_fix '\bpy-10\b' 'py-xl' 'py-10 → py-xl'
apply_fix '\bpy-12\b' 'py-2xl' 'py-12 → py-2xl'
echo ""

# ==========================================
# MARGIN FIXES
# ==========================================
echo "📏 Fixing margin values..."
apply_fix '\bm-1\b' 'm-xs' 'm-1 → m-xs'
apply_fix '\bm-2\b' 'm-xs' 'm-2 → m-xs'
apply_fix '\bm-3\b' 'm-sm' 'm-3 → m-sm'
apply_fix '\bm-4\b' 'm-md' 'm-4 → m-md'
apply_fix '\bm-5\b' 'm-md' 'm-5 → m-md'
apply_fix '\bm-6\b' 'm-lg' 'm-6 → m-lg'
apply_fix '\bm-8\b' 'm-xl' 'm-8 → m-xl'
apply_fix '\bm-10\b' 'm-xl' 'm-10 → m-xl'
apply_fix '\bm-12\b' 'm-2xl' 'm-12 → m-2xl'
echo ""

# ==========================================
# HORIZONTAL MARGIN FIXES
# ==========================================
echo "📏 Fixing horizontal margin values..."
apply_fix '\bmx-1\b' 'mx-xs' 'mx-1 → mx-xs'
apply_fix '\bmx-2\b' 'mx-xs' 'mx-2 → mx-xs'
apply_fix '\bmx-3\b' 'mx-sm' 'mx-3 → mx-sm'
apply_fix '\bmx-4\b' 'mx-md' 'mx-4 → mx-md'
apply_fix '\bmx-5\b' 'mx-md' 'mx-5 → mx-md'
apply_fix '\bmx-6\b' 'mx-lg' 'mx-6 → mx-lg'
apply_fix '\bmx-8\b' 'mx-xl' 'mx-8 → mx-xl'
echo ""

# ==========================================
# VERTICAL MARGIN FIXES
# ==========================================
echo "📏 Fixing vertical margin values..."
apply_fix '\bmy-1\b' 'my-xs' 'my-1 → my-xs'
apply_fix '\bmy-2\b' 'my-xs' 'my-2 → my-xs'
apply_fix '\bmy-3\b' 'my-sm' 'my-3 → my-sm'
apply_fix '\bmy-4\b' 'my-md' 'my-4 → my-md'
apply_fix '\bmy-5\b' 'my-md' 'my-5 → my-md'
apply_fix '\bmy-6\b' 'my-lg' 'my-6 → my-lg'
apply_fix '\bmy-8\b' 'my-xl' 'my-8 → my-xl'
echo ""

# ==========================================
# GAP FIXES
# ==========================================
echo "🔲 Fixing gap values..."
apply_fix '\bgap-1\b' 'gap-xs' 'gap-1 → gap-xs'
apply_fix '\bgap-2\b' 'gap-xs' 'gap-2 → gap-xs'
apply_fix '\bgap-3\b' 'gap-sm' 'gap-3 → gap-sm'
apply_fix '\bgap-4\b' 'gap-md' 'gap-4 → gap-md'
apply_fix '\bgap-5\b' 'gap-md' 'gap-5 → gap-md'
apply_fix '\bgap-6\b' 'gap-lg' 'gap-6 → gap-lg'
apply_fix '\bgap-8\b' 'gap-xl' 'gap-8 → gap-xl'
apply_fix '\bgap-10\b' 'gap-xl' 'gap-10 → gap-xl'
apply_fix '\bgap-12\b' 'gap-2xl' 'gap-12 → gap-2xl'
echo ""

# ==========================================
# HORIZONTAL SPACE FIXES
# ==========================================
echo "↔️  Fixing horizontal space values..."
apply_fix '\bspace-x-1\b' 'space-x-xs' 'space-x-1 → space-x-xs'
apply_fix '\bspace-x-2\b' 'space-x-xs' 'space-x-2 → space-x-xs'
apply_fix '\bspace-x-3\b' 'space-x-sm' 'space-x-3 → space-x-sm'
apply_fix '\bspace-x-4\b' 'space-x-md' 'space-x-4 → space-x-md'
apply_fix '\bspace-x-5\b' 'space-x-md' 'space-x-5 → space-x-md'
apply_fix '\bspace-x-6\b' 'space-x-lg' 'space-x-6 → space-x-lg'
apply_fix '\bspace-x-8\b' 'space-x-xl' 'space-x-8 → space-x-xl'
echo ""

# ==========================================
# VERTICAL SPACE FIXES
# ==========================================
echo "↕️  Fixing vertical space values..."
apply_fix '\bspace-y-1\b' 'space-y-xs' 'space-y-1 → space-y-xs'
apply_fix '\bspace-y-2\b' 'space-y-xs' 'space-y-2 → space-y-xs'
apply_fix '\bspace-y-3\b' 'space-y-sm' 'space-y-3 → space-y-sm'
apply_fix '\bspace-y-4\b' 'space-y-md' 'space-y-4 → space-y-md'
apply_fix '\bspace-y-5\b' 'space-y-md' 'space-y-5 → space-y-md'
apply_fix '\bspace-y-6\b' 'space-y-lg' 'space-y-6 → space-y-lg'
apply_fix '\bspace-y-8\b' 'space-y-xl' 'space-y-8 → space-y-xl'
apply_fix '\bspace-y-10\b' 'space-y-xl' 'space-y-10 → space-y-xl'
apply_fix '\bspace-y-12\b' 'space-y-2xl' 'space-y-12 → space-y-2xl'
echo ""

# ==========================================
# TOP/RIGHT/BOTTOM/LEFT PADDING FIXES
# ==========================================
echo "📦 Fixing directional padding values..."
apply_fix '\bpt-1\b' 'pt-xs' 'pt-1 → pt-xs'
apply_fix '\bpt-2\b' 'pt-xs' 'pt-2 → pt-xs'
apply_fix '\bpt-3\b' 'pt-sm' 'pt-3 → pt-sm'
apply_fix '\bpt-4\b' 'pt-md' 'pt-4 → pt-md'
apply_fix '\bpt-6\b' 'pt-lg' 'pt-6 → pt-lg'
apply_fix '\bpt-8\b' 'pt-xl' 'pt-8 → pt-xl'

apply_fix '\bpr-1\b' 'pr-xs' 'pr-1 → pr-xs'
apply_fix '\bpr-2\b' 'pr-xs' 'pr-2 → pr-xs'
apply_fix '\bpr-3\b' 'pr-sm' 'pr-3 → pr-sm'
apply_fix '\bpr-4\b' 'pr-md' 'pr-4 → pr-md'
apply_fix '\bpr-6\b' 'pr-lg' 'pr-6 → pr-lg'
apply_fix '\bpr-8\b' 'pr-xl' 'pr-8 → pr-xl'

apply_fix '\bpb-1\b' 'pb-xs' 'pb-1 → pb-xs'
apply_fix '\bpb-2\b' 'pb-xs' 'pb-2 → pb-xs'
apply_fix '\bpb-3\b' 'pb-sm' 'pb-3 → pb-sm'
apply_fix '\bpb-4\b' 'pb-md' 'pb-4 → pb-md'
apply_fix '\bpb-6\b' 'pb-lg' 'pb-6 → pb-lg'
apply_fix '\bpb-8\b' 'pb-xl' 'pb-8 → pb-xl'

apply_fix '\bpl-1\b' 'pl-xs' 'pl-1 → pl-xs'
apply_fix '\bpl-2\b' 'pl-xs' 'pl-2 → pl-xs'
apply_fix '\bpl-3\b' 'pl-sm' 'pl-3 → pl-sm'
apply_fix '\bpl-4\b' 'pl-md' 'pl-4 → pl-md'
apply_fix '\bpl-6\b' 'pl-lg' 'pl-6 → pl-lg'
apply_fix '\bpl-8\b' 'pl-xl' 'pl-8 → pl-xl'
echo ""

# ==========================================
# TOP/RIGHT/BOTTOM/LEFT MARGIN FIXES
# ==========================================
echo "📏 Fixing directional margin values..."
apply_fix '\bmt-1\b' 'mt-xs' 'mt-1 → mt-xs'
apply_fix '\bmt-2\b' 'mt-xs' 'mt-2 → mt-xs'
apply_fix '\bmt-3\b' 'mt-sm' 'mt-3 → mt-sm'
apply_fix '\bmt-4\b' 'mt-md' 'mt-4 → mt-md'
apply_fix '\bmt-6\b' 'mt-lg' 'mt-6 → mt-lg'
apply_fix '\bmt-8\b' 'mt-xl' 'mt-8 → mt-xl'

apply_fix '\bmr-1\b' 'mr-xs' 'mr-1 → mr-xs'
apply_fix '\bmr-2\b' 'mr-xs' 'mr-2 → mr-xs'
apply_fix '\bmr-3\b' 'mr-sm' 'mr-3 → mr-sm'
apply_fix '\bmr-4\b' 'mr-md' 'mr-4 → mr-md'
apply_fix '\bmr-6\b' 'mr-lg' 'mr-6 → mr-lg'
apply_fix '\bmr-8\b' 'mr-xl' 'mr-8 → mr-xl'

apply_fix '\bmb-1\b' 'mb-xs' 'mb-1 → mb-xs'
apply_fix '\bmb-2\b' 'mb-xs' 'mb-2 → mb-xs'
apply_fix '\bmb-3\b' 'mb-sm' 'mb-3 → mb-sm'
apply_fix '\bmb-4\b' 'mb-md' 'mb-4 → mb-md'
apply_fix '\bmb-6\b' 'mb-lg' 'mb-6 → mb-lg'
apply_fix '\bmb-8\b' 'mb-xl' 'mb-8 → mb-xl'

apply_fix '\bml-1\b' 'ml-xs' 'ml-1 → ml-xs'
apply_fix '\bml-2\b' 'ml-xs' 'ml-2 → ml-xs'
apply_fix '\bml-3\b' 'ml-sm' 'ml-3 → ml-sm'
apply_fix '\bml-4\b' 'ml-md' 'ml-4 → ml-md'
apply_fix '\bml-6\b' 'ml-lg' 'ml-6 → ml-lg'
apply_fix '\bml-8\b' 'ml-xl' 'ml-8 → ml-xl'
echo ""

# ==========================================
# GAP-X AND GAP-Y FIXES
# ==========================================
echo "🔲 Fixing gap-x and gap-y values..."
apply_fix '\bgap-x-1\b' 'gap-x-xs' 'gap-x-1 → gap-x-xs'
apply_fix '\bgap-x-2\b' 'gap-x-xs' 'gap-x-2 → gap-x-xs'
apply_fix '\bgap-x-3\b' 'gap-x-sm' 'gap-x-3 → gap-x-sm'
apply_fix '\bgap-x-4\b' 'gap-x-md' 'gap-x-4 → gap-x-md'
apply_fix '\bgap-x-6\b' 'gap-x-lg' 'gap-x-6 → gap-x-lg'
apply_fix '\bgap-x-8\b' 'gap-x-xl' 'gap-x-8 → gap-x-xl'

apply_fix '\bgap-y-1\b' 'gap-y-xs' 'gap-y-1 → gap-y-xs'
apply_fix '\bgap-y-2\b' 'gap-y-xs' 'gap-y-2 → gap-y-xs'
apply_fix '\bgap-y-3\b' 'gap-y-sm' 'gap-y-3 → gap-y-sm'
apply_fix '\bgap-y-4\b' 'gap-y-md' 'gap-y-4 → gap-y-md'
apply_fix '\bgap-y-6\b' 'gap-y-lg' 'gap-y-6 → gap-y-lg'
apply_fix '\bgap-y-8\b' 'gap-y-xl' 'gap-y-8 → gap-y-xl'
echo ""

echo "================================================"
echo "✅ Design token fixes applied successfully!"
echo ""
echo "📊 Summary:"
echo "  Total files modified: $total_files_modified"
echo ""
echo "📝 Next Steps:"
echo "  1. Review changes with: git diff"
echo "  2. Test the application thoroughly"
echo "  3. Run build to verify no errors"
echo "  4. Commit changes with: git add . && git commit -m 'fix: convert hardcoded design values to semantic tokens'"
echo ""
