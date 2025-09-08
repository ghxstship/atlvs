import { InMemoryAuditLogger } from '../adapters/InMemoryAuditLogger';
import { InMemoryEventBus } from '../adapters/InMemoryEventBus';
import { InMemoryProjectRepository } from '../repositories/InMemoryProjectRepository';
import { ProjectsService } from '@ghxstship/application';

export function composeInMemoryServices() {
  const audit = new InMemoryAuditLogger();
  const bus = new InMemoryEventBus();
  const repos = {
    projects: new InMemoryProjectRepository()
  };

  return {
    audit,
    bus,
    repos,
    services: {
      projects: new ProjectsService(repos, audit, bus)
    }
  };
}
