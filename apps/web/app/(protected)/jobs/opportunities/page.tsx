import { createServerClient } from '@ghxstship/auth/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { OpportunitiesClient } from './OpportunitiesClient';
import CreateOpportunityClient from './CreateOpportunityClient';

export const metadata = { title: 'Jobs · Opportunities' };

export default async function JobsOpportunitiesPage() {
  const supabase = createServerClient();
  
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('opportunities.title')}</h1>
          <p className="text-muted-foreground">{t('opportunities.subtitle')}</p>
        </div>
        <CreateOpportunityClient orgId={profile.organization_id} />
      </div>
      
      <OpportunitiesClient
        user={user}
        orgId={profile.organization_id}
        translations={{
          title: t('opportunities.title'),
          subtitle: t('opportunities.subtitle'),
        }}
      />
    </div>
  );
}
