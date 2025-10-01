# Design Tokens Guide
**ATLVS Design System - Typography & Color Reference**

---

## Overview

This guide provides comprehensive documentation for using the ATLVS design token system. **All components must use design tokens** instead of hardcoded values to ensure:

- ✅ Consistent theming across light/dark modes
- ✅ Accessibility compliance (WCAG 2.2 AA+)
- ✅ Maintainability and scalability
- ✅ Type safety and IntelliSense support

---

## Color System

### Available Color Tokens

#### Semantic Colors (Use These!)

```typescript
// Background Colors
bg-background          // Main background
bg-foreground          // Inverted background
bg-card                // Card surfaces
bg-popover             // Popover/dropdown surfaces
bg-muted               // Muted/secondary surfaces

// Text Colors
text-foreground        // Primary text
text-muted-foreground  // Secondary/muted text
text-card-foreground   // Text on cards
text-popover-foreground // Text on popovers

// Interactive Colors
bg-primary             // Primary actions
text-primary-foreground // Text on primary
bg-secondary           // Secondary actions
text-secondary-foreground // Text on secondary
bg-accent              // Accent/highlight
text-accent-foreground // Text on accent

// Status Colors
bg-destructive         // Error/danger states
text-destructive-foreground // Text on destructive
bg-success             // Success states
bg-warning             // Warning states
bg-info                // Info states

// Borders
border-border          // Default borders
border-input           // Input borders
```

### Usage Examples

#### ✅ CORRECT Usage

```tsx
// Using semantic Tailwind classes (BEST)
<div className="bg-background text-foreground">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Subtitle</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click Me
  </button>
</div>

// Using CSS custom properties (when needed)
<div style={{ backgroundColor: 'hsl(var(--color-background))' }}>
  Content
</div>

// In CSS files
.custom-component {
  background-color: hsl(var(--color-card));
  color: hsl(var(--color-card-foreground));
  border: 1px solid hsl(var(--color-border));
}
```

#### ❌ INCORRECT Usage

```tsx
// DON'T: Hardcoded hex colors
<div style={{ backgroundColor: '#FFFFFF' }}>

// DON'T: Hardcoded RGB
<div style={{ backgroundColor: 'rgb(255, 255, 255)' }}>

// DON'T: Arbitrary Tailwind classes with colors
<div className="bg-[#FFFFFF] text-[#000000]">

// DON'T: Verbose arbitrary classes
<div className="bg-[hsl(var(--color-background))]">
// Instead use: className="bg-background"
```

### Opacity Modifiers

Tailwind supports opacity modifiers with design tokens:

```tsx
// Correct opacity usage
<div className="bg-primary/10">      // 10% opacity
<div className="bg-destructive/20">  // 20% opacity
<div className="text-foreground/50"> // 50% opacity

// In CSS
background-color: hsl(var(--color-primary) / 0.1);
```

### Chart & Data Visualization Colors

For charts and analytics:

```typescript
// Use semantic status colors
const chartColors = {
  primary: 'hsl(var(--color-primary))',
  success: 'hsl(var(--color-success))',
  warning: 'hsl(var(--color-warning))',
  error: 'hsl(var(--color-destructive))',
  info: 'hsl(var(--color-info))',
};

// Multi-series categorical colors
const seriesColors = [
  'hsl(var(--color-primary))',
  'hsl(var(--accent-atlvs))',
  'hsl(var(--accent-opendeck))',
  'hsl(var(--color-success))',
  'hsl(var(--color-warning))',
];
```

---

## Typography System

### Font Families

```typescript
// Available font families
font-title   // ANTON - Use for headings/display text
font-body    // Share Tech - Use for body text
font-mono    // Share Tech Mono - Use for code

// CSS custom properties
var(--font-family-title)
var(--font-family-body)
var(--font-family-mono)
```

### Font Sizes (Fluid Typography Scale)

