# Phase 3: Application Layer Restructure

## Overview
Transform `packages/application` to implement CQRS pattern with clear separation between commands (writes) and queries (reads), plus proper DTOs and mappers.

## Current State Problems

- Services mix orchestration with business logic
- Placeholder implementations in index.ts
- No DTOs for data transfer
- Missing input/output mappers
- No clear command/query separation

## Target Structure

```
packages/application/
├── src/
│   ├── commands/                      # Write Operations (CQRS)
│   │   ├── projects/
│   │   │   ├── create-project/
│   │   │   │   ├── CreateProjectCommand.ts
│   │   │   │   ├── CreateProjectHandler.ts
│   │   │   │   ├── CreateProjectValidator.ts
│   │   │   │   └── index.ts
│   │   │   ├── update-project/
│   │   │   ├── delete-project/
│   │   │   ├── assign-member/
│   │   │   └── index.ts
│   │   ├── finance/
│   │   ├── people/
│   │   ├── procurement/
│   │   └── index.ts
│   │
│   ├── queries/                       # Read Operations (CQRS)
│   │   ├── projects/
│   │   │   ├── get-project/
│   │   │   │   ├── GetProjectQuery.ts
│   │   │   │   ├── GetProjectHandler.ts
│   │   │   │   └── index.ts
│   │   │   ├── list-projects/
│   │   │   ├── search-projects/
│   │   │   └── index.ts
│   │   ├── finance/
│   │   └── index.ts
│   │
│   ├── dtos/                          # Data Transfer Objects
│   │   ├── projects/
│   │   │   ├── ProjectDTO.ts
│   │   │   ├── CreateProjectDTO.ts
│   │   │   ├── UpdateProjectDTO.ts
│   │   │   ├── ProjectListDTO.ts
│   │   │   └── index.ts
│   │   ├── finance/
│   │   ├── people/
│   │   └── index.ts
│   │
│   ├── mappers/                       # Domain ↔ DTO Conversion
│   │   ├── ProjectMapper.ts
│   │   ├── FinanceMapper.ts
│   │   ├── PeopleMapper.ts
│   │   └── index.ts
│   │
│   ├── services/                      # Application Services
│   │   ├── ProjectApplicationService.ts
│   │   ├── FinanceApplicationService.ts
│   │   ├── PeopleApplicationService.ts
│   │   └── index.ts
│   │
│   ├── validators/                    # Input Validation
│   │   ├── ProjectValidators.ts
│   │   ├── FinanceValidators.ts
│   │   └── index.ts
│   │
│   ├── events/                        # Event Handlers
│   │   ├── ProjectEventHandlers.ts
│   │   ├── FinanceEventHandlers.ts
│   │   └── index.ts
│   │
│   ├── pipelines/                     # Request Pipelines
│   │   ├── ValidationPipeline.ts
│   │   ├── AuthorizationPipeline.ts
│   │   ├── LoggingPipeline.ts
│   │   └── index.ts
│   │
│   ├── types/                         # Shared Application Types
│   │   ├── Command.ts
│   │   ├── Query.ts
│   │   ├── Result.ts
│   │   └── index.ts
│   │
│   └── index.ts                       # Main exports
│
├── tests/
│   ├── commands/
│   ├── queries/
│   └── integration/
│
├── package.json
├── tsconfig.json
└── README.md
```

## CQRS Pattern Implementation

### Command Structure

```typescript
// types/Command.ts
export interface ICommand {
  readonly timestamp: Date;
  readonly userId: string;
  readonly organizationId: string;
}

export interface ICommandHandler<TCommand extends ICommand, TResult> {
  execute(command: TCommand): Promise<Result<TResult>>;
}

// commands/projects/create-project/CreateProjectCommand.ts
export class CreateProjectCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly budget: number,
    public readonly userId: string,
    public readonly organizationId: string,
    public readonly timestamp: Date = new Date()
  ) {}
}

// commands/projects/create-project/CreateProjectHandler.ts
export class CreateProjectHandler 
  implements ICommandHandler<CreateProjectCommand, ProjectDTO> {
  
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly mapper: ProjectMapper,
    private readonly eventBus: IEventBus
  ) {}
  
  async execute(command: CreateProjectCommand): Promise<Result<ProjectDTO>> {
    // 1. Validate command
    const validationResult = await this.validate(command);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }
    
    // 2. Create domain entity
    const projectResult = Project.create({
      name: command.name,
      description: command.description,
      budget: Budget.create(command.budget).getValue(),
      organizationId: command.organizationId
    });
    
    if (projectResult.isFailure) {
      return Result.fail(projectResult.error);
    }
    
    const project = projectResult.getValue();
    
    // 3. Save to repository
    await this.projectRepository.save(project);
    
    // 4. Publish domain events
    project.domainEvents.forEach(event => {
      this.eventBus.publish(event);
    });
    
    // 5. Return DTO
    return Result.ok(this.mapper.toDTO(project));
  }
  
  private async validate(command: CreateProjectCommand): Promise<Result<void>> {
    // Validation logic
    return Result.ok();
  }
}
```

