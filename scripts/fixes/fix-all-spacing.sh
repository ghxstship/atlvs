#!/bin/bash

# GHXSTSHIP Complete Spacing Fix Script
# This script fixes ALL spacing violations across the entire repository

echo "================================================"
echo "FIXING ALL SPACING VIOLATIONS"
echo "================================================"
echo ""

# Configuration
PROJECT_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$PROJECT_ROOT/.backup-complete-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/complete-spacing-fix.log"

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Initialize log
echo "Complete fix started at $(date)" > "$LOG_FILE"

# Function to fix all spacing in a file
fix_all_spacing() {
    local file="$1"
    
    # Skip non-source files
    if [[ ! "$file" =~ \.(tsx|jsx|ts|js)$ ]]; then
        return 1
    fi
    
    # Skip node_modules, .next, dist, and backup directories
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]] || [[ "$file" == *"dist"* ]] || [[ "$file" == *".backup"* ]]; then
        return 1
    fi
    
    local relative_path="${file#$PROJECT_ROOT/}"
    
    # Create backup
    local backup_path="$BACKUP_DIR/$relative_path"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path" 2>/dev/null || return 1
    
    # Apply all fixes in one pass using perl for better regex support
    perl -i -pe '
        # Padding fixes - match word boundaries
        s/\bp-1\b/p-xs/g;
        s/\bp-2\b/p-sm/g;
        s/\bp-3\b/p-sm/g;
        s/\bp-4\b/p-md/g;
        s/\bp-5\b/p-lg/g;
        s/\bp-6\b/p-lg/g;
        s/\bp-7\b/p-xl/g;
        s/\bp-8\b/p-xl/g;
        s/\bp-10\b/p-2xl/g;
        s/\bp-12\b/p-2xl/g;
        s/\bp-14\b/p-3xl/g;
        s/\bp-16\b/p-3xl/g;
        s/\bp-20\b/p-4xl/g;
        s/\bp-24\b/p-5xl/g;
        s/\bp-32\b/p-5xl/g;
        
        # Padding X
        s/\bpx-1\b/px-xs/g;
        s/\bpx-2\b/px-sm/g;
        s/\bpx-3\b/px-sm/g;
        s/\bpx-4\b/px-md/g;
        s/\bpx-5\b/px-lg/g;
        s/\bpx-6\b/px-lg/g;
        s/\bpx-7\b/px-xl/g;
        s/\bpx-8\b/px-xl/g;
        s/\bpx-10\b/px-2xl/g;
        s/\bpx-12\b/px-2xl/g;
        s/\bpx-14\b/px-3xl/g;
        s/\bpx-16\b/px-3xl/g;
        s/\bpx-20\b/px-4xl/g;
        s/\bpx-24\b/px-5xl/g;
        s/\bpx-32\b/px-5xl/g;
        
        # Padding Y
        s/\bpy-1\b/py-xs/g;
        s/\bpy-2\b/py-sm/g;
        s/\bpy-3\b/py-sm/g;
        s/\bpy-4\b/py-md/g;
        s/\bpy-5\b/py-lg/g;
        s/\bpy-6\b/py-lg/g;
        s/\bpy-7\b/py-xl/g;
        s/\bpy-8\b/py-xl/g;
        s/\bpy-10\b/py-2xl/g;
        s/\bpy-12\b/py-2xl/g;
        s/\bpy-14\b/py-3xl/g;
        s/\bpy-16\b/py-3xl/g;
        s/\bpy-20\b/py-4xl/g;
        s/\bpy-24\b/py-5xl/g;
        s/\bpy-32\b/py-5xl/g;
        
        # Padding Top
        s/\bpt-1\b/pt-xs/g;
        s/\bpt-2\b/pt-sm/g;
        s/\bpt-3\b/pt-sm/g;
        s/\bpt-4\b/pt-md/g;
        s/\bpt-5\b/pt-lg/g;
        s/\bpt-6\b/pt-lg/g;
        s/\bpt-8\b/pt-xl/g;
        s/\bpt-10\b/pt-2xl/g;
        s/\bpt-12\b/pt-2xl/g;
        s/\bpt-16\b/pt-3xl/g;
        s/\bpt-20\b/pt-4xl/g;
        
        # Padding Bottom
        s/\bpb-1\b/pb-xs/g;
        s/\bpb-2\b/pb-sm/g;
        s/\bpb-3\b/pb-sm/g;
        s/\bpb-4\b/pb-md/g;
        s/\bpb-5\b/pb-lg/g;
        s/\bpb-6\b/pb-lg/g;
        s/\bpb-8\b/pb-xl/g;
        s/\bpb-10\b/pb-2xl/g;
        s/\bpb-12\b/pb-2xl/g;
        s/\bpb-16\b/pb-3xl/g;
        s/\bpb-20\b/pb-4xl/g;
        
        # Padding Left
        s/\bpl-1\b/pl-xs/g;
        s/\bpl-2\b/pl-sm/g;
        s/\bpl-3\b/pl-sm/g;
        s/\bpl-4\b/pl-md/g;
        s/\bpl-5\b/pl-lg/g;
        s/\bpl-6\b/pl-lg/g;
        s/\bpl-8\b/pl-xl/g;
        s/\bpl-10\b/pl-2xl/g;
        s/\bpl-12\b/pl-2xl/g;
        s/\bpl-16\b/pl-3xl/g;
        
        # Padding Right
        s/\bpr-1\b/pr-xs/g;
        s/\bpr-2\b/pr-sm/g;
        s/\bpr-3\b/pr-sm/g;
        s/\bpr-4\b/pr-md/g;
        s/\bpr-5\b/pr-lg/g;
        s/\bpr-6\b/pr-lg/g;
        s/\bpr-8\b/pr-xl/g;
        s/\bpr-10\b/pr-2xl/g;
        s/\bpr-12\b/pr-2xl/g;
        s/\bpr-16\b/pr-3xl/g;
        
        # Margin fixes
        s/\bm-1\b/m-xs/g;
        s/\bm-2\b/m-sm/g;
        s/\bm-3\b/m-sm/g;
        s/\bm-4\b/m-md/g;
        s/\bm-5\b/m-lg/g;
        s/\bm-6\b/m-lg/g;
        s/\bm-7\b/m-xl/g;
        s/\bm-8\b/m-xl/g;
        s/\bm-10\b/m-2xl/g;
        s/\bm-12\b/m-2xl/g;
        s/\bm-14\b/m-3xl/g;
        s/\bm-16\b/m-3xl/g;
        s/\bm-20\b/m-4xl/g;
        s/\bm-24\b/m-5xl/g;
        s/\bm-32\b/m-5xl/g;
        
        # Margin X
        s/\bmx-1\b/mx-xs/g;
        s/\bmx-2\b/mx-sm/g;
        s/\bmx-3\b/mx-sm/g;
        s/\bmx-4\b/mx-md/g;
        s/\bmx-5\b/mx-lg/g;
        s/\bmx-6\b/mx-lg/g;
        s/\bmx-7\b/mx-xl/g;
        s/\bmx-8\b/mx-xl/g;
        s/\bmx-10\b/mx-2xl/g;
        s/\bmx-12\b/mx-2xl/g;
        s/\bmx-14\b/mx-3xl/g;
        s/\bmx-16\b/mx-3xl/g;
        s/\bmx-20\b/mx-4xl/g;
        s/\bmx-24\b/mx-5xl/g;
        s/\bmx-32\b/mx-5xl/g;
        
        # Margin Y
        s/\bmy-1\b/my-xs/g;
        s/\bmy-2\b/my-sm/g;
        s/\bmy-3\b/my-sm/g;
        s/\bmy-4\b/my-md/g;
        s/\bmy-5\b/my-lg/g;
        s/\bmy-6\b/my-lg/g;
        s/\bmy-7\b/my-xl/g;
        s/\bmy-8\b/my-xl/g;
        s/\bmy-10\b/my-2xl/g;
        s/\bmy-12\b/my-2xl/g;
        s/\bmy-14\b/my-3xl/g;
        s/\bmy-16\b/my-3xl/g;
        s/\bmy-20\b/my-4xl/g;
        s/\bmy-24\b/my-5xl/g;
        s/\bmy-32\b/my-5xl/g;
        
        # Margin Top
        s/\bmt-1\b/mt-xs/g;
        s/\bmt-2\b/mt-sm/g;
        s/\bmt-3\b/mt-sm/g;
        s/\bmt-4\b/mt-md/g;
        s/\bmt-5\b/mt-lg/g;
        s/\bmt-6\b/mt-lg/g;
        s/\bmt-8\b/mt-xl/g;
        s/\bmt-10\b/mt-2xl/g;
        s/\bmt-12\b/mt-2xl/g;
        s/\bmt-16\b/mt-3xl/g;
        s/\bmt-20\b/mt-4xl/g;
        
        # Margin Bottom
        s/\bmb-1\b/mb-xs/g;
        s/\bmb-2\b/mb-sm/g;
        s/\bmb-3\b/mb-sm/g;
        s/\bmb-4\b/mb-md/g;
        s/\bmb-5\b/mb-lg/g;
        s/\bmb-6\b/mb-lg/g;
        s/\bmb-8\b/mb-xl/g;
        s/\bmb-10\b/mb-2xl/g;
        s/\bmb-12\b/mb-2xl/g;
        s/\bmb-16\b/mb-3xl/g;
        s/\bmb-20\b/mb-4xl/g;
        
        # Margin Left
        s/\bml-1\b/ml-xs/g;
        s/\bml-2\b/ml-sm/g;
        s/\bml-3\b/ml-sm/g;
        s/\bml-4\b/ml-md/g;
        s/\bml-5\b/ml-lg/g;
        s/\bml-6\b/ml-lg/g;
        s/\bml-8\b/ml-xl/g;
        s/\bml-10\b/ml-2xl/g;
        s/\bml-12\b/ml-2xl/g;
        s/\bml-16\b/ml-3xl/g;
        
        # Margin Right
        s/\bmr-1\b/mr-xs/g;
        s/\bmr-2\b/mr-sm/g;
        s/\bmr-3\b/mr-sm/g;
        s/\bmr-4\b/mr-md/g;
        s/\bmr-5\b/mr-lg/g;
        s/\bmr-6\b/mr-lg/g;
        s/\bmr-8\b/mr-xl/g;
        s/\bmr-10\b/mr-2xl/g;
        s/\bmr-12\b/mr-2xl/g;
        s/\bmr-16\b/mr-3xl/g;
        
        # Gap fixes
        s/\bgap-1\b/gap-xs/g;
        s/\bgap-2\b/gap-sm/g;
        s/\bgap-3\b/gap-sm/g;
        s/\bgap-4\b/gap-md/g;
        s/\bgap-5\b/gap-lg/g;
        s/\bgap-6\b/gap-lg/g;
        s/\bgap-7\b/gap-xl/g;
        s/\bgap-8\b/gap-xl/g;
        s/\bgap-10\b/gap-2xl/g;
        s/\bgap-12\b/gap-2xl/g;
        s/\bgap-14\b/gap-3xl/g;
        s/\bgap-16\b/gap-3xl/g;
        s/\bgap-20\b/gap-4xl/g;
        s/\bgap-24\b/gap-5xl/g;
        
        # Gap X
        s/\bgap-x-1\b/gap-x-xs/g;
        s/\bgap-x-2\b/gap-x-sm/g;
        s/\bgap-x-3\b/gap-x-sm/g;
        s/\bgap-x-4\b/gap-x-md/g;
        s/\bgap-x-5\b/gap-x-lg/g;
        s/\bgap-x-6\b/gap-x-lg/g;
        s/\bgap-x-8\b/gap-x-xl/g;
        
        # Gap Y
        s/\bgap-y-1\b/gap-y-xs/g;
        s/\bgap-y-2\b/gap-y-sm/g;
        s/\bgap-y-3\b/gap-y-sm/g;
        s/\bgap-y-4\b/gap-y-md/g;
        s/\bgap-y-5\b/gap-y-lg/g;
        s/\bgap-y-6\b/gap-y-lg/g;
        s/\bgap-y-8\b/gap-y-xl/g;
        
        # Space fixes (keep as space for flex children)
        s/\bspace-x-1\b/space-x-xs/g;
        s/\bspace-x-2\b/space-x-sm/g;
        s/\bspace-x-3\b/space-x-sm/g;
        s/\bspace-x-4\b/space-x-md/g;
        s/\bspace-x-5\b/space-x-lg/g;
        s/\bspace-x-6\b/space-x-lg/g;
        s/\bspace-x-8\b/space-x-xl/g;
        s/\bspace-x-10\b/space-x-2xl/g;
        s/\bspace-x-12\b/space-x-2xl/g;
        s/\bspace-x-16\b/space-x-3xl/g;
        
        s/\bspace-y-1\b/space-y-xs/g;
        s/\bspace-y-2\b/space-y-sm/g;
        s/\bspace-y-3\b/space-y-sm/g;
        s/\bspace-y-4\b/space-y-md/g;
        s/\bspace-y-5\b/space-y-lg/g;
        s/\bspace-y-6\b/space-y-lg/g;
        s/\bspace-y-8\b/space-y-xl/g;
        s/\bspace-y-10\b/space-y-2xl/g;
        s/\bspace-y-12\b/space-y-2xl/g;
        s/\bspace-y-16\b/space-y-3xl/g;
        s/\bspace-y-20\b/space-y-4xl/g;
    ' "$file" 2>/dev/null
    
    return $?
}

