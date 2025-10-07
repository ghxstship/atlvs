import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';


export default async function OnboardingPage() {
 const sessionContext = await getSessionContext();
 
 if (!sessionContext?.user || !sessionContext?.orgId) {
 redirect('/auth/signin');
 }

 return <OnboardingClient orgId={sessionContext.orgId} />;
}
