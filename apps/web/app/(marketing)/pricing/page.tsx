'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Badge } from '@ghxstship/ui';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
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
    id: 'community',
    name: 'Community',
    description: 'Perfect for freelancers and solo creators getting started',
    monthlyPrice: 9,
    annualPrice: 90,
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
    monthlyPrice: 29,
    annualPrice: 290,
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
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For growing teams ready to scale their creative operations',
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      { name: 'Unlimited team members', included: true },
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
      { name: 'Enterprise features', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'fleet',
    name: 'Fleet',
    description: 'Enterprise-grade solution for large organizations and studios',
    monthlyPrice: 999,
    annualPrice: 9990,
    features: [
      { name: 'Unlimited users & teams', included: true },
      { name: 'OPENDECK marketplace access', included: true },
      { name: 'ATLVS project management', included: true },
      { name: 'OPVS video production suite', included: true },
      { name: 'MVNIFEST content distribution', included: true },
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
        <div className={cn(layouts.gridPricing, "relative z-0 pt-6")}>
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
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105 min-h-[44px] flex items-center justify-center gap-2 whitespace-nowrap">
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
