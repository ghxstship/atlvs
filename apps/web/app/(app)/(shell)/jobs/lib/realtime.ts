// Jobs Real-time Service
// Real-time subscriptions and live updates for Jobs module

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type {
  Job,
  JobAssignment,
  Opportunity,
  Bid,
  JobContract,
  JobCompliance,
  RFP
} from '../types';

export interface RealtimeSubscriptionOptions {
  organizationId: string;
  userId: string;
  onJobUpdate?: (payload: RealtimePostgresChangesPayload<Job>) => void;
  onAssignmentUpdate?: (payload: RealtimePostgresChangesPayload<JobAssignment>) => void;
  onOpportunityUpdate?: (payload: RealtimePostgresChangesPayload<Opportunity>) => void;
  onBidUpdate?: (payload: RealtimePostgresChangesPayload<Bid>) => void;
  onContractUpdate?: (payload: RealtimePostgresChangesPayload<JobContract>) => void;
  onComplianceUpdate?: (payload: RealtimePostgresChangesPayload<JobCompliance>) => void;
  onRfpUpdate?: (payload: RealtimePostgresChangesPayload<RFP>) => void;
  onConnectionStateChange?: (state: 'connected' | 'connecting' | 'disconnected' | 'error') => void;
}

export interface PresenceState {
  user_id: string;
  user_name: string;
  online_at: string;
  current_view?: string;
  current_job_id?: string;
}

