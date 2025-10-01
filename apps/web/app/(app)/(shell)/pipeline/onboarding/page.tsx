import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';
import CreateOnboardingTaskClient from './CreateOnboardingTaskClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Pipeline · Onboarding' };

export default async function PipelineOnboardingPage() {
  const t = await getTranslations('pipeline.onboarding');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();

  const orgId = membership?.organization_id;

  if (!orgId) {
    redirect('/onboarding');
  }

  return (
    <div className="stack-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 font-anton uppercase">Onboarding Pipeline</h1>
          <p className="text-body-sm color-muted">Manage new hire onboarding tasks and processes</p>
        </div>
        <CreateOnboardingTaskClient orgId={orgId} />
      </div>
      <OnboardingClient orgId={orgId} />
    </div>
  );
}
