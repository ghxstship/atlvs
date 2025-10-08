#!/bin/bash

# GHXSTSHIP Module Audit Script
# Comprehensive audit of all modules for data views, drawers, and Supabase integration

MODULES_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)"
API_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/api/v1"
OUTPUT_FILE="$MODULES_DIR/MODULE_AUDIT_RESULTS_$(date +%Y%m%d_%H%M%S).md"

echo "# GHXSTSHIP MODULE AUDIT RESULTS" > "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to audit a single module
audit_module() {
    local module_name=$1
    local module_path="$MODULES_DIR/$module_name"
    
    if [[ ! -d "$module_path" ]]; then
        return
    fi
    
    echo "## $module_name" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Check for main client
    if [[ -f "$module_path/${module_name^}Client.tsx" ]]; then
        echo "✅ Main Client: ${module_name^}Client.tsx" >> "$OUTPUT_FILE"
    elif [[ -f "$module_path/$(echo $module_name | sed 's/.*/\u&/')Client.tsx" ]]; then
        echo "✅ Main Client: Found" >> "$OUTPUT_FILE"
    else
        echo "❌ Main Client: NOT FOUND" >> "$OUTPUT_FILE"
    fi
    
    # Check for views directory
    if [[ -d "$module_path/views" ]]; then
        view_count=$(find "$module_path/views" -name "*.tsx" -type f | wc -l | tr -d ' ')
        echo "📊 Views: $view_count files found" >> "$OUTPUT_FILE"
        find "$module_path/views" -name "*.tsx" -type f -exec basename {} \; | sed 's/^/  - /' >> "$OUTPUT_FILE"
    else
        echo "❌ Views: No views directory" >> "$OUTPUT_FILE"
    fi
    
    # Check for drawers directory
    if [[ -d "$module_path/drawers" ]]; then
        drawer_count=$(find "$module_path/drawers" -name "*.tsx" -type f | wc -l | tr -d ' ')
        echo "🔲 Drawers: $drawer_count files found" >> "$OUTPUT_FILE"
        find "$module_path/drawers" -name "*.tsx" -type f -exec basename {} \; | sed 's/^/  - /' >> "$OUTPUT_FILE"
    else
        echo "❌ Drawers: No drawers directory" >> "$OUTPUT_FILE"
    fi
    
    # Check for service layer
    if [[ -d "$module_path/lib" ]]; then
        if ls "$module_path/lib"/*service*.ts 1> /dev/null 2>&1; then
            echo "⚙️ Service Layer: Found" >> "$OUTPUT_FILE"
            find "$module_path/lib" -name "*service*.ts" -type f -exec basename {} \; | sed 's/^/  - /' >> "$OUTPUT_FILE"
        else
            echo "⚠️ Service Layer: lib directory exists but no service files" >> "$OUTPUT_FILE"
        fi
    else
        echo "❌ Service Layer: No lib directory" >> "$OUTPUT_FILE"
    fi
    
    # Check for API endpoints
    if [[ -d "$API_DIR/$module_name" ]]; then
        api_count=$(find "$API_DIR/$module_name" -name "route.ts" -type f | wc -l | tr -d ' ')
        echo "🔌 API Endpoints: $api_count route(s) found" >> "$OUTPUT_FILE"
    else
        echo "❌ API Endpoints: No API directory" >> "$OUTPUT_FILE"
    fi
    
    # Check for Supabase integration in main client
    if [[ -f "$module_path/${module_name^}Client.tsx" ]]; then
        if grep -q "createBrowserClient\|createClient\|supabase" "$module_path/${module_name^}Client.tsx" 2>/dev/null; then
            echo "💾 Supabase Integration: Found in main client" >> "$OUTPUT_FILE"
        else
            echo "⚠️ Supabase Integration: Not detected in main client" >> "$OUTPUT_FILE"
        fi
    fi
    
    # Check for subdirectories (tabs/submodules)
    subdirs=$(find "$module_path" -maxdepth 1 -type d ! -name "." ! -name ".." ! -name "views" ! -name "drawers" ! -name "lib" ! -name "components" ! -name "hooks" ! -name "utils" ! -name "validation-reports" ! -name "scripts" ! -name "create" ! -name "[id]" -exec basename {} \; | grep -v "^$(basename $module_path)$")
    if [[ -n "$subdirs" ]]; then
        subdir_count=$(echo "$subdirs" | wc -l | tr -d ' ')
        echo "📁 Submodules: $subdir_count found" >> "$OUTPUT_FILE"
        echo "$subdirs" | sed 's/^/  - /' >> "$OUTPUT_FILE"
    fi
    
    echo "" >> "$OUTPUT_FILE"
}

# Get list of all module directories
echo "Scanning modules in: $MODULES_DIR"
echo ""

# Audit each module alphabetically
for module_dir in "$MODULES_DIR"/*; do
    if [[ -d "$module_dir" ]]; then
        module_name=$(basename "$module_dir")
        
        # Skip non-module directories
        if [[ "$module_name" == "scripts" || "$module_name" == "design-system" ]]; then
            continue
        fi
        
        echo "Auditing: $module_name"
        audit_module "$module_name"
    fi
done

echo ""
echo "## SUMMARY STATISTICS" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Count totals
total_modules=$(grep -c "^## " "$OUTPUT_FILE" || echo "0")
modules_with_views=$(grep -c "📊 Views:" "$OUTPUT_FILE" || echo "0")
modules_with_drawers=$(grep -c "🔲 Drawers:" "$OUTPUT_FILE" || echo "0")
modules_with_service=$(grep -c "⚙️ Service Layer: Found" "$OUTPUT_FILE" || echo "0")
modules_with_api=$(grep -c "🔌 API Endpoints:" "$OUTPUT_FILE" || echo "0")
modules_with_supabase=$(grep -c "💾 Supabase Integration: Found" "$OUTPUT_FILE" || echo "0")

echo "**Total Modules Audited**: $total_modules" >> "$OUTPUT_FILE"
echo "**Modules with Views**: $modules_with_views" >> "$OUTPUT_FILE"
echo "**Modules with Drawers**: $modules_with_drawers" >> "$OUTPUT_FILE"
echo "**Modules with Service Layer**: $modules_with_service" >> "$OUTPUT_FILE"
echo "**Modules with API Endpoints**: $modules_with_api" >> "$OUTPUT_FILE"
echo "**Modules with Supabase Integration**: $modules_with_supabase" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "---" >> "$OUTPUT_FILE"
echo "Audit complete! Results saved to: $OUTPUT_FILE"
echo ""
echo "Audit complete! Results saved to:"
echo "$OUTPUT_FILE"
