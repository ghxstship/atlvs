import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import OverviewClient from './OverviewClient';

export const metadata = {
  title: 'Analytics Overview',
};

export default async function AnalyticsOverviewPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect('/auth/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', data.user.id)
    .single();

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  const t = await getTranslations('analytics');

  return (
    <OverviewClient 
      organizationId={profile.organization_id}
      translations={{
        title: t('overview.title'),
        metrics: t('overview.metrics'),
        activity: t('overview.activity'),
        performers: t('overview.performers')
      }}
    />
  );
}
