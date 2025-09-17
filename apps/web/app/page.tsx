import { Suspense } from 'react';
import { MarketingPageClient } from './_components/marketing/MarketingPageClient';

export const metadata = {
  title: 'GHXSTSHIP — Enterprise Event Platform',
  description: 'Modern, multi-tenant, real-time platform for productions, festivals, and complex events.'
}

export default function RootPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background animate-pulse" />}>
      <MarketingPageClient />
    </Suspense>
  );
}
