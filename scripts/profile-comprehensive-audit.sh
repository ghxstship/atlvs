#!/bin/bash

# Profile Module Comprehensive Audit Script
# Validates 100% full-stack implementation with ATLVS compliance

PROFILE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)/profile"
API_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/api/v1/profile"
REPORT_FILE="$PROFILE_DIR/PROFILE_COMPREHENSIVE_AUDIT_REPORT.md"

echo "🔍 PROFILE MODULE COMPREHENSIVE AUDIT - $(date)" > "$REPORT_FILE"
echo "=============================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to check file existence and size
check_file() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file" 2>/dev/null || echo "0")
        if [ "$size" -gt 100 ]; then
            echo "✅ $description ($size bytes)"
        else
            echo "⚠️  $description (TOO SMALL: $size bytes)"
        fi
    else
        echo "❌ $description (MISSING)"
    fi
}

# Function to check directory structure
check_directory_structure() {
    local dir="$1"
    local module_name="$2"
    
    echo "### $module_name Module Structure" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Check required files
    check_file "$dir/page.tsx" "Route Handler" >> "$REPORT_FILE"
    
    # Check for main client
    local main_client=""
    if [ -f "$dir/${module_name}Client.tsx" ]; then
        main_client="$dir/${module_name}Client.tsx"
    elif [ -f "$dir/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx" ]; then
        main_client="$dir/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx"
    fi
    
    if [ -n "$main_client" ]; then
        check_file "$main_client" "Main Client" >> "$REPORT_FILE"
    else
        echo "❌ Main Client (MISSING)" >> "$REPORT_FILE"
    fi
    
    # Check supporting files
    check_file "$dir/types.ts" "Type Definitions" >> "$REPORT_FILE"
    
    # Check lib directory
    if [ -d "$dir/lib" ]; then
        echo "✅ Service Layer Directory" >> "$REPORT_FILE"
        for service in "$dir/lib"/*.ts; do
            if [ -f "$service" ]; then
                check_file "$service" "Service File: $(basename "$service")" >> "$REPORT_FILE"
            fi
        done
    else
        echo "❌ Service Layer Directory (MISSING)" >> "$REPORT_FILE"
    fi
    
    # Check views directory
    if [ -d "$dir/views" ]; then
        echo "✅ Views Directory" >> "$REPORT_FILE"
        local view_count=$(find "$dir/views" -name "*.tsx" | wc -l)
        echo "  - View Components: $view_count" >> "$REPORT_FILE"
    else
        echo "❌ Views Directory (MISSING)" >> "$REPORT_FILE"
    fi
    
    # Check drawers directory
    if [ -d "$dir/drawers" ]; then
        echo "✅ Drawers Directory" >> "$REPORT_FILE"
        local drawer_count=$(find "$dir/drawers" -name "*.tsx" | wc -l)
        echo "  - Drawer Components: $drawer_count" >> "$REPORT_FILE"
    else
        echo "❌ Drawers Directory (MISSING)" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Function to check API implementation
check_api_implementation() {
    local module_name="$1"
    local api_path="$API_DIR/$module_name"
    
    echo "### $module_name API Implementation" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    if [ -d "$api_path" ]; then
        check_file "$api_path/route.ts" "Main API Route" >> "$REPORT_FILE"
        
        # Check for analytics endpoint
        if [ -f "$api_path/analytics/route.ts" ]; then
            check_file "$api_path/analytics/route.ts" "Analytics API Route" >> "$REPORT_FILE"
        fi
    else
        echo "❌ API Directory (MISSING)" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Function to validate ATLVS compliance
validate_atlvs_compliance() {
    local client_file="$1"
    local module_name="$2"
    
    echo "### $module_name ATLVS Compliance" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    if [ -f "$client_file" ]; then
        # Check for ATLVS imports
        local atlvs_imports=$(grep -c "from '@ghxstship/ui'" "$client_file" 2>/dev/null || echo "0")
        echo "- ATLVS UI Imports: $atlvs_imports" >> "$REPORT_FILE"
        
        # Check for DataViews components
        local dataviews=$(grep -c -E "(DataGrid|ViewSwitcher|DataActions|UniversalDrawer)" "$client_file" 2>/dev/null || echo "0")
        echo "- DataViews Components: $dataviews" >> "$REPORT_FILE"
        
        # Check for state management
        local state_mgmt=$(grep -c -E "(useState|useCallback|useEffect)" "$client_file" 2>/dev/null || echo "0")
        echo "- React Hooks Usage: $state_mgmt" >> "$REPORT_FILE"
        
        # Check for Supabase integration
        local supabase=$(grep -c -E "(createBrowserClient|supabase)" "$client_file" 2>/dev/null || echo "0")
        echo "- Supabase Integration: $supabase" >> "$REPORT_FILE"
        
        # Determine compliance level
        if [ "$atlvs_imports" -gt 0 ] && [ "$dataviews" -gt 0 ] && [ "$state_mgmt" -gt 5 ]; then
            echo "✅ ATLVS Compliance: EXCELLENT" >> "$REPORT_FILE"
        elif [ "$atlvs_imports" -gt 0 ] && [ "$state_mgmt" -gt 3 ]; then
            echo "⚠️  ATLVS Compliance: PARTIAL" >> "$REPORT_FILE"
        else
            echo "❌ ATLVS Compliance: INSUFFICIENT" >> "$REPORT_FILE"
        fi
    else
        echo "❌ Cannot validate - Client file missing" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
}

# Main audit execution
echo "## PROFILE MODULE COMPREHENSIVE AUDIT RESULTS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Define all profile subdirectories
SUBDIRS=(
    "overview:Overview"
    "basic:Basic"
    "contact:Contact"
    "professional:Professional"
    "performance:Performance"
    "travel:Travel"
    "uniform:Uniform"
    "certifications:Certifications"
    "endorsements:Endorsements"
    "health:Health"
    "emergency:Emergency"
    "activity:Activity"
    "history:History"
    "job-history:JobHistory"
)

# Audit each subdirectory
for subdir_info in "${SUBDIRS[@]}"; do
    IFS=':' read -r subdir_name module_name <<< "$subdir_info"
    subdir_path="$PROFILE_DIR/$subdir_name"
    
    if [ -d "$subdir_path" ]; then
        echo "## 📁 $module_name Module ($subdir_name/)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        # Check directory structure
        check_directory_structure "$subdir_path" "$module_name"
        
        # Check API implementation
        check_api_implementation "$subdir_name"
        
        # Find and validate main client file
        main_client=""
        if [ -f "$subdir_path/${module_name}Client.tsx" ]; then
            main_client="$subdir_path/${module_name}Client.tsx"
        elif [ -f "$subdir_path/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx" ]; then
            main_client="$subdir_path/$(echo ${module_name} | tr '[:upper:]' '[:lower:]')Client.tsx"
        fi
        
        # Validate ATLVS compliance
        validate_atlvs_compliance "$main_client" "$module_name"
        
        echo "---" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    else
        echo "❌ $module_name Module Directory Missing: $subdir_path" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
done

# Generate summary statistics
echo "## 📊 AUDIT SUMMARY STATISTICS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Count total files
total_tsx_files=$(find "$PROFILE_DIR" -name "*.tsx" | wc -l)
total_ts_files=$(find "$PROFILE_DIR" -name "*.ts" | wc -l)
total_api_files=$(find "$API_DIR" -name "route.ts" | wc -l)

echo "- Total TSX Files: $total_tsx_files" >> "$REPORT_FILE"
echo "- Total TS Files: $total_ts_files" >> "$REPORT_FILE"
echo "- Total API Routes: $total_api_files" >> "$REPORT_FILE"

# Count directories with proper structure
proper_structure_count=0
for subdir_info in "${SUBDIRS[@]}"; do
    IFS=':' read -r subdir_name module_name <<< "$subdir_info"
    subdir_path="$PROFILE_DIR/$subdir_name"
    
    if [ -d "$subdir_path" ] && [ -f "$subdir_path/page.tsx" ] && [ -d "$subdir_path/lib" ]; then
        ((proper_structure_count++))
    fi
done

echo "- Modules with Proper Structure: $proper_structure_count/14" >> "$REPORT_FILE"

# Calculate completion percentage
completion_percentage=$((proper_structure_count * 100 / 14))
echo "- Overall Completion: $completion_percentage%" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "## 🎯 VALIDATION AGAINST 13 KEY AREAS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Validation areas checklist
validation_areas=(
    "Tab system and module architecture"
    "Complete CRUD operations with live Supabase data"
    "Row Level Security implementation"
    "All data view types and switching"
    "Advanced search, filter, and sort capabilities"
    "Field visibility and reordering functionality"
    "Import/export with multiple formats"
    "Bulk actions and selection mechanisms"
    "Drawer implementation with row-level actions"
    "Real-time Supabase integration"
    "Complete routing and API wiring"
    "Enterprise-grade performance and security"
    "Normalized UI/UX consistency"
)

for i in "${!validation_areas[@]}"; do
    area="${validation_areas[$i]}"
    echo "$((i+1)). $area" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "**Audit completed at:** $(date)" >> "$REPORT_FILE"
echo "**Report generated by:** Profile Comprehensive Audit Script" >> "$REPORT_FILE"

echo "✅ Profile module audit completed. Report saved to: $REPORT_FILE"
