'use client';


import Link from 'next/link';
import { Badge, Button, Card, CardBody, CardContent } from '@ghxstship/ui';
import { ArrowRight, BarChart3, Briefcase, Calendar, Globe, Shield, ShoppingBag, Users, Zap } from 'lucide-react';

const products = [
  {
    id: 'atlvs',
    name: 'ATLVS',
    tagline: 'Production Management Reimagined',
    description: 'Complete enterprise production management suite with AI-powered insights, real-time collaboration, and comprehensive project oversight.',
    features: [
      { icon: Calendar, label: 'Project Management', description: 'End-to-end project lifecycle management' },
      { icon: Users, label: 'Team Collaboration', description: 'Real-time communication and file sharing' },
      { icon: BarChart3, label: 'Analytics & Reporting', description: 'AI-powered insights and custom dashboards' },
      { icon: Shield, label: 'Enterprise Security', description: 'SOC 2 compliance and advanced permissions' },
    ],
    stats: [
      { label: 'Projects Managed', value: '75K+' },
      { label: 'Active Teams', value: '12K+' },
      { label: 'Time Saved', value: '40%' },
    ],
    gradient: 'from-primary to-secondary',
    href: '/products/atlvs'
  },
  {
    id: 'opendeck',
    name: 'OPENDECK',
    tagline: 'The Creative Marketplace',
    description: 'Connect with top talent, discover resources, and access a comprehensive marketplace designed for creative professionals and enterprises.',
    features: [
      { icon: ShoppingBag, label: 'Talent Marketplace', description: 'Connect with verified creative professionals' },
      { icon: Briefcase, label: 'Resource Library', description: 'Access templates, assets, and tools' },
      { icon: Globe, label: 'Global Network', description: 'Worldwide community of creators' },
      { icon: Zap, label: 'Instant Matching', description: 'AI-powered talent and project matching' },
    ],
    stats: [
      { label: 'Active Creators', value: '25K+' },
      { label: 'Projects Listed', value: '50K+' },
      { label: 'Success Rate', value: '94%' },
    ],
    gradient: 'from-secondary to-accent',
    href: '/products/opendeck'
  },
];

export function ProductHighlights() {
  return (
    <section className="py-mdxl bg-secondary/20">
      <div className="container mx-auto px-lg">
        {/* Section Header */}
        <div className="text-center mb-xl">
          <Badge variant="secondary" className="mb-sm">
            Our Products
          </Badge>
          <h2 className="font-title text-heading-2 lg:text-display text-heading-3 mb-md">
            TWO PLATFORMS,
            <br />
            <span className="text-gradient-accent">
              INFINITE POSSIBILITIES
            </span>
          </h2>
          <p className="text-body color-muted max-w-3xl mx-auto">
            ATLVS and OPENDECK work together to provide the most comprehensive solution for 
            creative production management and talent acquisition in the industry.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid lg:grid-cols-2 gap-xsxl mb-xl">
          {products.map((product: any) => (
            <Card key={product.id} className="group hover-lift hover-glow transition-all duration-300 overflow-hidden border-2 hover-border">
              <div className={`h-2 bg-gradient-to-r ${product.gradient}`}></div>
              
              <CardContent className="p-xsxl">
                {/* Product Header */}
                <div className="mb-xl">
                  <div className="flex items-center gap-md mb-md">
                    <h3 className="font-title text-heading-3">{product.name}</h3>
                    <Badge variant="secondary">
                      <span className="text-body-sm">Enterprise Ready</span>
                    </Badge>
                  </div>
                  <p className="text-body form-label color-accent mb-md">{product.tagline}</p>
                  <p className="color-muted">{product.description}</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-lg mb-xl">
                  {product.features.map((feature: any) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.label} className="flex items-start gap-md">
                        <div className={`p-md rounded-lg bg-gradient-to-r ${product.gradient} bg-opacity-10`}>
                          <Icon className="h-icon-sm w-icon-sm color-accent" />
                        </div>
                        <div>
                          <div className="form-label text-body-sm mb-xs">{feature.label}</div>
                          <div className="text-body-sm color-muted">{feature.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-md mb-xl p-lg bg-secondary/30 rounded-lg">
                  {product.stats.map((stat: any) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-title text-heading-3 color-foreground">{stat.value}</div>
                      <div className="text-body-sm color-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-md">
                  <a href="#" className="flex-1">
                    <Button className="w-full group" size="lg">
                      Learn More
                      <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <Link href="/auth/signup">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Try Free
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Highlight */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-xsxl">
              <div className="flex items-center justify-center gap-md mb-xl">
                <div className="font-title text-heading-3">ATLVS</div>
                <div className="flex items-center gap-md">
                  <div className="w-icon-lg h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                  <Zap className="h-icon-md w-icon-md color-accent" />
                  <div className="w-icon-lg h-0.5 bg-gradient-to-r from-secondary to-primary"></div>
                </div>
                <div className="font-title text-heading-3">OPENDECK</div>
              </div>
              
              <h3 className="font-title text-heading-3 mb-lg">
                SEAMLESS INTEGRATION
              </h3>
              <p className="color-muted mb-xl max-w-2xl mx-auto">
                When used together, ATLVS and OPENDECK create a unified ecosystem where project management 
                meets talent acquisition, enabling unprecedented efficiency and collaboration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/products/compare">
                  <Button variant="secondary" size="lg">
                    Compare Products
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg">
                    Start Complete Suite
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs" />
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
