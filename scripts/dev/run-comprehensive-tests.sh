#!/bin/bash

# GHXSTSHIP Comprehensive Testing Suite
# Zero Tolerance Enterprise Testing Validation

set -e

echo "🚀 Starting GHXSTSHIP Comprehensive Testing Suite"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
UNIT_PASSED=true
INTEGRATION_PASSED=true
E2E_PASSED=true
ACCESSIBILITY_PASSED=true
PERFORMANCE_PASSED=true
SECURITY_PASSED=true

# Function to run tests with error handling
run_test() {
    local test_name=$1
    local test_command=$2
    local result_var=$3
    
    echo -e "${BLUE}Running ${test_name}...${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} PASSED${NC}"
    else
        echo -e "${RED}❌ ${test_name} FAILED${NC}"
        eval "$result_var=false"
    fi
    echo
}

# Create test results directory
mkdir -p test-results

echo "📊 UNIT TESTING (>95% coverage required)"
echo "----------------------------------------"
run_test "Unit Tests" "pnpm run test:coverage:unit" "UNIT_PASSED"

echo "🔗 INTEGRATION TESTING"
echo "----------------------"
run_test "Integration Tests" "pnpm run test:coverage:integration" "INTEGRATION_PASSED"

echo "🌐 END-TO-END TESTING"
echo "---------------------"
run_test "E2E Tests" "pnpm run test:e2e:ci" "E2E_PASSED"

echo "♿ ACCESSIBILITY TESTING"
echo "-----------------------"
run_test "Accessibility Tests" "pnpm run test:accessibility" "ACCESSIBILITY_PASSED"

echo "⚡ PERFORMANCE TESTING"
echo "----------------------"
run_test "Performance Tests" "pnpm run test:performance" "PERFORMANCE_PASSED"

echo "🔒 SECURITY TESTING"
echo "-------------------"
run_test "Security Tests" "pnpm run test:security" "SECURITY_PASSED"

echo "📈 GENERATING COMPREHENSIVE REPORTS"
echo "===================================="

# Generate coverage report
echo "Generating coverage report..."
pnpm run test:coverage-100 > test-results/coverage-report.txt 2>&1 || true

# Extract coverage percentages
if [ -f "coverage/coverage-summary.json" ]; then
    COVERAGE=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct')
    echo "Code Coverage: ${COVERAGE}%"
    
    if (( $(echo "$COVERAGE >= 95" | bc -l) )); then
        echo -e "${GREEN}✅ Code coverage requirement met (>95%)${NC}"
    else
        echo -e "${RED}❌ Code coverage below requirement: ${COVERAGE}% < 95%${NC}"
        UNIT_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠️  Coverage report not generated${NC}"
fi

# Generate test summary
echo "
🏆 TESTING SUITE COMPLETION REPORT
==================================

Unit Testing (>95% coverage): $(if [ "$UNIT_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
Integration Testing: $(if [ "$INTEGRATION_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
End-to-End Testing: $(if [ "$E2E_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
Accessibility Testing: $(if [ "$ACCESSIBILITY_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
Performance Testing: $(if [ "$PERFORMANCE_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
Security Testing: $(if [ "$SECURITY_PASSED" = true ]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

" > test-results/comprehensive-test-report.txt

# Overall result
if [ "$UNIT_PASSED" = true ] && [ "$INTEGRATION_PASSED" = true ] && [ "$E2E_PASSED" = true ] && [ "$ACCESSIBILITY_PASSED" = true ] && [ "$PERFORMANCE_PASSED" = true ] && [ "$SECURITY_PASSED" = true ]; then
    echo -e "${GREEN}
🎉 ZERO TOLERANCE ENTERPRISE TESTING VALIDATION COMPLETE!
✅ All test categories PASSED
✅ Enterprise-grade quality assurance achieved
✅ Production deployment authorized
${NC}"
    echo "🎉 ZERO TOLERANCE ENTERPRISE TESTING VALIDATION COMPLETE!" >> test-results/comprehensive-test-report.txt
    exit 0
else
    echo -e "${RED}
❌ TESTING VALIDATION FAILED
⚠️  Some test categories failed - review reports above
⚠️  Production deployment blocked until all tests pass
${NC}"
    echo "❌ TESTING VALIDATION FAILED" >> test-results/comprehensive-test-report.txt
    echo "FAILED CATEGORIES:" >> test-results/comprehensive-test-report.txt
    [ "$UNIT_PASSED" = false ] && echo "- Unit Testing" >> test-results/comprehensive-test-report.txt
    [ "$INTEGRATION_PASSED" = false ] && echo "- Integration Testing" >> test-results/comprehensive-test-report.txt
    [ "$E2E_PASSED" = false ] && echo "- End-to-End Testing" >> test-results/comprehensive-test-report.txt
    [ "$ACCESSIBILITY_PASSED" = false ] && echo "- Accessibility Testing" >> test-results/comprehensive-test-report.txt
    [ "$PERFORMANCE_PASSED" = false ] && echo "- Performance Testing" >> test-results/comprehensive-test-report.txt
    [ "$SECURITY_PASSED" = false ] && echo "- Security Testing" >> test-results/comprehensive-test-report.txt
    
    exit 1
fi
