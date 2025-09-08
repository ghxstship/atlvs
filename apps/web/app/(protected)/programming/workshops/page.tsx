import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import WorkshopsClient from './WorkshopsClient';
import CreateWorkshopClient from './CreateWorkshopClient';

export const metadata = { title: 'Programming · Workshops' };

export default async function ProgrammingWorkshopsPage() {
  const t = await getTranslations('programming');
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
  let orgId: string | null = null;
  if (user) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .maybeSingle();
    orgId = membership?.organization_id ?? null;
  }

  return (
    <div className="space-y-4">
      <Card title={t('workshops')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-anton uppercase">{t('workshops')}</h1>
          {orgId && <CreateWorkshopClient orgId={orgId} />}
        </div>
        
        {orgId ? <WorkshopsClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
