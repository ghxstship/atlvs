import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ComplianceClient } from './ComplianceClient';
import CreateComplianceClient from './CreateComplianceClient';

export const metadata = { title: 'Jobs · Compliance' };

export default async function JobsCompliancePage() {
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
          <h1 className="text-2xl font-semibold text-foreground">{t('compliance.title')}</h1>
          <p className="text-muted-foreground">{t('compliance.subtitle')}</p>
        </div>
        <CreateComplianceClient orgId={profile.organization_id} />
      </div>
      
      <ComplianceClient
        user={user}
        orgId={profile.organization_id}
        translations={{
          title: t('compliance.title'),
          subtitle: t('compliance.subtitle'),
        }}
      />
    </div>
  );
}
