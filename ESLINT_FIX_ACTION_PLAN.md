# ESLint Fix Action Plan
**ATLVS Production Build - Code Quality Improvement Plan**

---

## Overview

**Current State**: 668 ESLint issues (522 errors, 146 warnings)  
**Target State**: 0 errors, 0 warnings  
**Estimated Effort**: 8-10 hours total

---

## Phase 1: Critical Fixes (Priority 1) - 4 hours

### 1.1 Missing Lucide React Icon Imports (~200 errors) - 1.5 hours

**Affected Icons**:
```typescript
Upload, Download, Eye, EyeOff, Edit, Shield, Users,
Calendar as CalendarIcon, File, Pie, ChevronDown, ChevronRight,
Folder, Trash2, FileCode, Image, Video, Music, Save, X, Check,
AlertCircle, Info, Plus, Minus, Search, Filter, MoreVertical,
ArrowLeft, ArrowRight, ExternalLink, Copy, Settings, Bell,
Mail, Phone, MapPin
```

**Fix Strategy**:
```bash
# Automated approach - grep for usage and add imports
for icon in Upload Download Eye Edit Shield Users; do
  grep -l "<${icon}" apps/web/**/*.tsx | while read file; do
    # Check if import exists
    if ! grep -q "import.*${icon}.*from 'lucide-react'" "$file"; then
      # Add import
      sed -i "/import.*from 'lucide-react'/s/}/,${icon}}/" "$file"
    fi
  done
done
```

**Manual Review**: Settings, Files, Companies, Analytics modules

---

### 1.2 Missing ATLVS UI Component Imports (~150 errors) - 1.5 hours

**Affected Components**:
```typescript
// Data View System
StateManagerProvider, DataViewProvider, ViewSwitcher, DataActions,
DataGrid, KanbanBoard, CalendarView, ListView, TimelineView, GalleryView

// UI Components
Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
Separator, Switch, Label, Button, Input, Select, Textarea,
Badge, Alert, Dialog, Tabs, UniversalDrawer
```

**Critical Files**:
1. `apps/web/app/(app)/(shell)/settings/SettingsClient.tsx` ✅ **FIXED**
2. `apps/web/app/(app)/(shell)/settings/components/AccountSettings.tsx` ⚠️ **IN PROGRESS**
3. `apps/web/app/(app)/(shell)/analytics/**/**.tsx`
4. `apps/web/app/(app)/(shell)/companies/**/**.tsx`
5. `apps/web/app/(app)/(shell)/marketplace/**/**.tsx`

**Fix Template**:
```typescript
// Before
import { Drawer } from '@ghxstship/ui';

// After
import { 
  Drawer,
  StateManagerProvider,
  DataViewProvider,
  ViewSwitcher,
  DataActions,
  DataGrid,
  Card,
  Separator,
  // ... add all used components
} from '@ghxstship/ui';
```

---

### 1.3 Component API Mismatches (~50 errors) - 1 hour

**Issue**: Files expect compound component patterns that don't exist

#### Select Component Mismatch

**Current Usage (Incorrect)**:
```typescript
<Select onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**Actual API (Correct)**:
```typescript
<Select 
  value={value}
  onChange={setValue}
  options={[
    { value: '1', label: 'Option 1' }
  ]}
  placeholder="Select..."
/>
```

**Fix Strategy**: Replace all compound Select usage with simple API

#### Tabs Component Mismatch

**Current Usage (May be incorrect)**:
```typescript
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
</Tabs>
```

**Action**: Verify actual Tabs API in `@ghxstship/ui` and update usage

#### Alert Component Mismatch

**Current Usage (Incorrect)**:
```typescript
<Alert>
  <AlertDescription>Message</AlertDescription>
</Alert>
```

**Actual API (Need to verify)**:
```typescript
<Alert message="Message" type="info" />
```

**Affected Files**: Review all files using Select, Tabs, Alert components

---

## Phase 2: React Hook Dependencies (Priority 2) - 3 hours

### 2.1 useEffect Dependency Warnings (~120 warnings)

**Common Patterns**:

#### Pattern 1: Missing function dependency
```typescript
// ❌ Current
useEffect(() => {
  fetchData();
}, []); // Missing 'fetchData'

// ✅ Fixed
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Or wrap in useCallback
const fetchData = useCallback(async () => {
  // ...
}, [/* dependencies */]);
```

#### Pattern 2: Missing state dependency
```typescript
// ❌ Current
useEffect(() => {
  if (profile) {
    setFormData(profile);
  }
}, []); // Missing 'profile'

// ✅ Fixed
useEffect(() => {
  if (profile) {
    setFormData(profile);
  }
}, [profile]);
```

**Affected Modules**: Settings, People, Companies, Projects

**Auto-Fix Available**: `pnpm lint:fix` can handle many of these

---

### 2.2 useCallback Optimization (~26 warnings)

**Pattern**: Functions defined in component body used in hooks

```typescript
// ❌ Current
const handleExport = (data: any, format: string) => {
  console.log('Export:', format, data);
};

useEffect(() => {
  // Setup with handleExport
}, [handleExport]); // handleExport changes every render

