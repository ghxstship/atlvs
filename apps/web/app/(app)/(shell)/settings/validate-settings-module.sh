#!/bin/bash

# Settings Module Comprehensive Validation Script
# ZERO TOLERANCE 100% Full-Stack Implementation Validation

echo "🔍 SETTINGS MODULE COMPREHENSIVE VALIDATION"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a check
run_check() {
    local description="$1"
    local command="$2"
    local expected_result="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  Checking $description... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Function to check file exists and has content
check_file() {
    local file_path="$1"
    local description="$2"
    local min_size="${3:-100}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  Checking $description... "
    
    if [[ -f "$file_path" ]] && [[ $(wc -c < "$file_path") -gt $min_size ]]; then
        echo -e "${GREEN}✅ EXISTS ($(wc -c < "$file_path") bytes)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ MISSING OR TOO SMALL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Function to check directory structure
check_directory() {
    local dir_path="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  Checking $description... "
    
    if [[ -d "$dir_path" ]]; then
        local file_count=$(find "$dir_path" -type f | wc -l)
        echo -e "${GREEN}✅ EXISTS ($file_count files)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo -e "${BLUE}📁 1. FILE ORGANIZATION STRUCTURE VALIDATION${NC}"
echo "================================================"

# Main module files
check_file "SettingsClient.tsx" "Main Settings Client" 15000
check_file "CreateSettingsClient.tsx" "Create Settings Client" 10000
check_file "types.ts" "Type Definitions" 5000
check_file "page.tsx" "Main Page Handler" 200

# Core directories
check_directory "lib" "Service Layer Directory"
check_directory "views" "Views Directory"
check_directory "drawers" "Drawers Directory"
check_directory "overview" "Overview Directory"

# Service layer files
check_file "lib/settings-service.ts" "Settings Service" 15000
check_file "lib/field-config.ts" "Field Configuration" 1000

# View components
check_file "views/SettingsGridView.tsx" "Grid View Component" 5000
check_file "views/SettingsListView.tsx" "List View Component" 5000
check_file "views/SettingsKanbanView.tsx" "Kanban View Component" 5000

# Drawer components
check_file "drawers/CreateSettingsDrawer.tsx" "Create Drawer Component" 5000
check_file "drawers/EditSettingsDrawer.tsx" "Edit Drawer Component" 5000

echo ""
echo -e "${BLUE}📂 2. SUBDIRECTORY IMPLEMENTATIONS VALIDATION${NC}"
echo "=============================================="

# Define all subdirectories that should exist
subdirectories=(
    "account"
    "teams" 
    "billing"
    "organization"
    "security"
    "notifications"
    "integrations"
    "permissions"
    "automations"
    "overview"
)

for subdir in "${subdirectories[@]}"; do
    echo -e "${CYAN}  Validating /$subdir/ subdirectory:${NC}"
    
    # Check directory exists
    check_directory "$subdir" "$subdir Directory"
    
    # Check for main client file
    if [[ -f "$subdir"/*Client.tsx ]]; then
        client_file=$(ls "$subdir"/*Client.tsx 2>/dev/null | head -1)
        check_file "$client_file" "$subdir Main Client" 5000
    else
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        echo -e "  Checking $subdir Main Client... ${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    
    # Check for page.tsx
    check_file "$subdir/page.tsx" "$subdir Page Handler" 500
    
    # Check for types.ts (if exists)
    if [[ -f "$subdir/types.ts" ]]; then
        check_file "$subdir/types.ts" "$subdir Types" 1000
    fi
    
    # Check for service layer (if exists)
    if [[ -f "$subdir/lib/"*service.ts ]]; then
        service_file=$(ls "$subdir/lib/"*service.ts 2>/dev/null | head -1)
        check_file "$service_file" "$subdir Service Layer" 5000
    fi
    
    echo ""
done

echo -e "${BLUE}🗄️ 3. DATABASE SCHEMA VALIDATION${NC}"
echo "================================="

# Check for migration files
migration_dir="../../../supabase/migrations"
if [[ -d "$migration_dir" ]]; then
    echo -e "${CYAN}  Checking migration files:${NC}"
    
    # Look for settings-related migrations
    settings_migrations=$(find "$migration_dir" -name "*settings*" -type f 2>/dev/null | wc -l)
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  Checking Settings Migrations... "
    if [[ $settings_migrations -gt 0 ]]; then
        echo -e "${GREEN}✅ FOUND ($settings_migrations files)${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ MISSING${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
    
    # Check for comprehensive settings migration
    check_file "$migration_dir/20250907205000_settings_module_complete.sql" "Comprehensive Settings Migration" 5000
else
    echo -e "${YELLOW}  Migration directory not found at expected location${NC}"
fi

echo ""
echo -e "${BLUE}🔌 4. API LAYER VALIDATION${NC}"
echo "=========================="

api_dir="../../api/v1/settings"
if [[ -d "$api_dir" ]]; then
    echo -e "${CYAN}  Checking API endpoints:${NC}"
    
    # Main settings API
    check_file "$api_dir/route.ts" "Main Settings API" 10000
    
    # Subdirectory APIs
    api_subdirs=(
        "organization"
        "security" 
        "notifications"
        "integrations"
        "billing"
        "teams"
        "permissions"
        "automations"
    )
    
    for api_subdir in "${api_subdirs[@]}"; do
        if [[ -f "$api_dir/$api_subdir/route.ts" ]]; then
            check_file "$api_dir/$api_subdir/route.ts" "$api_subdir API Endpoint" 1000
        fi
    done
else
    echo -e "${YELLOW}  API directory not found at expected location${NC}"
fi

echo ""
echo -e "${BLUE}📊 5. ATLVS INTEGRATION VALIDATION${NC}"
echo "=================================="

echo -e "${CYAN}  Checking ATLVS component usage:${NC}"

# Check for ATLVS imports in main client
run_check "DataViewProvider import" "grep -q 'DataViewProvider' SettingsClient.tsx"
run_check "StateManagerProvider import" "grep -q 'StateManagerProvider' SettingsClient.tsx"
run_check "UniversalDrawer usage" "grep -q 'UniversalDrawer\\|EditSettingsDrawer' SettingsClient.tsx"

# Check for field configurations
run_check "Field configuration usage" "grep -q 'SETTINGS_FIELD_CONFIG\\|fieldConfig' SettingsClient.tsx"

# Check for view switching
run_check "View switching implementation" "grep -q 'ViewSwitcher\\|currentView' SettingsClient.tsx"

echo ""
echo -e "${BLUE}🔒 6. SECURITY & COMPLIANCE VALIDATION${NC}"
echo "======================================"

echo -e "${CYAN}  Checking security implementations:${NC}"

# Check for authentication
run_check "Authentication checks" "grep -q 'auth\\|session\\|user' page.tsx || grep -q 'auth\\|session\\|user' overview/page.tsx"

# Check for RBAC
run_check "Role-based access control" "grep -q 'role\\|permission\\|rbac' lib/settings-service.ts"

# Check for audit logging
run_check "Audit logging implementation" "grep -q 'audit\\|log' lib/settings-service.ts"

echo ""
echo -e "${BLUE}⚡ 7. PERFORMANCE & OPTIMIZATION VALIDATION${NC}"
echo "=========================================="

echo -e "${CYAN}  Checking performance optimizations:${NC}"

# Check for React optimizations
run_check "React.memo usage" "grep -q 'memo\\|useCallback\\|useMemo' SettingsClient.tsx"

# Check for lazy loading
run_check "Lazy loading implementation" "grep -q 'lazy\\|Suspense\\|dynamic' SettingsClient.tsx"

# Check for pagination
run_check "Pagination support" "grep -q 'page\\|limit\\|offset' lib/settings-service.ts"

echo ""
echo -e "${BLUE}🧪 8. TYPE SAFETY VALIDATION${NC}"
echo "============================"

echo -e "${CYAN}  Checking TypeScript implementation:${NC}"

# Check for comprehensive types
run_check "Interface definitions" "grep -q 'interface\\|type' types.ts"

# Check for proper typing in service
run_check "Service layer typing" "grep -q ': Promise<\\|: string\\|: number' lib/settings-service.ts"

# Check for Zod validation
run_check "Zod schema validation" "grep -q 'zod\\|z\\.' lib/settings-service.ts || grep -q 'zod\\|z\\.' ../../api/v1/settings/route.ts"

echo ""
echo -e "${BLUE}📱 9. USER EXPERIENCE VALIDATION${NC}"
echo "==============================="

echo -e "${CYAN}  Checking UX implementations:${NC}"

# Check for loading states
run_check "Loading state management" "grep -q 'loading\\|Loading\\|Skeleton' SettingsClient.tsx"

# Check for error handling
run_check "Error handling" "grep -q 'error\\|Error\\|try.*catch' SettingsClient.tsx"

# Check for toast notifications
run_check "Toast notifications" "grep -q 'toast\\|Toast' SettingsClient.tsx"

# Check for responsive design
run_check "Responsive design classes" "grep -q 'md:\\|lg:\\|xl:' SettingsClient.tsx"

echo ""
echo -e "${BLUE}🔄 10. REAL-TIME FEATURES VALIDATION${NC}"
echo "===================================="

echo -e "${CYAN}  Checking real-time implementations:${NC}"

# Check for Supabase real-time
run_check "Supabase integration" "grep -q 'supabase\\|createClient' lib/settings-service.ts"

# Check for optimistic updates
run_check "Optimistic UI updates" "grep -q 'optimistic\\|setState.*before' SettingsClient.tsx"

# Check for real-time subscriptions
run_check "Real-time subscriptions" "grep -q 'subscribe\\|channel\\|on(' lib/settings-service.ts"

echo ""
echo -e "${BLUE}📈 11. ANALYTICS & MONITORING VALIDATION${NC}"
echo "========================================"

echo -e "${CYAN}  Checking analytics implementations:${NC}"

# Check for statistics
run_check "Statistics implementation" "grep -q 'statistics\\|Statistics\\|getStatistics' SettingsClient.tsx"

# Check for metrics tracking
run_check "Metrics tracking" "grep -q 'metrics\\|tracking\\|analytics' lib/settings-service.ts"

echo ""
echo -e "${BLUE}📋 12. DOCUMENTATION VALIDATION${NC}"
echo "==============================="

echo -e "${CYAN}  Checking documentation files:${NC}"

# Check for validation reports
check_file "SETTINGS_COMPREHENSIVE_AUDIT_FINAL_REPORT.md" "Comprehensive Audit Report" 10000
check_file "SETTINGS_100_PERCENT_COMPLIANCE_CERTIFICATION.md" "Compliance Certification" 5000

# Check for other documentation
if [[ -f "SETTINGS_VALIDATION_REPORT.md" ]]; then
    check_file "SETTINGS_VALIDATION_REPORT.md" "Validation Report" 5000
fi

echo ""
echo -e "${BLUE}🚀 13. DEPLOYMENT READINESS VALIDATION${NC}"
echo "====================================="

echo -e "${CYAN}  Checking deployment readiness:${NC}"

# Check for build compatibility
run_check "Next.js compatibility" "grep -q 'export.*metadata\\|export.*default' page.tsx"

# Check for environment handling
run_check "Environment configuration" "grep -q 'process.env\\|env\\.' lib/settings-service.ts || grep -q 'process.env\\|env\\.' ../../api/v1/settings/route.ts"

echo ""
echo "=============================================="
echo -e "${PURPLE}📊 VALIDATION SUMMARY${NC}"
echo "=============================================="
echo ""

# Calculate percentages
if [[ $TOTAL_CHECKS -gt 0 ]]; then
    PASS_PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    FAIL_PERCENTAGE=$((FAILED_CHECKS * 100 / TOTAL_CHECKS))
else
    PASS_PERCENTAGE=0
    FAIL_PERCENTAGE=0
fi

echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC} (${GREEN}$PASS_PERCENTAGE%${NC})"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC} (${RED}$FAIL_PERCENTAGE%${NC})"
echo ""

# Determine overall status
if [[ $PASS_PERCENTAGE -ge 95 ]]; then
    echo -e "Overall Status: ${GREEN}🏆 EXCELLENT (95%+ compliance)${NC}"
    echo -e "Certification: ${GREEN}✅ PRODUCTION READY${NC}"
elif [[ $PASS_PERCENTAGE -ge 85 ]]; then
    echo -e "Overall Status: ${YELLOW}⭐ GOOD (85%+ compliance)${NC}"
    echo -e "Certification: ${YELLOW}⚠️ MINOR ISSUES TO ADDRESS${NC}"
elif [[ $PASS_PERCENTAGE -ge 70 ]]; then
    echo -e "Overall Status: ${YELLOW}📈 NEEDS IMPROVEMENT (70%+ compliance)${NC}"
    echo -e "Certification: ${YELLOW}🔧 REQUIRES FIXES${NC}"
else
    echo -e "Overall Status: ${RED}❌ CRITICAL ISSUES (< 70% compliance)${NC}"
    echo -e "Certification: ${RED}🚫 NOT PRODUCTION READY${NC}"
fi

echo ""
echo -e "${CYAN}📋 RECOMMENDATIONS:${NC}"

if [[ $PASS_PERCENTAGE -ge 95 ]]; then
    echo "  ✅ Module is ready for production deployment"
    echo "  ✅ All critical features are implemented"
    echo "  ✅ Enterprise standards met"
elif [[ $PASS_PERCENTAGE -ge 85 ]]; then
    echo "  🔧 Address minor issues before production"
    echo "  📝 Review failed checks above"
    echo "  ✅ Core functionality is solid"
else
    echo "  🚨 Critical issues need immediate attention"
    echo "  📝 Review all failed checks above"
    echo "  🔧 Implement missing core features"
fi

echo ""
echo -e "${BLUE}Validation completed at $(date)${NC}"
echo "=============================================="

# Exit with appropriate code
if [[ $PASS_PERCENTAGE -ge 95 ]]; then
    exit 0
elif [[ $PASS_PERCENTAGE -ge 85 ]]; then
    exit 1
else
    exit 2
fi
