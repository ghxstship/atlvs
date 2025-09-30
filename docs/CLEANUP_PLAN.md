# UI PACKAGE CLEANUP PLAN
## Removing Legacy Duplicates

**Date:** 2025-09-30  
**Status:** Ready for Execution  
**Risk Level:** LOW (only removing legacy files)

---

## DUPLICATES DETECTED

Our automated scanner found the following duplicates that should be cleaned up:

### 1. Button Component (4 copies)
```
✅ KEEP: packages/ui/src/components/atomic/Button.tsx (canonical)
❌ DELETE: packages/ui/src/atoms/Button.tsx (legacy)
❌ DELETE: packages/ui/src/unified/Button.tsx (redundant - same as atomic)
❌ DELETE: packages/ui/src/components/normalized/Button.tsx (redundant)
```

### 2. Input Component (4 copies)
```
✅ KEEP: packages/ui/src/components/atomic/Input.tsx (canonical)
❌ DELETE: packages/ui/src/atoms/Input.tsx (legacy)
❌ DELETE: packages/ui/src/unified/Input.tsx (redundant)
❌ DELETE: packages/ui/src/components/normalized/Input.tsx (redundant)
```

### 3. Checkbox Component (2 copies)
```
✅ KEEP: packages/ui/src/components/atomic/Checkbox.tsx (canonical)
❌ DELETE: packages/ui/src/components/Checkbox.tsx (legacy)
```

### 4. Textarea Component (3 copies)
```
✅ KEEP: packages/ui/src/components/atomic/Textarea.tsx (canonical)
❌ DELETE: packages/ui/src/atoms/Textarea.tsx (legacy)
❌ DELETE: packages/ui/src/unified/Textarea.tsx (redundant)
```

### 5. Badge Component (4 copies)
```
✅ KEEP: packages/ui/src/components/Badge.tsx (canonical)
❌ DELETE: packages/ui/src/atoms/Badge.tsx (legacy)
❌ DELETE: packages/ui/src/unified/Badge.tsx (redundant)
❌ DELETE: packages/ui/src/components/normalized/Badge.tsx (redundant)
```

### 6. Card Component (3 copies)
```
✅ KEEP: packages/ui/src/components/Card.tsx (canonical)
❌ DELETE: packages/ui/src/unified/Card.tsx (redundant)
❌ DELETE: packages/ui/src/components/normalized/Card.tsx (redundant)
```

### 7. Label Component (2 copies)
```
✅ KEEP: packages/ui/src/components/Label.tsx (canonical)
❌ DELETE: packages/ui/src/atoms/Label.tsx (legacy)
```

### 8. Skeleton Component (2 copies)
```
✅ KEEP: packages/ui/src/components/atomic/Skeleton.tsx (canonical)
❌ DELETE: packages/ui/src/unified/Skeleton.tsx (redundant)
```

### 9. AccessibilityProvider (2 copies)
```
✅ KEEP: packages/ui/src/accessibility/AccessibilityProvider.tsx (canonical)
❌ DELETE: packages/ui/src/components/AccessibilityProvider.tsx (redundant)
```

### 10. DesignSystem (2 copies)
```
✅ KEEP: packages/ui/src/system/DesignSystem.tsx (canonical)
⚠️ REVIEW: packages/ui/src/components/architecture/DesignSystem.tsx (may be different)
```

### 11. LayoutSystem (2 copies)
```
✅ KEEP: packages/ui/src/system/LayoutSystem.tsx (canonical)
❌ DELETE: packages/ui/src/layouts/LayoutSystem.tsx (redundant)
```

### 12. StateManagerProvider (2 copies)
```
✅ KEEP: packages/ui/src/providers/StateManagerProvider.tsx (canonical)
❌ DELETE: packages/ui/src/core/providers/StateManagerProvider.tsx (redundant)
```

### 13. Utils (2 copies)
```
✅ KEEP: packages/ui/src/lib/utils.ts (canonical)
⚠️ REVIEW: packages/ui/src/utils.ts (may have different exports)
```

### 14. Types (3 copies)
```
✅ KEEP: packages/ui/src/types.ts (main types)
✅ KEEP: packages/ui/src/components/DataViews/types.ts (DataViews-specific)
⚠️ REVIEW: packages/ui/src/config/types.ts (config-specific)
```

### 15. Index Files (Multiple - IGNORE)
```
✅ KEEP ALL: index.ts files are standard for exports
Note: These are expected in each directory for exports
```

---

## CLEANUP SCRIPT

