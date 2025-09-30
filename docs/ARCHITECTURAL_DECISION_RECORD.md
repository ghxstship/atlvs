# ARCHITECTURAL DECISION RECORD (ADR)
## GHXSTSHIP UI Package - Design System Architecture

**Last Updated:** 2025-09-30  
**Status:** Active  
**Supersedes:** N/A

---

## ADR-001: Unified Design System with System-Level Composition

### Context

The GHXSTSHIP UI package needed a scalable, maintainable approach to component organization that could support:
- Atomic design principles
- Enterprise-scale applications
- Multiple brands (ATLVS, OPENDECK, GHXSTSHIP)
- Rapid development velocity
- Minimal code duplication

### Decision

**We adopt a Unified Design System with System-Level Composition approach.**

#### Core Principles:

1. **Single Source of Truth**
   - Primary components defined in `UnifiedDesignSystem.tsx`
   - Atomic components in `components/atomic/`
   - All exports unified through `index-unified.ts`

2. **System-Level Composition**
   - Molecular patterns in `system/CompositePatterns.tsx`
   - Template patterns in `system/LayoutSystem.tsx`
   - NOT file-per-molecule/template

3. **Comprehensive Export Strategy**
   - Main `index.ts` exports from `index-unified.ts`
   - Single import path: `@ghxstship/ui`
   - Backward compatibility maintained

### Rationale

**Why System-Level Composition over File-Per-Component?**

1. **Reduced File Proliferation**
   - 568 lines in CompositePatterns.tsx vs. 20+ separate files
   - Easier to discover related patterns
   - Better code organization

2. **Better Pattern Reusability**
   - System-level patterns can be mixed and matched
   - Variants defined in single location
   - Composition patterns clearly visible

3. **Improved Maintainability**
   - Changes to patterns done in one place
   - Consistent API across related components
   - Easier to enforce design standards

4. **Performance Benefits**
   - Single import for multiple patterns
   - Better tree-shaking
   - Reduced bundle size

### Consequences

**Positive:**
- ✅ Reduced code duplication
- ✅ Clear component hierarchy
- ✅ Easy to discover existing patterns
- ✅ Scalable to hundreds of components
- ✅ Maintainable by small teams

**Negative:**
- ⚠️ May seem unconventional to developers expecting file-per-component
- ⚠️ Requires documentation to explain approach
- ⚠️ Large files like CompositePatterns.tsx need good organization

**Neutral:**
- 📝 Different from some popular design systems (e.g., Ant Design, Material-UI)
- 📝 Requires clear architectural documentation
- 📝 Needs governance to prevent anti-patterns

---

## ADR-002: Component Location Strategy

### Context

Components can be organized in multiple ways. We needed clear rules for where components live.

### Decision

**Component locations determined by complexity and purpose:**

#### Atoms → `components/atomic/`
- Base HTML elements with styling
- Examples: Button, Input, RadioButton, ColorPicker
- Exported from `index-unified.ts`

#### Molecules → `system/CompositePatterns.tsx` OR standalone files
- **System-level patterns:** CompositePatterns.tsx (preferred)
- **Standalone:** Only if too complex for pattern library
- Examples: SearchBox (standalone), ListItem (pattern)

#### Organisms → `components/`
- Complex components with multiple responsibilities
- Examples: Navigation, Table, DataViews, Modal

#### Templates → `system/LayoutSystem.tsx`
- Layout composition patterns
- Examples: Stack, Grid, Container

#### System → `system/`
- Enterprise-level architecture
- Performance, caching, validation, workflows

### Rationale

This strategy:
1. Makes components easy to find
2. Scales to hundreds of components
3. Keeps related code together
4. Reduces decision paralysis ("where does this go?")

---

## ADR-003: Export Strategy

### Context

Multiple export strategies possible. Needed consistency.

### Decision

**Unified Export Hierarchy:**

