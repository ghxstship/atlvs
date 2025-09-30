/**
 * Procurement Real-time Service
 * Real-time subscriptions and presence tracking
 */

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Real-time event types
export enum RealtimeEventType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PRESENCE_JOIN = 'presence_join',
  PRESENCE_LEAVE = 'presence_leave',
}

// Subscription options
const SubscriptionOptionsSchema = z.object({
  entity: z.enum(['orders', 'vendors', 'requests', 'contracts', 'budgets']),
  eventTypes: z.array(z.nativeEnum(RealtimeEventType)).default([RealtimeEventType.INSERT, RealtimeEventType.UPDATE, RealtimeEventType.DELETE]),
  filters: z.record(z.any()).optional(),
  includePresence: z.boolean().default(false),
});

export type SubscriptionOptions = z.infer<typeof SubscriptionOptionsSchema>;

// Real-time event payload
export interface RealtimeEventPayload<T = any> {
  eventType: RealtimeEventType;
  entity: string;
  old?: T;
  new?: T;
  userId?: string;
  timestamp: Date;
  presence?: PresenceState;
}

// Presence state
export interface PresenceState {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: Date;
  currentEntity?: string;
  currentRecordId?: string;
}

// Subscription callback
export type RealtimeCallback<T = any> = (payload: RealtimeEventPayload<T>) => void;

// Active subscription
export interface ActiveSubscription {
  id: string;
  channel: RealtimeChannel;
  options: SubscriptionOptions;
  callback: RealtimeCallback;
  unsubscribe: () => void;
}

/**
 * Procurement Real-time Service Class
 * Handles real-time subscriptions, presence tracking, and collaborative features
 */
export class ProcurementRealtimeService {
  private supabase: unknown;
  private orgId: string;
  private userId: string;
  private activeSubscriptions: Map<string, ActiveSubscription> = new Map();
  private presenceChannel?: RealtimeChannel;
  private presenceState: PresenceState;

  constructor(orgId: string, userId: string, userName: string, avatar?: string) {
    this.orgId = orgId;
    this.userId = userId;
    this.supabase = createClient();

    this.presenceState = {
      userId: this.userId,
      userName,
      avatar,
      status: 'online',
      lastSeen: new Date(),
    };
  }

