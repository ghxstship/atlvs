#!/bin/bash

# ZERO TOLERANCE MODULE VALIDATION SCRIPT
# Comprehensive audit of all 14 enterprise modules

set -e

SHELL_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)"
REPORT_FILE="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/ZERO_TOLERANCE_MODULE_VALIDATION.md"

# Define the 14 enterprise modules
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

echo "🔍 ZERO TOLERANCE MODULE VALIDATION"
echo "===================================="
echo ""
echo "Auditing 14 Enterprise Modules..."
echo ""

# Function to check module structure
check_module_structure() {
  local module=$1
  local module_path="$SHELL_DIR/$module"
  
  echo "## MODULE: $module" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  
  # Check if module exists
  if [ ! -d "$module_path" ]; then
    echo "❌ Module directory not found: $module"
    echo "**STATUS**: ❌ FAILED - Directory not found" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    return 1
  fi
  
  echo "✓ Module directory exists: $module"
  
  # Check for root page.tsx
  if [ -f "$module_path/page.tsx" ]; then
    local page_size=$(wc -c < "$module_path/page.tsx" | tr -d ' ')
    echo "  ✓ Root page.tsx found ($page_size bytes)"
    echo "- ✅ **ROOT PAGE**: Found ($page_size bytes)" >> "$REPORT_FILE"
  else
    echo "  ❌ Root page.tsx missing"
    echo "- ❌ **ROOT PAGE**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for types.ts
  if [ -f "$module_path/types.ts" ]; then
    local types_size=$(wc -c < "$module_path/types.ts" | tr -d ' ')
    echo "  ✓ types.ts found ($types_size bytes)"
    echo "- ✅ **TYPE DEFINITIONS**: Found ($types_size bytes)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  types.ts missing"
    echo "- ⚠️ **TYPE DEFINITIONS**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for lib/ directory
  if [ -d "$module_path/lib" ]; then
    local lib_files=$(find "$module_path/lib" -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')
    echo "  ✓ lib/ directory found ($lib_files files)"
    echo "- ✅ **SERVICE LAYER**: Found ($lib_files files)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  lib/ directory missing"
    echo "- ⚠️ **SERVICE LAYER**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for views/ directory
  if [ -d "$module_path/views" ]; then
    local view_files=$(find "$module_path/views" -name "*.tsx" | wc -l | tr -d ' ')
    echo "  ✓ views/ directory found ($view_files files)"
    echo "- ✅ **VIEW COMPONENTS**: Found ($view_files files)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  views/ directory missing"
    echo "- ⚠️ **VIEW COMPONENTS**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for drawers/ directory
  if [ -d "$module_path/drawers" ]; then
    local drawer_files=$(find "$module_path/drawers" -name "*.tsx" | wc -l | tr -d ' ')
    echo "  ✓ drawers/ directory found ($drawer_files files)"
    echo "- ✅ **DRAWER SYSTEM**: Found ($drawer_files files)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  drawers/ directory missing"
    echo "- ⚠️ **DRAWER SYSTEM**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for create/ route
  if [ -d "$module_path/create" ]; then
    echo "  ✓ create/ route found"
    echo "- ✅ **CREATE ROUTE**: Found" >> "$REPORT_FILE"
  else
    echo "  ⚠️  create/ route missing"
    echo "- ⚠️ **CREATE ROUTE**: Missing" >> "$REPORT_FILE"
  fi
  
  # Check for [id]/ route
  if [ -d "$module_path/[id]" ]; then
    echo "  ✓ [id]/ route found"
    echo "- ✅ **EDIT ROUTE**: Found" >> "$REPORT_FILE"
  else
    echo "  ⚠️  [id]/ route missing"
    echo "- ⚠️ **EDIT ROUTE**: Missing" >> "$REPORT_FILE"
  fi
  
  # Count subdirectories (submodules)
  local subdirs=$(find "$module_path" -maxdepth 1 -type d | grep -v "^$module_path$" | wc -l | tr -d ' ')
  echo "  ℹ️  Subdirectories: $subdirs"
  echo "- **SUBDIRECTORIES**: $subdirs submodules" >> "$REPORT_FILE"
  
  # Check for Client component
  local client_files=$(find "$module_path" -maxdepth 1 -name "*Client.tsx" | wc -l | tr -d ' ')
  if [ "$client_files" -gt 0 ]; then
    echo "  ✓ Client component(s) found: $client_files"
    echo "- ✅ **CLIENT COMPONENTS**: Found ($client_files files)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  No Client components found"
    echo "- ⚠️ **CLIENT COMPONENTS**: Missing" >> "$REPORT_FILE"
  fi
  
  echo "" >> "$REPORT_FILE"
  echo ""
}

# Function to check API routes
check_api_routes() {
  local module=$1
  local api_path="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/api/v1/$module"
  
  if [ -d "$api_path" ]; then
    local api_files=$(find "$api_path" -name "route.ts" | wc -l | tr -d ' ')
    echo "  ✓ API routes found: $api_files endpoints"
    echo "- ✅ **API ROUTES**: Found ($api_files endpoints)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  No API routes found"
    echo "- ⚠️ **API ROUTES**: Missing" >> "$REPORT_FILE"
  fi
}

# Function to check database migrations
check_database_schema() {
  local module=$1
  local migrations_path="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/packages/database/supabase/migrations"
  
  local migration_count=$(grep -r "$module" "$migrations_path" 2>/dev/null | wc -l | tr -d ' ')
  
  if [ "$migration_count" -gt 0 ]; then
    echo "  ✓ Database schema references: $migration_count"
    echo "- ✅ **DATABASE SCHEMA**: Found ($migration_count references)" >> "$REPORT_FILE"
  else
    echo "  ⚠️  No database schema found"
    echo "- ⚠️ **DATABASE SCHEMA**: Not found" >> "$REPORT_FILE"
  fi
}

# Initialize report
echo "# ZERO TOLERANCE MODULE VALIDATION REPORT" > "$REPORT_FILE"
echo "## GHXSTSHIP Enterprise Platform - 14 Module Comprehensive Audit" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Validation Date**: $(date +%Y-%m-%d)" >> "$REPORT_FILE"
echo "**Validation Standard**: ZERO TOLERANCE - 100% Compliance Required" >> "$REPORT_FILE"
echo "**Total Modules**: 14 Enterprise Modules" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Audit each module
for module in "${MODULES[@]}"; do
  echo "Auditing: $module"
  echo "-----------------------------------"
  check_module_structure "$module"
  check_api_routes "$module"
  check_database_schema "$module"
  echo "---" >> "$REPORT_FILE"
  echo ""
done

echo ""
echo "✅ Audit complete!"
echo "📄 Report saved to: $REPORT_FILE"
echo ""
echo "Run: cat \"$REPORT_FILE\" to view results"