```typescript
// Tailwind classes (RECOMMENDED)
text-xs      // 0.75rem - 0.875rem (12px - 14px)
text-sm      // 0.875rem - 1rem (14px - 16px)
text-base    // 1rem - 1.125rem (16px - 18px)
text-lg      // 1.125rem - 1.25rem (18px - 20px)
text-xl      // 1.25rem - 1.5rem (20px - 24px)
text-2xl     // 1.5rem - 2rem (24px - 32px)
text-3xl     // 1.875rem - 2.5rem (30px - 40px)
text-4xl     // 2.25rem - 3rem (36px - 48px)
text-5xl     // 3rem - 4rem (48px - 64px)
text-6xl     // 3.75rem - 5rem (60px - 80px)

// CSS custom properties
var(--font-size-xs) through var(--font-size-6xl)
```

### Font Weights

```typescript
// Tailwind classes
font-thin        // 100
font-extralight  // 200
font-light       // 300
font-normal      // 400
font-medium      // 500
font-semibold    // 600
font-bold        // 700
font-extrabold   // 800
font-black       // 900

// CSS custom properties
var(--font-weight-thin) through var(--font-weight-black)
```

### Line Heights

```typescript
// Tailwind classes
leading-none     // 1
leading-tight    // 1.25
leading-snug     // 1.375
leading-normal   // 1.5
leading-relaxed  // 1.625
leading-loose    // 2

// CSS custom properties
var(--line-height-none) through var(--line-height-loose)
```

### Letter Spacing

```typescript
// Tailwind classes
tracking-tighter  // -0.05em
tracking-tight    // -0.025em
tracking-normal   // 0em
tracking-wide     // 0.025em
tracking-wider    // 0.05em
tracking-widest   // 0.1em

// CSS custom properties
var(--letter-spacing-tighter) through var(--letter-spacing-widest)
```

### Typography Usage Examples

#### ✅ CORRECT Usage

```tsx
// Using Tailwind typography scale
<h1 className="font-title text-4xl font-bold leading-tight">
  Main Heading
</h1>

<p className="font-body text-base leading-normal text-muted-foreground">
  Body text content
</p>

<code className="font-mono text-sm">
  const example = 'code';
</code>

// Custom CSS with tokens
.heading-large {
  font-family: var(--font-family-title);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

#### ❌ INCORRECT Usage

```tsx
// DON'T: Hardcoded font sizes
<h1 style={{ fontSize: '32px' }}>

// DON'T: Arbitrary font size classes
<h1 className="text-[32px]">

// DON'T: Hardcoded font families
<h1 style={{ fontFamily: 'Arial, sans-serif' }}>

// DON'T: Arbitrary font families
<h1 className="font-['Arial']">
```

---

## Spacing System

### Semantic Spacing Scale

```typescript
// Tailwind spacing (padding, margin, gap)
p-xs, m-xs, gap-xs    // 0.25rem (4px)
p-sm, m-sm, gap-sm    // 0.5rem (8px)
p-md, m-md, gap-md    // 1rem (16px)
p-lg, m-lg, gap-lg    // 1.5rem (24px)
p-xl, m-xl, gap-xl    // 2rem (32px)
p-2xl, m-2xl, gap-2xl // 3rem (48px)
p-3xl, m-3xl, gap-3xl // 4rem (64px)

// Numeric scale (also available)
p-1  // 0.25rem (4px)
p-2  // 0.5rem (8px)
p-4  // 1rem (16px)
p-6  // 1.5rem (24px)
p-8  // 2rem (32px)
// etc.

// CSS custom properties
var(--spacing-xs) through var(--spacing-3xl)
```

---

## Component Patterns

### Button Component

```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-md py-sm rounded-md font-medium">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-md py-sm rounded-md">
  Secondary Action
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-md py-sm rounded-md">
  Delete
</button>
```

### Card Component

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-lg shadow-md">
  <h3 className="font-semibold text-lg mb-sm">Card Title</h3>
  <p className="text-muted-foreground text-sm">Card content goes here</p>
</div>
```

### Input Component

```tsx
<input
  type="text"
  className="bg-background text-foreground border border-input rounded-md px-sm py-xs 
             focus:outline-none focus:ring-2 focus:ring-ring"
  placeholder="Enter text..."
/>
```

### Badge Component

