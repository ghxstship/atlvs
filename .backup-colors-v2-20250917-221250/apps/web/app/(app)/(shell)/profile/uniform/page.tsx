import { Card } from '@ghxstship/ui';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { redirect } from 'next/navigation';
import UniformClient from './UniformClient';
import CreateUniformItemClient from './CreateUniformItemClient';

export const metadata = { title: 'Profile · Uniform' };

export default async function ProfileUniformPage() {
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
    <div className="stack-md">
      <Card title="Uniform & Equipment">
        <div className="mb-sm flex items-center justify-end">
          <CreateUniformItemClient orgId={orgId} userId={user.user.id} />
        </div>
        <div className="text-body-sm color-foreground/70">
          <Suspense fallback={<div>Loading...</div>}>
            <UniformClient orgId={orgId} userId={user.user.id} />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}
