# GHXSTSHIP Design System - Design Tokens

## Overview

This document outlines the comprehensive design token system for GHXSTSHIP, implementing a **Zero Tolerance semantic token architecture** with clear hierarchy and automated validation.

**Single Source of Truth**: All design tokens are defined in TypeScript (`packages/ui/src/tokens/unified-design-tokens.ts`) and automatically generated into CSS variables. Manual CSS edits are prohibited.

## Quick Start

```bash
# Generate CSS tokens from TypeScript
pnpm generate:tokens

# Validate token usage
pnpm validate:tokens

# Run linting with token rules
pnpm lint:tokens
```

## Token Architecture

### Hierarchy

```
Primitives (Raw values)
├── Colors (HSL values, hex, etc.)
├── Spacing (rem values)
├── Typography (font families, sizes, weights)
├── Shadows (CSS box-shadow values)
├── Borders (radii, widths)
├── Motion (durations, easings)
└── Z-Index (layer values)

Semantic Tokens (Context-aware meanings)
├── Colors (background, foreground, primary, etc.)
├── Spacing (xs, sm, md, lg, xl)
├── Typography (title, body, sizes, weights)
├── Shadows (sm, md, lg, elevated)
├── Borders (radii, widths)
├── Motion (fast, normal, slow)
└── Z-Index (dropdown, modal, tooltip)

Component Tokens (Component-specific)
├── Button (background, foreground, hover states)
├── Card (background, border, shadow)
├── Input (background, border, focus ring)
└── [Additional components]
```

## Color Tokens

### Semantic Colors

| Token | Light Theme | Dark Theme | Usage |
|-------|-------------|------------|-------|
| `--color-background` | `hsl(0 0% 100%)` | `hsl(229 84% 5%)` | Page background |
| `--color-foreground` | `hsl(222 47% 11%)` | `hsl(210 40% 98%)` | Primary text |
| `--color-card` | `hsl(0 0% 100%)` | `hsl(229 84% 5%)` | Card backgrounds |
| `--color-primary` | `hsl(158 64% 52%)` | `hsl(158 64% 48%)` | Primary actions, links |
| `--color-secondary` | `hsl(210 40% 96%)` | `hsl(217 33% 17%)` | Secondary actions |
| `--color-muted` | `hsl(210 40% 96%)` | `hsl(217 33% 17%)` | Subtle backgrounds |
| `--color-accent` | `hsl(158 64% 52%)` | `hsl(158 64% 48%)` | Accent elements |
| `--color-destructive` | `hsl(0 84% 60%)` | `hsl(0 84% 60%)` | Error states, destructive actions |
| `--color-success` | `hsl(142 76% 36%)` | `hsl(142 76% 36%)` | Success states |
| `--color-warning` | `hsl(43 96% 56%)` | `hsl(43 96% 56%)` | Warning states |
| `--color-info` | `hsl(217 91% 60%)` | `hsl(217 91% 60%)` | Information states |
| `--color-border` | `hsl(214 32% 91%)` | `hsl(0 0% 100% / 0.2)` | Borders, dividers |
| `--color-input` | `hsl(214 32% 91%)` | `hsl(0 0% 100% / 0.2)` | Form input borders |
| `--color-ring` | `hsl(158 64% 52%)` | `hsl(158 64% 48%)` | Focus rings |

### Usage Examples

```css
/* Direct CSS usage */
.my-element {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
  border: 1px solid hsl(var(--color-border));
}

/* Hover states */
.my-button:hover {
  background-color: hsl(var(--color-primary) / 0.9);
}
```

```tsx
// React with useTokens hook
import { useTokens } from '@ghxstship/ui';

function MyComponent() {
  const { colors } = useTokens();

  return (
    <div style={{
      backgroundColor: colors.primary(),
      color: colors.primary({ variant: 'foreground' })
    }}>
      Content
    </div>
  );
}
```

