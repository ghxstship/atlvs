/**
 * Supabase Client - Infrastructure Layer
 * Centralized database client configuration
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/domain';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type SupabaseClient = typeof supabase;