### Query Structure

```typescript
// types/Query.ts
export interface IQuery {
  readonly userId: string;
  readonly organizationId: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult> {
  execute(query: TQuery): Promise<Result<TResult>>;
}

// queries/projects/get-project/GetProjectQuery.ts
export class GetProjectQuery implements IQuery {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly organizationId: string
  ) {}
}

// queries/projects/get-project/GetProjectHandler.ts
export class GetProjectHandler 
  implements IQueryHandler<GetProjectQuery, ProjectDTO> {
  
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly mapper: ProjectMapper,
    private readonly authService: IAuthorizationService
  ) {}
  
  async execute(query: GetProjectQuery): Promise<Result<ProjectDTO>> {
    // 1. Check authorization
    const canRead = await this.authService.canReadProject(
      query.userId,
      query.projectId
    );
    
    if (!canRead) {
      return Result.fail('Unauthorized');
    }
    
    // 2. Fetch from repository
    const project = await this.projectRepository.findById(query.projectId);
    
    if (!project) {
      return Result.fail('Project not found');
    }
    
    // 3. Return DTO
    return Result.ok(this.mapper.toDTO(project));
  }
}
```

## DTO Definitions

```typescript
// dtos/projects/ProjectDTO.ts
export interface ProjectDTO {
  id: string;
  name: string;
  description: string;
  status: string;
  budget: {
    amount: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

// dtos/projects/CreateProjectDTO.ts
export interface CreateProjectDTO {
  name: string;
  description: string;
  budgetAmount: number;
  startDate: string;
  endDate: string;
}

// dtos/projects/ProjectListDTO.ts
export interface ProjectListDTO {
  items: ProjectDTO[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Mapper Implementation

```typescript
// mappers/ProjectMapper.ts
import { Project } from '@ghxstship/domain';
import { ProjectDTO, CreateProjectDTO } from '../dtos/projects';

export class ProjectMapper {
  // Domain → DTO
  toDTO(project: Project): ProjectDTO {
    return {
      id: project.id.toString(),
      name: project.props.name,
      description: project.props.description,
      status: project.props.status.value,
      budget: {
        amount: project.props.budget.amount,
        currency: project.props.budget.currency
      },
      timeline: {
        startDate: project.props.timeline.startDate.toISOString(),
        endDate: project.props.timeline.endDate.toISOString()
      },
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }
  
  // DTO → Domain (for creates/updates)
  toDomain(dto: CreateProjectDTO): Result<Project> {
    return Project.create({
      name: dto.name,
      description: dto.description,
      budget: Budget.create(dto.budgetAmount).getValue(),
      timeline: Timeline.create(
        new Date(dto.startDate),
        new Date(dto.endDate)
      ).getValue(),
      status: ProjectStatus.Active,
      organizationId: dto.organizationId
    });
  }
  
  // Batch mapping
  toDTOList(projects: Project[]): ProjectDTO[] {
    return projects.map(p => this.toDTO(p));
  }
}
```

## Application Service Pattern

```typescript
// services/ProjectApplicationService.ts
export class ProjectApplicationService {
  constructor(
    private readonly createProjectHandler: CreateProjectHandler,
    private readonly updateProjectHandler: UpdateProjectHandler,
    private readonly deleteProjectHandler: DeleteProjectHandler,
    private readonly getProjectHandler: GetProjectHandler,
    private readonly listProjectsHandler: ListProjectsHandler
  ) {}
  
  // Commands (writes)
  async createProject(dto: CreateProjectDTO): Promise<Result<ProjectDTO>> {
    const command = new CreateProjectCommand(
      dto.name,
      dto.description,
      dto.budgetAmount,
      dto.userId,
      dto.organizationId
    );
    return this.createProjectHandler.execute(command);
  }
  
  async updateProject(
    id: string,
    dto: UpdateProjectDTO
  ): Promise<Result<ProjectDTO>> {
    const command = new UpdateProjectCommand(id, dto);
    return this.updateProjectHandler.execute(command);
  }
  
