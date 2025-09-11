'use client';

import React from 'react';
import { CheckCircle, Zap, Shield, Globe } from 'lucide-react';

export function ProductHighlights() {
  const highlights = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built on Next.js 14 with edge runtime for optimal performance',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Multi-tenant RBAC with row-level security and audit logging',
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Deploy to edge locations worldwide with Vercel infrastructure',
    },
    {
      icon: CheckCircle,
      title: 'Production Ready',
      description: 'Complete with monitoring, analytics, and error tracking',
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose GHXSTSHIP?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by developers, for developers. Every feature is designed with enterprise needs in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <highlight.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {highlight.title}
              </h3>
              <p className="text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