## Spacing Tokens

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-0` | `0` | No spacing |
| `--spacing-px` | `1px` | Minimal spacing |
| `--spacing-0-5` | `0.125rem` | Extra small (2px) |
| `--spacing-1` | `0.25rem` | Small (4px) |
| `--spacing-3` | `0.75rem` | Large (12px) |
| `--spacing-4` | `1rem` | Extra large (16px) |
| `--spacing-6` | `1.5rem` | 2x large (24px) |
| `--spacing-8` | `2rem` | 3x large (32px) |
| `--spacing-12` | `3rem` | 4x large (48px) |
| `--spacing-16` | `4rem` | 5x large (64px) |

### Breakpoint Tokens

### Breakpoint Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-xs` | `475px` | Extra small screens |
| `--breakpoint-sm` | `640px` | Small screens (mobile landscape) |
| `--breakpoint-md` | `768px` | Medium screens (tablet) |
| `--breakpoint-lg` | `1024px` | Large screens (desktop) |
| `--breakpoint-xl` | `1280px` | Extra large screens (large desktop) |
| `--breakpoint-2xl` | `1536px` | 2x large screens (ultra-wide) |

### Usage Examples

```css
/* Direct breakpoint usage in CSS */
@media (min-width: var(--breakpoint-md)) {
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: var(--breakpoint-lg)) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

```tsx
// Tailwind classes (recommended)
<div className="md:grid-cols-2 lg:grid-cols-3">
  Grid content
</div>
```

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family-title` | `'ANTON', system-ui, sans-serif` | Headings, titles |
| `--font-family-body` | `'Share Tech', system-ui, sans-serif` | Body text |
| `--font-family-mono` | `'Share Tech Mono', 'Consolas', monospace` | Code, technical text |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-xs` | `0.75rem` | Captions, footnotes |
| `--font-size-sm` | `0.875rem` | Small text, labels |
| `--font-size-base` | `1rem` | Body text |
| `--font-size-lg` | `1.125rem` | Large body text |
| `--font-size-xl` | `1.25rem` | Small headings |
| `--font-size-2xl` | `1.5rem` | Medium headings |
| `--font-size-3xl` | `1.875rem` | Large headings |
| `--font-size-4xl` | `2.25rem` | Extra large headings |

### Semantic Typography

| Class | Properties | Usage |
|-------|------------|-------|
| `.text-display` | Large title, uppercase, wide spacing | Hero text, main headings |
| `.text-heading-1` | Large title, uppercase | Primary headings |
| `.text-heading-2` | Medium title, uppercase | Secondary headings |
| `.text-heading-3` | Small title, uppercase | Tertiary headings |
| `.text-body` | Body font, normal weight | Regular content |
| `.text-body-lg` | Larger body font | Emphasized content |
| `.text-caption` | Small body font | Metadata, captions |

### Usage Examples

```css
/* Direct typography usage */
.heading {
  font-family: var(--font-family-title);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}
```

```tsx
// Tailwind classes (recommended)
<h1 className="text-heading-1">Page Title</h1>
<p className="text-body">Content text</p>
```

## Shadow Tokens

### Elevation Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `--shadow-base` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Default elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Medium elevation |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | High elevation |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Very high elevation |
| `--shadow-soft` | `0 2px 15px 0 rgb(0 0 0 / 0.08)` | Soft shadow |
| `--shadow-elevated` | `0 4px 25px 0 rgb(0 0 0 / 0.15)` | Elevated appearance |

### Pop Art Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-pop-sm` | `3px 3px 0 hsl(0 0% 0%), 6px 6px 0 hsl(var(--color-accent))` | Small pop effect |
| `--shadow-pop-base` | `4px 4px 0 hsl(0 0% 0%), 8px 8px 0 hsl(var(--color-accent))` | Default pop effect |
| `--shadow-pop-md` | `6px 6px 0 hsl(0 0% 0%), 12px 12px 0 hsl(var(--color-accent))` | Large pop effect |

### Usage Examples

```css
/* Standard shadows */
.card {
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Pop art effects */
.button-pop {
  box-shadow: var(--shadow-pop-base);
}

.button-pop:hover {
  box-shadow: var(--shadow-pop-md);
}
```

```tsx
// Tailwind classes
<div className="shadow-sm hover:shadow-md">
  Content
</div>
```

## Motion Tokens

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | `0ms` | Immediate transitions |
| `--duration-fast` | `150ms` | Quick interactions |
| `--duration-normal` | `300ms` | Standard transitions |
| `--duration-slow` | `500ms` | Slow, deliberate transitions |

