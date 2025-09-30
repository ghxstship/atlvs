#!/usr/bin/env zsh

# GENERATE MISSING ROUTES SCRIPT
# Systematically creates missing create/ and [id]/ routes across all modules

set -e

SHELL_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)"

echo "🚀 GENERATING MISSING ROUTES"
echo "=============================="
echo ""

# Define modules and their missing routes
typeset -A MISSING_ROUTES
MISSING_ROUTES=(
  finance "create [id]"
  jobs "create [id]"
  pipeline "create [id]"
  people "[id]"
  procurement "create [id]"
  programming "create"
  projects "create [id]"
  settings "create"
  profile "create"
)

# Function to create create/page.tsx
create_create_route() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  local create_dir="$module_path/create"
  
  if [ ! -d "$create_dir" ]; then
    echo "  Creating create/ route for $module..."
    mkdir -p "$create_dir"
    
    cat > "$create_dir/page.tsx" << 'EOF'
import { redirect } from 'next/navigation';

/**
 * Create Route
 * Redirects to main module page with create action
 */
export default function CreatePage() {
  redirect('MODULE_PATH?action=create');
}
EOF
    
    # Replace MODULE_PATH with actual path
    sed -i '' "s|MODULE_PATH|/$module|g" "$create_dir/page.tsx"
    echo "    ✅ Created $module/create/page.tsx"
  else
    echo "    ⏭️  $module/create/ already exists"
  fi
}

# Function to create [id]/page.tsx
create_id_route() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  local id_dir="$module_path/[id]"
  
  if [ ! -d "$id_dir" ]; then
    echo "  Creating [id]/ route for $module..."
    mkdir -p "$id_dir"
    
    cat > "$id_dir/page.tsx" << 'EOF'
import { redirect } from 'next/navigation';

/**
 * View Route
 * Redirects to main module page with view action
 */
export default function ViewPage({ params }: { params: { id: string } }) {
  redirect(`MODULE_PATH?action=view&id=${params.id}`);
}
EOF
    
    # Replace MODULE_PATH with actual path
    sed -i '' "s|MODULE_PATH|/$module|g" "$id_dir/page.tsx"
    echo "    ✅ Created $module/[id]/page.tsx"
  else
    echo "    ⏭️  $module/[id]/ already exists"
  fi
}

# Function to create [id]/edit/page.tsx
create_edit_route() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  local edit_dir="$module_path/[id]/edit"
  
  if [ ! -d "$edit_dir" ]; then
    echo "  Creating [id]/edit/ route for $module..."
    mkdir -p "$edit_dir"
    
    cat > "$edit_dir/page.tsx" << 'EOF'
import { redirect } from 'next/navigation';

/**
 * Edit Route
 * Redirects to main module page with edit action
 */
export default function EditPage({ params }: { params: { id: string } }) {
  redirect(`MODULE_PATH?action=edit&id=${params.id}`);
}
EOF
    
    # Replace MODULE_PATH with actual path
    sed -i '' "s|MODULE_PATH|/$module|g" "$edit_dir/page.tsx"
    echo "    ✅ Created $module/[id]/edit/page.tsx"
  else
    echo "    ⏭️  $module/[id]/edit/ already exists"
  fi
}

# Process each module
for module routes in "${(@kv)MISSING_ROUTES}"; do
  echo "Processing: $module"
  
  if [[ $routes == *"create"* ]]; then
    create_create_route "$module"
  fi
  
  if [[ $routes == *"[id]"* ]]; then
    create_id_route "$module"
    create_edit_route "$module"
  fi
  
  echo ""
done

echo "✅ Route generation complete!"
echo ""
echo "Summary:"
echo "--------"
echo "Created routes for: ${#MISSING_ROUTES[@]} modules"
echo ""
echo "Next steps:"
echo "1. Verify routes work with: npm run dev"
echo "2. Test navigation to each route"
echo "3. Run validation: ./scripts/zero-tolerance-module-audit.sh"
