'use client';

import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';

import { MarketingSection, MarketingSectionHeader, MarketingCard } from './layout/Section';

export function CTASection() {
  const actions = (
    <div className="cluster-lg flex-wrap justify-center">
      <Link href="/auth/signup">
        <Button className="marketing-interactive w-full sm:w-auto">
          Start Free Trial
          <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
        </Button>
      </Link>
      <Link href="/products">
        <Button variant="outline" className="marketing-interactive w-full sm:w-auto">
          Explore Products
        </Button>
      </Link>
    </div>
  );

  return (
    <MarketingSection variant="gradient" padding="lg">
      <div className="stack-4xl">
        <MarketingSectionHeader
          eyebrow="Start Today"
          title="READY TO TRANSFORM YOUR PRODUCTION?"
          highlight="YOUR PRODUCTION?"
          description="Join thousands of creative professionals who have revolutionized their workflows with GHXSTSHIP. Start your free trial today and experience the future of production management."
          actions={actions}
        />

        <div className="cluster-lg flex-wrap justify-center marketing-microcopy">
          <div className="marketing-tag">
            <CheckCircle className="h-icon-xs w-icon-xs" />
            <span>No credit card required</span>
          </div>
          <div className="marketing-tag">
            <Star className="h-icon-xs w-icon-xs" />
            <span>14-day free trial</span>
          </div>
          <div className="marketing-tag">
            <Zap className="h-icon-xs w-icon-xs" />
            <span>Setup in minutes</span>
          </div>
        </div>

        <div className="grid gap-lg md:grid-cols-3">
          <MarketingCard
            className="items-center text-center"
            title="Quick Setup"
            description="Get started in minutes with guided onboarding flows and pre-built templates."
            icon={<CheckCircle className="h-icon-lg w-icon-lg" />}
            accent="primary"
            footer={
              <div className="stack-xs items-center text-center">
                <span className="marketing-microcopy">Average Setup Time</span>
                <span className="text-heading-4 text-heading-foreground">5 MINUTES</span>
              </div>
            }
          />
          <MarketingCard
            className="items-center text-center"
            title="Expert Support"
            description="Production specialists are available 24/7 via chat, email, and phone."
            icon={<Star className="h-icon-lg w-icon-lg" />}
            accent="warning"
            footer={
              <div className="stack-xs items-center text-center">
                <span className="marketing-microcopy">Response Time</span>
                <span className="text-heading-4 text-heading-foreground">UNDER 2 HOURS</span>
              </div>
            }
          />
          <MarketingCard
            className="items-center text-center"
            title="Instant Results"
            description="See measurable gains in efficiency, collaboration, and delivery speed from day one."
            icon={<Zap className="h-icon-lg w-icon-lg" />}
            accent="success"
            footer={
              <div className="stack-xs items-center text-center">
                <span className="marketing-microcopy">Average Improvement</span>
                <span className="text-heading-4 text-heading-foreground">40% FASTER</span>
              </div>
            }
          />
        </div>

        <div className="marketing-card marketing-interactive mx-auto max-w-2xl text-center p-xl">
          <h3 className="text-heading-2 mb-sm text-heading-foreground">Need a Custom Solution?</h3>
          <p className="marketing-microcopy mb-md">
            Our enterprise team will help you tailor workflows, integrations, and automations for your exact scale.
          </p>
          <div className="cluster-lg flex-wrap justify-center">
            <Link href="/contact">
              <Button className="marketing-interactive w-full sm:w-auto">Contact Sales</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="marketing-interactive w-full sm:w-auto">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
