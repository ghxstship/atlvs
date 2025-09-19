#!/bin/bash

# GHXSTSHIP UI Package Migration Script
# Migrates all components from Global CSS to UI Package components
# Phase 3: Automated Migration

set -e

echo "🚀 Starting GHXSTSHIP UI Package Migration..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backup directory
BACKUP_DIR="./backup-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo -e "${BLUE}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r apps/web/app "$BACKUP_DIR/"
cp -r packages/ui "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"

# Function to migrate typography classes
migrate_typography() {
    echo -e "\n${YELLOW}Migrating typography classes...${NC}"
    
    # Find all TSX and TS files
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Migrate deprecated typography classes to new components
        sed -i '' \
            -e 's/className="text-heading-1"/<H1/g' \
            -e 's/className="text-heading-2"/<H2/g' \
            -e 's/className="text-heading-3"/<H3/g' \
            -e 's/className="text-heading-4"/<Text variant="body-lg"/g' \
            -e 's/className="text-body"/<Text/g' \
            -e 's/className="text-body-lg"/<Text variant="body-lg"/g' \
            -e 's/className="text-body-sm"/<Text variant="body-sm"/g' \
            -e 's/className="text-body-xs"/<Text variant="body-xs"/g' \
            -e 's/className="text-display"/<Display/g' \
            -e 's/className="text-display-lg"/<Display size="xl"/g' \
            "$file"
        
        # Check if file was modified and add imports if needed
        if git diff --quiet "$file" 2>/dev/null; then
            continue
        fi
        
        # Add imports if components are used
        if grep -q "<H1\|<H2\|<H3" "$file"; then
            if ! grep -q "import.*{.*H1.*H2.*H3.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { H1, H2, H3 } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated typography in $(basename "$file")"
            fi
        fi
        
        if grep -q "<Text\|<Display" "$file"; then
            if ! grep -q "import.*{.*Text.*Display.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { Text, Display } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated text components in $(basename "$file")"
            fi
        fi
    done
}

# Function to migrate spacing utilities
migrate_spacing() {
    echo -e "\n${YELLOW}Migrating spacing utilities...${NC}"
    
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Migrate stack utilities to Stack component
        sed -i '' \
            -e 's/<div className="stack-xs">/<Stack gap="xs">/g' \
            -e 's/<div className="stack-sm">/<Stack gap="sm">/g' \
            -e 's/<div className="stack-md">/<Stack gap="md">/g' \
            -e 's/<div className="stack-lg">/<Stack gap="lg">/g' \
            -e 's/<div className="stack-xl">/<Stack gap="xl">/g' \
            -e 's/<div className="stack-2xl">/<Stack gap="2xl">/g' \
            -e 's/<div className="stack-3xl">/<Stack gap="3xl">/g' \
            "$file"
        
        # Migrate cluster utilities to Cluster component
        sed -i '' \
            -e 's/<div className="cluster-xs">/<Cluster gap="xs">/g' \
            -e 's/<div className="cluster-sm">/<Cluster gap="sm">/g' \
            -e 's/<div className="cluster-md">/<Cluster gap="md">/g' \
            -e 's/<div className="cluster-lg">/<Cluster gap="lg">/g' \
            -e 's/<div className="cluster-xl">/<Cluster gap="xl">/g' \
            "$file"
        
        # Add imports if components are used
        if grep -q "<Stack\|<Cluster" "$file"; then
            if ! grep -q "import.*{.*Stack.*Cluster.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { Stack, Cluster } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated layout components in $(basename "$file")"
            fi
        fi
    done
}

# Function to migrate button classes
migrate_buttons() {
    echo -e "\n${YELLOW}Migrating button classes...${NC}"
    
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Migrate button classes to Button component
        sed -i '' \
            -e 's/<button className="btn btn-primary"/<Button variant="primary"/g' \
            -e 's/<button className="btn btn-secondary"/<Button variant="secondary"/g' \
            -e 's/<button className="btn btn-ghost"/<Button variant="ghost"/g' \
            -e 's/<button className="btn btn-outline"/<Button variant="outline"/g' \
            -e 's/<button className="btn btn-destructive"/<Button variant="destructive"/g' \
            -e 's/<button className="btn btn-success"/<Button variant="success"/g' \
            -e 's/<button className="btn btn-warning"/<Button variant="warning"/g' \
            "$file"
        
        # Add imports if Button is used
        if grep -q "<Button" "$file"; then
            if ! grep -q "import.*{.*Button.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { Button } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated buttons in $(basename "$file")"
            fi
        fi
    done
}

