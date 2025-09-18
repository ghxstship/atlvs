import { Card } from '@ghxstship/ui';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';
import CreateOrderClient from './CreateOrderClient';

export const metadata = { title: 'Procurement · Orders' };

export default async function ProcurementOrdersPage() {
  const t = await getTranslations('procurement');
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
    .maybeSingle();

  const orgId = membership?.organization_id;

  if (!orgId) {
    redirect('/onboarding');
  }

  return (
    <div className="p-lg">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Orders</h1>
          <p className="color-muted">
            Manage your purchase orders and procurement requests
          </p>
        </div>
        <CreateOrderClient orgId={orgId} />
      </div>
      <Card>
        <OrdersClient orgId={orgId} />
      </Card>
    </div>
  );
}
