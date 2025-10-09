import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OnboardingFlow } from './OnboardingFlow';

export const metadata: Metadata = {
  title: 'Get Started - ATLVS Onboarding',
  description: 'Complete your account setup and start building amazing creative projects.'
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-icon-lg w-icon-lg border-2 border-primary border-t-transparent rounded-full mx-auto mb-md"></div>
          <p className="text-body color-muted">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingFlow />
    </Suspense>
  );
}
