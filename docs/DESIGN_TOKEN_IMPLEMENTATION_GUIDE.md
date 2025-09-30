# GHXSTSHIP Design Token Implementation Guide
**Zero Tolerance Enforcement**

## Executive Summary

This guide documents the complete conversion of hardcoded design values to semantic design tokens across the GHXSTSHIP codebase. This is a **zero tolerance** initiative - all hardcoded values must be converted.

## Current Status

### Violations Identified
- **633 files** with hardcoded padding values
- **306 files** with hardcoded horizontal padding
- **364 files** with hardcoded vertical padding
- **512 files** with hardcoded gap values
- **546 files** with hardcoded vertical spacing
- **162 files** with hardcoded horizontal spacing
- **800+ files** with hardcoded width values
- **828+ files** with hardcoded height values

**Total Impact:** ~2,000+ files requiring remediation

## Design Token System

### Semantic Spacing Scale

Our design system uses semantic tokens that map to consistent pixel values:

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 6rem;     /* 96px */
--spacing-5xl: 8rem;     /* 128px */
```

### Conversion Mapping

#### Padding Conversions
```
p-1, p-2  → p-xs    (4px)
p-3       → p-sm    (8-12px)
p-4       → p-md    (16px)
p-5       → p-md    (16-20px)
p-6       → p-lg    (24px)
p-8       → p-xl    (32px)
p-10      → p-xl    (32-40px)
p-12      → p-2xl   (48px)
p-16      → p-3xl   (64px)
```

#### Directional Padding
Same pattern applies to:
- `px-*` → `px-{size}` (horizontal)
- `py-*` → `py-{size}` (vertical)
- `pt-*` → `pt-{size}` (top)
- `pr-*` → `pr-{size}` (right)
- `pb-*` → `pb-{size}` (bottom)
- `pl-*` → `pl-{size}` (left)

#### Margin Conversions
```
m-1, m-2  → m-xs
m-3       → m-sm
m-4       → m-md
m-6       → m-lg
m-8       → m-xl
m-12      → m-2xl
```

#### Gap Conversions
```
gap-1, gap-2  → gap-xs
gap-3         → gap-sm
gap-4         → gap-md
gap-6         → gap-lg
gap-8         → gap-xl
gap-12        → gap-2xl
```

#### Space Between Conversions
```
space-x-1, space-x-2  → space-x-xs
space-x-3             → space-x-sm
space-x-4             → space-x-md
space-x-6             → space-x-lg
space-x-8             → space-x-xl

space-y-1, space-y-2  → space-y-xs
space-y-3             → space-y-sm
space-y-4             → space-y-md
space-y-6             → space-y-lg
space-y-8             → space-y-xl
```

## Implementation Steps

### Step 1: Audit (✅ Complete)

Run the audit script to identify all violations:

```bash
./scripts/fix-hardcoded-design-values.sh
```

This generates: `docs/HARDCODED_VALUES_AUDIT_REPORT.md`

### Step 2: Apply Automated Fixes

Run the automated fix script:

```bash
./scripts/apply-design-token-fixes.sh
```

This script will:
1. Prompt for confirmation
2. Apply all conversions automatically
3. Report number of files modified
4. Provide next steps

**⚠️ Important:** Ensure you have a clean git state before running.

### Step 3: Manual Review

After automated fixes, review changes:

```bash
# View all changes
git diff

# View specific file types
git diff -- '*.tsx'

# View statistics
git diff --stat
```

### Step 4: Testing

Test the application thoroughly:

```bash
# Run development server
pnpm dev

# Run build
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Step 5: Commit Changes

```bash
git add .
git commit -m "fix: convert hardcoded design values to semantic tokens

- Convert 2000+ files to use semantic spacing tokens
- Replace p-1, p-2, etc. with p-xs, p-sm, p-md, etc.
- Replace gap-1, gap-2, etc. with gap-xs, gap-sm, etc.
- Replace m-1, m-2, etc. with m-xs, m-sm, etc.
- Update Tailwind config to support semantic tokens
- Achieve zero tolerance for hardcoded design values

BREAKING CHANGE: All spacing now uses semantic design tokens"
```

