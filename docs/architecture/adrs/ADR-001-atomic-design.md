# ADR-001: Adopt Atomic Design System

## Status
**Accepted** - September 30, 2025

## Context

The UI package (`packages/ui`) currently has 140+ components in a flat directory structure, making it difficult to:
- Locate specific components
- Understand component hierarchy and relationships
- Determine component reusability
- Maintain consistent component composition
- Onboard new developers effectively

Components are mixed together without clear categorization:
- Atomic components (Button, Input) alongside complex organisms (Table, Navigation)
- No clear visual hierarchy in file system
- Duplicate components in different locations (`Button.tsx` and `atomic/Button.tsx`)
- Special-purpose directories (3d/, ai/, voice/) mixed with UI components

## Decision

We will adopt the **Atomic Design** methodology to organize all UI components into a clear hierarchy:

### Component Levels

1. **Atoms** - Basic building blocks (Button, Input, Label, Icon)
2. **Molecules** - Simple component combinations (FormField, SearchBox, Pagination)
3. **Organisms** - Complex UI components (Card, Modal, DataTable, Navigation)
4. **Templates** - Page-level layouts (AppShell, DashboardLayout, ListLayout)
5. **Pages** - Specific page implementations (live in `apps/web/app`)

### Directory Structure

```
packages/ui/src/
├── design-system/       # Tokens, theme
├── primitives/          # Headless components
├── atoms/              # Level 1
├── molecules/          # Level 2
├── organisms/          # Level 3
├── templates/          # Level 4
├── patterns/           # Reusable patterns (data-views, charts)
├── hooks/              # UI hooks
├── utils/              # UI utilities
└── types/              # Shared types
```

### Component Organization

Each component follows this structure:
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
├── ComponentName.stories.tsx
├── ComponentName.types.ts
└── index.ts
```

### Classification Rules

**Atoms:** Single-purpose, no composition
- Button, Input, Checkbox, Badge, Icon, Label

**Molecules:** 2-3 atoms combined
- FormField (Label + Input + Error)
- SearchBox (Input + Icon + Button)
- Dropdown (Button + Menu)

**Organisms:** Complex compositions
- Card (Header + Body + Footer with multiple molecules)
- DataTable (Table + Pagination + Filters)
- Navigation (Multiple dropdowns and links)

**Templates:** Page layouts
- AppShell (Sidebar + Header + Main)
- DashboardLayout (Grid layout for widgets)

## Consequences

### Positive Consequences

1. **Improved Developer Experience**
   - Easy to locate components by complexity level
   - Clear understanding of component relationships
   - Better onboarding for new developers

2. **Better Reusability**
   - Atoms can be used anywhere without dependencies
   - Molecules show clear composition patterns
   - Organisms demonstrate complex use cases

3. **Clearer Documentation**
   - Storybook organized by atomic levels
   - Component catalog automatically structured
   - Design system documentation more intuitive

4. **Optimized Bundle Sizes**
   - Tree-shaking works better with clear component hierarchy
   - Easier to identify unused components
   - Better code splitting opportunities

5. **Easier Testing**
   - Test atoms in isolation
   - Test molecules with mocked atoms
   - Test organisms with focused integration tests

6. **Design-Development Alignment**
   - Designers think in similar patterns
   - Shared vocabulary between teams
   - Easier to maintain design system parity

### Negative Consequences

1. **Migration Effort**
   - Requires moving 140+ components
   - Need to update all imports across codebase
   - Risk of breaking changes during migration

2. **Initial Complexity**
   - Team needs to learn atomic design principles
   - Decisions needed on component classification
   - May slow down development initially

3. **Gray Areas**
   - Some components don't fit clearly into one category
   - Need guidelines for edge cases
   - Ongoing discussion about classifications

4. **Maintenance Overhead**
   - More directories to navigate
   - More index files to maintain
   - Stricter organization discipline required

## Alternatives Considered

### Alternative 1: Feature-Based Organization
Organize components by feature (forms/, navigation/, feedback/, etc.)

**Rejected because:**
- Doesn't indicate component complexity
- Features can overlap (form components with navigation)
- Less clear hierarchy for reusability

### Alternative 2: Component Type Organization
Organize by type (inputs/, buttons/, containers/, etc.)

**Rejected because:**
- Still flat structure
- No indication of composition level
- Doesn't solve complexity visualization

### Alternative 3: Keep Flat Structure
Maintain current flat directory with better naming conventions

**Rejected because:**
- Doesn't scale beyond 100+ components
- No visual hierarchy
- Difficult to understand relationships

## Implementation

### Timeline
- **Week 1:** Create new structure, move design tokens
- **Week 2:** Categorize and move components
- **Week 3:** Update exports and documentation
- **Week 4:** Test and validate

### Owner
Frontend Architecture Team

### Dependencies
- None (can be implemented independently)

### Migration Steps
1. Create atomic design directory structure
2. Categorize all existing components
3. Move components to appropriate levels
4. Update barrel exports
5. Run automated import updater across codebase
6. Update Storybook organization
7. Update documentation

### Validation Criteria
- [ ] All components categorized correctly
- [ ] No components in wrong levels
- [ ] All imports working
- [ ] Tests passing
- [ ] Storybook functional
- [ ] Documentation updated
- [ ] Bundle size improved or maintained

## References

- [Atomic Design Methodology by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Component-Driven Development](https://www.componentdriven.org/)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)
- Internal: [RESTRUCTURE_PHASE_1_UI.md](../RESTRUCTURE_PHASE_1_UI.md)

## Approvals

- [x] Frontend Lead
- [x] Architecture Team
- [x] Engineering Manager
- [x] Design System Lead

## Review Date
September 30, 2026 (1 year from acceptance)
