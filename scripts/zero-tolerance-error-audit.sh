#!/bin/bash

# ZERO TOLERANCE ERROR AUDIT SCRIPT
# This script performs a comprehensive audit of all errors, warnings, and issues

echo "🔍 ZERO TOLERANCE ERROR AUDIT - STARTING..."
echo "=============================================="
echo ""

cd "$(dirname "$0")/.."

# Create audit report
REPORT_FILE="ZERO_TOLERANCE_ERROR_AUDIT.md"
echo "# ZERO TOLERANCE ERROR AUDIT REPORT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. TypeScript Errors
echo "📝 Checking TypeScript errors..."
echo "## TypeScript Errors" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
cd apps/web
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -100 >> "../../$REPORT_FILE" || echo "No TypeScript errors found" >> "../../$REPORT_FILE"
cd ../..
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 2. ESLint Errors
echo "🔍 Checking ESLint errors..."
echo "## ESLint Errors" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
cd apps/web
npx eslint . --ext .ts,.tsx --format compact 2>&1 | grep "error" | head -100 >> "../../$REPORT_FILE" || echo "No ESLint errors found" >> "../../$REPORT_FILE"
cd ../..
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 3. Build Errors
echo "🏗️  Checking build errors..."
echo "## Build Errors" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
cd apps/web
npm run build 2>&1 | grep -i "error" | head -50 >> "../../$REPORT_FILE" || echo "No build errors found" >> "../../$REPORT_FILE"
cd ../..
echo "\`\`\`" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo ""
echo "✅ Audit complete! Report saved to: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"
