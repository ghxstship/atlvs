'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Badge } from '@ghxstship/ui';
import { ArrowRight } from 'lucide-react';
import { cn } from '@ghxstship/ui/system';
import { typography } from '../lib/typography';
import { layouts } from '../lib/layouts';
import { Section, SectionHeader } from '../components/layout/Section';
import { PricingCard } from '../components/ui/PricingCard';
import { PricingToggle } from '../components/pricing/PricingToggle';
import { TrustIndicators } from '../components/pricing/TrustIndicators';
import { AddOnCard } from '../components/pricing/AddOnCard';
import { FAQSection } from '../components/pricing/FAQSection';
import { CTAGroup } from '../components/ui/CTAButton';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams who want to stop drowning in spreadsheets',
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
    description: 'For teams tired of juggling 47 different production apps',
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
    description: 'For big teams who need production management that actually scales',
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
    description: 'Find crew who actually show up and answer their phones',
    price: 19,
    features: ['Talent marketplace access', 'Resource library', 'Global network', 'AI matching'],
  },
  {
    name: 'Advanced Security',
    description: 'Extra security for when you\'re paranoid (but rightfully so)',
    price: 39,
    features: ['Advanced encryption', 'Audit logs', 'Compliance reporting', 'Security monitoring'],
  },
  {
    name: 'Premium Support',
    description: 'When you need humans who actually know what they\'re talking about',
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section variant="hero">
        <SectionHeader 
          badge="Pricing Plans"
          title={<>SIMPLE,<br />TRANSPARENT PRICING</>}
          subtitle="Choose the perfect plan for your team. All plans include a 14-day free trial with full access to features. No credit card required."
        />
        <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
      </Section>

      {/* Pricing Cards */}
      <Section>
        <div className={layouts.gridPricing}>
          {plans.map((plan) => {
            const price = isAnnual ? Math.floor(plan.annualPrice / 12) : plan.monthlyPrice;
            const yearlyPrice = isAnnual ? plan.annualPrice : undefined;
            
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
                ctaHref={plan.id === 'enterprise' ? '/contact' : '/auth/signup'}
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
        <div className="grid md:grid-cols-3 gap-8">
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
        <CTAGroup>
          <Link href="/auth/signup">
            <Button className="w-full sm:w-auto group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="w-full sm:w-auto">
              Contact Sales
            </Button>
          </Link>
        </CTAGroup>
      </Section>
    </div>
  );
}
