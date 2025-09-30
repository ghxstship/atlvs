# Production Cleanup Quick Reference

**Last Updated:** September 29, 2025  
**Purpose:** Quick reference for running production cleanup operations

---

## 🚀 Quick Start

### Run All Cleanup Operations (Recommended)
```bash
cd /path/to/ghxstship
./scripts/production-cleanup-master.sh
```

This master script will guide you through all cleanup steps with confirmations.

---

## 📋 Individual Cleanup Scripts

### 1. Fix ESLint Configuration
**Purpose:** Fix i18n package ESLint configuration for flat config compatibility

```bash
./scripts/fix-eslint-i18n.sh
```

**What it does:**
- Removes `--ext` flag from i18n package lint script
- Updates package.json to be compatible with eslint.config.js
- Tests the configuration

**Time:** ~1 minute

---

### 2. Remove Legacy Files
**Purpose:** Delete all .old, .backup, .deprecated, and .bak files

```bash
./scripts/cleanup-legacy-files.sh
```

**What it does:**
- Finds all legacy files (18 files currently)
- Lists files for review
- Prompts for confirmation before deletion
- Verifies cleanup completion

**Time:** ~2 minutes  
**Impact:** Removes ~18 files

---

### 3. Remove Empty Directories
**Purpose:** Clean up empty directories cluttering the file system

```bash
./scripts/cleanup-empty-directories.sh
```

**What it does:**
- Finds all empty directories (68 currently)
- Lists directories for review
- Prompts for confirmation before deletion
- Verifies cleanup completion

**Time:** ~2 minutes  
**Impact:** Removes ~68 directories

---

### 4. Audit Debug Code
**Purpose:** Generate report of all console.log and debug statements

```bash
./scripts/audit-debug-code.sh
```

**What it does:**
- Scans all TypeScript/JavaScript files
- Identifies console.log, console.debug, debugger statements
- Generates detailed report: `docs/DEBUG_CODE_AUDIT.md`
- Provides recommendations for cleanup

**Time:** ~3 minutes  
**Output:** `docs/DEBUG_CODE_AUDIT.md`

---

## 🔧 Manual Cleanup Tasks

### Fix TypeScript Errors
**Current Status:** 60+ compilation errors

```bash
# Run build to see errors
npm run build 2>&1 | tee typescript-errors.log

# Review errors
cat typescript-errors.log
```

**Common Issues:**
1. Missing JSX closing tags
2. Type parameter errors (missing `>`)
3. Expression syntax errors
4. JSX element structure issues

**Priority Files to Fix:**
- `apps/web/app/(app)/(shell)/procurement/lib/permissions.ts`
- `apps/web/app/(app)/(shell)/profile/performance/views/PerformanceAnalyticsView.tsx`
- `apps/web/app/(app)/(shell)/projects/lib/api.ts`
- `apps/web/app/(app)/(shell)/settings/components/PermissionsSettings.tsx`
- `apps/web/app/(marketing)/page.tsx`

---

### Remove Debug Code
**Current Status:** 199 files with console.log

After running audit script, manually remove debug statements:

```bash
# Find files with console.log (excluding tests)
find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/tests/*" | xargs grep -l "console.log"

# Remove console.log from a file
# Replace with proper logging or remove entirely
```

**ESLint Rule to Add:**
```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-debugger": "error"
  }
}
```

---

### Fix TypeScript 'any' Usage
**Current Status:** 493 files with 'any' type

```bash
# Find files with 'any' usage
find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) | \
  xargs grep -n ": any\|<any>" | head -20

# Replace 'any' with proper types or 'unknown'
```

**Priority:**
1. Service layer files (high risk)
2. API route handlers
3. Component props
4. Utility functions

---

## 📊 Validation Commands

### Check ESLint
```bash
npm run lint
```

### Check TypeScript
```bash
npm run build
```

### Check Prettier
```bash
npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"
```

### Format Code
```bash
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

---

## 🎯 Cleanup Checklist

Use this checklist to track cleanup progress:

### Critical (Must Fix Before Production)
- [ ] Fix ESLint configuration (i18n package)
- [ ] Remove all legacy files (18 files)
- [ ] Remove all empty directories (68 directories)
- [ ] Fix TypeScript compilation errors (60+ errors)
- [ ] Remove debug code from production files (199 files)

### High Priority (Should Fix)
- [ ] Fix TypeScript 'any' usage (493 files)
- [ ] Resolve TODO/FIXME comments (23 files)
- [ ] Fix deep relative imports (82 files)
- [ ] Audit sensitive data usage (107 files)

### Medium Priority (Nice to Have)
- [ ] Consolidate duplicate patterns
- [ ] Optimize bundle size
- [ ] Improve error handling consistency
- [ ] Update documentation

---

## 📈 Progress Tracking

### Before Cleanup
- **Legacy Files:** 18
- **Empty Directories:** 68
- **Debug Files:** 199
- **TypeScript Errors:** 60+
- **'any' Usage:** 493 files
- **TODO/FIXME:** 23 files

### After Cleanup (Update as you progress)
- **Legacy Files:** ___
- **Empty Directories:** ___
- **Debug Files:** ___
- **TypeScript Errors:** ___
- **'any' Usage:** ___
- **TODO/FIXME:** ___

---

## 🚨 Common Issues

### Issue: ESLint fails with "Invalid option --ext"
**Solution:** Run `./scripts/fix-eslint-i18n.sh`

### Issue: TypeScript errors block build
**Solution:** Fix errors one file at a time, starting with most critical

### Issue: Too many console.log to remove manually
**Solution:** 
1. Run audit script to prioritize
2. Focus on production code (exclude tests/scripts)
3. Implement proper logging service
4. Add ESLint rule to prevent future violations

### Issue: Circular dependency warnings
**Solution:**
1. Analyze dependency graph
2. Refactor to use absolute imports
3. Break circular dependencies

---

## 📞 Support

For detailed validation results, see:
- `docs/E5_PRODUCTION_CLEANUP_VALIDATION.md` - Full validation report
- `docs/DEBUG_CODE_AUDIT.md` - Debug code audit (after running script)

---

## 🎉 Success Criteria

Cleanup is complete when:
- ✅ All scripts run without errors
- ✅ `npm run build` completes successfully
- ✅ `npm run lint` passes with 0 errors/warnings
- ✅ No legacy files remain
- ✅ No empty directories remain
- ✅ No console.log in production code
- ✅ TypeScript strict mode with minimal 'any' usage
- ✅ All TODO/FIXME resolved or documented

---

**Estimated Total Cleanup Time:** 40-80 hours  
**Priority 1 (Critical) Time:** 8-16 hours  
**Priority 2 (High) Time:** 16-32 hours  
**Priority 3 (Medium) Time:** 16-32 hours
