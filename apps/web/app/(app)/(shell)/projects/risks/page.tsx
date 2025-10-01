import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import RisksTableClient from './RisksTableClient';
import CreateRiskClient from './CreateRiskClient';
import ProjectsOverviewClient from '../overview/ProjectsOverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Projects · Risks' };

export default async function ProjectsRisksPage() {
  const t = await getTranslations('risks');
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

  let risks: Array<{ 
    id: string; 
    title: string; 
    category: string; 
    impact: string; 
    probability: string; 
    status: string; 
    project_id: string | null;
    project?: { name: string };
  }> = [];
  
  if (orgId) {
    const { data } = await supabase
      .from('risks')
      .select(`
        id,
        title,
        category,
        impact,
        probability,
        status,
        project_id,
        projects:project_id(name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(200);
    risks = data?.map(risk => ({
      ...risk,
      project: risk.projects ? { name: (risk.projects as any).name } : undefined
    })) ?? [];
  }

  const hasData = (risks?.length ?? 0) > 0;

  return (
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="mb-sm flex items-center justify-end">
          {orgId ? <CreateRiskClient orgId={orgId} /> : null}
        </div>
        {hasData ? (
          <RisksTableClient rows={risks} orgId={orgId!} />
        ) : (
          <div className="flex items-start justify-between gap-md">
            <div>
              <h3 className="text-body text-heading-4">{t('empty.title')}</h3>
              <p className="text-body-sm opacity-80">{t('empty.description')}</p>
            </div>
            {orgId ? (
              <ProjectsOverviewClient orgId={orgId} />
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
