import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { OverviewClient } from './OverviewClient';

export const metadata = {
  title: 'Jobs Overview',
};

export default async function JobsOverview() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  const t = await getTranslations('jobs');

  return (
    <OverviewClient
      user={user}
      orgId={profile.organization_id}
      translations={{
        title: t('overview.title'),
        subtitle: t('overview.subtitle'),
      }}
    />
  );
}