  async deleteProject(id: string, userId: string): Promise<Result<void>> {
    const command = new DeleteProjectCommand(id, userId);
    return this.deleteProjectHandler.execute(command);
  }
  
  // Queries (reads)
  async getProject(id: string, userId: string): Promise<Result<ProjectDTO>> {
    const query = new GetProjectQuery(id, userId, organizationId);
    return this.getProjectHandler.execute(query);
  }
  
  async listProjects(
    filters: ProjectFilters,
    userId: string
  ): Promise<Result<ProjectListDTO>> {
    const query = new ListProjectsQuery(filters, userId);
    return this.listProjectsHandler.execute(query);
  }
}
```

## Validation Strategy

```typescript
// validators/ProjectValidators.ts
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000),
  budgetAmount: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export class ProjectValidator {
  static validateCreate(dto: CreateProjectDTO): Result<void> {
    try {
      CreateProjectSchema.parse(dto);
      return Result.ok();
    } catch (error) {
      return Result.fail(error.message);
    }
  }
  
  static validateUpdate(dto: UpdateProjectDTO): Result<void> {
    // Validation logic
    return Result.ok();
  }
}
```

## Migration Steps

### Step 1: Create CQRS Structure
```bash
cd packages/application/src
mkdir -p commands/{projects,finance,people,procurement,jobs}
mkdir -p queries/{projects,finance,people,procurement,jobs}
mkdir -p dtos/{projects,finance,people,procurement,jobs}
mkdir -p mappers validators events pipelines types
```

### Step 2: Move Services to New Structure

For each existing service:
1. Extract command operations → `commands/`
2. Extract query operations → `queries/`
3. Create DTOs for each operation
4. Create mappers for domain ↔ DTO conversion
5. Update service to orchestrate handlers

### Step 3: Implement Handlers

Template for command handler:
```typescript
export class [Action]Handler implements ICommandHandler<[Action]Command, [Result]> {
  constructor(
    private readonly repository: I[Entity]Repository,
    private readonly mapper: [Entity]Mapper,
    private readonly eventBus: IEventBus
  ) {}
  
  async execute(command: [Action]Command): Promise<Result<[Result]>> {
    // 1. Validate
    // 2. Create/update domain entity
    // 3. Save to repository
    // 4. Publish events
    // 5. Return DTO
  }
}
```

### Step 4: Create Request Pipeline

```typescript
// pipelines/ValidationPipeline.ts
export class ValidationPipeline {
  async process<T>(
    request: T,
    next: () => Promise<Result<any>>
  ): Promise<Result<any>> {
    // Validate request
    const validation = this.validate(request);
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }
    
    return next();
  }
}
```

### Step 5: Update Exports

```typescript
// index.ts
// Commands
export * from './commands/projects';
export * from './commands/finance';

// Queries
export * from './queries/projects';
export * from './queries/finance';

// DTOs
export * from './dtos/projects';
export * from './dtos/finance';

// Mappers
export * from './mappers';

// Services
export * from './services';
```

## Testing Strategy

```typescript
// tests/commands/projects/CreateProjectHandler.test.ts
describe('CreateProjectHandler', () => {
  let handler: CreateProjectHandler;
  let mockRepo: jest.Mocked<IProjectRepository>;
  let mockMapper: jest.Mocked<ProjectMapper>;
  
  beforeEach(() => {
    mockRepo = createMockRepository();
    mockMapper = createMockMapper();
    handler = new CreateProjectHandler(mockRepo, mockMapper, eventBus);
  });
  
  it('should create project successfully', async () => {
    const command = new CreateProjectCommand(...);
    const result = await handler.execute(command);
    
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.save).toHaveBeenCalled();
  });
  
  it('should fail with invalid input', async () => {
    const command = new CreateProjectCommand('', ...);
    const result = await handler.execute(command);
    
    expect(result.isFailure).toBe(true);
  });
});
```

## Success Criteria

- ✅ CQRS pattern implemented
- ✅ Clear command/query separation
- ✅ All DTOs defined
- ✅ Mappers for all entities
- ✅ Input validation on all operations
- ✅ Event handlers configured
- ✅ Request pipelines implemented
- ✅ Tests passing
- ✅ No business logic in application layer

## Timeline

- **Day 1-2:** Create structure, implement base types
- **Day 3-5:** Migrate Projects and Finance contexts
- **Day 6-8:** Migrate People, Procurement, Jobs
- **Day 9-10:** Implement request pipelines
- **Day 11-12:** Create DTOs and mappers
- **Day 13-14:** Testing and validation

## Next Phase

After Application restructure, proceed to Phase 4: Infrastructure Layer Restructure
