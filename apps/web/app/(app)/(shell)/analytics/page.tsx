import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';

export const metadata = {
  title: 'Analytics | GHXSTSHIP',
  description: 'Business intelligence and analytics dashboard'
};

export default async function AnalyticsPage() {
  const context = await getSessionContext();

  if (!context || !context.user || !context.orgId) {
    redirect('/auth/signin');
  }

  return (
    <AnalyticsClient 
      orgId={context.orgId}
      userId={context.user.id}
      userEmail={context.user.email || ''}
    />
  );
}
