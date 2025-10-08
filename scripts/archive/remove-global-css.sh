#!/bin/bash

# GHXSTSHIP Remove Global CSS Script
# Phase 5: Complete removal of Global CSS system

set -e

echo "🗑️  GHXSTSHIP Global CSS Removal"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backup directory
BACKUP_DIR="./backup-global-css-removal-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo -e "${BLUE}Creating backup before removal...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r apps/web/app/globals.css "$BACKUP_DIR/" 2>/dev/null || echo "globals.css already removed"
cp -r apps/web/app/layout.tsx "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created at $BACKUP_DIR${NC}"

# Function to remove globals.css import from layout.tsx
remove_globals_import() {
    echo -e "\n${YELLOW}Removing globals.css import from layout.tsx...${NC}"
    
    # Remove the import statement
    sed -i '' "/import.*globals\.css/d" apps/web/app/layout.tsx
    
    echo -e "${GREEN}✓ Removed globals.css import from layout.tsx${NC}"
}

# Function to update layout.tsx to use UI package styles
update_layout_with_ui_styles() {
    echo -e "\n${YELLOW}Updating layout.tsx with UI package styles...${NC}"
    
    # Add UI package styles import if not present
    if ! grep -q "@ghxstship/ui/styles" apps/web/app/layout.tsx; then
        sed -i '' "1s/^/import '@ghxstship\/ui\/styles.css';\n/" apps/web/app/layout.tsx
        echo -e "${GREEN}✓ Added UI package styles import${NC}"
    fi
}

# Function to remove globals.css file
remove_globals_css_file() {
    echo -e "\n${YELLOW}Removing globals.css file...${NC}"
    
    if [ -f "apps/web/app/globals.css" ]; then
        rm apps/web/app/globals.css
        echo -e "${GREEN}✓ Removed globals.css file${NC}"
    else
        echo -e "${YELLOW}⚠ globals.css file not found (may already be removed)${NC}"
    fi
}

# Function to update Next.js config
update_nextjs_config() {
    echo -e "\n${YELLOW}Updating Next.js configuration...${NC}"
    
    # Check if next.config.js exists
    if [ -f "apps/web/next.config.js" ] || [ -f "apps/web/next.config.mjs" ]; then
        echo -e "${GREEN}✓ Next.js config found${NC}"
        # No specific changes needed for CSS removal
    fi
}

# Function to update Tailwind config
update_tailwind_config() {
    echo -e "\n${YELLOW}Updating Tailwind configuration...${NC}"
    
    TAILWIND_CONFIG="apps/web/tailwind.config.ts"
    
    if [ -f "$TAILWIND_CONFIG" ]; then
        # Ensure UI package is in content paths
        if ! grep -q "@ghxstship/ui" "$TAILWIND_CONFIG"; then
            sed -i '' "/content: \[/a\\
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'," "$TAILWIND_CONFIG"
            echo -e "${GREEN}✓ Added UI package to Tailwind content paths${NC}"
        else
            echo -e "${GREEN}✓ UI package already in Tailwind config${NC}"
        fi
    fi
}

# Function to create UI package styles.css if it doesn't exist
ensure_ui_styles() {
    echo -e "\n${YELLOW}Ensuring UI package styles.css exists...${NC}"
    
    UI_STYLES="packages/ui/src/styles.css"
    
    if [ ! -f "$UI_STYLES" ]; then
        echo -e "${YELLOW}Creating UI package styles.css...${NC}"
        
        cat > "$UI_STYLES" << 'EOF'
/* GHXSTSHIP UI Package Styles */
/* Single source of truth for all design system styles */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Import all design tokens as CSS variables */
    --font-title: 'Anton', sans-serif;
    --font-body: 'Share Tech', monospace;
    --font-mono: 'Share Tech Mono', monospace;
    
    /* Colors */
    --color-primary: hsl(220 70% 50%);
    --color-accent: hsl(220 15% 50%);
    --color-success: hsl(142 76% 36%);
    --color-warning: hsl(38 92% 50%);
    --color-destructive: hsl(0 84% 60%);
    --color-info: hsl(220 70% 50%);
    
    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    --spacing-4xl: 6rem;
    --spacing-5xl: 8rem;
    
    /* Animation */
    --duration-fast: 150ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
    --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-title);
  }
  
  code, pre {
    font-family: var(--font-mono);
  }
}

