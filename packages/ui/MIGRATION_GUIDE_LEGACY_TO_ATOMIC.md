# Migration Guide: Legacy to Atomic Structure
## GHXSTSHIP UI Package Component Migration

**Version:** 2.0.0 (2030 Standard)  
**Date:** October 7, 2025  
**Status:** ✅ Active Migration Path

---

## 🎯 Overview

This guide helps you migrate from **legacy component imports** to the **canonical atomic structure**. All legacy paths are deprecated and will be removed in v3.0.0.

### **Why Migrate?**

- ✅ **Single source of truth** — One canonical location per component
- ✅ **Better tree-shaking** — Smaller bundle sizes
- ✅ **Consistent patterns** — All components follow atomic design
- ✅ **Future-proof** — Aligned with 2030 standards
- ✅ **Better TypeScript** — Improved type inference

---

## 📊 Component Migration Map

### **Atoms (Basic Components)**

| Component | ❌ Legacy Import | ✅ Canonical Import | Status |
|-----------|------------------|---------------------|--------|
| **Button** | `from '@ghxstship/ui/atoms/Button'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Button** | `from '@ghxstship/ui/unified/Button'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Input** | `from '@ghxstship/ui/atoms/Input'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Input** | `from '@ghxstship/ui/unified/Input'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Checkbox** | `from '@ghxstship/ui/atoms/Checkbox'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Textarea** | `from '@ghxstship/ui/atoms/Textarea'` | `from '@ghxstship/ui'` (named export) | Deprecated |

### **Molecules (Composite Components)**

| Component | ❌ Legacy Import | ✅ Canonical Import | Status |
|-----------|------------------|---------------------|--------|
| **Alert** | `from '@ghxstship/ui/molecules/Alert'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Dropdown** | `from '@ghxstship/ui/molecules/Dropdown'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Tabs** | `from '@ghxstship/ui/molecules/Tabs'` | `from '@ghxstship/ui'` (named export) | Deprecated |

### **Organisms (Complex Components)**

| Component | ❌ Legacy Import | ✅ Canonical Import | Status |
|-----------|------------------|---------------------|--------|
| **Modal** | `from '@ghxstship/ui/organisms/Modal'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Drawer** | `from '@ghxstship/ui/organisms/Drawer'` | `from '@ghxstship/ui'` (named export) | Deprecated |
| **Table** | `from '@ghxstship/ui/organisms/Table'` | `from '@ghxstship/ui'` (named export) | Deprecated |

---

## 🔄 Migration Examples

### **Example 1: Button Migration**

**❌ Before (Legacy):**
```typescript
import { Button } from '@ghxstship/ui/atoms/Button';
import { Button } from '@ghxstship/ui/unified/Button';
import { Button } from '@ghxstship/ui/components/atomic/Button';
```

**✅ After (Canonical):**
```typescript
import { Button } from '@ghxstship/ui';
```

---

### **Example 2: Multiple Components**

**❌ Before (Legacy):**
```typescript
import { Button } from '@ghxstship/ui/atoms/Button';
import { Input } from '@ghxstship/ui/atoms/Input';
import { Checkbox } from '@ghxstship/ui/atoms/Checkbox';
```

**✅ After (Canonical):**
```typescript
import { Button, Input, Checkbox } from '@ghxstship/ui';
```

---

### **Example 3: With Variants**

**❌ Before (Legacy):**
```typescript
import { Button, buttonVariants } from '@ghxstship/ui/atoms/Button';
```

**✅ After (Canonical):**
```typescript
import { Button, buttonVariants } from '@ghxstship/ui';
```

---

### **Example 4: Component Groups**

**❌ Before (Legacy):**
```typescript
import { Input, InputGroup, SearchInput } from '@ghxstship/ui/atoms/Input';
```

**✅ After (Canonical):**
```typescript
import { Input, InputGroup, SearchInput } from '@ghxstship/ui';
```

---

## 🛠️ Automated Migration

### **Using the Codemod Script**

We provide an automated codemod to migrate your imports:

```bash
# Run from repository root
pnpm migration:legacy-to-atomic

# Or target specific directory
pnpm migration:legacy-to-atomic --path=apps/web
```

### **What the Codemod Does:**

1. ✅ Finds all legacy imports
2. ✅ Replaces with canonical imports
3. ✅ Groups multiple imports from same package
4. ✅ Preserves type imports
5. ✅ Updates both `.ts` and `.tsx` files
6. ✅ Creates a migration report

---

## 📋 Manual Migration Checklist

If migrating manually, follow these steps:

### **Step 1: Find Legacy Imports**
```bash
# Search for legacy imports
grep -r "from '@ghxstship/ui/atoms" apps/
grep -r "from '@ghxstship/ui/unified" apps/
grep -r "from '@ghxstship/ui/molecules" apps/
grep -r "from '@ghxstship/ui/organisms" apps/
```

