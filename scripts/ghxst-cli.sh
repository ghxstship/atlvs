#!/bin/bash

# GHXST CLI - Component Generation Tool
# Usage: ./ghxst-cli.sh create component <name> --type <atom|molecule|organism>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="$SCRIPT_DIR/packages/ui/src"
TEMPLATES_DIR="$SCRIPT_DIR/templates"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
  echo "GHXST CLI - Component Generation Tool"
  echo ""
  echo "Usage:"
  echo "  ./ghxst-cli.sh create component <ComponentName> --type <atom|molecule|organism>"
  echo "  ./ghxst-cli.sh create story <ComponentName> --type <atom|molecule|organism>"
  echo "  ./ghxst-cli.sh create test <ComponentName> --type <atom|molecule|organism>"
  echo "  ./ghxst-cli.sh analyze bundle"
  echo "  ./ghxst-cli.sh help"
  echo ""
  echo "Examples:"
  echo "  ./ghxst-cli.sh create component Switch --type atom"
  echo "  ./ghxst-cli.sh create story Badge --type atom"
  echo ""
}

# Create component function
create_component() {
  local name=$1
  local type=$2
  
  if [ -z "$name" ] || [ -z "$type" ]; then
    echo -e "${RED}Error: Component name and type are required${NC}"
    echo "Usage: ./ghxst-cli.sh create component <ComponentName> --type <atom|molecule|organism>"
    exit 1
  fi
  
  # Validate type
  if [[ ! "$type" =~ ^(atom|molecule|organism)$ ]]; then
    echo -e "${RED}Error: Type must be atom, molecule, or organism${NC}"
    exit 1
  fi
  
  # Pluralize type for directory
  local type_dir="${type}s"
  local component_dir="$UI_DIR/$type_dir/$name"
  
  # Check if component already exists
  if [ -d "$component_dir" ]; then
    echo -e "${YELLOW}Warning: Component $name already exists in $type_dir${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Cancelled."
      exit 0
    fi
  fi
  
  # Create component directory
  mkdir -p "$component_dir"
  
  echo -e "${BLUE}Creating $type: $name${NC}"
  
  # Read template and replace placeholders
  local template_content=$(cat "$TEMPLATES_DIR/component.template.tsx")
  template_content="${template_content//\{\{COMPONENT_NAME\}\}/$name}"
  template_content="${template_content//\{\{COMPONENT_DESCRIPTION\}\}/$name Component}"
  template_content="${template_content//\{\{DETAILED_DESCRIPTION\}\}/ }"
  
  # Write component file
  echo "$template_content" > "$component_dir/$name.tsx"
  echo -e "${GREEN}✓ Created $component_dir/$name.tsx${NC}"
  
  # Create story
  local story_template=$(cat "$TEMPLATES_DIR/component.stories.template.tsx")
  story_template="${story_template//\{\{COMPONENT_NAME\}\}/$name}"
  story_template="${story_template//\{\{COMPONENT_DESCRIPTION\}\}/$name component for the UI library}"
  
  # Capitalize type for category
  local category=$(echo "$type_dir" | sed 's/s$//' | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  story_template="${story_template//\{\{CATEGORY\}\}/${category}s}"
  
  echo "$story_template" > "$component_dir/$name.stories.tsx"
  echo -e "${GREEN}✓ Created $component_dir/$name.stories.tsx${NC}"
  
  # Create test
  local test_template=$(cat "$TEMPLATES_DIR/component.test.template.tsx")
  test_template="${test_template//\{\{COMPONENT_NAME\}\}/$name}"
  
  echo "$test_template" > "$component_dir/$name.test.tsx"
  echo -e "${GREEN}✓ Created $component_dir/$name.test.tsx${NC}"
  
  # Update index.ts
  local index_file="$UI_DIR/$type_dir/index.ts"
  if [ -f "$index_file" ]; then
    echo "" >> "$index_file"
    echo "export { $name } from './$name/$name';" >> "$index_file"
    echo "export type { ${name}Props } from './$name/$name';" >> "$index_file"
    echo -e "${GREEN}✓ Updated $index_file${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}✨ Component $name created successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Customize the component in $component_dir/$name.tsx"
  echo "  2. Add stories to $component_dir/$name.stories.tsx"
  echo "  3. Write tests in $component_dir/$name.test.tsx"
  echo "  4. Run 'npm run storybook' to view your component"
  echo ""
}

# Analyze bundle
analyze_bundle() {
  echo -e "${BLUE}Analyzing bundle size...${NC}"
  cd "$SCRIPT_DIR/apps/web"
  npm run build 2>&1 | grep -A 20 "First Load JS"
  echo ""
  echo -e "${GREEN}✓ Bundle analysis complete${NC}"
}

# Main command router
case "$1" in
  create)
    case "$2" in
      component)
        shift 2
        name=""
        type=""
        
        while [[ $# -gt 0 ]]; do
          case $1 in
            --type)
              type="$2"
              shift 2
              ;;
            *)
              name="$1"
              shift
              ;;
          esac
        done
        
        create_component "$name" "$type"
        ;;
      *)
        echo -e "${RED}Error: Unknown create command: $2${NC}"
        show_help
        exit 1
        ;;
    esac
    ;;
  analyze)
    case "$2" in
      bundle)
        analyze_bundle
        ;;
      *)
        echo -e "${RED}Error: Unknown analyze command: $2${NC}"
        show_help
        exit 1
        ;;
    esac
    ;;
  help|--help|-h|"")
    show_help
    ;;
  *)
    echo -e "${RED}Error: Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac
