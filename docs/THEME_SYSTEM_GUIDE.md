# GHXSTSHIP Theme System Guide

## Complete Theme System Implementation

This guide covers the comprehensive theme system implementation for GHXSTSHIP, including all features, components, and utilities.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Theme Providers](#theme-providers)
4. [Theme-Aware Components](#theme-aware-components)
5. [Theme Utilities](#theme-utilities)
6. [Third-Party Integration](#third-party-integration)
7. [Validation & Testing](#validation--testing)
8. [Best Practices](#best-practices)

---

## Overview

The GHXSTSHIP theme system provides:

- ✅ **Automatic Detection** - System preference detection
- ✅ **Manual Override** - User preference storage
- ✅ **Seamless Switching** - Zero-flicker theme transitions
- ✅ **Component Coverage** - All components support both themes
- ✅ **Image Adaptation** - Theme-aware images and icons
- ✅ **Chart Theming** - Data visualization theme adaptation
- ✅ **Syntax Highlighting** - Code blocks adapt to theme
- ✅ **Brand Compliance** - Multi-brand theming support
- ✅ **Nested Contexts** - Component-level theme overrides
- ✅ **Performance Optimized** - Sub-100ms theme switching
- ✅ **Accessibility Validated** - WCAG AA/AAA compliance

---

## Getting Started

### Basic Setup

```tsx
import { ThemeProvider } from '@ghxstship/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="auto">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Using Theme

```tsx
import { useTheme } from '@ghxstship/ui';

function Component() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {effectiveTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('auto')}>Auto</button>
    </div>
  );
}
```

---

## Theme Providers

### 1. ThemeProvider (Core)

The main theme provider with comprehensive features.

```tsx
import { ThemeProvider } from '@ghxstship/ui';

<ThemeProvider 
  defaultTheme="auto"
  defaultContrast="normal"
  defaultMotion="normal"
>
  <App />
</ThemeProvider>
```

**Features:**
- System preference detection
- localStorage persistence
- Contrast modes (normal, high)
- Motion preferences (normal, reduced)
- Performance optimized switching

### 2. UnifiedThemeProvider (Enterprise)

Enterprise-grade provider with brand support.

```tsx
import { UnifiedThemeProvider } from '@ghxstship/ui';

<UnifiedThemeProvider
  defaultTheme="system"
  defaultBrand="ghxstship"
  enableSystem={true}
>
  <App />
</UnifiedThemeProvider>
```

**Features:**
- Multi-brand support (GHXSTSHIP, ATLVS, OPENDECK)
- Font size scaling
- High contrast mode
- Reduced motion support

### 3. AdaptiveThemeProvider (AI-Powered)

AI-powered adaptive theming based on context.

```tsx
import { AdaptiveThemeProvider } from '@ghxstship/ui';

<AdaptiveThemeProvider>
  <App />
</AdaptiveThemeProvider>
```

**Features:**
- Time-of-day adaptation
- Activity context detection
- Stress level monitoring
- Mood-based color palettes

---

## Theme-Aware Components

### ThemeAwareImage

Automatically switches images based on theme.

```tsx
import { ThemeAwareImage } from '@ghxstship/ui';

<ThemeAwareImage
  lightSrc="/logo-light.png"
  darkSrc="/logo-dark.png"
  alt="Company Logo"
  className="w-32 h-32"
/>
```

### ThemeAwareSVG

Renders different SVG content per theme.

```tsx
import { ThemeAwareSVG } from '@ghxstship/ui';

<ThemeAwareSVG
  lightContent={<path fill="#000" d="..." />}
  darkContent={<path fill="#fff" d="..." />}
  viewBox="0 0 24 24"
/>
```

### ThemeAwareIcon

Switches icon components based on theme.

```tsx
import { ThemeAwareIcon } from '@ghxstship/ui';
import { Sun, Moon } from 'lucide-react';

<ThemeAwareIcon
  LightIcon={Sun}
  DarkIcon={Moon}
  className="w-6 h-6"
/>
```

### CodeBlock

Theme-aware code block with syntax highlighting.

```tsx
import { CodeBlock } from '@ghxstship/ui';

<CodeBlock
  code="const hello = 'world';"
  language="typescript"
  showLineNumbers
  title="example.ts"
  highlightLines={[1, 3]}
/>
```

### ThemeScope

Create theme-scoped sections.

```tsx
import { ThemeScope } from '@ghxstship/ui';

<ThemeScope theme="dark" contrast="high">
  <ComponentThatNeedsDarkTheme />
</ThemeScope>
```

---

## Theme Utilities

### Theme Validation

Validate theme accessibility compliance.

```tsx
import { validateThemeAccessibility } from '@ghxstship/ui';
import { SEMANTIC_TOKENS } from '@ghxstship/ui/tokens';

const results = validateThemeAccessibility(SEMANTIC_TOKENS.light, 'AA');

console.log(`Pass rate: ${results.summary.passRate}%`);
console.log('Failed checks:', results.failed);
```

### Contrast Ratio Calculation

```tsx
import { calculateContrastRatio, meetsWCAG } from '@ghxstship/ui';

const ratio = calculateContrastRatio('#000000', '#ffffff');
const passes = meetsWCAG(ratio, 'AA', 'normal');

console.log(`Contrast ratio: ${ratio}:1`);
console.log(`Meets WCAG AA: ${passes}`);
```

### Chart Theming

```tsx
import { useChartTheme, getRechartsTheme } from '@ghxstship/ui';

function Chart() {
  const chartTheme = useChartTheme();
  const rechartsConfig = getRechartsTheme(chartTheme);
  
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <XAxis stroke={chartTheme.gridColor} />
        <YAxis stroke={chartTheme.gridColor} />
        <Line stroke={chartTheme.colors[0]} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Third-Party Integration

### AG Grid

```tsx
import { useAgGridTheme } from '@ghxstship/ui';

function DataGrid() {
  const { theme, customTheme } = useAgGridTheme();
  
  return (
    <div className={theme} style={customTheme}>
      <AgGridReact {...gridOptions} />
    </div>
  );
}
```

### React Select

```tsx
import { useReactSelectTheme } from '@ghxstship/ui';
import Select from 'react-select';

function Dropdown() {
  const selectTheme = useReactSelectTheme();
  
  return (
    <Select
      options={options}
      styles={selectTheme}
    />
  );
}
```

### Chart.js

```tsx
import { useChartTheme, getChartJsTheme } from '@ghxstship/ui';
import { Line } from 'react-chartjs-2';

function LineChart() {
  const chartTheme = useChartTheme();
  const options = getChartJsTheme(chartTheme);
  
  return <Line data={data} options={options} />;
}
```

### Full Calendar

```tsx
import { useFullCalendarTheme } from '@ghxstship/ui';
import FullCalendar from '@fullcalendar/react';

function Calendar() {
  const calendarTheme = useFullCalendarTheme();
  
  return (
    <div style={calendarTheme}>
      <FullCalendar {...config} />
    </div>
  );
}
```

---

## Validation & Testing

### Run Theme Validation

```bash
# Validate all themes for WCAG compliance
npm run validate:themes

# Or using the script directly
tsx scripts/validate-theme-accessibility.ts
```

### Automated Testing

```typescript
import { describe, it, expect } from 'vitest';
import { validateThemeAccessibility } from '@ghxstship/ui';
import { SEMANTIC_TOKENS } from '@ghxstship/ui/tokens';

describe('Theme Accessibility', () => {
  it('should pass WCAG AA for light theme', () => {
    const results = validateThemeAccessibility(SEMANTIC_TOKENS.light, 'AA');
    expect(results.summary.passRate).toBeGreaterThan(90);
  });
  
  it('should pass WCAG AA for dark theme', () => {
    const results = validateThemeAccessibility(SEMANTIC_TOKENS.dark, 'AA');
    expect(results.summary.passRate).toBeGreaterThan(90);
  });
});
```

### Performance Monitoring

Theme switching performance is automatically monitored in development:

```typescript
// Automatic performance logging
// Theme switch took: 45.23ms (target: <100ms)
```

---

## Best Practices

### 1. Use Semantic Tokens

❌ **Don't:**
```tsx
<div className="bg-white dark:bg-gray-900">
```

✅ **Do:**
```tsx
<div className="bg-background">
```

### 2. Theme-Aware Images

❌ **Don't:**
```tsx
<img src="/logo.png" alt="Logo" />
```

✅ **Do:**
```tsx
<ThemeAwareImage
  lightSrc="/logo-light.png"
  darkSrc="/logo-dark.png"
  alt="Logo"
/>
```

### 3. Chart Theming

❌ **Don't:**
```tsx
<LineChart>
  <Line stroke="#3b82f6" />
</LineChart>
```

✅ **Do:**
```tsx
const chartTheme = useChartTheme();
<LineChart>
  <Line stroke={chartTheme.colors[0]} />
</LineChart>
```

### 4. Nested Themes

Use ThemeScope for component-level overrides:

```tsx
<div className="bg-background">
  <Header />
  
  <ThemeScope theme="dark">
    <DarkModeOnlyFeature />
  </ThemeScope>
  
  <Footer />
</div>
```

### 5. Accessibility

Always validate theme combinations:

```bash
npm run validate:themes
```

Ensure all custom colors meet WCAG requirements:

```typescript
const ratio = calculateContrastRatio(foreground, background);
if (!meetsWCAG(ratio, 'AA')) {
  console.warn('Insufficient contrast!');
}
```

---

## Migration Guide

### From Hardcoded Classes

```tsx
// Before
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// After
<div className="bg-background text-foreground">
```

### From Custom Theme Hook

```tsx
// Before
const { theme } = useCustomTheme();
const isDark = theme === 'dark';

// After
const { effectiveTheme } = useTheme();
const isDark = effectiveTheme.includes('dark');
```

### From Manual Image Switching

```tsx
// Before
const logo = isDark ? '/logo-dark.png' : '/logo-light.png';
<img src={logo} alt="Logo" />

// After
<ThemeAwareImage
  lightSrc="/logo-light.png"
  darkSrc="/logo-dark.png"
  alt="Logo"
/>
```

---

## Troubleshooting

### Theme Not Applying

1. Ensure ThemeProvider wraps your app
2. Check that semantic tokens are imported
3. Verify CSS variables are loaded

### Performance Issues

1. Check theme switch duration in console
2. Reduce number of CSS variables if needed
3. Use ThemeScope to limit reflow scope

### Accessibility Failures

1. Run `npm run validate:themes`
2. Check contrast ratios with `calculateContrastRatio`
3. Adjust colors to meet WCAG requirements

---

## API Reference

### ThemeProvider Props

```typescript
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'auto';
  defaultContrast?: 'normal' | 'high';
  defaultMotion?: 'normal' | 'reduced';
}
```

### useTheme Hook

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark' | 'auto';
  contrast: 'normal' | 'high';
  motion: 'normal' | 'reduced';
  effectiveTheme: 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';
  setTheme: (theme: ThemeMode) => void;
  setContrast: (contrast: ContrastMode) => void;
  setMotion: (motion: MotionMode) => void;
  getToken: (path: string) => string;
  getColorToken: (semanticName: string, variant?: string) => string;
  getSpacingToken: (size: number | string) => string;
  getShadowToken: (elevation: number) => string;
}
```

---

## Resources

- [Design Tokens Documentation](./SEMANTIC_DESIGN_SYSTEM_AUDIT.md)
- [Theme Validation Report](./THEME_SYSTEM_VALIDATION_REPORT.md)
- [Component Library](../packages/ui/src/components/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated:** 2025-09-29  
**Version:** 2.0.0  
**Maintainer:** GHXSTSHIP Design System Team