### Easing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `--easing-linear` | `linear` | Linear animation |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard easing |
| `--easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating |
| `--easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating |
| `--easing-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Bouncy effect |

### Usage Examples

```css
/* Motion tokens */
.button {
  transition: all var(--duration-fast) var(--easing-standard);
}

.modal {
  animation: slideIn var(--duration-normal) var(--easing-decelerate);
}
```

```tsx
// Tailwind classes
<div className="transition-all duration-200 ease-standard">
  Animated content
</div>
```

## Border Tokens

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Sharp corners |
| `--radius-sm` | `0.125rem` | Small radius |
| `--radius-base` | `0.25rem` | Default radius |
| `--radius-md` | `0.375rem` | Medium radius |
| `--radius-lg` | `0.5rem` | Large radius |
| `--radius-xl` | `0.75rem` | Extra large radius |
| `--radius-2xl` | `1rem` | Very large radius |
| `--radius-3xl` | `1.5rem` | Huge radius |
| `--radius-full` | `9999px` | Fully rounded |

### Border Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--border-width-none` | `0` | No border |
| `--border-width-thin` | `1px` | Thin border |
| `--border-width-normal` | `2px` | Normal border |
| `--border-width-thick` | `4px` | Thick border |
| `--border-width-heavy` | `8px` | Heavy border |

### Usage Examples

```css
/* Border tokens */
.input {
  border-radius: var(--radius-md);
  border-width: var(--border-width-thin);
}

.button {
  border-radius: var(--radius-lg);
}
```

```tsx
// Tailwind classes
<input className="rounded-md border" />
<button className="rounded-lg">Button</button>
```

## Z-Index Tokens

### Layer Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | `1000` | Dropdown menus |
| `--z-sticky` | `1020` | Sticky elements |
| `--z-fixed` | `1030` | Fixed positioning |
| `--z-modal-backdrop` | `1040` | Modal backdrop |
| `--z-modal` | `1050` | Modal dialogs |
| `--z-popover` | `1060` | Popover elements |
| `--z-tooltip` | `1070` | Tooltips |
| `--z-toast` | `1080` | Toast notifications |

### Usage Examples

```css
/* Z-index tokens */
.dropdown {
  z-index: var(--z-dropdown);
}

.modal {
  z-index: var(--z-modal);
}
```

```tsx
// Tailwind classes
<div className="relative z-dropdown">Dropdown</div>
<div className="relative z-modal">Modal</div>
```

## Theme Support

### Light Theme (Default)

All tokens default to light theme values. Applied automatically.

### Dark Theme

Apply `[data-theme="dark"]` or `.dark` to the document element to switch to dark theme values.

```html
<html data-theme="dark">
  <!-- Dark theme applied -->
</html>
```

### High Contrast Themes

- `data-contrast="high"` enables high contrast mode
- Combined with theme: `data-theme="light-high-contrast"` or `data-theme="dark-high-contrast"`

### Brand Contexts

Apply brand-specific classes for contextual color overrides:

```html
<div class="brand-opendeck"> <!-- Blue accents --> </div>
<div class="brand-atlvs"> <!-- Pink accents --> </div>
<div class="brand-ghostship"> <!-- Green accents --> </div>
```

## Component Tokens

### Modal Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-modal-backdrop` | `hsl(var(--color-background) / 0.8)` | Modal backdrop overlay |
| `--component-modal-background` | `hsl(var(--color-background))` | Modal content background |
| `--component-modal-foreground` | `hsl(var(--color-foreground))` | Modal content text |
| `--component-modal-border` | `hsl(var(--color-border))` | Modal border color |
| `--component-modal-shadow` | `var(--shadow-xl)` | Modal drop shadow |
| `--component-modal-header-background` | `hsl(var(--color-card))` | Modal header background |
| `--component-modal-header-foreground` | `hsl(var(--color-card-foreground))` | Modal header text |
| `--component-modal-header-border` | `hsl(var(--color-border))` | Modal header border |
| `--component-modal-footer-background` | `hsl(var(--color-card))` | Modal footer background |
| `--component-modal-footer-border` | `hsl(var(--color-border))` | Modal footer border |

### Alert Components

