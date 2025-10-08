#!/bin/bash

# Comprehensive Repository Audit Script
# Identifies legacy files, redundant code, and cleanup opportunities

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
REPORT_FILE="$REPO_ROOT/COMPREHENSIVE_AUDIT_REPORT.md"

echo "# COMPREHENSIVE REPOSITORY AUDIT REPORT" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Category 1: Legacy Files
echo "## 1. LEGACY FILES TO REMOVE" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Backup Files" >> "$REPORT_FILE"
find "$REPO_ROOT" -type f \( -name "*.backup" -o -name "*.bak" -o -name "*.old" \) 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### Log Files" >> "$REPORT_FILE"
find "$REPO_ROOT/apps/web" -type f -name "*.log" 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### PID Files" >> "$REPORT_FILE"
find "$REPO_ROOT" -type f -name "*.pid" 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### Temporary Fix Scripts" >> "$REPORT_FILE"
find "$REPO_ROOT/apps/web" -type f \( -name "fix-*.sh" -o -name "fix_*.sh" -o -name "fix-*.js" \) 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### Temporary Files" >> "$REPORT_FILE"
find "$REPO_ROOT/apps/web" -type f \( -name "*.txt" -o -name "temp-*.js" -o -name "*-temp.*" \) ! -name "robots.txt" 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "### Empty Python Scripts" >> "$REPORT_FILE"
find "$REPO_ROOT" -type f -name "*.py" -size 0 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\` (0 bytes)" >> "$REPORT_FILE"
done

# Category 2: Multiple Config Files
echo "" >> "$REPORT_FILE"
echo "## 2. DUPLICATE CONFIGURATION FILES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Multiple Next.js Configs" >> "$REPORT_FILE"
echo "**Issue**: Should have only ONE active next.config file" >> "$REPORT_FILE"
find "$REPO_ROOT/apps/web" -maxdepth 1 -type f -name "next.config.*" 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

# Category 3: Legacy Documentation
echo "" >> "$REPORT_FILE"
echo "## 3. OUTDATED DOCUMENTATION (Root Level)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "These are historical phase reports that should be archived:" >> "$REPORT_FILE"
find "$REPO_ROOT" -maxdepth 1 -type f \( -name "PHASE_*.md" -o -name "*_COMPLETE.md" -o -name "*_SUMMARY.md" -o -name "*_PLAN.md" \) 2>/dev/null | while read file; do
    echo "- \`${file#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

# Category 4: Empty Directories
echo "" >> "$REPORT_FILE"
echo "## 4. EMPTY DIRECTORIES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
find "$REPO_ROOT" -type d -empty 2>/dev/null | grep -v "node_modules\|\.git\|\.next\|\.turbo" | while read dir; do
    echo "- \`${dir#$REPO_ROOT/}\`" >> "$REPORT_FILE"
done

# Category 5: Shadow UI Directory
echo "" >> "$REPORT_FILE"
echo "## 5. DEPRECATED CODE PATTERNS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Shadow UI Directory (DEPRECATED)" >> "$REPORT_FILE"
echo "**Location**: \`apps/web/app/_components/ui/\`" >> "$REPORT_FILE"
echo "**Issue**: Marked as deprecated, should be removed after confirming all imports migrated to @ghxstship/ui" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Category 6: TODO/FIXME Count
echo "## 6. CODE DEBT MARKERS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" "$REPO_ROOT/apps/web/app" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "**Total TODO/FIXME/HACK/XXX markers**: $TODO_COUNT across codebase" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Category 7: Large TSBuildInfo Files
echo "## 7. LARGE BUILD ARTIFACTS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
find "$REPO_ROOT" -type f -name "*.tsbuildinfo" 2>/dev/null | while read file; do
    size=$(du -h "$file" | cut -f1)
    echo "- \`${file#$REPO_ROOT/}\` ($size)" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "## 8. RECOMMENDATIONS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### High Priority" >> "$REPORT_FILE"
echo "1. Remove all legacy fix scripts and temporary files" >> "$REPORT_FILE"
echo "2. Consolidate to single next.config.mjs" >> "$REPORT_FILE"
echo "3. Remove shadow UI directory after migration validation" >> "$REPORT_FILE"
echo "4. Clean up log and PID files" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Medium Priority" >> "$REPORT_FILE"
echo "5. Archive phase documentation to docs/history/" >> "$REPORT_FILE"
echo "6. Remove empty directories" >> "$REPORT_FILE"
echo "7. Add .tsbuildinfo to .gitignore" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Low Priority" >> "$REPORT_FILE"
echo "8. Address TODO/FIXME markers systematically" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "✅ Audit complete! Report saved to: $REPORT_FILE"
