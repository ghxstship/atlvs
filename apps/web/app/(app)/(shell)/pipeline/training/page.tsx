import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import TrainingClient from './TrainingClient';
import CreateTrainingClient from './CreateTrainingClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Pipeline · Training' };

export default async function PipelineTrainingPage() {
  const t = await getTranslations('pipeline.training');
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
          <h1 className="text-heading-3 font-anton uppercase">Training Pipeline</h1>
          <p className="text-body-sm color-muted">Manage training programs and certifications</p>
        </div>
        <CreateTrainingClient orgId={orgId} />
      </div>
      <TrainingClient orgId={orgId} />
    </div>
  );
}
