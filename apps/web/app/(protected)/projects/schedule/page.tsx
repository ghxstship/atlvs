import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ScheduleClient from './ScheduleClient';
import CreateMilestoneClient from './CreateMilestoneClient';
import ProjectsOverviewClient from '../overview/ProjectsOverviewClient';

export const metadata = { title: 'Projects · Schedule' };

export default async function ProjectSchedulePage() {
  const t = await getTranslations('schedule');
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

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

  let scheduleData: {
    projects: Array<{ 
      id: string; 
      name: string; 
      status: string; 
      starts_at: string | null; 
      ends_at: string | null;
      budget: number;
    }>;
    milestones: Array<{ 
      id: string; 
      title: string; 
      due_at: string; 
      status: string; 
      project_id: string;
      project?: { name: string };
    }>;
    tasks: Array<{ 
      id: string; 
      title: string; 
      status: string; 
      due_at: string | null; 
      project_id: string;
      project?: { name: string };
    }>;
  } = { projects: [], milestones: [], tasks: [] };
  
  if (orgId) {
    const [projectsRes, milestonesRes, tasksRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, status, starts_at, ends_at, budget')
        .eq('organization_id', orgId)
        .order('starts_at', { ascending: true }),
      supabase
        .from('milestones')
        .select(`
          id,
          title,
          due_at,
          status,
          project_id,
          projects:project_id(name)
        `)
        .eq('organization_id', orgId)
        .order('due_at', { ascending: true }),
      supabase
        .from('tasks')
        .select(`
          id,
          title,
          status,
          due_at,
          project_id,
          projects:project_id(name)
        `)
        .eq('organization_id', orgId)
        .not('due_at', 'is', null)
        .order('due_at', { ascending: true })
        .limit(100)
    ]);

    scheduleData = {
      projects: projectsRes.data || [],
      milestones: milestonesRes.data?.map(milestone => ({
        ...milestone,
        project: milestone.projects ? { name: (milestone.projects as any).name } : undefined
      })) || [],
      tasks: tasksRes.data?.map(task => ({
        ...task,
        project: task.projects ? { name: (task.projects as any).name } : undefined
      })) || []
    };
  }

  const hasData = scheduleData.projects.length > 0 || scheduleData.milestones.length > 0 || scheduleData.tasks.length > 0;

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <div className="mb-3 flex items-center justify-end">
          {orgId ? <CreateMilestoneClient orgId={orgId} /> : null}
        </div>
        {hasData ? (
          <ScheduleClient data={scheduleData} orgId={orgId!} />
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
      </Card>
    </div>
  );
}
