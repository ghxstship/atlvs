import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import LineupsClient from './LineupsClient';
import CreateLineupClient from './CreateLineupClient';

export const metadata = { title: 'Programming · Lineups' };

export default async function ProgrammingLineupsPage() {
  const t = await getTranslations('programming');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

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
      <Card title={t('lineups')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-anton uppercase">{t('lineups')}</h1>
          {orgId && <CreateLineupClient orgId={orgId} />}
        </div>
        
        {orgId ? <LineupsClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
