import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ServicesClient from './ServicesClient';
import CreateServiceClient from './CreateServiceClient';

export const metadata = { title: 'Procurement · Services' };

export default async function ProcurementServicesPage() {
  const t = await getTranslations('procurement');
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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage your services catalog and rates
          </p>
        </div>
        {orgId && <CreateServiceClient orgId={orgId} />}
      </div>
      <Card>
        {orgId ? <ServicesClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
