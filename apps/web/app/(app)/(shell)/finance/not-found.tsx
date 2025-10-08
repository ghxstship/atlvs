'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="Finance Page Not Found"
      message="The financial page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Finance',
        onClick: () => router.push('/finance')
      }}
    />
  );
}
