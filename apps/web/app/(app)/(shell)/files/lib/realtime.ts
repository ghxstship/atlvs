/**
 * Files Real-time Service
 * Manages WebSocket connections and real-time subscriptions
 * Handles live updates, conflict resolution, and presence indicators
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { DigitalAsset } from '../types';

export class FilesRealtimeService {
  private supabase = createClient();
  private channels = new Map<string, RealtimeChannel>();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Initialize real-time service
   */
  async initialize(): Promise<void> {
    try {
      this.connectionStatus = 'connecting';

      // Test connection
      const { error } = await this.supabase
        .from('files')
        .select('id')
        .limit(1);

      if (error) throw error;

      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Failed to initialize real-time service:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Subscribe to file changes
   */
  subscribeToFileChanges(
    orgId: string,
    callback: (payload: RealtimePostgresChangesPayload<DigitalAsset>) => void,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      filter?: string;
    } = {}
  ): string {
    const channelId = `files_${orgId}_${Date.now()}`;

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: 'files',
          filter: options.filter || `organization_id=eq.${orgId}`,
        },
        callback
      )
      .subscribe((status) => {
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Subscribe to folder changes
   */
  subscribeToFolderChanges(
    orgId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
    options: {
      event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
      folderId?: string;
    } = {}
  ): string {
    const channelId = `folders_${orgId}_${Date.now()}`;

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: 'public',
          table: 'file_folders',
          filter: options.folderId
            ? `id=eq.${options.folderId}`
            : `organization_id=eq.${orgId}`,
        },
        callback
      )
      .subscribe((status) => {
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Subscribe to file access logs
   */
  subscribeToAccessLogs(
    orgId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
    fileId?: string
  ): string {
    const channelId = `access_logs_${orgId}_${Date.now()}`;

    const channel = this.supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'file_access_logs',
          filter: fileId
            ? `file_id=eq.${fileId}`
            : `organization_id=eq.${orgId}`,
        },
        callback
      )
      .subscribe((status) => {
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Subscribe to presence (users currently viewing files)
   */
  subscribeToPresence(
    orgId: string,
    userId: string,
    callback: (presence: unknown) => void
  ): string {
    const channelId = `presence_${orgId}_${Date.now()}`;

    const channel = this.supabase
      .channel(channelId)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        callback(presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Subscribe to file-specific presence (who's viewing a specific file)
   */
  subscribeToFilePresence(
    fileId: string,
    userId: string,
    callback: (users: string[]) => void
  ): string {
    const channelId = `file_presence_${fileId}_${Date.now()}`;

    const channel = this.supabase
      .channel(channelId)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState);
        callback(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            file_id: fileId,
            viewing_at: new Date().toISOString(),
          });
        }
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Broadcast file editing state (for collaborative editing)
   */
  broadcastEditingState(
    fileId: string,
    userId: string,
    state: {
      isEditing: boolean;
      cursor?: { line: number; column: number };
      selection?: { start: number; end: number };
    }
  ): void {
    const channelId = `file_editing_${fileId}`;

    if (!this.channels.has(channelId)) {
      const channel = this.supabase.channel(channelId);
      this.channels.set(channelId, channel);

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'editing_state',
            payload: {
              user_id: userId,
              file_id: fileId,
              ...state,
            },
          });
        }
      });
    } else {
      const channel = this.channels.get(channelId)!;
      channel.send({
        type: 'broadcast',
        event: 'editing_state',
        payload: {
          user_id: userId,
          file_id: fileId,
          ...state,
        },
      });
    }
  }

  /**
   * Handle real-time conflict resolution
   */
  async handleConflict(
    fileId: string,
    localVersion: number,
    remoteVersion: number,
    localChanges: unknown,
    remoteChanges: unknown
  ): Promise<{
    resolved: boolean;
    mergedChanges?: unknown;
    conflict?: boolean;
    winner?: 'local' | 'remote';
  }> {
    // Simple conflict resolution: last write wins
    if (localVersion > remoteVersion) {
      return { resolved: true, winner: 'local' };
    } else if (remoteVersion > localVersion) {
      return { resolved: true, winner: 'remote' };
    } else {
      // Same version, attempt merge
      try {
        const merged = this.mergeChanges(localChanges, remoteChanges);
        return { resolved: true, mergedChanges: merged };
      } catch {
        return { resolved: false, conflict: true };
      }
    }
  }

  /**
   * Merge conflicting changes
   */
  private mergeChanges(local: unknown, remote: unknown): unknown {
    // Simple merge strategy - can be enhanced based on specific needs
    const merged = { ...remote };

    // Apply local changes that don't conflict
    Object.keys(local).forEach(key => {
      if (!(key in remote) || remote[key] === local[key]) {
        merged[key] = local[key];
      }
    });

    return merged;
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelId);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelId) => {
      this.supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): typeof this.connectionStatus {
    return this.connectionStatus;
  }

  /**
   * Force reconnection
   */
  async reconnect(): Promise<void> {
    this.unsubscribeAll();
    await this.initialize();
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(async () => {
      await this.reconnect();
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  /**
   * Handle connection state changes
   */
  onConnectionChange(callback: (status: typeof this.connectionStatus) => void): void {
    // In a real implementation, this would set up listeners for connection state
    const checkConnection = () => {
      callback(this.connectionStatus);
    };

    // Check immediately and then periodically
    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Return cleanup function (would be used by caller)
    return () => clearInterval(interval);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(fileId: string, userId: string, isTyping: boolean): void {
    const channelId = `file_typing_${fileId}`;

    if (!this.channels.has(channelId)) {
      const channel = this.supabase.channel(channelId);
      this.channels.set(channelId, channel);

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              user_id: userId,
              file_id: fileId,
              is_typing: isTyping,
              timestamp: new Date().toISOString(),
            },
          });
        }
      });
    } else {
      const channel = this.channels.get(channelId)!;
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userId,
          file_id: fileId,
          is_typing: isTyping,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Cleanup on component unmount
   */
  destroy(): void {
    this.unsubscribeAll();
    this.connectionStatus = 'disconnected';
  }
}

export const filesRealtimeService = new FilesRealtimeService();
