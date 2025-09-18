# GHXSTSHIP Pixel-Perfect Design System Documentation

## 🎨 Overview

The GHXSTSHIP Design System is a comprehensive, pixel-perfect UI framework that ensures absolute consistency across all interface elements using semantic design tokens. Every pixel, interaction, and tokenized value is normalized, consistent, scalable, and future-ready for 2026/2027 design innovation.

## 📐 Core Principles

### 1. **Semantic Token Enforcement**
- No hardcoded values allowed
- All properties map to design tokens
- Consistent naming conventions
- Theme-aware implementations

### 2. **Pixel-Perfect Consistency**
- Spacing, sizing, alignment standardized
- Typography hierarchy enforced
- Color application normalized
- Light/dark theme parity

### 3. **Accessibility First**
- WCAG 2.2 AA+ compliance
- Focus states standardized
- Keyboard navigation complete
- Screen reader optimized

### 4. **Performance Optimized**
- Minimal CSS bundle size
- Efficient token usage
- Tree-shakeable components
- Zero redundant styles

## 🎯 Design Token Structure

### Color System

```css
/* Semantic Colors */
--color-background      /* Main background */
--color-foreground      /* Main text color */
--color-primary         /* Primary brand color */
--color-secondary       /* Secondary brand color */
--color-muted           /* Muted backgrounds */
--color-accent          /* Accent highlights */
--color-destructive     /* Error/danger states */
--color-success         /* Success states */
--color-warning         /* Warning states */
--color-info            /* Information states */
--color-border          /* Border colors */
--color-input           /* Input borders */
--color-ring            /* Focus rings */
```

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 4px | Minimal spacing, tight groups |
| `--spacing-sm` | 8px | Small elements, compact layouts |
| `--spacing-md` | 16px | Default spacing, standard gaps |
| `--spacing-lg` | 24px | Comfortable spacing, cards |
| `--spacing-xl` | 32px | Section spacing, large gaps |
| `--spacing-2xl` | 48px | Major sections, hero areas |
| `--spacing-3xl` | 64px | Page sections, large heroes |
| `--spacing-4xl` | 96px | Extra large spacing |
| `--spacing-5xl` | 128px | Maximum spacing |

### Typography Scale

```css
/* Font Sizes */
--font-size-xs: 0.75rem;    /* 12px - Captions, labels */
--font-size-sm: 0.875rem;   /* 14px - Small body text */
--font-size-md: 1rem;       /* 16px - Default body text */
--font-size-lg: 1.125rem;   /* 18px - Large body text */
--font-size-xl: 1.25rem;    /* 20px - Small headings */
--font-size-2xl: 1.5rem;    /* 24px - Section headings */
--font-size-3xl: 1.875rem;  /* 30px - Page headings */
--font-size-4xl: 2.25rem;   /* 36px - Large headings */
--font-size-5xl: 3rem;      /* 48px - Hero headings */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Border & Radius System

```css
/* Border Radius */
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px - Subtle rounding */
--radius-md: 0.375rem;   /* 6px - Default rounding */
--radius-lg: 0.5rem;     /* 8px - Cards, containers */
--radius-xl: 0.75rem;    /* 12px - Large elements */
--radius-2xl: 1rem;      /* 16px - Extra large */
--radius-full: 9999px;   /* Pills, circles */
```

### Shadow System

```css
/* Elevation Shadows */
--shadow-xs: /* Minimal elevation */
--shadow-sm: /* Small elevation */
--shadow-md: /* Default elevation */
--shadow-lg: /* High elevation */
--shadow-xl: /* Very high elevation */
--shadow-2xl: /* Maximum elevation */
```

### Animation System

```css
/* Durations */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 1000ms;

/* Easings */
--easing-linear: linear;
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 🧩 Component Guidelines

### Atomic Components

#### Buttons
```typescript
// Sizes
xs:      h-7 px-xs py-xs text-size-xs
sm:      h-8 px-sm py-xs text-size-sm
default: h-10 px-md py-sm text-size-md
lg:      h-12 px-lg py-md text-size-lg
xl:      h-14 px-xl py-lg text-size-xl

// States
hover:    opacity-90 shadow-elevation-md
active:   opacity-95 shadow-elevation-sm
disabled: opacity-50 cursor-not-allowed
focus:    ring-2 ring-offset-2
```

#### Inputs
```typescript
// Sizes
xs:      h-7 px-xs py-xs text-size-xs
sm:      h-8 px-sm py-xs text-size-sm
default: h-10 px-md py-sm text-size-md
lg:      h-12 px-lg py-md text-size-lg

// States
default:  border-input
focus:    ring-2 ring-primary
error:    border-destructive
success:  border-success
disabled: opacity-50 bg-muted
```

#### Badges
```typescript
// Sizes
xs:      px-xs py-xs text-size-xs gap-xs
sm:      px-sm py-xs text-size-xs gap-xs
default: px-sm py-xs text-size-sm gap-xs
lg:      px-md py-sm text-size-md gap-sm

// Variants
default:     bg-primary text-primary-foreground
secondary:   bg-secondary text-secondary-foreground
destructive: bg-destructive text-destructive-foreground
success:     bg-success text-success-foreground
warning:     bg-warning text-warning-foreground
```

### Molecular Components

