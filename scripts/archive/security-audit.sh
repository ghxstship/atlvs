#!/bin/bash

# Security Audit Script
# Scans for hardcoded secrets, debug code, and security vulnerabilities

set -e

echo "🔒 GHXSTSHIP Security Audit - Starting..."
echo "=========================================="

ISSUES_FOUND=0

# 1. Check for hardcoded secrets
echo ""
echo "1️⃣ Scanning for hardcoded secrets..."
if grep -r -E "(api_key|apikey|api-key|API_KEY|secret|SECRET|password|PASSWORD|token|TOKEN|PRIVATE_KEY|private_key)" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude-dir="dist" \
  --exclude-dir="coverage" \
  --exclude-dir="build" \
  --exclude="*.test.*" \
  --exclude="*.spec.*" \
  . 2>/dev/null; then
  echo "⚠️  Potential hardcoded secrets found!"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No hardcoded secrets detected"
fi

# 2. Check for console.log and debugger statements
echo ""
echo "2️⃣ Scanning for debug statements..."
DEBUG_COUNT=$(grep -r -E "(console\.(log|debug|trace)|debugger)" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude-dir="dist" \
  --exclude="*.test.*" \
  --exclude="*.spec.*" \
  . 2>/dev/null | wc -l || echo "0")

if [ "$DEBUG_COUNT" -gt 0 ]; then
  echo "⚠️  Found $DEBUG_COUNT debug statements"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No debug statements found"
fi

# 3. Check for TODO/FIXME comments
echo ""
echo "3️⃣ Scanning for TODO/FIXME comments..."
TODO_COUNT=$(grep -r -E "(TODO|FIXME|HACK|XXX|DEBUG)" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  --exclude-dir="dist" \
  . 2>/dev/null | wc -l || echo "0")

if [ "$TODO_COUNT" -gt 0 ]; then
  echo "⚠️  Found $TODO_COUNT TODO/FIXME comments"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No TODO/FIXME comments found"
fi

# 4. Check .env files are not committed
echo ""
echo "4️⃣ Checking for committed .env files..."
if find . -name ".env*" -not -name ".env.example" -not -path "*/node_modules/*" | grep -q .; then
  echo "⚠️  .env files found in repository!"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No .env files committed"
fi

# 5. Run npm audit
echo ""
echo "5️⃣ Running dependency security audit..."
pnpm audit --audit-level=high --json > audit.json 2>/dev/null || true
VULN_COUNT=$(cat audit.json 2>/dev/null | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0")

if [ "$VULN_COUNT" -gt 0 ]; then
  echo "⚠️  Found $VULN_COUNT high/critical vulnerabilities"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No high/critical vulnerabilities found"
fi

# 6. Check for test files in production build
echo ""
echo "6️⃣ Verifying test file exclusion from builds..."
if [ -d ".next" ]; then
  if find .next -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | grep -q .; then
    echo "⚠️  Test files found in production build!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "✅ No test files in production build"
  fi
else
  echo "ℹ️  No build directory found (run 'pnpm build' first)"
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Security Audit Complete"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All security checks passed!"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND security issues"
  echo ""
  echo "💡 Recommended actions:"
  echo "  1. Remove hardcoded secrets and use environment variables"
  echo "  2. Remove debug statements (console.log, debugger)"
  echo "  3. Resolve or document TODO/FIXME comments"
  echo "  4. Update vulnerable dependencies"
  echo "  5. Ensure .env files are in .gitignore"
  exit 1
fi
