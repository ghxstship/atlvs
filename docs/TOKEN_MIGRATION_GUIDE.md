# 🎨 Design Token Migration Guide

**Quick Reference for Migrating from Hardcoded Values to Semantic Tokens**

---

## 🚀 Quick Start

### **Automated Migration**:
```bash
# Fix all hardcoded colors in apps/web
pnpm fix:colors

# Fix entire codebase
pnpm fix:colors:all

# Validate results
cd packages/ui && pnpm validate:tokens
```

### **Manual Migration**:
Use this guide when the automated tool doesn't catch everything or you need custom mappings.

---

## 📋 Color Migration Reference

### **Primary Colors (Blue)**

```typescript
// ❌ BEFORE
'#3b82f6'
'#2563eb'
'#1d4ed8'
'rgb(59, 130, 246)'
'rgba(59, 130, 246, 0.5)'

// ✅ AFTER
'hsl(var(--color-primary))'
'hsl(var(--color-primary))'
'hsl(var(--color-primary))'
'hsl(var(--color-primary))'
'hsl(var(--color-primary) / 0.5)'
```

### **Success Colors (Green)**

```typescript
// ❌ BEFORE
'#10b981'
'#059669'
'#22c55e'
'rgb(16, 185, 129)'

// ✅ AFTER
'hsl(var(--color-success))'
'hsl(var(--color-success))'
'hsl(var(--color-success))'
'hsl(var(--color-success))'
```

### **Warning Colors (Yellow/Orange)**

```typescript
// ❌ BEFORE
'#f59e0b'
'#fbbf24'
'#f97316'
'rgb(245, 158, 11)'

// ✅ AFTER
'hsl(var(--color-warning))'
'hsl(var(--color-warning))'
'hsl(var(--color-warning))'
'hsl(var(--color-warning))'
```

### **Error/Destructive Colors (Red)**

```typescript
// ❌ BEFORE
'#ef4444'
'#dc2626'
'#f87171'
'rgb(239, 68, 68)'

// ✅ AFTER
'hsl(var(--color-destructive))'
'hsl(var(--color-destructive))'
'hsl(var(--color-destructive))'
'hsl(var(--color-destructive))'
```

### **Info Colors (Cyan)**

```typescript
// ❌ BEFORE
'#06b6d4'
'#0891b2'
'#22d3ee'
'rgb(6, 182, 212)'

// ✅ AFTER
'hsl(var(--color-info))'
'hsl(var(--color-info))'
'hsl(var(--color-info))'
'hsl(var(--color-info))'
```

### **Accent Colors (Purple/Pink)**

```typescript
// ❌ BEFORE
'#8b5cf6'  // Purple
'#ec4899'  // Pink
'#a78bfa'  // Light purple
'rgb(139, 92, 246)'

// ✅ AFTER
'hsl(var(--color-accent))'
'hsl(var(--color-accent))'
'hsl(var(--color-accent))'
'hsl(var(--color-accent))'
```

### **Neutral Colors (Gray Scale)**

```typescript
// ❌ BEFORE - Light grays
'#f9fafb'  // Very light
'#f3f4f6'  // Light
'#e5e7eb'  // Border
'#d1d5db'  // Border dark

// ✅ AFTER
'hsl(var(--color-muted))'
'hsl(var(--color-muted))'
'hsl(var(--color-border))'
'hsl(var(--color-border))'

// ❌ BEFORE - Medium grays
'#9ca3af'  // Muted text
'#6b7280'  // Muted text dark

// ✅ AFTER
'hsl(var(--color-muted-foreground))'
'hsl(var(--color-muted-foreground))'

// ❌ BEFORE - Dark grays
'#4b5563'  // Foreground
'#374151'  // Foreground dark
'#1f2937'  // Background
'#111827'  // Background darker

// ✅ AFTER
'hsl(var(--color-foreground))'
'hsl(var(--color-foreground))'
'hsl(var(--color-background))'
'hsl(var(--color-background))'
```

### **Black & White**

