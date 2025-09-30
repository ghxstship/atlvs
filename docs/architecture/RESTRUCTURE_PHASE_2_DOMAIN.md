# Phase 2: Domain Layer Restructure

## Overview
Transform `packages/domain` to follow Domain-Driven Design (DDD) principles with clear bounded contexts, aggregates, and domain services.

## Current State Problems

- 59 modules without clear bounded contexts
- Inconsistent entity export patterns
- Missing repository implementations
- No aggregation root definitions
- Domain events infrastructure incomplete

## Target Structure

```
packages/domain/
├── src/
│   ├── shared/                        # Shared Kernel
│   │   ├── kernel/
│   │   │   ├── Entity.ts
│   │   │   ├── ValueObject.ts
│   │   │   ├── AggregateRoot.ts
│   │   │   ├── DomainEvent.ts
│   │   │   ├── Result.ts
│   │   │   ├── Identifier.ts
│   │   │   └── index.ts
│   │   ├── value-objects/
│   │   │   ├── Email.ts
│   │   │   ├── Money.ts
│   │   │   ├── PhoneNumber.ts
│   │   │   ├── Address.ts
│   │   │   ├── Timestamp.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── contexts/                      # Bounded Contexts
│   │   │
│   │   ├── projects/                  # Project Management Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Project.ts
│   │   │   │   │   ├── Task.ts
│   │   │   │   │   ├── Milestone.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── ProjectStatus.ts
│   │   │   │   │   ├── Budget.ts
│   │   │   │   │   ├── Timeline.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── aggregates/
│   │   │   │   │   └── ProjectAggregate.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── ProjectDomainService.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── events/
│   │   │   │   ├── ProjectCreated.ts
│   │   │   │   ├── ProjectUpdated.ts
│   │   │   │   ├── TaskCompleted.ts
│   │   │   │   └── index.ts
│   │   │   ├── repositories/
│   │   │   │   ├── IProjectRepository.ts
│   │   │   │   ├── ITaskRepository.ts
│   │   │   │   └── index.ts
│   │   │   ├── specifications/
│   │   │   │   ├── ProjectSpecification.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── finance/                   # Finance Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Budget.ts
│   │   │   │   │   ├── Expense.ts
│   │   │   │   │   ├── Invoice.ts
│   │   │   │   │   ├── Transaction.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── Amount.ts
│   │   │   │   │   ├── Currency.ts
│   │   │   │   │   ├── AccountNumber.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── aggregates/
│   │   │   │       └── FinancialAggregate.ts
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── people/                    # HR Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Person.ts
│   │   │   │   │   ├── Role.ts
│   │   │   │   │   ├── Competency.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── EmployeeId.ts
│   │   │   │   │   ├── Skill.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── aggregates/
│   │   │   │       └── PersonAggregate.ts
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── procurement/               # Procurement Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── PurchaseOrder.ts
│   │   │   │   │   ├── Vendor.ts
│   │   │   │   │   ├── Requisition.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── aggregates/
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── jobs/                      # Jobs Context
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Job.ts
│   │   │   │   │   ├── Opportunity.ts
│   │   │   │   │   ├── Bid.ts
│   │   │   │   │   ├── Contract.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── aggregates/
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── companies/                 # Company Management
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Company.ts
│   │   │   │   │   ├── Contact.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── aggregates/
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── programming/               # Event Programming
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Event.ts
│   │   │   │   │   ├── Program.ts
│   │   │   │   │   ├── Performance.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── value-objects/
│   │   │   │   └── aggregates/
│   │   │   ├── events/
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   │
│   │   ├── analytics/                 # Analytics Context
│   │   ├── assets/                    # Asset Management
│   │   ├── marketplace/               # Marketplace
│   │   └── pipeline/                  # Pipeline Management
│   │
│   ├── security/                      # Security domain
│   │   ├── RBAC.ts
│   │   ├── Permission.ts
│   │   └── index.ts
│   │
│   └── index.ts                       # Root exports
│
├── tests/
│   ├── unit/                          # Unit tests per context
│   └── integration/                   # Integration tests
│
├── docs/
│   ├── bounded-contexts.md
│   ├── ubiquitous-language.md
│   └── context-maps.md
│
├── package.json
├── tsconfig.json
└── README.md
```

## Bounded Context Definitions

### 1. Projects Context
**Responsibility:** Project management, tasks, milestones, timelines
**Aggregate Roots:** Project
**Key Entities:** Task, Milestone
**Value Objects:** ProjectStatus, Budget, Timeline
**Domain Events:** ProjectCreated, TaskCompleted, MilestoneReached

### 2. Finance Context
**Responsibility:** Financial management, budgets, expenses, invoices
**Aggregate Roots:** Budget, Invoice
**Key Entities:** Expense, Transaction, Account
**Value Objects:** Money, Currency, AccountNumber
**Domain Events:** BudgetAllocated, ExpenseApproved, InvoicePaid

### 3. People Context
**Responsibility:** HR management, employees, roles, competencies
**Aggregate Roots:** Person
**Key Entities:** Role, Competency, Assignment
**Value Objects:** EmployeeId, Skill, Certification
**Domain Events:** PersonHired, RoleAssigned, CompetencyAcquired

### 4. Procurement Context
**Responsibility:** Purchasing, vendors, orders, approvals
**Aggregate Roots:** PurchaseOrder
**Key Entities:** Vendor, Requisition, Approval
**Value Objects:** OrderStatus, DeliveryAddress
**Domain Events:** OrderPlaced, OrderApproved, OrderDelivered

