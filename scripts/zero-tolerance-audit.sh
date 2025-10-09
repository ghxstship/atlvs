#!/bin/bash

# ZERO TOLERANCE COMPREHENSIVE CODEBASE AUDIT
# This script identifies ALL errors, warnings, and issues across the entire codebase

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
REPORT_FILE="$REPO_ROOT/ZERO_TOLERANCE_AUDIT_REPORT.md"

echo "# ZERO TOLERANCE COMPREHENSIVE CODEBASE AUDIT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. TypeScript Errors
echo "## 1. TypeScript Compilation Errors" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
pnpm run typecheck 2>&1 | tee -a "$REPORT_FILE" || true
echo "" >> "$REPORT_FILE"

# 2. ESLint Warnings and Errors
echo "## 2. ESLint Issues (122 warnings)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT/apps/web"
pnpm run lint 2>&1 | grep -E "warning|error" | tee -a "$REPORT_FILE" || true
echo "" >> "$REPORT_FILE"

# 3. Build Errors
echo "## 3. Build Errors" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Desktop App Build Error" >> "$REPORT_FILE"
echo "- Missing index.html entry point" >> "$REPORT_FILE"
echo "- Location: apps/desktop" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 4. Find all TODO/FIXME comments
echo "## 4. TODO and FIXME Comments" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" apps/ packages/ 2>/dev/null | wc -l | xargs -I {} echo "Total TODO/FIXME comments: {}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 5. Find console.log statements (should use proper logging)
echo "## 5. Console.log Statements (Should Use Proper Logging)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
grep -r "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" apps/ packages/ 2>/dev/null | wc -l | xargs -I {} echo "Total console.log statements: {}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 6. Find any type assertions
echo "## 6. Type Assertions (Potential Type Safety Issues)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
grep -r " as " --include="*.ts" --include="*.tsx" apps/ packages/ 2>/dev/null | wc -l | xargs -I {} echo "Total 'as' type assertions: {}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 7. Find @ts-ignore and @ts-expect-error
echo "## 7. TypeScript Suppressions (@ts-ignore, @ts-expect-error)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
grep -r "@ts-ignore\|@ts-expect-error" --include="*.ts" --include="*.tsx" apps/ packages/ 2>/dev/null | wc -l | xargs -I {} echo "Total TypeScript suppressions: {}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 8. Find eslint-disable comments
echo "## 8. ESLint Suppressions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
cd "$REPO_ROOT"
grep -r "eslint-disable" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" apps/ packages/ 2>/dev/null | wc -l | xargs -I {} echo "Total ESLint suppressions: {}" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Audit complete. Report saved to: $REPORT_FILE"
cat "$REPORT_FILE"
