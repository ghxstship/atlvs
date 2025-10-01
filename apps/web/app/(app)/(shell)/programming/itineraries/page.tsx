import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ItinerariesClient from './ItinerariesClient';
import CreateItineraryClient from './CreateItineraryClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Programming · Itineraries' };

export default async function ProgrammingItinerariesPage() {
  const t = await getTranslations('programming');
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
      <Card title={t('itineraries')}>
        <div className="flex items-center justify-between gap-md mb-lg">
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">{t('itineraries')}</h1>
          {orgId && <CreateItineraryClient orgId={orgId} />}
        </div>
        
        {orgId ? <ItinerariesClient user={user} orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
