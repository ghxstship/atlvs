import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import InvoicesClient from './InvoicesClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Finance · Invoices' };

export default async function FinanceInvoicesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  const t = await getTranslations('finance');

  return (
    <InvoicesClient
      user={user}
      orgId={profile.organization_id}
      translations={{
        title: t('invoices.title'),
        subtitle: t('invoices.subtitle'),
      }}
    />
  );
}
