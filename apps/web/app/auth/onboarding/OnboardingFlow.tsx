"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@ghxstship/auth';
import Link from 'next/link';
import { Anton } from 'next/font/google';
import { VerifyEmailStep } from './steps/VerifyEmailStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { OrganizationSetupStep } from './steps/OrganizationSetupStep';
import { TeamInvitationStep } from './steps/TeamInvitationStep';
import { ProfileCompletionStep } from './steps/ProfileCompletionStep';
import { FinalConfirmationStep } from './steps/FinalConfirmationStep';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

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
  const supabase = createBrowserClient();
  
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
    setOnboardingData(prev => ({ ...prev, ...stepData }));
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center space-x-2 mb-6">
            <span className={`text-2xl font-bold tracking-tight text-foreground ${anton.className}`}>
              GHXSTSHIP
            </span>
          </Link>
          
          {/* Progress Indicator */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {getCurrentStepNumber()} of {getTotalSteps()}</span>
              <span>{Math.round((getCurrentStepNumber() / getTotalSteps()) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getCurrentStepNumber() / getTotalSteps()) * 100}%` }}
              />
            </div>
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
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
              data={onboardingData}
            />
          )}
          {currentStep === 'organization-setup' && (
            <OrganizationSetupStep
              user={user}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
              data={onboardingData}
            />
          )}
          {currentStep === 'team-invitation' && (
            <TeamInvitationStep
              user={user}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
              data={onboardingData}
            />
          )}
          {currentStep === 'profile-completion' && (
            <ProfileCompletionStep
              user={user}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              updateData={updateOnboardingData}
              data={onboardingData}
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
