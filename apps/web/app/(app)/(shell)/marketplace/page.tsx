import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import FeatureGate from '../../../_components/FeatureGate';
import { Metadata } from 'next';
import MarketplaceOverviewClient from './MarketplaceOverviewClient';

export const metadata: Metadata = {
  title: 'Marketplace Overview',
  description: 'Enterprise marketplace platform for business-to-business transactions, vendor management, and project collaboration.',
};

export default async function MarketplaceOverviewPage() {
  const t = await getTranslations('marketplace');
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
      userRole = 'both';
    }
  }

  return (
    <FeatureGate feature="marketplace">
      <div className="stack-md brand-marketplace" data-brand="marketplace">
        {orgId && user ? (
          <MarketplaceOverviewClient
            orgId={orgId}
            userId={user.id}
            userRole={userRole}
          />
        ) : (
          <div className="brand-marketplace text-center py-xsxl">
            <h2 className="text-heading-3 mb-md">{t('title')}</h2>
            <p className="color-muted">{t('unauthorized')}</p>
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
