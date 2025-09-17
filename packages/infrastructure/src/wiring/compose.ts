// import { InMemoryAuditLogger } from '../adapters/in-memory-audit-logger';
// import { InMemoryEventBus } from '../adapters/in-memory-event-bus';
// import { InMemoryProjectRepository } from '../repositories/in-memory-project-repository';
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

export function compose() {
  const audit = { record: async () => {} };
  const bus = { publish: async () => {}, subscribe: () => {}, unsubscribe: () => {} };
  const repos = {
    projects: { findById: async () => null, findAll: async () => [], create: async (p: any) => p, update: async () => { throw new Error('Not implemented'); }, delete: async () => {} },
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
      projects: new ProjectsService()
    }
  };
}
