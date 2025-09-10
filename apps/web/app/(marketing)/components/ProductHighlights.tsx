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
    gradient: 'from-blue-500 to-cyan-500',
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
    gradient: 'from-purple-500 to-pink-500',
    href: '/products/opendeck',
  },
];

export function ProductHighlights() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Products
          </Badge>
          <h2 className="font-title text-3xl lg:text-5xl font-bold mb-6">
            TWO PLATFORMS,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              INFINITE POSSIBILITIES
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ATLVS and OPENDECK work together to provide the most comprehensive solution for 
            creative production management and talent acquisition in the industry.
          </p>
        </div>

        {/* Product Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${product.gradient}`}></div>
              
              <CardContent className="p-8">
                {/* Product Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-title text-2xl font-bold">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      Enterprise Ready
                    </Badge>
                  </div>
                  <p className="text-lg font-medium text-primary mb-3">{product.tagline}</p>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {product.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div key={feature.label} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${product.gradient} bg-opacity-10`}>
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{feature.label}</div>
                          <div className="text-xs text-muted-foreground">{feature.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                  {product.stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-title text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={product.href as any as any} className="flex-1">
                    <Button className="w-full group">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="font-title text-xl font-bold">ATLVS</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent"></div>
                  <Zap className="h-5 w-5 text-primary" />
                  <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-primary"></div>
                </div>
                <div className="font-title text-xl font-bold">OPENDECK</div>
              </div>
              
              <h3 className="font-title text-2xl font-bold mb-4">
                SEAMLESS INTEGRATION
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                When used together, ATLVS and OPENDECK create a unified ecosystem where project management 
                meets talent acquisition, enabling unprecedented efficiency and collaboration.
              </p>
              
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
      </div>
    </section>
  );
}
