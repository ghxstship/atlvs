#!/bin/bash

# GHXSTSHIP Pixel-Perfect UI Normalization Fix Script V2
# Enhanced version with better file handling and comprehensive fixes

echo "================================================"
echo "GHXSTSHIP PIXEL-PERFECT UI NORMALIZATION FIX V2"
echo "================================================"
echo ""

# Configuration
PROJECT_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$PROJECT_ROOT/.backup-v2-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/pixel-perfect-fix-v2.log"
FIXED_COUNT=0
TOTAL_COUNT=0

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Initialize log
echo "Fix started at $(date)" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Function to fix a single file
fix_file() {
    local file="$1"
    local relative_path="${file#$PROJECT_ROOT/}"
    
    # Skip non-source files
    if [[ ! "$file" =~ \.(tsx|jsx|ts|js)$ ]]; then
        return 1
    fi
    
    # Skip node_modules, .next, dist
    if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]] || [[ "$file" == *"dist"* ]]; then
        return 1
    fi
    
    # Create backup
    local backup_path="$BACKUP_DIR/$relative_path"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path" 2>/dev/null || return 1
    
    # Create temp file for modifications
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file" 2>/dev/null || return 1
    
    # Apply comprehensive fixes using sed
    # Note: Using extended regex (-E) for better pattern matching
    
    # Fix padding classes
    sed -i '' -E 's/\bp-1\b/p-xs/g' "$temp_file"
    sed -i '' -E 's/\bp-2\b/p-sm/g' "$temp_file"
    sed -i '' -E 's/\bp-3\b/p-sm/g' "$temp_file"
    sed -i '' -E 's/\bp-4\b/p-md/g' "$temp_file"
    sed -i '' -E 's/\bp-5\b/p-lg/g' "$temp_file"
    sed -i '' -E 's/\bp-6\b/p-lg/g' "$temp_file"
    sed -i '' -E 's/\bp-8\b/p-xl/g' "$temp_file"
    sed -i '' -E 's/\bp-10\b/p-2xl/g' "$temp_file"
    sed -i '' -E 's/\bp-12\b/p-2xl/g' "$temp_file"
    sed -i '' -E 's/\bp-16\b/p-3xl/g' "$temp_file"
    sed -i '' -E 's/\bp-20\b/p-4xl/g' "$temp_file"
    sed -i '' -E 's/\bp-24\b/p-5xl/g' "$temp_file"
    
    # Fix padding-x classes
    sed -i '' -E 's/\bpx-1\b/px-xs/g' "$temp_file"
    sed -i '' -E 's/\bpx-2\b/px-sm/g' "$temp_file"
    sed -i '' -E 's/\bpx-3\b/px-sm/g' "$temp_file"
    sed -i '' -E 's/\bpx-4\b/px-md/g' "$temp_file"
    sed -i '' -E 's/\bpx-5\b/px-lg/g' "$temp_file"
    sed -i '' -E 's/\bpx-6\b/px-lg/g' "$temp_file"
    sed -i '' -E 's/\bpx-8\b/px-xl/g' "$temp_file"
    sed -i '' -E 's/\bpx-10\b/px-2xl/g' "$temp_file"
    sed -i '' -E 's/\bpx-12\b/px-2xl/g' "$temp_file"
    sed -i '' -E 's/\bpx-16\b/px-3xl/g' "$temp_file"
    sed -i '' -E 's/\bpx-20\b/px-4xl/g' "$temp_file"
    
    # Fix padding-y classes
    sed -i '' -E 's/\bpy-1\b/py-xs/g' "$temp_file"
    sed -i '' -E 's/\bpy-2\b/py-sm/g' "$temp_file"
    sed -i '' -E 's/\bpy-3\b/py-sm/g' "$temp_file"
    sed -i '' -E 's/\bpy-4\b/py-md/g' "$temp_file"
    sed -i '' -E 's/\bpy-5\b/py-lg/g' "$temp_file"
    sed -i '' -E 's/\bpy-6\b/py-lg/g' "$temp_file"
    sed -i '' -E 's/\bpy-8\b/py-xl/g' "$temp_file"
    sed -i '' -E 's/\bpy-10\b/py-2xl/g' "$temp_file"
    sed -i '' -E 's/\bpy-12\b/py-2xl/g' "$temp_file"
    sed -i '' -E 's/\bpy-16\b/py-3xl/g' "$temp_file"
    sed -i '' -E 's/\bpy-20\b/py-4xl/g' "$temp_file"
    sed -i '' -E 's/\bpy-24\b/py-5xl/g' "$temp_file"
    
    # Fix margin classes
    sed -i '' -E 's/\bm-1\b/m-xs/g' "$temp_file"
    sed -i '' -E 's/\bm-2\b/m-sm/g' "$temp_file"
    sed -i '' -E 's/\bm-3\b/m-sm/g' "$temp_file"
    sed -i '' -E 's/\bm-4\b/m-md/g' "$temp_file"
    sed -i '' -E 's/\bm-5\b/m-lg/g' "$temp_file"
    sed -i '' -E 's/\bm-6\b/m-lg/g' "$temp_file"
    sed -i '' -E 's/\bm-8\b/m-xl/g' "$temp_file"
    sed -i '' -E 's/\bm-10\b/m-2xl/g' "$temp_file"
    sed -i '' -E 's/\bm-12\b/m-2xl/g' "$temp_file"
    sed -i '' -E 's/\bm-16\b/m-3xl/g' "$temp_file"
    sed -i '' -E 's/\bm-20\b/m-4xl/g' "$temp_file"
    
    # Fix margin-x classes
    sed -i '' -E 's/\bmx-1\b/mx-xs/g' "$temp_file"
    sed -i '' -E 's/\bmx-2\b/mx-sm/g' "$temp_file"
    sed -i '' -E 's/\bmx-3\b/mx-sm/g' "$temp_file"
    sed -i '' -E 's/\bmx-4\b/mx-md/g' "$temp_file"
    sed -i '' -E 's/\bmx-5\b/mx-lg/g' "$temp_file"
    sed -i '' -E 's/\bmx-6\b/mx-lg/g' "$temp_file"
    sed -i '' -E 's/\bmx-8\b/mx-xl/g' "$temp_file"
    
    # Fix margin-y classes
    sed -i '' -E 's/\bmy-1\b/my-xs/g' "$temp_file"
    sed -i '' -E 's/\bmy-2\b/my-sm/g' "$temp_file"
    sed -i '' -E 's/\bmy-3\b/my-sm/g' "$temp_file"
    sed -i '' -E 's/\bmy-4\b/my-md/g' "$temp_file"
    sed -i '' -E 's/\bmy-5\b/my-lg/g' "$temp_file"
    sed -i '' -E 's/\bmy-6\b/my-lg/g' "$temp_file"
    sed -i '' -E 's/\bmy-8\b/my-xl/g' "$temp_file"
    sed -i '' -E 's/\bmy-10\b/my-2xl/g' "$temp_file"
    sed -i '' -E 's/\bmy-12\b/my-2xl/g' "$temp_file"
    sed -i '' -E 's/\bmy-16\b/my-3xl/g' "$temp_file"
    sed -i '' -E 's/\bmy-20\b/my-4xl/g' "$temp_file"
    
    # Fix gap classes
    sed -i '' -E 's/\bgap-1\b/gap-xs/g' "$temp_file"
    sed -i '' -E 's/\bgap-2\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bgap-3\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bgap-4\b/gap-md/g' "$temp_file"
    sed -i '' -E 's/\bgap-5\b/gap-lg/g' "$temp_file"
    sed -i '' -E 's/\bgap-6\b/gap-lg/g' "$temp_file"
    sed -i '' -E 's/\bgap-8\b/gap-xl/g' "$temp_file"
    sed -i '' -E 's/\bgap-10\b/gap-2xl/g' "$temp_file"
    sed -i '' -E 's/\bgap-12\b/gap-2xl/g' "$temp_file"
    sed -i '' -E 's/\bgap-16\b/gap-3xl/g' "$temp_file"
    
    # Fix space classes (convert to gap)
    sed -i '' -E 's/\bspace-x-1\b/gap-xs/g' "$temp_file"
    sed -i '' -E 's/\bspace-x-2\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bspace-x-3\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bspace-x-4\b/gap-md/g' "$temp_file"
    sed -i '' -E 's/\bspace-x-6\b/gap-lg/g' "$temp_file"
    sed -i '' -E 's/\bspace-x-8\b/gap-xl/g' "$temp_file"
    
    sed -i '' -E 's/\bspace-y-1\b/gap-xs/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-2\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-3\b/gap-sm/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-4\b/gap-md/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-6\b/gap-lg/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-8\b/gap-xl/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-10\b/gap-2xl/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-12\b/gap-2xl/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-16\b/gap-3xl/g' "$temp_file"
    sed -i '' -E 's/\bspace-y-20\b/gap-4xl/g' "$temp_file"
    
    # Check if file was modified
    if ! cmp -s "$file" "$temp_file" 2>/dev/null; then
        mv "$temp_file" "$file"
        echo "Fixed: $relative_path" >> "$LOG_FILE"
        return 0
    else
        rm -f "$temp_file"
        return 1
    fi
}

