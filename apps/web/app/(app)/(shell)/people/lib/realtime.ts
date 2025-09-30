/**
 * PEOPLE MODULE - REAL-TIME SUBSCRIPTIONS
 * Comprehensive real-time functionality for People module
 * Live data synchronization with conflict resolution
 */

import { createClient } from '@/lib/supabase/server';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export enum RealtimeEvent {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PRESENCE = 'presence'
}

export interface RealtimeSubscriptionOptions {
  table: string;
  event?: RealtimeEvent | '*';
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, unknown> => void;
  onError?: (error: Error) => void;
}

export interface PresenceState {
  userId: string;
  userEmail: string;
  lastSeen: number;
  currentView?: string;
  editing?: string[];
}

export class PeopleRealtimeService {
  private supabase = createClient();
  private orgId: string;
  private userId: string;
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannel: RealtimeChannel | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(orgId: string, userId: string) {
    this.orgId = orgId;
    this.userId = userId;
  }

  // Subscribe to people table changes
  subscribeToPeople(options: Omit<RealtimeSubscriptionOptions, 'table'>): string {
    return this.subscribe({
      table: 'people',
      ...options
    });
  }

  // Subscribe to competencies changes
  subscribeToCompetencies(options: Omit<RealtimeSubscriptionOptions, 'table'>): string {
    return this.subscribe({
      table: 'person_competencies',
      ...options
    });
  }

  // Subscribe to assignments changes
  subscribeToAssignments(options: Omit<RealtimeSubscriptionOptions, 'table'>): string {
    return this.subscribe({
      table: 'people_assignments',
      ...options
    });
  }

  // Subscribe to endorsements changes
  subscribeToEndorsements(options: Omit<RealtimeSubscriptionOptions, 'table'>): string {
    return this.subscribe({
      table: 'people_endorsements',
      ...options
    });
  }

