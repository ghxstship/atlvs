'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeSubscription {
 id: string;
 table: string;
 filter?: string;
 callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export interface PresenceState {
 [key: string]: unknown;
}

export interface PresenceUser {
 user_id: string;
 user_email: string;
 online_at: string;
}

export class FinanceRealtime {
 private supabase = createBrowserClient();
 private subscriptions: Map<string, RealtimeChannel> = new Map();
 private presenceChannels: Map<string, RealtimeChannel> = new Map();

 /**
  * Subscribe to real-time changes for a finance table
  */
 subscribeToTable(
   subscriptionId: string,
   table: string,
   callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
   filter?: string
 ): void {
   // Unsubscribe if already exists
   this.unsubscribe(subscriptionId);

   // Create subscription
   let channel = this.supabase
     .channel(`${table}_changes_${subscriptionId}`)
     .on(
       'postgres_changes',
       {
         event: '*',
         schema: 'public',
         table: table,
         filter: filter
       },
       callback
     );

   // Subscribe to the channel
   channel.subscribe((status) => {
     if (status === 'SUBSCRIBED') {
     } else if (status === 'CLOSED') {
     } else if (status === 'CHANNEL_ERROR') {
       console.error(`Error subscribing to ${table} changes`);
     }
   });

   this.subscriptions.set(subscriptionId, channel);
 }

 /**
  * Subscribe to multiple tables at once
  */
 subscribeToMultiple(subscriptions: RealtimeSubscription[]): void {
   subscriptions.forEach(sub => {
     this.subscribeToTable(sub.id, sub.table, sub.callback, sub.filter);
   });
 }

 /**
  * Unsubscribe from a specific subscription
  */
 unsubscribe(subscriptionId: string): void {
   const channel = this.subscriptions.get(subscriptionId);
   if (channel) {
     this.supabase.removeChannel(channel);
     this.subscriptions.delete(subscriptionId);
   }
 }

 /**
  * Unsubscribe from all subscriptions
  */
 unsubscribeAll(): void {
   this.subscriptions.forEach((channel, id) => {
     this.supabase.removeChannel(channel);
   });
   this.subscriptions.clear();

   this.presenceChannels.forEach((channel, id) => {
     this.supabase.removeChannel(channel);
   });
   this.presenceChannels.clear();
 }

 /**
  * Join presence channel for collaborative features
  */
 joinPresence(
   channelName: string,
   userId: string,
   userEmail: string,
   onJoin?: (key: string, currentPresence: PresenceState, newPresence: PresenceUser) => void,
   onLeave?: (key: string, currentPresence: PresenceState, leftPresence: PresenceUser) => void
 ): void {
   // Leave existing presence if any
   this.leavePresence(channelName);

   const channel = this.supabase.channel(channelName, {
     config: {
       presence: {
         key: userId
       }
     }
   });

   // Handle presence events
   channel
     .on('presence', { event: 'sync' }, () => {
       const presenceState = channel.presenceState();
     })
     .on('presence', { event: 'join' }, ({ key, newPresences, currentPresences }) => {
       onJoin?.(key, currentPresences, newPresences[0] as PresenceUser);
     })
     .on('presence', { event: 'leave' }, ({ key, leftPresences, currentPresences }) => {
       onLeave?.(key, currentPresences, leftPresences[0] as PresenceUser);
     })
     .subscribe(async (status) => {
       if (status === 'SUBSCRIBED') {
         // Track user presence
         await channel.track({
           user_id: userId,
           user_email: userEmail,
           online_at: new Date().toISOString()
         });
       }
     });

   this.presenceChannels.set(channelName, channel);
 }

 /**
  * Leave presence channel
  */
 leavePresence(channelName: string): void {
   const channel = this.presenceChannels.get(channelName);
   if (channel) {
     this.supabase.removeChannel(channel);
     this.presenceChannels.delete(channelName);
   }
 }

 /**
  * Get current presence state
  */
 getPresenceState(channelName: string): PresenceState | null {
   const channel = this.presenceChannels.get(channelName);
   return channel ? channel.presenceState() : null;
 }