```typescript
// ❌ BEFORE
'#000000' or '#000'
'#ffffff' or '#fff'
'rgb(0, 0, 0)'
'rgb(255, 255, 255)'

// ✅ AFTER
'hsl(0 0% 0%)'
'hsl(0 0% 100%)'
'hsl(0 0% 0%)'
'hsl(0 0% 100%)'
```

### **Colors with Opacity**

```typescript
// ❌ BEFORE
'rgba(0, 0, 0, 0.5)'
'rgba(255, 255, 255, 0.8)'
'rgba(59, 130, 246, 0.3)'

// ✅ AFTER
'hsl(0 0% 0% / 0.5)'
'hsl(0 0% 100% / 0.8)'
'hsl(var(--color-primary) / 0.3)'
```

---

## 🎯 Common Patterns

### **Chart Colors**

```typescript
// ❌ BEFORE
const chartColors = [
  '#3b82f6',  // Blue
  '#10b981',  // Green
  '#f59e0b',  // Yellow
  '#ef4444',  // Red
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
];

// ✅ AFTER
const chartColors = [
  'hsl(var(--color-primary))',
  'hsl(var(--color-success))',
  'hsl(var(--color-warning))',
  'hsl(var(--color-destructive))',
  'hsl(var(--color-accent))',
  'hsl(var(--color-accent))',
];
```

### **Status Colors**

```typescript
// ❌ BEFORE
const statusColors = {
  active: '#10b981',
  pending: '#f59e0b',
  inactive: '#6b7280',
  error: '#ef4444',
};

// ✅ AFTER
const statusColors = {
  active: 'hsl(var(--color-success))',
  pending: 'hsl(var(--color-warning))',
  inactive: 'hsl(var(--color-muted-foreground))',
  error: 'hsl(var(--color-destructive))',
};
```

### **Background Overlays**

```typescript
// ❌ BEFORE
backgroundColor: 'rgba(0, 0, 0, 0.5)'
backgroundColor: 'rgba(255, 255, 255, 0.9)'

// ✅ AFTER
backgroundColor: 'hsl(var(--color-background) / 0.5)'
backgroundColor: 'hsl(var(--color-background) / 0.9)'
```

### **Border Colors**

```typescript
// ❌ BEFORE
borderColor: '#e5e7eb'
borderColor: '#d1d5db'
border: '1px solid #e5e7eb'

// ✅ AFTER
borderColor: 'hsl(var(--color-border))'
borderColor: 'hsl(var(--color-border))'
border: '1px solid hsl(var(--color-border))'
```

---

## 🔧 Framework-Specific Examples

### **React Inline Styles**

```typescript
// ❌ BEFORE
<div style={{
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  borderColor: '#e5e7eb',
}}>
  Content
</div>

// ✅ AFTER
<div style={{
  backgroundColor: 'hsl(var(--color-primary))',
  color: 'hsl(0 0% 100%)',
  borderColor: 'hsl(var(--color-border))',
}}>
  Content
</div>
```

### **Tailwind Classes**

```typescript
// ❌ BEFORE (if using arbitrary values)
<div className="bg-[#3b82f6] text-[#ffffff]">
  Content
</div>

// ✅ AFTER (use semantic classes)
<div className="bg-primary text-primary-foreground">
  Content
</div>

// Or with CSS variables
<div className="bg-[hsl(var(--color-primary))]">
  Content
</div>
```

### **CSS/SCSS**

```css
/* ❌ BEFORE */
.my-component {
  background-color: #3b82f6;
  color: #ffffff;
  border: 1px solid #e5e7eb;
}

/* ✅ AFTER */
.my-component {
  background-color: hsl(var(--color-primary));
  color: hsl(0 0% 100%);
  border: 1px solid hsl(var(--color-border));
}
```

### **Styled Components / Emotion**

```typescript
// ❌ BEFORE
const Button = styled.button`
  background-color: #3b82f6;
  color: #ffffff;
  border: 1px solid #2563eb;
`;

// ✅ AFTER
const Button = styled.button`
  background-color: hsl(var(--color-primary));
  color: hsl(var(--color-primary-foreground));
  border: 1px solid hsl(var(--color-primary));
`;
```

---

## 📊 Special Cases

### **Gradients**