### **Step 2: Replace with Canonical**
```bash
# Use find and replace in your editor
# Find: from '@ghxstship/ui/atoms/Button'
# Replace: from '@ghxstship/ui'
```

### **Step 3: Group Imports**
```typescript
// Before
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';

// After
import { Button, Input, Checkbox } from '@ghxstship/ui';
```

### **Step 4: Verify Types**
```bash
# Run TypeScript check
pnpm typecheck

# Run linter
pnpm lint
```

### **Step 5: Test**
```bash
# Run tests
pnpm test

# Run build
pnpm build
```

---

## ⚠️ Breaking Changes

### **v2.0.0 → v3.0.0 (Planned)**

**Deprecated paths will be removed:**
- ❌ `@ghxstship/ui/atoms/*`
- ❌ `@ghxstship/ui/unified/*`
- ❌ `@ghxstship/ui/molecules/*` (direct path imports)
- ❌ `@ghxstship/ui/organisms/*` (direct path imports)

**Timeline:**
- **v2.0.0:** Legacy paths deprecated (warnings in console)
- **v2.5.0:** Legacy paths marked for removal (errors in console)
- **v3.0.0:** Legacy paths removed (build errors)

**Sunset Period:** 6 months (until April 2026)

---

## 🚨 Common Pitfalls

### **Pitfall 1: Mixed Imports**

**❌ Don't:**
```typescript
import { Button } from '@ghxstship/ui/atoms/Button'; // Legacy
import { Input } from '@ghxstship/ui'; // Canonical
```

**✅ Do:**
```typescript
import { Button, Input } from '@ghxstship/ui'; // All canonical
```

### **Pitfall 2: Deep Path Imports**

**❌ Don't:**
```typescript
import { Button } from '@ghxstship/ui/src/components/atomic/Button';
```

**✅ Do:**
```typescript
import { Button } from '@ghxstship/ui';
```

### **Pitfall 3: Type-Only Imports**

**❌ Don't:**
```typescript
import type { ButtonProps } from '@ghxstship/ui/atoms/Button';
```

**✅ Do:**
```typescript
import type { ButtonProps } from '@ghxstship/ui';
```

---

## 🔍 ESLint Integration

### **Automatic Detection**

Add the following to your `.eslintrc.js`:

```javascript
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["@ghxstship/ui/atoms/*"],
          "message": "Import from '@ghxstship/ui' instead. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md"
        },
        {
          "group": ["@ghxstship/ui/unified/*"],
          "message": "Import from '@ghxstship/ui' instead. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md"
        },
        {
          "group": ["@ghxstship/ui/molecules/*"],
          "message": "Import from '@ghxstship/ui' instead. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md"
        },
        {
          "group": ["@ghxstship/ui/organisms/*"],
          "message": "Import from '@ghxstship/ui' instead. See MIGRATION_GUIDE_LEGACY_TO_ATOMIC.md"
        }
      ]
    }]
  }
}
```

This will show errors for legacy imports during development.

---

## 📊 Migration Progress Tracking

### **Check Migration Status**

```bash
# Run the migration status checker
pnpm migration:status

# Output example:
# ✅ Migrated: 245 files
# ⚠️  Pending: 12 files
# ❌ Errors: 0 files
# Progress: 95%
```

### **Generate Migration Report**

```bash
pnpm migration:report

# Creates: migration-report.md
```

---

## 🆘 Need Help?

### **Common Questions**

**Q: Can I mix legacy and canonical imports during migration?**  
A: Yes, but not recommended. Migrate file-by-file to avoid confusion.

**Q: Will my build break if I don't migrate?**  
A: Not until v3.0.0 (April 2026). But you'll see console warnings.

**Q: Can I use the codemod on third-party packages?**  
A: No, only run it on your own code.

**Q: What if the codemod breaks something?**  
A: Always commit before running. Use `git diff` to review changes.

---

## ✅ Migration Complete Checklist

- [ ] Run `pnpm migration:legacy-to-atomic` (or manual migration)
- [ ] Fix any TypeScript errors (`pnpm typecheck`)
- [ ] Fix any ESLint errors (`pnpm lint`)
- [ ] Run all tests (`pnpm test`)
- [ ] Build successfully (`pnpm build`)
- [ ] Review bundle size (should be smaller)
- [ ] Commit changes
- [ ] Update documentation if needed

---

## 📚 Additional Resources

- **Component Registry:** `packages/ui/src/COMPONENT_REGISTRY.json`
- **Architecture Guide:** `UI_ARCHITECTURE_CLARIFICATION.md`
- **Design Tokens:** `packages/ui/DESIGN_TOKENS.md`
- **Storybook:** Run `pnpm storybook` to see all canonical components

---

**Migration Support:** Open an issue on GitHub or contact the UI team.  
**Last Updated:** October 7, 2025  
**Status:** ✅ Active — Migrate before April 2026
