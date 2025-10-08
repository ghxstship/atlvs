#!/bin/bash

# Master Audit Script - Runs All Compliance Audits
# Comprehensive validation across all quality categories

set -e

echo "🚀 GHXSTSHIP Comprehensive Audit Suite"
echo "========================================"
echo ""
echo "Running all compliance audits..."
echo ""

TOTAL_ISSUES=0
FAILED_AUDITS=0

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Security Audit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔒 SECURITY AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/security-audit.sh; then
  echo -e "${GREEN}✅ Security audit PASSED${NC}"
else
  echo -e "${RED}❌ Security audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 2. Architecture Audit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  ARCHITECTURE AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/architecture-audit.sh; then
  echo -e "${GREEN}✅ Architecture audit PASSED${NC}"
else
  echo -e "${RED}❌ Architecture audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 3. Accessibility Audit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "♿ ACCESSIBILITY AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/accessibility-audit.sh; then
  echo -e "${GREEN}✅ Accessibility audit PASSED${NC}"
else
  echo -e "${RED}❌ Accessibility audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 4. Performance Audit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚡ PERFORMANCE AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/performance-audit.sh; then
  echo -e "${GREEN}✅ Performance audit PASSED${NC}"
else
  echo -e "${RED}❌ Performance audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 5. UX Audit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 UX EXCELLENCE AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ./scripts/ux-audit.sh; then
  echo -e "${GREEN}✅ UX audit PASSED${NC}"
else
  echo -e "${RED}❌ UX audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 6. Code Quality (ESLint)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CODE QUALITY AUDIT (ESLint)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm lint:check; then
  echo -e "${GREEN}✅ ESLint audit PASSED${NC}"
else
  echo -e "${RED}❌ ESLint audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 7. TypeScript (Type Checking)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📘 TYPESCRIPT AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm typecheck; then
  echo -e "${GREEN}✅ TypeScript audit PASSED${NC}"
else
  echo -e "${RED}❌ TypeScript audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# 8. Prettier (Formatting)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💅 FORMATTING AUDIT (Prettier)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if pnpm format:check; then
  echo -e "${GREEN}✅ Formatting audit PASSED${NC}"
else
  echo -e "${RED}❌ Formatting audit FAILED${NC}"
  FAILED_AUDITS=$((FAILED_AUDITS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 AUDIT SUITE SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total Audits Run: 8"
echo "Passed: $((8 - FAILED_AUDITS))"
echo "Failed: $FAILED_AUDITS"
echo ""

if [ $FAILED_AUDITS -eq 0 ]; then
  echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                                       ║${NC}"
  echo -e "${GREEN}║   ✅  ALL AUDITS PASSED!  ✅         ║${NC}"
  echo -e "${GREEN}║                                       ║${NC}"
  echo -e "${GREEN}║   GHXSTSHIP is PRODUCTION READY      ║${NC}"
  echo -e "${GREEN}║   Enterprise Grade 2026/2027          ║${NC}"
  echo -e "${GREEN}║                                       ║${NC}"
  echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}╔═══════════════════════════════════════╗${NC}"
  echo -e "${RED}║                                       ║${NC}"
  echo -e "${RED}║   ⚠️  AUDITS FAILED  ⚠️              ║${NC}"
  echo -e "${RED}║                                       ║${NC}"
  echo -e "${RED}║   Please review failures above        ║${NC}"
  echo -e "${RED}║   and run individual audit scripts    ║${NC}"
  echo -e "${RED}║   for detailed information            ║${NC}"
  echo -e "${RED}║                                       ║${NC}"
  echo -e "${RED}╚═══════════════════════════════════════╝${NC}"
  echo ""
  echo "💡 To run individual audits:"
  echo "   ./scripts/security-audit.sh"
  echo "   ./scripts/architecture-audit.sh"
  echo "   ./scripts/accessibility-audit.sh"
  echo "   ./scripts/performance-audit.sh"
  echo "   ./scripts/ux-audit.sh"
  echo "   pnpm lint:check"
  echo "   pnpm typecheck"
  echo "   pnpm format:check"
  echo ""
  exit 1
fi
