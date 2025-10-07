/**
 * Dashboard Module Real-time Service
 * Enterprise-grade real-time data synchronization
 * Provides WebSocket connections, presence indicators, and conflict resolution
 */

import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type {
  Dashboard,
  DashboardWidget,
  DashboardFilter,
  WidgetData
} from '../types';

// Real-time Event Types
export type RealtimeEvent =
  | 'dashboard:created'
  | 'dashboard:updated'
  | 'dashboard:deleted'
  | 'widget:created'
  | 'widget:updated'
  | 'widget:deleted'
  | 'widget:data_updated'
  | 'filter:created'
  | 'filter:updated'
  | 'filter:deleted'
  | 'user:presence'
  | 'user:activity';

export interface RealtimePayload {
  eventType: RealtimeEvent;
  record: unknown;
  old_record?: unknown;
  user_id?: string;
  timestamp: string;
  session_id?: string;
}

export interface PresenceState {
  user_id: string;
  user_name?: string;
  avatar_url?: string;
  last_seen: string;
  current_dashboard?: string;
  current_widget?: string;
  activity: 'viewing' | 'editing' | 'creating';
}

export interface ConflictResolution {
  strategy: 'overwrite' | 'merge' | 'skip' | 'manual';
  localData: unknown;
  remoteData: unknown;
  resolvedData?: unknown;
  requiresManualResolution: boolean;
}

// Real-time Service Class
export class RealtimeService {
  private supabase = createClient();
  private channels = new Map<string, RealtimeChannel>();
  private presenceStates = new Map<string, PresenceState>();
  private eventListeners = new Map<RealtimeEvent, Array<(payload: RealtimePayload) => void>>();
  private conflictResolvers = new Map<string, (conflict: ConflictResolution) => Promise<unknown>>();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';

  constructor() {
    this.setupConnectionMonitoring();
  }