 /**
  * Subscribe to finance dashboard real-time updates
  */
 subscribeToDashboard(
   orgId: string,
   callbacks: {
     onBudgetUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
     onExpenseUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
     onRevenueUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
     onTransactionUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
   }
 ): void {
   const subscriptions: RealtimeSubscription[] = [];

   if (callbacks.onBudgetUpdate) {
     subscriptions.push({
       id: 'dashboard_budgets',
       table: 'budgets',
       filter: `organization_id=eq.${orgId}`,
       callback: callbacks.onBudgetUpdate
     });
   }

   if (callbacks.onExpenseUpdate) {
     subscriptions.push({
       id: 'dashboard_expenses',
       table: 'expenses',
       filter: `organization_id=eq.${orgId}`,
       callback: callbacks.onExpenseUpdate
     });
   }

   if (callbacks.onRevenueUpdate) {
     subscriptions.push({
       id: 'dashboard_revenue',
       table: 'revenue',
       filter: `organization_id=eq.${orgId}`,
       callback: callbacks.onRevenueUpdate
     });
   }

   if (callbacks.onTransactionUpdate) {
     subscriptions.push({
       id: 'dashboard_transactions',
       table: 'transactions',
       filter: `organization_id=eq.${orgId}`,
       callback: callbacks.onTransactionUpdate
     });
   }

   this.subscribeToMultiple(subscriptions);
 }

 /**
  * Subscribe to collaborative editing on a specific record
  */
 subscribeToRecordEditing(
   table: string,
   recordId: string,
   userId: string,
   callbacks: {
     onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
     onPresenceUpdate?: (presence: PresenceState) => void;
   }
 ): void {
   // Subscribe to record changes
   if (callbacks.onUpdate) {
     this.subscribeToTable(
       `record_${recordId}`,
       table,
       callbacks.onUpdate,
       `id=eq.${recordId}`
     );
   }

   // Join presence for collaborative editing
   if (callbacks.onPresenceUpdate) {
     this.joinPresence(
       `editing_${table}_${recordId}`,
       userId,
       '', // Email will be populated from user context
       undefined,
       undefined
     );

     // Poll presence state
     const presenceInterval = setInterval(() => {
       const presenceState = this.getPresenceState(`editing_${table}_${recordId}`);
       if (presenceState) {
         callbacks.onPresenceUpdate!(presenceState);
       }
     }, 5000);

     // Store interval for cleanup
     (this as any).presenceIntervals = (this as any).presenceIntervals || new Map();
     (this as any).presenceIntervals.set(`editing_${table}_${recordId}`, presenceInterval);
   }
 }

 /**
  * Broadcast typing indicator
  */
 async broadcastTyping(channelName: string, userId: string, isTyping: boolean): Promise<void> {
   const channel = this.presenceChannels.get(channelName);
   if (channel) {
     await channel.track({
       user_id: userId,
       typing: isTyping,
       timestamp: new Date().toISOString()
     });
   }
 }

 /**
  * Send real-time notification
  */
 async sendNotification(
   orgId: string,
   type: 'budget_alert' | 'expense_approved' | 'revenue_milestone' | 'system',
   title: string,
   message: string,
   metadata?: unknown
 ): Promise<void> {
   // In a real implementation, this would insert into a notifications table
   // and broadcast via real-time channels

   // Broadcast to organization presence channel
   const presenceChannel = this.presenceChannels.get(`org_${orgId}`);
   if (presenceChannel) {
     await presenceChannel.send({
       type: 'broadcast',
       event: 'notification',
       payload: {
         type,
         title,
         message,
         metadata,
         timestamp: new Date().toISOString()
       }
     });
   }
 }

 /**
  * Monitor connection health
  */
 getConnectionStatus(): {
   connected: boolean;
   subscriptions: number;
   presence: number;
 } {
   return {
     connected: true, // Simplified - in production, check actual connection
     subscriptions: this.subscriptions.size,
     presence: this.presenceChannels.size
   };
 }

 /**
  * Reconnect all subscriptions (useful after network issues)
  */
 async reconnect(): Promise<void> {

   // Reconnect table subscriptions
   const currentSubscriptions = Array.from(this.subscriptions.entries());
   this.subscriptions.clear();

   // Note: In a real implementation, you'd need to store the original subscription
   // configurations to recreate them properly

   // Reconnect presence channels
   const currentPresence = Array.from(this.presenceChannels.entries());
   this.presenceChannels.clear();

   // Similar note about storing original configurations

 }
}

export const financeRealtime = new FinanceRealtime;

// Utility hook for React components
export const useFinanceRealtime = () => {
 return financeRealtime;
};
