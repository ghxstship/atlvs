import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import CalendarClient from './CalendarClient';
import CreateCalendarClient from './CreateCalendarClient';

export const metadata = { title: 'Programming · Calendar' };

export default async function ProgrammingCalendarPage() {
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
      <Card title={t('calendar')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-anton uppercase">{t('calendar')}</h1>
          {orgId && <CreateCalendarClient orgId={orgId} />}
        </div>
        
        {orgId ? <CalendarClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