  // Generic subscription method
  private subscribe(options: RealtimeSubscriptionOptions): string {
    const channelId = `people_${options.table}_${Date.now()}_${Math.random()}`;

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter
        },
        (payload) => {
          try {
            // Add organization context to payload
            const enrichedPayload = {
              ...payload,
              _metadata: {
                orgId: this.orgId,
                userId: this.userId,
                timestamp: Date.now()
              }
            };

            options.onEvent(enrichedPayload);
          } catch (error) {
            if (options.onError) {
              options.onError(error as Error);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          this.handleSubscriptionError(channelId, options);
        } else if (status === 'TIMED_OUT') {
          this.handleReconnect(channelId, options);
        }
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  // Presence functionality for collaborative features
  async initializePresence(initialState?: Partial<PresenceState>): Promise<void> {
    const channelId = `people_presence_${this.orgId}`;

    this.presenceChannel = this.supabase.channel(channelId, {
      config: {
        presence: {
          key: this.userId
        }
      }
    });

    // Track presence
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.presenceChannel?.presenceState();
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
          // Set initial presence
          const presenceState: PresenceState = {
            userId: this.userId,
            userEmail: await this.getUserEmail(),
            lastSeen: Date.now(),
            ...initialState
          };

          await this.presenceChannel?.track(presenceState);
        }
      });
  }

  // Update presence state
  async updatePresence(updates: Partial<PresenceState>): Promise<void> {
    if (!this.presenceChannel) return;

    const currentPresence = this.presenceChannel.presenceState()[this.userId];
    if (currentPresence && currentPresence.length > 0) {
      const updatedState = {
        ...currentPresence[0],
        ...updates,
        lastSeen: Date.now()
      };

      await this.presenceChannel.track(updatedState);
    }
  }

  // Get current presence state
  getPresenceState(): Record<string, PresenceState[]> {
    return this.presenceChannel?.presenceState() || {};
  }

  // Get online users
  getOnlineUsers(): string[] {
    const presenceState = this.getPresenceState();
    return Object.keys(presenceState);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    const presenceState = this.getPresenceState();
    return userId in presenceState;
  }

  // Collaborative editing support
  async startEditing(resourceId: string, resourceType: string): Promise<void> {
    await this.updatePresence({
      editing: [...(this.getCurrentEditing() || []), `${resourceType}:${resourceId}`]
    });
  }

  async stopEditing(resourceId: string, resourceType: string): Promise<void> {
    const currentEditing = this.getCurrentEditing() || [];
    const updatedEditing = currentEditing.filter(
      item => item !== `${resourceType}:${resourceId}`
    );

    await this.updatePresence({ editing: updatedEditing });
  }

  getCurrentEditing(): string[] | undefined {
    const presenceState = this.getPresenceState();
    const userPresence = presenceState[this.userId];
    return userPresence?.[0]?.editing;
  }

  // Get users editing a specific resource
  getUsersEditingResource(resourceId: string, resourceType: string): string[] {
    const presenceState = this.getPresenceState();
    const editingUsers: string[] = [];

    Object.entries(presenceState).forEach(([userId, presences]) => {
      const presence = presences[0] as PresenceState;
      if (presence.editing?.includes(`${resourceType}:${resourceId}`)) {
        editingUsers.push(userId);
      }
    });

    return editingUsers;
  }

  // Conflict resolution for simultaneous edits
  async handleConcurrentEdit(
    resourceId: string,
    resourceType: string,
    localChanges: unknown,
    serverData: unknown
  ): Promise<{
    resolved: boolean;
    mergedData?: unknown;
    conflict?: boolean;
    conflictFields?: string[];
  }> {
    // Simple conflict resolution - last write wins
    // In a more sophisticated implementation, this would use operational transforms
    // or more advanced conflict resolution strategies

    const editingUsers = this.getUsersEditingResource(resourceId, resourceType);

    if (editingUsers.length <= 1) {
      // No conflict - only current user editing
      return { resolved: true, mergedData: localChanges };
    }

    // Check for field-level conflicts
    const conflictFields: string[] = [];
    const mergedData = { ...serverData };

    Object.keys(localChanges).forEach(field => {
      if (serverData[field] !== undefined && serverData[field] !== localChanges[field]) {
        conflictFields.push(field);
        // For now, prefer local changes, but mark as conflict
        mergedData[field] = localChanges[field];
      } else {
        mergedData[field] = localChanges[field];
      }
    });

    return {
      resolved: true,
      mergedData,
      conflict: conflictFields.length > 0,
      conflictFields
    };
  }

  // Bulk subscription management
  subscribeToAllPeopleTables(options: Omit<RealtimeSubscriptionOptions, 'table'>): string[] {
    const subscriptions: string[] = [];

    // Subscribe to all relevant tables
    const tables = [
      'people',
      'people_roles',
      'people_competencies',
      'person_competencies',
      'people_endorsements',
      'people_assignments',
      'people_contracts',
      'people_network'
    ];

    tables.forEach(table => {
      const subscriptionId = this.subscribe({
        table,
        ...options,
        filter: `organization_id=eq.${this.orgId}`
      });
      subscriptions.push(subscriptionId);
    });

    return subscriptions;
  }

  // Unsubscribe from specific channel
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelId) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();

    if (this.presenceChannel) {
      this.supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }

  // Connection health monitoring
  getConnectionStatus(): {
    connected: boolean;
    channels: number;
    presenceConnected: boolean;
  } {
    return {
      connected: this.channels.size > 0,
      channels: this.channels.size,
      presenceConnected: this.presenceChannel !== null
    };
  }

  // Private helper methods
  private async getUserEmail(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user?.email || '';
  }

  private handleSubscriptionError(channelId: string, options: RealtimeSubscriptionOptions): void {
    console.error(`Subscription error for channel ${channelId}`);
    if (options.onError) {
      options.onError(new Error(`Subscription failed for ${options.table}`));
    }
  }

  private handleReconnect(channelId: string, options: RealtimeSubscriptionOptions): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.subscribe(options);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error(`Failed to reconnect channel ${channelId} after ${this.maxReconnectAttempts} attempts`);
      if (options.onError) {
        options.onError(new Error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`));
      }
    }
  }

  private handlePresenceSync(presenceState: unknown): void {
    // Handle presence synchronization
  }

  private handlePresenceJoin(key: string, newPresences: unknown[]): void {
  }

  private handlePresenceLeave(key: string, leftPresences: unknown[]): void {
  }

  // Optimistic updates with rollback capability
  async performOptimisticUpdate<T>(
    operation: () => Promise<T>,
    rollback: () => Promise<void>
  ): Promise<{ success: boolean; data?: T; error?: Error }> {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      // Attempt rollback
      try {
        await rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }

      return {
        success: false,
        error: error as Error
      };
    }
  }

  // Batch subscription for analytics
  subscribeToAnalyticsUpdates(onAnalyticsUpdate: (data: unknown) => void): string {
    return this.subscribe({
      table: 'people',
      event: '*',
      onEvent: (payload) => {
        // Trigger analytics recalculation
        this.recalculateAnalytics().then(analytics => {
          onAnalyticsUpdate(analytics);
        });
      }
    });
  }

  private async recalculateAnalytics(): Promise<any> => {
    // Calculate real-time analytics based on current data

// Factory function for realtime service
export function createPeopleRealtimeService(orgId: string, userId: string) {
  return new PeopleRealtimeService(orgId, userId);
}
}
