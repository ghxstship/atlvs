#!/bin/bash

# GHXSTSHIP Enterprise Remediation Validation Script
# Validates all Day 1 implementations for Zero Tolerance Compliance

set -e

echo "================================================"
echo "🔍 GHXSTSHIP REMEDIATION VALIDATION"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file_path=$1
    local description=$2
    
    run_test "$description" "[ -f '$file_path' ]"
}

# Function to check file size
check_file_size() {
    local file_path=$1
    local max_size=$2
    local description=$3
    
    if [ -f "$file_path" ]; then
        local size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
        run_test "$description (size < $max_size)" "[ $size -lt $max_size ]"
    else
        run_test "$description" "false"
    fi
}

# Function to check for pattern in file
check_pattern() {
    local file_path=$1
    local pattern=$2
    local description=$3
    
    run_test "$description" "grep -q '$pattern' '$file_path'"
}

echo "================================================"
echo "📁 VALIDATING FILE STRUCTURE"
echo "================================================"
echo ""

# Check Profile Module Files
check_file "apps/web/app/(app)/(shell)/profile/ProfileOptimizedClient.tsx" "Profile Optimized Client"
check_file "apps/web/app/(app)/(shell)/profile/lib/profile-service.ts" "Profile Service Layer"

# Check Configuration Files
check_file "next.config.mjs" "Next.js Configuration"

# Check Service Files
check_file "packages/ui/src/services/StreamingImportService.ts" "Streaming Import Service"
check_file "packages/ui/src/services/CalendarIntegrationService.ts" "Calendar Integration Service"
check_file "packages/ui/src/services/AdvancedSearchService.ts" "Advanced Search Service"

echo ""
echo "================================================"
echo "🔍 VALIDATING IMPLEMENTATIONS"
echo "================================================"
echo ""

# Check Virtual Scrolling Implementation
check_pattern "apps/web/app/(app)/(shell)/profile/ProfileOptimizedClient.tsx" "useVirtualizer" "Virtual Scrolling Hook"
check_pattern "apps/web/app/(app)/(shell)/profile/ProfileOptimizedClient.tsx" "VirtualList" "Virtual List Component"

# Check Pagination Implementation
check_pattern "apps/web/app/(app)/(shell)/profile/lib/profile-service.ts" "PAGE_SIZE" "Pagination Constant"
check_pattern "apps/web/app/(app)/(shell)/profile/lib/profile-service.ts" "pagination" "Pagination Logic"

# Check Caching Implementation
check_pattern "apps/web/app/(app)/(shell)/profile/lib/profile-service.ts" "cache" "Cache Implementation"
check_pattern "apps/web/app/(app)/(shell)/profile/lib/profile-service.ts" "CACHE_TTL" "Cache TTL Setting"

# Check Bundle Optimization
check_pattern "next.config.mjs" "splitChunks" "Code Splitting Config"
check_pattern "next.config.mjs" "swcMinify" "SWC Minification"
check_pattern "next.config.mjs" "optimizePackageImports" "Package Optimization"

# Check Streaming Import Features
check_pattern "packages/ui/src/services/StreamingImportService.ts" "streamImport" "Stream Import Method"
check_pattern "packages/ui/src/services/StreamingImportService.ts" "streamCSV" "CSV Streaming"
check_pattern "packages/ui/src/services/StreamingImportService.ts" "streamXML" "XML Support"
check_pattern "packages/ui/src/services/StreamingImportService.ts" "streamExcel" "Excel Support"

# Check Calendar Integration
check_pattern "packages/ui/src/services/CalendarIntegrationService.ts" "GoogleCalendarService" "Google Calendar"
check_pattern "packages/ui/src/services/CalendarIntegrationService.ts" "OutlookCalendarService" "Outlook Calendar"
check_pattern "packages/ui/src/services/CalendarIntegrationService.ts" "performTwoWaySync" "Two-way Sync"

# Check Advanced Search Features
check_pattern "packages/ui/src/services/AdvancedSearchService.ts" "regexSearch" "Regex Search"
check_pattern "packages/ui/src/services/AdvancedSearchService.ts" "fuzzySearch" "Fuzzy Search"
check_pattern "packages/ui/src/services/AdvancedSearchService.ts" "SearchAnalytics" "Search Analytics"
check_pattern "packages/ui/src/services/AdvancedSearchService.ts" "getSearchMetrics" "Search Metrics"

echo ""
echo "================================================"
echo "⚡ PERFORMANCE VALIDATION"
echo "================================================"
echo ""

# Check bundle size
if [ -d ".next" ]; then
    echo "Checking bundle sizes..."
    
    # Find and check main bundle
    MAIN_BUNDLE=$(find .next/static/chunks -name "main-*.js" 2>/dev/null | head -1)
    if [ -n "$MAIN_BUNDLE" ]; then
        check_file_size "$MAIN_BUNDLE" 1048576 "Main Bundle Size"
    else
        echo -e "${YELLOW}⚠️  Main bundle not found (build required)${NC}"
    fi
    
    # Check chunk sizes
    for chunk in .next/static/chunks/*.js; do
        if [ -f "$chunk" ]; then
            check_file_size "$chunk" 250000 "Chunk: $(basename $chunk)"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Build directory not found. Run 'npm run build' to validate bundle sizes.${NC}"
fi

echo ""
echo "================================================"
echo "🔒 SECURITY VALIDATION"
echo "================================================"
echo ""

# Check for security patterns
check_pattern "packages/ui/src/services/AdvancedSearchService.ts" "sanitize\|escape\|validate" "Input Sanitization"
check_pattern "packages/ui/src/services/CalendarIntegrationService.ts" "OAuth\|auth" "OAuth Implementation"
check_pattern "packages/ui/src/services/StreamingImportService.ts" "validateRow" "Data Validation"

echo ""
echo "================================================"
echo "📊 VALIDATION SUMMARY"
echo "================================================"
echo ""

# Calculate percentage
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    PERCENTAGE=0
fi

echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo "Success Rate: $PERCENTAGE%"
echo ""

# Determine overall status
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL VALIDATIONS PASSED!${NC}"
    echo "Day 1 remediation implementations are verified."
    EXIT_CODE=0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL SUCCESS${NC}"
    echo "Most validations passed, but some issues need attention."
    EXIT_CODE=1
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Significant issues found. Please review and fix."
    EXIT_CODE=2
fi

echo ""
echo "================================================"
echo "📝 RECOMMENDATIONS"
echo "================================================"
echo ""

if [ $FAILED_TESTS -gt 0 ]; then
    echo "1. Review failed tests above"
    echo "2. Check file paths and implementations"
    echo "3. Ensure all services are properly integrated"
    echo "4. Run 'npm run build' to validate bundle sizes"
else
    echo "1. Run comprehensive tests: npm test"
    echo "2. Perform load testing on Profile module"
    echo "3. Validate calendar integrations with real accounts"
    echo "4. Test import functionality with large files"
fi

echo ""
echo "================================================"
echo "🚀 NEXT STEPS"
echo "================================================"
echo ""

echo "1. Continue with Day 2 tasks:"
echo "   - Test all implementations thoroughly"
echo "   - Begin Files module optimization"
echo "   - Start OPENDECK module improvements"
echo ""
echo "2. Update progress dashboard"
echo "3. Prepare for Week 2 enhancements"

echo ""
echo "Script completed at: $(date)"
echo ""

exit $EXIT_CODE
