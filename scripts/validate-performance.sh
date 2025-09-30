#!/bin/bash

# Performance Validation Script
# Validates all performance improvements are correctly implemented

set -e

echo "🔍 GHXSTSHIP Performance Validation"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo "1. Checking Dependencies"
echo "------------------------"

# Check web-vitals
if grep -q "web-vitals" apps/web/package.json; then
    check_pass "web-vitals library installed"
else
    check_fail "web-vitals library NOT installed"
fi

# Check next-pwa
if grep -q "next-pwa" apps/web/package.json; then
    check_pass "next-pwa library installed"
else
    check_fail "next-pwa library NOT installed"
fi

# Check workbox
if grep -q "workbox-webpack-plugin" apps/web/package.json; then
    check_pass "workbox-webpack-plugin installed"
else
    check_fail "workbox-webpack-plugin NOT installed"
fi

echo ""
echo "2. Checking Monitoring Infrastructure"
echo "-------------------------------------"

# Check web-vitals monitoring
if [ -f "apps/web/lib/monitoring/web-vitals.ts" ]; then
    check_pass "Web Vitals monitoring file exists"
else
    check_fail "Web Vitals monitoring file MISSING"
fi

# Check memory monitoring
if [ -f "apps/web/lib/monitoring/memory.ts" ]; then
    check_pass "Memory monitoring file exists"
else
    check_fail "Memory monitoring file MISSING"
fi

# Check vitals API endpoint
if [ -f "apps/web/app/api/analytics/vitals/route.ts" ]; then
    check_pass "Vitals API endpoint exists"
else
    check_fail "Vitals API endpoint MISSING"
fi

# Check memory API endpoint
if [ -f "apps/web/app/api/analytics/memory/route.ts" ]; then
    check_pass "Memory API endpoint exists"
else
    check_fail "Memory API endpoint MISSING"
fi

# Check web-vitals integration
if grep -q "initWebVitals" apps/web/app/web-vitals.ts; then
    check_pass "Web Vitals integration active"
else
    check_fail "Web Vitals integration MISSING"
fi

echo ""
echo "3. Checking PWA Configuration"
echo "-----------------------------"

# Check next.config.mjs for PWA
if grep -q "withPWA" apps/web/next.config.mjs; then
    check_pass "PWA configuration in next.config.mjs"
else
    check_fail "PWA configuration MISSING from next.config.mjs"
fi

# Check manifest.json
if [ -f "apps/web/public/manifest.json" ]; then
    check_pass "manifest.json exists"
    
    # Check for required icons in manifest
    if grep -q "icon-192x192" apps/web/public/manifest.json; then
        check_pass "192x192 icon referenced in manifest"
    else
        check_fail "192x192 icon NOT referenced in manifest"
    fi
    
    if grep -q "icon-512x512" apps/web/public/manifest.json; then
        check_pass "512x512 icon referenced in manifest"
    else
        check_fail "512x512 icon NOT referenced in manifest"
    fi
else
    check_fail "manifest.json MISSING"
fi

# Check PWA icons
if [ -f "apps/web/public/icons/icon-192x192.svg" ]; then
    check_pass "192x192 icon exists"
else
    check_fail "192x192 icon MISSING"
fi

if [ -f "apps/web/public/icons/icon-512x512.svg" ]; then
    check_pass "512x512 icon exists"
else
    check_fail "512x512 icon MISSING"
fi

if [ -f "apps/web/public/icons/apple-touch-icon.svg" ]; then
    check_pass "Apple touch icon exists"
else
    check_fail "Apple touch icon MISSING"
fi

# Check HTML head for PWA meta tags
if grep -q 'rel="manifest"' apps/web/app/layout.tsx; then
    check_pass "Manifest link in HTML head"
else
    check_fail "Manifest link MISSING from HTML head"
fi

if grep -q 'rel="apple-touch-icon"' apps/web/app/layout.tsx; then
    check_pass "Apple touch icon link in HTML head"
else
    check_fail "Apple touch icon link MISSING from HTML head"
fi

echo ""
echo "4. Checking Image Optimization"
echo "------------------------------"

# Check image configuration
if grep -q "images:" apps/web/next.config.mjs; then
    check_pass "Image optimization configured"
    
    if grep -q "supabase.co" apps/web/next.config.mjs; then
        check_pass "Supabase Storage domain configured"
    else
        check_warn "Supabase Storage domain not configured"
    fi
    
    if grep -q "image/avif" apps/web/next.config.mjs; then
        check_pass "AVIF format enabled"
    else
        check_warn "AVIF format not enabled"
    fi
    
    if grep -q "image/webp" apps/web/next.config.mjs; then
        check_pass "WebP format enabled"
    else
        check_warn "WebP format not enabled"
    fi
else
    check_fail "Image optimization NOT configured"
fi

echo ""
echo "5. Checking Load Testing Infrastructure"
echo "---------------------------------------"

# Check load test files
if [ -f "tests/load/basic-load-test.js" ]; then
    check_pass "Basic load test exists"
else
    check_fail "Basic load test MISSING"
fi

if [ -f "tests/load/stress-test.js" ]; then
    check_pass "Stress test exists"
else
    check_fail "Stress test MISSING"
fi

if [ -f "tests/load/README.md" ]; then
    check_pass "Load testing documentation exists"
else
    check_warn "Load testing documentation MISSING"
fi

# Check for k6
if command -v k6 &> /dev/null; then
    check_pass "k6 load testing tool installed"
else
    check_warn "k6 NOT installed (optional: brew install k6)"
fi

echo ""
echo "6. Checking Database Monitoring"
echo "-------------------------------"

if [ -f "scripts/database/performance-queries.sql" ]; then
    check_pass "Database performance queries exist"
else
    check_fail "Database performance queries MISSING"
fi

echo ""
echo "7. Checking Documentation"
echo "------------------------"

DOCS=(
    "docs/PERFORMANCE_SCALABILITY_AUDIT.md"
    "PERFORMANCE_REMEDIATION_PLAN.md"
    "PERFORMANCE_AUDIT_SUMMARY.md"
    "PERFORMANCE_REMEDIATION_COMPLETE.md"
    "PERFORMANCE_100_PERCENT_COMPLETE.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$(basename $doc) exists"
    else
        check_warn "$(basename $doc) MISSING"
    fi
done

echo ""
echo "=================================="
echo "Validation Summary"
echo "=================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

# Calculate percentage
TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo "Overall Completion: $PERCENTAGE%"
    echo ""
    
    if [ $PERCENTAGE -eq 100 ]; then
        echo -e "${GREEN}🎉 100% COMPLETE - ALL VALIDATIONS PASSED!${NC}"
    elif [ $PERCENTAGE -ge 95 ]; then
        echo -e "${GREEN}✅ EXCELLENT - Nearly complete ($PERCENTAGE%)${NC}"
    elif [ $PERCENTAGE -ge 80 ]; then
        echo -e "${YELLOW}⚠️  GOOD - Some items need attention ($PERCENTAGE%)${NC}"
    else
        echo -e "${RED}❌ INCOMPLETE - Significant work needed ($PERCENTAGE%)${NC}"
    fi
fi

echo ""

# Exit with error if any failures
if [ $FAIL -gt 0 ]; then
    echo "❌ Validation failed with $FAIL error(s)"
    exit 1
else
    echo "✅ All critical validations passed!"
    exit 0
fi