  // Connection Management
  async connect(): Promise<void> {
    try {
      this.connectionStatus = 'connecting';

      // Test connection
      await this.supabase.from('dashboards').select('count').limit(1).single();

      this.connectionStatus = 'connected';

      // Setup global error handler
      this.supabase.realtime.onError((error) => {
        console.error('Realtime connection error:', error);
        this.connectionStatus = 'error';
        this.handleReconnection();
      });

    } catch (error) {
      console.error('Failed to connect to realtime service:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  disconnect(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
    this.presenceStates.clear();
    this.connectionStatus = 'disconnected';
  }

  getConnectionStatus(): typeof this.connectionStatus {
    return this.connectionStatus;
  }

  // Dashboard Subscriptions
  subscribeToDashboard(
    dashboardId: string,
    callbacks: {
      onDashboardChange?: (payload: RealtimePayload) => void;
      onWidgetChange?: (payload: RealtimePayload) => void;
      onPresenceChange?: (presence: PresenceState[]) => void;
    } = {}
  ): string {
    const channelName = `dashboard:${dashboardId}`;

    if (this.channels.has(channelName)) {
      return channelName;
    }

    const channel = this.supabase.channel(channelName);

    // Subscribe to dashboard changes
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboards',
          filter: `id=eq.${dashboardId}`
        },
        (payload) => {
          const eventPayload: RealtimePayload = {
            eventType: `dashboard:${payload.eventType}` as RealtimeEvent,
            record: payload.new,
            old_record: payload.old,
            user_id: payload.commit_timestamp ? 'system' : undefined,
            timestamp: new Date().toISOString()
          };

          this.emitEvent(eventPayload.eventType, eventPayload);
          callbacks.onDashboardChange?.(eventPayload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dashboard_widgets',
          filter: `dashboard_id=eq.${dashboardId}`
        },
        (payload) => {
          const eventPayload: RealtimePayload = {
            eventType: `widget:${payload.eventType}` as RealtimeEvent,
            record: payload.new,
            old_record: payload.old,
            user_id: payload.commit_timestamp ? 'system' : undefined,
            timestamp: new Date().toISOString()
          };

          this.emitEvent(eventPayload.eventType, eventPayload);
          callbacks.onWidgetChange?.(eventPayload);
        }
      )
      .subscribe();

    // Setup presence tracking
    this.setupPresenceTracking(channel, dashboardId, callbacks.onPresenceChange);

    this.channels.set(channelName, channel);
    return channelName;
  }

  unsubscribeFromDashboard(dashboardId: string): void {
    const channelName = `dashboard:${dashboardId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  // Widget Data Subscriptions
  subscribeToWidgetData(
    widgetId: string,
    callback: (data: WidgetData) => void
  ): string {
    const channelName = `widget_data:${widgetId}`;

    if (this.channels.has(channelName)) {
      return channelName;
    }

    const channel = this.supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_data',
          filter: `widget_id=eq.${widgetId}`
        },
        (payload) => {
          const data = payload.new as WidgetData;
          callback(data);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channelName;
  }

  // Global Event Subscription
  subscribeToEvents(
    eventTypes: RealtimeEvent[],
    callback: (payload: RealtimePayload) => void
  ): string {
    const subscriptionId = `events_${Date.now()}_${Math.random()}`;

    eventTypes.forEach(eventType => {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, []);
      }
      this.eventListeners.get(eventType)!.push(callback);
    });

    return subscriptionId;
  }

  unsubscribeFromEvents(subscriptionId: string): void {
    // Remove all listeners with this subscription ID
    // This is a simplified implementation - in practice you'd track subscriptions
    this.eventListeners.clear();
  }

  // Presence Management
  updatePresence(dashboardId: string, activity: PresenceState['activity']): void {
    const channel = this.channels.get(`dashboard:${dashboardId}`);
    if (!channel) return;

    const presenceData: PresenceState = {
      user_id: 'current_user', // Would be from auth context
      last_seen: new Date().toISOString(),
      current_dashboard: dashboardId,
      activity
    };

    channel.track(presenceData);
  }

  getPresenceStates(dashboardId: string): PresenceState[] {
    const channel = this.channels.get(`dashboard:${dashboardId}`);
    if (!channel) return [];

    // This would return actual presence states from the channel
    return Array.from(this.presenceStates.values()).filter(
      state => state.current_dashboard === dashboardId
    );
  }

  // Conflict Resolution
  registerConflictResolver(
    entityType: string,
    resolver: (conflict: ConflictResolution) => Promise<unknown>
  ): void {
    this.conflictResolvers.set(entityType, resolver);
  }

  async resolveConflict(
    entityType: string,
    conflict: ConflictResolution
  ): Promise<unknown> {
    const resolver = this.conflictResolvers.get(entityType);

    if (!resolver) {
      // Default strategy
      switch (conflict.strategy) {
        case 'overwrite':
          return conflict.remoteData;
        case 'merge':
          return { ...conflict.localData, ...conflict.remoteData };
        case 'skip':
          return conflict.localData;
        case 'manual':
        default:
          conflict.requiresManualResolution = true;
          return conflict.localData;
      }
    }

    return resolver(conflict);
  }

  // Broadcast Custom Events
  broadcastEvent(
    dashboardId: string,
    eventType: RealtimeEvent,
    data: unknown
  ): void {
    const channel = this.channels.get(`dashboard:${dashboardId}`);
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: eventType,
      payload: {
        ...data,
        timestamp: new Date().toISOString(),
        user_id: 'current_user' // Would be from auth context
      }
    });
  }

  // Private Methods
  private emitEvent(eventType: RealtimeEvent, payload: RealtimePayload): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error('Error in realtime event listener:', error);
        }
      });
    }
  }

  private setupPresenceTracking(
    channel: RealtimeChannel,
    dashboardId: string,
    onPresenceChange?: (presence: PresenceState[]) => void
  ): void {
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceData = channel.presenceState();
        const states: PresenceState[] = [];

        Object.values(presenceData).forEach((presences: unknown[]) => {
          presences.forEach((presence: unknown) => {
            states.push(presence as PresenceState);
          });
        });

        // Update local presence states
        states.forEach(state => {
          this.presenceStates.set(state.user_id, state);
        });

        onPresenceChange?.(states);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: unknown) => {
          this.presenceStates.set(presence.user_id, presence as PresenceState);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: unknown) => {
          this.presenceStates.delete(presence.user_id);
        });
      });
  }

  private setupConnectionMonitoring(): void {
    // Monitor connection health
    setInterval(() => {
      if (this.connectionStatus === 'connected') {
        // Ping to check connection
        this.supabase.from('dashboards').select('count').limit(1).single()
          .catch(() => {
            this.connectionStatus = 'error';
            this.handleReconnection();
          });
      }
    }, 30000); // Check every 30 seconds
  }

  private handleReconnection(): void {
    if (this.connectionStatus === 'error') {

      setTimeout(() => {
        this.connect().catch(() => {
          console.error('Failed to reconnect to realtime service');
        });
      }, 5000); // Retry after 5 seconds
    }
  }
}

// Collaborative Editing Utilities
export class CollaborativeEditor {
  private realtimeService: RealtimeService;
  private editLocks = new Map<string, { userId: string; timestamp: number }>();
  private pendingChanges = new Map<string, unknown>();

  constructor(realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
  }

  // Acquire edit lock
  async acquireLock(entityId: string, userId: string): Promise<boolean> {
    const existingLock = this.editLocks.get(entityId);

    if (existingLock && existingLock.userId !== userId) {
      // Check if lock is expired (5 minutes)
      if (Date.now() - existingLock.timestamp < 300000) {
        return false; // Lock held by another user
      }
    }

    this.editLocks.set(entityId, { userId, timestamp: Date.now() });
    return true;
  }

  // Release edit lock
  releaseLock(entityId: string, userId: string): void {
    const lock = this.editLocks.get(entityId);
    if (lock && lock.userId === userId) {
      this.editLocks.delete(entityId);
    }
  }

  // Queue change for optimistic updates
  queueChange(entityId: string, change: unknown): void {
    this.pendingChanges.set(entityId, change);
  }

  // Apply queued changes
  applyQueuedChanges(entityId: string): unknown | null {
    const change = this.pendingChanges.get(entityId);
    if (change) {
      this.pendingChanges.delete(entityId);
      return change;
    }
    return null;
  }

  // Check for conflicts
  hasConflict(entityId: string, remoteData: unknown): boolean {
    const pendingChange = this.pendingChanges.get(entityId);
    return pendingChange !== undefined;
  }
}

// Activity Tracking
export class ActivityTracker {
  private realtimeService: RealtimeService;
  private userActivities = new Map<string, {
    userId: string;
    activity: string;
    timestamp: number;
    dashboardId?: string;
  }>();

  constructor(realtimeService: RealtimeService) {
    this.realtimeService = realtimeService;
  }

  // Track user activity
  trackActivity(userId: string, activity: string, dashboardId?: string): void {
    this.userActivities.set(userId, {
      userId,
      activity,
      timestamp: Date.now(),
      dashboardId
    });

    // Broadcast activity update
    if (dashboardId) {
      this.realtimeService.broadcastEvent(dashboardId, 'user:activity', {
        userId,
        activity,
        timestamp: Date.now()
      });
    }
  }

  // Get recent activities
  getRecentActivities(dashboardId?: string, limit = 10): Array<{
    userId: string;
    activity: string;
    timestamp: number;
  }> {
    const activities = Array.from(this.userActivities.values())
      .filter(activity => !dashboardId || activity.dashboardId === dashboardId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return activities;
  }

  // Get active users
  getActiveUsers(dashboardId?: string): string[] {
    const fiveMinutesAgo = Date.now() - 300000;
    return Array.from(this.userActivities.values())
      .filter(activity =>
        activity.timestamp > fiveMinutesAgo &&
        (!dashboardId || activity.dashboardId === dashboardId)
      )
      .map(activity => activity.userId);
  }
}

// Export singleton instances
export const realtimeService = new RealtimeService();
export const collaborativeEditor = new CollaborativeEditor(realtimeService);
export const activityTracker = new ActivityTracker(realtimeService);
