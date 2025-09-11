"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input, Badge } from '@ghxstship/ui';
import { createBrowserClient } from '@supabase/ssr';
import { DynamicProgressBar } from '../../(protected)/components/ui/DynamicProgressBar';
import { ArrowRight, ArrowLeft, Check, Building, Users, CreditCard, Settings } from 'lucide-react';
import { typography } from '../../(marketing)/lib/typography';
import { spacing, layouts } from '../../(marketing)/lib/spacing';
import { VerifyEmailStep } from './steps/VerifyEmailStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { OrganizationSetupStep } from './steps/OrganizationSetupStep';
import { TeamInvitationStep } from './steps/TeamInvitationStep';
import { ProfileCompletionStep } from './steps/ProfileCompletionStep';
import { FinalConfirmationStep } from './steps/FinalConfirmationStep';


type OnboardingStep = 
  | 'verify-email'
  | 'plan-selection'
  | 'organization-setup'
  | 'team-invitation'
  | 'profile-completion'
  | 'final-confirmation';

const stepOrder: OnboardingStep[] = [
  'verify-email',
  'plan-selection',
  'organization-setup',
  'team-invitation',
  'profile-completion',
  'final-confirmation'
];

export function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('verify-email');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<any>({});

  useEffect(() => {
    const step = searchParams?.get('step') as OnboardingStep;
    if (step && stepOrder.includes(step)) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signup');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const updateOnboardingData = (stepData: any) => {
    setOnboardingData((prev: any) => ({ ...prev, ...stepData }));
  };

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      router.push(`/auth/onboarding?step=${nextStep}`);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);
      router.push(`/auth/onboarding?step=${prevStep}`);
    }
  };

  const getCurrentStepNumber = () => stepOrder.indexOf(currentStep) + 1;
  const getTotalSteps = () => stepOrder.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={typography.bodyLarge}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className={`${layouts.container} ${spacing.sectionPadding}`}>
        {/* Header */}
        <div className={`text-center ${spacing.marginBottom.large}`}>
          <Link href="/home" className={`inline-flex items-center space-x-2 ${spacing.marginBottom.medium}`}>
            <span className={typography.heroTitle}>
              GHXSTSHIP
            </span>
          </Link>
          
          {/* Progress Indicator */}
          <div className={`max-w-md mx-auto ${spacing.marginBottom.medium}`}>
            <div className={`flex items-center justify-between ${typography.bodySmall} ${spacing.marginBottom.small}`}>
              <span>Step {getCurrentStepNumber()} of {getTotalSteps()}</span>
              <span>{Math.round((getCurrentStepNumber() / getTotalSteps()) * 100)}% Complete</span>
            </div>
            <DynamicProgressBar
              percentage={(getCurrentStepNumber() / getTotalSteps()) * 100}
              variant="default"
              size="sm"
              showLabel={false}
              animated={true}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === 'verify-email' && (
            <VerifyEmailStep
              user={user}
              onNext={goToNextStep}
              updateData={updateOnboardingData}
            />
          )}
          {currentStep === 'plan-selection' && (
            <PlanSelectionStep
              data={onboardingData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
            />
          )}
          {currentStep === 'organization-setup' && (
            <OrganizationSetupStep
              user={user}
              data={onboardingData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
            />
          )}
          {currentStep === 'team-invitation' && (
            <TeamInvitationStep
              user={user}
              data={onboardingData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
            />
          )}
          {currentStep === 'profile-completion' && (
            <ProfileCompletionStep
              user={user}
              data={onboardingData}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
            />
          )}
          {currentStep === 'final-confirmation' && (
            <FinalConfirmationStep
              user={user}
              data={onboardingData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
