import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import FeatureGate from '../../../../_components/FeatureGate';

// Dynamically import the MarketplaceCreateClient for better bundle splitting
const MarketplaceCreateClient = dynamic(() => import('./MarketplaceCreateClient'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading marketplace creation...</span>
    </div>
  ),
  ssr: false // Disable SSR for this client component
});

export const metadata = {
  title: 'Create Marketplace Listing',
  description: 'Create a new marketplace listing to connect with potential partners',
};

export default async function MarketplaceCreatePage() {
  const t = await getTranslations('marketplace');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  let orgId: string | null = null;

  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
  }

  if (!orgId || !user) {
    return (
      <FeatureGate feature="ghxstship">
        <div className="brand-marketplace text-center py-2xl">
          <h2 className="text-heading-3 mb-md">{t('unauthorized')}</h2>
          <p className="color-muted">{t('loginRequired')}</p>
        </div>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate feature="ghxstship">
      <div className="stack-md brand-marketplace" data-brand="marketplace">
        <MarketplaceCreateClient orgId={orgId} userId={user.id} />
      </div>
    </FeatureGate>
  );
}
