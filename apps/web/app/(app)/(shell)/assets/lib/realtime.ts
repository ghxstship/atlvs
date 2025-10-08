/**
 * Assets Real-time Subscriptions
 * Supabase real-time integration for live asset updates
 */

import { createBrowserClient } from '@ghxstship/auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createBrowserClient();

export interface AssetChangePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
}

/**
 * Subscribe to asset changes for an organization
 */
export function subscribeToAssets(
  organizationId: string,
  callback: (payload: AssetChangePayload) => void
): RealtimeChannel {
  return supabase
    .channel(`assets-${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assets',
        filter: `organization_id=eq.${organizationId}`
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        });
      }
    )
    .subscribe();
}

/**
 * Subscribe to specific asset changes
 */
export function subscribeToAsset(
  assetId: string,
  callback: (payload: AssetChangePayload) => void
): RealtimeChannel {
  return supabase
    .channel(`asset-${assetId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'assets',
        filter: `id=eq.${assetId}`
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old
        });
      }
    )
    .subscribe();
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}
