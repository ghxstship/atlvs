'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Check, X, Zap, Shield, Users, Globe, HelpCircle } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams and individual creators',
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      { name: 'Up to 5 team members', included: true },
      { name: '10 active projects', included: true },
      { name: 'Basic project management', included: true },
      { name: 'File storage (10GB)', included: true },
      { name: 'Email support', included: true },
      { name: 'Mobile apps', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Custom workflows', included: false },
      { name: 'API access', included: false },
      { name: 'SSO integration', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing teams and agencies',
    monthlyPrice: 79,
    annualPrice: 790,
    features: [
      { name: 'Up to 25 team members', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'Advanced project management', included: true },
      { name: 'File storage (100GB)', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Mobile apps', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom workflows', included: true },
      { name: 'API access', included: true },
      { name: 'SSO integration', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    monthlyPrice: 199,
    annualPrice: 1990,
    features: [
      { name: 'Unlimited team members', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'Enterprise project management', included: true },
      { name: 'File storage (1TB)', included: true },
      { name: '24/7 phone & email support', included: true },
      { name: 'Mobile apps', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom workflows', included: true },
      { name: 'API access', included: true },
      { name: 'SSO integration', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const addOns = [
  {
    name: 'OPENDECK Marketplace Access',
    description: 'Connect with 25K+ creative professionals',
    price: 19,
    features: ['Talent marketplace access', 'Resource library', 'Global network', 'AI matching'],
  },
  {
    name: 'Advanced Security',
    description: 'Enhanced security and compliance features',
    price: 39,
    features: ['Advanced encryption', 'Audit logs', 'Compliance reporting', 'Security monitoring'],
  },
  {
    name: 'Premium Support',
    description: 'Dedicated support and training',
    price: 99,
    features: ['Dedicated account manager', 'Priority support', 'Custom training', 'Implementation assistance'],
  },
];

const faqs = [
  {
    question: 'What\'s included in the free trial?',
    answer: 'All plans include a 14-day free trial with full access to features. No credit card required to start.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee.',
  },
  {
    question: 'Do you offer discounts for nonprofits or education?',
    answer: 'Yes, we offer special pricing for qualified nonprofit organizations and educational institutions. Contact our sales team for details.',
  },
  {
    question: 'What happens if I exceed my plan limits?',
    answer: 'We\'ll notify you when you\'re approaching your limits and help you upgrade to a plan that better fits your needs.',
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Pricing Plans
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              SIMPLE,
              <br />
              TRANSPARENT PRICING
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your team. All plans include a 14-day free trial 
              with full access to features. No credit card required.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={cn("text-sm", !isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={cn(
                  "relative w-14 h-7 rounded-full transition-colors",
                  isAnnual ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute w-5 h-5 bg-white rounded-full top-1 transition-transform",
                  isAnnual ? "translate-x-8" : "translate-x-1"
                )} />
              </button>
              <span className={cn("text-sm", isAnnual ? "text-foreground font-semibold" : "text-muted-foreground")}>
                Annual
              </span>
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <Card key={plan.id} className={cn(
                "relative hover:shadow-lg transition-shadow",
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className={`${anton.className} text-2xl font-bold mb-2 uppercase`}>{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold">
                          ${isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {isAnnual && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Billed annually (${plan.annualPrice}/year)
                        </div>
                      )}
                    </div>

                    <Link href={plan.id === 'enterprise' ? '/contact' : '/auth/signup' as any as any}>
                      <Button 
                        className={cn(
                          "w-full",
                          plan.popular ? "bg-primary hover:bg-primary/90" : ""
                        )}
                        variant={plan.popular ? "primary" : "outline"}
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mb-16">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              ENHANCE YOUR PLAN
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Supercharge your workflow with powerful add-ons designed to extend 
              your GHXSTSHIP experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {addOns.map((addon) => (
              <Card key={addon.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className={`${anton.className} text-xl font-bold mb-2 uppercase`}>{addon.name}</h3>
                    <p className="text-muted-foreground mb-4">{addon.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-bold">${addon.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {addon.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Add to Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Have questions about our pricing? We've got answers.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-semibold text-foreground">{faq.question}</span>
                      <HelpCircle className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        openFaq === index ? "rotate-180" : ""
                      )} />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO GET STARTED?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creative professionals who have transformed their workflows with GHXSTSHIP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
