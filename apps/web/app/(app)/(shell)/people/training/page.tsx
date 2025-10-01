import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import TrainingClient from './TrainingClient';

export const dynamic = 'force-dynamic';


export default async function TrainingPage() {
 const sessionContext = await getSessionContext();
 
 if (!sessionContext?.user || !sessionContext?.orgId) {
 redirect('/auth/signin');
 }

 return <TrainingClient orgId={sessionContext.orgId} />;
}
