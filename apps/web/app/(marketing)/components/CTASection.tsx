'use client';

import Link from 'next/link';
import { Button, Card, CardContent } from '@ghxstship/ui';
import { ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
              READY TO TRANSFORM
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                YOUR PRODUCTION?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creative professionals who have revolutionized their workflows 
              with GHXSTSHIP. Start your free trial today and experience the future of production management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products">
                <Button className="w-full sm:w-auto">
                  Explore Products
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">Quick Setup</h3>
              <p className="text-muted-foreground mb-6">
                Get started in minutes with our guided onboarding process and pre-built templates.
              </p>
              <div className="text-sm text-muted-foreground">
                Average setup time: <span className="font-semibold text-primary">5 minutes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">Expert Support</h3>
              <p className="text-muted-foreground mb-6">
                Get help from our team of production experts available 24/7 via chat, email, or phone.
              </p>
              <div className="text-sm text-muted-foreground">
                Response time: <span className="font-semibold text-accent">Under 2 hours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-title text-xl font-bold mb-4">Instant Results</h3>
              <p className="text-muted-foreground mb-6">
                See immediate improvements in efficiency and collaboration from day one.
              </p>
              <div className="text-sm text-muted-foreground">
                Average improvement: <span className="font-semibold text-green-500">40% faster</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-muted/50 to-muted/30 border-muted">
            <CardContent className="p-8">
              <h3 className="font-title text-2xl font-bold mb-4">
                Need a Custom Solution?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our enterprise team can help you build a tailored solution that fits your specific needs and scale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="w-full sm:w-auto">
                    Contact Sales
                  </Button>
                </Link>
                <Link href="/products">
                  <Button className="w-full sm:w-auto">
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
