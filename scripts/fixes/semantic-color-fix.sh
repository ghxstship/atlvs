#!/bin/bash

# GHXSTSHIP Semantic Color Token Fix Script
# This script automatically fixes color token violations in the repository

echo "================================================"
echo "GHXSTSHIP SEMANTIC COLOR TOKEN FIX"
echo "================================================"
echo ""

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$REPO_ROOT/.backup-colors-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo "Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r "$REPO_ROOT/apps" "$BACKUP_DIR/" 2>/dev/null
cp -r "$REPO_ROOT/packages" "$BACKUP_DIR/" 2>/dev/null
echo "Backup created."
echo ""

# Function to fix files
fix_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    # Create a copy to work with
    cp "$file" "$temp_file"
    
    # Fix text colors
    # Gray scale -> foreground/muted
    sed -i '' 's/text-gray-50\b/text-muted-foreground\/10/g' "$temp_file"
    sed -i '' 's/text-gray-100\b/text-muted-foreground\/20/g' "$temp_file"
    sed -i '' 's/text-gray-200\b/text-muted-foreground\/30/g' "$temp_file"
    sed -i '' 's/text-gray-300\b/text-muted-foreground\/40/g' "$temp_file"
    sed -i '' 's/text-gray-400\b/text-muted-foreground\/50/g' "$temp_file"
    sed -i '' 's/text-gray-500\b/text-muted-foreground\/60/g' "$temp_file"
    sed -i '' 's/text-gray-600\b/text-muted-foreground\/70/g' "$temp_file"
    sed -i '' 's/text-gray-700\b/text-muted-foreground\/80/g' "$temp_file"
    sed -i '' 's/text-gray-800\b/text-muted-foreground\/90/g' "$temp_file"
    sed -i '' 's/text-gray-900\b/text-foreground/g' "$temp_file"
    
    # Slate/zinc/neutral -> same as gray
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-50\b/text-muted-foreground\/10/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-100\b/text-muted-foreground\/20/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-200\b/text-muted-foreground\/30/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-300\b/text-muted-foreground\/40/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-400\b/text-muted-foreground\/50/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-500\b/text-muted-foreground\/60/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-600\b/text-muted-foreground\/70/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-700\b/text-muted-foreground\/80/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-800\b/text-muted-foreground\/90/g' "$temp_file"
    sed -i '' 's/text-\(slate\|zinc\|neutral\)-900\b/text-foreground/g' "$temp_file"
    
    # Status colors
    sed -i '' 's/text-red-[0-9]00\b/text-destructive/g' "$temp_file"
    sed -i '' 's/text-green-[0-9]00\b/text-success/g' "$temp_file"
    sed -i '' 's/text-\(yellow\|amber\|orange\)-[0-9]00\b/text-warning/g' "$temp_file"
    sed -i '' 's/text-blue-[0-9]00\b/text-primary/g' "$temp_file"
    sed -i '' 's/text-\(indigo\|purple\|violet\)-[0-9]00\b/text-accent/g' "$temp_file"
    
    # Fix background colors
    # Gray scale -> background/muted
    sed -i '' 's/bg-gray-50\b/bg-muted\/10/g' "$temp_file"
    sed -i '' 's/bg-gray-100\b/bg-muted\/20/g' "$temp_file"
    sed -i '' 's/bg-gray-200\b/bg-muted\/30/g' "$temp_file"
    sed -i '' 's/bg-gray-300\b/bg-muted\/40/g' "$temp_file"
    sed -i '' 's/bg-gray-400\b/bg-muted\/50/g' "$temp_file"
    sed -i '' 's/bg-gray-500\b/bg-muted\/60/g' "$temp_file"
    sed -i '' 's/bg-gray-600\b/bg-muted\/70/g' "$temp_file"
    sed -i '' 's/bg-gray-700\b/bg-muted\/80/g' "$temp_file"
    sed -i '' 's/bg-gray-800\b/bg-muted\/90/g' "$temp_file"
    sed -i '' 's/bg-gray-900\b/bg-muted/g' "$temp_file"
    
    # Slate/zinc/neutral -> same as gray
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-50\b/bg-muted\/10/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-100\b/bg-muted\/20/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-200\b/bg-muted\/30/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-300\b/bg-muted\/40/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-400\b/bg-muted\/50/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-500\b/bg-muted\/60/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-600\b/bg-muted\/70/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-700\b/bg-muted\/80/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-800\b/bg-muted\/90/g' "$temp_file"
    sed -i '' 's/bg-\(slate\|zinc\|neutral\)-900\b/bg-muted/g' "$temp_file"
    
    # White/black
    sed -i '' 's/bg-white\b/bg-background/g' "$temp_file"
    sed -i '' 's/bg-black\b/bg-foreground/g' "$temp_file"
    
    # Status colors
    sed -i '' 's/bg-red-50\b/bg-destructive\/10/g' "$temp_file"
    sed -i '' 's/bg-red-100\b/bg-destructive\/20/g' "$temp_file"
    sed -i '' 's/bg-red-[0-9]00\b/bg-destructive/g' "$temp_file"
    
    sed -i '' 's/bg-green-50\b/bg-success\/10/g' "$temp_file"
    sed -i '' 's/bg-green-100\b/bg-success\/20/g' "$temp_file"
    sed -i '' 's/bg-green-[0-9]00\b/bg-success/g' "$temp_file"
    
    sed -i '' 's/bg-\(yellow\|amber\|orange\)-50\b/bg-warning\/10/g' "$temp_file"
    sed -i '' 's/bg-\(yellow\|amber\|orange\)-100\b/bg-warning\/20/g' "$temp_file"
    sed -i '' 's/bg-\(yellow\|amber\|orange\)-[0-9]00\b/bg-warning/g' "$temp_file"
    
    sed -i '' 's/bg-blue-50\b/bg-primary\/10/g' "$temp_file"
    sed -i '' 's/bg-blue-100\b/bg-primary\/20/g' "$temp_file"
    sed -i '' 's/bg-blue-[0-9]00\b/bg-primary/g' "$temp_file"
    
    # Fix border colors
    # Gray scale -> border
    sed -i '' 's/border-gray-[0-9]00\b/border-border/g' "$temp_file"
    sed -i '' 's/border-\(slate\|zinc\|neutral\)-[0-9]00\b/border-border/g' "$temp_file"
    
    # Status colors
    sed -i '' 's/border-red-[0-9]00\b/border-destructive/g' "$temp_file"
    sed -i '' 's/border-green-[0-9]00\b/border-success/g' "$temp_file"
    sed -i '' 's/border-\(yellow\|amber\|orange\)-[0-9]00\b/border-warning/g' "$temp_file"
    sed -i '' 's/border-blue-[0-9]00\b/border-primary/g' "$temp_file"
    sed -i '' 's/border-\(indigo\|purple\|violet\)-[0-9]00\b/border-accent/g' "$temp_file"
    
    # Fix ring colors
    sed -i '' 's/ring-gray-[0-9]00\b/ring-border/g' "$temp_file"
    sed -i '' 's/ring-\(slate\|zinc\|neutral\)-[0-9]00\b/ring-border/g' "$temp_file"
    sed -i '' 's/ring-red-[0-9]00\b/ring-destructive/g' "$temp_file"
    sed -i '' 's/ring-green-[0-9]00\b/ring-success/g' "$temp_file"
    sed -i '' 's/ring-\(yellow\|amber\|orange\)-[0-9]00\b/ring-warning/g' "$temp_file"
    sed -i '' 's/ring-blue-[0-9]00\b/ring-primary/g' "$temp_file"
    sed -i '' 's/ring-\(indigo\|purple\|violet\)-[0-9]00\b/ring-accent/g' "$temp_file"
    
    # Fix focus ring colors
    sed -i '' 's/focus:ring-gray-[0-9]00\b/focus:ring-border/g' "$temp_file"
    sed -i '' 's/focus:ring-\(slate\|zinc\|neutral\)-[0-9]00\b/focus:ring-border/g' "$temp_file"
    sed -i '' 's/focus:ring-red-[0-9]00\b/focus:ring-destructive/g' "$temp_file"
    sed -i '' 's/focus:ring-green-[0-9]00\b/focus:ring-success/g' "$temp_file"
    sed -i '' 's/focus:ring-\(yellow\|amber\|orange\)-[0-9]00\b/focus:ring-warning/g' "$temp_file"
    sed -i '' 's/focus:ring-blue-[0-9]00\b/focus:ring-primary/g' "$temp_file"
    sed -i '' 's/focus:ring-\(indigo\|purple\|violet\)-[0-9]00\b/focus:ring-accent/g' "$temp_file"
    
    # Fix shadow values
    sed -i '' 's/\bshadow-sm\b/shadow-surface/g' "$temp_file"
    sed -i '' 's/\bshadow-md\b/shadow-elevated/g' "$temp_file"
    sed -i '' 's/\bshadow-lg\b/shadow-floating/g' "$temp_file"
    sed -i '' 's/\bshadow-xl\b/shadow-modal/g' "$temp_file"
    sed -i '' 's/\bshadow-2xl\b/shadow-popover/g' "$temp_file"
    
    # Fix hover shadow
    sed -i '' 's/hover:shadow-md\b/hover:shadow-hover/g' "$temp_file"
    sed -i '' 's/hover:shadow-lg\b/hover:shadow-hover/g' "$temp_file"
    sed -i '' 's/hover:shadow-xl\b/hover:shadow-hover/g' "$temp_file"
    
    # Fix titles/headers to use foreground not accent
    # This is more complex and needs careful handling
    
    # Fix h1-h6 tags with text-accent to text-foreground
    sed -i '' 's/<h1\([^>]*\)text-accent/<h1\1text-foreground/g' "$temp_file"
    sed -i '' 's/<h2\([^>]*\)text-accent/<h2\1text-foreground/g' "$temp_file"
    sed -i '' 's/<h3\([^>]*\)text-accent/<h3\1text-foreground/g' "$temp_file"
    sed -i '' 's/<h4\([^>]*\)text-accent/<h4\1text-foreground/g' "$temp_file"
    sed -i '' 's/<h5\([^>]*\)text-accent/<h5\1text-foreground/g' "$temp_file"
    sed -i '' 's/<h6\([^>]*\)text-accent/<h6\1text-foreground/g' "$temp_file"
    
    # Fix text-heading classes to use foreground
    sed -i '' 's/text-heading-[1-4]\s*text-accent/text-heading-1 text-foreground/g' "$temp_file"
    sed -i '' 's/text-display\s*text-accent/text-display text-foreground/g' "$temp_file"
    
    # Fix gradient implementations
    # Ensure proper gradient classes are used
    sed -i '' 's/bg-gradient-to-r from-green-/bg-gradient-to-r from-accent to-primary/g' "$temp_file"
    sed -i '' 's/bg-gradient-to-br from-green-/bg-gradient-to-br from-accent to-primary/g' "$temp_file"
    
    # Move the temp file back
    mv "$temp_file" "$file"
}

# Process all TypeScript/JavaScript files
echo "Processing files..."
file_count=0

find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/.backup-*" | while read file; do
    
    # Check if file has violations
    if grep -q "text-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]\|bg-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]\|border-\(gray\|slate\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]\|shadow-\(sm\|md\|lg\|xl\|2xl\)" "$file" 2>/dev/null; then
        echo "Fixing: ${file#$REPO_ROOT/}"
        fix_file "$file"
        ((file_count++))
    fi
done

echo ""
echo "================================================"
echo "FIX COMPLETE"
echo "================================================"
echo ""
echo "Fixed $file_count files"
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test the application"
echo "3. Commit the changes if everything looks good"
echo ""
echo "To restore from backup:"
echo "cp -r $BACKUP_DIR/* $REPO_ROOT/"
