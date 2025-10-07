"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { CheckCircle, ArrowRight, Sparkles, Users, Building, CreditCard } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { createBrowserClient } from '@supabase/ssr';

type SummaryIcon = typeof CreditCard;

interface SetupSummaryItem {
  icon: SummaryIcon;
  title: string;
  description: string;
}

interface PlanData {
  name?: string;
  trialDays?: number;
}

interface OnboardingDataShape {
  selectedPlan?: string;
  billingCycle?: 'annual' | 'monthly';
  planData?: PlanData;
  setupType?: 'create' | 'join';
  orgName?: string;
  userRole?: string;
  teamInvites?: Array<{ email: string }>;
}

interface FinalConfirmationStepProps {
  user: { id: string };
  data: OnboardingDataShape;
  onComplete?: () => void;
}

export function FinalConfirmationStep({ user, data, onComplete }: FinalConfirmationStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGetStarted = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      onComplete?.();
      router.push('/dashboard/overview');
    }
  };

  const getSetupSummary = (): SetupSummaryItem[] => {
    const summary: SetupSummaryItem[] = [];

    if (data.selectedPlan) {
      const plan = data.planData;
      summary.push({
        icon: CreditCard,
        title: `${plan?.name ?? 'Unknown'} Plan Selected`,
        description: `${data.billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing • ${plan?.trialDays ?? 0}-day free trial`,
      });
    }

    if (data.setupType === 'create') {
      summary.push({
        icon: Building,
        title: 'Organization Created',
        description: `${data.orgName ?? 'Your organization'} • You are the owner`,
      });
    } else if (data.setupType === 'join') {
      summary.push({
        icon: Building,
        title: 'Joined Organization',
        description: `${data.orgName ?? 'Your organization'} • Role: ${data.userRole ?? 'member'}`,
      });
    }

    if (data.teamInvites && data.teamInvites.length > 0) {
      summary.push({
        icon: Users,
        title: 'Team Invitations Sent',
        description: `${data.teamInvites.length} team member${data.teamInvites.length > 1 ? 's' : ''} invited`,
      });
    }

    return summary;
  };

  return (
    <div className="brand-ghostship stack-xl">
      <div className="brand-ghostship text-center">
        <div className="brand-ghostship mb-lg">
          <div className="brand-ghostship w-component-lg h-component-lg bg-success/10 rounded-full flex items-center justify-center mx-auto mb-md">
            <CheckCircle className="h-icon-2xl w-icon-2xl color-success" />
          </div>
          <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-md`}>
            WELCOME TO GHXSTSHIP!
          </h1>
          <p className="text-body color-muted max-w-2xl mx-auto">
            Your account is ready! You&apos;re all set to start creating amazing projects with your team.
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <Card className="shadow-modal">
        <CardContent className="p-xl">
          <div className="brand-ghostship text-center mb-lg">
            <Sparkles className="h-icon-lg w-icon-lg color-accent mx-auto mb-sm" />
            <h2 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-sm`}>
              SETUP COMPLETE
            </h2>
            <p className="color-muted">
              Here&apos;s what we&apos;ve set up for you
            </p>
          </div>

          <div className="brand-ghostship stack-md">
            {getSetupSummary().map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center cluster p-md bg-secondary/50 rounded-lg">
                  <div className="brand-ghostship w-icon-xl h-icon-xl bg-accent/10 rounded-full flex items-center justify-center">
                    <Icon className="h-icon-sm w-icon-sm color-accent" />
                  </div>
                  <div>
                    <h3 className="text-heading-4 color-foreground">{item.title}</h3>
                    <p className="text-body-sm color-muted">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-lg">
          <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-md`}>
            WHAT&apos;S NEXT?
          </h3>
          <div className="brand-ghostship grid md:grid-cols-2 gap-md">
            <div className="brand-ghostship stack-sm">
              <h4 className="text-heading-4 color-foreground">Explore Your Dashboard</h4>
              <p className="text-body-sm color-muted">
                Get familiar with your project overview and team workspace
              </p>
            </div>
            <div className="brand-ghostship stack-sm">
              <h4 className="text-heading-4 color-foreground">Create Your First Project</h4>
              <p className="text-body-sm color-muted">
                Start organizing your creative work with ATLVS project management
              </p>
            </div>
            <div className="brand-ghostship stack-sm">
              <h4 className="text-heading-4 color-foreground">Invite More Team Members</h4>
              <p className="text-body-sm color-muted">
                Add collaborators and assign them to specific projects
              </p>
            </div>
            <div className="brand-ghostship stack-sm">
              <h4 className="text-heading-4 color-foreground">Customize Your Workspace</h4>
              <p className="text-body-sm color-muted">
                Set up workflows, templates, and integrations that work for you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trial Information */}
      {data.planData?.trialDays && (
        <Card className="border-primary/20 bg-accent/5">
          <CardContent className="p-lg">
            <div className="brand-ghostship text-center">
              <h3 className={`${anton.className} uppercase text-body text-heading-3 mb-sm color-accent`}>
                FREE TRIAL ACTIVE
              </h3>
              <p className="color-muted mb-md">
                You have {data.planData.trialDays} days to explore all features. 
                No credit card required until your trial ends.
              </p>
              <div className="brand-ghostship flex justify-center cluster-lg text-body-sm">
                <div className="brand-ghostship text-center">
                  <div className="brand-ghostship text-heading-4 color-foreground">Full Access</div>
                  <div className="brand-ghostship color-muted">All premium features</div>
                </div>
                <div className="brand-ghostship text-center">
                  <div className="brand-ghostship text-heading-4 color-foreground">No Commitment</div>
                  <div className="brand-ghostship color-muted">Cancel anytime</div>
                </div>
                <div className="brand-ghostship text-center">
                  <div className="brand-ghostship text-heading-4 color-foreground">Support Included</div>
                  <div className="brand-ghostship color-muted">Priority assistance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="brand-ghostship text-center pt-lg">
        <Button 
          onClick={handleGetStarted} 
          disabled={loading}
         
          className="px-xl"
        >
          {loading ? 'Setting up your workspace...' : 'Go to Dashboard'}
          <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
        </Button>
        
        <p className="text-body-sm color-muted mt-md">
          Need help getting started?{' '}
          <a href="/resources/docs" className="color-accent hover:underline">
            Check out our documentation
          </a>{' '}
          or{' '}
          <a href="/contact" className="color-accent hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
