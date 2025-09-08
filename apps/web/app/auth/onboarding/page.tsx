import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OnboardingFlow } from './OnboardingFlow';

export const metadata: Metadata = {
  title: 'Get Started - GHXSTSHIP Onboarding',
  description: 'Complete your account setup and start building amazing creative projects.',
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingFlow />
    </Suspense>
  );
}
