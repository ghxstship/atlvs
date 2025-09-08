import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import ManningClient from './ManningClient';
import CreateManningSlotClient from './CreateManningSlotClient';

export const metadata = { title: 'Pipeline · Manning' };

export default async function PipelineManningPage() {
  const t = await getTranslations('pipeline.manning');
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

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
          <h1 className="text-2xl font-bold font-anton uppercase">Manning Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage project staffing requirements and assignments</p>
        </div>
        <CreateManningSlotClient orgId={orgId} />
      </div>
      <ManningClient orgId={orgId} />
    </div>
  );
}
