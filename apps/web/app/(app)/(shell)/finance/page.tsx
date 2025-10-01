import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import FinanceClient from './FinanceClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Finance' };

export default async function FinancePage() {
  const t = await getTranslations('finance');
  const cookieStore = await cookies();
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
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="flex items-center justify-between gap-md mb-lg">
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">{t('title')}</h1>
        </div>
        
        {orgId ? <FinanceClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
