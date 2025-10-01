import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import RatingsClient from './RatingsClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Companies · Ratings' };

export default async function CompaniesRatingsPage() {
  const cookieStore = await cookies();
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
    title: 'Company Ratings',
    subtitle: 'Manage performance reviews, ratings and recommendations for companies'
  };

  return (
    <RatingsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
