import { Card } from '@ghxstship/ui';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { redirect } from 'next/navigation';
import PerformanceClient from './PerformanceClient';
import CreatePerformanceReviewClient from './CreatePerformanceReviewClient';

export const metadata = { title: 'Profile · Performance' };

export default async function ProfilePerformancePage() {
  const cookieStore = cookies();
  const sb = createServerClient(cookieStore);

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    redirect('/auth/sign-in');
  }

  const orgId = cookieStore.get('organization-id')?.value;
  if (!orgId) {
    redirect('/onboarding');
  }

  const { data: user } = await sb.auth.getUser();
  if (!user.user) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="space-y-4">
      <Card title="Performance Reviews">
        <div className="mb-3 flex items-center justify-end">
          <CreatePerformanceReviewClient orgId={orgId} userId={user.user.id} />
        </div>
        <div className="text-sm text-foreground/70">
          <Suspense fallback={<div>Loading...</div>}>
            <PerformanceClient orgId={orgId} userId={user.user.id} />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