| Token | Info | Success | Warning | Error | Usage |
|-------|------|---------|---------|-------|-------|
| `--component-alert-background` | `hsl(var(--color-info) / 0.1)` | `hsl(var(--color-success) / 0.1)` | `hsl(var(--color-warning) / 0.1)` | `hsl(var(--color-destructive) / 0.1)` | Alert background colors |
| `--component-alert-foreground` | `hsl(var(--color-info))` | `hsl(var(--color-success))` | `hsl(var(--color-warning))` | `hsl(var(--color-destructive))` | Alert text colors |
| `--component-alert-border` | `hsl(var(--color-info) / 0.5)` | `hsl(var(--color-success) / 0.5)` | `hsl(var(--color-warning) / 0.5)` | `hsl(var(--color-destructive) / 0.5)` | Alert border colors |
| `--component-alert-icon` | `hsl(var(--color-info))` | `hsl(var(--color-success))` | `hsl(var(--color-warning))` | `hsl(var(--color-destructive))` | Alert icon colors |

### Table Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-table-background` | `hsl(var(--color-background))` | Table background |
| `--component-table-foreground` | `hsl(var(--color-foreground))` | Table text |
| `--component-table-border` | `hsl(var(--color-border))` | Table borders |
| `--component-table-header-background` | `hsl(var(--color-muted))` | Header background |
| `--component-table-header-foreground` | `hsl(var(--color-muted-foreground))` | Header text |
| `--component-table-header-border` | `hsl(var(--color-border))` | Header borders |
| `--component-table-row-background-default` | `transparent` | Default row background |
| `--component-table-row-background-hover` | `hsl(var(--color-muted) / 0.5)` | Row hover background |
| `--component-table-row-background-selected` | `hsl(var(--color-accent) / 0.1)` | Selected row background |
| `--component-table-row-border` | `hsl(var(--color-border))` | Row borders |
| `--component-table-cell-padding` | `var(--spacing-3) var(--spacing-4)` | Cell padding |
| `--component-table-cell-border` | `hsl(var(--color-border))` | Cell borders |

### Navigation Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-navigation-background` | `hsl(var(--color-card))` | Navigation background |
| `--component-navigation-foreground` | `hsl(var(--color-card-foreground))` | Navigation text |
| `--component-navigation-border` | `hsl(var(--color-border))` | Navigation borders |
| `--component-navigation-item-background-default` | `transparent` | Default item background |
| `--component-navigation-item-background-hover` | `hsl(var(--color-accent) / 0.1)` | Item hover background |
| `--component-navigation-item-background-active` | `hsl(var(--color-accent) / 0.1)` | Item active background |
| `--component-navigation-item-foreground-default` | `hsl(var(--color-foreground))` | Default item text |
| `--component-navigation-item-foreground-hover` | `hsl(var(--color-accent))` | Item hover text |
| `--component-navigation-item-foreground-active` | `hsl(var(--color-accent))` | Item active text |
| `--component-navigation-item-border-default` | `transparent` | Default item border |
| `--component-navigation-item-border-active` | `hsl(var(--color-accent))` | Active item border |
| `--component-navigation-submenu-background` | `hsl(var(--color-popover))` | Submenu background |
| `--component-navigation-submenu-border` | `hsl(var(--color-border))` | Submenu border |
| `--component-navigation-submenu-shadow` | `var(--shadow-lg)` | Submenu shadow |

### Form Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-form-label-foreground` | `hsl(var(--color-foreground))` | Form label text color |
| `--component-form-label-font-size` | `var(--font-size-sm)` | Form label font size |
| `--component-form-label-font-weight` | `var(--font-weight-medium)` | Form label font weight |
| `--component-form-help-foreground` | `hsl(var(--color-muted-foreground))` | Help text color |
| `--component-form-help-font-size` | `var(--font-size-xs)` | Help text font size |
| `--component-form-error-foreground` | `hsl(var(--color-destructive))` | Error text color |
| `--component-form-error-font-size` | `var(--font-size-sm)` | Error text font size |
| `--component-form-error-border` | `hsl(var(--color-destructive) / 0.5)` | Error border color |
| `--component-form-fieldset-border` | `hsl(var(--color-border))` | Fieldset border color |
| `--component-form-fieldset-legend-foreground` | `hsl(var(--color-foreground))` | Legend text color |
| `--component-form-fieldset-legend-font-size` | `var(--font-size-lg)` | Legend font size |
| `--component-form-fieldset-legend-font-weight` | `var(--font-weight-semibold)` | Legend font weight |

