import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import ContractsClient from './ContractsClient';

export default async function ContractsPage() {
 const sessionContext = await getSessionContext();
 
 if (!sessionContext?.user || !sessionContext?.orgId) {
 redirect('/auth/signin');
 }

 return <ContractsClient orgId={sessionContext.orgId} />;
}
