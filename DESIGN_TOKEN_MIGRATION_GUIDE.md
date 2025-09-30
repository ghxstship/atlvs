# 🎨 DESIGN TOKEN MIGRATION GUIDE
## GHXSTSHIP Platform - Hardcoded Spacing to Semantic Tokens

**Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Status:** Ready for Implementation

---

## OVERVIEW

This guide provides a comprehensive migration path from hardcoded Tailwind spacing utilities to semantic design tokens across the GHXSTSHIP platform.

**Scope:** 43 UI components with hardcoded spacing  
**Impact:** Improved consistency, maintainability, and theme flexibility  
**Estimated Effort:** 2-3 developer days

---

## MIGRATION MAPPING

### **Padding Utilities**

| Hardcoded | Semantic Token | CSS Variable | Value |
|-----------|---------------|--------------|-------|
| `p-1` | `p-xs` | `var(--spacing-xs)` | 4px |
| `p-2` | `p-sm` | `var(--spacing-sm)` | 8px |
| `p-3` | `p-sm` | `var(--spacing-sm)` | 8px |
| `p-4` | `p-md` | `var(--spacing-md)` | 16px |
| `p-6` | `p-lg` | `var(--spacing-lg)` | 24px |
| `p-8` | `p-xl` | `var(--spacing-xl)` | 32px |
| `p-12` | `p-2xl` | `var(--spacing-2xl)` | 48px |

### **Margin Utilities**

| Hardcoded | Semantic Token | CSS Variable | Value |
|-----------|---------------|--------------|-------|
| `m-1` | `m-xs` | `var(--spacing-xs)` | 4px |
| `m-2` | `m-sm` | `var(--spacing-sm)` | 8px |
| `m-4` | `m-md` | `var(--spacing-md)` | 16px |
| `m-6` | `m-lg` | `var(--spacing-lg)` | 24px |
| `m-8` | `m-xl` | `var(--spacing-xl)` | 32px |

### **Gap Utilities**

| Hardcoded | Semantic Token | CSS Variable | Value |
|-----------|---------------|--------------|-------|
| `gap-1` | `gap-xs` | `var(--spacing-xs)` | 4px |
| `gap-2` | `gap-sm` | `var(--spacing-sm)` | 8px |
| `gap-3` | `gap-sm` | `var(--spacing-sm)` | 8px |
| `gap-4` | `gap-md` | `var(--spacing-md)` | 16px |
| `gap-6` | `gap-lg` | `var(--spacing-lg)` | 24px |
| `gap-8` | `gap-xl` | `var(--spacing-xl)` | 32px |

### **Directional Spacing**

| Hardcoded | Semantic Token | CSS Variable |
|-----------|---------------|--------------|
| `px-2` | `px-sm` | `var(--spacing-sm)` |
| `px-4` | `px-md` | `var(--spacing-md)` |
| `px-6` | `px-lg` | `var(--spacing-lg)` |
| `py-2` | `py-sm` | `var(--spacing-sm)` |
| `py-4` | `py-md` | `var(--spacing-md)` |
| `pt-4` | `pt-md` | `var(--spacing-md)` |
| `pb-6` | `pb-lg` | `var(--spacing-lg)` |
| `pl-3` | `pl-sm` | `var(--spacing-sm)` |
| `pr-4` | `pr-md` | `var(--spacing-md)` |

---

## AFFECTED COMPONENTS

### **High Priority (7+ instances)**

1. **ThemeToggle.tsx** - 7 instances
   ```tsx
   // BEFORE
   <div className="p-4 gap-2">
   
   // AFTER
   <div className="p-md gap-sm">
   ```

### **Medium Priority (4-6 instances)**

2. **SidebarNavigation.tsx** - 5 instances
3. **Input.tsx** - 5 instances
4. **GalleryView.tsx** - 4 instances
5. **MapView.tsx** - 4 instances
6. **Navigation.tsx** - 4 instances
7. **Table.tsx** - 4 instances

### **Low Priority (1-3 instances)**

8-43. **38 additional components** with 1-3 instances each

---

## MIGRATION STEPS

### **Step 1: Update Tailwind Configuration**

Ensure semantic spacing utilities are available:

```typescript
// packages/ui/tailwind.config.tokens.ts
const config: Config = {
  theme: {
    extend: {
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        '5xl': 'var(--spacing-5xl)'
      }
    }
  }
}
```

### **Step 2: Create Migration Script**

