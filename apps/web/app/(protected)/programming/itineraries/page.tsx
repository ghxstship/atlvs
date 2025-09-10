import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ItinerariesClient from './ItinerariesClient';
import CreateItineraryClient from './CreateItineraryClient';

export const metadata = { title: 'Programming · Itineraries' };

export default async function ProgrammingItinerariesPage() {
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
      <Card title={t('itineraries')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold font-anton uppercase">{t('itineraries')}</h1>
          {orgId && <CreateItineraryClient orgId={orgId} />}
        </div>
        
        {orgId ? <ItinerariesClient user={user} orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
