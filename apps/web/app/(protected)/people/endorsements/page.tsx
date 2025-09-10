import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import EndorsementsClient from './EndorsementsClient';
import CreateEndorsementClient from './CreateEndorsementClient';

export const metadata = { title: 'People · Endorsements' };

export default async function PeopleEndorsementsPage() {
  const t = await getTranslations('people.endorsements');
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

  if (!orgId) {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Endorsements</h1>
          <p className="text-sm text-muted-foreground">Provide feedback and recognition for team members</p>
        </div>
        <CreateEndorsementClient orgId={orgId} />
      </div>
      <EndorsementsClient orgId={orgId} />
    </div>
  );
}
