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

  if (!orgId) {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">People Directory</h1>
          <p className="text-sm text-muted-foreground">Manage your organization's team members</p>
        </div>
        <CreatePersonClient orgId={orgId} />
      </div>
      <DirectoryClient orgId={orgId} />
    </div>
  );
}
