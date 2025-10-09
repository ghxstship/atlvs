import React from 'react';
import OpenDeckClient from './OpenDeckClient';
import { createClient } from '@/lib/supabase/server';

export default async function OpenDeckPage() {
  // Get organization from server-side auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's organization from metadata or use default
  const orgId = user?.user_metadata?.organization_id || 'default-org';

  return <OpenDeckClient orgId={orgId} />;
}
