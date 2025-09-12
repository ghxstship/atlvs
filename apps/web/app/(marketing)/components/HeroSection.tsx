'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle, Star, Users, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
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
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              Now with AI-powered insights
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold tracking-tight text-foreground uppercase`}>
                THE FUTURE OF
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  PRODUCTION
                </span>
                <br />
                MANAGEMENT
              </h1>
              
              {/* Dynamic Feature Highlight */}
              <div className="h-8 flex items-center">
                <p className="text-xl text-muted-foreground">
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
            <p className="text-lg text-muted-foreground max-w-xl">
              ATLVS and OPENDECK combine to deliver the most comprehensive enterprise production 
              management and marketplace platform. Streamline workflows, connect with talent, 
              and scale your creative operations with confidence.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto group">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className={`${anton.className} text-2xl font-bold text-foreground uppercase`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
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
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-xs text-muted-foreground">
                    <div className="w-3 h-3 text-success">🔒</div>
                    app.ghxstship.com
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>BLACKWATER REVERB</h3>
                    <p className="text-sm text-muted-foreground">Main Deck Takeover</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Budget</div>
                    <div className="font-semibold">$75K</div>
                    <div className="w-full bg-muted rounded-full h-1 mt-2">
                      <div className="bg-primary h-1 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                    <div className="font-semibold">85%</div>
                    <div className="w-full bg-muted rounded-full h-1 mt-2">
                      <div className="bg-accent h-1 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Team</div>
                    <div className="font-semibold">12</div>
                    <div className="flex -space-x-1 mt-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-4 h-4 bg-primary rounded-full border border-background"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Recent Activity</div>
                  {[
                    { user: 'Captain Blackwater', action: 'approved budget revision', time: '2m ago' },
                    { user: 'First Mate Torres', action: 'updated crew schedule', time: '5m ago' },
                    { user: 'Quartermaster Jin', action: 'ordered new equipment', time: '12m ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-muted-foreground">{activity.action}</span>
                      <span className="text-muted-foreground ml-auto">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground rounded-full p-3 shadow-lg">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
