import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import TasksTableClient from './TasksTableClient';
import CreateTaskClient from './CreateTaskClient';
import ProjectsOverviewClient from '../overview/ProjectsOverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Project Tasks' };

export default async function ProjectTasks() {
  const t = await getTranslations('tasks');
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

  let tasks: Array<{ id: string; title: string; status: string; due_at: string | null; project_id: string | null }> = [];
  if (orgId) {
    const { data } = await supabase
      .from('tasks')
      .select('id,title,status,due_at,project_id')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(200);
    tasks = data ?? [];
  }

  const hasData = (tasks?.length ?? 0) > 0;

  return (
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="mb-sm flex items-center justify-end">
          {orgId ? <CreateTaskClient orgId={orgId} /> : null}
        </div>
        {hasData ? (
          <TasksTableClient rows={tasks} orgId={orgId!} />
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
