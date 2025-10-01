import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, CheckCircle, Star, Users, Zap, Shield, Globe, BarChart3, Calendar, Briefcase, ShoppingBag } from 'lucide-react';
import { anton } from '../../_components/lib/typography';

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
    gradient: 'from-primary to-secondary',
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
    gradient: 'from-primary to-secondary',
    href: '/products/opendeck',
    ctaText: 'Explore OPENDECK',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-mdxl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Our Products
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              TWO PLATFORMS,
              <br />
              <span className="text-gradient-accent">
                INFINITE POSSIBILITIES
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-body-lg color-muted">
              ATLVS and OPENDECK work together to provide the most comprehensive solution for 
              creative production management and talent acquisition in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="space-y-mdxl">
            {products.map((product, index) => (
              <div key={product.id} className={`grid lg:grid-cols-2 gap-xsxl items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="stack-lg">
                    <div>
                      <div className="flex items-center gap-sm mb-sm">
                        <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>{product.name}</h2>
                        <Badge variant="secondary">Enterprise Ready</Badge>
                      </div>
                      <p className="mb-md text-foreground text-body-lg">{product.tagline}</p>
                      <p className="text-body-lg">{product.longDescription}</p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                      {product.features.map((feature: any) => {
                        const Icon = feature.icon;
                        return (
                          <div key={feature.label} className="flex items-start gap-sm">
                            <div className={`p-sm rounded-lg bg-gradient-to-r ${product.gradient} bg-opacity-10 flex-shrink-0`}>
                              <Icon className="h-icon-sm w-icon-sm text-foreground" />
                            </div>
                            <div>
                              <div className="text-heading-4 color-foreground">{feature.label}</div>
                              <div className="text-body-sm color-muted">{feature.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Benefits */}
                    <div>
                      <h3 className="text-heading-4 color-foreground mb-sm">Key Benefits</h3>
                      <div className="stack-sm">
                        {product.benefits.map((benefit: any) => (
                          <div key={benefit} className="flex items-center gap-sm">
                            <CheckCircle className="h-icon-xs w-icon-xs color-success flex-shrink-0" />
                            <span className="text-body-sm color-muted">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-md">
                      <a href={product.href}>
                        <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105">
                          {product.ctaText}
                          <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                      <Link href="/auth/signup">
                        <Button variant="outline" className="w-full sm:w-auto transition-all duration-200 hover:scale-105">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <Card className="bg-gradient-to-br from-muted/30 to-muted/10">
                    <CardContent className="p-xl">
                      <div className={`h-2 bg-gradient-to-r ${product.gradient} rounded-full mb-lg`}></div>
                      <h3 className="font-title text-heading-3 text-heading-3 mb-lg text-center">
                        {product.name} by the Numbers
                      </h3>
                      <div className="grid grid-cols-2 gap-lg">
                        {product.stats.map((stat: any) => (
                          <div key={stat.label} className="text-center">
                            <div className="font-title text-heading-2 text-heading-3 color-foreground mb-sm">
                              {stat.value}
                            </div>
                            <div className="text-body-sm color-muted">{stat.label}</div>
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
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-2xl">
            <h2 className="font-title text-heading-2 lg:text-heading-1 text-heading-3 mb-lg">
              BETTER TOGETHER
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              When used together, ATLVS and OPENDECK create a unified ecosystem where project management 
              meets talent acquisition, enabling unprecedented efficiency and collaboration.
            </p>
          </div>

          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-xl lg:p-xsxl">
              <div className="flex items-center justify-center gap-lg mb-xl">
                <div className="font-title text-heading-3 text-heading-3">ATLVS</div>
                <div className="flex items-center gap-sm">
                  <div className="w-icon-2xl h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                  <Zap className="h-icon-md w-icon-md text-foreground" />
                  <div className="w-icon-2xl h-0.5 bg-gradient-to-r from-secondary to-primary"></div>
                </div>
                <div className="font-title text-heading-3 text-heading-3">OPENDECK</div>
              </div>

              <div className="grid md:grid-cols-3 gap-lg mb-xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-accent/10 mb-md">
                    <Users className="h-icon-md w-icon-md text-foreground" />
                  </div>
                  <h3 className="text-heading-4 mb-sm">Unified Teams</h3>
                  <p className="text-body-sm color-muted">
                    Seamlessly integrate external talent into your project workflows
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-accent/10 mb-md">
                    <BarChart3 className="h-icon-md w-icon-md color-accent" />
                  </div>
                  <h3 className="text-heading-4 mb-sm">Shared Analytics</h3>
                  <p className="text-body-sm color-muted">
                    Get comprehensive insights across projects and marketplace activities
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-full bg-success/10 mb-md">
                    <Zap className="h-icon-md w-icon-md color-success" />
                  </div>
                  <h3 className="text-heading-4 mb-sm">Instant Scaling</h3>
                  <p className="text-body-sm color-muted">
                    Scale your team up or down based on project demands
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/products/compare">
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                    Compare Products
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="group transition-all duration-200 hover:scale-105">
                    Start Complete Suite
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
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
