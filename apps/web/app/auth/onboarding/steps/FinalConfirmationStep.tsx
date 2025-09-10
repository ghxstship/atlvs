"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button } from '@ghxstship/ui';
import { CheckCircle, ArrowRight, Sparkles, Users, Building, CreditCard } from 'lucide-react';
import { Anton } from 'next/font/google';
import { createBrowserClient } from '@ghxstship/auth';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface FinalConfirmationStepProps {
  user: any;
  data: any;
}

export function FinalConfirmationStep({ user, data }: FinalConfirmationStepProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();

  const handleGetStarted = async () => {
    setLoading(true);
    
    try {
      // Mark onboarding as completed
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Redirect to dashboard
      router.push('/dashboard/overview');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      // Still redirect to dashboard even if marking completion fails
      router.push('/dashboard/overview');
    }
  };

  const getSetupSummary = () => {
    const summary = [];
    
    if (data.selectedPlan) {
      const plan = data.planData;
      summary.push({
        icon: CreditCard,
        title: `${plan?.name} Plan Selected`,
        description: `${data.billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing • ${plan?.trialDays}-day free trial`,
      });
    }

    if (data.setupType === 'create') {
      summary.push({
        icon: Building,
        title: 'Organization Created',
        description: `${data.orgName} • You are the owner`,
      });
    } else if (data.setupType === 'join') {
      summary.push({
        icon: Building,
        title: 'Joined Organization',
        description: `${data.orgName} • Role: ${data.userRole}`,
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className={`${anton.className} uppercase text-3xl font-bold mb-4`}>
            WELCOME TO GHXSTSHIP!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your account is ready! You're all set to start creating amazing projects with your team.
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <Card className="shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className={`${anton.className} uppercase text-xl font-bold mb-2`}>
              SETUP COMPLETE
            </h2>
            <p className="text-muted-foreground">
              Here's what we've set up for you
            </p>
          </div>

          <div className="space-y-4">
            {getSetupSummary().map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className="p-6">
          <h3 className={`${anton.className} uppercase text-lg font-bold mb-4`}>
            WHAT'S NEXT?
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Explore Your Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Get familiar with your project overview and team workspace
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Create Your First Project</h4>
              <p className="text-sm text-muted-foreground">
                Start organizing your creative work with ATLVS project management
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Invite More Team Members</h4>
              <p className="text-sm text-muted-foreground">
                Add collaborators and assign them to specific projects
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Customize Your Workspace</h4>
              <p className="text-sm text-muted-foreground">
                Set up workflows, templates, and integrations that work for you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trial Information */}
      {data.planData?.trialDays && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className={`${anton.className} uppercase text-lg font-bold mb-2 text-primary`}>
                FREE TRIAL ACTIVE
              </h3>
              <p className="text-muted-foreground mb-4">
                You have {data.planData.trialDays} days to explore all features. 
                No credit card required until your trial ends.
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-foreground">Full Access</div>
                  <div className="text-muted-foreground">All premium features</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">No Commitment</div>
                  <div className="text-muted-foreground">Cancel anytime</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground">Support Included</div>
                  <div className="text-muted-foreground">Priority assistance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="text-center pt-6">
        <Button 
          onClick={handleGetStarted} 
          disabled={loading}
         
          className="px-8"
        >
          {loading ? 'Setting up your workspace...' : 'Go to Dashboard'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Need help getting started?{' '}
          <a href="/resources/docs" className="text-primary hover:underline">
            Check out our documentation
          </a>{' '}
          or{' '}
          <a href="/contact" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
