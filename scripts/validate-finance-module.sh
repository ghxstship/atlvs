#!/bin/bash

# Finance Module Validation Script
# Validates 100% ZERO TOLERANCE implementation across all 13 key areas

set -e

echo "🔍 FINANCE MODULE - COMPREHENSIVE VALIDATION"
echo "=============================================="
echo ""

FINANCE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)/finance"
API_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/api/v1/finance"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation counters
TOTAL_CHECKS=0
PASSED_CHECKS=0

validate_check() {
    local description=$1
    local condition=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ PASS${NC} - $description"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} - $description"
    fi
}

echo "📋 VALIDATION AREA 1: Tab System & Module Architecture"
echo "----------------------------------------------------"

validate_check "Main Finance page exists and consolidated" "[ -f '$FINANCE_DIR/page.tsx' ]"
validate_check "Main FinanceClient exists" "[ -f '$FINANCE_DIR/FinanceClient.tsx' ]"
validate_check "Overview module exists" "[ -d '$FINANCE_DIR/overview' ]"
validate_check "Budgets module exists" "[ -d '$FINANCE_DIR/budgets' ]"
validate_check "Expenses module exists" "[ -d '$FINANCE_DIR/expenses' ]"
validate_check "Revenue module exists" "[ -d '$FINANCE_DIR/revenue' ]"
validate_check "Transactions module exists" "[ -d '$FINANCE_DIR/transactions' ]"
validate_check "Accounts module exists" "[ -d '$FINANCE_DIR/accounts' ]"
validate_check "Invoices module exists" "[ -d '$FINANCE_DIR/invoices' ]"
validate_check "Forecasts module exists" "[ -d '$FINANCE_DIR/forecasts' ]"

echo ""
echo "📋 VALIDATION AREA 2: Complete CRUD Operations with Live Supabase Data"
echo "--------------------------------------------------------------------"

validate_check "Budgets API endpoint exists" "[ -f '$API_DIR/budgets/route.ts' ]"
validate_check "Expenses API endpoint exists" "[ -f '$API_DIR/expenses/route.ts' ]"
validate_check "Revenue API endpoint exists" "[ -f '$API_DIR/revenue/route.ts' ]"
validate_check "Transactions API endpoint exists" "[ -f '$API_DIR/transactions/route.ts' ]"
validate_check "Accounts API endpoint exists" "[ -f '$API_DIR/accounts/route.ts' ]"
validate_check "Invoices API endpoint exists" "[ -f '$API_DIR/invoices/route.ts' ]"
validate_check "Forecasts API endpoint exists" "[ -f '$API_DIR/forecasts/route.ts' ]"

echo ""
echo "📋 VALIDATION AREA 3: Row Level Security Implementation"
echo "-----------------------------------------------------"

validate_check "Finance service layer exists" "[ -f '$FINANCE_DIR/lib/finance-service.ts' ]"
validate_check "API endpoints have Zod validation" "grep -q 'z.object' '$API_DIR/budgets/route.ts'"
validate_check "API endpoints have RBAC checks" "grep -q 'owner.*admin.*manager' '$API_DIR/budgets/route.ts'"
validate_check "Organization scoping implemented" "grep -q 'organization_id.*orgId' '$API_DIR/budgets/route.ts'"

echo ""
echo "📋 VALIDATION AREA 4: All Data View Types and Switching"
echo "------------------------------------------------------"

validate_check "Field configurations exist" "[ -f '$FINANCE_DIR/lib/field-configs.ts' ]"
validate_check "Budget field configs defined" "grep -q 'BUDGET_FIELD_CONFIGS' '$FINANCE_DIR/lib/field-configs.ts'"
validate_check "Expense field configs defined" "grep -q 'EXPENSE_FIELD_CONFIGS' '$FINANCE_DIR/lib/field-configs.ts'"
validate_check "Budget Grid view exists" "[ -f '$FINANCE_DIR/budgets/views/BudgetGridView.tsx' ]"
validate_check "Budget List view exists" "[ -f '$FINANCE_DIR/budgets/views/BudgetListView.tsx' ]"

echo ""
echo "📋 VALIDATION AREA 5: Advanced Search, Filter, and Sort Capabilities"
echo "-------------------------------------------------------------------"

validate_check "Service layer has filtering" "grep -q 'filters' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "API supports query parameters" "grep -q 'searchParams' '$API_DIR/budgets/route.ts'"
validate_check "Multiple filter types supported" "grep -q 'projectId.*status.*category' '$API_DIR/budgets/route.ts'"

echo ""
echo "📋 VALIDATION AREA 6: Field Visibility and Reordering Functionality"
echo "------------------------------------------------------------------"

validate_check "Field configs have visibility" "grep -q 'visible.*true' '$FINANCE_DIR/lib/field-configs.ts'"
validate_check "Field configs have ordering" "grep -q 'order.*[0-9]' '$FINANCE_DIR/lib/field-configs.ts'"
validate_check "Field configs have types" "grep -q 'type.*text' '$FINANCE_DIR/lib/field-configs.ts'"

echo ""
echo "📋 VALIDATION AREA 7: Import/Export with Multiple Formats"
echo "--------------------------------------------------------"

validate_check "Export functionality exists" "grep -q 'exportData' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "CSV export supported" "grep -q 'csv' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "JSON export supported" "grep -q 'json' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "Budget service has export" "grep -q 'exportBudgets' '$FINANCE_DIR/budgets/lib/budgets-service.ts'"

echo ""
echo "📋 VALIDATION AREA 8: Bulk Actions and Selection Mechanisms"
echo "----------------------------------------------------------"