```tsx
// Success badge
<span className="bg-success/10 text-success px-sm py-xs rounded-md text-xs font-medium">
  Success
</span>

// Warning badge
<span className="bg-warning/10 text-warning px-sm py-xs rounded-md text-xs font-medium">
  Warning
</span>

// Error badge
<span className="bg-destructive/10 text-destructive px-sm py-xs rounded-md text-xs font-medium">
  Error
</span>
```

---

## Theme Switching

Design tokens automatically adapt to the current theme:

```tsx
// Component code stays the same for all themes
<div className="bg-background text-foreground">
  Content adapts to light/dark theme automatically
</div>

// Theme is controlled at the root level
<html data-theme="dark">
  {/* All components use dark theme tokens */}
</html>

<html data-theme="light">
  {/* All components use light theme tokens */}
</html>
```

---

## Accessibility

### Color Contrast

All semantic color tokens are **WCAG 2.2 AA compliant** by default:

```tsx
// These combinations are guaranteed accessible
bg-background + text-foreground           ✅ AAA
bg-primary + text-primary-foreground      ✅ AA
bg-card + text-card-foreground            ✅ AA
bg-destructive + text-destructive-foreground ✅ AA
```

### High Contrast Mode

```tsx
// High contrast theme variant available
<html data-theme="light-high-contrast">
  {/* Enhanced contrast for accessibility */}
</html>
```

---

## Quick Reference

### Color Token Mapping

| Use Case | Tailwind Class | CSS Variable |
|----------|---------------|--------------|
| Main background | `bg-background` | `hsl(var(--color-background))` |
| Primary text | `text-foreground` | `hsl(var(--color-foreground))` |
| Card background | `bg-card` | `hsl(var(--color-card))` |
| Muted text | `text-muted-foreground` | `hsl(var(--color-muted-foreground))` |
| Primary button | `bg-primary` | `hsl(var(--color-primary))` |
| Error/danger | `bg-destructive` | `hsl(var(--color-destructive))` |
| Borders | `border-border` | `hsl(var(--color-border))` |

### Typography Token Mapping

| Use Case | Tailwind Class | CSS Variable |
|----------|---------------|--------------|
| Display heading | `font-title text-5xl font-bold` | `var(--font-family-title)` + `var(--font-size-5xl)` |
| Section heading | `font-title text-2xl font-semibold` | `var(--font-family-title)` + `var(--font-size-2xl)` |
| Body text | `font-body text-base` | `var(--font-family-body)` + `var(--font-size-base)` |
| Small text | `text-sm text-muted-foreground` | `var(--font-size-sm)` |
| Code/mono | `font-mono text-sm` | `var(--font-family-mono)` |

---

## Migration Checklist

When updating legacy code:

- [ ] Replace hex colors (`#FFFFFF`) with semantic tokens (`bg-background`)
- [ ] Replace arbitrary classes (`bg-[#fff]`) with utility classes (`bg-background`)
- [ ] Replace hardcoded font sizes with typography scale (`text-lg`)
- [ ] Replace inline styles with Tailwind classes
- [ ] Ensure all colors have proper foreground pairs for contrast
- [ ] Test in both light and dark themes
- [ ] Run validation: `npm run validate:tokens`

---

## Tools & Resources

### VS Code Snippets
Install ATLVS snippets for IntelliSense support of design tokens.

### Validation Script
```bash
# Run design token validation
npm run validate:tokens

# Or directly
./scripts/validate-design-tokens.ts
```

### Migration Script
```bash
# Dry run (preview changes)
./scripts/migrate-to-design-tokens.sh --dry-run

# Execute migration
./scripts/migrate-to-design-tokens.sh
```

### ESLint Rules
ESLint will catch violations automatically:
```bash
npm run lint
```

---

## Support

For questions or issues with the design token system:
- Review this guide
- Check the audit report: `docs/TYPOGRAPHY_COLOR_AUDIT_REPORT.md`
- Review violations: `docs/design-token-violations.json`
- Consult token definitions: `packages/ui/src/tokens/unified-design-tokens.ts`

---

**Last Updated:** 2025-09-30  
**Version:** 1.0.0  
**Maintained By:** ATLVS Design System Team
