'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="Programming Page Not Found"
      message="The programming calendar page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Calendar',
        onClick: () => router.push('/programming')
      }}
    />
  );
}
