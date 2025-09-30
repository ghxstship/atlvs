# Phase 4: Infrastructure Layer Restructure

## Overview
Reorganize `packages/infrastructure` to clearly separate persistence, external services, caching, messaging, and other infrastructure concerns.

## Current State
- 49 items without clear organization
- Mixed persistence and service integrations
- No clear adapter pattern implementation

## Target Structure

```
packages/infrastructure/
├── src/
│   ├── persistence/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── config.ts
│   │   │   ├── repositories/
│   │   │   │   ├── ProjectRepository.ts
│   │   │   │   ├── FinanceRepository.ts
│   │   │   │   ├── PeopleRepository.ts
│   │   │   │   └── index.ts
│   │   │   ├── mappers/
│   │   │   │   ├── ProjectDataMapper.ts
│   │   │   │   ├── FinanceDataMapper.ts
│   │   │   │   └── index.ts
│   │   │   └── migrations/
│   │   └── index.ts
│   │
│   ├── external-services/
│   │   ├── payment/
│   │   │   ├── StripeAdapter.ts
│   │   │   ├── IPaymentService.ts
│   │   │   └── index.ts
│   │   ├── email/
│   │   │   ├── SendGridAdapter.ts
│   │   │   ├── IEmailService.ts
│   │   │   └── index.ts
│   │   ├── storage/
│   │   │   ├── SupabaseStorageAdapter.ts
│   │   │   ├── IStorageService.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── cache/
│   │   ├── RedisCache.ts
│   │   ├── InMemoryCache.ts
│   │   ├── ICacheService.ts
│   │   └── index.ts
│   │
│   ├── messaging/
│   │   ├── EventBus.ts
│   │   ├── MessageQueue.ts
│   │   ├── IMessageBroker.ts
│   │   └── index.ts
│   │
│   ├── logging/
│   │   ├── Logger.ts
│   │   ├── SentryLogger.ts
│   │   ├── ILogger.ts
│   │   └── index.ts
│   │
│   ├── monitoring/
│   │   ├── PerformanceMonitor.ts
│   │   ├── HealthCheck.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── tests/
├── package.json
└── tsconfig.json
```

## Success Criteria
- ✅ Clear adapter pattern for external services
- ✅ Repository implementations separate from interfaces
- ✅ No business logic in infrastructure layer
- ✅ All external dependencies isolated

## Timeline
- **Day 1-3:** Restructure and migrate repositories
- **Day 4-5:** Move external service adapters
- **Day 6-7:** Testing and validation
