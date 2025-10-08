/**
 * Companies Realtime Service
 * Manages real-time subscriptions and live data synchronization
 * Handles Supabase realtime channels, presence, and conflict resolution
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Company } from '../types';

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: unknown;
  old_record?: unknown;
}

export interface PresenceState {
  user_id: string;
  company_id?: string;
  action: 'viewing' | 'editing';
  timestamp: number;
}

export class CompaniesRealtimeService {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceChannels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to company changes
   */
  subscribeToCompanyChanges(
    orgId: string,
    callbacks: {
      onInsert?: (record: Company) => void;
      onUpdate?: (record: Company, oldRecord?: Company) => void;
      onDelete?: (record: Company) => void;
      onError?: (error: Error) => void;
    }
  ): () => void {
    const channelName = `companies:${orgId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'companies',
          filter: `organization_id=eq.${orgId}`
        },
        (payload: RealtimePostgresChangesPayload<Company>) => {
          try {
            switch (payload.eventType) {
              case 'INSERT':
                callbacks.onInsert?.(payload.new as Company);
                break;
              case 'UPDATE':
                callbacks.onUpdate?.(payload.new as Company, payload.old as Company);
                break;
              case 'DELETE':
                callbacks.onDelete?.(payload.old as Company);
                break;
            }
          } catch (error) {
            callbacks.onError?.(error as Error);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Subscribe to company-related tables
   */
  subscribeToRelatedChanges(
    orgId: string,
    callbacks: {
      onContractChange?: (event: RealtimeEvent) => void;
      onQualificationChange?: (event: RealtimeEvent) => void;
      onRatingChange?: (event: RealtimeEvent) => void;
      onContactChange?: (event: RealtimeEvent) => void;
    }
  ): () => void {
    const channelName = `companies_related:${orgId}`;

    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase.channel(channelName);

    // Contracts
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'company_contracts',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        callbacks.onContractChange?.({
          type: payload.eventType,
          table: 'company_contracts',
          record: payload.new,
          old_record: payload.old
        });
      }
    );

    // Qualifications
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'company_qualifications',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        callbacks.onQualificationChange?.({
          type: payload.eventType,
          table: 'company_qualifications',
          record: payload.new,
          old_record: payload.old
        });
      }
    );

    // Ratings
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'company_ratings',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        callbacks.onRatingChange?.({
          type: payload.eventType,
          table: 'company_ratings',
          record: payload.new,
          old_record: payload.old
        });
      }
    );

    // Contacts
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'company_contacts',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        callbacks.onContactChange?.({
          type: payload.eventType,
          table: 'company_contacts',
          record: payload.new,
          old_record: payload.old
        });
      }
    );

    channel.subscribe();
    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Presence tracking for collaborative editing
   */
  trackPresence(
    orgId: string,
    userId: string,
    companyId?: string,
    callbacks?: {
      onJoin?: (key: string, currentPresence: PresenceState) => void;
      onLeave?: (key: string, currentPresence: PresenceState) => void;
      onSync?: () => void;
    }
  ): () => void {
    const channelName = `presence:${orgId}`;

    if (this.presenceChannels.has(channelName)) {
      this.presenceChannels.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        callbacks?.onSync?.();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: PresenceState) => {
          callbacks?.onJoin?.(key, presence);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: PresenceState) => {
          callbacks?.onLeave?.(key, presence);
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            company_id: companyId,
            action: companyId ? 'editing' : 'viewing',
            timestamp: Date.now()
          });
        }
      });

    this.presenceChannels.set(channelName, channel);

    return () => {
      channel.untrack();
      channel.unsubscribe();
      this.presenceChannels.delete(channelName);
    };
  }

  /**
   * Get current presence state
   */
  getPresenceState(orgId: string): Promise<Record<string, PresenceState[]>> {
    const channel = this.presenceChannels.get(`presence:${orgId}`);
    if (!channel) {
      return Promise.resolve({});
    }

    return new Promise((resolve) => {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        resolve(state as Record<string, PresenceState[]>);
      });
    });
  }

  /**
   * Broadcast custom events
   */
  broadcastEvent(orgId: string, event: string, payload: unknown): void {
    const channel = this.channels.get(`companies:${orgId}`);
    channel?.send({
      type: 'broadcast',
      event,
      payload
    });
  }

  /**
   * Conflict resolution for concurrent edits
   */
  resolveConflict(
    localRecord: Company,
    remoteRecord: Company,
    lastSyncVersion: number
  ): { resolved: Company; conflicts: string[] } {
    const conflicts: string[] = [];
    const resolved = { ...remoteRecord };

    // Compare timestamps
    const localTime = new Date(localRecord.updated_at || 0).getTime();
    const remoteTime = new Date(remoteRecord.updated_at || 0).getTime();

    // Last-write-wins for most fields
    const fields = ['name', 'description', 'industry', 'status', 'email', 'phone', 'website'] as const;

    fields.forEach(field => {
      if (localRecord[field] !== remoteRecord[field]) {
        conflicts.push(`${field}: local='${localRecord[field]}', remote='${remoteRecord[field]}'`);

        // Use the most recent change
        if (localTime > remoteTime) {
          resolved[field] = localRecord[field];
        }
      }
    });

    return { resolved, conflicts };
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.presenceChannels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
    this.presenceChannels.clear();
  }

  /**
   * Health check for realtime connections
   */
  async healthCheck(orgId: string): Promise<{ connected: boolean; latency?: number }> {
    const start = Date.now();

    try {
      const channel = this.supabase.channel(`health_check_${Date.now()}`);
      await new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve();
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            reject(new Error('Connection failed'));
          }
        });
      });

      channel.unsubscribe();
      const latency = Date.now() - start;

      return { connected: true, latency };
    } catch (error) {
      return { connected: false };
    }
  }
}

export const companiesRealtimeService = new CompaniesRealtimeService();
