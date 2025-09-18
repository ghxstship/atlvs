import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import InventoryClient from './InventoryClient';

export const metadata = { title: 'Assets · Inventory' };

export default async function AssetInventoryPage() {
  const t = await getTranslations('assets.inventory');
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
    <div className="stack-md">
      <InventoryClient orgId={orgId} />
    </div>
  );
}
