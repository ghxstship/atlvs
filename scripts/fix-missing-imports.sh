#!/bin/bash

# Fix Missing Imports Script for ATLVS
# This script automatically adds missing imports across the codebase

set -e

APPS_WEB_DIR="apps/web"

echo "🔧 Starting automated import fixes..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to add Lucide React imports
fix_lucide_imports() {
    echo -e "${BLUE}📦 Fixing Lucide React icon imports...${NC}"
    
    local icons=(
        "Upload" "Download" "Eye" "Edit" "Shield" "Users"
        "Calendar as CalendarIcon" "File" "Pie" "ChevronDown" "ChevronRight"
        "Folder" "Trash2" "FileCode" "Image" "Video" "Music"
        "EyeOff" "Save" "X" "Check" "AlertCircle" "Info"
        "Plus" "Minus" "Search" "Filter" "MoreVertical"
        "ArrowLeft" "ArrowRight" "ExternalLink" "Copy"
        "Settings" "Bell" "Mail" "Phone" "MapPin"
    )
    
    # Find files that use these icons but don't import them
    for icon in "${icons[@]}"; do
        local icon_name=$(echo "$icon" | awk '{print $1}')
        
        # Find files using the icon
        grep -rl "<${icon_name}" "$APPS_WEB_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | while read -r file; do
            # Check if import already exists
            if ! grep -q "from ['\"]lucide-react['\"]" "$file" || ! grep -q "$icon" "$file" | head -1 | grep -q "import"; then
                echo "  Adding $icon_name to $file"
                
                # Check if there's already a lucide-react import
                if grep -q "from ['\"]lucide-react['\"]" "$file"; then
                    # Add to existing import
                    sed -i.bak "s/\(import {[^}]*\)\(} from ['\"]lucide-react['\"]\)/\1, $icon\2/" "$file"
                else
                    # Add new import after the last import statement
                    sed -i.bak "/^import/a\\
import { $icon } from 'lucide-react';
" "$file"
                fi
            fi
        done
    done
    
    echo -e "${GREEN}✓ Lucide React imports fixed${NC}"
}

# Function to add ATLVS UI component imports
fix_atlvs_ui_imports() {
    echo -e "${BLUE}📦 Fixing ATLVS UI component imports...${NC}"
    
    local components=(
        "StateManagerProvider" "DataViewProvider" "ViewSwitcher" "DataActions"
        "Card" "CardHeader" "CardTitle" "CardDescription" "CardContent" "CardFooter"
        "Separator" "Switch" "Label" "Button"
        "DataGrid" "KanbanBoard" "CalendarView" "ListView" "TimelineView" "GalleryView"
        "UniversalDrawer" "Badge" "Input" "Select" "Textarea"
        "Dialog" "DialogContent" "DialogHeader" "DialogTitle" "DialogDescription"
        "Tabs" "TabsList" "TabsTrigger" "TabsContent"
        "Alert" "AlertDescription" "AlertTitle"
    )
    
    for component in "${components[@]}"; do
        # Find files using the component
        grep -rl "<${component}" "$APPS_WEB_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | while read -r file; do
            # Check if import already exists
            if ! grep -q "from ['\"]@ghxstship/ui['\"]" "$file" || ! grep -q "$component" "$file" | head -1 | grep -q "import"; then
                echo "  Adding $component to $file"
                
                # Check if there's already a @ghxstship/ui import
                if grep -q "from ['\"]@ghxstship/ui['\"]" "$file"; then
                    # Add to existing import
                    sed -i.bak "s/\(import {[^}]*\)\(} from ['\"]@ghxstship\/ui['\"]\)/\1, $component\2/" "$file"
                else
                    # Add new import after the last import statement
                    sed -i.bak "/^import/a\\
import { $component } from '@ghxstship/ui';
" "$file"
                fi
            fi
        done
    done
    
    echo -e "${GREEN}✓ ATLVS UI component imports fixed${NC}"
}

# Function to clean up duplicate imports
cleanup_duplicate_imports() {
    echo -e "${BLUE}🧹 Cleaning up duplicate imports...${NC}"
    
    find "$APPS_WEB_DIR" -name "*.tsx" -o -name "*.ts" | while read -r file; do
        # Remove duplicate imports from same package
        awk '
            /^import.*from/ {
                if (seen[$0]++) next
            }
            {print}
        ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    done
    
    echo -e "${GREEN}✓ Duplicate imports cleaned${NC}"
}

# Function to remove backup files
cleanup_backups() {
    echo -e "${BLUE}🧹 Removing backup files...${NC}"
    find "$APPS_WEB_DIR" -name "*.bak" -delete
    echo -e "${GREEN}✓ Backup files removed${NC}"
}

# Function to fix import organization
organize_imports() {
    echo -e "${BLUE}📋 Organizing imports...${NC}"
    
    find "$APPS_WEB_DIR" -name "*.tsx" -o -name "*.ts" | while read -r file; do
        # Sort imports: React first, then third-party, then local
        perl -i -0pe 's/(import.*?\n)+/join "", sort {
            my ($a_react, $b_react) = ($a =~ q{["\']react}, $b =~ q{["\']react});
            my ($a_next, $b_next) = ($a =~ q{["\']next}, $b =~ q{["\']next});
            my ($a_local, $b_local) = ($a =~ q{["\']\.|["\']\@\/}, $b =~ q{["\']\.|["\']\@\/});
            
            return -1 if $a_react && !$b_react;
            return 1 if !$a_react && $b_react;
            return -1 if $a_next && !$b_next;
            return 1 if !$a_next && $b_next;
            return 1 if $a_local && !$b_local;
            return -1 if !$a_local && $b_local;
            return $a cmp $b;
        } $& =~ m{^import.*?\n}gm/ge' "$file" 2>/dev/null || true
    done
    
    echo -e "${GREEN}✓ Imports organized${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}Starting import fixes for ATLVS web application...${NC}"
    echo ""
    
    # Navigate to project root
    cd "$(dirname "$0")/.." || exit 1
    
    # Run fixes
    fix_lucide_imports
    echo ""
    
    fix_atlvs_ui_imports
    echo ""
    
    cleanup_duplicate_imports
    echo ""
    
    cleanup_backups
    echo ""
    
    # organize_imports
    # echo ""
    
    echo -e "${GREEN}✅ Import fixes completed!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Run: pnpm lint:fix"
    echo "  2. Run: pnpm typecheck"
    echo "  3. Run: pnpm build"
    echo "  4. Review and commit changes"
}

# Run main function
main
