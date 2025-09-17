"use client";

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@ghxstship/ui';
import { Check, ArrowRight, ArrowLeft, Zap, Users, Building, Crown } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

interface PlanSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
  updateData: (data: any) => void;
  data: any;
}

const plans = [
  {
    id: 'community',
    name: 'Community',
    price: 9,
    period: 'month',
    description: 'Perfect for freelancers and solo creators getting started',
    icon: Zap,
    features: [
      'Single user account',
      'OPENDECK marketplace access',
      'Basic talent discovery',
      'Community forums',
      '5 active projects',
      'File storage (5GB)',
      'Email support',
      'Mobile app access'
    ],
    popular: false,
    trialDays: 14,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For professionals who need full creative production power',
    icon: Users,
    features: [
      'Single user account',
      'OPENDECK marketplace access',
      'ATLVS project management',
      'Advanced talent matching',
      'Unlimited projects',
      'File storage (50GB)',
      'Priority email support',
      'Mobile app access',
      'Basic analytics & reporting',
      'Custom project templates'
    ],
    popular: false,
    trialDays: 14,
  },
  {
    id: 'team',
    name: 'Team',
    price: 99,
    period: 'month',
    description: 'For growing teams ready to scale their creative operations',
    icon: Building,
    features: [
      'Unlimited team members',
      'OPENDECK marketplace access',
      'ATLVS project management',
      'Team collaboration tools',
      'Unlimited projects',
      'File storage (500GB)',
      'Priority support',
      'Mobile app access',
      'Advanced analytics & reporting',
      'Custom workflows',
      'Role-based permissions',
      'Team performance insights'
    ],
    popular: true,
    trialDays: 14,
  },
  {
    id: 'fleet',
    name: 'Fleet',
    price: 999,
    period: 'month',
    description: 'Enterprise-grade solution for large organizations and studios',
    icon: Crown,
    features: [
      'Unlimited users & teams',
      'OPENDECK marketplace access',
      'ATLVS project management',
      'OPVS video production suite',
      'MVNIFEST content distribution',
      'Unlimited projects & regions',
      'Enterprise file storage (10TB+)',
      '24/7 dedicated support',
      'White-label solutions',
      'Advanced enterprise analytics',
      'Custom integrations & workflows',
      'SSO & enterprise security',
      'Full API access',
      'Dedicated account manager'
    ],
    popular: false,
    trialDays: 14,
  },
];

export function PlanSelectionStep({ onNext, onBack, updateData, data }: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || 'team');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(data.billingCycle || 'monthly');
  const [loading, setLoading] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    setLoading(true);
    
    const selectedPlanData = plans.find(p => p.id === selectedPlan);
    
    updateData({
      selectedPlan,
      billingCycle,
      planData: selectedPlanData,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    onNext();
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (!plan.price) return 'Custom';
    
    // Use actual annual pricing from marketing page
    const annualPrices: { [key: string]: number } = {
      community: 6, // $72/year = $6/month
      pro: 19,      // $232/year = ~$19/month
      team: 66,     // $792/year = $66/month
      fleet: 666    // $7992/year = $666/month
    };
    
    const price = billingCycle === 'annual' ? annualPrices[plan.id] || plan.price : plan.price;
    return `$${price}`;
  };

  const getAnnualSavings = (plan: typeof plans[0]) => {
    if (!plan.price) return 0;
    
    const annualTotals: { [key: string]: number } = {
      community: 36, // $108 - $72 = $36 saved
      pro: 116,      // $348 - $232 = $116 saved  
      team: 396,     // $1188 - $792 = $396 saved
      fleet: 3996    // $11988 - $7992 = $3996 saved
    };
    
    return annualTotals[plan.id] || 0;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`${anton.className} uppercase text-heading-2 text-heading-3 mb-4`}>
          CHOOSE YOUR PLAN
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-secondary p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-body-sm form-label transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background color-foreground shadow-sm'
                : 'color-muted hover:color-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md text-body-sm form-label transition-colors ${
              billingCycle === 'annual'
                ? 'bg-background color-foreground shadow-sm'
                : 'color-muted hover:color-foreground'
            }`}
          >
            Annual
            <Badge variant="secondary" className="ml-2 text-body-sm">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:shadow-md hover:scale-102'
              } ${plan.popular ? 'border-primary' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary color-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Icon className="h-8 w-8 color-primary mx-auto mb-3" />
                  <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-2`}>
                    {plan.name}
                  </h3>
                  <p className="text-body-sm color-muted mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-2">
                    <span className="text-heading-2 text-heading-3 color-foreground">
                      {getPrice(plan)}
                    </span>
                    {plan.price && (
                      <span className="color-muted">
                        /{billingCycle === 'annual' ? 'month' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {billingCycle === 'annual' && plan.price && (
                    <p className="text-body-sm color-success">
                      Save ${getAnnualSavings(plan)} per year
                    </p>
                  )}
                  
                  <p className="text-body-sm color-muted mt-2">
                    {plan.trialDays}-day free trial
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 color-success mt-0.5 flex-shrink-0" />
                      <span className="text-body-sm color-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {isSelected ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button onClick={handleContinue} disabled={loading}>
          {loading ? 'Processing...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="text-center pt-8 border-t border-border">
        <p className="text-body-sm color-muted mb-4">
          Trusted by 10,000+ creative professionals worldwide
        </p>
        <div className="flex justify-center space-x-8 text-body-sm color-muted">
          <div>✓ 99.9% Uptime</div>
          <div>✓ 24/7 Support</div>
          <div>✓ Cancel Anytime</div>
          <div>✓ 30-Day Money Back</div>
        </div>
      </div>
    </div>
  );
}