```bash
#!/bin/bash
# scripts/migrate-spacing-tokens.sh

# Define file patterns
FILES="packages/ui/src/components/**/*.tsx"

# Padding migrations
sed -i '' 's/className="\([^"]*\)p-1\([^"]*\)"/className="\1p-xs\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)p-2\([^"]*\)"/className="\1p-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)p-3\([^"]*\)"/className="\1p-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)p-4\([^"]*\)"/className="\1p-md\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)p-6\([^"]*\)"/className="\1p-lg\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)p-8\([^"]*\)"/className="\1p-xl\2"/g' $FILES

# Margin migrations
sed -i '' 's/className="\([^"]*\)m-2\([^"]*\)"/className="\1m-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)m-4\([^"]*\)"/className="\1m-md\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)m-6\([^"]*\)"/className="\1m-lg\2"/g' $FILES

# Gap migrations
sed -i '' 's/className="\([^"]*\)gap-2\([^"]*\)"/className="\1gap-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)gap-3\([^"]*\)"/className="\1gap-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)gap-4\([^"]*\)"/className="\1gap-md\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)gap-6\([^"]*\)"/className="\1gap-lg\2"/g' $FILES

# Directional padding
sed -i '' 's/className="\([^"]*\)px-2\([^"]*\)"/className="\1px-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)px-4\([^"]*\)"/className="\1px-md\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)py-2\([^"]*\)"/className="\1py-sm\2"/g' $FILES
sed -i '' 's/className="\([^"]*\)py-4\([^"]*\)"/className="\1py-md\2"/g' $FILES

echo "✅ Migration complete! Please review changes and run tests."
```

### **Step 3: Manual Review**

After running the script, manually review:

1. **Edge Cases**: Components with dynamic spacing
2. **Contextual Spacing**: Ensure semantic tokens match intent
3. **Responsive Utilities**: Verify breakpoint-specific spacing

### **Step 4: Add ESLint Rule**

Prevent future hardcoded spacing:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-hardcoded-spacing': {
      patterns: [
        'className.*\\bp-[0-9]\\b',
        'className.*\\bm-[0-9]\\b',
        'className.*\\bgap-[0-9]\\b',
        'className.*\\bpx-[0-9]\\b',
        'className.*\\bpy-[0-9]\\b',
        'className.*\\bpt-[0-9]\\b',
        'className.*\\bpb-[0-9]\\b',
        'className.*\\bpl-[0-9]\\b',
        'className.*\\bpr-[0-9]\\b'
      ],
      message: 'Use semantic spacing tokens (xs, sm, md, lg, xl) instead of hardcoded values'
    }
  }
}
```

### **Step 5: Update Documentation**

Add to component documentation:

```markdown
## Spacing Guidelines

Always use semantic spacing tokens:

✅ **Correct:**
```tsx
<div className="p-md gap-sm">
```

❌ **Incorrect:**
```tsx
<div className="p-4 gap-2">
```

**Available Tokens:**
- `xs` - 4px (0.25rem)
- `sm` - 8px (0.5rem)
- `md` - 16px (1rem)
- `lg` - 24px (1.5rem)
- `xl` - 32px (2rem)
- `2xl` - 48px (3rem)
- `3xl` - 64px (4rem)
```

---

## TESTING CHECKLIST

### **Visual Regression Testing**

- [ ] Compare before/after screenshots of all affected components
- [ ] Test all theme variants (light, dark, high contrast)
- [ ] Verify responsive breakpoints (xs, sm, md, lg, xl, 2xl)

### **Functional Testing**

- [ ] Verify spacing consistency across components
- [ ] Test interactive states (hover, focus, active)
- [ ] Validate accessibility with screen readers

### **Performance Testing**

- [ ] Measure theme switch performance (<100ms target)
- [ ] Check CSS bundle size impact
- [ ] Verify no layout shifts during theme changes

---

## ROLLBACK PLAN

If issues arise during migration:

1. **Revert Changes:**
   ```bash
   git revert <commit-hash>
   ```

2. **Restore from Backup:**
   ```bash
   git checkout HEAD~1 -- packages/ui/src/components/
   ```

3. **Selective Rollback:**
   - Identify problematic components
   - Revert only affected files
   - Document issues for future resolution

---

## BENEFITS

### **Consistency**
- Unified spacing system across all components
- Easier to maintain design consistency
- Reduced cognitive load for developers

### **Flexibility**
- Easy to adjust spacing globally
- Theme-aware spacing adjustments
- Responsive spacing variations

### **Maintainability**
- Single source of truth for spacing values
- Easier refactoring and updates
- Better code readability

### **Performance**
- CSS custom properties enable efficient theme switching
- Reduced CSS bundle size with token reuse
- Zero runtime calculation overhead

---

## TIMELINE

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Phase 1** | 0.5 days | Update Tailwind config, create migration script |
| **Phase 2** | 1 day | Run migration, manual review, fix edge cases |
| **Phase 3** | 0.5 days | Add ESLint rule, update documentation |
| **Phase 4** | 1 day | Testing, visual regression, QA |

**Total Estimated Time:** 3 days

---

## SUCCESS CRITERIA

- ✅ Zero hardcoded spacing utilities in UI components
- ✅ All components use semantic tokens
- ✅ ESLint rule prevents future violations
- ✅ Visual regression tests pass
- ✅ Documentation updated
- ✅ Team trained on new conventions

---

## SUPPORT

**Questions?** Contact the Design System team:
- Slack: #design-system
- Email: design-system@ghxstship.com
- Documentation: https://design.ghxstship.com

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-09-30  
**Next Review:** After migration completion
