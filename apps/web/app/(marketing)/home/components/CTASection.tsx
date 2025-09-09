'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function CTASection() {
  const benefits = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Full access to all features',
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Join thousands of companies already using GHXSTSHIP to scale their operations
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="group">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Talk to Sales
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/70">
          Questions? Check out our{' '}
          <Link href="/docs" className="underline hover:text-white">
            documentation
          </Link>{' '}
          or{' '}
          <Link href="/support" className="underline hover:text-white">
            contact support
          </Link>
        </p>
      </div>
    </section>
  );
}
