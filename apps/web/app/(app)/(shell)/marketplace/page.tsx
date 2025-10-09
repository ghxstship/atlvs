import React from 'react';
import MarketplaceClient from './MarketplaceClient';
import { createClient } from '@/lib/supabase/server';

export default async function MarketplacePage() {
  // Get organization from server-side auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's organization from metadata or use default
  const orgId = user?.user_metadata?.organization_id || 'default-org';

  return <MarketplaceClient orgId={orgId} />;
}
