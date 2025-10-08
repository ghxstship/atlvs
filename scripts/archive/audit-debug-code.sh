#!/bin/bash

# GHXSTSHIP Debug Code Audit Script
# Purpose: Find and report all console.log and debug statements
# Safe to run: Only generates reports, does not modify files

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
cd "$REPO_ROOT"

OUTPUT_FILE="docs/DEBUG_CODE_AUDIT.md"

echo "=== GHXSTSHIP Debug Code Audit ==="
echo "Starting audit at: $(date)"
echo ""

# Create audit report
cat > "$OUTPUT_FILE" << 'HEADER'
# Debug Code Audit Report

**Generated:** $(date)  
**Purpose:** Identify all console.log and debug statements in production code

---

## Summary

HEADER

# Count debug statements
CONSOLE_LOG_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | xargs grep -l "console\.log" 2>/dev/null | wc -l)

CONSOLE_DEBUG_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | xargs grep -l "console\.debug" 2>/dev/null | wc -l)

DEBUGGER_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | xargs grep -l "debugger" 2>/dev/null | wc -l)

echo "Debug Statement Counts:"
echo "- console.log: $CONSOLE_LOG_COUNT files"
echo "- console.debug: $CONSOLE_DEBUG_COUNT files"
echo "- debugger: $DEBUGGER_COUNT files"
echo ""

# Add summary to report
cat >> "$OUTPUT_FILE" << SUMMARY

- **console.log statements:** $CONSOLE_LOG_COUNT files
- **console.debug statements:** $CONSOLE_DEBUG_COUNT files
- **debugger statements:** $DEBUGGER_COUNT files

---

## Files with console.log

SUMMARY

# List files with console.log
echo "### Files with console.log (excluding tests/scripts):" >> "$OUTPUT_FILE"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | while read file; do
  if grep -q "console\.log" "$file" 2>/dev/null; then
    echo "- \`$file\`" >> "$OUTPUT_FILE"
    grep -n "console\.log" "$file" | head -3 | while read line; do
      echo "  - Line: $line" >> "$OUTPUT_FILE"
    done
  fi
done

# List files with console.debug
echo "" >> "$OUTPUT_FILE"
echo "## Files with console.debug" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | while read file; do
  if grep -q "console\.debug" "$file" 2>/dev/null; then
    echo "- \`$file\`" >> "$OUTPUT_FILE"
  fi
done

# List files with debugger
echo "" >> "$OUTPUT_FILE"
echo "## Files with debugger statements" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/dist/*" \
  -not -path "*/tests/*" \
  -not -path "*/test/*" \
  -not -path "*/__tests__/*" \
  -not -path "*/scripts/*" | while read file; do
  if grep -q "debugger" "$file" 2>/dev/null; then
    echo "- \`$file\`" >> "$OUTPUT_FILE"
  fi
done

# Add recommendations
cat >> "$OUTPUT_FILE" << 'FOOTER'

---

## Recommendations

### Immediate Actions
1. **Remove all console.log from production code**
   - Replace with proper logging service
   - Keep only in development-specific files

2. **Remove all debugger statements**
   - These should never be in production code
   - Use proper debugging tools instead

3. **Implement ESLint Rule**
   ```json
   {
     "rules": {
       "no-console": ["error", { "allow": ["warn", "error"] }],
       "no-debugger": "error"
     }
   }
   ```

### Long-term Solutions
- Implement structured logging service (e.g., Winston, Pino)
- Use environment-aware logging levels
- Add pre-commit hooks to prevent debug code
- Implement CI/CD checks for debug statements

---

**Report Generated:** $(date)
FOOTER

echo "✓ Audit report generated: $OUTPUT_FILE"
echo ""
echo "=== Audit Complete ==="
echo "Completed at: $(date)"
