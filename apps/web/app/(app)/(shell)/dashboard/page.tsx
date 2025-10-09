import React from 'react';
import DashboardClient from './DashboardClient';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  // Get organization from server-side auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's organization from metadata or use default
  const orgId = user?.user_metadata?.organization_id || 'default-org';

  return <DashboardClient orgId={orgId} />;
}
