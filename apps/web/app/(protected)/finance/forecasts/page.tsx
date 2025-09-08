import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import ForecastsClient from './ForecastsClient';

export const metadata = {
  title: 'Forecasts',
};

export default async function ForecastsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options: any) => {
      cookieStore.set({ name, value, ...options });
    },
    remove: (name: string, options: any) => {
      cookieStore.set({ name, value: '', ...options });
    },
  });
  
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
    title: 'Forecasts',
    subtitle: 'Create and manage financial forecasts with projections and analytics'
  };

  return (
    <ForecastsClient 
      user={user} 
      orgId={orgId} 
      translations={translations}
    />
  );
}