// ✅ Fixed
const handleExport = useCallback((data: any, format: string) => {
  console.log('Export:', format, data);
}, []); // Stable reference
```

**Target Files**: All Client components with export/import handlers

---

## Phase 3: Performance & Accessibility (Priority 3) - 2 hours

### 3.1 Image Optimization (~30 warnings)

**Pattern**: Replace `<img>` with Next.js `<Image />`

```typescript
// ❌ Current
<img src={user.avatar} className="..." />

// ✅ Fixed
import Image from 'next/image';

<Image 
  src={user.avatar} 
  alt={user.name}
  width={40}
  height={40}
  className="..." 
/>
```

**Benefits**:
- Automatic optimization
- Lazy loading
- Better LCP scores
- Reduced bandwidth

**Affected Files**: Profile, Companies, People, Marketing components

---

### 3.2 Accessibility Fixes (~10 warnings)

#### Missing alt attributes
```typescript
// ❌ Current
<Image src={...} />

// ✅ Fixed
<Image src={...} alt="Company logo" />
```

#### Invalid ARIA attributes
```typescript
// ❌ Current
<div aria-invalid-attr="true">

// ✅ Fixed - Remove or fix
<div aria-label="Valid label">
```

---

## Automated Fix Scripts

### Script 1: Batch Import Fixer

```bash
#!/bin/bash
# Location: scripts/fix-missing-imports.sh

# Already created - see file in scripts/
bash scripts/fix-missing-imports.sh
```

### Script 2: ESLint Auto-Fix

```bash
# Auto-fix fixable issues
pnpm lint:fix

# This will handle:
# - Hook dependencies (some cases)
# - Code formatting
# - Simple rule violations
```

### Script 3: Component API Migration

```typescript
// Location: scripts/migrate-component-apis.ts
// TODO: Create script to migrate compound components to simple APIs

import * as fs from 'fs';
import * as glob from 'glob';

function migrateSelectComponents(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find and replace compound Select with simple API
  // Pattern matching and AST transformation required
  
  fs.writeFileSync(filePath, content);
}
```

---

## Execution Timeline

### Day 1 (4 hours)
- [x] **Hour 1**: Run import fixer script for lucide-react icons
- [ ] **Hour 2**: Add missing ATLVS UI component imports
- [ ] **Hour 3**: Fix component API mismatches (Select, Tabs, Alert)
- [ ] **Hour 4**: Validate and test changes

### Day 2 (4 hours)
- [ ] **Hour 1-2**: Fix useEffect dependency warnings
- [ ] **Hour 3**: Add useCallback optimizations
- [ ] **Hour 4**: Replace <img> with Next.js <Image />

### Day 3 (2 hours)
- [ ] **Hour 1**: Accessibility fixes (alt tags, ARIA)
- [ ] **Hour 2**: Final validation and cleanup

---

## Validation Checkpoints

After each phase:

```bash
# Check remaining errors
pnpm lint 2>&1 | grep "problems"

# Verify build still passes
pnpm build

# Check type safety
pnpm typecheck
```

**Target**: 
- After Phase 1: <100 errors
- After Phase 2: <20 errors
- After Phase 3: 0 errors

---

## Risk Mitigation

### Backup Strategy
```bash
# Create backup before bulk changes
git checkout -b fix/eslint-issues
git commit -am "Checkpoint before ESLint fixes"
```

### Incremental Testing
- Fix one module at a time
- Test after each module
- Commit working changes
- Rollback if issues arise

### Modules to Fix in Order
1. **Settings** (already started) ✅
2. **Analytics** (high visibility)
3. **Companies** (customer-facing)
4. **Marketplace** (critical path)
5. **Programming** (secondary)
6. **Files** (tertiary)
7. **Profile** (user-facing)
8. **Resources** (low priority)

---

## Success Criteria

- [x] Production build passes (already ✅)
- [x] TypeScript compilation passes (already ✅)
- [ ] **ESLint: 0 errors**
- [ ] **ESLint: 0 warnings**
- [ ] All tests pass
- [ ] No runtime console errors
- [ ] Performance benchmarks maintained

---

## Next Steps

**Immediate Actions**:

1. **Review this plan** with team
2. **Execute Phase 1** fixes (critical imports)
3. **Test thoroughly** after each phase
4. **Update validation report** with progress

**Recommended Approach**:

Start with **automated fixes** where possible, then move to **manual review** for complex cases. Prioritize **user-facing modules** first.

---

## Tools & Resources

**Useful Commands**:
```bash
# Count remaining errors by type
pnpm lint 2>&1 | grep "error" | cut -d: -f4 | sort | uniq -c

# Fix auto-fixable issues
pnpm lint:fix

# Check specific module
pnpm lint apps/web/app/(app)/(shell)/settings

# Dry run for component usage
grep -r "StateManagerProvider" apps/web --include="*.tsx"
```

**Documentation**:
- ESLint Rules: https://eslint.org/docs/rules/
- Next.js Image: https://nextjs.org/docs/api-reference/next/image  
- React Hooks: https://react.dev/reference/react/hooks

---

## Completion Checklist

- [ ] Phase 1: Critical imports fixed
- [ ] Phase 2: React hooks optimized
- [ ] Phase 3: Performance & a11y improved
- [ ] All 668 issues resolved
- [ ] Build still passing
- [ ] Types still valid
- [ ] Runtime testing complete
- [ ] Documentation updated
- [ ] Changes committed

**Target Completion**: End of Week 1
