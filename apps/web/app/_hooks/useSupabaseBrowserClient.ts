'use client';

import { useMemo } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function useSupabaseBrowserClient(): SupabaseClient {
  return useMemo(() => createBrowserClient(), []);
}