# Process top violating files first
echo "Processing high-priority files..."
priority_files=(
    "$PROJECT_ROOT/packages/ui/src/system/ContainerSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/WorkflowSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/DesignTokenValidator.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/GridSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/LayoutSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/CompositePatterns.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/ComponentSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/UniversalDrawer.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/PerformanceMonitor.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/Navigation.tsx"
)

for file in "${priority_files[@]}"; do
    if [ -f "$file" ]; then
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        if fix_file "$file"; then
            FIXED_COUNT=$((FIXED_COUNT + 1))
            echo "✓ Fixed priority file: $(basename "$file")"
        fi
    fi
done

echo ""
echo "Processing all TypeScript/JavaScript files..."

# Find and process all source files
while IFS= read -r -d '' file; do
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    if fix_file "$file"; then
        FIXED_COUNT=$((FIXED_COUNT + 1))
        echo -n "."
        
        # Progress indicator
        if [ $((FIXED_COUNT % 50)) -eq 0 ]; then
            echo " ($FIXED_COUNT files fixed)"
        fi
    fi
done < <(find "$PROJECT_ROOT" -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" -not -path "*/.backup*/*" -print0)

echo ""
echo ""
echo "================================================"
echo "Fix Complete!"
echo "Total files processed: $TOTAL_COUNT"
echo "Files fixed: $FIXED_COUNT"
echo "Backup created at: $BACKUP_DIR"
echo "Log file: $LOG_FILE"
echo "================================================"
echo ""
echo "Summary of changes:"
echo "  - Padding: p-[0-9] → p-xs/sm/md/lg/xl/2xl/3xl/4xl/5xl"
echo "  - Margin: m-[0-9] → m-xs/sm/md/lg/xl/2xl/3xl/4xl"
echo "  - Gap: gap-[0-9] → gap-xs/sm/md/lg/xl/2xl/3xl"
echo "  - Space: space-[xy]-[0-9] → gap-xs/sm/md/lg/xl/2xl/3xl/4xl"
echo ""
echo "To restore from backup, run:"
echo "  cp -r '$BACKUP_DIR/'* '$PROJECT_ROOT/'"
echo ""