### Sidebar Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-sidebar-background` | `hsl(var(--color-card))` | Sidebar background |
| `--component-sidebar-foreground` | `hsl(var(--color-card-foreground))` | Sidebar text |
| `--component-sidebar-border` | `hsl(var(--color-border))` | Sidebar borders |
| `--component-sidebar-width-collapsed` | `4rem` | Collapsed sidebar width |
| `--component-sidebar-width-expanded` | `16rem` | Expanded sidebar width |
| `--component-sidebar-item-background-default` | `transparent` | Default item background |
| `--component-sidebar-item-background-hover` | `hsl(var(--color-accent) / 0.1)` | Item hover background |
| `--component-sidebar-item-background-active` | `hsl(var(--color-accent) / 0.1)` | Item active background |
| `--component-sidebar-item-foreground-default` | `hsl(var(--color-foreground))` | Default item text |
| `--component-sidebar-item-foreground-hover` | `hsl(var(--color-accent))` | Item hover text |
| `--component-sidebar-item-foreground-active` | `hsl(var(--color-accent))` | Item active text |
| `--component-sidebar-item-border-default` | `transparent` | Default item border |
| `--component-sidebar-item-border-active` | `hsl(var(--color-accent))` | Active item border |
| `--component-sidebar-item-icon-default` | `hsl(var(--color-muted-foreground))` | Default icon color |
| `--component-sidebar-item-icon-active` | `hsl(var(--color-accent))` | Active icon color |

### Badge Components

| Token | Default | Secondary | Destructive | Outline | Usage |
|-------|---------|-----------|-------------|---------|-------|
| `--component-badge-background` | `hsl(var(--color-accent))` | `hsl(var(--color-secondary))` | `hsl(var(--color-destructive))` | `transparent` | Badge backgrounds |
| `--component-badge-foreground` | `hsl(var(--color-accent-foreground))` | `hsl(var(--color-secondary-foreground))` | `hsl(var(--color-destructive-foreground))` | `hsl(var(--color-foreground))` | Badge text colors |
| `--component-badge-border-outline` | - | - | - | `hsl(var(--color-border))` | Outline badge border |

### Tabs Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-tabs-background` | `hsl(var(--color-background))` | Tabs container background |
| `--component-tabs-border` | `hsl(var(--color-border))` | Tabs container border |
| `--component-tabs-tab-background-default` | `transparent` | Default tab background |
| `--component-tabs-tab-background-hover` | `hsl(var(--color-muted) / 0.5)` | Tab hover background |
| `--component-tabs-tab-background-active` | `hsl(var(--color-background))` | Active tab background |
| `--component-tabs-tab-foreground-default` | `hsl(var(--color-muted-foreground))` | Default tab text |
| `--component-tabs-tab-foreground-hover` | `hsl(var(--color-foreground))` | Tab hover text |
| `--component-tabs-tab-foreground-active` | `hsl(var(--color-foreground))` | Active tab text |
| `--component-tabs-tab-border-default` | `transparent` | Default tab border |
| `--component-tabs-tab-border-active` | `hsl(var(--color-border))` | Active tab border |
| `--component-tabs-content-background` | `hsl(var(--color-background))` | Tab content background |
| `--component-tabs-content-border` | `hsl(var(--color-border))` | Tab content border |

### Dropdown Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-dropdown-background` | `hsl(var(--color-popover))` | Dropdown background |
| `--component-dropdown-foreground` | `hsl(var(--color-popover-foreground))` | Dropdown text |
| `--component-dropdown-border` | `hsl(var(--color-border))` | Dropdown border |
| `--component-dropdown-shadow` | `var(--shadow-lg)` | Dropdown shadow |
| `--component-dropdown-item-background-default` | `transparent` | Default item background |
| `--component-dropdown-item-background-hover` | `hsl(var(--color-accent) / 0.1)` | Item hover background |
| `--component-dropdown-item-background-active` | `hsl(var(--color-accent) / 0.1)` | Item active background |
| `--component-dropdown-item-foreground-default` | `hsl(var(--color-popover-foreground))` | Default item text |
| `--component-dropdown-item-foreground-hover` | `hsl(var(--color-accent))` | Item hover text |
| `--component-dropdown-item-foreground-active` | `hsl(var(--color-accent))` | Item active text |
| `--component-dropdown-separator` | `hsl(var(--color-border))` | Dropdown separator |

