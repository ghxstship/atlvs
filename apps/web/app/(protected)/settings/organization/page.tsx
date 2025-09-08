import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import RemoveDemoClient from './RemoveDemoClient';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Settings · Organization' };

export default async function SettingsOrganizationPage() {
  const t = await getTranslations('settingsOrg');
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

  return (
    <div className="space-y-4">
      <Card title={t('title')}>
        <div className="space-y-2">
          <p className="text-sm text-foreground/80">{t('description')}</p>
          {orgId ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <h3 className="font-semibold text-red-800">{t('remove.title')}</h3>
              <p className="text-sm text-red-700">{t('remove.help')}</p>
              <div className="mt-2">
                <RemoveDemoClient orgId={orgId} />
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
