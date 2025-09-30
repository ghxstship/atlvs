# ADR-002: Domain-Driven Design with Bounded Contexts

## Status
**Accepted** - September 30, 2025

## Context

The domain package (`packages/domain`) currently has 59 modules without clear bounded contexts:
- No clear boundaries between domain modules
- Entities scattered across multiple directories
- Missing aggregate root definitions
- Unclear relationships between modules
- No ubiquitous language documentation
- Repository interfaces mixed with implementations

This creates:
- Confusion about module ownership
- Risk of circular dependencies
- Difficulty understanding business domains
- Challenges in team organization
- Unclear integration points

## Decision

We will reorganize the domain layer following **Domain-Driven Design (DDD)** principles with clear bounded contexts.

### Bounded Context Structure

```
packages/domain/src/
├── shared/                    # Shared Kernel
│   ├── kernel/               # DDD primitives
│   └── value-objects/        # Shared value objects
│
└── contexts/                 # Bounded Contexts
    ├── projects/             # Project Management
    ├── finance/              # Financial Management
    ├── people/               # HR Management
    ├── procurement/          # Purchasing
    ├── jobs/                 # Job Management
    ├── companies/            # Company Management
    ├── programming/          # Event Programming
    ├── analytics/            # Analytics & Reporting
    ├── assets/               # Asset Management
    └── marketplace/          # Marketplace
```

### Context Organization

Each bounded context contains:
```
contexts/[context-name]/
├── domain/
│   ├── entities/             # Domain entities
│   ├── value-objects/        # Value objects
│   ├── aggregates/           # Aggregate roots
│   └── services/             # Domain services
├── events/                   # Domain events
├── repositories/             # Repository interfaces
└── specifications/           # Business rules
```

### Key DDD Patterns

1. **Entities**: Objects with identity that persist over time
2. **Value Objects**: Immutable objects defined by attributes
3. **Aggregates**: Cluster of entities and value objects with clear boundaries
4. **Domain Events**: Something that happened in the domain
5. **Repositories**: Abstraction for data access
6. **Domain Services**: Business logic that doesn't fit in entities

### Context Map

Define relationships between contexts:
- **Customer-Supplier**: One context provides data to another
- **Shared Kernel**: Shared code between contexts
- **Conformist**: Downstream context conforms to upstream
- **Anti-Corruption Layer**: Translation layer between contexts

## Consequences

### Positive Consequences

1. **Clear Boundaries**
   - Each context has explicit boundaries
   - Reduced coupling between domains
   - Easier to reason about dependencies

2. **Team Organization**
   - Contexts can be owned by specific teams
   - Clear ownership and responsibility
   - Better parallel development

3. **Ubiquitous Language**
   - Each context has its own language
   - Reduced ambiguity in terminology
   - Better domain understanding

4. **Scalability**
   - Contexts can be extracted to microservices
   - Independent deployment potential
   - Better modularization

5. **Business Alignment**
   - Domain model reflects business reality
   - Easier communication with stakeholders
   - Better requirements capture

6. **Maintainability**
   - Changes isolated to contexts
   - Reduced risk of unintended side effects
   - Clearer change impact analysis

### Negative Consequences

1. **Increased Complexity**
   - More directories and structure
   - Need to understand DDD concepts
   - Learning curve for team

2. **Integration Overhead**
   - Need to define context integration
   - May require anti-corruption layers
   - More ceremony in cross-context operations

3. **Duplication Risk**
   - Similar concepts may exist in multiple contexts
   - Need guidelines for shared kernel
   - Balance between DRY and independence

4. **Migration Effort**
   - Large refactoring required
   - Need to categorize all entities
   - Risk of breaking existing code

## Alternatives Considered

### Alternative 1: Module-Based Organization
Keep current module structure but improve naming

**Rejected because:**
- Doesn't solve boundary issues
- No clear ownership model
- Doesn't leverage DDD benefits

### Alternative 2: Single Domain Package
One large domain package without subdivisions

**Rejected because:**
- Doesn't scale
- Poor separation of concerns
- Team conflicts increase

### Alternative 3: Microservice-First
Immediately split into separate services

**Rejected because:**
- Premature optimization
- Increased operational complexity
- Harder to iterate on boundaries

## Implementation

### Timeline
- **Weeks 1-2:** Create structure, shared kernel
- **Weeks 3-4:** Migrate contexts (Projects, Finance, People)
- **Weeks 5-6:** Migrate remaining contexts
- **Week 7:** Create context maps and documentation

### Owner
Domain Architecture Team

### Dependencies
- None (independent implementation)

### Bounded Contexts Defined

1. **Projects Context**: Project management, tasks, milestones
2. **Finance Context**: Budgets, expenses, invoices, transactions
3. **People Context**: Employees, roles, competencies, assignments
4. **Procurement Context**: Purchase orders, vendors, approvals
5. **Jobs Context**: Jobs, opportunities, bids, contracts
6. **Companies Context**: Company management, contacts, relationships
7. **Programming Context**: Events, programs, performances, schedules
8. **Analytics Context**: Reports, dashboards, metrics
9. **Assets Context**: Inventory, maintenance, tracking
10. **Marketplace Context**: Listings, vendors, catalog

### Integration Points

Document how contexts interact:
- Projects → Finance (budget allocation)
- Projects → People (resource assignment)
- Procurement → Finance (expense creation)
- Jobs → Companies (client relationships)
- Programming → Projects (event projects)

### Migration Strategy

1. Create bounded context structure
2. Define shared kernel (Entity, ValueObject, etc.)
3. Migrate one context at a time
4. Define repository interfaces
5. Document context relationships
6. Create ubiquitous language glossary

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://vaughnvernon.co/)
- [Bounded Context Pattern](https://martinfowler.com/bliki/BoundedContext.html)
- Internal: [RESTRUCTURE_PHASE_2_DOMAIN.md](../RESTRUCTURE_PHASE_2_DOMAIN.md)

## Validation Criteria

- [ ] All contexts clearly defined
- [ ] Context map documented
- [ ] Aggregates identified
- [ ] Repository interfaces defined
- [ ] No circular dependencies between contexts
- [ ] Ubiquitous language documented
- [ ] Integration points specified
- [ ] Tests updated and passing

## Approvals

- [x] Domain Architecture Lead
- [x] Technical Architect
- [x] Engineering Manager
- [x] Product Management

## Review Date
September 30, 2026 (1 year from acceptance)
