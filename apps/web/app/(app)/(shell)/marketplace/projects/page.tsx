import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import FeatureGate from '../../../../_components/FeatureGate';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import ProjectsClient from './ProjectsClient';

export const dynamic = 'force-dynamic';


export const metadata = { title: 'Marketplace Projects' };

export default async function ProjectsPage() {
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
 <ProjectsClient orgId={orgId} userId={user.id} />
 ) : (
 <div className="brand-marketplace text-center py-xsxl">
 <h2 className="text-heading-3 mb-md">Marketplace Projects</h2>
 <p className="color-muted">Please sign in to access marketplace projects</p>
 </div>
 )}
 </div>
 </FeatureGate>
 );
}
