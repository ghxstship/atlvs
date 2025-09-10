import { Card } from '@ghxstship/ui';

export const metadata = {
  title: 'Projects Overview',
};

import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ProjectsOverviewClient from './ProjectsOverviewClient';
import ProjectsTableClient from './ProjectsTableClient';
import CreateProjectClient from './CreateProjectClient';
import AutoSeedOnFirstRun from './AutoSeedOnFirstRun';

export default async function ProjectsOverview() {
  const t = await getTranslations('projects');

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

  let rows: Array<{ id: string; name: string; status: string; starts_at: string | null }> = [];
  if (orgId) {
    const { data } = await supabase
      .from('projects')
      .select('id,name,status,starts_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);
    rows = (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      starts_at: r.starts_at ?? null
    }));
  }

  const hasData = rows.length > 0;

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <div className="mb-3 flex items-center justify-end">
          {orgId ? <CreateProjectClient orgId={orgId} /> : null}
        </div>
        {hasData ? (
          <ProjectsTableClient rows={rows} orgId={orgId!} labels={{ name: t('grid.name'), status: t('grid.status'), startsAt: t('grid.startsAt') }} />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{t('empty.title')}</h3>
              <p className="text-sm opacity-80">{t('empty.description')}</p>
            </div>
            {orgId ? (
              <ProjectsOverviewClient orgId={orgId} />
            ) : null}
          </div>
        )}
        {!hasData && orgId ? <AutoSeedOnFirstRun orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
