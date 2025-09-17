import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import InspectionsTableClient from './InspectionsTableClient';
import CreateInspectionClient from './CreateInspectionClient';

export const metadata = { title: 'Projects · Inspections' };

export default async function ProjectsInspectionsPage() {
  const t = await getTranslations('inspections');
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

  let inspections: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    scheduled_at: string | null;
    completed_at: string | null;
    project: { id: string; name: string } | null;
    inspector_name: string | null;
    created_at: string;
  }> = [];

  let projects: Array<{ id: string; name: string }> = [];

  if (orgId) {
    // Load inspections with project details
    const { data: inspectionsData } = await supabase
      .from('inspections')
      .select(`
        id,
        title,
        type,
        status,
        scheduled_at,
        completed_at,
        inspector_name,
        created_at,
        project:projects(id, name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);

    inspections = (inspectionsData || []).map(inspection => ({
      ...inspection,
      project: inspection.project ? {
        id: (inspection.project as any).id,
        name: (inspection.project as any).name
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
        <div className="flex items-center justify-between gap-md mb-6">
          <div>
            <h1 className="text-heading-3 text-heading-3">Inspections</h1>
            <p className="text-body-sm color-muted">
              Manage pre-event, post-event, and compliance inspections
            </p>
          </div>
          {orgId ? <CreateInspectionClient orgId={orgId} projects={projects} /> : null}
        </div>
        
        {orgId ? (
          <InspectionsTableClient orgId={orgId} rows={inspections} projects={projects} />
        ) : (
          <div className="text-center py-xl color-muted">
            Please join an organization to manage inspections.
          </div>
        )}
      </Card>
    </div>
  );
}
