import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ExportsClient from './ExportsClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Analytics · Exports' };

export default async function AnalyticsExportsPage() {
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
    <ExportsClient 
      organizationId={profile.organization_id}
      translations={{
        title: t('exports.title'),
        tools: t('exports.tools'),
        history: t('exports.history'),
        schedule: t('exports.schedule')
      }}
    />
  );
}