# Function to migrate card classes
migrate_cards() {
    echo -e "\n${YELLOW}Migrating card classes...${NC}"
    
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Migrate card classes to Card components
        sed -i '' \
            -e 's/<div className="card">/<Card>/g' \
            -e 's/<div className="card-title">/<CardTitle>/g' \
            -e 's/<div className="card-description">/<CardDescription>/g' \
            -e 's/<div className="card-header">/<CardHeader>/g' \
            -e 's/<div className="card-content">/<CardContent>/g' \
            -e 's/<div className="card-footer">/<CardFooter>/g' \
            "$file"
        
        # Add imports if Card components are used
        if grep -q "<Card\|<CardTitle\|<CardDescription\|<CardHeader\|<CardContent\|<CardFooter" "$file"; then
            if ! grep -q "import.*{.*Card.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { Card, CardTitle, CardDescription, CardHeader, CardContent, CardFooter } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated cards in $(basename "$file")"
            fi
        fi
    done
}

# Function to migrate badge classes
migrate_badges() {
    echo -e "\n${YELLOW}Migrating badge classes...${NC}"
    
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Migrate badge classes to Badge component
        sed -i '' \
            -e 's/<span className="badge badge-primary"/<Badge variant="primary"/g' \
            -e 's/<span className="badge badge-secondary"/<Badge variant="secondary"/g' \
            -e 's/<span className="badge badge-success"/<Badge variant="success"/g' \
            -e 's/<span className="badge badge-warning"/<Badge variant="warning"/g' \
            -e 's/<span className="badge badge-error"/<Badge variant="destructive"/g' \
            -e 's/<span className="badge badge-muted"/<Badge variant="muted"/g' \
            -e 's/<span className="badge"/<Badge/g' \
            "$file"
        
        # Add imports if Badge is used
        if grep -q "<Badge" "$file"; then
            if ! grep -q "import.*{.*Badge.*}.*from.*@ghxstship/ui" "$file"; then
                sed -i '' '1s/^/import { Badge } from "@ghxstship\/ui";\n/' "$file"
                echo -e "  ${GREEN}✓${NC} Updated badges in $(basename "$file")"
            fi
        fi
    done
}

# Function to remove globals.css imports
remove_global_css_imports() {
    echo -e "\n${YELLOW}Removing globals.css imports...${NC}"
    
    find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
        # Skip node_modules and .next
        if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
            continue
        fi
        
        # Remove globals.css imports
        sed -i '' '/import.*globals\.css/d' "$file"
        
        # Remove module.css imports
        sed -i '' '/import.*\.module\.css/d' "$file"
        
        if git diff --quiet "$file" 2>/dev/null; then
            continue
        fi
        
        echo -e "  ${GREEN}✓${NC} Removed CSS imports from $(basename "$file")"
    done
}

# Function to validate migration
validate_migration() {
    echo -e "\n${YELLOW}Validating migration...${NC}"
    
    # Check for remaining Global CSS classes
    echo -e "  Checking for remaining Global CSS classes..."
    
    REMAINING_CLASSES=$(grep -r "text-heading-\|text-body\|btn btn-\|stack-\|cluster-" apps/web --include="*.tsx" --include="*.ts" | wc -l)
    
    if [ "$REMAINING_CLASSES" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC} Found $REMAINING_CLASSES remaining Global CSS classes"
        grep -r "text-heading-\|text-body\|btn btn-\|stack-\|cluster-" apps/web --include="*.tsx" --include="*.ts" | head -10
    else
        echo -e "  ${GREEN}✓${NC} No Global CSS classes found"
    fi
    
    # Check TypeScript compilation
    echo -e "  Running TypeScript check..."
    if npm run type-check 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} TypeScript compilation successful"
    else
        echo -e "  ${YELLOW}⚠${NC} TypeScript compilation has errors (may need manual fixes)"
    fi
}

# Main migration flow
main() {
    echo -e "\n${BLUE}Starting migration process...${NC}"
    
    # Run migration functions
    migrate_typography
    migrate_spacing
    migrate_buttons
    migrate_cards
    migrate_badges
    remove_global_css_imports
    
    # Validate migration
    validate_migration
    
    echo -e "\n${GREEN}================================================${NC}"
    echo -e "${GREEN}✅ Migration Phase 3 Complete!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo -e "\nNext steps:"
    echo -e "  1. Review the changes with: ${BLUE}git diff${NC}"
    echo -e "  2. Run tests with: ${BLUE}npm test${NC}"
    echo -e "  3. Start dev server with: ${BLUE}npm run dev${NC}"
    echo -e "  4. If issues occur, restore from: ${BLUE}$BACKUP_DIR${NC}"
}

# Run main function
main
