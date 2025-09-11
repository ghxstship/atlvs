import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Play, CheckCircle, Zap, Globe } from 'lucide-react';
import { typography } from './lib/typography';
import { HeroSection } from './components/HeroSection';
import { FeatureCard } from './components/ui/FeatureCard';
import { CTASection } from './components/CTASection';

export const metadata: Metadata = {
  title: 'GHXSTSHIP - Production Management That Actually Works',
  description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS and OPENDECK help you manage productions like a pro without losing your sanity (or your budget).',
  openGraph: {
    title: 'GHXSTSHIP - Production Management That Actually Works',
    description: 'Stop drowning in spreadsheets and Slack chaos. ATLVS and OPENDECK help you manage productions like a pro without losing your sanity.',
    url: 'https://ghxstship.com',
  },
};

export default function RootPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

        {/* Product Showcase */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                Our Products
              </Badge>
              <h2 className={`mb-6 ${typography.sectionTitle}`}>
                TWO PRODUCTS THAT ACTUALLY WORK TOGETHER
              </h2>
              <p className={`${typography.sectionSubtitle} max-w-3xl mx-auto`}>
                Manage your projects with ATLVS, find talent and assets on OPENDECK. 
                It's like having a production assistant who never calls in sick.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* ATLVS Card */}
              <FeatureCard
                title="PROJECT MANAGEMENT FOR REAL HUMANS"
                description="Track everything from crew schedules to budget burns without wanting to throw your laptop out the window. Built by someone who's managed $15M+ in productions."
                icon={Zap}
                badge="ATLVS"
                gradient="from-primary to-secondary"
                variant="hover"
                className="p-8"
              />
              
              {/* OPENDECK Card */}
              <FeatureCard
                title="TALENT & ASSETS THAT DON'T GHOST YOU"
                description="Find verified crew, book reliable vendors, and source assets from people who actually show up. No more last-minute 'sorry, can't make it' texts."
                icon={Globe}
                badge="OPENDECK"
                gradient="from-success to-accent"
                variant="hover"
                className="p-8"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link href="/products/atlvs">
                <Button className="group transition-all duration-200 hover:scale-105">
                  Explore ATLVS
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/products/opendeck">
                <Button variant="outline" className="group transition-all duration-200 hover:scale-105">
                  Explore OPENDECK
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <CTASection />
    </div>
  );
}
