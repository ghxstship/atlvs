import { InMemoryAuditLogger } from '../adapters/InMemoryAuditLogger';
import { InMemoryEventBus } from '../adapters/InMemoryEventBus';
import { InMemoryProjectRepository } from '../repositories/InMemoryProjectRepository';
import { ProjectsService } from '@ghxstship/application';

// Stub repository implementations for missing types
class StubTaskRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

class StubRiskRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

class StubFileRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

class StubInspectionRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

class StubActivationRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

class StubTimeEntryRepository {
  async findById() { return null; }
  async findByProject() { return []; }
  async create() { throw new Error('Not implemented'); }
  async update() { throw new Error('Not implemented'); }
  async delete() { throw new Error('Not implemented'); }
}

export function composeInMemoryServices() {
  const audit = new InMemoryAuditLogger();
  const bus = new InMemoryEventBus();
  const repos = {
    projects: new InMemoryProjectRepository(),
    tasks: new StubTaskRepository(),
    risks: new StubRiskRepository(),
    files: new StubFileRepository(),
    inspections: new StubInspectionRepository(),
    activations: new StubActivationRepository(),
    timeEntries: new StubTimeEntryRepository()
  };

  return {
    audit,
    bus,
    repos,
    services: {
      projects: new ProjectsService(repos as any, audit, bus)
    }
  };
}
