'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Badge } from '@ghxstship/ui';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../_components/lib/utils';
import { typography } from '../../_components/lib/typography';
import { layouts } from '../../_components/lib/layouts';
import { Section, SectionHeader } from '../../_components/marketing/layout/Section';
import { PricingCard } from "../../_components/marketing/PricingCard";
import { PricingToggle } from '../../_components/marketing/pricing/PricingToggle';
import { TrustIndicators } from '../../_components/marketing/pricing/TrustIndicators';
import { AddOnCard } from '../../_components/marketing/pricing/AddOnCard';
import { FAQSection } from '../../_components/marketing/pricing/FAQSection';

const plans = [
  {
    id: 'community',
    name: 'Community',
    description: 'Perfect for freelancers and solo creators getting started',
    monthlyPrice: 12,
    annualPrice: 120,
    features: [
      { name: 'Single user account', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'Basic talent discovery', included: true },
      { name: 'Community forums', included: true },
      { name: '5 active projects', included: true },
      { name: 'File storage (5GB)', included: true },
      { name: 'Email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'ATLVS project management', included: false },
      { name: 'Team collaboration', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Custom workflows', included: false },
      { name: 'API access', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals who need full creative production power',
    monthlyPrice: 24,
    annualPrice: 240,
    features: [
      { name: 'Single user account', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'ATLVS project management', included: true },
      { name: 'Advanced talent matching', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'File storage (50GB)', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Basic analytics & reporting', included: true },
      { name: 'Custom project templates', included: true },
      { name: 'Team collaboration', included: false },
      { name: 'Advanced workflows', included: false },
      { name: 'API access', included: false },
      { name: 'SSO integration', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For growing teams ready to scale their creative operations',
    monthlyPrice: 36,
    annualPrice: 360,
    features: [
      { name: 'Up to 10 team members', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'ATLVS project management', included: true },
      { name: 'Team collaboration tools', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'File storage (500GB)', included: true },
      { name: 'Priority support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Advanced analytics & reporting', included: true },
      { name: 'Custom workflows', included: true },
      { name: 'Role-based permissions', included: true },
      { name: 'Team performance insights', included: true },
      { name: 'API access', included: false },
      { name: 'GXTEWAY Open Source Ticketing', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'vessel',
    name: 'Vessel',
    description: 'Single project enterprise solution with advanced ticketing',
    monthlyPrice: 60,
    annualPrice: 600,
    features: [
      { name: 'Unlimited team members', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'ATLVS project management', included: true },
      { name: 'OPVS video production suite', included: true },
      { name: 'GXTEWAY Open Source Ticketing', included: true },
      { name: 'Single project focus', included: true },
      { name: 'Enterprise file storage (1TB)', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'Advanced enterprise analytics', included: true },
      { name: 'Custom integrations & workflows', included: true },
      { name: 'SSO & enterprise security', included: true },
      { name: 'Full API access', included: true },
      { name: 'White-label solutions', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'fleet',
    name: 'Fleet',
    description: 'Enterprise-grade solution for large organizations and studios',
    monthlyPrice: 96,
    annualPrice: 960,
    features: [
      { name: 'Unlimited users & teams', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'ATLVS project management', included: true },
      { name: 'OPVS video production suite', included: true },
      { name: 'GXTEWAY Open Source Ticketing', included: true },
      { name: 'Unlimited projects & regions', included: true },
      { name: 'Enterprise file storage (10TB+)', included: true },
      { name: '24/7 dedicated support', included: true },
      { name: 'White-label solutions', included: true },
      { name: 'Advanced enterprise analytics', included: true },
      { name: 'Custom integrations & workflows', included: true },
      { name: 'SSO & enterprise security', included: true },
      { name: 'Full API access', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Tailored solutions for unique enterprise requirements',
    monthlyPrice: 'Contact Sales',
    annualPrice: 0,
    features: [
      { name: 'Everything in Fleet', included: true },
      { name: 'Custom feature development', included: true },
      { name: 'On-premise deployment options', included: true },
      { name: 'Custom SLA agreements', included: true },
      { name: 'Dedicated infrastructure', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Training & onboarding', included: true },
      { name: '24/7 white-glove support', included: true },
      { name: 'Custom branding & theming', included: true },
      { name: 'Advanced compliance features', included: true },
      { name: 'Multi-region deployment', included: true },
      { name: 'Custom reporting & analytics', included: true },
      { name: 'Priority feature requests', included: true },
      { name: 'Dedicated success manager', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const addOns = [
  {
    name: 'GXTEWAY Open Source Ticketing',
    description: 'Advanced ticketing solution for events and access control',
    price: 'Included in Vessel+',
    features: ['Event ticketing', 'Access control', 'Attendee management', 'Real-time analytics'],
  },
  {
    name: 'Advanced Security',
    description: 'Enterprise-grade security for mission-critical operations',
    price: 49,
    features: ['Advanced encryption', 'Audit logs', 'Compliance reporting', 'Security monitoring'],
  },
  {
    name: 'Premium Support',
    description: 'Dedicated support when you need it most',
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
    question: 'What\'s the difference between Vessel and Fleet plans?',
    answer: 'Vessel is designed for single project enterprises with advanced ticketing, while Fleet supports unlimited projects and regions with additional white-label solutions and dedicated account management.',
  },
  {
    question: 'What is GXTEWAY Open Source Ticketing?',
    answer: 'GXTEWAY is our open-source ticketing solution included with Vessel, Fleet, and Custom plans. It provides comprehensive event ticketing, access control, and attendee management capabilities.',
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section variant="hero">
        <SectionHeader 
          badge="Pricing Plans"
          title={<>PLANS THAT GROW<br />WITH YOU</>}
          subtitle="Start your free 14-day trial, no credit card required. Choose the perfect plan for your team and scale as you grow."
        />
        <div className="flex justify-center mt-xl">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>
        {isAnnual && (
          <div className="text-center mt-md">
            <Badge variant="success" className="px-md py-xs">
              Save up to 17% with annual billing
            </Badge>
          </div>
        )}
      </Section>

      {/* Pricing Cards */}
      <Section>
        <div className={cn(layouts.gridPricing, "relative z-0 pt-2xl")}>
          {plans.map((plan) => {
            let price: number | string;
            let yearlyPrice: number | undefined;
            
            if (typeof plan.monthlyPrice === 'string') {
              price = plan.monthlyPrice;
              yearlyPrice = undefined;
            } else {
              price = isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice;
              yearlyPrice = isAnnual ? plan.annualPrice : undefined;
            }
            
            return (
              <PricingCard
                key={plan.id}
                title={plan.name}
                description={plan.description}
                price={price}
                yearlyPrice={yearlyPrice}
                features={plan.features.map(f => f.name)}
                excludedFeatures={plan.features.filter(f => !f.included).map(f => f.name)}
                ctaText={plan.cta}
                ctaHref={plan.id === 'custom' || plan.id === 'fleet' ? '/contact' : '/auth/signup'}
                popular={plan.popular}
                icon={ArrowRight}
              />
            );
          })}
        </div>
        <TrustIndicators />
      </Section>

      {/* Add-ons Section */}
      <Section variant="muted">
        <SectionHeader 
          title="ENHANCE YOUR PLAN"
          subtitle="Supercharge your workflow with powerful add-ons designed to extend your GHXSTSHIP experience."
        />
        <div className="grid md:grid-cols-3 gap-lg lg:gap-xl">
          {addOns.map((addon) => (
            <AddOnCard key={addon.name} addon={addon} />
          ))}
        </div>
      </Section>

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />

      {/* CTA Section */}
      <Section variant="cta">
        <SectionHeader 
          title="READY TO GET STARTED?"
          subtitle="Join thousands of creative professionals who have transformed their workflows with GHXSTSHIP."
        />
        <div className="flex flex-col sm:flex-row gap-md justify-center items-center">
          <Link href="/auth/signup">
            <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105 min-h-[44px] flex items-center justify-center gap-sm whitespace-nowrap">
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="w-full sm:w-auto transition-all duration-200 hover:scale-105 min-h-[44px] flex items-center justify-center whitespace-nowrap">
              Contact Sales
            </Button>
          </Link>
        </div>
      </Section>
    </div>
  );
}
