'use client';

import Link from 'next/link';
import { Button, Badge } from '@ghxstship/ui';
import { ArrowRight, Zap, Globe } from 'lucide-react';
import { Anton } from 'next/font/google';
import { typography } from '../lib/typography';
import { HeroSection } from './HeroSection';
import { FeatureCard } from './FeatureCard';
import { CTASection } from './CTASection';
import { MarketingLayoutClient } from './MarketingLayoutClient';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export function MarketingPageClient() {
  return (
    <MarketingLayoutClient>
      {/* Hero Section */}
      <HeroSection />

      {/* Product Showcase */}
      <section className="py-xsxl bg-secondary/20">
        <div className="container mx-auto px-lg px-md">
          <div className="text-center mb-xl">
            <Badge variant="secondary" className="mb-sm">
              Our Products
            </Badge>
            <h2 className={`mb-md ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              TWO PRODUCTS THAT ACTUALLY WORK TOGETHER
            </h2>
            <p className={`${typography.sectionSubtitle} max-w-3xl mx-auto`}>
              Manage your projects with ATLVS, find talent and assets on OPENDECK. 
              It's like having a production assistant who never calls in sick.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-xl max-w-6xl mx-auto">
            {/* ATLVS Card */}
            <FeatureCard
              title="PROJECT MANAGEMENT FOR REAL HUMANS"
              description="Track everything from crew schedules to budget burns without wanting to throw your laptop out the window. Built by someone who's managed $15M+ in productions."
              icon={Zap}
              label="ATLVS"
              gradient="from-primary to-secondary"
              variant="hover"
              className="p-xl"
            />
            
            {/* OPENDECK Card */}
            <FeatureCard
              title="TALENT & ASSETS THAT DON'T GHOST YOU"
              description="Find verified crew, book reliable vendors, and source assets from people who actually show up. No more last-minute 'sorry, can't make it' texts."
              icon={Globe}
              label="OPENDECK"
              gradient="from-success to-accent"
              variant="hover"
              className="p-xl"
            />
          </div>
          
          {/* Align buttons under each card for visual balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md max-w-6xl mx-auto mt-md">
            <div className="flex justify-center md:justify-start">
              <Link href="/products/atlvs">
                <Button className="group transition-all duration-200 hover:scale-105">
                  Explore ATLVS
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center md:justify-end">
              <Link href="/products/opendeck">
                <Button variant="secondary" className="group transition-all duration-200 hover:scale-105">
                  Explore OPENDECK
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CTASection />
    </MarketingLayoutClient>
  );
}
