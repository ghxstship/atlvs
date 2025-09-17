import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import ContractingClient from './ContractingClient';
import CreateContractClient from './CreateContractClient';

export const metadata = { title: 'Pipeline · Contracting' };

export default async function PipelineContractingPage() {
  const t = await getTranslations('pipeline.contracting');
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Contracting Pipeline</h1>
          <p className="text-body-sm color-muted">Manage contractor agreements and relationships</p>
        </div>
        <CreateContractClient orgId={orgId} />
      </div>
      <ContractingClient orgId={orgId} />
    </div>
  );
}
