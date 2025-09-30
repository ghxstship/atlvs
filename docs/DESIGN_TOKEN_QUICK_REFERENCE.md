# Design Token Quick Reference Card

## Semantic Spacing Tokens - Quick Lookup

### Padding

| Old (Hardcoded) | New (Semantic) | Pixels | Use Case |
|-----------------|----------------|--------|----------|
| `p-1`, `p-2` | `p-xs` | 4px | Tight spacing, compact UI |
| `p-3` | `p-sm` | 8px | Small components, badges |
| `p-4` | `p-md` | 16px | **Default padding** |
| `p-6` | `p-lg` | 24px | Cards, containers |
| `p-8` | `p-xl` | 32px | Large sections |
| `p-12` | `p-2xl` | 48px | Page sections |
| `p-16` | `p-3xl` | 64px | Hero sections |

### Directional Padding

Same pattern for all directions:
- `px-*` → `px-{size}` (horizontal)
- `py-*` → `py-{size}` (vertical)
- `pt-*` → `pt-{size}` (top)
- `pr-*` → `pr-{size}` (right)
- `pb-*` → `pb-{size}` (bottom)
- `pl-*` → `pl-{size}` (left)

### Margins

| Old | New | Pixels |
|-----|-----|--------|
| `m-1`, `m-2` | `m-xs` | 4px |
| `m-3` | `m-sm` | 8px |
| `m-4` | `m-md` | 16px |
| `m-6` | `m-lg` | 24px |
| `m-8` | `m-xl` | 32px |

### Gaps (Flexbox/Grid)

| Old | New | Pixels |
|-----|-----|--------|
| `gap-1`, `gap-2` | `gap-xs` | 4px |
| `gap-3` | `gap-sm` | 8px |
| `gap-4` | `gap-md` | 16px |
| `gap-6` | `gap-lg` | 24px |
| `gap-8` | `gap-xl` | 32px |

### Space Between

| Old | New | Pixels |
|-----|-----|--------|
| `space-x-1`, `space-x-2` | `space-x-xs` | 4px |
| `space-x-3` | `space-x-sm` | 8px |
| `space-x-4` | `space-x-md` | 16px |
| `space-y-1`, `space-y-2` | `space-y-xs` | 4px |
| `space-y-3` | `space-y-sm` | 8px |
| `space-y-4` | `space-y-md` | 16px |

## Common Patterns

### Button
```tsx
// ❌ Before
<button className="px-4 py-2">Click</button>

// ✅ After
<button className="px-md py-xs">Click</button>
```

### Card
```tsx
// ❌ Before
<div className="p-6 gap-4">

// ✅ After
<div className="p-lg gap-md">
```

### Form Field
```tsx
// ❌ Before
<div className="space-y-2">
  <label className="mb-2">
  <input className="px-3 py-2">
</div>

// ✅ After
<div className="space-y-xs">
  <label className="mb-xs">
  <input className="px-sm py-xs">
</div>
```

### Container
```tsx
// ❌ Before
<div className="p-8 space-y-6">

// ✅ After
<div className="p-xl space-y-lg">
```

## Decision Tree

**Choose spacing size based on:**

- **xs (4px):** Minimal spacing, tight layouts, inline elements
- **sm (8px):** Small components, form fields, badges
- **md (16px):** Default spacing, most components
- **lg (24px):** Cards, sections, generous spacing
- **xl (32px):** Large sections, page-level spacing
- **2xl+ (48px+):** Hero sections, major page divisions

## Exceptions (Acceptable Hardcoded Values)

### ✅ Icon Sizes
```tsx
<Icon className="w-4 h-4" />  // 16px icons
<Icon className="w-6 h-6" />  // 24px icons
<Icon className="w-8 h-8" />  // 32px icons
```

### ✅ Layout Utilities
```tsx
<div className="w-full h-screen" />
<div className="max-w-7xl mx-auto" />
```

### ✅ Specific Component Sizes
```tsx
<div className="h-[500px]" />  // Chart height
<div className="w-[250px]" />  // Sidebar width
```

## Cheat Sheet

```
REMEMBER: Think semantically, not numerically!

xs  = extra small = tight
sm  = small = compact
md  = medium = default
lg  = large = generous
xl  = extra large = spacious
2xl = 2x extra large = very spacious
3xl = 3x extra large = hero spacing
```

## Quick Commands

```bash
# Find hardcoded values in a file
grep -E '\b(p|px|py|m|mx|my|gap|space-[xy])-[0-9]\b' filename.tsx

# Convert a single file
sed -i '' 's/\bp-4\b/p-md/g' filename.tsx

# Run full audit
./scripts/fix-hardcoded-design-values.sh

# Apply all fixes
./scripts/apply-design-token-fixes.sh
```

---

**Print this card and keep it handy!** 📌
