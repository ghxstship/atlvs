import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ReportsClient from './ReportsClient';

export const metadata = { title: 'Analytics · Reports' };

export default async function AnalyticsReportsPage() {
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
    <ReportsClient 
      organizationId={profile.organization_id}
      translations={{
        title: t('reports.title'),
        builder: t('reports.builder'),
        schedule: t('reports.schedule'),
        create: t('reports.create')
      }}
    />
  );
}
