import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import DirectoryClient from './DirectoryClient';

export const metadata = { title: 'Companies · Directory' };

export default async function CompaniesDirectoryPage() {
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
    title: 'Company Directory',
    subtitle: 'Browse and manage your company directory with advanced search and filtering'
  };

  return (
    <DirectoryClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
