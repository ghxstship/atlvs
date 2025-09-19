# GHXSTSHIP Enterprise UI System

## Overview

The GHXSTSHIP Enterprise UI System is a comprehensive, future-proof design system built for scalability, accessibility, and performance. This system provides a unified foundation for all UI components, design tokens, and interaction patterns across the GHXSTSHIP ecosystem.

## 🎯 Key Features

### ✅ **Enterprise-Grade Architecture**
- **Atomic Design Principles**: Components organized in atoms, molecules, and organisms
- **Design Token System**: Single source of truth for all design values
- **Type Safety**: Full TypeScript support with strict typing
- **Performance Optimized**: Tree-shakable, lazy-loaded components
- **Framework Agnostic**: Can be used with React, Vue, Angular, or vanilla JS

### ✅ **Accessibility First (WCAG 2.2+ Compliant)**
- **Screen Reader Support**: Full ARIA implementation
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Intelligent focus trapping and restoration
- **Color Contrast**: Automated contrast checking
- **Motion Preferences**: Respects user motion preferences

### ✅ **Theming & Customization**
- **Multi-Brand Support**: GHXSTSHIP, ATLVS, OPENDECK themes
- **Dark/Light Modes**: Automatic system preference detection
- **Custom Themes**: Easy theme creation and extension
- **CSS Custom Properties**: Runtime theme switching

### ✅ **Developer Experience**
- **Comprehensive Documentation**: Usage examples and guidelines
- **Storybook Integration**: Interactive component playground
- **TypeScript Support**: Full type definitions
- **ESLint Rules**: Automated code quality checks

## 🏗️ Architecture

### Design Token System

The design system is built on a comprehensive token system that ensures consistency across all components:

```typescript
import { DESIGN_TOKENS, getToken } from '@ghxstship/ui';

// Access tokens programmatically
const primaryColor = getToken('colors.brand.primary.500');
const spacing = getToken('spacing.4');
```

### Component Hierarchy

```
src/
├── tokens/                 # Design tokens
│   ├── unified-design-tokens.ts
│   └── design-system.css
├── components/
│   ├── atomic/            # Basic building blocks
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── molecular/         # Component combinations
│   └── organisms/         # Complex UI patterns
├── providers/             # Context providers
│   ├── UnifiedThemeProvider.tsx
│   └── ...
├── accessibility/         # A11y utilities
├── styles/               # Global styles
└── utils/                # Helper functions
```

## 🚀 Getting Started

### Installation

```bash
npm install @ghxstship/ui
```

### Basic Setup

```tsx
import { GHXSTSHIPProvider, Button } from '@ghxstship/ui';
import '@ghxstship/ui/styles';

function App() {
  return (
    <GHXSTSHIPProvider>
      <Button variant="primary">Hello World</Button>
    </GHXSTSHIPProvider>
  );
}
```

### Advanced Setup with Custom Theme

```tsx
import { 
  UnifiedThemeProvider, 
  AccessibilityProvider,
  Button 
} from '@ghxstship/ui';

function App() {
  return (
    <UnifiedThemeProvider 
      defaultTheme="dark" 
      defaultBrand="atlvs"
    >
      <AccessibilityProvider 
        defaultConfig={{
          announcements: true,
          focusManagement: true,
          keyboardNavigation: true
        }}
      >
        <Button variant="pop">Accessible Button</Button>
      </AccessibilityProvider>
    </UnifiedThemeProvider>
  );
}
```

## 🎨 Design Tokens

### Color System

```typescript
// Semantic colors that adapt to theme
const colors = {
  primary: 'hsl(var(--color-primary))',
  secondary: 'hsl(var(--color-secondary))',
  accent: 'hsl(var(--color-accent))',
  success: 'hsl(var(--color-success))',
  warning: 'hsl(var(--color-warning))',
  error: 'hsl(var(--color-destructive))',
};
```

### Typography Scale

```typescript
// Fluid typography that scales with viewport
const typography = {
  display: 'clamp(2.5rem, 8vw, 4rem)',
  heading1: 'clamp(2rem, 6vw, 3rem)',
  heading2: 'clamp(1.5rem, 4vw, 2.25rem)',
  body: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
};
```

### Spacing System

```typescript
// 8px base grid system
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
};
```

## 🧩 Component Usage

### Button Component

```tsx
import { Button } from '@ghxstship/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="pop">Pop Art Style</Button>

// With icons and loading states
<Button 
  leftIcon={<Icon name="plus" />}
  loading={isLoading}
  disabled={isDisabled}
>
  Add Item
</Button>

// Button groups
<ButtonGroup orientation="horizontal" attached>
  <Button>First</Button>
  <Button>Second</Button>
  <Button>Third</Button>
</ButtonGroup>
```

### Input Component

```tsx
import { Input, SearchInput, PasswordInput } from '@ghxstship/ui';

// Basic input with validation
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>

// Search input
<SearchInput
  placeholder="Search products..."
  onSearch={handleSearch}
/>

// Password input with toggle
<PasswordInput
  label="Password"
  placeholder="Enter password"
  strength={passwordStrength}
/>

// Input group
<InputGroup orientation="horizontal">
  <Input placeholder="First name" />
  <Input placeholder="Last name" />
</InputGroup>
```

## 🎭 Theming

