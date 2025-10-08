import { getSessionContext } from '@/app/_components/lib/sessionContext';
import { redirect } from 'next/navigation';
import AssetsClient from './AssetsClient';

export const metadata = {
  title: 'Assets | GHXSTSHIP',
  description: 'Asset inventory and maintenance management'
};

export default async function AssetsPage() {
  const context = await getSessionContext();

  if (!context || !context.user || !context.orgId) {
    redirect('/auth/signin');
  }

  return (
    <AssetsClient 
      orgId={context.orgId}
      userId={context.user.id}
      userEmail={context.user.email || ''}
    />
  );
}