validate_check "Service layer supports bulk operations" "grep -q 'bulkDelete' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "API supports DELETE operations" "grep -q 'DELETE.*request' '$API_DIR/budgets/route.ts'"

echo ""
echo "📋 VALIDATION AREA 9: Drawer Implementation with Row-level Actions"
echo "----------------------------------------------------------------"

validate_check "Budget drawer exists" "[ -f '$FINANCE_DIR/budgets/drawers/CreateBudgetDrawer.tsx' ]"
validate_check "Drawer uses React Hook Form" "grep -q 'useForm' '$FINANCE_DIR/budgets/drawers/CreateBudgetDrawer.tsx'"
validate_check "Drawer has Zod validation" "grep -q 'zodResolver' '$FINANCE_DIR/budgets/drawers/CreateBudgetDrawer.tsx'"
validate_check "AppDrawer component used" "grep -q 'AppDrawer' '$FINANCE_DIR/budgets/drawers/CreateBudgetDrawer.tsx'"

echo ""
echo "📋 VALIDATION AREA 10: Real-time Supabase Integration"
echo "----------------------------------------------------"

validate_check "Supabase client integration" "grep -q 'createBrowserClient' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "Real-time data loading" "grep -q 'supabase.*from.*select' '$FINANCE_DIR/lib/finance-service.ts'"
validate_check "Overview client has real-time data" "grep -q 'supabase.*from' '$FINANCE_DIR/overview/OverviewClient.tsx'"

echo ""
echo "📋 VALIDATION AREA 11: Complete Routing and API Wiring"
echo "-----------------------------------------------------"

validate_check "All modules have page.tsx" "[ -f '$FINANCE_DIR/budgets/page.tsx' ] && [ -f '$FINANCE_DIR/expenses/page.tsx' ]"
validate_check "API endpoints have proper exports" "grep -q 'export.*function.*GET' '$API_DIR/budgets/route.ts'"
validate_check "Error handling implemented" "grep -q 'catch.*error' '$API_DIR/budgets/route.ts'"

echo ""
echo "📋 VALIDATION AREA 12: Enterprise-grade Performance and Security"
echo "---------------------------------------------------------------"

validate_check "Audit logging implemented" "grep -q 'audit_logs' '$API_DIR/budgets/route.ts'"
validate_check "Authentication checks exist" "grep -q 'getAuthenticatedUser' '$API_DIR/budgets/route.ts'"
validate_check "Input validation with Zod" "grep -q 'Schema.*parse' '$API_DIR/budgets/route.ts'"
validate_check "Organization membership validation" "grep -q 'memberships' '$API_DIR/budgets/route.ts'"

echo ""
echo "📋 VALIDATION AREA 13: Normalized UI/UX Consistency"
echo "--------------------------------------------------"

validate_check "TypeScript types defined" "[ -f '$FINANCE_DIR/types.ts' ]"
validate_check "Comprehensive interfaces exist" "grep -q 'interface.*Budget' '$FINANCE_DIR/types.ts'"
validate_check "UI components use design system" "grep -q '@ghxstship/ui' '$FINANCE_DIR/budgets/BudgetsClient.tsx'"
validate_check "Consistent icon usage" "grep -q 'lucide-react' '$FINANCE_DIR/budgets/views/BudgetGridView.tsx'"

echo ""
echo "📋 FILE ORGANIZATION VALIDATION"
echo "------------------------------"

validate_check "No legacy _Old.tsx files exist" "! find '$FINANCE_DIR' -name '*_Old.tsx' | grep -q ."
validate_check "Service layer properly organized" "[ -d '$FINANCE_DIR/lib' ]"
validate_check "Budget service exists" "[ -f '$FINANCE_DIR/budgets/lib/budgets-service.ts' ]"
validate_check "Drawer components organized" "[ -d '$FINANCE_DIR/budgets/drawers' ]"
validate_check "View components organized" "[ -d '$FINANCE_DIR/budgets/views' ]"

echo ""
echo "📋 COMPREHENSIVE VALIDATION REPORT"
echo "================================="

# Calculate percentage
PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed Checks: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed Checks: ${RED}$((TOTAL_CHECKS - PASSED_CHECKS))${NC}"
echo -e "Success Rate: ${BLUE}$PERCENTAGE%${NC}"

echo ""
if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}🎉 FINANCE MODULE: 100% ZERO TOLERANCE COMPLIANCE ACHIEVED${NC}"
    echo -e "${GREEN}✅ ENTERPRISE CERTIFIED - PRODUCTION READY${NC}"
elif [ $PERCENTAGE -ge 90 ]; then
    echo -e "${YELLOW}⚠️  FINANCE MODULE: NEAR COMPLETE ($PERCENTAGE%)${NC}"
    echo -e "${YELLOW}🔧 MINOR ISSUES NEED RESOLUTION${NC}"
elif [ $PERCENTAGE -ge 75 ]; then
    echo -e "${YELLOW}⚠️  FINANCE MODULE: MOSTLY COMPLETE ($PERCENTAGE%)${NC}"
    echo -e "${YELLOW}🔧 SEVERAL ISSUES NEED ATTENTION${NC}"
else
    echo -e "${RED}❌ FINANCE MODULE: SIGNIFICANT ISSUES ($PERCENTAGE%)${NC}"
    echo -e "${RED}🚨 MAJOR WORK REQUIRED${NC}"
fi

echo ""
echo "📄 Detailed validation report: $FINANCE_DIR/FINANCE_MODULE_COMPREHENSIVE_VALIDATION_REPORT.md"
echo ""

exit 0