## Tailwind Configuration

The Tailwind preset has been updated to support semantic tokens:

```typescript
// packages/config/tailwind-preset.ts
spacing: {
  // Numeric scale (existing)
  '0': 'var(--spacing-0)',
  '1': 'var(--spacing-1)',
  '2': 'var(--spacing-2)',
  // ... etc
  
  // Semantic aliases (NEW)
  'xs': 'var(--spacing-xs)',
  'sm': 'var(--spacing-sm)',
  'md': 'var(--spacing-md)',
  'lg': 'var(--spacing-lg)',
  'xl': 'var(--spacing-xl)',
  '2xl': 'var(--spacing-2xl)',
  '3xl': 'var(--spacing-3xl)',
  '4xl': 'var(--spacing-4xl)',
  '5xl': 'var(--spacing-5xl)',
}
```

## Usage Examples

### Before (Hardcoded)
```tsx
<div className="p-4 px-6 gap-2 space-y-4">
  <button className="px-4 py-2 m-2">Click me</button>
</div>
```

### After (Semantic Tokens)
```tsx
<div className="p-md px-lg gap-xs space-y-md">
  <button className="px-md py-xs m-xs">Click me</button>
</div>
```

## Benefits

### 1. **Consistency**
All spacing follows a predictable scale across the entire application.

### 2. **Maintainability**
Change spacing system-wide by updating CSS variables, not thousands of files.

### 3. **Readability**
`p-md` is more semantic than `p-4` - it describes intent, not implementation.

### 4. **Scalability**
Easy to add new spacing values or adjust existing ones.

### 5. **Design System Alignment**
Tokens match design system specifications exactly.

## Exceptions

Some values are acceptable as hardcoded:

### Icon Sizes
```tsx
// ✅ Acceptable - standard icon sizes
<Icon className="w-4 h-4" />
<Icon className="w-6 h-6" />
<Icon className="w-8 h-8" />
```

### Layout Utilities
```tsx
// ✅ Acceptable - layout utilities
<div className="w-full h-screen" />
<div className="max-w-7xl mx-auto" />
```

### Specific Measurements
```tsx
// ✅ Acceptable - specific component requirements
<div className="h-[500px]" /> // Chart height
<div className="w-[250px]" /> // Sidebar width
```

## Enforcement

### Pre-commit Hooks

Add to `.husky/pre-commit`:

```bash
# Check for hardcoded spacing values
if git diff --cached --name-only | grep -E '\.(tsx?|jsx?)$' | xargs grep -E '\b(p|px|py|m|mx|my|gap|space-[xy])-[0-9]\b' > /dev/null 2>&1; then
  echo "❌ Error: Hardcoded spacing values detected"
  echo "Please use semantic tokens: p-xs, p-sm, p-md, p-lg, p-xl, etc."
  exit 1
fi
```

### ESLint Rule (Future)

Create custom ESLint rule to detect hardcoded values:

```javascript
// .eslintrc.js
rules: {
  'no-hardcoded-spacing': 'error',
}
```

## Migration Checklist

- [x] Audit completed and report generated
- [x] Tailwind config updated with semantic tokens
- [x] Automated fix script created
- [ ] Automated fixes applied
- [ ] Manual review completed
- [ ] Tests passing
- [ ] Build successful
- [ ] Visual regression testing completed
- [ ] Changes committed
- [ ] Zero tolerance achieved

## Support

### Questions?
Contact the Design Systems team or open an issue.

### Found a Bug?
If automated fixes cause issues, report them immediately with:
1. File path
2. Original code
3. Converted code
4. Expected behavior
5. Actual behavior

## References

- Design System Documentation: `/docs/design-system.md`
- CSS Variables: `/packages/ui/src/styles/unified-design-system.css`
- Tailwind Preset: `/packages/config/tailwind-preset.ts`
- Audit Report: `/docs/HARDCODED_VALUES_AUDIT_REPORT.md`

---

**Last Updated:** 2025-09-30  
**Status:** Implementation Ready  
**Priority:** P0 - Zero Tolerance
