import { Card } from '@ghxstship/ui';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Procurement · Products' };

import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import ProductsClient from './ProductsClient';
import CreateProductClient from './CreateProductClient';

export default async function ProcurementProductsPage() {
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
    <div className="p-lg">
      <div className="mb-lg flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Products</h1>
          <p className="color-muted">
            Manage your product catalog and inventory
          </p>
        </div>
        {orgId && <CreateProductClient orgId={orgId} />}
      </div>
      <Card>
        {orgId ? <ProductsClient orgId={orgId} /> : null}
      </Card>
    </div>
  );
}
