'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="Dashboard Page Not Found"
      message="The dashboard page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Dashboard',
        onClick: () => router.push('/dashboard')
      }}
    />
  );
}
