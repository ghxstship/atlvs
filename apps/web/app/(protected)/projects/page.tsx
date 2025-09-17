import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ProjectsClient from './ProjectsClient';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage() {
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

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">{t('title')}</h1>
        </div>
        
        {orgId && user ? <ProjectsClient orgId={orgId} userId={user.id} userEmail={user.email || ''} /> : null}
      </Card>
    </div>
  );
}
