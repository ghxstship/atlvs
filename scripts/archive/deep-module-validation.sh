#!/bin/bash

# DEEP MODULE VALIDATION SCRIPT
# Validates CRUD operations, Data Views, and RLS policies

set -e

SHELL_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)"
API_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/api/v1"
REPORT_FILE="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/DEEP_MODULE_VALIDATION.md"

MODULES=(
  "dashboard"
  "analytics"
  "assets"
  "companies"
  "finance"
  "files"
  "jobs"
  "people"
  "pipeline"
  "procurement"
  "profile"
  "programming"
  "projects"
  "settings"
)

echo "🔬 DEEP MODULE VALIDATION"
echo "=========================="
echo ""

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# DEEP MODULE VALIDATION REPORT
## GHXSTSHIP Enterprise Platform - Comprehensive CRUD, Views & RLS Audit

**Validation Date**: $(date +%Y-%m-%d)
**Validation Type**: ZERO TOLERANCE Deep Dive
**Scope**: CRUD Operations, Data Views, RLS Policies

---

EOF

# Function to check CRUD operations in API
check_crud_operations() {
  local module=$1
  local api_path="$API_DIR/$module"
  
  echo "### CRUD OPERATIONS" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  if [ ! -d "$api_path" ]; then
    echo "- ❌ **API Directory**: Not found" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    return
  fi
  
  # Check for GET (Read)
  local get_count=$(find "$api_path" -name "route.ts" -exec grep -l "export async function GET" {} \; | wc -l | tr -d ' ')
  if [ "$get_count" -gt 0 ]; then
    echo "- ✅ **READ (GET)**: Implemented ($get_count endpoints)" >> "$REPORT_FILE"
  else
    echo "- ❌ **READ (GET)**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for POST (Create)
  local post_count=$(find "$api_path" -name "route.ts" -exec grep -l "export async function POST" {} \; | wc -l | tr -d ' ')
  if [ "$post_count" -gt 0 ]; then
    echo "- ✅ **CREATE (POST)**: Implemented ($post_count endpoints)" >> "$REPORT_FILE"
  else
    echo "- ❌ **CREATE (POST)**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for PUT/PATCH (Update)
  local put_count=$(find "$api_path" -name "route.ts" -exec grep -l "export async function PUT\|export async function PATCH" {} \; | wc -l | tr -d ' ')
  if [ "$put_count" -gt 0 ]; then
    echo "- ✅ **UPDATE (PUT/PATCH)**: Implemented ($put_count endpoints)" >> "$REPORT_FILE"
  else
    echo "- ❌ **UPDATE (PUT/PATCH)**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for DELETE
  local delete_count=$(find "$api_path" -name "route.ts" -exec grep -l "export async function DELETE" {} \; | wc -l | tr -d ' ')
  if [ "$delete_count" -gt 0 ]; then
    echo "- ✅ **DELETE**: Implemented ($delete_count endpoints)" >> "$REPORT_FILE"
  else
    echo "- ❌ **DELETE**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for bulk operations
  local bulk_count=$(find "$api_path" -name "route.ts" -exec grep -l "bulk\|batch" {} \; | wc -l | tr -d ' ')
  if [ "$bulk_count" -gt 0 ]; then
    echo "- ✅ **BULK OPERATIONS**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **BULK OPERATIONS**: Not detected" >> "$REPORT_FILE"
  fi
  
  # Check for import/export
  local export_count=$(find "$api_path" -name "route.ts" -exec grep -l "export.*csv\|export.*json\|import" {} \; | wc -l | tr -d ' ')
  if [ "$export_count" -gt 0 ]; then
    echo "- ✅ **IMPORT/EXPORT**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **IMPORT/EXPORT**: Not detected" >> "$REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
}