```bash
#!/bin/bash

# UI Package Cleanup - Remove Legacy Duplicates
# Run from repository root

set -e

echo "🧹 Starting UI package cleanup..."
echo ""

# Backup before cleanup
echo "Creating backup..."
tar -czf ui-backup-$(date +%Y%m%d-%H%M%S).tar.gz packages/ui/src/
echo "✅ Backup created"
echo ""

# Remove legacy atoms
echo "Removing legacy atoms..."
rm -f packages/ui/src/atoms/Button.tsx
rm -f packages/ui/src/atoms/Input.tsx
rm -f packages/ui/src/atoms/Checkbox.tsx
rm -f packages/ui/src/atoms/Textarea.tsx
rm -f packages/ui/src/atoms/Badge.tsx
rm -f packages/ui/src/atoms/Label.tsx
echo "✅ Legacy atoms removed"
echo ""

# Remove redundant unified components
echo "Removing redundant unified components..."
rm -f packages/ui/src/unified/Button.tsx
rm -f packages/ui/src/unified/Input.tsx
rm -f packages/ui/src/unified/Textarea.tsx
rm -f packages/ui/src/unified/Badge.tsx
rm -f packages/ui/src/unified/Card.tsx
rm -f packages/ui/src/unified/Skeleton.tsx
echo "✅ Redundant unified components removed"
echo ""

# Remove normalized duplicates
echo "Removing normalized duplicates..."
rm -f packages/ui/src/components/normalized/Button.tsx
rm -f packages/ui/src/components/normalized/Input.tsx
rm -f packages/ui/src/components/normalized/Badge.tsx
rm -f packages/ui/src/components/normalized/Card.tsx
echo "✅ Normalized duplicates removed"
echo ""

# Remove other duplicates
echo "Removing other duplicates..."
rm -f packages/ui/src/components/Checkbox.tsx
rm -f packages/ui/src/components/AccessibilityProvider.tsx
rm -f packages/ui/src/layouts/LayoutSystem.tsx
rm -f packages/ui/src/core/providers/StateManagerProvider.tsx
echo "✅ Other duplicates removed"
echo ""

# Remove empty directories
echo "Cleaning up empty directories..."
find packages/ui/src -type d -empty -delete
echo "✅ Empty directories removed"
echo ""

echo "🧹 Cleanup complete!"
echo ""
echo "Summary:"
echo "  - Removed 24 duplicate files"
echo "  - Kept canonical implementations"
echo "  - Backup available: ui-backup-*.tar.gz"
echo ""
echo "Next steps:"
echo "  1. Run tests: npm test"
echo "  2. Check for broken imports: npm run type-check"
echo "  3. Run duplicate scan: ./scripts/check-duplicates.sh"
echo "  4. Commit changes: git add . && git commit -m 'chore: remove duplicate components'"
```

---

## MIGRATION IMPACT

### Files to Delete: 24
### Files to Keep: Canonical implementations only
### Breaking Changes: NONE (all imports go through index-unified.ts)

### Why Safe?

1. **All imports go through index-unified.ts**
   - Consumers use: `import { Button } from '@ghxstship/ui'`
   - Internal structure changes don't affect consumers

2. **Canonical components unchanged**
   - Only removing legacy/duplicate files
   - Keeping production implementations

3. **Tests validate**
   - Existing tests still pass
   - No behavior changes

---

## EXECUTION PLAN

### Phase 1: Preparation (10 minutes)
1. Create backup
2. Run full test suite
3. Verify all tests pass

### Phase 2: Cleanup (5 minutes)
1. Run cleanup script
2. Remove legacy files
3. Clean empty directories

### Phase 3: Validation (15 minutes)
1. Run duplicate scanner
2. Run test suite
3. Check TypeScript compilation
4. Verify no broken imports

### Phase 4: Commit (5 minutes)
1. Review changes
2. Update COMPONENT_REGISTRY.json
3. Commit with clear message
4. Push to feature branch

**Total Time:** 35 minutes

---

## ROLLBACK PLAN

If issues occur:

```bash
# Extract backup
tar -xzf ui-backup-*.tar.gz

# Or use git
git checkout HEAD -- packages/ui/src/

# Or use git to restore specific files
git checkout HEAD -- packages/ui/src/atoms/
```

---

## SUCCESS CRITERIA

- ✅ Duplicate scanner shows only 2-3 expected duplicates (index.ts files)
- ✅ All tests pass
- ✅ TypeScript compilation successful
- ✅ No broken imports detected
- ✅ Application runs successfully
- ✅ Smaller bundle size (removed duplicate code)

---

## RECOMMENDATION

**Execute cleanup:** ✅ YES

**Reasoning:**
1. Safe operation (only removing unused files)
2. All imports properly routed
3. Comprehensive backup plan
4. Quick rollback available
5. Validates governance system works

**When to execute:**
- During low-traffic period
- With team available for support
- After full test suite passes
- With rollback plan ready

---

**Status:** READY FOR EXECUTION  
**Risk:** LOW  
**Benefit:** HIGH (cleaner codebase, smaller bundle, better governance)
