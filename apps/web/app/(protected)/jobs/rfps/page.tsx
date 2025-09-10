import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { RFPsClient } from './RFPsClient';
import CreateRfpClient from './CreateRfpClient';

export const metadata = { title: 'Jobs · RFPs' };

export default async function JobsRFPsPage() {
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
          <h1 className="text-2xl font-semibold text-foreground">{t('rfps.title')}</h1>
          <p className="text-muted-foreground">{t('rfps.subtitle')}</p>
        </div>
        <CreateRfpClient orgId={profile.organization_id} />
      </div>
      
      <RFPsClient
        user={user}
        orgId={profile.organization_id}
        translations={{
          title: t('rfps.title'),
          subtitle: t('rfps.subtitle'),
        }}
      />
    </div>
  );
}
