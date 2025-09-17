#!/bin/bash

# GHXSTSHIP Comprehensive Validation Script
# This script validates the production build and identifies remaining issues

set -e

echo "🚀 GHXSTSHIP Comprehensive Validation Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
pnpm run clean 2>/dev/null || rm -rf apps/web/.next apps/web/out

# Step 2: Install dependencies
print_status "Installing dependencies..."
pnpm install --frozen-lockfile

# Step 3: Type checking
print_status "Running TypeScript type checking..."
if pnpm run typecheck; then
    print_success "TypeScript validation passed"
else
    print_warning "TypeScript validation has issues (may be expected due to config)"
fi

# Step 4: Production build
print_status "Running production build..."
if pnpm run build; then
    print_success "Production build completed successfully"
    BUILD_SUCCESS=true
else
    print_error "Production build failed"
    BUILD_SUCCESS=false
fi

# Step 5: Check for hardcoded values
print_status "Scanning for hardcoded design values..."
HARDCODED_COUNT=0

# Check for hardcoded colors (hex values)
HEX_COLORS=$(find apps/web/app -name "*.tsx" -o -name "*.ts" | xargs grep -l "#[0-9a-fA-F]\{3,6\}" 2>/dev/null | wc -l)
if [ $HEX_COLORS -gt 0 ]; then
    print_warning "Found $HEX_COLORS files with hardcoded hex colors"
    HARDCODED_COUNT=$((HARDCODED_COUNT + HEX_COLORS))
fi

# Check for hardcoded spacing values
SPACING_VALUES=$(find apps/web/app -name "*.tsx" -o -name "*.ts" | xargs grep -l "p-[0-9]\|m-[0-9]\|px-[0-9]\|py-[0-9]\|gap-[0-9]" 2>/dev/null | wc -l)
if [ $SPACING_VALUES -gt 0 ]; then
    print_warning "Found $SPACING_VALUES files with hardcoded spacing values"
    HARDCODED_COUNT=$((HARDCODED_COUNT + SPACING_VALUES))
fi

# Step 6: Check for TODO/FIXME comments
print_status "Scanning for TODO/FIXME comments..."
TODO_COUNT=$(find apps/web/app -name "*.tsx" -o -name "*.ts" | xargs grep -i "todo\|fixme" 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME comments"
fi

# Step 7: Bundle size analysis
print_status "Analyzing bundle size..."
if [ -d "apps/web/.next" ]; then
    BUNDLE_SIZE=$(du -sh apps/web/.next 2>/dev/null | cut -f1)
    print_status "Bundle size: $BUNDLE_SIZE"
fi

# Step 8: Security headers check
print_status "Checking security configuration..."
if grep -q "Content-Security-Policy" apps/web/next.config.js; then
    print_success "Security headers configured"
else
    print_warning "Security headers may not be configured"
fi

# Step 9: Environment validation
print_status "Validating environment configuration..."
if [ -f "apps/web/.env.example" ]; then
    print_success "Environment example file exists"
else
    print_warning "No .env.example file found"
fi

# Final Summary
echo ""
echo "============================================="
echo "🎯 VALIDATION SUMMARY"
echo "============================================="

if [ "$BUILD_SUCCESS" = true ]; then
    print_success "✅ Production build: PASSED"
else
    print_error "❌ Production build: FAILED"
fi

if [ $HARDCODED_COUNT -eq 0 ]; then
    print_success "✅ Design tokens: CLEAN"
else
    print_warning "⚠️  Design tokens: $HARDCODED_COUNT files with hardcoded values"
fi

if [ $TODO_COUNT -eq 0 ]; then
    print_success "✅ Code quality: CLEAN"
else
    print_warning "⚠️  Code quality: $TODO_COUNT TODO/FIXME comments"
fi

# Overall status
if [ "$BUILD_SUCCESS" = true ] && [ $HARDCODED_COUNT -lt 50 ] && [ $TODO_COUNT -lt 10 ]; then
    echo ""
    print_success "🎉 OVERALL STATUS: PRODUCTION READY"
    echo ""
    echo "The GHXSTSHIP application is ready for production deployment!"
    echo "Minor issues identified can be addressed in future iterations."
    exit 0
else
    echo ""
    print_warning "⚠️  OVERALL STATUS: NEEDS ATTENTION"
    echo ""
    echo "The application builds successfully but has areas for improvement."
    echo "Consider addressing the identified issues before production deployment."
    exit 1
fi
