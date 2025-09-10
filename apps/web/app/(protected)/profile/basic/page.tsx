import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import BasicInfoClient from './BasicInfoClient';

export const metadata = { title: 'Profile · Basic Information' };

export default async function ProfileBasicInfoPage() {
  const t = await getTranslations('profile');
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
      <Card title={t('basicInfo.title')}>
        {orgId && user ? <BasicInfoClient orgId={orgId} userId={user.id} /> : null}
      </Card>
    </div>
  );
}
