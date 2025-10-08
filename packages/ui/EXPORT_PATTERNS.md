# Export Patterns — GHXSTSHIP UI Package
## Standardized Export Architecture

**Version:** 2.0.0 (2030 Standard)  
**Date:** October 7, 2025  
**Status:** ✅ Active Standard

---

## 🎯 Philosophy

**Single Export Point:** All components export through `packages/ui/src/index.ts`  
**No Deep Imports:** Users import from `@ghxstship/ui` only  
**Tree-Shakable:** ESM modules with named exports for optimal bundling

---

## 📊 Export Hierarchy

```
packages/ui/src/index.ts (PRIMARY EXPORT)
├── Exports from atoms/index.ts
├── Exports from molecules/index.ts
├── Exports from organisms/index.ts
├── Exports from templates/index.ts
├── Exports from index-unified.ts (providers, hooks, utils)
└── Legacy exports (backward compatibility, deprecated)
```

---

## ✅ Standardized Patterns

### **Pattern 1: Component Export (Recommended)**

**File Structure:**
```
atoms/Button/
├── Button.tsx (component implementation)
└── index.ts (barrel export)
```

**Component File (`Button.tsx`):**
```typescript
// Named export (not default)
export function Button({ ... }: ButtonProps) {
  // Implementation
}

// Export variants/utilities
export const buttonVariants = cva(...);

// Export types
export type { ButtonProps };
```

**Barrel Export (`atoms/Button/index.ts`):**
```typescript
// Re-export everything from the component
export * from './Button';
```

**Layer Export (`atoms/index.ts`):**
```typescript
// Re-export from subdirectory
export * from './Button';
export * from './Input';
export * from './Checkbox';
// ... etc
```

**Main Export (`src/index.ts`):**
```typescript
// Import from layer and re-export
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
```

---

### **Pattern 2: Utility/Hook Export**

**File:**
```typescript
// src/hooks/useToast.ts
export function useToast() {
  // Implementation
}

export type { Toast, ToastAction };
```

**Main Export (`src/index.ts`):**
```typescript
export { useToast, type Toast, type ToastAction } from './hooks/useToast';
```

---

### **Pattern 3: Provider Export**

**File:**
```typescript
// src/providers/ThemeProvider.tsx
export function ThemeProvider({ children, ... }: ThemeProviderProps) {
  // Implementation
}

export function useTheme() {
  // Hook
}

export type { ThemeProviderProps, ThemeConfig };
```

**Main Export (`src/index.ts`):**
```typescript
export {
  ThemeProvider,
  useTheme,
  type ThemeProviderProps,
  type ThemeConfig
} from './providers/ThemeProvider';
```

---

## ❌ Anti-Patterns (Avoid)

### **❌ Default Exports**

**Don't:**
```typescript
export default function Button() { ... }
```

**Do:**
```typescript
export function Button() { ... }
```

**Why:** Named exports are better for tree-shaking and refactoring.

---

### **❌ Mixed Export Styles**

**Don't:**
```typescript
// atoms/index.ts
export { Button } from './Button';
export * from './Input';
import Checkbox from './Checkbox';
export { Checkbox };
```

**Do:**
```typescript
// atoms/index.ts
export * from './Button';
export * from './Input';
export * from './Checkbox';
```

**Why:** Consistency makes code predictable and maintainable.

---

### **❌ Deep Path Exports**

**Don't:**
```typescript
export { Button } from './components/atomic/Button/Button';
```

**Do:**
```typescript
export * from './atoms/Button';
```

**Why:** Shorter paths, better abstraction.

---

## 🔧 Implementation Guide

### **Creating a New Component**

**Step 1: Create Component File**
```typescript
// src/atoms/NewComponent/NewComponent.tsx
'use client'; // If it uses React hooks

import { cn } from '../../lib/utils';

export interface NewComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export function NewComponent({ 
  children,
  className 
}: NewComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}

// Export variants if using CVA
export const newComponentVariants = cva(...);
```

