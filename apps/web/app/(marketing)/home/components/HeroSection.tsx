'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted to-background">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-warning rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-destructive rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-border/20 mb-8">
          <Sparkles className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-foreground">Enterprise-Ready SaaS Platform</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6">
          <span className="block">Build Your Next</span>
          <span className="block bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
            Enterprise Application
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10">
          GHXSTSHIP is a comprehensive enterprise SaaS platform with 13 integrated modules, 
          multi-tenant architecture, and production-ready features out of the box.
        </p>

        {/* Features list */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-warning" />
            <span>13 Enterprise Modules</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            <span>Multi-Tenant RBAC</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Real-time Updates</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button className="group">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="border-border/20 text-foreground hover:bg-background/10">
              View Live Demo
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-border/10">
          <p className="text-sm text-muted-foreground mb-4">Trusted by leading enterprises</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {['Vercel', 'Supabase', 'Stripe', 'OpenAI', 'Anthropic'].map((company) => (
              <div key={company} className="text-foreground font-semibold text-lg">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
