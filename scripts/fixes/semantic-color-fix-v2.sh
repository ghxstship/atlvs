#!/bin/bash

# GHXSTSHIP Semantic Color Token Fix Script V2
# Enhanced version with better macOS compatibility and comprehensive fixes

echo "================================================"
echo "GHXSTSHIP SEMANTIC COLOR TOKEN FIX V2"
echo "================================================"
echo ""

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$REPO_ROOT/.backup-colors-v2-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo "Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r "$REPO_ROOT/apps" "$BACKUP_DIR/" 2>/dev/null
cp -r "$REPO_ROOT/packages" "$BACKUP_DIR/" 2>/dev/null
echo "Backup created."
echo ""

# Function to fix a single file
fix_file() {
    local file="$1"
    local changed=false
    
    # Read the file content
    local content=$(cat "$file")
    local original_content="$content"
    
    # === TEXT COLORS ===
    # Gray scale to semantic tokens
    content=$(echo "$content" | sed -E 's/text-gray-50([^0-9])/text-muted-foreground\/10\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-100([^0-9])/text-muted-foreground\/20\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-200([^0-9])/text-muted-foreground\/30\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-300([^0-9])/text-muted-foreground\/40\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-400([^0-9])/text-muted-foreground\/50\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-500([^0-9])/text-muted-foreground\/60\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-600([^0-9])/text-muted-foreground\/70\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-700([^0-9])/text-muted-foreground\/80\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-800([^0-9])/text-muted-foreground\/90\1/g')
    content=$(echo "$content" | sed -E 's/text-gray-900([^0-9])/text-foreground\1/g')
    
    # Slate/Zinc/Neutral variations
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-50([^0-9])/text-muted-foreground\/10\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-100([^0-9])/text-muted-foreground\/20\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-200([^0-9])/text-muted-foreground\/30\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-300([^0-9])/text-muted-foreground\/40\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-400([^0-9])/text-muted-foreground\/50\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-500([^0-9])/text-muted-foreground\/60\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-600([^0-9])/text-muted-foreground\/70\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-700([^0-9])/text-muted-foreground\/80\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-800([^0-9])/text-muted-foreground\/90\2/g')
    content=$(echo "$content" | sed -E 's/text-(slate|zinc|neutral)-900([^0-9])/text-foreground\2/g')
    
    # Status colors
    content=$(echo "$content" | sed -E 's/text-red-[0-9]+([^0-9])/text-destructive\1/g')
    content=$(echo "$content" | sed -E 's/text-green-[0-9]+([^0-9])/text-success\1/g')
    content=$(echo "$content" | sed -E 's/text-(yellow|amber|orange)-[0-9]+([^0-9])/text-warning\2/g')
    content=$(echo "$content" | sed -E 's/text-blue-[0-9]+([^0-9])/text-primary\1/g')
    content=$(echo "$content" | sed -E 's/text-(indigo|purple|violet)-[0-9]+([^0-9])/text-accent\2/g')
    
    # White and black
    content=$(echo "$content" | sed -E 's/text-white([^-])/text-background\1/g')
    content=$(echo "$content" | sed -E 's/text-black([^-])/text-foreground\1/g')
    
    # === BACKGROUND COLORS ===
    # Gray scale
    content=$(echo "$content" | sed -E 's/bg-gray-50([^0-9])/bg-muted\/10\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-100([^0-9])/bg-muted\/20\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-200([^0-9])/bg-muted\/30\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-300([^0-9])/bg-muted\/40\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-400([^0-9])/bg-muted\/50\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-500([^0-9])/bg-muted\/60\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-600([^0-9])/bg-muted\/70\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-700([^0-9])/bg-muted\/80\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-800([^0-9])/bg-muted\/90\1/g')
    content=$(echo "$content" | sed -E 's/bg-gray-900([^0-9])/bg-muted\1/g')
    
    # Slate/Zinc/Neutral
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-50([^0-9])/bg-muted\/10\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-100([^0-9])/bg-muted\/20\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-200([^0-9])/bg-muted\/30\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-300([^0-9])/bg-muted\/40\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-400([^0-9])/bg-muted\/50\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-500([^0-9])/bg-muted\/60\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-600([^0-9])/bg-muted\/70\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-700([^0-9])/bg-muted\/80\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-800([^0-9])/bg-muted\/90\2/g')
    content=$(echo "$content" | sed -E 's/bg-(slate|zinc|neutral)-900([^0-9])/bg-muted\2/g')
    
    # White and black backgrounds
    content=$(echo "$content" | sed -E 's/bg-white([^-])/bg-background\1/g')
    content=$(echo "$content" | sed -E 's/bg-black([^-])/bg-foreground\1/g')
    
    # Status backgrounds with opacity
    content=$(echo "$content" | sed -E 's/bg-red-50([^0-9])/bg-destructive\/10\1/g')
    content=$(echo "$content" | sed -E 's/bg-red-100([^0-9])/bg-destructive\/20\1/g')
    content=$(echo "$content" | sed -E 's/bg-red-[0-9]+([^0-9])/bg-destructive\1/g')
    
    content=$(echo "$content" | sed -E 's/bg-green-50([^0-9])/bg-success\/10\1/g')
    content=$(echo "$content" | sed -E 's/bg-green-100([^0-9])/bg-success\/20\1/g')
    content=$(echo "$content" | sed -E 's/bg-green-[0-9]+([^0-9])/bg-success\1/g')
    
    content=$(echo "$content" | sed -E 's/bg-(yellow|amber|orange)-50([^0-9])/bg-warning\/10\2/g')
    content=$(echo "$content" | sed -E 's/bg-(yellow|amber|orange)-100([^0-9])/bg-warning\/20\2/g')
    content=$(echo "$content" | sed -E 's/bg-(yellow|amber|orange)-[0-9]+([^0-9])/bg-warning\2/g')
    
    content=$(echo "$content" | sed -E 's/bg-blue-50([^0-9])/bg-primary\/10\1/g')
    content=$(echo "$content" | sed -E 's/bg-blue-100([^0-9])/bg-primary\/20\1/g')
    content=$(echo "$content" | sed -E 's/bg-blue-[0-9]+([^0-9])/bg-primary\1/g')
    
    # === BORDER COLORS ===
    content=$(echo "$content" | sed -E 's/border-gray-[0-9]+([^0-9])/border-border\1/g')
    content=$(echo "$content" | sed -E 's/border-(slate|zinc|neutral)-[0-9]+([^0-9])/border-border\2/g')
    content=$(echo "$content" | sed -E 's/border-red-[0-9]+([^0-9])/border-destructive\1/g')
    content=$(echo "$content" | sed -E 's/border-green-[0-9]+([^0-9])/border-success\1/g')
    content=$(echo "$content" | sed -E 's/border-(yellow|amber|orange)-[0-9]+([^0-9])/border-warning\2/g')
    content=$(echo "$content" | sed -E 's/border-blue-[0-9]+([^0-9])/border-primary\1/g')
    
    # === RING COLORS ===
    content=$(echo "$content" | sed -E 's/ring-gray-[0-9]+([^0-9])/ring-border\1/g')
    content=$(echo "$content" | sed -E 's/ring-(slate|zinc|neutral)-[0-9]+([^0-9])/ring-border\2/g')
    content=$(echo "$content" | sed -E 's/ring-red-[0-9]+([^0-9])/ring-destructive\1/g')
    content=$(echo "$content" | sed -E 's/ring-green-[0-9]+([^0-9])/ring-success\1/g')
    content=$(echo "$content" | sed -E 's/ring-(yellow|amber|orange)-[0-9]+([^0-9])/ring-warning\2/g')
    content=$(echo "$content" | sed -E 's/ring-blue-[0-9]+([^0-9])/ring-primary\1/g')
    
    # Focus ring colors
    content=$(echo "$content" | sed -E 's/focus:ring-gray-[0-9]+([^0-9])/focus:ring-border\1/g')
    content=$(echo "$content" | sed -E 's/focus:ring-(slate|zinc|neutral)-[0-9]+([^0-9])/focus:ring-border\2/g')
    content=$(echo "$content" | sed -E 's/focus:ring-red-[0-9]+([^0-9])/focus:ring-destructive\1/g')
    content=$(echo "$content" | sed -E 's/focus:ring-green-[0-9]+([^0-9])/focus:ring-success\1/g')
    content=$(echo "$content" | sed -E 's/focus:ring-(yellow|amber|orange)-[0-9]+([^0-9])/focus:ring-warning\2/g')
    content=$(echo "$content" | sed -E 's/focus:ring-blue-[0-9]+([^0-9])/focus:ring-primary\1/g')
    
    # === SHADOW VALUES ===
    content=$(echo "$content" | sed -E 's/([^-])shadow-sm([^-])/\1shadow-surface\2/g')
    content=$(echo "$content" | sed -E 's/([^-])shadow-md([^-])/\1shadow-elevated\2/g')
    content=$(echo "$content" | sed -E 's/([^-])shadow-lg([^-])/\1shadow-floating\2/g')
    content=$(echo "$content" | sed -E 's/([^-])shadow-xl([^-])/\1shadow-modal\2/g')
    content=$(echo "$content" | sed -E 's/([^-])shadow-2xl([^-])/\1shadow-popover\2/g')
    
    # Hover shadows
    content=$(echo "$content" | sed -E 's/hover:shadow-md([^-])/hover:shadow-hover\1/g')
    content=$(echo "$content" | sed -E 's/hover:shadow-lg([^-])/hover:shadow-hover\1/g')
    content=$(echo "$content" | sed -E 's/hover:shadow-xl([^-])/hover:shadow-hover\1/g')
    
    # === FIX TITLES/HEADERS ===
    # Headers should use text-foreground, not text-accent
    content=$(echo "$content" | sed -E 's/(<h[1-6][^>]*className="[^"]*)(text-accent|text-primary|text-green-[0-9]+)([^"]*")/\1text-foreground\3/g')
    
    # Fix heading classes with accent colors
    content=$(echo "$content" | sed -E 's/(text-heading-[1-4]|text-display|text-h[1-6])[^"]*text-(accent|primary|green-[0-9]+)/\1 text-foreground/g')
    
    # === FIX GRADIENTS ===
    # Ensure proper gradient classes
    content=$(echo "$content" | sed -E 's/from-green-[0-9]+/from-accent/g')
    content=$(echo "$content" | sed -E 's/to-green-[0-9]+/to-primary/g')
    content=$(echo "$content" | sed -E 's/via-green-[0-9]+/via-accent/g')
    
    # Check if content changed
    if [ "$content" != "$original_content" ]; then
        echo "$content" > "$file"
        changed=true
    fi
    
    if [ "$changed" = true ]; then
        echo "✓ Fixed: ${file#$REPO_ROOT/}"
        return 0
    else
        return 1
    fi
}

# Process files
echo "Processing files..."
fixed_count=0
checked_count=0

# Find all TypeScript/JavaScript files
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/.backup-*" | while read file; do
    
    ((checked_count++))
    
    # Try to fix the file
    if fix_file "$file"; then
        ((fixed_count++))
    fi
    
    # Show progress every 50 files
    if [ $((checked_count % 50)) -eq 0 ]; then
        echo "Progress: Checked $checked_count files, fixed $fixed_count..."
    fi
done

echo ""
echo "================================================"
echo "FIX COMPLETE"
echo "================================================"
echo ""
echo "Checked $checked_count files"
echo "Fixed $fixed_count files"
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test the application"
echo "3. Commit the changes if everything looks good"
echo ""
echo "To restore from backup:"
echo "cp -r $BACKUP_DIR/* $REPO_ROOT/"
