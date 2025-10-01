import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import FeatureGate from '../../../../_components/FeatureGate';
import MarketplaceDetailClient from './MarketplaceDetailClient';

export const dynamic = 'force-dynamic';


interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const t = await getTranslations('marketplace');

  return {
    title: `Marketplace Listing | ${t('title')}`,
    description: 'View marketplace listing details and connect with partners',
  };
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
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

  if (!orgId) {
    return (
      <FeatureGate feature="marketplace">
        <div className="brand-marketplace text-center py-xsxl">
          <h2 className="text-heading-3 mb-md">{t('unauthorized')}</h2>
          <p className="color-muted">{t('loginRequired')}</p>
        </div>
      </FeatureGate>
    );
  }

  // Check if listing exists and user has access
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      organization:organizations(id, name, slug),
      creator:users!marketplace_listings_created_by_fkey(id, name, email)
    `)
    .eq('organization_id', orgId)
    .eq('id', params.id)
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  return (
    <FeatureGate feature="marketplace">
      <div className="stack-md brand-marketplace" data-brand="marketplace">
        <MarketplaceDetailClient
          orgId={orgId}
          userId={user?.id || ''}
          listingId={params.id}
          initialListing={listing}
        />
      </div>
    </FeatureGate>
  );
}
