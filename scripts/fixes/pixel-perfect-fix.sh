#!/bin/bash

# GHXSTSHIP Pixel-Perfect UI Normalization Fix Script
# This script automatically fixes spacing, padding, and alignment violations

echo "================================================"
echo "GHXSTSHIP PIXEL-PERFECT UI NORMALIZATION FIX"
echo "================================================"
echo ""

# Configuration
PROJECT_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$PROJECT_ROOT/.backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/pixel-perfect-fix.log"

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Initialize log
echo "Fix started at $(date)" > "$LOG_FILE"

# Function to fix spacing in a file
fix_spacing() {
    local file=$1
    local temp_file="${file}.tmp"
    
    # Create temp file
    cp "$file" "$temp_file"
    
    # Apply all spacing fixes using perl for better regex support
    perl -i -pe '
        # Padding fixes
        s/\bp-1\b/p-xs/g;
        s/\bp-2\b/p-sm/g;
        s/\bp-3\b/p-sm/g;
        s/\bp-4\b/p-md/g;
        s/\bp-5\b/p-lg/g;
        s/\bp-6\b/p-lg/g;
        s/\bp-8\b/p-xl/g;
        s/\bp-10\b/p-2xl/g;
        s/\bp-12\b/p-2xl/g;
        s/\bp-16\b/p-3xl/g;
        s/\bp-20\b/p-4xl/g;
        s/\bp-24\b/p-5xl/g;
        
        # Padding X
        s/\bpx-1\b/px-xs/g;
        s/\bpx-2\b/px-sm/g;
        s/\bpx-3\b/px-sm/g;
        s/\bpx-4\b/px-md/g;
        s/\bpx-5\b/px-lg/g;
        s/\bpx-6\b/px-lg/g;
        s/\bpx-8\b/px-xl/g;
        s/\bpx-10\b/px-2xl/g;
        s/\bpx-12\b/px-2xl/g;
        s/\bpx-16\b/px-3xl/g;
        s/\bpx-20\b/px-4xl/g;
        
        # Padding Y
        s/\bpy-1\b/py-xs/g;
        s/\bpy-2\b/py-sm/g;
        s/\bpy-3\b/py-sm/g;
        s/\bpy-4\b/py-md/g;
        s/\bpy-5\b/py-lg/g;
        s/\bpy-6\b/py-lg/g;
        s/\bpy-8\b/py-xl/g;
        s/\bpy-10\b/py-2xl/g;
        s/\bpy-12\b/py-2xl/g;
        s/\bpy-16\b/py-3xl/g;
        s/\bpy-20\b/py-4xl/g;
        s/\bpy-24\b/py-5xl/g;
        
        # Margin fixes
        s/\bm-1\b/m-xs/g;
        s/\bm-2\b/m-sm/g;
        s/\bm-3\b/m-sm/g;
        s/\bm-4\b/m-md/g;
        s/\bm-5\b/m-lg/g;
        s/\bm-6\b/m-lg/g;
        s/\bm-8\b/m-xl/g;
        s/\bm-10\b/m-2xl/g;
        s/\bm-12\b/m-2xl/g;
        s/\bm-16\b/m-3xl/g;
        s/\bm-20\b/m-4xl/g;
        
        # Margin X
        s/\bmx-1\b/mx-xs/g;
        s/\bmx-2\b/mx-sm/g;
        s/\bmx-3\b/mx-sm/g;
        s/\bmx-4\b/mx-md/g;
        s/\bmx-5\b/mx-lg/g;
        s/\bmx-6\b/mx-lg/g;
        s/\bmx-8\b/mx-xl/g;
        
        # Margin Y
        s/\bmy-1\b/my-xs/g;
        s/\bmy-2\b/my-sm/g;
        s/\bmy-3\b/my-sm/g;
        s/\bmy-4\b/my-md/g;
        s/\bmy-5\b/my-lg/g;
        s/\bmy-6\b/my-lg/g;
        s/\bmy-8\b/my-xl/g;
        s/\bmy-10\b/my-2xl/g;
        s/\bmy-12\b/my-2xl/g;
        s/\bmy-16\b/my-3xl/g;
        s/\bmy-20\b/my-4xl/g;
        
        # Gap fixes
        s/\bgap-1\b/gap-xs/g;
        s/\bgap-2\b/gap-sm/g;
        s/\bgap-3\b/gap-sm/g;
        s/\bgap-4\b/gap-md/g;
        s/\bgap-5\b/gap-lg/g;
        s/\bgap-6\b/gap-lg/g;
        s/\bgap-8\b/gap-xl/g;
        s/\bgap-10\b/gap-2xl/g;
        s/\bgap-12\b/gap-2xl/g;
        s/\bgap-16\b/gap-3xl/g;
        
        # Space fixes
        s/\bspace-x-1\b/gap-xs/g;
        s/\bspace-x-2\b/gap-sm/g;
        s/\bspace-x-3\b/gap-sm/g;
        s/\bspace-x-4\b/gap-md/g;
        s/\bspace-x-6\b/gap-lg/g;
        s/\bspace-x-8\b/gap-xl/g;
        
        s/\bspace-y-1\b/gap-xs/g;
        s/\bspace-y-2\b/gap-sm/g;
        s/\bspace-y-3\b/gap-sm/g;
        s/\bspace-y-4\b/gap-md/g;
        s/\bspace-y-6\b/gap-lg/g;
        s/\bspace-y-8\b/gap-xl/g;
        s/\bspace-y-10\b/gap-2xl/g;
        s/\bspace-y-12\b/gap-2xl/g;
        s/\bspace-y-16\b/gap-3xl/g;
        s/\bspace-y-20\b/gap-4xl/g;
    ' "$temp_file"
    
    # Check if file was modified
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Process files
echo "Processing files..."

# Find all TypeScript and JavaScript files
files=$(find "$PROJECT_ROOT" \
    -type f \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/.backup-*/*")

total_files=0
fixed_files=0

for file in $files; do
    total_files=$((total_files + 1))
    
    # Create backup
    relative_path=${file#$PROJECT_ROOT/}
    backup_path="$BACKUP_DIR/$relative_path"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path"
    
    # Fix spacing
    if fix_spacing "$file"; then
        fixed_files=$((fixed_files + 1))
        echo "Fixed: $relative_path" >> "$LOG_FILE"
        echo -n "."
    fi
    
    # Progress indicator
    if [ $((total_files % 50)) -eq 0 ]; then
        echo " ($total_files files processed)"
    fi
done

echo ""
echo ""
echo "================================================"
echo "Fix Complete!"
echo "Total files processed: $total_files"
echo "Files fixed: $fixed_files"
echo "Backup created at: $BACKUP_DIR"
echo "Log file: $LOG_FILE"
echo "================================================"
echo ""
echo "To restore from backup, run:"
echo "  cp -r '$BACKUP_DIR/'* '$PROJECT_ROOT/'"
echo ""