export class JobsRealtimeService {
  private supabase = createClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private connectionState: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  subscribeToJobs(options: RealtimeSubscriptionOptions): () => void {
    const channelName = `jobs-${options.organizationId}`;

    // Remove existing subscription if it exists
    this.unsubscribeFromJobs();

    const channel = this.supabase.channel(channelName, {
      config: {
        presence: {
          key: options.userId,
        },
      },
    });

    // Jobs table changes
    if (options.onJobUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `organization_id=eq.${options.organizationId}`
        },
        options.onJobUpdate
      );
    }

    // Assignments table changes
    if (options.onAssignmentUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_assignments'
        },
        (payload) => {
          // Filter assignments for jobs in this organization
          this.filterAssignmentByOrganization(payload, options.organizationId)
            .then(filtered => {
              if (filtered && options.onAssignmentUpdate) {
                options.onAssignmentUpdate(filtered);
              }
            });
        }
      );
    }

    // Opportunities table changes
    if (options.onOpportunityUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunities',
          filter: `organization_id=eq.${options.organizationId}`
        },
        options.onOpportunityUpdate
      );
    }

    // Bids table changes
    if (options.onBidUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_bids'
        },
        (payload) => {
          // Filter bids for opportunities in this organization
          this.filterBidByOrganization(payload, options.organizationId)
            .then(filtered => {
              if (filtered && options.onBidUpdate) {
                options.onBidUpdate(filtered);
              }
            });
        }
      );
    }

    // Contracts table changes
    if (options.onContractUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_contracts'
        },
        (payload) => {
          // Filter contracts for jobs in this organization
          this.filterContractByOrganization(payload, options.organizationId)
            .then(filtered => {
              if (filtered && options.onContractUpdate) {
                options.onContractUpdate(filtered);
              }
            });
        }
      );
    }

    // Compliance table changes
    if (options.onComplianceUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_compliance'
        },
        (payload) => {
          // Filter compliance for jobs in this organization
          this.filterComplianceByOrganization(payload, options.organizationId)
            .then(filtered => {
            if (filtered && options.onComplianceUpdate) {
              options.onComplianceUpdate(filtered);
            }
          });
        }
      );
    }

    // RFPs table changes
    if (options.onRfpUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rfps',
          filter: `organization_id=eq.${options.organizationId}`
        },
        options.onRfpUpdate
      );
    }

    // Connection state monitoring
    channel.on('system', {}, (payload) => {
      this.updateConnectionState(payload as any, options.onConnectionStateChange);
    });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;

        // Track presence
        await channel.track({
          user_id: options.userId,
          online_at: new Date().toISOString(),
        });

        options.onConnectionStateChange?.('connected');
      } else if (status === 'CHANNEL_ERROR') {
        this.connectionState = 'error';
        options.onConnectionStateChange?.('error');
        this.handleReconnection(options);
      } else if (status === 'TIMED_OUT') {
        this.connectionState = 'disconnected';
        options.onConnectionStateChange?.('disconnected');
        this.handleReconnection(options);
      } else if (status === 'CLOSED') {
        this.connectionState = 'disconnected';
        options.onConnectionStateChange?.('disconnected');
      }
    });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribeFromJobs();
  }

  unsubscribeFromJobs(): void {
    this.channels.forEach((channel, channelName) => {
      if (channelName.startsWith('jobs-')) {
        this.supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    });
  }

  // ============================================================================
  // PRESENCE TRACKING
  // ============================================================================

  async updatePresence(options: RealtimeSubscriptionOptions, presenceData: Partial<PresenceState>): Promise<void> {
    const channelName = `jobs-${options.organizationId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.track({
        user_id: options.userId,
        user_name: '', // Would be populated from user profile
        online_at: new Date().toISOString(),
        ...presenceData
      });
    }
  }

  subscribeToPresence(options: RealtimeSubscriptionOptions): () => void {
    const channelName = `jobs-${options.organizationId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      // Listen for presence events
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
      });

      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      });

      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      });
    }

    return () => {
      // Presence cleanup is handled by main unsubscribe
    };
  }

  // ============================================================================
  // FILTERING HELPERS
  // ============================================================================

  private async filterAssignmentByOrganization(
    payload: RealtimePostgresChangesPayload<JobAssignment>,
    organizationId: string
  ): Promise<RealtimePostgresChangesPayload<JobAssignment> | null> {
    if (!payload.new?.job_id && !payload.old?.job_id) return null;

    const jobId = payload.new?.job_id || payload.old?.job_id;
    const { data: job } = await this.supabase
      .from('jobs')
      .select('organization_id')
      .eq('id', jobId)
      .single();

    return job?.organization_id === organizationId ? payload : null;
  }

  private async filterBidByOrganization(
    payload: RealtimePostgresChangesPayload<Bid>,
    organizationId: string
  ): Promise<RealtimePostgresChangesPayload<Bid> | null> {
    if (!payload.new?.opportunity_id && !payload.old?.opportunity_id) return null;

    const opportunityId = payload.new?.opportunity_id || payload.old?.opportunity_id;
    const { data: opportunity } = await this.supabase
      .from('opportunities')
      .select('organization_id')
      .eq('id', opportunityId)
      .single();

    return opportunity?.organization_id === organizationId ? payload : null;
  }

  private async filterContractByOrganization(
    payload: RealtimePostgresChangesPayload<JobContract>,
    organizationId: string
  ): Promise<RealtimePostgresChangesPayload<JobContract> | null> {
    if (!payload.new?.job_id && !payload.old?.job_id) return null;

    const jobId = payload.new?.job_id || payload.old?.job_id;
    const { data: job } = await this.supabase
      .from('jobs')
      .select('organization_id')
      .eq('id', jobId)
      .single();

    return job?.organization_id === organizationId ? payload : null;
  }

  private async filterComplianceByOrganization(
    payload: RealtimePostgresChangesPayload<JobCompliance>,
    organizationId: string
  ): Promise<RealtimePostgresChangesPayload<JobCompliance> | null> {
    if (!payload.new?.job_id && !payload.old?.job_id) return null;

    const jobId = payload.new?.job_id || payload.old?.job_id;
    const { data: job } = await this.supabase
      .from('jobs')
      .select('organization_id')
      .eq('id', jobId)
      .single();

    return job?.organization_id === organizationId ? payload : null;
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  private updateConnectionState(
    payload: unknown,
    onConnectionStateChange?: (state: 'connected' | 'connecting' | 'disconnected' | 'error') => void
  ): void {
    const newState = payload.event || 'unknown';

    switch (newState) {
      case 'connected':
        this.connectionState = 'connected';
        break;
      case 'connecting':
        this.connectionState = 'connecting';
        break;
      case 'disconnected':
        this.connectionState = 'disconnected';
        break;
      case 'error':
        this.connectionState = 'error';
        break;
    }

    onConnectionStateChange?.(this.connectionState);
  }

  private handleReconnection(options: RealtimeSubscriptionOptions): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      this.subscribeToJobs(options);
    }, delay);
  }

  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================

  getConnectionState(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    return this.connectionState;
  }

  getConnectionStats(): {
    state: string;
    reconnectAttempts: number;
    activeChannels: number;
  } {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      activeChannels: this.channels.size
    };
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    this.channels.forEach(channel => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.connectionState = 'disconnected';
  }
}
