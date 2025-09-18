# GHXSTSHIP Design Token System Guide

## Overview
This guide documents the comprehensive design token system for GHXSTSHIP, featuring subway-style metro accents and department-specific color coding.

## Color System

### Core Semantic Colors
Use these for consistent theming across light/dark modes:

```css
/* Primary brand colors */
--background: Main background color
--foreground: Primary text color
--primary: Brand primary color (subway-blue)
--primary-foreground: Text on primary backgrounds

/* UI element colors */
--card: Card/surface backgrounds
--muted: Subtle backgrounds and disabled states
--accent: Accent color for highlights
--border: Border colors
--input: Input field borders
--ring: Focus ring colors

/* Status colors */
--success: Success states (subway-green)
--warning: Warning states (subway-orange)
--destructive: Error states (subway-red)
--info: Information states (subway-blue)
```

### Subway-Style Metro Accents
Inspired by NYC, London, and Tokyo metro systems:

```css
/* Subway line colors - mapped to semantic meanings */
.subway-red     /* Destructive actions, urgent alerts */
.subway-blue    /* Primary actions, navigation */
.subway-green   /* Success states, completed actions */
.subway-orange  /* Warning states, pending actions */
.subway-purple  /* Accent highlights, secondary actions */
.subway-yellow  /* Alternative warnings, notifications */
.subway-grey    /* Neutral states, disabled elements */
```

### Department-Specific Colors
Based on GHXSTSHIP 3-letter department codes:

```css
/* Executive & Leadership */
.dept-xla       /* Executive Leadership & Administration */

/* Operations */
.dept-fpl       /* Finance, Procurement & Legal Services */
.dept-sol       /* Site Operations & Logistics */
.dept-sed       /* Site & Environmental Development */

/* Creative & Production */
.dept-cds       /* Creative Design & Strategy */
.dept-epr       /* Event Programming & Revenue */
.dept-xtp       /* Experiential & Technical Production */
.dept-bgs       /* Branding, Graphics & Signage */
.dept-ent       /* Entertainment, Talent */

/* Guest Experience */
.dept-gsx       /* Guest Services & Experience */
.dept-hfb       /* Hospitality, Food & Beverage */
.dept-pss       /* Public Safety & Security */

/* Support Services */
.dept-mmm       /* Marketing & Media Management */
.dept-itc       /* IT & Communications */
.dept-tdx       /* Travel, Destinations, & Experiences */
```

## Spacing System

### Scale Philosophy
Based on a 4px base unit (0.25rem) with logical progressions:

```css
/* Micro spacing */
--space-0: 0
--space-px: 1px
--space-0-5: 0.125rem  /* 2px */
--space-1: 0.25rem     /* 4px */
--space-1-5: 0.375rem  /* 6px */
--space-2: 0.5rem      /* 8px */

/* Component spacing */
--space-3: 0.75rem     /* 12px */
--space-4: 1rem        /* 16px */
--space-5: 1.25rem     /* 20px */
--space-6: 1.5rem      /* 24px */
--space-8: 2rem        /* 32px */

/* Layout spacing */
--space-12: 3rem       /* 48px */
--space-16: 4rem       /* 64px */
--space-20: 5rem       /* 80px */
--space-24: 6rem       /* 96px */

/* Large layout spacing */
--space-32: 8rem       /* 128px */
--space-48: 12rem      /* 192px */
--space-64: 16rem      /* 256px */
--space-96: 24rem      /* 384px */
```

### Usage Guidelines

**Micro spacing (0-2):** Icon gaps, border widths, fine adjustments
**Component spacing (3-8):** Padding, margins within components
**Layout spacing (12-24):** Section spacing, card gaps
**Large spacing (32-96):** Page sections, hero areas

## Typography System

### Font Families
```css
--font-title: ANTON (uppercase headers)
--font-body: Share Tech (body text)
--font-mono: Share Tech Mono (code, fine print)
--font-display: ANTON (large display text)
```

### Font Sizes
```css
/* Text sizes */
--font-size-xs: 0.75rem    /* 12px - Fine print */
--font-size-sm: 0.875rem   /* 14px - Small text */
--font-size-base: 1rem     /* 16px - Body text */
--font-size-lg: 1.125rem   /* 18px - Large body */
--font-size-xl: 1.25rem    /* 20px - Subheadings */

/* Display sizes */
--font-size-2xl: 1.5rem    /* 24px - H3 */
--font-size-3xl: 1.875rem  /* 30px - H2 */
--font-size-4xl: 2.25rem   /* 36px - H1 */
--font-size-5xl: 3rem      /* 48px - Hero */
--font-size-6xl: 3.75rem   /* 60px - Large hero */
```