**Step 2: Create Barrel Export**
```typescript
// src/atoms/NewComponent/index.ts
export * from './NewComponent';
```

**Step 3: Add to Layer Export**
```typescript
// src/atoms/index.ts
export * from './Button';
export * from './Input';
export * from './NewComponent'; // Add here
```

**Step 4: Verify Main Export**
```typescript
// src/index.ts should already have:
export * from './atoms';
```

**Step 5: Test Import**
```typescript
// In your app
import { NewComponent } from '@ghxstship/ui';
```

---

## 📋 Export Checklist

Before committing a new component:

- [ ] Component uses **named export**, not default
- [ ] Component has barrel export in its directory
- [ ] Component is added to layer `index.ts`
- [ ] Component exports through main `src/index.ts`
- [ ] Types are exported with `export type { ... }`
- [ ] No deep imports required
- [ ] Tree-shaking verified (check bundle size)

---

## 🔍 Validation

### **Verify Export Pattern**

```bash
# Check if component is exported correctly
pnpm exec tsx -e "import { NewComponent } from '@ghxstship/ui'; console.log(!!NewComponent)"
```

### **Check Bundle Size**

```bash
# Analyze what gets included in bundle
pnpm build
pnpm analyze
```

---

## 📚 Real-World Examples

### **Example 1: Atom with Variants**

```typescript
// src/atoms/Badge/Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva('inline-flex items-center...', {
  variants: {
    variant: {
      default: '...',
      secondary: '...',
      destructive: '...',
    }
  }
});

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

**Export chain:**
```typescript
// Badge/index.ts
export * from './Badge';

// atoms/index.ts
export * from './Badge';

// src/index.ts
export * from './atoms';
```

**Usage:**
```typescript
import { Badge, badgeVariants } from '@ghxstship/ui';
```

---

### **Example 2: Molecule with Sub-Components**

```typescript
// src/molecules/Tabs/Tabs.tsx
export function Tabs() { ... }
export function TabsList() { ... }
export function TabsTrigger() { ... }
export function TabsContent() { ... }

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };
```

**Export:**
```typescript
// Tabs/index.ts
export * from './Tabs';

// molecules/index.ts
export * from './Tabs';

// src/index.ts
export * from './molecules';
```

**Usage:**
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ghxstship/ui';

<Tabs>
  <TabsList>
    <TabsTrigger>Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent>Content</TabsContent>
</Tabs>
```

---

## 🚀 Migration from Old Patterns

### **Before (Multiple Export Styles)**
```typescript
// Old inconsistent exports
export default Button;
export { buttonVariants };
export type ButtonProps = ...;
```

### **After (Standardized)**
```typescript
// New consistent exports
export function Button() { ... }
export const buttonVariants = cva(...);
export type { ButtonProps };
```

---

## 🛡️ Enforcement

### **ESLint Rule**

Add to `.eslintrc.js`:

```javascript
{
  "rules": {
    "import/no-default-export": "error",
    "import/no-anonymous-default-export": "error"
  }
}
```

### **TypeScript Config**

Ensure `compilerOptions` include:

```json
{
  "esModuleInterop": true,
  "allowSyntheticDefaultImports": true,
  "module": "ESNext",
  "moduleResolution": "bundler"
}
```

---

## 📖 Benefits

✅ **Single Import Point:** `import { X } from '@ghxstship/ui'`  
✅ **Tree-Shaking:** Only imports what you use  
✅ **Better DX:** Autocomplete shows all components  
✅ **Consistent:** Same pattern everywhere  
✅ **Refactoring:** Easy to rename/move components  
✅ **Bundle Size:** Optimal code splitting

---

## 🎯 Summary

**Golden Rules:**
1. All exports go through `src/index.ts`
2. Use named exports only (no defaults)
3. Re-export with `export * from './path'`
4. Export types with `export type { ... }`
5. Keep barrel exports thin (just re-export)
6. Test imports work from package root

**Result:** Clean, predictable, tree-shakable exports.

---

**Last Updated:** October 7, 2025  
**Status:** ✅ Active Standard
