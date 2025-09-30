import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import FeatureGate from '../../../../_components/FeatureGate';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import VendorsClient from './VendorsClient';

export const metadata = { title: 'Marketplace Vendors' };

export default async function VendorsPage() {
 const cookieStore = cookies();
 const supabase = createServerClient(cookieStore);

 const { data: { user } } = await supabase.auth.getUser();
 let orgId: string | null = null;
 
 if (user) {
 const { data: membership } = await supabase
 .from('memberships')
 .select('organization_id')
 .eq('user_id', user.id)
 .eq('status', 'active')
 .order('created_at', { ascending: true })
 .maybeSingle();
 orgId = membership?.organization_id ?? null;
 }

 return (
 <FeatureGate feature="marketplace">
 <div className="stack-md brand-marketplace" data-brand="marketplace">
 {orgId && user ? (
 <VendorsClient orgId={orgId} userId={user.id} />
 ) : (
 <div className="brand-marketplace text-center py-2xl">
 <h2 className="text-heading-3 mb-md">Marketplace Vendors</h2>
 <p className="color-muted">Please sign in to access marketplace vendors</p>
 </div>
 )}
 </div>
 </FeatureGate>
 );
}