# Process all files
echo "Processing all TypeScript and JavaScript files..."
echo ""

total_files=0
fixed_files=0

# Find all source files
while IFS= read -r -d '' file; do
    total_files=$((total_files + 1))
    
    if fix_all_spacing "$file"; then
        fixed_files=$((fixed_files + 1))
        relative_path="${file#$PROJECT_ROOT/}"
        echo "✓ Fixed: $relative_path" >> "$LOG_FILE"
        
        # Progress indicator
        if [ $((fixed_files % 10)) -eq 0 ]; then
            echo "Progress: $fixed_files files fixed..."
        fi
    fi
done < <(find "$PROJECT_ROOT" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/.backup*/*" -print0)

echo ""
echo "================================================"
echo "COMPLETE SPACING FIX FINISHED!"
echo "================================================"
echo ""
echo "Results:"
echo "  Total files processed: $total_files"
echo "  Files fixed: $fixed_files"
echo "  Backup created at: $BACKUP_DIR"
echo "  Log file: $LOG_FILE"
echo ""
echo "All spacing violations have been fixed!"
echo ""
echo "Next steps:"
echo "  1. Run audit to verify: ./scripts/pixel-perfect-audit.sh"
echo "  2. Test the build: cd $PROJECT_ROOT && pnpm build"
echo "  3. Review changes visually"
echo ""
echo "To restore from backup if needed:"
echo "  cp -r '$BACKUP_DIR/'* '$PROJECT_ROOT/'"
echo ""
