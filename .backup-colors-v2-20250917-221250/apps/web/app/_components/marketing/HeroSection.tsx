'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle, Star, Users, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev: any) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 pointer-events-none left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 pointer-events-none right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-lg px-md py-smxl lg:py-smxl relative">
        <div className="grid lg:grid-cols-2 gap-xsxl items-center">
          {/* Left Column - Content */}
          <div className="stack-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-xl px-md py-md rounded-full bg-primary/10 color-primary text-body-sm form-label">
              <Zap className="h-4 w-4" />
              Now with AI-powered insights
            </div>

            {/* Main Headline */}
            <div className="stack-2xl">
              <h1 className="hero-title">
                THE FUTURE OF
                <br />
                <span className="text-gradient-primary">
                  PRODUCTION
                </span>
                <br />
                MANAGEMENT
              </h1>
              
              {/* Dynamic Feature Highlight */}
              <div className="h-8 flex items-center">
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
              {features.map((feature, index) => (
                <div key={feature} className="flex items-center gap-xl">
                  <CheckCircle className="h-5 w-5 color-primary flex-shrink-0" />
                  <span className="text-body-sm color-muted">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-xl">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto group">
                <Play className="mr-sm h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-xl pt-xl border-t">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-xl mb-xs">
                      <Icon className="h-5 w-5 color-primary" />
                      <span className="text-heading-3 color-primary">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-body-sm color-muted">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Dashboard Preview */}
            <div className="relative bg-background border rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-xl px-md py-sm bg-secondary/50 border-b">
                <div className="flex gap-xl">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-xl px-sm py-xs bg-background rounded-md text-body-sm color-muted">
                    <div className="w-3 h-3 color-success">🔒</div>
                    app.ghxstship.com
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-lg stack-2xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="card-title">BLACKWATER REVERB</h3>
                    <p className="text-body-sm color-muted">Main Deck Takeover</p>
                  </div>
                  <div className="flex items-center gap-xl">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-body-sm color-muted">Live</span>
                  </div>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-3 gap-xl">
                  <div className="bg-secondary/30 rounded-lg p-sm">
                    <div className="text-body-sm color-muted mb-xs">Budget</div>
                    <div className="text-heading-4">$75K</div>
                    <div className="w-full bg-secondary rounded-full h-1 mt-xs">
                      <div className="bg-primary h-1 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-sm">
                    <div className="text-body-sm color-muted mb-xs">Timeline</div>
                    <div className="text-heading-4">85%</div>
                    <div className="w-full bg-secondary rounded-full h-1 mt-xs">
                      <div className="bg-accent h-1 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-sm">
                    <div className="text-body-sm color-muted mb-xs">Team</div>
                    <div className="text-heading-4">12</div>
                    <div className="flex -cluster-xs mt-xs">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-4 h-4 bg-primary rounded-full border border-background"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="stack-2xl">
                  <div className="text-body-sm form-label color-muted">Recent Activity</div>
                  {[
                    { user: 'Captain Blackwater', action: 'approved budget revision', time: '2m ago' },
                    { user: 'First Mate Torres', action: 'updated crew schedule', time: '5m ago' },
                    { user: 'Quartermaster Jin', action: 'ordered new equipment', time: '12m ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-xl text-body-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="form-label">{activity.user}</span>
                      <span className="color-muted">{activity.action}</span>
                      <span className="color-muted ml-auto">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-primary color-primary-foreground rounded-full p-sm shadow-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent color-accent-foreground rounded-full p-sm shadow-lg">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