```typescript
index.ts
  └─> index-unified.ts
        ├─> components/atomic/*
        ├─> components/*
        ├─> system/*
        └─> providers/*
```

**Rules:**
1. All public APIs exported from `index-unified.ts`
2. Main `index.ts` re-exports from `index-unified.ts`
3. No direct file imports in consuming code
4. Use: `import { Button } from '@ghxstship/ui'`

### Rationale

- Single import path simplifies usage
- Easier to maintain backward compatibility
- Clear public API boundary
- Better for documentation

---

## ADR-004: Preventing Component Duplication

### Context

History showed potential for duplicate components (Button in 6 locations).

### Decision

**Multi-Layer Duplication Prevention:**

1. **Component Registry** (`COMPONENT_REGISTRY.json`)
   - Single source of truth for all components
   - Lists canonical implementations
   - Documents deprecated components
   - Updated with every component addition

2. **Automated Detection** (`scripts/check-duplicates.sh`)
   - Runs on pre-commit
   - Scans for duplicate file names
   - Alerts developers to potential issues

3. **Governance Process**
   - New component checklist required
   - Review of existing implementations mandatory
   - Registry update required for approval

4. **Documentation**
   - Clear architectural decision records
   - Component catalog with search
   - Onboarding materials

### Rationale

Prevention through:
- Automation (can't forget)
- Documentation (easy to discover)
- Process (enforced through reviews)
- Education (developers understand why)

---

## ADR-005: Handling Legacy Components

### Context

Legacy components exist in `atoms/` directory. Need migration strategy.

### Decision

**Gradual Deprecation:**

1. **Phase 1: Documentation** (Complete)
   - Mark as deprecated in COMPONENT_REGISTRY.json
   - Add deprecation comments in code
   - Document canonical replacements

2. **Phase 2: Migration Period** (6 months)
   - Both old and new imports work
   - Migration warnings in console (dev mode)
   - Automated migration tools available

3. **Phase 3: Removal** (After 2025-12-31)
   - Legacy components removed
   - Breaking change in major version
   - Migration guide provided

### Rationale

- Gives teams time to migrate
- Prevents breaking existing code
- Clear timeline and expectations
- Automated tooling reduces manual work

---

## ADR-006: Brand Variants and Theming

### Context

GHXSTSHIP supports three brands: ATLVS, OPENDECK, GHXSTSHIP.

### Decision

**Theme-Based Brand Variants:**

1. Components are brand-agnostic
2. Brands differentiated through theme system
3. Design tokens provide brand-specific values
4. No component duplication per brand

**Implementation:**
```typescript
<UnifiedThemeProvider brand="ATLVS">
  <Button>ATLVS Button</Button>
</UnifiedThemeProvider>

<UnifiedThemeProvider brand="OPENDECK">
  <Button>OPENDECK Button</Button>
</UnifiedThemeProvider>
```

### Rationale

- Single component codebase
- Brand changes at runtime
- Easier maintenance
- Consistent behavior across brands

---

## ADR-007: Testing Strategy

### Context

Need comprehensive testing without duplication.

### Decision

**Multi-Level Testing:**

1. **Unit Tests** - Individual components
2. **Integration Tests** - Component combinations
3. **Visual Regression** - Screenshot comparisons
4. **Accessibility Tests** - WCAG compliance
5. **Performance Tests** - Bundle size, render time

**Test Location:**
- `__tests__/` next to component
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/`

### Rationale

- Comprehensive coverage
- Fast feedback loops
- Prevents regressions
- Documents expected behavior

---

## ADR-008: Documentation Requirements

### Context

Complex architecture needs clear documentation.

### Decision

**Required Documentation:**

1. **Component Registry** - Always up-to-date
2. **ADRs** - All major decisions documented
3. **Component Catalog** - Searchable component list
4. **Usage Examples** - For every public component
5. **Migration Guides** - For breaking changes
6. **Onboarding Guide** - For new developers

### Rationale

- Reduces confusion
- Speeds up onboarding
- Prevents duplicate creation
- Serves as reference

---

## ADR-009: Performance Standards

### Context

Enterprise applications demand performance.

### Decision

**Performance Requirements:**

1. **Bundle Size**
   - Total: < 500KB (gzipped)
   - Per component: < 20KB (gzipped)

2. **Runtime Performance**
   - Initial render: < 100ms
   - Re-render: < 16ms (60fps)

3. **Accessibility**
   - WCAG 2.2 AA minimum
   - Keyboard navigation required
   - Screen reader compatible

4. **Browser Support**
   - Modern browsers (last 2 versions)
   - Progressive enhancement for older browsers

### Rationale

- Ensures good user experience
- Maintains competitiveness
- Meets enterprise requirements
- Future-proofs codebase

---

## ADR-010: Component Governance

### Context

Preventing chaos requires governance.

### Decision

**Governance Process:**

1. **New Component Checklist**
   - Search COMPONENT_REGISTRY.json
   - Check for existing patterns
   - Review system/ directory
   - Verify no duplicates exist

2. **Review Requirements**
   - Architecture review required
   - Code review by 2+ developers
   - Accessibility audit passed
   - Performance benchmarks met

3. **Maintenance Schedule**
   - Quarterly: Component audit
   - Monthly: Registry updates
   - Weekly: Duplicate scans
   - Daily: Automated tests

4. **Ownership**
   - Design system team owns architecture
   - Component owners for maintenance
   - Shared responsibility for quality

### Rationale

- Prevents architectural drift
- Maintains quality standards
- Ensures consistency
- Distributes responsibility

---

## Implementation Guidelines

### Adding a New Component

```bash
# 1. Check for duplicates
./scripts/check-duplicates.sh ComponentName

# 2. Review registry
cat packages/ui/src/COMPONENT_REGISTRY.json | grep ComponentName

# 3. Check system patterns
grep -r "ComponentName" packages/ui/src/system/

# 4. Create component
# Location based on ADR-002

# 5. Export from index-unified.ts
# Add to appropriate section

# 6. Update registry
# Edit COMPONENT_REGISTRY.json

# 7. Add tests
# Create __tests__/ directory

# 8. Document
# Add to component catalog
```

### Modifying Existing Component

```bash
# 1. Check if canonical
# Review COMPONENT_REGISTRY.json

# 2. Understand impact
# Check usage across codebase

# 3. Make changes
# Follow existing patterns

# 4. Update tests
# Ensure coverage maintained

# 5. Update documentation
# Reflect changes in docs
```

---

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2025-09-30 | ADR-001: System-Level Composition | ✅ Active |
| 2025-09-30 | ADR-002: Component Location Strategy | ✅ Active |
| 2025-09-30 | ADR-003: Export Strategy | ✅ Active |
| 2025-09-30 | ADR-004: Duplication Prevention | ✅ Active |
| 2025-09-30 | ADR-005: Legacy Migration | ✅ Active |
| 2025-09-30 | ADR-006: Brand Variants | ✅ Active |
| 2025-09-30 | ADR-007: Testing Strategy | ✅ Active |
| 2025-09-30 | ADR-008: Documentation Requirements | ✅ Active |
| 2025-09-30 | ADR-009: Performance Standards | ✅ Active |
| 2025-09-30 | ADR-010: Component Governance | ✅ Active |

---

## Superseded Decisions

None. This is the initial ADR for the unified design system.

---

## References

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [GHXSTSHIP Design System](./PIXEL_PERFECT_DESIGN_SYSTEM.md)
- [Component Registry](../packages/ui/src/COMPONENT_REGISTRY.json)
- [UI Redundancy Audit](./UI_REDUNDANCY_AUDIT.md)

---

**Maintained by:** Design System Team  
**Review Schedule:** Quarterly  
**Last Review:** 2025-09-30
