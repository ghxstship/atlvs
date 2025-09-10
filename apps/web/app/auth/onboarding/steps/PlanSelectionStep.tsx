"use client";

import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@ghxstship/ui';
import { Check, ArrowRight, ArrowLeft, Zap, Users, Building } from 'lucide-react';
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
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individual creators and small teams',
    icon: Zap,
    features: [
      'Up to 5 projects',
      '10GB storage',
      'Basic collaboration',
      'Email support',
      'ATLVS access',
      'Mobile app'
    ],
    popular: false,
    trialDays: 14,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'Ideal for growing creative teams',
    icon: Users,
    features: [
      'Unlimited projects',
      '100GB storage',
      'Advanced collaboration',
      'Priority support',
      'ATLVS + OPENDECK access',
      'Custom integrations',
      'Advanced analytics',
      'Team management'
    ],
    popular: true,
    trialDays: 14,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations with specific needs',
    icon: Building,
    features: [
      'Everything in Professional',
      'Unlimited storage',
      'Dedicated account manager',
      'Custom workflows',
      'SSO integration',
      'Advanced security',
      'Custom contracts',
      'White-label options'
    ],
    popular: false,
    trialDays: 30,
  },
];

export function PlanSelectionStep({ onNext, onBack, updateData, data }: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || 'professional');
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
    const price = billingCycle === 'annual' ? Math.round(plan.price * 0.8) : plan.price;
    return `$${price}`;
  };

  const getAnnualSavings = (plan: typeof plans[0]) => {
    if (!plan.price) return 0;
    return Math.round(plan.price * 12 * 0.2);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className={`${anton.className} uppercase text-3xl font-bold mb-4`}>
          CHOOSE YOUR PLAN
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
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
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className={`${anton.className} uppercase text-xl font-bold mb-2`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-foreground">
                      {getPrice(plan)}
                    </span>
                    {plan.price && (
                      <span className="text-muted-foreground">
                        /{billingCycle === 'annual' ? 'month' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  {billingCycle === 'annual' && plan.price && (
                    <p className="text-sm text-green-600">
                      Save ${getAnnualSavings(plan)} per year
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {plan.trialDays}-day free trial
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
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
        
        <Button size="lg">
          {loading ? 'Processing...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Trust Signals */}
      <div className="text-center pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">
          Trusted by 10,000+ creative professionals worldwide
        </p>
        <div className="flex justify-center space-x-8 text-xs text-muted-foreground">
          <div>✓ 99.9% Uptime</div>
          <div>✓ 24/7 Support</div>
          <div>✓ Cancel Anytime</div>
          <div>✓ 30-Day Money Back</div>
        </div>
      </div>
    </div>
  );
}