```typescript
// ❌ BEFORE
background: 'linear-gradient(to right, #3b82f6, #8b5cf6)'

// ✅ AFTER
background: 'linear-gradient(to right, hsl(var(--color-primary)), hsl(var(--color-accent)))'
```

### **Box Shadows**

```typescript
// ❌ BEFORE
boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'

// ✅ AFTER
boxShadow: 'var(--shadow-md)'
// Or if you need custom opacity:
boxShadow: '0 4px 6px hsl(0 0% 0% / 0.1)'
```

### **Chart Libraries (Recharts, Chart.js)**

```typescript
// ❌ BEFORE
const chartConfig = {
  datasets: [{
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  }]
};

// ✅ AFTER
const chartConfig = {
  datasets: [{
    backgroundColor: 'hsl(var(--color-primary))',
    borderColor: 'hsl(var(--color-primary))',
  }]
};
```

### **SVG Fill/Stroke**

```typescript
// ❌ BEFORE
<svg>
  <path fill="#3b82f6" stroke="#2563eb" />
</svg>

// ✅ AFTER
<svg>
  <path fill="hsl(var(--color-primary))" stroke="hsl(var(--color-primary))" />
</svg>
```

---

## ✅ Validation Checklist

After migration, verify:

- [ ] Run `pnpm validate:tokens` - No errors
- [ ] Run `pnpm lint:tokens` - No warnings
- [ ] Visual regression test - Colors look correct in light theme
- [ ] Visual regression test - Colors look correct in dark theme
- [ ] Visual regression test - Colors look correct in high-contrast modes
- [ ] Test color transitions/animations
- [ ] Test hover/focus states
- [ ] Test disabled states
- [ ] Review git diff for unintended changes

---

## 🚨 Common Mistakes

### **Mistake 1: Forgetting `var()`**

```typescript
// ❌ WRONG
color: 'hsl(--color-primary)'

// ✅ CORRECT
color: 'hsl(var(--color-primary))'
```

### **Mistake 2: Wrong HSL Format**

```typescript
// ❌ WRONG
color: 'hsl(var(--color-primary), 50%)'

// ✅ CORRECT
color: 'hsl(var(--color-primary) / 0.5)'
```

### **Mistake 3: Using Wrong Token**

```typescript
// ❌ WRONG - Using primary for success
successColor: 'hsl(var(--color-primary))'

// ✅ CORRECT
successColor: 'hsl(var(--color-success))'
```

### **Mistake 4: Hardcoding Opacity**

```typescript
// ⚠️ ACCEPTABLE but not ideal
backgroundColor: 'rgba(59, 130, 246, 0.5)'

// ✅ BETTER
backgroundColor: 'hsl(var(--color-primary) / 0.5)'
```

---

## 📚 Token Reference

### **All Available Color Tokens**:

```typescript
// Semantic colors
--color-background
--color-foreground
--color-card
--color-card-foreground
--color-popover
--color-popover-foreground
--color-primary
--color-primary-foreground
--color-secondary
--color-secondary-foreground
--color-muted
--color-muted-foreground
--color-accent
--color-accent-foreground
--color-destructive
--color-destructive-foreground
--color-success
--color-success-foreground
--color-warning
--color-warning-foreground
--color-info
--color-info-foreground
--color-border
--color-input
--color-ring

// Brand context colors
--accent-opendeck   // Blue
--accent-atlvs      // Pink
--accent-ghostship  // Green
```

### **Complete Token Documentation**:
See `packages/ui/DESIGN_TOKENS.md` for full reference.

---

## 🆘 Getting Help

### **Automated Fix Not Working?**
```bash
# Try manual fix with this guide
# Or open an issue with:
- File path
- Current color value
- Expected token
```

### **Unsure Which Token to Use?**
```bash
# Check the design system documentation
open packages/ui/DESIGN_TOKENS.md

# Or run validation to see suggestions
pnpm validate:tokens
```

### **Need Custom Color?**
```bash
# Add to design tokens first
# Edit: packages/ui/src/tokens/unified-design-tokens.ts
# Then regenerate CSS
pnpm generate:tokens
```

---

**Last Updated**: 2025-09-29  
**Version**: 1.0.0  
**Maintainer**: GHXSTSHIP Design System Team
