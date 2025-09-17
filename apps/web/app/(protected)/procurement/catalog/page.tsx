import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { Card } from '@ghxstship/ui';
import CatalogClient from './CatalogClient';
import CreateCatalogItemClient from './CreateCatalogItemClient';

export const metadata = {
  title: 'Catalog - Procurement',
};

export default async function ProcurementCatalogPage() {
  const cookieStore = cookies();
  const sb = createServerClient(cookieStore);

  // Check authentication
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's organization membership
  const { data: membership } = await sb
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership?.organization_id) {
    redirect('/onboarding');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Catalog</h1>
          <p className="color-foreground/70">
            Browse and manage your complete procurement catalog
          </p>
        </div>
        <CreateCatalogItemClient orgId={membership.organization_id} />
      </div>

      <Card>
        <CatalogClient orgId={membership.organization_id} />
      </Card>
    </div>
  );
}
