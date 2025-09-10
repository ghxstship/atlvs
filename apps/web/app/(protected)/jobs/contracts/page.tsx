import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ContractsClient from './ContractsClient';
import CreateContractClient from './CreateContractClient';

export const metadata = { title: 'Jobs · Contracts' };

export default async function JobsContractsPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('contracts.title')}</h1>
          <p className="text-muted-foreground">{t('contracts.subtitle')}</p>
        </div>
        <CreateContractClient orgId={profile.organization_id} />
      </div>
      
      <ContractsClient user={user} />
    </div>
  );
}
