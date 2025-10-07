import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export const metadata = {
 title: 'Edit Account - Finance',
};

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
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

 const { data: account } = await supabase
 .from('accounts')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (!account) redirect('/finance/accounts');

 return (
 <div className="p-lg">
 <h1 className="text-2xl font-bold">Edit {account.name}</h1>
 <p>Account edit page - Coming Soon</p>
 </div>
 );
}
