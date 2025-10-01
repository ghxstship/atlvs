import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import LocationsTableClient from './LocationsTableClient';
import CreateLocationClient from './CreateLocationClient';
import ProjectsOverviewClient from '../overview/ProjectsOverviewClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Projects · Locations' };

export default async function ProjectsLocationsPage() {
  const t = await getTranslations('locations');
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

  let locations: Array<{ 
    id: string; 
    name: string; 
    address: string | null; 
    city: string | null; 
    state: string | null; 
    country: string | null; 
    type: string; 
    capacity: number | null;
    project_id: string | null;
    project?: { name: string };
  }> = [];
  
  if (orgId) {
    const { data } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        address,
        city,
        state,
        country,
        type,
        capacity,
        project_id,
        projects:project_id(name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(200);
    locations = data?.map(location => ({
      ...location,
      project: location.projects ? { name: (location.projects as any).name } : undefined
    })) ?? [];
  }

  const hasData = (locations?.length ?? 0) > 0;

  return (
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="mb-sm flex items-center justify-end">
          {orgId ? <CreateLocationClient orgId={orgId} /> : null}
        </div>
        {hasData ? (
          <LocationsTableClient rows={locations} orgId={orgId!} />
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
