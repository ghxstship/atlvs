import { Suspense } from 'react';
import { MarketingPageClient } from './_components/marketing/MarketingPageClient';

export const metadata = {
  title: 'ATLVS — Experiential Project Management Platform',
  description: 'Modular collaboration platform for productions, festivals, and complex events.'
};

export default function RootPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background animate-pulse" />}>
      <MarketingPageClient />
    </Suspense>
  );
}
