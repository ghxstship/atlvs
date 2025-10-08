'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="People Page Not Found"
      message="The team member page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Team',
        onClick: () => router.push('/people')
      }}
    />
  );
}