### Tooltip Components

| Token | Value | Usage |
|-------|-------|-------|
| `--component-tooltip-background` | `hsl(var(--color-popover))` | Tooltip background |
| `--component-tooltip-foreground` | `hsl(var(--color-popover-foreground))` | Tooltip text |
| `--component-tooltip-border` | `hsl(var(--color-border))` | Tooltip border |
| `--component-tooltip-shadow` | `var(--shadow-md)` | Tooltip shadow |
| `--component-tooltip-arrow` | `hsl(var(--color-popover))` | Tooltip arrow color |

## Theme Provider Usage

### Basic Setup

```tsx
import { ThemeProvider } from '@ghxstship/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="auto" defaultContrast="normal">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Theme Controls

```tsx
import { useTheme } from '@ghxstship/ui';

function ThemeToggle() {
  const { theme, setTheme, contrast, setContrast } = useTheme();

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>

      <select value={contrast} onChange={(e) => setContrast(e.target.value as any)}>
        <option value="normal">Normal</option>
        <option value="high">High Contrast</option>
      </select>
    </div>
  );
}
```

### Token Access in Components

```tsx
import { useTokens } from '@ghxstship/ui';

function MyComponent() {
  const { colors, spacing, shadows, typography } = useTokens();

  return (
    <div style={{
      backgroundColor: colors.primary(),
      padding: spacing('md'),
      boxShadow: shadows.elevation(2),
      fontSize: typography.fontSize('lg')
    }}>
      Content
    </div>
  );
}
```

## Tailwind Integration

### Custom Tailwind Configuration

The design system integrates with Tailwind through a custom preset that exposes all tokens as utilities:

```js
// tailwind.config.ts
import { Config } from 'tailwindcss';
import preset from '@ghxstship/config/tailwind-preset';

export default {
  presets: [preset],
  // Your customizations...
} satisfies Config;
```

### Available Tailwind Classes

#### Spacing
```html
<!-- Standard spacing scale -->
<p class="m-1 p-2 mx-3 my-4">Spacing</p>

<!-- Semantic spacing -->
<p class="p-xs m-sm">Semantic spacing</p>
```

#### Colors
```html
<!-- Semantic colors -->
<div class="bg-background text-foreground border-border">
  <button class="bg-primary text-primary-foreground hover:bg-primary/90">
    Primary Button
  </button>
</div>

<!-- Component-specific -->
<div class="bg-card text-card-foreground border-border shadow-sm">
  Card content
</div>
```

#### Typography
```html
<h1 class="text-display">Display Text</h1>
<h2 class="text-heading-1">Heading 1</h2>
<p class="text-body">Body text</p>
<code class="font-mono text-sm">Code</code>
```

#### Shadows & Effects
```html
<div class="shadow-sm hover:shadow-md">Card</div>
<button class="shadow-pop-base hover:shadow-pop-md">Button</button>
```

#### Borders & Radii
```html
<div class="rounded-sm border border-border">Rounded</div>
<input class="rounded-md border-input" />
```

### Custom Utility Classes

The system provides semantic utility classes:

```html
<!-- Layout -->
<div class="stack-md"> <!-- Vertical spacing -->
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Colors -->
<div class="color-foreground bg-background">Content</div>

<!-- Gradients -->
<div class="gradient-primary text-white">Gradient text</div>
```

## High Contrast Mode

### Automatic High Contrast

The system automatically provides high contrast variants for all themes:

```tsx
// Light high contrast
<data-theme="light-high-contrast">

// Dark high contrast
<data-theme="dark-high-contrast">
```

### High Contrast Token Values

| Theme | Background | Foreground | Border |
|-------|------------|------------|--------|
| Light High Contrast | `hsl(0 0% 100%)` | `hsl(222 47% 5%)` | `hsl(215 20% 35%)` |
| Dark High Contrast | `hsl(0 0% 0%)` | `hsl(0 0% 100%)` | `hsl(0 0% 100%)` |

### Testing High Contrast

```tsx
import { ThemeProvider } from '@ghxstship/ui';

