# Architectural Decision Records (ADR) Index

## Overview
This document indexes all architectural decisions made for the GHXSTSHIP platform restructuring.

## Active ADRs

### ADR-001: Adopt Atomic Design System
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** UI components scattered across multiple directories without clear hierarchy  
**Decision:** Implement strict atomic design pattern (atoms → molecules → organisms → templates)  
**Consequences:** Better component reusability, clearer hierarchy, improved maintainability  
**File:** [ADR-001-atomic-design.md](./adrs/ADR-001-atomic-design.md)

### ADR-002: Domain-Driven Design with Bounded Contexts
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** 59 domain modules without clear boundaries or relationships  
**Decision:** Organize domain layer into bounded contexts following DDD principles  
**Consequences:** Clearer domain boundaries, better team ownership, reduced coupling  
**File:** [ADR-002-ddd-bounded-contexts.md](./adrs/ADR-002-ddd-bounded-contexts.md)

### ADR-003: CQRS Pattern for Application Layer
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Application services mix read and write operations  
**Decision:** Separate commands (writes) from queries (reads) using CQRS  
**Consequences:** Better scalability, clearer intent, optimized read/write paths  
**File:** [ADR-003-cqrs-pattern.md](./adrs/ADR-003-cqrs-pattern.md)

### ADR-004: Adapter Pattern for Infrastructure
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** External service dependencies tightly coupled to business logic  
**Decision:** Implement adapter pattern for all external integrations  
**Consequences:** Easy to swap implementations, better testability, reduced vendor lock-in  
**File:** [ADR-004-adapter-pattern.md](./adrs/ADR-004-adapter-pattern.md)

### ADR-005: Feature-Based App Organization
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** App components scattered without clear feature boundaries  
**Decision:** Organize app by features with co-located components, hooks, and utilities  
**Consequences:** Better feature isolation, easier to find related code, improved team velocity  
**File:** [ADR-005-feature-modules.md](./adrs/ADR-005-feature-modules.md)

### ADR-006: Dependency Injection Strategy
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Hard-coded dependencies make testing difficult  
**Decision:** Use constructor injection with dependency containers  
**Consequences:** Better testability, clearer dependencies, easier mocking  
**File:** [ADR-006-dependency-injection.md](./adrs/ADR-006-dependency-injection.md)

### ADR-007: Monorepo Package Structure
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Need clear package boundaries in monorepo  
**Decision:** Organize packages by architectural layer (ui, domain, application, infrastructure)  
**Consequences:** Clear layer separation, enforced boundaries, better build caching  
**File:** [ADR-007-monorepo-structure.md](./adrs/ADR-007-monorepo-structure.md)

### ADR-008: Export Strategy and Barrel Files
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Multiple overlapping export strategies causing confusion  
**Decision:** Single export point per package with clear barrel file hierarchy  
**Consequences:** Simplified imports, better tree-shaking, clearer API surface  
**File:** [ADR-008-export-strategy.md](./adrs/ADR-008-export-strategy.md)

### ADR-009: TypeScript Strict Mode Enforcement
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Type safety varies across packages  
**Decision:** Enable TypeScript strict mode across all packages  
**Consequences:** Better type safety, catch errors early, improved IDE support  
**File:** [ADR-009-typescript-strict.md](./adrs/ADR-009-typescript-strict.md)

### ADR-010: Testing Strategy by Layer
**Date:** 2025-09-30  
**Status:** Approved  
**Context:** Inconsistent testing approaches across layers  
**Decision:** Define specific testing strategies per architectural layer  
**Consequences:** Clearer testing expectations, better coverage, faster feedback  
**File:** [ADR-010-testing-strategy.md](./adrs/ADR-010-testing-strategy.md)

## Superseded ADRs

### ADR-000: Flat Component Structure (SUPERSEDED by ADR-001)
**Date:** 2024-01-01  
**Status:** Superseded  
**Reason:** Lacked scalability and clarity as component library grew

## ADR Template

New ADRs should follow this structure:

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Rejected | Deprecated | Superseded]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive Consequences
- [List positive outcomes]

### Negative Consequences
- [List negative outcomes or trade-offs]

## Alternatives Considered
- [Alternative 1] - Reason for rejection
- [Alternative 2] - Reason for rejection

## Implementation
- Timeline: [Estimated timeline]
- Owner: [Person/team responsible]
- Dependencies: [Other ADRs or systems]

## References
- [Link to related docs]
- [Link to discussions]
```

## Review Process

1. **Proposal:** Create ADR in `Proposed` status
2. **Discussion:** Team review and feedback (1 week)
3. **Decision:** Approve/Reject/Defer
4. **Implementation:** Update status to `Accepted`
5. **Review:** Revisit annually or when context changes

## Related Documentation

- [Architecture Overview](./ARCHITECTURAL_ANALYSIS_2025.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Restructure Phases](./RESTRUCTURE_PHASE_1_UI.md)
- [Design Principles](./DESIGN_PRINCIPLES.md)
- [Coding Standards](./CODING_STANDARDS.md)
