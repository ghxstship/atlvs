# Atomic Design System Migration Guide
## GHXSTSHIP UI Package - Component Import Updates

**Migration Period:** 2 weeks from $(date +%Y-%m-%d)  
**Status:** Phase 1 - Emergency Stabilization

---

## Overview

This guide helps you migrate from duplicate component implementations to the canonical atomic design structure.

## Import Changes

### Before (Deprecated)
```typescript
// ❌ OLD - Multiple import paths
import { Button } from '@ghxstship/ui/atoms/Button';
import { Button } from '@ghxstship/ui/unified/Button';
import { Input } from '@ghxstship/ui/atoms/Input';
```

### After (Canonical)
```typescript
// ✅ NEW - Single source of truth
import { Button, Input, Checkbox } from '@ghxstship/ui';
// or
import { Button } from '@ghxstship/ui/atoms';
```

## Component Migration Map

### Atoms

| Old Import | New Import | Status |
|------------|------------|--------|
| `@ghxstship/ui/atoms/Button` | `@ghxstship/ui` | ✅ Available |
| `@ghxstship/ui/unified/Button` | `@ghxstship/ui` | ✅ Available |
| `@ghxstship/ui/components/atomic/Button` | `@ghxstship/ui` | ✅ Available |
| `@ghxstship/ui/atoms/Input` | `@ghxstship/ui` | ✅ Available |
| `@ghxstship/ui/unified/Input` | `@ghxstship/ui` | ✅ Available |
| `@ghxstship/ui/atoms/Checkbox` | `@ghxstship/ui` | ✅ Available |

### New Components

| Component | Import | Description |
|-----------|--------|-------------|
| `RadioButton` | `@ghxstship/ui` | New atomic radio input |
| `RadioGroup` | `@ghxstship/ui` | Radio button group |
| `RangeSlider` | `@ghxstship/ui` | Range input slider |

## Migration Steps

### 1. Update Imports (Automated)

Run the migration script:
```bash
npm run migrate:atomic-imports
```

### 2. Manual Review

Check for any custom modifications to deprecated components:
```bash
git grep -l "from '@ghxstship/ui/atoms/"
git grep -l "from '@ghxstship/ui/unified/"
```

### 3. Test

Run full test suite:
```bash
npm run test
npm run test:e2e
```

### 4. Update Documentation

Update any component documentation or Storybook stories.

## Breaking Changes

### Button Component

**No breaking changes** - All variants and props remain the same.

### Input Component

**No breaking changes** - All variants and props remain the same.

### Checkbox Component

**No breaking changes** - All variants and props remain the same.

## New Features

### RadioButton

```typescript
import { RadioButton, RadioGroup } from '@ghxstship/ui';

<RadioGroup label="Select option" orientation="vertical">
  <RadioButton name="option" value="1" label="Option 1" />
  <RadioButton name="option" value="2" label="Option 2" />
  <RadioButton name="option" value="3" label="Option 3" />
</RadioGroup>
```

### RangeSlider

```typescript
import { RangeSlider } from '@ghxstship/ui';

<RangeSlider
  label="Volume"
  min={0}
  max={100}
  step={1}
  showValue
  valueFormatter={(val) => `${val}%`}
/>
```

## Timeline

- **Week 1:** Update imports, test changes
- **Week 2:** Remove deprecated components
- **Week 3+:** Continue with Phase 2 (Molecular layer)

## Support

For questions or issues:
1. Check this migration guide
2. Review canonical component documentation
3. Contact the design system team

---

**Last Updated:** $(date +%Y-%m-%d)
