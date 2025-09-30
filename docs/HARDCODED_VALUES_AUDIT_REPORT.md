# Hardcoded Design Values Audit Report
**Generated:** $(date)
**Status:** Zero Tolerance Enforcement

## Executive Summary
This report identifies all hardcoded design values that must be converted to semantic design tokens from the unified design system.

## Design Token Reference

### Spacing Tokens
- `p-1, p-2` → `p-xs` (4px)
- `p-3` → `p-sm` (8px / 12px)
- `p-4` → `p-md` (16px)
- `p-6` → `p-lg` (24px)
- `p-8` → `p-xl` (32px)
- `p-12` → `p-2xl` (48px)
- `p-16` → `p-3xl` (64px)

Same pattern applies to: `px-`, `py-`, `m-`, `mx-`, `my-`, `gap-`, `space-x-`, `space-y-`

### Border Radius Tokens
- `rounded-sm` → `rounded-sm` (0.125rem) ✓
- `rounded` → `rounded-base` (0.25rem)
- `rounded-md` → `rounded-md` (0.375rem) ✓
- `rounded-lg` → `rounded-lg` (0.5rem) ✓
- `rounded-xl` → `rounded-xl` (0.75rem) ✓
- `rounded-2xl` → `rounded-2xl` (1rem) ✓
- `rounded-3xl` → `rounded-3xl` (1.5rem) ✓
- `rounded-full` → `rounded-full` ✓

### Text Size Tokens
- `text-xs` → `text-xs` ✓
- `text-sm` → `text-sm` ✓
- `text-base` → `text-base` ✓
- `text-lg` → `text-lg` ✓
- `text-xl` → `text-xl` ✓
- `text-2xl` → `text-2xl` ✓

### Width/Height Tokens
- `w-4, h-4` → `w-4 h-4` (icon size - acceptable)
- `w-8, h-8` → `w-8 h-8` (icon size - acceptable)
- `w-full` → `w-full` ✓
- `h-screen` → `h-screen` ✓

## Violations Found


### Spacing Violations

- Padding (p-1, p-2, p-3, etc.): **633 files**
- Horizontal padding (px-1, px-2, etc.): **306 files**
- Vertical padding (py-1, py-2, etc.): **364 files**
- Margin (m-1, m-2, etc.): **9 files**
- Horizontal margin (mx-1, mx-2, etc.): **5 files**
- Vertical margin (my-1, my-2, etc.): **3 files**
- Gap (gap-1, gap-2, etc.): **512 files**
- Horizontal space (space-x-1, etc.): **162 files**
- Vertical space (space-y-1, etc.): **546 files**

### Additional Violations

- Width values (w-10, w-20, etc.): **800 files**
- Height values (h-10, h-20, etc.): **828 files**
- Min-width values: **174 files**
- Min-height values: **4 files**
- Max-width values (excluding max-w-xs, max-w-sm, etc.): **0 files**
- Max-height values: **5 files**

## Conversion Mapping

```
# Spacing Conversions
p-1, p-2 → p-xs    # 4px
p-3 → p-sm         # 8-12px
p-4 → p-md         # 16px
p-6 → p-lg         # 24px
p-8 → p-xl         # 32px
p-12 → p-2xl       # 48px
p-16 → p-3xl       # 64px

# Same pattern for:
- px-*, py-* (directional padding)
- m-*, mx-*, my-* (margins)
- gap-* (flexbox/grid gaps)
- space-x-*, space-y-* (space between)
```

## Automated Fix Commands

Run the following commands to automatically fix violations:

```bash
# Fix padding values
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-1\b/p-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-2\b/p-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-3\b/p-sm/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-4\b/p-md/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-6\b/p-lg/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-8\b/p-xl/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bp-12\b/p-2xl/g" {} +

# Fix horizontal padding
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-1\b/px-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-2\b/px-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-3\b/px-sm/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-4\b/px-md/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-6\b/px-lg/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpx-8\b/px-xl/g" {} +

# Fix vertical padding
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-1\b/py-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-2\b/py-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-3\b/py-sm/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-4\b/py-md/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-6\b/py-lg/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bpy-8\b/py-xl/g" {} +

# Fix margins
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-1\b/m-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-2\b/m-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-3\b/m-sm/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-4\b/m-md/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-6\b/m-lg/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bm-8\b/m-xl/g" {} +

# Fix gaps
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-1\b/gap-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-2\b/gap-xs/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-3\b/gap-sm/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-4\b/gap-md/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-6\b/gap-lg/g" {} +
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "" "s/\bgap-8\b/gap-xl/g" {} +
```

## Status
- [ ] Audit completed
- [ ] Automated fixes applied
- [ ] Manual review completed
- [ ] Zero tolerance achieved
