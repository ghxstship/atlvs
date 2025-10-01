import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


export const metadata = {
 title: 'Invoice Details - Finance',
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

 const { data: invoice } = await supabase
 .from('invoices')
 .select('*')
 .eq('id', id)
 .eq('organization_id', orgId)
 .single();

 if (!invoice) redirect('/finance/invoices');

 return (
 <div className="p-lg">
 <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
 <p>Invoice details page - Enterprise Implementation</p>
 </div>
 );
}
