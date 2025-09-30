import { createBrowserClient } from '@ghxstship/auth';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  RealtimeChannelSendResponse
} from '@supabase/supabase-js';

// Types for real-time management
export type SubscriptionType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface SubscriptionOptions {
  table: string;
  event?: SubscriptionType;
  filter?: string;
  schema?: string;
  debounceMs?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface TypedRealtimePayload<T = any> {
  eventType: SubscriptionType;
  new?: T;
  old?: T;
  commit_timestamp: string;
  errors?: string[];
}

export interface PresenceState {
  userId: string;
  onlineAt: string;
  userInfo?: any;
}

export interface PresenceChannel {
  channelName: string;
  presenceState: Record<string, PresenceState>;
  listeners: ((state: Record<string, PresenceState>) => void)[];
}

export interface ActiveSubscription {
  id: string;
  channel: RealtimeChannel;
  options: SubscriptionOptions;
  callback: (payload: TypedRealtimePayload) => void;
  unsubscribe: () => void;
  retryCount: number;
  lastError?: Error;
  presenceChannel?: PresenceChannel;
}

/**
 * Centralized Real-time Manager
 * Handles reconnection, duplicate subscription prevention, and typed payloads
 */
export class RealtimeManager {
  private supabase = createBrowserClient();
  private subscriptions = new Map<string, ActiveSubscription>();
  private reconnectTimer?: NodeJS.Timeout;
  private isOnline = true;

  constructor() {
    this.setupConnectionMonitoring();
  }

  /**
   * Subscribe to real-time changes with automatic management and optional presence
   */
  subscribe<T = any>(
    subscriptionId: string,
    options: SubscriptionOptions,
    callback: (payload: TypedRealtimePayload<T>) => void,
    enablePresence = false
  ): ActiveSubscription {
    // Prevent duplicate subscriptions
    if (this.subscriptions.has(subscriptionId)) {
      console.warn(`Subscription ${subscriptionId} already exists. Unsubscribing first.`);
      this.unsubscribe(subscriptionId);
    }

    const channel = this.supabase.channel(`${subscriptionId}_${Date.now()}`, {
      config: {
        broadcast: { self: true },
        presence: enablePresence ? { key: subscriptionId } : undefined,
      },
    });

    let presenceChannel: PresenceChannel | undefined;

    // Set up presence tracking if enabled
    if (enablePresence) {
      presenceChannel = {
        channelName: subscriptionId,
        presenceState: {},
        listeners: [],
      };

      // Track presence joins
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        presenceChannel!.presenceState = state as any; // Supabase presence state format
        presenceChannel!.listeners.forEach(listener => listener(state as any));
      });

      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        const state = channel.presenceState();
        presenceChannel!.presenceState = state as any;
        presenceChannel!.listeners.forEach(listener => listener(state as any));
      });

      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        const state = channel.presenceState();
        presenceChannel!.presenceState = state as any;
        presenceChannel!.listeners.forEach(listener => listener(state as any));
      });
    }

    // Set up postgres_changes listener with proper typing
    channel.on(
      'postgres_changes' as any,
      {
        event: options.event || '*',
        schema: options.schema || 'public',
        table: options.table,
        filter: options.filter,
      },
      (payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
        const typedPayload: TypedRealtimePayload<T> = {
          eventType: payload.eventType as SubscriptionType,
          new: payload.new as T | undefined,
          old: payload.old as T | undefined,
          commit_timestamp: payload.commit_timestamp,
          errors: payload.errors,
        };

        // Debounce if configured
        if (options.debounceMs) {
          setTimeout(() => callback(typedPayload), options.debounceMs);
        } else {
          callback(typedPayload);
        }
      }
    );

    // Subscribe with retry logic
    channel.subscribe((status) => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) return;

      if (status === 'SUBSCRIBED') {
        subscription.retryCount = 0;
        subscription.lastError = undefined;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        this.handleSubscriptionError(subscriptionId, subscription, new Error(`Channel ${status}`));
      }
    });

    const subscription: ActiveSubscription = {
      id: subscriptionId,
      channel,
      options,
      callback,
      retryCount: 0,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(subscriptionId);
      },
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Broadcast a message to all subscribers of a channel
   */
  async broadcast(
    channelName: string,
    event: string,
    payload: any
  ): Promise<RealtimeChannelSendResponse> {
    const channel = this.supabase.channel(channelName);
    return channel.send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Track presence for a channel
   */
  trackPresence(channelName: string, userInfo?: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const channel = this.supabase.channel(channelName);
      
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const presenceData = {
            user_id: 'current-user-id', // Would get from auth context
            online_at: new Date().toISOString(),
            user_info: userInfo,
          };

          const response = await channel.track(presenceData);
          const success = response === 'ok';
          resolve({ success, error: success ? undefined : 'Track failed' });
        } else if (status === 'CHANNEL_ERROR') {
          resolve({ success: false, error: 'Channel subscription failed' });
        }
      });
    });
  }

  /**
   * Get presence state for a channel
   */
  getPresenceState(channelName: string): Record<string, any> | null {
    const subscription = this.subscriptions.get(channelName);
    return subscription?.presenceChannel?.presenceState || null;
  }

  /**
   * Subscribe to presence changes for a channel
   */
  subscribeToPresence(
    channelName: string,
    callback: (presenceState: Record<string, any>) => void
  ): (() => void) | null {
    const subscription = this.subscriptions.get(channelName);
    if (!subscription?.presenceChannel) return null;

    subscription.presenceChannel.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = subscription.presenceChannel!.listeners.indexOf(callback);
      if (index > -1) {
        subscription.presenceChannel!.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Untrack presence (go offline)
   */
  untrackPresence(channelName: string): Promise<void> {
    return new Promise((resolve) => {
      const channel = this.supabase.channel(channelName);
      
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.untrack();
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          resolve(); // Still resolve even on error
        }
      });
    });
  }

  /**
   * Force reconnection for all subscriptions
   */
  async reconnect(): Promise<void> {
    console.log('Reconnecting all real-time subscriptions...');

    // Store current subscriptions
    const currentSubscriptions = Array.from(this.subscriptions.entries());

    // Unsubscribe all
    this.unsubscribeAll();

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Resubscribe
    currentSubscriptions.forEach(([id, subscription]) => {
      this.subscribe(id, subscription.options, subscription.callback);
    });
  }

  /**
   * Handle subscription errors with retry logic
   */
  private handleSubscriptionError(
    subscriptionId: string,
    subscription: ActiveSubscription,
    error: Error
  ): void {
    subscription.lastError = error;
    subscription.retryCount++;

    const maxRetries = subscription.options.retryAttempts || 3;
    const retryDelay = subscription.options.retryDelay || 1000 * subscription.retryCount;

    if (subscription.retryCount <= maxRetries) {
      console.warn(
        `Retrying subscription ${subscriptionId} (attempt ${subscription.retryCount}/${maxRetries}) in ${retryDelay}ms`
      );

      setTimeout(() => {
        this.unsubscribe(subscriptionId);
        this.subscribe(subscriptionId, subscription.options, subscription.callback);
      }, retryDelay);
    } else {
      console.error(`Max retries exceeded for subscription ${subscriptionId}:`, error);
      // Could emit an error event here
    }
  }

  /**
   * Monitor connection status and handle reconnections
   */
  private setupConnectionMonitoring(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (this.subscriptions.size > 0) {
        this.reconnect();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Periodic health check
    setInterval(() => {
      if (this.isOnline && this.subscriptions.size > 0) {
        // Check if any subscriptions are in error state
        this.subscriptions.forEach((subscription, id) => {
          if (subscription.channel.state === 'closed' || subscription.lastError) {
            console.warn(`Detected unhealthy subscription ${id}, attempting recovery...`);
            this.handleSubscriptionError(id, subscription, subscription.lastError || new Error('Channel closed'));
          }
        });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    isOnline: boolean;
    activeSubscriptions: number;
    unhealthySubscriptions: number;
  } {
    let unhealthySubscriptions = 0;
    this.subscriptions.forEach((subscription) => {
      if (subscription.channel.state !== 'joined' || subscription.lastError) {
        unhealthySubscriptions++;
      }
    });

    return {
      isOnline: this.isOnline,
      activeSubscriptions: this.subscriptions.size,
      unhealthySubscriptions,
    };
  }
}

// Singleton instance
let realtimeManager: RealtimeManager | null = null;

export function getRealtimeManager(): RealtimeManager {
  if (!realtimeManager) {
    realtimeManager = new RealtimeManager();
  }
  return realtimeManager;
}

// Utility function for creating typed subscriptions with optional presence
export function createTypedSubscription<T = any>(
  subscriptionId: string,
  options: SubscriptionOptions,
  callback: (payload: TypedRealtimePayload<T>) => void,
  enablePresence = false
): ActiveSubscription {
  return getRealtimeManager().subscribe<T>(subscriptionId, options, callback, enablePresence);
}

// Utility function for presence tracking
export function trackUserPresence(channelName: string, userInfo?: any) {
  return getRealtimeManager().trackPresence(channelName, userInfo);
}

// Utility function for getting presence state
export function getChannelPresence(channelName: string) {
  return getRealtimeManager().getPresenceState(channelName);
}
