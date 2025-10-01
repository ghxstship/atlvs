# Remaining Design Token Warnings - Technical Debt

**Status:** Non-blocking technical debt  
**Total:** 149 warnings  
**Last Updated:** 2025-10-01

## Summary

All **critical errors (66) have been fixed** ✅  
Remaining **149 warnings** represent legitimate technical debt that should be addressed incrementally.

---

## Breakdown by Severity

### High Priority (80 warnings) - Core Components
Files with 9+ violations that affect core UX:

1. **Container.tsx** (11 warnings) - Layout system
2. **EnhancedUniversalDrawer** (9 warnings each x2 files = 18) - Modal/drawer system
3. **Layout components** (Stack, Spacer, Cluster) (25 warnings) - Layout primitives
4. **Dropdown components** (18 warnings) - Menu system

**Impact:** Inconsistent spacing in core UI patterns

---

### Medium Priority (49 warnings) - Styles & Typography
Files affecting global styles and text:

1. **styles.css** (20 warnings) - Global utility classes
2. **Typography/Display.tsx** (6 warnings) - Text display
3. **CodeBlock** (6 warnings) - Code presentation

**Impact:** Text sizing and display inconsistencies

---

### Low Priority (20 warnings) - Specialized Components
Files with 1-4 violations in specialized features:

- 3D components (Card3D, Spatial3D) - 5 warnings
- Data visualization (MapView, WhiteboardView, VirtualizedGrid) - 5 warnings
- Navigation components - 2 warnings
- Templates & layouts - 4 warnings
- Other misc - 4 warnings

**Impact:** Minor visual inconsistencies in specialized features

---

## Common Patterns

### Pattern 1: Width/Max-Width Values (50% of warnings)
```tsx
// ❌ Current
style={{ maxWidth: '32rem' }}
width: '8rem'

// ✅ Target
style={{ maxWidth: 'var(--container-md)' }}
width: 'var(--space-32)'
```

### Pattern 2: Padding/Margin in Utility Classes (30%)
```css
/* ❌ Current */
.utility-class {
  padding: 2px 10px;
  margin: 20px;
}

/* ✅ Target */
.utility-class {
  padding: var(--space-0-5) var(--space-2);
  margin: var(--space-5);
}
```

### Pattern 3: Font Sizes (20%)
```tsx
// ❌ Current
fontSize: '0.875rem'
fontSize: '1.125rem'

// ✅ Target
fontSize: 'var(--font-size-sm)'
fontSize: 'var(--font-size-lg)'
```

---

## Remediation Plan

### Phase 1: High Priority (Weeks 1-2)
- Fix Container.tsx (11 warnings)
- Fix EnhancedUniversalDrawer files (18 warnings)
- Fix Layout primitives (25 warnings)
- **Total:** 54 warnings

### Phase 2: Medium Priority (Week 3)
- Fix styles.css utilities (20 warnings)
- Fix Typography components (12 warnings)
- **Total:** 32 warnings  

### Phase 3: Low Priority (Week 4)
- Fix specialized components (20 warnings)
- **Total:** 20 warnings

### Phase 4: Cleanup (Week 5)
- Fix remaining edge cases (43 warnings)
- **Total:** 43 warnings

---

## Why These Are Acceptable as Warnings

1. **Zero Critical Errors:** All color/theme violations fixed
2. **Non-Blocking:** Applications build and deploy successfully
3. **Scoped Impact:** Spacing inconsistencies don't break functionality
4. **Progressive Enhancement:** Can be fixed incrementally without risk
5. **Clear Documentation:** All violations tracked and prioritized

---

## Auto-Fix Potential

**Can be auto-fixed (estimated 60%):**
- Standard rem → spacing token conversions
- Standard px → spacing token conversions
- Font size → typography token conversions

**Requires manual review (estimated 40%):**
- Component-specific sizing
- Responsive breakpoint logic
- Complex layout calculations

---

## Next Steps

1. ✅ All critical errors fixed
2. ✅ Pre-commit hook enforces zero errors
3. ⏳ Create auto-fix script for common patterns
4. ⏳ Address high-priority warnings incrementally
5. ⏳ Monitor and prevent new violations

---

**Note:** The pre-commit hook allows these warnings but blocks any errors. This ensures we never regress on critical violations while allowing incremental improvement of spacing/typography consistency.
