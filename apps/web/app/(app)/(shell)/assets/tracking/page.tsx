import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import TrackingClient from './TrackingClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Assets · Tracking' };

export default async function AssetTrackingPage() {
  const t = await getTranslations('assets.tracking');
  const cookieStore = await cookies();
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
      <TrackingClient orgId={orgId} />
    </div>
  );
}