### Typography Hierarchy
```css
/* Headers (ANTON, uppercase) */
.text-display   /* Hero text: 5xl-6xl, ANTON, uppercase */
.text-h1        /* Page titles: 4xl, ANTON, uppercase */
.text-h2        /* Section titles: 3xl, ANTON, uppercase */
.text-h3        /* Subsection titles: 2xl, ANTON, uppercase */

/* Body text (Share Tech) */
.text-body-lg   /* Large body: lg, Share Tech */
.text-body      /* Standard body: base, Share Tech */
.text-body-sm   /* Small body: sm, Share Tech */
.text-caption   /* Captions: xs, Share Tech */

/* Monospace (Share Tech Mono) */
.text-code      /* Code: base, Share Tech Mono */
.text-mono      /* Monospace: base, Share Tech Mono */
```

## Motion System

### Duration Tokens
```css
--motion-duration-instant: 0ms     /* Immediate */
--motion-duration-fast: 150ms      /* Quick interactions */
--motion-duration-normal: 300ms    /* Standard transitions */
--motion-duration-slow: 500ms      /* Deliberate animations */
```

### Easing Functions
```css
--motion-easing-linear: linear
--motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1)
--motion-easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
--motion-easing-accelerate: cubic-bezier(0.4, 0, 1, 1)
--motion-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

## Shadow System

### Elevation Levels
```css
--shadow-xs: Subtle borders
--shadow-sm: Cards, buttons
--shadow: Default elevation
--shadow-md: Dropdowns, tooltips
--shadow-lg: Modals, drawers
--shadow-xl: High-priority overlays
--shadow-2xl: Maximum elevation
```

## Usage Examples

### Component Styling
```tsx
// Using semantic colors
<Button className="bg-primary text-primary-foreground">
  Primary Action
</Button>

// Using subway accents
<Badge className="bg-subway-green text-subway-green-foreground">
  Success
</Badge>

// Using department colors
<div className="border-l-4 border-dept-fpl">
  Finance Department Task
</div>
```

### Spacing Patterns
```tsx
// Component internal spacing
<Card className="p-6 space-y-4">
  <CardHeader className="pb-3">
    <CardTitle className="mb-2">Title</CardTitle>
  </CardHeader>
</Card>

// Layout spacing
<section className="py-20 px-4">
  <div className="space-y-12">
    <div className="grid gap-8">
      {/* Content */}
    </div>
  </div>
</section>
```

### Typography Usage
```tsx
// Header hierarchy
<h1 className="font-display text-4xl uppercase tracking-wide">
  MAIN TITLE
</h1>
<h2 className="font-display text-3xl uppercase tracking-wide">
  SECTION TITLE
</h2>

// Body text
<p className="font-body text-base leading-relaxed">
  Standard body text using Share Tech font.
</p>

// Code/monospace
<code className="font-mono text-sm bg-muted px-2 py-1 rounded">
  Code snippet
</code>
```

## Best Practices

### Do's
✅ Use semantic color names (primary, success, destructive)
✅ Apply subway colors for functional meaning
✅ Use department colors for organizational context
✅ Follow the 4px spacing scale
✅ Use ANTON for headers (always uppercase)
✅ Use Share Tech for body text
✅ Apply consistent motion timing

### Don'ts
❌ Use hardcoded color values (gray-800, blue-500)
❌ Mix spacing systems (avoid arbitrary values)
❌ Use ANTON for body text
❌ Ignore dark mode considerations
❌ Override semantic meanings
❌ Use department colors outside context

## Migration Guide

### Replacing Hardcoded Colors
```css
/* Before */
.bg-gray-800 .text-blue-500 .border-red-200

/* After */
.bg-card .text-primary .border-destructive/20
```

### Updating Spacing
```css
/* Before */
.p-4 .m-8 .gap-6

/* After - using design tokens */
.p-4 .m-8 .gap-6  /* These are fine, they map to tokens */

/* For custom values, use tokens */
padding: var(--space-4);
margin: var(--space-8);
gap: var(--space-6);
```

### Typography Updates
```css
/* Before */
.text-2xl .font-bold

/* After */
.font-display .text-3xl .uppercase .tracking-wide
```

This token system ensures visual consistency, supports theming, and creates a unique subway-inspired brand identity for GHXSTSHIP.