function App() {
  return (
    <ThemeProvider defaultContrast="high">
      <YourApp />
    </ThemeProvider>
  );
}
```

### High Contrast Best Practices

1. **Color Ratios**: All foreground/background combinations meet WCAG AAA standards
2. **Focus Indicators**: Enhanced focus rings for keyboard navigation
3. **Interactive States**: Clear hover and active states
4. **Text Contrast**: Minimum 7:1 ratio for normal text, 4.5:1 for large text
5. **Border Contrast**: High contrast borders for form elements

## Validation & Enforcement

### Zero Tolerance Validation

Run validation to ensure no hardcoded tokens:

```bash
# Validate current codebase
pnpm validate:tokens

# CI validation (stricter)
pnpm validate:tokens:ci

# Lint tokens specifically
pnpm lint:tokens
pnpm lint:tokens:ci
```

### ESLint Rules

The system includes comprehensive ESLint rules for semantic token validation:

```json
{
  "extends": [
    "next/core-web-vitals",
    "./.eslintrc.semantic-tokens.js"
  ],
  "rules": {
    "no-hardcoded-values": ["error", {
      "allowedPatterns": [
        "^(data:image|blob:|https?://|mailto:|tel:|sms:)",
        "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d+)?$",
        "^(true|false|null|undefined)$",
        "^[A-Z_]+$"
      ],
      "tokenPatterns": {
        "spacing": "var\\(--spacing-[\\w-]+\\)",
        "colors": "var\\(--color-[\\w-]+\\)",
        "typography": "var\\(--font-[\\w-]+\\)",
        "animation": "var\\(--duration-[\\w-]+\\)"
      }
    }],
    "consistent-token-naming": "error"
  }
}
```

### Automated Checks

- **Pre-commit hooks**: Validate before commits
- **CI pipeline**: Block builds with violations (zero tolerance)
- **ESLint**: Real-time validation during development
- **GitHub Actions**: Automated token validation in CI/CD

### Token Validation Scripts

Available npm scripts for validation:

```bash
# Run ESLint with semantic token rules
pnpm lint:tokens

# CI-mode token validation (stricter, no warnings)
pnpm lint:tokens:ci

# Validate token definitions and usage
pnpm validate:tokens

# CI token validation
pnpm validate:tokens:ci
```

# CI validation (stricter)
pnpm validate:tokens:ci
```

### ESLint Rules

```json
{
  "rules": {
    "no-hardcoded-colors": "error",
    "no-hardcoded-spacing": "error",
    "no-hardcoded-shadows": "warn",
    "no-hardcoded-motion": "warn",
    "consistent-imports": "error",
    "no-legacy-imports": "error"
  }
}
```

### Automated Checks

- **Pre-commit hooks**: Validate before commits
- **CI pipeline**: Block builds with violations
- **Linting**: Catch violations during development

## Migration Guide

### From Hardcoded Values

```css
/* ❌ Before */
.my-element {
  color: #000000;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* ✅ After */
.my-element {
  color: hsl(var(--color-foreground));
  padding: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}
```

### From Legacy Imports

```tsx
// ❌ Before
import { Card } from '@ghxstship/ui';

// ✅ After
import { Card } from '@ghxstship/ui';
```

## Best Practices

1. **Always use semantic tokens** over hardcoded values
2. **Prefer Tailwind classes** when possible
3. **Use component tokens** for complex component styling
4. **Test in all themes** (light, dark, high-contrast)
5. **Run validation** before committing changes
6. **Document new tokens** when adding them

## Contributing

When adding new tokens:

1. Add to the appropriate hierarchy level in `packages/ui/src/tokens.ts`
2. Update CSS variables in `packages/ui/src/styles/unified-design-system.css`
3. Update Tailwind preset in `packages/config/tailwind-preset.ts`
4. Add documentation to this file
5. Update validation scripts if needed
6. Test across all themes and breakpoints

## Reference Implementation

See `packages/ui/src/tokens.ts` for the complete TypeScript definition and utility functions for programmatic token access.
