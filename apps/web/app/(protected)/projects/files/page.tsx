import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import FilesTableClient from './FilesTableClient';
import FilesUploadClient from './FilesUploadClient';
import FilesFilterBar from './FilesFilterBar';

export const metadata = { title: 'Projects · Files' };

export default async function ProjectsFilesPage() {
  const t = await getTranslations('files');
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
    <div className="space-y-4">
      <Card title={t('title')}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          {orgId ? <FilesUploadClient orgId={orgId} /> : null}
        </div>
        
        {orgId ? <FilesTableClient orgId={orgId} rows={files} /> : null}
      </Card>
    </div>
  );
}
