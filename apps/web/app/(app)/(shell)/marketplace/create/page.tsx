import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import dynamicImport from 'next/dynamic';
import FeatureGate from '../../../../_components/FeatureGate';

export const dynamic = 'force-dynamic';


// Dynamically import the MarketplaceCreateClient for better bundle splitting
const MarketplaceCreateClient = dynamicImport(() => import('./MarketplaceCreateClient'), {
  loading: () => (
    <div className="flex items-center justify-center p-xl">
      <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading marketplace creation...</span>
    </div>
  ),
});

export const metadata = {
  title: 'Create Marketplace Listing',
  description: 'Create a new marketplace listing to connect with potential partners',
};

export default async function MarketplaceCreatePage() {
  const t = await getTranslations('marketplace');
  const cookieStore = await cookies();
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
        <div className="brand-marketplace text-center py-xsxl">
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
