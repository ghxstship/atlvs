/**
 * Programming Module Real-time Service
 * Handles real-time subscriptions, presence tracking, and live updates
 */
import { createClient } from '@/lib/supabase/client';
import type { RealtimeEvent, ProgrammingEvent, Performance, ViewState, DrawerState } from '../types';

export class ProgrammingRealtimeService {
  private supabase = createClient();
  private subscriptions: Map<string, any> = new Map();
  private presenceChannels: Map<string, any> = new Map();
  private eventCallbacks: Map<string, Set<(event: RealtimeEvent) => void> = new Map();

  /**
   * Initialize real-time subscriptions for programming entities
   */
  async initializeRealtime(organizationId: string): Promise<void> {
    // Subscribe to programming events changes
    this.subscribeToEntityChanges('programming_events', organizationId);

    // Subscribe to performances changes
    this.subscribeToEntityChanges('performances', organizationId);

    // Subscribe to call sheets changes
    this.subscribeToEntityChanges('call_sheets', organizationId);

    // Subscribe to workshops changes
    this.subscribeToEntityChanges('workshops', organizationId);

    // Initialize presence tracking
    this.initializePresenceTracking(organizationId);
  }

  /**
   * Subscribe to changes for a specific entity
   */
  private subscribeToEntityChanges(tableName: string, organizationId: string): void {
    const subscriptionKey = `${tableName}_${organizationId}`;

    if (this.subscriptions.has(subscriptionKey)) {
      return; // Already subscribed
    }

    const channel = this.supabase
      .channel(`${tableName}_changes_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          this.handleEntityChange(tableName, payload);
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, channel);
  }

  /**
   * Handle entity changes and broadcast to subscribers
   */
  private handleEntityChange(tableName: string, payload: unknown): void {
    const eventType = this.mapPostgresEventToRealtimeEvent(payload.eventType);
    const entityType = this.mapTableToEntityType(tableName);

    const realtimeEvent: RealtimeEvent = {
      type: eventType,
      entity: entityType,
      id: payload.new?.id || payload.old?.id,
      data: payload.new || payload.old,
      timestamp: new Date(),
      user_id: payload.new?.updated_by || payload.new?.created_by || 'system',
    };

    // Broadcast to all subscribers
    this.broadcastEvent(realtimeEvent);
  }

  /**
   * Initialize presence tracking for collaborative features
   */
  private initializePresenceTracking(organizationId: string): void {
    const presenceKey = `programming_presence_${organizationId}`;

    if (this.presenceChannels.has(presenceKey)) {
      return; // Already initialized
    }

    const channel = this.supabase.channel(presenceKey, {
      config: {
        presence: {
          key: this.getCurrentUserId(),
        },
      },
    });

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        this.handlePresenceSync(presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handlePresenceJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: this.getCurrentUserId(),
            online_at: new Date().toISOString(),
            current_view: 'programming',
            organization_id: organizationId,
          });
        }
      });

    this.presenceChannels.set(presenceKey, channel);
  }

  /**
   * Subscribe to real-time events
   */
  onEvent(entityType: string, callback: (event: RealtimeEvent) => void): () => void {
    if (!this.eventCallbacks.has(entityType)) {
      this.eventCallbacks.set(entityType, new Set());
    }

    this.eventCallbacks.get(entityType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(entityType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventCallbacks.delete(entityType);
        }
      }
    };
  }

  /**
   * Broadcast event to all subscribers
   */
  private broadcastEvent(event: RealtimeEvent): void {
    const callbacks = this.eventCallbacks.get(event.entity);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in realtime event callback:', error);
        }
      });
    }

    // Also broadcast to wildcard subscribers
    const wildcardCallbacks = this.eventCallbacks.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in wildcard realtime event callback:', error);
        }
      });
    }
  }

  /**
   * Get current user ID (placeholder - should be injected)
   */
  private getCurrentUserId(): string {
    // This should be injected from the auth context
    return 'current-user-id';
  }

  /**
   * Handle presence synchronization
   */
  private handlePresenceSync(presenceState: unknown): void {
    const onlineUsers = Object.keys(presenceState).length;

    // Broadcast presence update
    const presenceEvent: RealtimeEvent = {
      type: 'presence_sync',
      entity: 'presence',
      id: 'sync',
      data: { onlineUsers, presenceState },
      timestamp: new Date(),
      user_id: 'system',
    };

    this.broadcastEvent(presenceEvent);
  }

  /**
   * Handle user joining presence
   */
  private handlePresenceJoin(key: string, newPresences: unknown[]): void {
    const joinEvent: RealtimeEvent = {
      type: 'presence_join',
      entity: 'presence',
      id: key,
      data: { newPresences },
      timestamp: new Date(),
      user_id: key,
    };

    this.broadcastEvent(joinEvent);
  }

  /**
   * Handle user leaving presence
   */
  private handlePresenceLeave(key: string, leftPresences: unknown[]): void {
    const leaveEvent: RealtimeEvent = {
      type: 'presence_leave',
      entity: 'presence',
      id: key,
      data: { leftPresences },
      timestamp: new Date(),
      user_id: key,
    };

    this.broadcastEvent(leaveEvent);
  }

  /**
   * Update user presence with current activity
   */
  async updatePresence(activity: {
    current_view?: string;
    current_entity?: string;
    current_record_id?: string;
    last_activity?: Date;
  }): Promise<void> {
    const presenceData = {
      ...activity,
      last_activity: activity.last_activity || new Date(),
    };

    // Update presence across all channels
    for (const [key, channel] of this.presenceChannels) {
      await channel.track(presenceData);
    }
  }

  /**
   * Get current presence state
   */
  getPresenceState(organizationId: string): unknown {
    const channel = this.presenceChannels.get(`programming_presence_${organizationId}`);
    return channel?.presenceState() || {};
  }

  /**
   * Send collaborative cursor update
   */
  async sendCursorUpdate(cursorData: {
    x: number;
    y: number;
    entity: string;
    recordId?: string;
    color?: string;
  }): Promise<void> {
    const cursorEvent: RealtimeEvent = {
      type: 'cursor_update',
      entity: 'collaboration',
      id: this.getCurrentUserId(),
      data: cursorData,
      timestamp: new Date(),
      user_id: this.getCurrentUserId(),
    };

    this.broadcastEvent(cursorEvent);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(entity: string, recordId: string, isTyping: boolean): Promise<void> {
    const typingEvent: RealtimeEvent = {
      type: isTyping ? 'typing_start' : 'typing_stop',
      entity: 'collaboration',
      id: `${entity}_${recordId}`,
      data: { userId: this.getCurrentUserId(), isTyping },
      timestamp: new Date(),
      user_id: this.getCurrentUserId(),
    };

    this.broadcastEvent(typingEvent);
  }

  /**
   * Subscribe to collaborative editing session
   */
  subscribeToCollaborativeEditing(
    entity: string,
    recordId: string,
    callbacks: {
      onCursorUpdate?: (data: unknown) => void;
      onTypingUpdate?: (data: unknown) => void;
      onContentChange?: (data: unknown) => void;
    }
  ): () => void {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to cursor updates
    if (callbacks.onCursorUpdate) {
      const unsubscribeCursor = this.onEvent('collaboration', (event) => {
        if (event.type === 'cursor_update' && event.data.entity === entity && event.data.recordId === recordId) {
          callbacks.onCursorUpdate!(event.data);
        }
      });
      unsubscribers.push(unsubscribeCursor);
    }

    // Subscribe to typing indicators
    if (callbacks.onTypingUpdate) {
      const unsubscribeTyping = this.onEvent('collaboration', (event) => {
        if ((event.type === 'typing_start' || event.type === 'typing_stop') &&
            event.id === `${entity}_${recordId}`) {
          callbacks.onTypingUpdate!(event.data);
        }
      });
      unsubscribers.push(unsubscribeTyping);
    }

    // Subscribe to content changes
    if (callbacks.onContentChange) {
      const unsubscribeContent = this.onEvent(entity, (event) => {
        if (event.id === recordId && (event.type === 'update' || event.type === 'create')) {
          callbacks.onContentChange!(event.data);
        }
      });
      unsubscribers.push(unsubscribeContent);
    }

    // Return master unsubscribe function
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Get conflict resolution suggestions
   */
  async getConflictResolution(
    entity: string,
    recordId: string,
    localVersion: unknown,
    serverVersion: unknown
  ): Promise<{
    strategy: 'merge' | 'overwrite_local' | 'overwrite_server' | 'manual';
    mergedData?: unknown;
    conflicts?: string[];
  }> {
    // Simple conflict resolution logic
    // In a real implementation, this would be more sophisticated

    const conflicts: string[] = [];
    const mergedData: unknown = { ...serverVersion };

    // Compare fields and identify conflicts
    for (const [key, localValue] of Object.entries(localVersion)) {
      const serverValue = serverVersion[key];

      if (localValue !== serverValue) {
        conflicts.push(key);

        // Simple merge strategy - prefer server version for conflicts
        // In practice, you'd want more sophisticated conflict resolution
        mergedData[key] = serverValue;
      }
    }

    if (conflicts.length === 0) {
      return { strategy: 'merge', mergedData };
    } else if (conflicts.length < 3) {
      // Few conflicts - auto-merge
      return { strategy: 'merge', mergedData, conflicts };
    } else {
      // Many conflicts - require manual resolution
      return { strategy: 'manual', conflicts };
    }
  }

  /**
   * Broadcast bulk operation progress
   */
  broadcastBulkOperationProgress(operationId: string, progress: {
    completed: number;
    total: number;
    currentItem?: string;
    errors?: string[];
  }): void {
    const progressEvent: RealtimeEvent = {
      type: 'bulk_operation_progress',
      entity: 'operations',
      id: operationId,
      data: progress,
      timestamp: new Date(),
      user_id: this.getCurrentUserId(),
    };

    this.broadcastEvent(progressEvent);
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup(): Promise<void> {
    // Unsubscribe from all channels
    for (const [key, subscription] of this.subscriptions) {
      await this.supabase.removeChannel(subscription);
    }
    this.subscriptions.clear();

    // Leave all presence channels
    for (const [key, channel] of this.presenceChannels) {
      await channel.untrack();
      await this.supabase.removeChannel(channel);
    }
    this.presenceChannels.clear();

    // Clear all event callbacks
    this.eventCallbacks.clear();
  }

  // Utility methods
  private mapPostgresEventToRealtimeEvent(eventType: string): RealtimeEvent['type'] {
    switch (eventType) {
      case 'INSERT':
        return 'create';
      case 'UPDATE':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'update';
    }
  }

  private mapTableToEntityType(tableName: string): string {
    const mapping: Record<string, string> = {
      programming_events: 'events',
      performances: 'performances',
      call_sheets: 'call-sheets',
      riders: 'riders',
      itineraries: 'itineraries',
      lineups: 'lineups',
      spaces: 'spaces',
      workshops: 'workshops',
    };

    return mapping[tableName] || tableName;
  }
}

export const programmingRealtime = new ProgrammingRealtimeService();
