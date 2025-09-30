# Phase 1: UI Package Atomic Design Restructure

## Overview
Transform `packages/ui` from flat structure to strict atomic design hierarchy with clear component levels and design system organization.

## Current State Problems

**Flat Structure:** 140 components in one directory
**Inconsistent Organization:** Some components in `atomic/`, most scattered
**Mixed Concerns:** Infrastructure, features, and UI mixed together
**Unclear Hierarchy:** No way to understand component relationships

## Target Structure

```
packages/ui/
├── src/
│   ├── design-system/
│   │   ├── tokens/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   ├── shadows.ts
│   │   │   ├── motion.ts
│   │   │   └── index.ts
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── theme-config.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── primitives/                    # Headless components
│   │   ├── Polymorphic.tsx
│   │   ├── Slottable.tsx
│   │   └── index.ts
│   │
│   ├── atoms/                         # Level 1: Single-purpose
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   ├── Switch/
│   │   ├── Badge/
│   │   ├── Avatar/
│   │   ├── Icon/
│   │   ├── Spinner/
│   │   ├── Skeleton/
│   │   ├── Separator/
│   │   ├── Label/
│   │   ├── Heading/
│   │   ├── Text/
│   │   ├── Link/
│   │   ├── Image/
│   │   └── index.ts
│   │
│   ├── molecules/                     # Level 2: Simple combinations
│   │   ├── FormField/                # Label + Input + Error
│   │   ├── SearchBox/                # Input + Icon + Button
│   │   ├── Dropdown/                 # Button + Menu
│   │   ├── DropdownMenu/             # Trigger + Content + Items
│   │   ├── Select/                   # Trigger + Options
│   │   ├── DatePicker/               # Input + Calendar
│   │   ├── TagInput/                 # Input + Tags
│   │   ├── FileUpload/               # Input + Progress + Preview
│   │   ├── Pagination/               # Buttons + Text
│   │   ├── Breadcrumbs/              # Links + Separators
│   │   ├── Tabs/                     # Tab buttons + Panels
│   │   ├── Accordion/                # Button + Content
│   │   ├── Toast/                    # Icon + Message + Action
│   │   ├── Alert/                    # Icon + Title + Description
│   │   ├── Progress/                 # Bar + Label
│   │   └── index.ts
│   │
│   ├── organisms/                     # Level 3: Complex components
│   │   ├── Card/                     # Header + Body + Footer
│   │   ├── Modal/                    # Overlay + Card + Actions
│   │   ├── Dialog/                   # Modal variant
│   │   ├── Sheet/                    # Side panel
│   │   ├── Drawer/                   # Overlay + Slide panel
│   │   ├── AppDrawer/                # App-specific drawer
│   │   ├── DataTable/                # Table + Pagination + Filters
│   │   ├── Table/                    # Structured table
│   │   ├── Form/                     # Multiple FormFields
│   │   ├── Navigation/               # Nav items + Dropdowns
│   │   ├── Sidebar/                  # Nav + User + Sections
│   │   ├── Header/                   # Logo + Nav + Actions
│   │   ├── Footer/                   # Sections + Links
│   │   ├── EmptyState/               # Icon + Text + Action
│   │   ├── ErrorBoundary/            # Error UI
│   │   ├── CodeBlock/                # Syntax highlighted code
│   │   ├── ColorPicker/              # Color selection
│   │   ├── RangeSlider/              # Range input
│   │   └── index.ts
│   │
│   ├── templates/                     # Level 4: Page layouts
│   │   ├── AppShell/                 # Sidebar + Header + Main
│   │   ├── AuthLayout/               # Centered card
│   │   ├── DashboardLayout/          # Grid layout
│   │   ├── DetailLayout/             # Header + Tabs + Content
│   │   ├── ListLayout/               # Filters + Table + Actions
│   │   ├── SplitLayout/              # Two-column
│   │   └── index.ts
│   │
│   ├── patterns/                      # Reusable patterns
│   │   ├── data-views/               # Grid, List, Kanban, etc.
│   │   │   ├── DataViewProvider.tsx
│   │   │   ├── GridView.tsx
│   │   │   ├── ListView.tsx
│   │   │   ├── KanbanView.tsx
│   │   │   └── index.ts
│   │   ├── charts/                   # Chart components
│   │   ├── feedback/                 # User feedback patterns
│   │   └── index.ts
│   │
│   ├── hooks/                         # UI hooks
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   ├── useDrawer.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useTheme.ts
│   │   └── index.ts
│   │
│   ├── utils/                         # UI utilities
│   │   ├── cn.ts
│   │   ├── styles.ts
│   │   └── index.ts
│   │
│   ├── types/                         # Shared types
│   │   ├── components.ts
│   │   ├── theme.ts
│   │   └── index.ts
│   │
│   └── index.ts                       # Main export
│
└── package.json
```

## Component Classification

### Atoms (Single-Purpose, No Dependencies)
- Button, Input, Checkbox, Radio, Switch
- Badge, Avatar, Icon, Spinner, Skeleton
- Separator, Label, Heading, Text, Link, Image

