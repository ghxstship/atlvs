import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import PerformancesClient from './PerformancesClient';
import CreatePerformanceClient from './CreatePerformanceClient';

export const metadata = { title: 'Programming · Performances' };

export default async function ProgrammingPerformancesPage() {
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
      <Card title={t('performances')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-anton uppercase">{t('performances')}</h1>
          {orgId && <CreatePerformanceClient orgId={orgId} />}
        </div>
        
        {orgId ? <PerformancesClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
