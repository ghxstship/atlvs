# Architecture Restructure - Quick Start Guide

## 🚀 Current Status

**Branch:** `feat/architecture-restructure-phase1-ui`  
**Phase:** 1 (UI Package - Atomic Design)  
**Progress:** 30% complete (9/140 components migrated)  
**Overall:** 15% complete

---

## ⚡ Quick Commands

```bash
# Switch to architecture branch
git checkout feat/architecture-restructure-phase1-ui

# View implementation status
cat docs/architecture/IMPLEMENTATION_STATUS.md

# Run structure verification
npx tsx scripts/architecture/verify-structure.ts

# Run dependency verification
npx tsx scripts/architecture/verify-dependencies.ts

# Check TypeScript compilation
npx tsc --noEmit --project packages/ui/tsconfig.json
```

---

## 📂 Key Files & Locations

### Documentation
- **Start Here:** `docs/architecture/README.md`
- **Implementation Status:** `docs/architecture/IMPLEMENTATION_STATUS.md`
- **Migration Guide:** `docs/architecture/MIGRATION_GUIDE.md`
- **Phase 1 Guide:** `docs/architecture/RESTRUCTURE_PHASE_1_UI.md`

### Code Structure
- **Atoms:** `packages/ui/src/atoms/` (3 migrated: Button, Badge, Avatar)
- **Molecules:** `packages/ui/src/molecules/` (3 migrated: Breadcrumbs, SearchBox, Tabs)
- **Organisms:** `packages/ui/src/organisms/` (3 migrated: Card, Modal, EmptyState)
- **Legacy:** `packages/ui/src/components/` (130+ components to migrate)

### Scripts
- **Verification:** `scripts/architecture/verify-*.ts`
- **Backup:** `/tmp/ui-backup-20250930-*.tar.gz`

---

## 🎯 Next Steps (Priority Order)

### 1. Continue Component Migration (This Week)

**Move Remaining Atoms** (~12 components):
```bash
cd packages/ui/src

# Move each atom to its own directory
mkdir -p atoms/Input atoms/Checkbox atoms/Switch atoms/Icon atoms/Label atoms/Spinner

# Copy components
cp components/atomic/Input.tsx atoms/Input/Input.tsx
cp components/atomic/Checkbox.tsx atoms/Checkbox/Checkbox.tsx
# ... continue for all atoms

# Create index.ts for each
echo "export * from './Input';" > atoms/Input/index.ts
# ... repeat for each atom
```

**Move Remaining Molecules** (~22 components):
```bash
# Similar process for molecules
mkdir -p molecules/Dropdown molecules/Select molecules/DatePicker
# ... continue
```

**Move Remaining Organisms** (~27 components):
```bash
# Similar process for organisms
mkdir -p organisms/Table organisms/Navigation organisms/Sidebar
# ... continue
```

### 2. Update Exports

After migrating each batch, update:
```typescript
// atoms/index.ts
export * from './Button';
export * from './Badge';
export * from './Avatar';
export * from './Input';
export * from './Checkbox';
// ... add new atoms

// molecules/index.ts
export * from './Breadcrumbs';
// ... add new molecules

// organisms/index.ts
export * from './Card';
// ... add new organisms
```

### 3. Fix Import Paths

Update imports across codebase:
```typescript
// Old (legacy)
import { Button } from '@ghxstship/ui/components/Button';

// New (atomic)
import { Button } from '@ghxstship/ui/atoms';
// or
import { Button } from '@ghxstship/ui';
```

### 4. Test Each Batch

After each migration batch:
```bash
# Check TypeScript
npx tsc --noEmit

# Run tests
npm test

# Verify structure
npx tsx scripts/architecture/verify-structure.ts
```

---

## 📋 Component Categorization Reference

### Atoms (Single-purpose, no composition)
- Button, Input, Checkbox, Radio, Switch
- Badge, Avatar, Icon, Spinner, Skeleton
- Label, Separator, Link, Image, Text, Heading

### Molecules (2-3 atoms combined)
- FormField (Label + Input + Error)
- SearchBox (Input + Icon + Button)
- Dropdown, DropdownMenu, Select
- DatePicker, TagInput, FileUpload
- Pagination, Breadcrumbs, Tabs, Accordion
- Toast, Alert, Progress

### Organisms (Complex compositions)
- Card, Modal, Dialog, Sheet, Drawer
- DataTable, Table, Form
- Navigation, Sidebar, Header, Footer
- EmptyState, ErrorBoundary, CodeBlock

### Templates (Page layouts)
- AppShell, AuthLayout, DashboardLayout
- DetailLayout, ListLayout, SplitLayout

---

## 🔍 Verification Checklist

After completing a migration batch:

- [ ] Components moved to correct atomic level
- [ ] Barrel exports created (`index.ts` in each folder)
- [ ] Main exports updated (`atoms/index.ts`, etc.)
- [ ] TypeScript compiles without errors
- [ ] Tests passing
- [ ] Imports updated in consuming code
- [ ] Storybook still works
- [ ] Git committed with clear message

---

## 🐛 Common Issues & Solutions

### Issue: Import path not found
**Solution:** Update relative paths in moved components:
```typescript
// Before
import { cn } from '../lib/utils';

// After (from atoms/)
import { cn } from '../../lib/utils';
```

### Issue: Duplicate exports
**Solution:** Remove duplicate exports from `index-unified.ts` or use explicit exports

### Issue: TypeScript errors
**Solution:** Fix import paths, add missing types, check for circular dependencies

### Issue: Tests failing
**Solution:** Update test imports, fix mock paths

---

## 📊 Progress Tracking

Update `IMPLEMENTATION_STATUS.md` daily:

```markdown
### Components Categorization

**Total Components:** ~140

**Categorized:**
- **Atoms** (15/15): ✅ Complete
- **Molecules** (25/25): ✅ Complete
- **Organisms** (30/30): ✅ Complete
- **Templates** (10/10): ✅ Complete
```

---

## 💡 Tips for Efficient Migration

1. **Batch Migration:** Move 10-15 components per day
2. **Test Often:** Test after each batch, not at the end
3. **Commit Frequently:** Commit after each successful batch
4. **Document Decisions:** Note any difficult categorizations
5. **Ask Questions:** Use #architecture-migration Slack channel

---

## 📞 Getting Help

- **Documentation:** Start with `/docs/architecture/README.md`
- **Slack:** #architecture-migration channel
- **Issues:** File in GitHub with `architecture` label
- **Office Hours:** [Schedule TBD]

---

## ✅ Phase 1 Completion Criteria

Phase 1 is complete when:

- [ ] 100% components categorized and moved (140/140)
- [ ] 0 TypeScript compilation errors
- [ ] 100% tests passing
- [ ] Storybook builds successfully
- [ ] Bundle size maintained or reduced
- [ ] Documentation updated
- [ ] Verification scripts pass
- [ ] Code review approved
- [ ] Merged to main

---

**Last Updated:** September 30, 2025, 8:20 AM  
**Estimated Completion:** October 14, 2025 (2 weeks)