# Function to check data view implementations
check_data_views() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  
  echo "### DATA VIEWS (8 Required Types)" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Check for view components
  if [ -d "$module_path/views" ]; then
    # Table/Grid View
    if find "$module_path" -name "*Grid*" -o -name "*Table*" | grep -q .; then
      echo "- ✅ **TABLE/GRID VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **TABLE/GRID VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Kanban View
    if find "$module_path" -name "*Kanban*" -o -name "*Board*" | grep -q .; then
      echo "- ✅ **KANBAN VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **KANBAN VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Calendar View
    if find "$module_path" -name "*Calendar*" | grep -q .; then
      echo "- ✅ **CALENDAR VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **CALENDAR VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Gallery View
    if find "$module_path" -name "*Gallery*" -o -name "*Card*" | grep -q .; then
      echo "- ✅ **GALLERY VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **GALLERY VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Timeline View
    if find "$module_path" -name "*Timeline*" -o -name "*Gantt*" | grep -q .; then
      echo "- ✅ **TIMELINE VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **TIMELINE VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Chart View
    if find "$module_path" -name "*Chart*" -o -name "*Analytics*" | grep -q .; then
      echo "- ✅ **CHART VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **CHART VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # Form View
    if find "$module_path" -name "*Form*" -o -name "*Create*" -o -name "*Edit*" | grep -q .; then
      echo "- ✅ **FORM VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **FORM VIEW**: Missing" >> "$REPORT_FILE"
    fi
    
    # List View
    if find "$module_path" -name "*List*" | grep -q .; then
      echo "- ✅ **LIST VIEW**: Implemented" >> "$REPORT_FILE"
    else
      echo "- ❌ **LIST VIEW**: Missing" >> "$REPORT_FILE"
    fi
  else
    echo "- ❌ **ALL VIEWS**: views/ directory missing" >> "$REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
}

# Function to check RLS policies
check_rls_policies() {
  local module=$1
  local api_path="$API_DIR/$module"
  
  echo "### ROW LEVEL SECURITY" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  if [ ! -d "$api_path" ]; then
    echo "- ❌ **RLS CHECKS**: API not found" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    return
  fi
  
  # Check for organization_id filtering
  local org_check=$(find "$api_path" -name "*.ts" -exec grep -l "organization_id" {} \; | wc -l | tr -d ' ')
  if [ "$org_check" -gt 0 ]; then
    echo "- ✅ **ORGANIZATION ISOLATION**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ❌ **ORGANIZATION ISOLATION**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for user permissions
  local perm_check=$(find "$api_path" -name "*.ts" -exec grep -l "permission\|role\|canAccess" {} \; | wc -l | tr -d ' ')
  if [ "$perm_check" -gt 0 ]; then
    echo "- ✅ **USER PERMISSIONS**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **USER PERMISSIONS**: Not detected" >> "$REPORT_FILE"
  fi
  
  # Check for audit logging
  local audit_check=$(find "$api_path" -name "*.ts" -exec grep -l "audit\|log\|activity" {} \; | wc -l | tr -d ' ')
  if [ "$audit_check" -gt 0 ]; then
    echo "- ✅ **AUDIT TRAILS**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **AUDIT TRAILS**: Not detected" >> "$REPORT_FILE"
  fi
  
  # Check for Supabase RLS
  local rls_check=$(find "$api_path" -name "*.ts" -exec grep -l "supabase.*from\|RLS" {} \; | wc -l | tr -d ' ')
  if [ "$rls_check" -gt 0 ]; then
    echo "- ✅ **SUPABASE RLS**: Integrated" >> "$REPORT_FILE"
  else
    echo "- ❌ **SUPABASE RLS**: Missing" >> "$REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
}

# Function to check real-time integration
check_realtime() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  
  echo "### REAL-TIME INTEGRATION" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Check for Supabase subscriptions
  local sub_check=$(find "$module_path" -name "*.tsx" -o -name "*.ts" -exec grep -l "subscribe\|channel\|realtime" {} \; 2>/dev/null | wc -l | tr -d ' ')
  if [ "$sub_check" -gt 0 ]; then
    echo "- ✅ **SUPABASE SUBSCRIPTIONS**: Implemented ($sub_check files)" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **SUPABASE SUBSCRIPTIONS**: Not detected" >> "$REPORT_FILE"
  fi
  
  # Check for optimistic updates
  local opt_check=$(find "$module_path" -name "*.tsx" -exec grep -l "optimistic\|useMutation\|useOptimistic" {} \; 2>/dev/null | wc -l | tr -d ' ')
  if [ "$opt_check" -gt 0 ]; then
    echo "- ✅ **OPTIMISTIC UPDATES**: Implemented" >> "$REPORT_FILE"
  else
    echo "- ⚠️ **OPTIMISTIC UPDATES**: Not detected" >> "$REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
}

# Audit each module
for module in "${MODULES[@]}"; do
  echo "Deep diving: $module"
  echo "-----------------------------------"
  
  echo "## MODULE: $module" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  check_crud_operations "$module"
  check_data_views "$module"
  check_rls_policies "$module"
  check_realtime "$module"
  
  echo "---" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
done

echo ""
echo "✅ Deep validation complete!"
echo "📄 Report saved to: $REPORT_FILE"
