import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { tryCatch, reportError } from '@ghxstship/ui/utils/error-handling';
import type { MarketplaceListing, MarketplaceProject, VendorProfile } from '../types';

// Real-time subscriptions for marketplace operations
export class MarketplaceRealtimeService {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();

  // Listings real-time subscriptions
  subscribeToListings(
    orgId: string,
    callbacks: {
      onInsert?: (listing: MarketplaceListing) => void;
      onUpdate?: (listing: MarketplaceListing) => void;
      onDelete?: (listingId: string) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `marketplace_listings_${orgId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_listings',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceListing>) => {
          try {
            if (payload.new && callbacks.onInsert) {
              callbacks.onInsert(payload.new as MarketplaceListing);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marketplace_listings',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceListing>) => {
          try {
            if (payload.new && callbacks.onUpdate) {
              callbacks.onUpdate(payload.new as MarketplaceListing);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'marketplace_listings',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceListing>) => {
          try {
            if (payload.old && callbacks.onDelete) {
              callbacks.onDelete((payload.old as any).id);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          callbacks.onError?.(new Error('Failed to subscribe to listings channel'));
        }
      });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Projects real-time subscriptions
  subscribeToProjects(
    orgId: string,
    callbacks: {
      onInsert?: (project: MarketplaceProject) => void;
      onUpdate?: (project: MarketplaceProject) => void;
      onDelete?: (projectId: string) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `marketplace_projects_${orgId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_projects',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceProject>) => {
          try {
            if (payload.new && callbacks.onInsert) {
              callbacks.onInsert(payload.new as MarketplaceProject);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'marketplace_projects',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceProject>) => {
          try {
            if (payload.new && callbacks.onUpdate) {
              callbacks.onUpdate(payload.new as MarketplaceProject);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'marketplace_projects',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<MarketplaceProject>) => {
          try {
            if (payload.old && callbacks.onDelete) {
              callbacks.onDelete((payload.old as any).id);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          callbacks.onError?.(new Error('Failed to subscribe to projects channel'));
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Vendors real-time subscriptions
  subscribeToVendors(
    orgId: string,
    callbacks: {
      onInsert?: (vendor: VendorProfile) => void;
      onUpdate?: (vendor: VendorProfile) => void;
      onDelete?: (vendorId: string) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `marketplace_vendors_${orgId}`;

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'opendeck_vendor_profiles',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<VendorProfile>) => {
          try {
            if (payload.new && callbacks.onInsert) {
              callbacks.onInsert(payload.new as VendorProfile);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'opendeck_vendor_profiles',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<VendorProfile>) => {
          try {
            if (payload.new && callbacks.onUpdate) {
              callbacks.onUpdate(payload.new as VendorProfile);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'opendeck_vendor_profiles',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<VendorProfile>) => {
          try {
            if (payload.old && callbacks.onDelete) {
              callbacks.onDelete((payload.old as any).id);
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
        } else if (status === 'CHANNEL_ERROR') {
          callbacks.onError?.(new Error('Failed to subscribe to vendors channel'));
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Combined marketplace subscription
  subscribeToMarketplace(
    orgId: string,
    userId: string,
    callbacks: {
      onListingChange?: (change: { type: 'insert' | 'update' | 'delete'; data: unknown }) => void;
      onProjectChange?: (change: { type: 'insert' | 'update' | 'delete'; data: unknown }) => void;
      onVendorChange?: (change: { type: 'insert' | 'update' | 'delete'; data: unknown }) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to listings
    const listingsUnsubscribe = this.subscribeToListings(orgId, {
      onInsert: (listing) => callbacks.onListingChange?.({ type: 'insert', data: listing }),
      onUpdate: (listing) => callbacks.onListingChange?.({ type: 'update', data: listing }),
      onDelete: (id) => callbacks.onListingChange?.({ type: 'delete', data: { id } }),
      onError: callbacks.onError
    });

    // Subscribe to projects
    const projectsUnsubscribe = this.subscribeToProjects(orgId, {
      onInsert: (project) => callbacks.onProjectChange?.({ type: 'insert', data: project }),
      onUpdate: (project) => callbacks.onProjectChange?.({ type: 'update', data: project }),
      onDelete: (id) => callbacks.onProjectChange?.({ type: 'delete', data: { id } }),
      onError: callbacks.onError
    });

    // Subscribe to vendors
    const vendorsUnsubscribe = this.subscribeToVendors(orgId, {
      onInsert: (vendor) => callbacks.onVendorChange?.({ type: 'insert', data: vendor }),
      onUpdate: (vendor) => callbacks.onVendorChange?.({ type: 'update', data: vendor }),
      onDelete: (id) => callbacks.onVendorChange?.({ type: 'delete', data: { id } }),
      onError: callbacks.onError
    });

    unsubscribers.push(listingsUnsubscribe, projectsUnsubscribe, vendorsUnsubscribe);

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Presence tracking for collaborative features
  subscribeToPresence(
    channelName: string,
    callbacks: {
      onJoin?: (user: unknown) => void;
      onLeave?: (user: unknown) => void;
      onUpdate?: (users: unknown[]) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user'
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const presenceState = channel.presenceState();
          const users = Object.values(presenceState).flat();
          callbacks.onUpdate?.(users);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        try {
          callbacks.onJoin?.(newPresences[0]);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        try {
          callbacks.onLeave?.(leftPresences[0]);
        } catch (error) {
          callbacks.onError?.(error as Error);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Connection status monitoring
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    // Check if any channels are active
    for (const channel of this.channels.values()) {
      if (channel.state === 'joined') {
        return 'connected';
      } else if (channel.state === 'joining') {
        return 'connecting';
      }
    }

    return this.channels.size > 0 ? 'error' : 'disconnected';
  }

  // Cleanup all subscriptions
  cleanup(): void {
    for (const [channelName, channel] of this.channels) {
      channel.unsubscribe();
    }
    this.channels.clear();
  }

  // Reconnect all subscriptions (useful after network issues)
  async reconnect(): Promise<void> {
    // This is a simplified reconnection - in practice, you'd want to
    // re-establish subscriptions with their original callbacks
    // Implementation would depend on how subscriptions are managed
  }
}

export const marketplaceRealtimeService = new MarketplaceRealtimeService();