  /**
   * Initialize presence tracking
   */
  async initializePresence(): Promise<void> {
    this.presenceChannel = this.supabase.channel(`procurement_presence_${this.orgId}`, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    // Track presence
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel!.presenceState();
        this.handlePresenceSync(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handlePresenceJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this.presenceChannel!.track(this.presenceState);
        }
      });
  }

  /**
   * Subscribe to real-time changes for an entity
   */
  subscribe<T = any>(
    options: SubscriptionOptions,
    callback: RealtimeCallback<T>
  ): ActiveSubscription {
    const subscriptionId = `${options.entity}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const channel = this.supabase.channel(`${options.entity}_changes_${this.orgId}`, {
      config: {
        postgres_changes: options.eventTypes
          .filter(type => type !== RealtimeEventType.PRESENCE_JOIN && type !== RealtimeEventType.PRESENCE_LEAVE)
          .map(eventType => ({
            event: eventType,
            schema: 'public',
            table: this.getTableName(options.entity),
            filter: this.buildRealtimeFilter(options.filters),
          })),
      },
    });

    // Handle database changes
    channel.on('postgres_changes', (payload: RealtimePostgresChangesPayload<T>) => {
      const eventPayload: RealtimeEventPayload<T> = {
        eventType: payload.eventType as RealtimeEventType,
        entity: options.entity,
        old: payload.old,
        new: payload.new,
        timestamp: new Date(),
      };

      callback(eventPayload);
    });

    // Subscribe to channel
    channel.subscribe();

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      options,
      callback,
      unsubscribe: () => {
        channel.unsubscribe();
        this.activeSubscriptions.delete(subscriptionId);
      },
    };

    this.activeSubscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.activeSubscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.activeSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.activeSubscriptions.clear();

    if (this.presenceChannel) {
      this.presenceChannel.unsubscribe();
      this.presenceChannel = undefined;
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(updates: Partial<PresenceState>): Promise<void> {
    this.presenceState = {
      ...this.presenceState,
      ...updates,
      lastSeen: new Date(),
    };

    if (this.presenceChannel) {
      await this.presenceChannel.track(this.presenceState);
    }
  }

  /**
   * Get current presence state for organization
   */
  getPresenceState(): Record<string, PresenceState[]> {
    if (!this.presenceChannel) return {};

    return this.presenceChannel.presenceState();
  }

  /**
   * Get users currently viewing a specific record
   */
  getUsersViewingRecord(entity: string, recordId: string): PresenceState[] {
    const presenceState = this.getPresenceState();
    const users: PresenceState[] = [];

    Object.values(presenceState).forEach((presences: PresenceState[]) => {
      presences.forEach(presence => {
        if (presence.currentEntity === entity && presence.currentRecordId === recordId) {
          users.push(presence);
        }
      });
    });

    return users;
  }

  /**
   * Broadcast a custom event to other users
   */
  async broadcastEvent(eventType: string, payload: unknown): Promise<void> {
    if (!this.presenceChannel) return;

    await this.presenceChannel.send({
      type: 'broadcast',
      event: eventType,
      payload: {
        ...payload,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Subscribe to collaborative editing events
   */
  subscribeToCollaboration(
    entity: string,
    recordId: string,
    callback: RealtimeCallback
  ): ActiveSubscription {
    // Update presence to show current activity
    this.updatePresence({
      currentEntity: entity,
      currentRecordId: recordId,
    });

    // Subscribe to changes for this specific record
    return this.subscribe(
      {
        entity: entity as any,
        filters: { id: recordId },
      },
      callback
    );
  }

  /**
   * Handle presence sync
   */
  private handlePresenceSync(state: Record<string, PresenceState[]>): void {
    // Notify about presence changes
  }

  /**
   * Handle user joining
   */
  private handlePresenceJoin(key: string, newPresences: PresenceState[]): void {
    newPresences.forEach(presence => {
    });
  }

  /**
   * Handle user leaving
   */
  private handlePresenceLeave(key: string, leftPresences: PresenceState[]): void {
    leftPresences.forEach(presence => {
    });
  }

  /**
   * Build real-time filter string
   */
  private buildRealtimeFilter(filters?: Record<string, any>): string | undefined {
    if (!filters) return undefined;

    const filterParts = Object.entries(filters)
      .map(([key, value]) => `${key}=eq.${value}`)
      .join('&');

    return filterParts || undefined;
  }

  /**
   * Get table name for entity
   */
  private getTableName(entity: string): string {
    const tableMap: Record<string, string> = {
      orders: 'purchase_orders',
      vendors: 'vendors',
      requests: 'procurement_requests',
      contracts: 'contracts',
      budgets: 'budgets',
    };

    return tableMap[entity] || entity;
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.activeSubscriptions.size;
  }

  /**
   * Check if service is connected
   */
  isConnected(): boolean {
    return this.presenceChannel?.state === 'joined';
  }

  /**
   * Reconnect after network issues
   */
  async reconnect(): Promise<void> {
    this.unsubscribeAll();
    await this.initializePresence();
  }

  /**
   * Set user status
   */
  async setStatus(status: 'online' | 'away' | 'busy'): Promise<void> {
    await this.updatePresence({ status });
  }

  /**
   * Get collaboration statistics
   */
  getCollaborationStats(): {
    activeUsers: number;
    activeSubscriptions: number;
    currentEntity?: string;
    currentRecordId?: string;
  } {
    const presenceState = this.getPresenceState();
    const activeUsers = Object.values(presenceState).flat().length;

    return {
      activeUsers,
      activeSubscriptions: this.activeSubscriptions.size,
      currentEntity: this.presenceState.currentEntity,
      currentRecordId: this.presenceState.currentRecordId,
    };
  }
}

// Factory function
export function createProcurementRealtimeService(
  orgId: string,
  userId: string,
  userName: string,
  avatar?: string
): ProcurementRealtimeService {
  return new ProcurementRealtimeService(orgId, userId, userName, avatar);
}

// Utility functions
export function isRealtimeEventType(event: string): event is RealtimeEventType {
  return Object.values(RealtimeEventType).includes(event as RealtimeEventType);
}

export function createRealtimeCallback<T>(
  handler: (event: RealtimeEventPayload<T>) => void
): RealtimeCallback<T> {
  return handler;
}

export function formatRealtimeTimestamp(date: Date): string {
  return date.toISOString();
}

// Conflict resolution helpers
export interface ConflictResolutionOptions {
  strategy: 'last_write_wins' | 'merge' | 'manual';
  mergeFields?: string[];
  onConflict?: (local: unknown, remote: unknown) => any;
}

export function resolveRealtimeConflict<T>(
  local: T,
  remote: T,
  options: ConflictResolutionOptions = { strategy: 'last_write_wins' }
): T {
  switch (options.strategy) {
    case 'last_write_wins':
      // Assume remote is newer
      return remote;

    case 'merge':
      // Simple merge strategy
      return { ...local, ...remote };

    case 'manual':
      // Use custom resolver
      return options.onConflict?.(local, remote) || local;

    default:
      return local;
  }
}

// Optimistic update helpers
export interface OptimisticUpdateOptions<T> {
  applyUpdate: (current: T, update: Partial<T>) => T;
  revertUpdate: (current: T, original: T) => T;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export function createOptimisticUpdate<T>(
  currentData: T,
  update: Partial<T>,
  options: OptimisticUpdateOptions<T>
): {
  optimisticData: T;
  promise: Promise<T>;
  revert: () => void;
} {
  const optimisticData = options.applyUpdate(currentData, update);

  const promise = new Promise<T>((resolve, reject) => {
    // Simulate async operation
    setTimeout(() => {
      try {
        // In real implementation, this would be the actual API call
        const result = optimisticData; // Mock success
        options.onSuccess?.(result);
        resolve(result);
      } catch (error: unknown) {
        options.onError?.(error);
        reject(error);
      }
    }, options.timeout || 1000);
  });

  const revert = () => {
    options.revertUpdate(optimisticData, currentData);
  };

  return { optimisticData, promise, revert };
}
