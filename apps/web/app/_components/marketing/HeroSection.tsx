'use client';


import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Play, Star, Users, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '@ghxstship/ui';
import { OctopusDoodle } from './OctopusDoodle';

const stats = [
  { label: 'Active Users', value: '50K+', icon: Users },
  { label: 'Projects Completed', value: '100K+', icon: CheckCircle },
  { label: 'Enterprise Clients', value: '500+', icon: Star },
  { label: 'Uptime', value: '99.9%', icon: Zap },
];

const features = [
  'Complete production management suite',
  'Integrated marketplace platform',
  'Enterprise-grade security & compliance',
  'Real-time collaboration tools',
];

export function HeroSection() {
  const [currentFeature, setCurrentFeature] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev: number) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={cn(
        // Keep background styling
        "relative overflow-hidden bg-gradient-subtle",
        // Use min-height instead of fixed height for better flexibility
        "min-h-screen",
        // Account for fixed header by adding top padding
        "pt-20",
        // Vertically center the main hero content within available space
        "flex items-center justify-center",
        // Minimal bottom padding
        "pb-md"
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 pointer-events-none left-1/4 w-container-lg h-container-lg bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 pointer-events-none right-1/4 w-container-lg h-container-lg bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-lg py-0 relative">
        <div className="grid lg:grid-cols-2 gap-smxl items-center">
          {/* Left Column - Content */}
          <div className="stack-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-sm px-md py-sm rounded-full bg-accent color-accent-foreground text-body-sm form-label">
              <Zap className="h-icon-xs w-icon-xs" />
              Now with AI-powered insights
            </div>

            {/* Main Headline */}
            <div className="stack-2xl">
              <h1 className="text-display text-foreground uppercase">
                THE FUTURE OF
                <br />
                <span className="text-gradient-accent">
                  PRODUCTION
                </span>
                <br />
                MANAGEMENT
              </h1>
              
              {/* Dynamic Feature Highlight */}
              <div className="h-icon-lg flex items-center">
                <p className="text-heading-4 color-muted">
                  {features.map((feature, index) => (
                    <span
                      key={feature}
                      className={cn(
                        "absolute",
                        "transition-all duration-300 ease-in-out",
                        index === currentFeature
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-body color-muted max-w-xl">
              ATLVS and OPENDECK combine to deliver the most comprehensive enterprise production 
              management and marketplace platform. Streamline workflows, connect with talent, 
              and scale your creative operations with confidence.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-xl">
              {features.map((feature, _index) => (
                <div key={feature} className="flex items-center gap-xl">
                  <CheckCircle className="h-icon-sm w-icon-sm color-accent flex-shrink-0" />
                  <span className="text-body-sm color-muted">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-md">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                <Play className="mr-sm h-icon-xs w-icon-xs" />
                Watch Demo
              </Button>
            </div>

          </div>

          {/* Right Column - Octopus Doodle Animation */}
          <div className="relative">
            <OctopusDoodle variant="dashboard" className="w-full h-full" />
          </div>
        </div>

        {/* Stats - full width under both columns */}
        <div className="mt-3xl pt-3xl pb-5xl border-t">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl">
            {stats.map((stat: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-xl mb-xs">
                    <Icon className="h-icon-sm w-icon-sm color-accent" />
                    <span className="text-heading-3 color-accent">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-body-sm color-muted">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
