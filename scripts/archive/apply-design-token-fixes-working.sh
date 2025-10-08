#!/bin/bash

# GHXSTSHIP Zero Tolerance Design Token Fix Application (WORKING VERSION)
# Automatically converts all hardcoded design values to semantic design tokens

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🔧 GHXSTSHIP Zero Tolerance Design Token Fixes"
echo "================================================"
echo ""
echo "🚀 Applying automated fixes..."
echo ""

# Counter for tracking changes
total_files_modified=0

# Function to apply fix - uses character class boundaries instead of \b
apply_fix() {
    local pattern=$1
    local replacement=$2
    local description=$3
    
    echo "  → Fixing: $description"
    
    # Count files before
    files_before=$(find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    # Apply fix using character class boundaries
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | while IFS= read -r file; do
        sed -i '' "s/\([^-]\)${pattern}\([^0-9-]\)/\1${replacement}\2/g" "$file" 2>/dev/null || true
        # Also catch start of string and end of string
        sed -i '' "s/^${pattern}\([^0-9-]\)/${replacement}\1/g" "$file" 2>/dev/null || true
        sed -i '' "s/\([^-]\)${pattern}$/\1${replacement}/g" "$file" 2>/dev/null || true
    done
    
    # Count files after
    files_after=$(find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' ')
    
    files_modified=$((files_before - files_after))
    total_files_modified=$((total_files_modified + files_modified))
    
    echo "    ✓ Modified $files_modified files (Before: $files_before, After: $files_after)"
}

# ==========================================
# PADDING FIXES
# ==========================================
echo "📦 Fixing padding values..."
apply_fix 'p-1' 'p-xs' 'p-1 → p-xs'
apply_fix 'p-2' 'p-xs' 'p-2 → p-xs'
apply_fix 'p-3' 'p-sm' 'p-3 → p-sm'
apply_fix 'p-4' 'p-md' 'p-4 → p-md'
apply_fix 'p-5' 'p-md' 'p-5 → p-md'
apply_fix 'p-6' 'p-lg' 'p-6 → p-lg'
apply_fix 'p-8' 'p-xl' 'p-8 → p-xl'
apply_fix 'p-10' 'p-xl' 'p-10 → p-xl'
apply_fix 'p-12' 'p-2xl' 'p-12 → p-2xl'
apply_fix 'p-16' 'p-3xl' 'p-16 → p-3xl'
echo ""

# ==========================================
# HORIZONTAL PADDING FIXES
# ==========================================
echo "📦 Fixing horizontal padding values..."
apply_fix 'px-1' 'px-xs' 'px-1 → px-xs'
apply_fix 'px-2' 'px-xs' 'px-2 → px-xs'
apply_fix 'px-3' 'px-sm' 'px-3 → px-sm'
apply_fix 'px-4' 'px-md' 'px-4 → px-md'
apply_fix 'px-5' 'px-md' 'px-5 → px-md'
apply_fix 'px-6' 'px-lg' 'px-6 → px-lg'
apply_fix 'px-8' 'px-xl' 'px-8 → px-xl'
apply_fix 'px-10' 'px-xl' 'px-10 → px-xl'
apply_fix 'px-12' 'px-2xl' 'px-12 → px-2xl'
echo ""

# ==========================================
# VERTICAL PADDING FIXES
# ==========================================
echo "📦 Fixing vertical padding values..."
apply_fix 'py-1' 'py-xs' 'py-1 → py-xs'
apply_fix 'py-2' 'py-xs' 'py-2 → py-xs'
apply_fix 'py-3' 'py-sm' 'py-3 → py-sm'
apply_fix 'py-4' 'py-md' 'py-4 → py-md'
apply_fix 'py-5' 'py-md' 'py-5 → py-md'
apply_fix 'py-6' 'py-lg' 'py-6 → py-lg'
apply_fix 'py-8' 'py-xl' 'py-8 → py-xl'
apply_fix 'py-10' 'py-xl' 'py-10 → py-xl'
apply_fix 'py-12' 'py-2xl' 'py-12 → py-2xl'
echo ""

# ==========================================
# GAP FIXES
# ==========================================
echo "🔲 Fixing gap values..."
apply_fix 'gap-1' 'gap-xs' 'gap-1 → gap-xs'
apply_fix 'gap-2' 'gap-xs' 'gap-2 → gap-xs'
apply_fix 'gap-3' 'gap-sm' 'gap-3 → gap-sm'
apply_fix 'gap-4' 'gap-md' 'gap-4 → gap-md'
apply_fix 'gap-5' 'gap-md' 'gap-5 → gap-md'
apply_fix 'gap-6' 'gap-lg' 'gap-6 → gap-lg'
apply_fix 'gap-8' 'gap-xl' 'gap-8 → gap-xl'
apply_fix 'gap-10' 'gap-xl' 'gap-10 → gap-xl'
apply_fix 'gap-12' 'gap-2xl' 'gap-12 → gap-2xl'
echo ""

# ==========================================
# HORIZONTAL SPACE FIXES
# ==========================================
echo "↔️  Fixing horizontal space values..."
apply_fix 'space-x-1' 'space-x-xs' 'space-x-1 → space-x-xs'
apply_fix 'space-x-2' 'space-x-xs' 'space-x-2 → space-x-xs'
apply_fix 'space-x-3' 'space-x-sm' 'space-x-3 → space-x-sm'
apply_fix 'space-x-4' 'space-x-md' 'space-x-4 → space-x-md'
apply_fix 'space-x-5' 'space-x-md' 'space-x-5 → space-x-md'
apply_fix 'space-x-6' 'space-x-lg' 'space-x-6 → space-x-lg'
apply_fix 'space-x-8' 'space-x-xl' 'space-x-8 → space-x-xl'
echo ""

# ==========================================
# VERTICAL SPACE FIXES
# ==========================================
echo "↕️  Fixing vertical space values..."
apply_fix 'space-y-1' 'space-y-xs' 'space-y-1 → space-y-xs'
apply_fix 'space-y-2' 'space-y-xs' 'space-y-2 → space-y-xs'
apply_fix 'space-y-3' 'space-y-sm' 'space-y-3 → space-y-sm'
apply_fix 'space-y-4' 'space-y-md' 'space-y-4 → space-y-md'
apply_fix 'space-y-5' 'space-y-md' 'space-y-5 → space-y-md'
apply_fix 'space-y-6' 'space-y-lg' 'space-y-6 → space-y-lg'
apply_fix 'space-y-8' 'space-y-xl' 'space-y-8 → space-y-xl'
apply_fix 'space-y-10' 'space-y-xl' 'space-y-10 → space-y-xl'
apply_fix 'space-y-12' 'space-y-2xl' 'space-y-12 → space-y-2xl'
echo ""

echo "================================================"
echo "✅ Design token fixes applied successfully!"
echo ""
echo "📊 Summary:"
echo "  Total files modified: $total_files_modified"
echo ""
echo "📝 Next Steps:"
echo "  1. Review changes with: git diff --stat"
echo "  2. Test the application thoroughly"
echo "  3. Run build to verify no errors"
echo "  4. Commit changes"
echo ""
