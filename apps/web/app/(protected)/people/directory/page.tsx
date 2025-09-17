import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import DirectoryClient from './DirectoryClient';
import CreatePersonClient from './CreatePersonClient';

export const metadata = { title: 'People · Directory' };

export default async function PeopleDirectoryPage() {
  const t = await getTranslations('people.directory');
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

  if (!orgId) {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">People Directory</h1>
          <p className="text-body-sm color-muted">Manage your organization's team members</p>
        </div>
        <CreatePersonClient orgId={orgId} />
      </div>
      <DirectoryClient orgId={orgId} />
    </div>
  );
}
