'use client';

import Link from 'next/link';
import { Button, Badge } from '@ghxstship/ui';
import { ArrowRight, Zap } from 'lucide-react';
import { Anton } from 'next/font/google';
import { useExperiment } from '../../_lib/experiments/ExperimentProvider';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export function ExperimentalHeroSection() {
  const { variant, isLoading, trackConversion } = useExperiment('hero_headline_test');

  const handleCTAClick = () => {
    trackConversion('cta_click', 1);
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-pulse">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />

      <div className="container mx-auto px-md relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-lg animate-fade-in">
            <Zap className="h-3 w-3 mr-xs" />
            Production Management Platform
          </Badge>

          {/* Headline - A/B Test Variants */}
          {variant === 'control' && (
            <h1 className={`${anton.className} text-display lg:text-display-lg mb-lg uppercase animate-slide-up`}>
              THE FUTURE OF
              <br />
              <span className="text-gradient-accent">MANAGEMENT</span>
            </h1>
          )}

          {variant === 'variant_a' && (
            <h1 className={`${anton.className} text-display lg:text-display-lg mb-lg uppercase animate-slide-up`}>
              PRODUCTION MANAGEMENT
              <br />
              <span className="text-gradient-accent">THAT ACTUALLY WORKS</span>
            </h1>
          )}

          {variant === 'variant_b' && (
            <h1 className={`${anton.className} text-display lg:text-display-lg mb-lg uppercase animate-slide-up`}>
              STOP FIGHTING YOUR
              <br />
              <span className="text-gradient-accent">PROJECT MANAGEMENT TOOL</span>
            </h1>
          )}

          {/* Subtitle */}
          <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl animate-fade-in animation-delay-200">
            Built by someone who's managed $15M+ in productions. ATLVS and OPENDECK work together 
            so you don't have to fight your tools.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-md justify-center animate-fade-in animation-delay-400">
            <Link href="/auth/signup?source=hero_cta&variant={variant}">
              <Button 
                size="lg" 
                className="group transition-all duration-200 hover:scale-105"
                onClick={handleCTAClick}
              >
                Start Free Trial
                <ArrowRight className="ml-sm h-icon-sm w-icon-sm transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/products">
              <Button 
                size="lg" 
                variant="secondary" 
                className="transition-all duration-200 hover:scale-105"
              >
                Explore Products
              </Button>
            </Link>
          </div>

          {/* Trust Signals */}
          <div className="mt-3xl flex flex-col sm:flex-row items-center justify-center gap-xl text-body-sm color-muted animate-fade-in animation-delay-600">
            <div className="flex items-center gap-sm">
              <span className="text-heading-4 color-foreground">500+</span>
              <span>Studios Trust Us</span>
            </div>
            <div className="hidden sm:block h-icon-xs w-px bg-border" />
            <div className="flex items-center gap-sm">
              <span className="text-heading-4 color-foreground">$15M+</span>
              <span>Productions Managed</span>
            </div>
            <div className="hidden sm:block h-icon-xs w-px bg-border" />
            <div className="flex items-center gap-sm">
              <span className="text-heading-4 color-foreground">14-Day</span>
              <span>Free Trial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-icon-md h-icon-xl border-2 border-foreground/20 rounded-full flex items-start justify-center p-xs">
          <div className="w-1 h-2 bg-foreground/40 rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  );
}