### Molecules (Simple Combinations)
- FormField, SearchBox, Dropdown, Select
- DatePicker, TagInput, FileUpload
- Pagination, Breadcrumbs, Tabs, Accordion
- Toast, Alert, Progress

### Organisms (Complex Components)
- Card, Modal, Dialog, Sheet, Drawer
- DataTable, Table, Form, Navigation
- Sidebar, Header, Footer
- EmptyState, ErrorBoundary, CodeBlock

### Templates (Page Layouts)
- AppShell, AuthLayout, DashboardLayout
- DetailLayout, ListLayout, SplitLayout

## Migration Steps

### Step 1: Create New Structure (No Breaking Changes)
```bash
cd packages/ui/src
mkdir -p design-system/{tokens,theme}
mkdir -p primitives atoms molecules organisms templates patterns hooks utils types
```

### Step 2: Move Design Tokens
```bash
# Move existing token files
mv tokens/* design-system/tokens/
mv theme/* design-system/theme/
```

### Step 3: Categorize and Move Components

**Atoms:**
```bash
mv components/atomic/Button.tsx atoms/Button/Button.tsx
mv components/Badge.tsx atoms/Badge/Badge.tsx
mv components/Avatar.tsx atoms/Avatar/Avatar.tsx
# ... continue for all atoms
```

**Molecules:**
```bash
mv components/Breadcrumbs.tsx molecules/Breadcrumbs/Breadcrumbs.tsx
mv components/SearchBox.tsx molecules/SearchBox/SearchBox.tsx
# ... continue for all molecules
```

**Organisms:**
```bash
mv components/Card.tsx organisms/Card/Card.tsx
mv components/Modal.tsx organisms/Modal/Modal.tsx
mv components/Drawer.tsx organisms/Drawer/Drawer.tsx
# ... continue for all organisms
```

### Step 4: Update Exports

Create barrel exports for each level:

```typescript
// atoms/index.ts
export * from './Button';
export * from './Input';
export * from './Checkbox';
// ... all atoms

// molecules/index.ts
export * from './FormField';
export * from './SearchBox';
// ... all molecules

// organisms/index.ts
export * from './Card';
export * from './Modal';
// ... all organisms

// Main index.ts
export * from './design-system';
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';
export * from './patterns';
export * from './hooks';
export * from './utils';
export * from './types';
```

### Step 5: Update Component Structure

Each component follows this pattern:

```
ComponentName/
├── ComponentName.tsx         # Main component
├── ComponentName.test.tsx    # Unit tests
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.types.ts    # TypeScript types
├── index.ts                  # Exports
└── README.md                 # Documentation (optional)
```

### Step 6: Handle Special Directories

**3D Components:** Move to `patterns/3d/`
**AI Components:** Move to `patterns/ai/`
**RTL Components:** Move to `patterns/rtl/`
**Voice Components:** Move to `patterns/voice/`
**Accessibility:** Move to `patterns/accessibility/`
**Monitoring:** Move to `packages/analytics` or app layer

### Step 7: Update Imports Across Codebase

Create automated script:

```typescript
// scripts/update-ui-imports.ts
import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const importMap = {
  '@ghxstship/ui/Button': '@ghxstship/ui/atoms',
  '@ghxstship/ui/Card': '@ghxstship/ui/organisms',
  // ... full mapping
};

// Update all imports
sourceFiles.forEach(file => {
  file.getImportDeclarations().forEach(importDecl => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (importMap[moduleSpecifier]) {
      importDecl.setModuleSpecifier(importMap[moduleSpecifier]);
    }
  });
  file.saveSync();
});
```

## Validation

### Automated Checks
```bash
# Verify structure
npm run verify:structure

# Verify exports
npm run verify:exports

# Run tests
npm run test

# Build package
npm run build

# Verify Storybook
npm run storybook
```

### Manual Checks
- [ ] All components have proper atomic classification
- [ ] No circular dependencies
- [ ] All tests passing
- [ ] Storybook builds successfully
- [ ] Documentation updated
- [ ] No components in wrong levels
- [ ] Exports properly organized

## Rollback Plan

If issues arise:
```bash
# Revert to previous structure
git checkout main -- packages/ui/src
npm install
npm run build
```

## Success Criteria

- ✅ All components categorized by atomic level
- ✅ Clear directory hierarchy
- ✅ No build errors
- ✅ All tests passing
- ✅ Storybook functional
- ✅ Documentation updated
- ✅ Import paths simplified
- ✅ Bundle size optimized

## Timeline

- **Day 1-2:** Create structure, move design tokens
- **Day 3-5:** Categorize and move atoms/molecules
- **Day 6-8:** Move organisms/templates
- **Day 9-10:** Update exports and imports
- **Day 11-12:** Testing and validation
- **Day 13-14:** Documentation and rollout

## Next Phase

After UI restructure completion, proceed to Phase 2: Domain Layer Restructure
