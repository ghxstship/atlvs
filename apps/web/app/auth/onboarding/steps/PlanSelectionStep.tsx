"use client";

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@ghxstship/ui';
import { Check, ArrowRight, ArrowLeft, Zap, Users, Building, Crown } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';


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
    trialDays: 14
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
    trialDays: 14
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
    trialDays: 14
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
    trialDays: 14
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
      planData: selectedPlanData
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
    <div className="brand-ghostship stack-xl">
      <div className="brand-ghostship text-center mb-xl">
        <h1 className={`${anton.className} uppercase text-heading-2 mb-md`}>
          CHOOSE YOUR PLAN
        </h1>
        <p className="text-body color-muted max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="brand-ghostship flex justify-center">
        <div className="brand-ghostship bg-secondary p-xs rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-md py-sm rounded-md text-body-sm form-label transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background color-foreground shadow-surface'
                : 'color-muted hover:color-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-md py-sm rounded-md text-body-sm form-label transition-colors ${
              billingCycle === 'annual'
                ? 'bg-background color-foreground shadow-surface'
                : 'color-muted hover:color-foreground'
            }`}
          >
            Annual
            <Badge variant="secondary" className="ml-sm text-body-sm">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="brand-ghostship grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {plans.map((plan: any) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-primary shadow-floating scale-105'
                  : 'hover:shadow-elevated hover:scale-102'
              } ${plan.popular ? 'border-primary' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="brand-ghostship absolute -top-sm left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-accent color-accent-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-lg">
                <div className="brand-ghostship text-center mb-lg">
                  <Icon className="h-icon-lg w-icon-lg color-accent mx-auto mb-sm" />
                  <h3 className={`${anton.className} uppercase text-heading-4 mb-sm`}>
                    {plan.name}
                  </h3>
                  <p className="text-body-sm color-muted mb-md">
                    {plan.description}
                  </p>
                  
                  <div className="brand-ghostship mb-sm">
                    <span className="text-heading-3 color-foreground font-display">
                      {getPrice(plan)}
                    </span>
                    {plan.price && (
                      <span className="color-muted text-body">
                        /{billingCycle === 'annual' ? 'month' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {billingCycle === 'annual' && plan.price && (
                    <p className="text-body-sm color-success">
                      Save ${getAnnualSavings(plan)} per year
                    </p>
                  )}
                  
                  <p className="text-body-sm color-muted mt-sm">
                    {plan.trialDays}-day free trial
                  </p>
                </div>

                <ul className="stack-sm mb-lg">
                  {plan.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-start cluster-sm">
                      <Check className="h-icon-xs w-icon-xs color-success mt-0.5 flex-shrink-0" />
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
      <div className="brand-ghostship flex justify-between pt-lg">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="mr-sm h-icon-xs w-icon-xs" />
          Back
        </Button>
        
        <Button onClick={handleContinue} disabled={loading}>
          {loading ? 'Processing...' : 'Continue'}
          <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="brand-ghostship text-center pt-xl border-t border-border">
        <p className="text-body-sm color-muted mb-md">
          Trusted by 10,000+ creative professionals worldwide
        </p>
        <div className="brand-ghostship flex justify-center cluster-xl text-body-sm color-muted">
          <div>✓ 99.9% Uptime</div>
          <div>✓ 24/7 Support</div>
          <div>✓ Cancel Anytime</div>
          <div>✓ 30-Day Money Back</div>
        </div>
      </div>
    </div>
  );
}
