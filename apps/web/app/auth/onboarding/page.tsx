import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthLayout } from '../_components/AuthLayout';
import { OnboardingFlow } from './OnboardingFlow';

export const metadata: Metadata = {
  title: 'Get Started - GHXSTSHIP Onboarding',
  description: 'Complete your account setup and start building amazing creative projects.',
};

export default function OnboardingPage() {
  return (
    <AuthLayout
      title="Welcome to GHXSTSHIP"
      subtitle="Let's get your account set up and ready to go"
      badge="GETTING STARTED"
      showTrustIndicators={false}
    >
      <Suspense fallback={
        <div className="brand-ghostship text-center py-xl">
          <div className="brand-ghostship animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-md"></div>
          <p className="color-muted font-body">Loading...</p>
        </div>
      }>
        <OnboardingFlow />
      </Suspense>
    </AuthLayout>
  );
}
