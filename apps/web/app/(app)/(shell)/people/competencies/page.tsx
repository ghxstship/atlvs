import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import CompetenciesClient from './CompetenciesClient';
import CreateCompetencyClient from './CreateCompetencyClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'People · Competencies' };

export default async function PeopleCompetenciesPage() {
  const t = await getTranslations('people.competencies');
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
    <div className="stack-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Competencies</h1>
          <p className="text-body-sm color-muted">Define and track team competencies and skill levels</p>
        </div>
        <CreateCompetencyClient orgId={orgId} />
      </div>
      <CompetenciesClient orgId={orgId} />
    </div>
  );
}
