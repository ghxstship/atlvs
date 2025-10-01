import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import ContractsClient from './ContractsClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Companies · Contracts' };

export default async function CompaniesContractsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get organization ID from user metadata or session
  const orgId = user.user_metadata?.organization_id || user.app_metadata?.organization_id;
  
  if (!orgId) {
    redirect('/onboarding');
  }

  const translations = {
    title: 'Company Contracts',
    subtitle: 'Manage contract lifecycle with MSAs, SOWs, NDAs and service agreements'
  };

  return (
    <ContractsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
