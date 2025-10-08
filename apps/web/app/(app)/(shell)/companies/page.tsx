import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import CompaniesClient from './CompaniesClient';

export const metadata = {
  title: 'Companies | GHXSTSHIP',
  description: 'CRM and company management'
};

export default async function CompaniesPage() {
  const context = await getSessionContext();

  if (!context || !context.user || !context.orgId) {
    redirect('/auth/signin');
  }

  return (
    <CompaniesClient 
      orgId={context.orgId}
      userId={context.user.id}
      userEmail={context.user.email || ''}
    />
  );
}