#### Cards
```typescript
// Padding
xs:  p-xs
sm:  p-sm
md:  p-md
lg:  p-lg (default)
xl:  p-xl
2xl: p-2xl

// Variants
default:  border shadow-elevation-sm
elevated: shadow-elevation-md hover:shadow-elevation-lg
outline:  border-2
ghost:    border-transparent hover:border-border
```

#### Modals
```typescript
// Sizes
sm:  max-w-sm p-lg
md:  max-w-md p-lg (default)
lg:  max-w-lg p-xl
xl:  max-w-xl p-xl
full: max-w-full p-2xl

// Spacing
header:  pb-md border-b
content: py-lg
footer:  pt-md border-t gap-sm
```

#### Tables
```typescript
// Structure
header:  bg-muted font-weight-semibold
row:     border-b hover:bg-muted/50
cell:    px-md py-sm
compact: px-sm py-xs text-size-sm
spacious: px-lg py-md text-size-md
```

### Template Components

#### Navigation
```typescript
// Desktop
nav-item:    px-md py-sm hover:bg-accent
nav-group:   gap-xs mb-md
nav-section: py-md border-b

// Mobile
mobile-item:   px-lg py-md
mobile-drawer: w-80 p-lg
```

#### Dashboards
```typescript
// Grid Layouts
grid-2:  grid-cols-2 gap-lg
grid-3:  grid-cols-3 gap-lg
grid-4:  grid-cols-4 gap-md

// Spacing
section:     py-3xl
subsection:  py-xl
widget:      p-lg
```

## 🎨 State Management

### Interactive States

```css
/* Hover States */
.hover-state {
  hover:bg-accent
  hover:text-accent-foreground
  hover:shadow-elevation-md
  transition-default
}

/* Focus States */
.focus-state {
  focus:outline-none
  focus:ring-2
  focus:ring-primary
  focus:ring-offset-2
}

/* Active States */
.active-state {
  active:scale-95
  active:shadow-elevation-sm
}

/* Disabled States */
.disabled-state {
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:pointer-events-none
}
```

## 📱 Responsive Design

### Breakpoints

```css
--breakpoint-xs: 475px;   /* Mobile portrait */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Wide screen */
```

### Responsive Patterns

```typescript
// Mobile First
base:    p-sm text-size-sm
sm:      sm:p-md sm:text-size-md
md:      md:p-lg md:text-size-lg
lg:      lg:p-xl lg:text-size-xl

// Container Widths
mobile:  px-md max-w-full
tablet:  md:px-lg md:max-w-3xl
desktop: lg:px-xl lg:max-w-5xl
wide:    2xl:px-2xl 2xl:max-w-7xl
```

## ✅ Validation & Enforcement

### ESLint Rules

```javascript
// Prevent hardcoded values
'no-restricted-syntax': [
  'error',
  {
    selector: 'Literal[value=/\\bp-[0-9]+\\b/]',
    message: 'Use semantic spacing tokens'
  }
]
```

### CI/CD Checks

1. **Pre-commit Hooks**
   - Validate design token usage
   - Check for hardcoded values
   - Ensure accessibility compliance

2. **Build-time Validation**
   - CSS bundle size limits
   - Token usage analysis
   - Performance metrics

3. **Runtime Monitoring**
   - Visual regression testing
   - Accessibility audits
   - Performance tracking

## 🚀 Migration Guide

### From Tailwind Defaults

```typescript
// Spacing
p-1 → p-xs       // 4px
p-2 → p-sm       // 8px
p-4 → p-md       // 16px
p-6 → p-lg       // 24px
p-8 → p-xl       // 32px

// Typography
text-xs → text-size-xs
text-sm → text-size-sm
text-base → text-size-md
text-lg → text-size-lg

// Colors
text-gray-500 → text-muted-foreground
bg-gray-100 → bg-muted
border-gray-300 → border-border

// Shadows
shadow-sm → shadow-elevation-sm
shadow-md → shadow-elevation-md
shadow-lg → shadow-elevation-lg

// Radius
rounded-sm → rounded-radius-sm
rounded-md → rounded-radius-md
rounded-lg → rounded-radius-lg
```

## 📊 Performance Metrics

### Bundle Size Targets
- CSS: < 50KB gzipped
- Component JS: < 100KB gzipped
- Total: < 150KB gzipped

### Runtime Performance
- First Paint: < 1s
- Interactive: < 3s
- Layout Shift: < 0.1

### Accessibility Scores
- Lighthouse: 100/100
- WAVE: 0 errors
- axe: 0 violations

## 🔧 Tools & Scripts

### Validation Scripts
```bash
# Audit current state
./scripts/pixel-perfect-audit.sh

# Fix violations
./scripts/pixel-perfect-remediation.sh

# Validate fixes
./scripts/pixel-perfect-validate.sh
```

### Development Tools
- Design Token Validator
- Component Inspector
- Accessibility Checker
- Performance Monitor

## 📚 Resources

- [Component Library](/packages/ui/src/components/normalized)
- [Design Tokens](/packages/ui/src/tokens/design-system.css)
- [Migration Scripts](/scripts)
- [ESLint Config](/.eslintrc.pixel-perfect.js)

---

**Version:** 1.0.0  
**Last Updated:** September 2025  
**Maintained by:** GHXSTSHIP UI Architecture Team