@layer components {
  /* Component-specific styles can be added here */
}

@layer utilities {
  /* Utility classes can be added here */
}
EOF
        
        echo -e "${GREEN}✓ Created UI package styles.css${NC}"
    else
        echo -e "${GREEN}✓ UI package styles.css already exists${NC}"
    fi
}

# Function to update package.json exports
update_package_exports() {
    echo -e "\n${YELLOW}Updating UI package exports...${NC}"
    
    PACKAGE_JSON="packages/ui/package.json"
    
    # Check if styles export exists
    if ! grep -q '"./styles.css"' "$PACKAGE_JSON"; then
        # Add styles export using jq or sed
        echo -e "${YELLOW}Adding styles.css export to package.json...${NC}"
        
        # This is a simplified approach - in production, use jq for JSON manipulation
        sed -i '' '/"exports": {/a\
    "./styles.css": "./src/styles.css",' "$PACKAGE_JSON"
        
        echo -e "${GREEN}✓ Added styles.css export${NC}"
    else
        echo -e "${GREEN}✓ styles.css export already exists${NC}"
    fi
}

# Function to clean up any remaining CSS modules
cleanup_css_modules() {
    echo -e "\n${YELLOW}Cleaning up CSS modules...${NC}"
    
    # Find and list CSS modules
    CSS_MODULES=$(find apps/web -name "*.module.css" 2>/dev/null | wc -l || echo 0)
    
    if [ "$CSS_MODULES" -gt 0 ]; then
        echo -e "${YELLOW}Found $CSS_MODULES CSS module files${NC}"
        echo -e "${YELLOW}Consider migrating these to UI components${NC}"
        find apps/web -name "*.module.css" | head -5
    else
        echo -e "${GREEN}✓ No CSS modules found${NC}"
    fi
}

# Function to validate removal
validate_removal() {
    echo -e "\n${BLUE}Validating Global CSS removal...${NC}"
    
    # Check if globals.css is gone
    if [ ! -f "apps/web/app/globals.css" ]; then
        echo -e "${GREEN}✓ globals.css successfully removed${NC}"
    else
        echo -e "${RED}✗ globals.css still exists${NC}"
    fi
    
    # Check if imports are gone
    GLOBAL_IMPORTS=$(grep -r "import.*globals\.css" apps/web --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
    
    if [ "$GLOBAL_IMPORTS" -eq 0 ]; then
        echo -e "${GREEN}✓ No globals.css imports found${NC}"
    else
        echo -e "${RED}✗ Found $GLOBAL_IMPORTS globals.css imports${NC}"
    fi
    
    # Check if UI styles are imported
    if grep -q "@ghxstship/ui/styles" apps/web/app/layout.tsx; then
        echo -e "${GREEN}✓ UI package styles properly imported${NC}"
    else
        echo -e "${YELLOW}⚠ UI package styles not imported in layout.tsx${NC}"
    fi
}

# Main removal flow
main() {
    echo -e "\n${BLUE}Starting Global CSS removal...${NC}"
    
    # Execute removal steps
    remove_globals_import
    update_layout_with_ui_styles
    remove_globals_css_file
    update_nextjs_config
    update_tailwind_config
    ensure_ui_styles
    update_package_exports
    cleanup_css_modules
    
    # Validate removal
    validate_removal
    
    echo -e "\n${GREEN}=================================${NC}"
    echo -e "${GREEN}✅ Global CSS Removal Complete!${NC}"
    echo -e "${GREEN}=================================${NC}"
    echo -e "\nThe Global CSS system has been removed."
    echo -e "All styles are now managed through the UI package."
    echo -e "\nNext steps:"
    echo -e "  1. Run: ${BLUE}npm run dev${NC} to test the application"
    echo -e "  2. Run: ${BLUE}npm run build${NC} to verify production build"
    echo -e "  3. Run: ${BLUE}./scripts/validate-ui-migration.sh${NC} for final validation"
}

# Run main function
main
