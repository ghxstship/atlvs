'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="Analytics Page Not Found"
      message="The analytics page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Analytics',
        onClick: () => router.push('/analytics')
      }}
    />
  );
}
