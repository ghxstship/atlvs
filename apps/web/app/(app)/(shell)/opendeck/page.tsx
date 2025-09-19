import FeatureGate from '../../../_components/FeatureGate';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import OpenDeckMarketplace from './OpenDeckMarketplace';

export const metadata = { title: 'OPENDECK Marketplace' };

export default async function OpenDeckLanding() {
  const t = await getTranslations('opendeck');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | null = null;
  let userRole: 'vendor' | 'client' | 'both' = 'client';
  
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
    
    // Check if user has vendor profile
    const { data: vendorProfile } = await supabase
      .from('opendeck_vendor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (vendorProfile) {
      userRole = 'both'; // User can switch between vendor and client views
    }
  }

  return (
    <FeatureGate feature="opendeck">
      <div className="stack-md" data-brand="opendeck">
        {orgId && user ? (
          <OpenDeckMarketplace 
            orgId={orgId} 
            userId={user.id}
            userRole={userRole}
          />
        ) : (
          <div className="text-center py-2xl">
            <h2 className="text-heading-3 mb-md">{t('title')}</h2>
            <p className="color-muted">{t('unauthorized')}</p>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
