import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, BarChart3, ShoppingBag, Briefcase, Globe, Zap, Shield, CheckCircle } from 'lucide-react';
import { typography } from '../lib/typography';
import { Section, SectionHeader } from '../components/layout/Section';

export const metadata: Metadata = {
  title: 'Products - ATLVS & OPENDECK | GHXSTSHIP',
  description: 'Discover ATLVS production management and OPENDECK marketplace - the complete enterprise solution for creative professionals.',
  openGraph: {
    title: 'Products - ATLVS & OPENDECK | GHXSTSHIP',
    description: 'Discover ATLVS production management and OPENDECK marketplace - the complete enterprise solution for creative professionals.',
    url: 'https://ghxstship.com/products',
  },
};

const products = [
  {
    id: 'atlvs',
    name: 'ATLVS',
    tagline: 'Production Management Reimagined',
    description: 'Complete enterprise production management suite with AI-powered insights, real-time collaboration, and comprehensive project oversight.',
    longDescription: 'ATLVS transforms how creative teams manage complex productions. From initial concept to final delivery, our platform provides the tools, insights, and automation needed to keep projects on time, on budget, and exceeding expectations.',
    features: [
      { icon: Calendar, label: 'Project Management', description: 'End-to-end project lifecycle management with Gantt charts, milestones, and dependencies' },
      { icon: Users, label: 'Team Collaboration', description: 'Real-time communication, file sharing, and collaborative workspaces' },
      { icon: BarChart3, label: 'Analytics & Reporting', description: 'AI-powered insights, custom dashboards, and predictive analytics' },
      { icon: Shield, label: 'Enterprise Security', description: 'SOC 2 compliance, advanced permissions, and audit trails' },
    ],
    benefits: [
      'Reduce project timelines by up to 40%',
      'Improve team productivity and collaboration',
      'Gain real-time visibility into project health',
      'Automate repetitive tasks and workflows',
      'Scale operations with enterprise-grade security',
    ],
    stats: [
      { label: 'Projects Managed', value: '75K+' },
      { label: 'Active Teams', value: '12K+' },
      { label: 'Time Saved', value: '40%' },
      { label: 'Client Satisfaction', value: '98%' },
    ],
    gradient: 'from-blue-500 to-cyan-500',
    href: '/products/atlvs',
    ctaText: 'Explore ATLVS',
  },
  {
    id: 'opendeck',
    name: 'OPENDECK',
    tagline: 'The Creative Marketplace',
    description: 'Connect with top talent, discover resources, and access a comprehensive marketplace designed for creative professionals and enterprises.',
    longDescription: 'OPENDECK is the world\'s largest marketplace for creative professionals. Whether you\'re looking for specialized talent, unique resources, or collaborative opportunities, our platform connects you with the right people and tools to bring your vision to life.',
    features: [
      { icon: ShoppingBag, label: 'Talent Marketplace', description: 'Connect with verified creative professionals across all disciplines' },
      { icon: Briefcase, label: 'Resource Library', description: 'Access templates, assets, tools, and educational content' },
      { icon: Globe, label: 'Global Network', description: 'Worldwide community of creators and enterprises' },
      { icon: Zap, label: 'Instant Matching', description: 'AI-powered talent and project matching algorithms' },
    ],
    benefits: [
      'Access to 25K+ verified creative professionals',
      'Reduce hiring time by up to 90%',
      'Find specialized talent for any project',
      'Build long-term creative partnerships',
      'Scale your team on-demand',
    ],
    stats: [
      { label: 'Active Creators', value: '25K+' },
      { label: 'Projects Listed', value: '50K+' },
      { label: 'Success Rate', value: '94%' },
      { label: 'Countries', value: '50+' },
    ],
    gradient: 'from-purple-500 to-pink-500',
    href: '/products/opendeck',
    ctaText: 'Explore OPENDECK',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Our Products
            </Badge>
            <h1 className={`mb-6 ${typography.heroTitle}`}>
              TWO PLATFORMS,
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                INFINITE POSSIBILITIES
              </span>
            </h1>
            <p className={`max-w-3xl mx-auto ${typography.heroSubtitle}`}>
              ATLVS and OPENDECK work together to provide the most comprehensive solution for 
              creative production management and talent acquisition in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {products.map((product, index) => (
              <div key={product.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className={typography.sectionTitle}>{product.name}</h2>
                        <Badge variant="secondary">Enterprise Ready</Badge>
                      </div>
                      <p className={`mb-4 text-primary ${typography.cardSubtitle}`}>{product.tagline}</p>
                      <p className={typography.bodyLarge}>{product.longDescription}</p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <div key={feature.label} className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${product.gradient} bg-opacity-10 flex-shrink-0`}>
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{feature.label}</div>
                              <div className="text-sm text-muted-foreground">{feature.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Key Benefits</h3>
                      <div className="space-y-2">
                        {product.benefits.map((benefit) => (
                          <div key={benefit} className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href={product.href as any as any}>
                        <Button className="w-full sm:w-auto group">
                          {product.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                      <Link href="/auth/signup">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <Card className="bg-gradient-to-br from-muted/30 to-muted/10">
                    <CardContent className="p-8">
                      <div className={`h-2 bg-gradient-to-r ${product.gradient} rounded-full mb-6`}></div>
                      <h3 className="font-title text-2xl font-bold mb-6 text-center">
                        {product.name} by the Numbers
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        {product.stats.map((stat) => (
                          <div key={stat.label} className="text-center">
                            <div className="font-title text-3xl font-bold text-foreground mb-2">
                              {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              BETTER TOGETHER
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              When used together, ATLVS and OPENDECK create a unified ecosystem where project management 
              meets talent acquisition, enabling unprecedented efficiency and collaboration.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 lg:p-12">
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="font-title text-2xl font-bold">ATLVS</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                  <Zap className="h-6 w-6 text-primary" />
                  <div className="w-12 h-0.5 bg-gradient-to-r from-accent to-primary"></div>
                </div>
                <div className="font-title text-2xl font-bold">OPENDECK</div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Unified Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly integrate external talent into your project workflows
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Shared Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Get comprehensive insights across projects and marketplace activities
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Instant Scaling</h3>
                  <p className="text-sm text-muted-foreground">
                    Scale your team up or down based on project demands
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products/compare">
                  <Button variant="outline">
                    Compare Products
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>
                    Start Complete Suite
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
