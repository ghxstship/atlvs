#!/bin/bash
# PRODUCTION READINESS VALIDATION

echo "🔍 PRODUCTION READINESS VALIDATION"
echo "==================================="

# Critical Checks
console_count=$(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -c "console\." | awk '{sum+=$1} END {print sum}')
any_count=$(find apps packages -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk '{sum+=$1} END {print sum}')

echo "📊 CRITICAL METRICS:"
echo "  Console statements: $console_count (target: 0)"
echo "  Any types: $any_count (target: 0)"

# File system checks
tmp_files=$(find . -name "*.tmp" -o -name "*.bak" -o -name ".DS_Store" | wc -l)
empty_dirs=$(find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" | wc -l)

echo "  Temp files: $tmp_files (target: 0)"
echo "  Empty dirs: $empty_dirs (target: 0)"

# Security checks
secrets=$(find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.env*" | xargs grep -c "password\|secret\|key\|token\|PASSWORD\|SECRET\|KEY\|TOKEN" | awk '{sum+=$1} END {print sum}')

echo "  Potential secrets: $secrets (requires manual review)"

# Development comments
dev_comments=$(find apps packages -name "*.ts" -o -name "*.tsx" | xargs grep -c "TODO\|FIXME\|XXX\|HACK" | awk '{sum+=$1} END {print sum}')

echo "  Dev comments: $dev_comments (target: 0)"

echo ""
echo "🎯 VALIDATION RESULTS:"

if [[ $console_count -eq 0 ]] && [[ $any_count -eq 0 ]] && [[ $tmp_files -eq 0 ]] && [[ $empty_dirs -eq 0 ]] && [[ $dev_comments -eq 0 ]]; then
  echo "✅ ZERO TOLERANCE ACHIEVED - PRODUCTION READY"
  echo "🏆 All critical blockers resolved"
  exit 0
else
  echo "❌ REMEDIATION INCOMPLETE"
  echo "⚠️  Manual intervention required for remaining issues"
  exit 1
fi
