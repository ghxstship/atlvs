# @ghxstship/infrastructure

Enterprise-grade infrastructure layer for GHXSTSHIP platform.

## Overview

This package provides the infrastructure layer implementation including:
- External service integrations (Storage, Notifications, Analytics, Search)
- Logging infrastructure (Console, Pino)
- Messaging/Queue systems (Redis)
- Monitoring and observability (Sentry)
- Database adapters and repositories
- Real-time communication
- Caching and performance optimization

## Architecture

All services follow the **Adapter Pattern** for maximum flexibility:
- Interface-first design
- Swappable implementations
- Dependency injection ready
- Easy testing with mocks

## Installation

```bash
npm install @ghxstship/infrastructure
```

## Services

### External Services

#### Storage Service
```typescript
import { IStorageService, SupabaseStorageService } from '@ghxstship/infrastructure';

const storage: IStorageService = new SupabaseStorageService(supabaseClient);
await storage.upload({ bucket, path, file });
```

#### Notification Service
```typescript
import { INotificationService, TwilioNotificationService } from '@ghxstship/infrastructure';

const notifications: INotificationService = new TwilioNotificationService(config);
await notifications.send({ type: 'sms', recipient, body });
```

#### Analytics Service
```typescript
import { IAnalyticsService, PostHogAnalyticsService } from '@ghxstship/infrastructure';

const analytics: IAnalyticsService = new PostHogAnalyticsService(config);
await analytics.trackEvent({ name, category, properties });
```

#### Search Service
```typescript
import { ISearchService, AlgoliaSearchService } from '@ghxstship/infrastructure';

const search: ISearchService = new AlgoliaSearchService(config);
const results = await search.search({ query, organizationId });
```

### Infrastructure Services

#### Logging
```typescript
import { ILogger, PinoLogger, ConsoleLogger } from '@ghxstship/infrastructure';

// Production
const logger: ILogger = new PinoLogger({ service: 'api' });

// Development
const logger: ILogger = new ConsoleLogger();

logger.info('User logged in', { userId });
```

#### Messaging
```typescript
import { IMessageQueue, RedisMessageQueue } from '@ghxstship/infrastructure';

const queue: IMessageQueue = new RedisMessageQueue(config);
await queue.publish('email-queue', { to, subject, body });
await queue.subscribe('email-queue', handler);
```

#### Monitoring
```typescript
import { IMonitoringService, SentryMonitoringService } from '@ghxstship/infrastructure';

const monitoring: IMonitoringService = new SentryMonitoringService(config);
monitoring.incrementCounter('api.requests');
monitoring.captureException(error);
```

## Repository Pattern

All data access goes through repositories:

```typescript
import { SupabaseProjectRepository } from '@ghxstship/infrastructure';

const projectRepo = new SupabaseProjectRepository(supabaseClient);
const project = await projectRepo.findById('proj_123');
```

## Real-time Features

```typescript
import { RealtimeManager } from '@ghxstship/infrastructure';

const realtime = new RealtimeManager(supabaseClient);
await realtime.subscribe('projects', 'org_123', (payload) => {
  console.log('Project updated:', payload);
});
```

## Performance Optimization

```typescript
import { 
  CachingAndPaginationService,
  OptimisticLockingService,
  OfflineSupportService 
} from '@ghxstship/infrastructure';

// Caching
const cache = new CachingAndPaginationService();
const data = await cache.getCached('key', () => fetchData());

// Optimistic locking
const locking = new OptimisticLockingService();
await locking.withLock('resource_123', async () => {
  // Critical section
});

// Offline support
const offline = new OfflineSupportService();
await offline.queueOperation({ type: 'create', data });
```

## Configuration

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890

# PostHog
POSTHOG_API_KEY=xxx

# Algolia
ALGOLIA_APP_ID=xxx
ALGOLIA_API_KEY=xxx

# Sentry
SENTRY_DSN=xxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing

### Unit Tests with Mocks

```typescript
import { ILogger } from '@ghxstship/infrastructure';

class MockLogger implements ILogger {
  logs: string[] = [];
  
  info(message: string) {
    this.logs.push(message);
  }
  
  // ... implement other methods
}

// Use in tests
const mockLogger = new MockLogger();
const service = new MyService(mockLogger);
```

### Integration Tests

```typescript
import { SupabaseStorageService } from '@ghxstship/infrastructure';
import { createClient } from '@supabase/supabase-js';

describe('SupabaseStorageService', () => {
  let storage: SupabaseStorageService;
  
  beforeAll(() => {
    const client = createClient(url, key);
    storage = new SupabaseStorageService(client);
  });
  
  it('should upload file', async () => {
    const result = await storage.upload({
      bucket: 'test',
      path: 'test.txt',
      file: Buffer.from('hello'),
    });
    
    expect(result.path).toBe('test.txt');
  });
});
```

## Best Practices

### 1. Always Use Interfaces
```typescript
// ✅ Good
function processData(logger: ILogger) {
  logger.info('Processing...');
}

// ❌ Bad
function processData(logger: PinoLogger) {
  logger.info('Processing...');
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  await storage.upload(options);
} catch (error) {
  logger.error('Upload failed', error as Error);
  // Implement fallback or retry
}
```

### 3. Use Dependency Injection
```typescript
class UserService {
  constructor(
    private logger: ILogger,
    private storage: IStorageService,
    private notifications: INotificationService
  ) {}
}
```

### 4. Batch Operations
```typescript
// ✅ Good
await queue.publishBatch('emails', messages);

// ❌ Bad
for (const msg of messages) {
  await queue.publish('emails', msg);
}
```

### 5. Clean Up Resources
```typescript
const queue = new RedisMessageQueue(config);
try {
  // Use queue
} finally {
  await queue.disconnect();
}
```

## Package Structure

```
src/
├── adapters/              # Event bus, audit logging
├── caching/              # Caching service
├── concurrency/          # Optimistic locking
├── database/             # Database utilities
├── external-services/    # Third-party integrations
│   ├── analytics/       # PostHog, etc.
│   ├── email/           # Email services
│   ├── notification/    # SMS, push, etc.
│   ├── payment/         # Payment processing
│   ├── search/          # Algolia, etc.
│   └── storage/         # File storage
├── logging/             # Logging infrastructure
├── messaging/           # Message queues
├── monitoring/          # Observability
├── offline/             # Offline support
├── performance/         # Performance monitoring
├── persistence/         # Database clients
├── realtime/            # Real-time features
├── repositories/        # Data repositories
└── wiring/              # Service composition
```

## Migration Guide

### From Old Infrastructure

```typescript
// Old
import { supabase } from '@/lib/supabase';

// New
import { supabase } from '@ghxstship/infrastructure';
```

### Adding New Services

1. Define interface in appropriate directory
2. Implement concrete class
3. Export from index.ts
4. Add to main infrastructure index
5. Document usage

## Contributing

### Adding a New Service

1. Create interface file: `I{Service}Service.ts`
2. Create implementation: `{Provider}{Service}Service.ts`
3. Create index.ts with exports
4. Add tests
5. Update documentation

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments
- Include error handling
- Write tests

## License

Proprietary - GHXSTSHIP Platform

## Support

For issues or questions:
- GitHub Issues: [ghxstship/issues](https://github.com/ghxstship/issues)
- Documentation: [docs/architecture](../../docs/architecture)
- Email: dev@ghxstship.com

---

**Version:** 1.0.0  
**Last Updated:** September 30, 2025
