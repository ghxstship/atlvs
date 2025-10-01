import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import FilesTableClient from './FilesTableClient';
import FilesUploadClient from './FilesUploadClient';
import FilesFilterBar from './FilesFilterBar';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Projects · Files' };

export default async function ProjectsFilesPage() {
  const t = await getTranslations('files');
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

  let files: Array<{ id: string; name: string; path: string; mime_type: string | null; size: number | null; created_at: string }> = [];
  if (orgId) {
    const { data } = await supabase
      .from('files')
      .select('id,name,path,mime_type,size,created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(100);
    files = data ?? [];
  }

  return (
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="flex items-center justify-between gap-md mb-lg">
          <h1 className="text-heading-3">{t('title')}</h1>
          {orgId ? <FilesUploadClient orgId={orgId} /> : null}
        </div>
        
        {orgId ? <FilesTableClient orgId={orgId} rows={files} /> : null}
      </Card>
    </div>
  );
}