### Using Theme Context

```tsx
import { useTheme, useDesignTokens } from '@ghxstship/ui';

function ThemedComponent() {
  const { config, setTheme, toggleTheme } = useTheme();
  const tokens = useDesignTokens();
  
  return (
    <div style={{ 
      backgroundColor: tokens.semantic.background,
      color: tokens.semantic.foreground 
    }}>
      <button onClick={toggleTheme}>
        Switch to {config.theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
}
```

### Custom Theme Creation

```tsx
// Create custom brand theme
const customTheme = {
  colors: {
    primary: 'hsl(280 100% 50%)',
    accent: 'hsl(120 100% 50%)',
  },
  typography: {
    fontFamily: {
      title: ['Custom Font', 'Arial', 'sans-serif'],
    },
  },
};

// Apply custom theme
<UnifiedThemeProvider customTokens={customTheme}>
  <App />
</UnifiedThemeProvider>
```

## ♿ Accessibility

### Using Accessibility Hooks

```tsx
import { 
  useAccessibility, 
  useFocusManagement, 
  useAnnouncements 
} from '@ghxstship/ui';

function AccessibleModal() {
  const { trapFocus } = useFocusManagement();
  const { announce } = useAnnouncements();
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      announce('Modal opened');
      return cleanup;
    }
  }, [isOpen, trapFocus, announce]);
  
  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal content */}
    </div>
  );
}
```

### Keyboard Navigation

```tsx
import { useKeyboardNavigation } from '@ghxstship/ui';

function NavigableList() {
  useKeyboardNavigation({
    'arrowdown': () => focusNext(),
    'arrowup': () => focusPrevious(),
    'enter': () => selectCurrent(),
    'escape': () => closeList(),
  });
  
  return (
    <ul role="listbox">
      {items.map(item => (
        <li key={item.id} role="option" tabIndex={0}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

## 🚀 Performance

### Tree Shaking

The design system is built with tree shaking in mind:

```tsx
// ✅ Good - only imports what you need
import { Button, Input } from '@ghxstship/ui';

// ❌ Avoid - imports entire library
import * as UI from '@ghxstship/ui';
```

### Lazy Loading

Components support lazy loading for better performance:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@ghxstship/ui/components/HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 📱 Responsive Design

### Breakpoint System

```typescript
const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

### Responsive Utilities

```tsx
import { useResponsive } from '@ghxstship/ui';

function ResponsiveComponent() {
  const { isAbove } = useResponsive();
  
  return (
    <div>
      {isAbove('md') ? (
        <DesktopLayout />
      ) : (
        <MobileLayout />
      )}
    </div>
  );
}
```

## 🔧 Customization

### CSS Custom Properties

All design tokens are available as CSS custom properties:

```css
.custom-component {
  background-color: hsl(var(--color-primary));
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Component Variants

Create custom component variants using the CVA (Class Variance Authority) system:

```tsx
import { cva } from 'class-variance-authority';

const customButtonVariants = cva(
  'base-button-classes',
  {
    variants: {
      intent: {
        primary: 'bg-primary text-primary-foreground',
        custom: 'bg-gradient-to-r from-purple-500 to-pink-500',
      },
      size: {
        small: 'text-sm px-2 py-1',
        large: 'text-lg px-6 py-3',
      },
    },
  }
);
```

## 🧪 Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { GHXSTSHIPProvider, Button } from '@ghxstship/ui';

test('button renders correctly', () => {
  render(
    <GHXSTSHIPProvider>
      <Button>Click me</Button>
    </GHXSTSHIPProvider>
  );
  
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('component has no accessibility violations', async () => {
  const { container } = render(
    <GHXSTSHIPProvider>
      <Button>Accessible Button</Button>
    </GHXSTSHIPProvider>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Migration Guide

### From Legacy System

1. **Install the new system**: `npm install @ghxstship/ui@latest`
2. **Wrap your app**: Add `GHXSTSHIPProvider` at the root
3. **Update imports**: Change from old component paths to new unified imports
4. **Update styles**: Replace custom CSS with design tokens
5. **Test thoroughly**: Ensure all functionality works as expected

### Breaking Changes

- Component props have been standardized
- Some utility classes have been renamed
- Theme structure has changed
- Accessibility props are now required in some components

## 🤝 Contributing

### Development Setup

```bash
git clone <repository>
cd ghxstship-ui
npm install
npm run dev
```

### Component Development

1. Create component in appropriate atomic/molecular/organism folder
2. Add comprehensive TypeScript types
3. Include accessibility features
4. Write tests
5. Add Storybook stories
6. Update documentation

### Design Token Updates

1. Update `unified-design-tokens.ts`
2. Regenerate CSS custom properties
3. Update component styles
4. Test across all themes
5. Update documentation

## 📖 Resources

- [Storybook Documentation](./storybook)
- [Component API Reference](./docs/components)
- [Design Token Reference](./docs/tokens)
- [Accessibility Guidelines](./docs/accessibility)
- [Migration Guide](./docs/migration)

## 🆘 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Create an issue](https://github.com/ghxstship/ui/issues)
- **Documentation**: [View docs](https://ui.ghxstship.com)
- **Slack**: #design-system channel

---

**Built with ❤️ by the GHXSTSHIP Team**
