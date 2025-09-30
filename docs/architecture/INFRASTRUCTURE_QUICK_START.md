# Infrastructure Services - Quick Start Guide

**For Developers:** How to use the new infrastructure services

---

## 📦 Available Services

### External Services
- **Storage** - File upload/download
- **Notification** - SMS, push, email
- **Analytics** - Event tracking
- **Search** - Full-text search
- **Email** - Transactional emails
- **Payment** - Payment processing

### Infrastructure Services
- **Logging** - Structured logging
- **Messaging** - Message queues
- **Monitoring** - Metrics and tracing

---

## 🚀 Quick Examples

### Storage Service

```typescript
import { SupabaseStorageService } from '@ghxstship/infrastructure';
import { createClient } from '@supabase/supabase-js';

// Initialize
const supabase = createClient(url, key);
const storage = new SupabaseStorageService(supabase);

// Upload file
const result = await storage.upload({
  bucket: 'documents',
  path: 'user/123/resume.pdf',
  file: fileBuffer,
  contentType: 'application/pdf',
  isPublic: false,
});

console.log('File URL:', result.url);

// Download file
const buffer = await storage.download({
  bucket: 'documents',
  path: 'user/123/resume.pdf',
});

// Get signed URL (expires in 1 hour)
const signedUrl = await storage.getSignedUrl(
  'documents',
  'user/123/resume.pdf',
  3600
);
```

### Notification Service

```typescript
import { 
  TwilioNotificationService,
  NotificationType,
  NotificationPriority 
} from '@ghxstship/infrastructure';

// Initialize
const twilio = new TwilioNotificationService({
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  fromNumber: process.env.TWILIO_FROM_NUMBER!,
});

// Send SMS
const result = await twilio.send({
  type: NotificationType.SMS,
  recipient: '+1234567890',
  body: 'Your verification code is 123456',
  priority: NotificationPriority.HIGH,
});

// Send bulk notifications
const results = await twilio.sendBulk([
  { type: NotificationType.SMS, recipient: '+1111111111', body: 'Message 1' },
  { type: NotificationType.SMS, recipient: '+2222222222', body: 'Message 2' },
]);
```

### Analytics Service

```typescript
import { 
  PostHogAnalyticsService,
  EventCategory 
} from '@ghxstship/infrastructure';

// Initialize
const analytics = new PostHogAnalyticsService({
  apiKey: process.env.POSTHOG_API_KEY!,
  flushAt: 20,
  flushInterval: 10000,
});

// Track event
await analytics.trackEvent({
  name: 'button_clicked',
  category: EventCategory.INTERACTION,
  properties: {
    button_id: 'submit_form',
    page: '/checkout',
  },
  userId: 'user_123',
});

// Track page view
await analytics.trackPageView({
  path: '/products/123',
  title: 'Product Details',
  userId: 'user_123',
});

// Identify user
await analytics.identifyUser({
  userId: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  properties: {
    plan: 'premium',
    signupDate: '2025-01-01',
  },
});
```

### Search Service

```typescript
import { AlgoliaSearchService } from '@ghxstship/infrastructure';

// Initialize
const search = new AlgoliaSearchService({
  appId: process.env.ALGOLIA_APP_ID!,
  apiKey: process.env.ALGOLIA_API_KEY!,
  indexName: 'products',
});

// Index document
await search.index({
  id: 'prod_123',
  type: 'product',
  title: 'Wireless Headphones',
  content: 'High-quality wireless headphones with noise cancellation',
  organizationId: 'org_456',
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Search
const results = await search.search({
  query: 'wireless headphones',
  organizationId: 'org_456',
  filters: { type: 'product' },
  page: 0,
  hitsPerPage: 20,
});

console.log(`Found ${results.totalHits} results`);
results.hits.forEach(hit => {
  console.log(hit.title, hit.score);
});
```

### Logging Service

```typescript
import { PinoLogger, LogLevel } from '@ghxstship/infrastructure';

// Initialize
const logger = new PinoLogger(
  { service: 'api', environment: 'production' },
  { level: LogLevel.INFO }
);

// Log messages
logger.info('User logged in', { userId: '123', ip: '1.2.3.4' });
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });
logger.error('Payment failed', new Error('Card declined'), { 
  userId: '123',
  amount: 99.99 
});

// Create child logger with inherited context
const requestLogger = logger.child({ 
  requestId: 'req_abc123',
  userId: '123' 
});

requestLogger.info('Processing request');
requestLogger.info('Request completed', { duration: 234 });
```

### Message Queue

```typescript
import { RedisMessageQueue } from '@ghxstship/infrastructure';

// Initialize
const queue = new RedisMessageQueue({
  host: 'localhost',
  port: 6379,
});

// Publish message
const messageId = await queue.publish('email-queue', {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thanks for signing up',
}, {
  priority: 1,
  maxAttempts: 3,
});

// Publish with delay (send in 1 hour)
await queue.publish('reminder-queue', {
  userId: '123',
  message: 'Don\'t forget to complete your profile',
}, {
  delay: 3600000, // 1 hour in ms
});

// Subscribe to queue
await queue.subscribe('email-queue', async (message) => {
  console.log('Processing email:', message.data);
  // Send email...
});

// Batch publish
const ids = await queue.publishBatch('notifications', [
  { userId: '1', message: 'Hello' },
  { userId: '2', message: 'World' },
]);
```

### Monitoring Service

