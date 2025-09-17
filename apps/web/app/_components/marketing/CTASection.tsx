'use client';

import Link from 'next/link';
import { Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';
import { Button } from '@ghxstship/ui';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-md">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-heading-1">
              READY TO TRANSFORM
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                YOUR PRODUCTION?
              </span>
            </h2>
            <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
              Join thousands of creative professionals who have revolutionized their workflows 
              with GHXSTSHIP. Start your free trial today and experience the future of production management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center mb-8">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
                  Explore Products
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-lg text-body-sm color-muted">
              <div className="flex items-center gap-sm">
                <CheckCircle className="h-4 w-4 color-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-sm">
                <Star className="h-4 w-4 color-warning" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-sm">
                <Zap className="h-4 w-4 color-primary" />
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-lg mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <CheckCircle className="h-8 w-8 color-primary" />
              </div>
              <h3 className="text-heading-3 mb-4">Quick Setup</h3>
              <p className="color-muted mb-6">
                Get started in minutes with our guided onboarding process and pre-built templates.
              </p>
              <div className="text-body-sm color-muted">
                Average setup time: <span className="text-heading-4 color-primary">5 minutes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Star className="h-8 w-8 color-accent" />
              </div>
              <h3 className="text-heading-3 mb-4">Expert Support</h3>
              <p className="color-muted mb-6">
                Get help from our team of production experts available 24/7 via chat, email, or phone.
              </p>
              <div className="text-body-sm color-muted">
                Response time: <span className="text-heading-4 color-accent">Under 2 hours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
                <Zap className="h-8 w-8 color-success" />
              </div>
              <h3 className="text-heading-3 mb-4">Instant Results</h3>
              <p className="color-muted mb-6">
                See immediate improvements in efficiency and collaboration from day one.
              </p>
              <div className="text-body-sm color-muted">
                Average improvement: <span className="text-heading-4 color-success">40% faster</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-muted/50 to-muted/30 border-muted">
            <CardContent className="p-xl">
              <h3 className="text-heading-2 mb-4">
                Need a Custom Solution?
              </h3>
              <p className="color-muted mb-6">
                Our enterprise team can help you build a tailored solution that fits your specific needs and scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/contact">
                  <Button className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
                    Contact Sales
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
