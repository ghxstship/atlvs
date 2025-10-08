'use client';

import { useRouter } from 'next/navigation';
import { ErrorPage } from '@ghxstship/ui';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <ErrorPage
      code="404"
      title="Project Page Not Found"
      message="The project page you're looking for doesn't exist or has been moved."
      action={{
        label: 'Back to Projects',
        onClick: () => router.push('/projects')
      }}
    />
  );
}