```typescript
import { SentryMonitoringService } from '@ghxstship/infrastructure';

// Initialize
const monitoring = new SentryMonitoringService({
  dsn: process.env.SENTRY_DSN!,
  environment: 'production',
  tracesSampleRate: 0.1,
});

// Record metrics
monitoring.incrementCounter('api.requests', 1, { 
  endpoint: '/api/users',
  method: 'GET' 
});

monitoring.recordHistogram('api.response_time', 234, {
  endpoint: '/api/users',
});

// Trace operations
const span = monitoring.startSpan('database.query', {
  query: 'SELECT * FROM users',
});

try {
  // Perform database query...
  monitoring.endSpan(span, 'ok');
} catch (error) {
  monitoring.endSpan(span, 'error');
  throw error;
}

// Capture errors
try {
  // Some operation...
} catch (error) {
  monitoring.captureException(error as Error, {
    userId: '123',
    operation: 'checkout',
  });
}

// Set user context
monitoring.setUser('user_123', 'user@example.com', 'johndoe');
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Notifications (Twilio)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_FROM_NUMBER=+1234567890

# Analytics (PostHog)
POSTHOG_API_KEY=xxx
POSTHOG_HOST=https://app.posthog.com

# Search (Algolia)
ALGOLIA_APP_ID=xxx
ALGOLIA_API_KEY=xxx

# Monitoring (Sentry)
SENTRY_DSN=xxx
SENTRY_ENVIRONMENT=production

# Messaging (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=xxx
```

### Dependency Injection

```typescript
// services/container.ts
import { Container } from 'inversify';
import {
  IStorageService,
  INotificationService,
  IAnalyticsService,
  ILogger,
  IMessageQueue,
  IMonitoringService,
} from '@ghxstship/infrastructure';

const container = new Container();

// Register services
container.bind<IStorageService>('IStorageService')
  .to(SupabaseStorageService)
  .inSingletonScope();

container.bind<ILogger>('ILogger')
  .to(PinoLogger)
  .inSingletonScope();

// ... register other services

export { container };
```

### Usage in Application

```typescript
import { container } from './services/container';
import type { ILogger, IStorageService } from '@ghxstship/infrastructure';

class UserService {
  constructor(
    private logger: ILogger,
    private storage: IStorageService
  ) {}

  async uploadAvatar(userId: string, file: Buffer) {
    this.logger.info('Uploading avatar', { userId });
    
    const result = await this.storage.upload({
      bucket: 'avatars',
      path: `${userId}/avatar.jpg`,
      file,
      contentType: 'image/jpeg',
      isPublic: true,
    });

    this.logger.info('Avatar uploaded', { userId, url: result.url });
    return result.url;
  }
}

// Get service from container
const logger = container.get<ILogger>('ILogger');
const storage = container.get<IStorageService>('IStorageService');
const userService = new UserService(logger, storage);
```

---

## 🧪 Testing

### Mock Services for Testing

```typescript
import { ILogger, LogLevel } from '@ghxstship/infrastructure';

// Create mock logger for tests
class MockLogger implements ILogger {
  logs: Array<{ level: LogLevel; message: string }> = [];

  debug(message: string) {
    this.logs.push({ level: LogLevel.DEBUG, message });
  }

  info(message: string) {
    this.logs.push({ level: LogLevel.INFO, message });
  }

  // ... implement other methods

  child() {
    return this;
  }
}

// Use in tests
describe('UserService', () => {
  it('should log avatar upload', async () => {
    const mockLogger = new MockLogger();
    const mockStorage = createMockStorage();
    const service = new UserService(mockLogger, mockStorage);

    await service.uploadAvatar('user_123', Buffer.from('...'));

    expect(mockLogger.logs).toContainEqual({
      level: LogLevel.INFO,
      message: 'Uploading avatar',
    });
  });
});
```

---

## 📚 Best Practices

### 1. Always Use Interfaces
```typescript
// ✅ Good - depends on interface
class MyService {
  constructor(private logger: ILogger) {}
}

// ❌ Bad - depends on implementation
class MyService {
  constructor(private logger: PinoLogger) {}
}
```

### 2. Handle Errors Gracefully
```typescript
try {
  await storage.upload(options);
} catch (error) {
  logger.error('Upload failed', error as Error, { userId });
  // Fallback or retry logic
}
```

### 3. Use Child Loggers for Context
```typescript
const requestLogger = logger.child({ requestId, userId });
requestLogger.info('Started processing');
// ... all logs will include requestId and userId
requestLogger.info('Completed processing');
```

### 4. Batch Operations When Possible
```typescript
// ✅ Good - single batch operation
await queue.publishBatch('emails', messages);

// ❌ Bad - multiple individual operations
for (const message of messages) {
  await queue.publish('emails', message);
}
```

### 5. Clean Up Resources
```typescript
const queue = new RedisMessageQueue(config);

// Use the queue...

// Clean up when done
await queue.disconnect();
```

---

## 🆘 Troubleshooting

### Service Not Working
1. Check environment variables are set
2. Verify network connectivity to external service
3. Check service credentials are valid
4. Review logs for error messages

### Performance Issues
1. Enable batching for bulk operations
2. Implement caching where appropriate
3. Monitor metrics to identify bottlenecks
4. Consider async processing for heavy operations

### Testing Issues
1. Use mock implementations for unit tests
2. Use real implementations for integration tests
3. Isolate external service calls in tests
4. Mock network calls to avoid flakiness

---

## 📖 Further Reading

- [Phase 4 Complete Documentation](./PHASE_4_INFRASTRUCTURE_COMPLETE.md)
- [Phase 4 Summary](./PHASE_4_SUMMARY.md)
- [Migration Progress](./MIGRATION_PROGRESS.md)

---

*Last Updated: September 30, 2025*
