import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import RemoveDemoClient from './RemoveDemoClient';
import { getTranslations } from 'next-intl/server';

export const metadata = { title: 'Settings · Organization' };

export default async function SettingsOrganizationPage() {
  const t = await getTranslations('settingsOrg');
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
    <div className="stack-md">
      <Card title={t('title')}>
        <div className="stack-sm">
          <p className="text-body-sm color-foreground/80">{t('description')}</p>
          {orgId ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-sm">
              <h3 className="text-heading-4 color-destructive">{t('remove.title')}</h3>
              <p className="text-body-sm color-destructive/80">{t('remove.help')}</p>
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
