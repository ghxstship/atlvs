import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import DashboardsClient from './DashboardsClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Analytics · Dashboards' };

export default async function AnalyticsDashboardsPage() {
  const cookieStore = await cookies();
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
    <DashboardsClient 
      organizationId={profile.organization_id}
      translations={{
        title: t('dashboards.title'),
        widgets: t('dashboards.widgets'),
        create: t('dashboards.create'),
        manage: t('dashboards.manage')
      }}
    />
  );
}
