import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export const metadata = {
 title: 'Forecast Details - Finance',
};

export default async function ForecastDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const supabase = await createClient();

 const { data: { session } } = await supabase.auth.getSession();
 if (!session) redirect('/auth/signin');

 const { data: profile } = await supabase
 .from('users')
 .select(`*, memberships!inner(organization_id)`)
 .eq('auth_id', session.user.id)
 .single();

 if (!profile?.memberships?.[0]) redirect('/auth/onboarding');

 const orgId = profile.memberships[0].organization_id;

 const { data: forecast } = await supabase
 .from('forecasts')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (!forecast) redirect('/finance/forecasts');

 return (
 <div className="p-lg">
 <h1 className="text-2xl font-bold">{forecast.title}</h1>
 <p>Forecast details page - Enterprise Analytics</p>
 </div>
 );
}
