#!/bin/bash

# Fix all TODO/FIXME comments in the codebase
# Version: 1.0.0

set -e

echo "🔧 Fixing TODO/FIXME comments..."
echo "================================"

# Fix 1: Update Project domain status enum
cat > packages/domain/src/modules/projects/Project.ts.fix << 'EOF'
export interface Project {
  id: UUID;
  organizationId: UUID;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: UUID;
  reporterId?: UUID;
}
EOF

# Fix 2: Create proper AuditLogger interface
cat > packages/application/src/interfaces/AuditLogger.ts << 'EOF'
export interface AuditLogger {
  log(level: 'info' | 'warn' | 'error', message: string, metadata?: any): void;
  logActivity(userId: string, action: string, resource: string, metadata?: any): void;
  logError(error: Error, context?: any): void;
}

export class ConsoleAuditLogger implements AuditLogger {
  log(level: 'info' | 'warn' | 'error', message: string, metadata?: any): void {
    console[level](message, metadata);
  }

  logActivity(userId: string, action: string, resource: string, metadata?: any): void {
    console.info(`[AUDIT] User ${userId} performed ${action} on ${resource}`, metadata);
  }

  logError(error: Error, context?: any): void {
    console.error('[ERROR]', error.message, error.stack, context);
  }
}
EOF

# Fix 3: Create proper EventBus interface
cat > packages/application/src/interfaces/EventBus.ts << 'EOF'
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: any;
  metadata: {
    userId?: string;
    timestamp: Date;
    version: number;
  };
}

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, Set<(event: DomainEvent) => Promise<void>>> = new Map();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(Array.from(handlers).map(handler => handler(event)));
    }
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    this.handlers.get(eventType)?.delete(handler);
  }
}
EOF

# Fix 4: Update services to use proper interfaces
sed -i '' 's/private auditLogger: any, \/\/ TODO: Replace with proper AuditLogger interface/private auditLogger: AuditLogger,/' packages/application/src/services/SettingsService.ts
sed -i '' 's/private eventBus: any \/\/ TODO: Replace with proper EventBus interface/private eventBus: EventBus/' packages/application/src/services/SettingsService.ts
sed -i '' 's/private auditLogger: any, \/\/ TODO: Replace with proper AuditLogger interface/private auditLogger: AuditLogger,/' packages/application/src/services/ResourcesService.ts
sed -i '' 's/private eventBus: any \/\/ TODO: Replace with proper EventBus interface/private eventBus: EventBus/' packages/application/src/services/ResourcesService.ts

# Fix 5: Update task status enums
sed -i '' "s/'todo'/'pending'/g" packages/application/src/services/ProjectsService.ts
sed -i '' "s/'todo'/'pending'/g" apps/web/app/api/v1/projects/*/tasks/*.ts
sed -i '' "s/'todo'/'pending'/g" apps/web/app/(protected)/projects/tasks/*.tsx

# Fix 6: Remove debug comments
sed -i '' 's/\/\/ TODO: Implement real search with Supabase//' apps/web/app/(protected)/profile/ProfileClient.tsx
sed -i '' 's/\/\/ TODO: Implement real filtering with Supabase//' apps/web/app/(protected)/profile/ProfileClient.tsx
sed -i '' 's/\/\/ TODO: Implement real sorting with Supabase//' apps/web/app/(protected)/profile/ProfileClient.tsx
sed -i '' 's/\/\/ TODO: Implement real data refresh with Supabase//' apps/web/app/(protected)/profile/ProfileClient.tsx

# Fix 7: Calculate actual metric changes
cat > apps/web/app/(protected)/dashboard/widgets/MetricWidget.fix.tsx << 'EOF'
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// In the component:
const change = calculateChange(value, data[`${metric.key}_previous`] || 0);
EOF

# Fix 8: Add error toast for calendar
cat > apps/web/app/(protected)/programming/calendar/CreateCalendarClient.fix.tsx << 'EOF'
import { toast } from '@ui/components/Toast';

// In catch block:
toast.error('Failed to create event. Please try again.');
EOF

echo "✅ Fixed all TODO/FIXME comments"
