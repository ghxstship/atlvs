'use client';


import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, BarChart3, ShoppingBag, Briefcase, Zap, Shield, Globe } from 'lucide-react';

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
    gradient: 'from-primary to-accent',
    href: '/products/atlvs',
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
    href: '/products/opendeck',
  },
];

export function ProductHighlights() {
  return (
    <section className="py-4xl bg-secondary/20">
      <div className="container mx-auto px-lg">
        {/* Section Header */}
        <div className="text-center mb-xl">
          <Badge variant="outline" className="mb-sm">
            Our Products
          </Badge>
          <h2 className="font-title text-heading-2 lg:text-display text-heading-3 mb-md">
            TWO PLATFORMS,
            <br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              INFINITE POSSIBILITIES
            </span>
          </h2>
          <p className="text-body color-muted max-w-3xl mx-auto">
            ATLVS and OPENDECK work together to provide the most comprehensive solution for 
            creative production management and talent acquisition in the industry.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid lg:grid-cols-2 gap-2xl mb-xl">
          {products.map((product: any) => (
            <Card key={product.id} className="group hover:shadow-popover transition-all duration-300 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${product.gradient}`}></div>
              
              <CardContent className="p-xl">
                {/* Product Header */}
                <div className="mb-md">
                  <div className="flex items-center gap-sm mb-sm">
                    <h3 className="font-title text-heading-3 text-heading-3">{product.name}</h3>
                    <Badge variant="secondary">
                      <span className="text-body-sm">Enterprise Ready</span>
                    </Badge>
                  </div>
                  <p className="text-body form-label color-primary mb-sm">{product.tagline}</p>
                  <p className="color-muted">{product.description}</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-md mb-md">
                  {product.features.map((feature: any) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.label} className="flex items-start gap-sm">
                        <div className={`p-sm rounded-lg bg-gradient-to-r ${product.gradient} bg-opacity-10`}>
                          <Icon className="h-4 w-4 color-primary" />
                        </div>
                        <div>
                          <div className="form-label text-body-sm">{feature.label}</div>
                          <div className="text-body-sm color-muted">{feature.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-sm mb-md p-md bg-secondary/30 rounded-lg">
                  {product.stats.map((stat: any) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-title text-body text-heading-3 color-foreground">{stat.value}</div>
                      <div className="text-body-sm color-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-sm">
                  <a href="#" className="flex-1">
                    <Button className="w-full group">
                      Learn More
                      <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </a>
                  <Link href="/auth/signup">
                    <Button variant="outline" className="w-full sm:w-auto">
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
            <CardContent className="p-xl">
              <div className="flex items-center justify-center gap-sm mb-md">
                <div className="font-title text-heading-4 text-heading-3">ATLVS</div>
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                  <Zap className="h-5 w-5 color-primary" />
                  <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-primary"></div>
                </div>
                <div className="font-title text-heading-4 text-heading-3">OPENDECK</div>
              </div>
              
              <h3 className="font-title text-heading-3 text-heading-3 mb-sm">
                SEAMLESS INTEGRATION
              </h3>
              <p className="color-muted mb-md max-w-2xl mx-auto">
                When used together, ATLVS and OPENDECK create a unified ecosystem where project management 
                meets talent acquisition, enabling unprecedented efficiency and collaboration.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-sm justify-center">
                <Link href="/products/compare">
                  <Button variant="outline">
                    Compare Products
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>
                    Start Complete Suite
                    <ArrowRight className="ml-sm h-4 w-4" />
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
