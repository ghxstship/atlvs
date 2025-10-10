// Edge Runtime stub for @supabase/realtime-js
// This module is not used in middleware (only auth.getSession() is needed)
// Providing a stub prevents import errors in Edge Runtime

export class RealtimeClient {
  constructor() {
    throw new Error('@supabase/realtime-js is not available in Edge Runtime')
  }
}

export class RealtimeChannel {
  constructor() {
    throw new Error('@supabase/realtime-js is not available in Edge Runtime')
  }
}

export default {
  RealtimeClient,
  RealtimeChannel,
}