### 5. Jobs Context
**Responsibility:** Job management, opportunities, bids, contracts
**Aggregate Roots:** Job, Opportunity
**Key Entities:** Bid, Contract, Assignment
**Value Objects:** JobStatus, ContractTerms
**Domain Events:** JobCreated, BidSubmitted, ContractSigned

## Migration Steps

### Step 1: Create Bounded Context Structure
```bash
cd packages/domain/src
mkdir -p shared/{kernel,value-objects}
mkdir -p contexts/{projects,finance,people,procurement,jobs,companies,programming,analytics,assets,marketplace,pipeline}/{domain/{entities,value-objects,aggregates,services},events,repositories,specifications}
```

### Step 2: Move Shared Kernel
```typescript
// Create base classes
// shared/kernel/Entity.ts
export abstract class Entity<T> {
  protected readonly _id: Identifier;
  
  constructor(id: Identifier) {
    this._id = id;
  }
  
  get id(): Identifier {
    return this._id;
  }
  
  equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) return false;
    if (this === entity) return true;
    return this._id.equals(entity._id);
  }
}

// shared/kernel/AggregateRoot.ts
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];
  
  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }
  
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  
  clearEvents(): void {
    this._domainEvents = [];
  }
}

// shared/kernel/ValueObject.ts
export abstract class ValueObject<T> {
  protected readonly props: T;
  
  constructor(props: T) {
    this.props = Object.freeze(props);
  }
  
  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

### Step 3: Migrate Entities by Context

Example for Projects Context:

```typescript
// contexts/projects/domain/entities/Project.ts
import { AggregateRoot } from '../../../shared/kernel/AggregateRoot';
import { Identifier } from '../../../shared/kernel/Identifier';
import { ProjectCreated } from '../../events/ProjectCreated';

export interface ProjectProps {
  name: string;
  description: string;
  status: ProjectStatus;
  budget: Budget;
  timeline: Timeline;
  organizationId: string;
}

export class Project extends AggregateRoot<ProjectProps> {
  private constructor(id: Identifier, props: ProjectProps) {
    super(id);
    this.props = props;
  }
  
  static create(props: ProjectProps): Result<Project> {
    // Validation logic
    const project = new Project(Identifier.create(), props);
    project.addDomainEvent(new ProjectCreated(project));
    return Result.ok(project);
  }
  
  // Business methods
  updateStatus(newStatus: ProjectStatus): Result<void> {
    // Business logic
    return Result.ok();
  }
}
```

### Step 4: Define Repository Interfaces

```typescript
// contexts/projects/repositories/IProjectRepository.ts
import { Project } from '../domain/entities/Project';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOrganization(orgId: string): Promise<Project[]>;
  save(project: Project): Promise<void>;
  delete(id: string): Promise<void>;
  list(filters?: ProjectFilters): Promise<Project[]>;
}
```

### Step 5: Create Context Maps

Document relationships between contexts:

```markdown
# Context Map

## Projects ↔ Finance
- **Relationship:** Customer-Supplier
- **Integration:** Projects reference Budgets
- **Direction:** Projects → Finance (read budget data)

## Projects ↔ People
- **Relationship:** Shared Kernel
- **Integration:** People assigned to Projects
- **Direction:** Bidirectional

## Procurement ↔ Finance
- **Relationship:** Conformist
- **Integration:** Purchase Orders create Expenses
- **Direction:** Procurement → Finance

## Jobs ↔ Companies
- **Relationship:** Customer-Supplier
- **Integration:** Jobs reference Company clients
- **Direction:** Jobs → Companies
```

### Step 6: Update Exports

```typescript
// contexts/projects/index.ts
export * from './domain/entities';
export * from './domain/value-objects';
export * from './domain/aggregates';
export * from './events';
export type * from './repositories';

// Root index.ts
export * from './shared';
export * as ProjectsContext from './contexts/projects';
export * as FinanceContext from './contexts/finance';
export * as PeopleContext from './contexts/people';
// ... other contexts
```

## Validation

### Domain Model Tests
```typescript
// Example: Project aggregate tests
describe('Project', () => {
  it('should create valid project', () => {
    const result = Project.create({
      name: 'Test Project',
      status: ProjectStatus.Active,
      // ...
    });
    expect(result.isSuccess).toBe(true);
  });
  
  it('should enforce business rules', () => {
    // Test business rule violations
  });
});
```

### Context Boundary Tests
- Ensure contexts don't directly depend on each other
- Validate repository interfaces
- Test domain events

## Success Criteria

- ✅ All entities in proper bounded contexts
- ✅ Aggregate roots clearly defined
- ✅ Value objects immutable
- ✅ Repository interfaces per context
- ✅ Domain events implemented
- ✅ Business logic in domain services
- ✅ Context maps documented
- ✅ No circular dependencies
- ✅ Tests passing

## Timeline

- **Day 1-2:** Create structure, move shared kernel
- **Day 3-5:** Migrate Projects and Finance contexts
- **Day 6-8:** Migrate People, Procurement, Jobs
- **Day 9-10:** Migrate remaining contexts
- **Day 11-12:** Create context maps
- **Day 13-14:** Testing and validation

## Next Phase

After Domain restructure, proceed to Phase 3: Application Layer Restructure
