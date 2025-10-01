import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ActivationsTableClient from './ActivationsTableClient';
import CreateActivationClient from './CreateActivationClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Projects · Activations' };

export default async function ProjectsActivationsPage() {
  const t = await getTranslations('activations');
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

  let activations: Array<{
    id: string;
    name: string;
    status: string;
    activation_date: string | null;
    completion_date: string | null;
    project: { id: string; name: string } | null;
    budget: number | null;
    created_at: string;
  }> = [];

  let projects: Array<{ id: string; name: string }> = [];

  if (orgId) {
    // Load activations with project details
    const { data: activationsData } = await supabase
      .from('activations')
      .select(`
        id,
        name,
        status,
        activation_date,
        completion_date,
        budget,
        created_at,
        project:projects(id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);

    activations = (activationsData || []).map(activation => ({
      ...activation,
      project: activation.project ? {
        id: (activation.project as any).id,
        name: (activation.project as any).name
      } : null
    }));

    // Load active projects for the create form
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('organization_id', orgId)
      .in('status', ['planning', 'active'])
      .order('name');
    projects = projectsData || [];
  }

  return (
    <div className="stack-md">
      <Card>
        <div className="flex items-center justify-between gap-md mb-lg">
          <div>
            <h1 className="text-heading-3">Activations</h1>
            <p className="text-body-sm color-muted">
              Manage project activations, launches, and go-live processes
            </p>
          </div>
          {orgId ? <CreateActivationClient orgId={orgId} projects={projects} /> : null}
        </div>
        
        {orgId ? (
          <ActivationsTableClient orgId={orgId} rows={activations} projects={projects} />
        ) : (
          <div className="text-center py-xl color-muted">
            Please join an organization to manage activations.
          </div>
        )}
      </Card>
    </div>
  );
}
