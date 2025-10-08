import { createBrowserClient } from '@ghxstship/auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createBrowserClient();

export type ProfileChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export interface ProfileChangePayload {
  eventType: ProfileChangeEvent;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
}

export function subscribeToProfiles(
  orgId: string,
  callback: (payload: ProfileChangePayload) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profiles:${orgId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        callback({
          eventType: payload.eventType as ProfileChangeEvent,
          new: payload.new as Record<string, unknown> | null,
          old: payload.old as Record<string, unknown> | null
        });
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToProfile(
  id: string,
  callback: (payload: ProfileChangePayload) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profile:${id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${id}`
      },
      (payload) => {
        callback({
          eventType: payload.eventType as ProfileChangeEvent,
          new: payload.new as Record<string, unknown> | null,
          old: payload.old as Record<string, unknown> | null
        });
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

export function subscribeToProfileInserts(
  orgId: string,
  callback: (profile: Record<string, unknown>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profiles:inserts:${orgId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_profiles',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Record<string, unknown>);
        }
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToProfileUpdates(
  orgId: string,
  callback: (profile: Record<string, unknown>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profiles:updates:${orgId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new as Record<string, unknown>);
        }
      }
    )
    .subscribe();

  return channel;
}

export function subscribeToProfileDeletes(
  orgId: string,
  callback: (profile: Record<string, unknown>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`profiles:deletes:${orgId}`)
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'user_profiles',
        filter: `organization_id=eq.${orgId}`
      },
      (payload) => {
        if (payload.old) {
          callback(payload.old as Record<string, unknown>);
        }
      }
    )
    .subscribe();

  return channel;
}
