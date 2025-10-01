import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import AssignmentsClient from './AssignmentsClient';

export const dynamic = 'force-dynamic';


export default async function AssignmentsPage() {
 const sessionContext = await getSessionContext();
 
 if (!sessionContext?.user || !sessionContext?.orgId) {
 redirect('/auth/signin');
 }

 return <AssignmentsClient orgId={sessionContext.orgId} />;
}
