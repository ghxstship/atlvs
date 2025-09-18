import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Check, CheckCircle, X, Minus, Zap, Users, Globe, Star, Shield, Clock, DollarSign } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Compare Products - ATLVS vs OPENDECK | GHXSTSHIP',
  description: 'Compare ATLVS project management and OPENDECK marketplace features side-by-side to find the perfect solution for your creative workflow.',
  openGraph: {
    title: 'Compare Products - ATLVS vs OPENDECK | GHXSTSHIP',
    description: 'Compare ATLVS project management and OPENDECK marketplace features side-by-side to find the perfect solution for your creative workflow.',
    url: 'https://ghxstship.com/products/compare',
  },
};

const comparisonData = [
  {
    category: 'Core Features',
    features: [
      { name: 'Project Management', atlvs: true, opendeck: false },
      { name: 'Task Management', atlvs: true, opendeck: false },
      { name: 'Team Collaboration', atlvs: true, opendeck: true },
      { name: 'Creative Marketplace', atlvs: false, opendeck: true },
      { name: 'Talent Network', atlvs: false, opendeck: true },
      { name: 'Resource Library', atlvs: false, opendeck: true },
    ],
  },
  {
    category: 'Analytics & Reporting',
    features: [
      { name: 'Project Analytics', atlvs: true, opendeck: false },
      { name: 'Performance Metrics', atlvs: true, opendeck: true },
      { name: 'Custom Reports', atlvs: true, opendeck: false },
      { name: 'Real-time Dashboards', atlvs: true, opendeck: true },
      { name: 'Budget Tracking', atlvs: true, opendeck: false },
    ],
  },
  {
    category: 'Integration & API',
    features: [
      { name: 'REST API', atlvs: true, opendeck: true },
      { name: 'Webhooks', atlvs: true, opendeck: true },
      { name: 'Third-party Integrations', atlvs: true, opendeck: true },
      { name: 'Custom Workflows', atlvs: true, opendeck: false },
      { name: 'Automation Tools', atlvs: true, opendeck: false },
    ],
  },
  {
    category: 'Security & Compliance',
    features: [
      { name: 'Enterprise Security', atlvs: true, opendeck: true },
      { name: 'SSO Integration', atlvs: true, opendeck: true },
      { name: 'Audit Logs', atlvs: true, opendeck: true },
      { name: 'GDPR Compliance', atlvs: true, opendeck: true },
      { name: 'SOC 2 Certified', atlvs: true, opendeck: true },
    ],
  },
];

const productOverview = [
  {
    name: 'ATLVS',
    description: 'Enterprise project management platform for creative teams',
    icon: '⚡',
    color: 'from-primary to-accent',
    strengths: [
      'Advanced project management',
      'AI-powered insights',
      'Custom workflows',
      'Budget tracking',
      'Team collaboration',
    ],
    bestFor: 'Production companies, agencies, and creative teams managing complex projects',
    startingPrice: '$29',
    href: '/products/atlvs',
  },
  {
    name: 'OPENDECK',
    description: 'Global marketplace for creative professionals and resources',
    icon: '🌐',
    color: 'from-primary to-accent',
    strengths: [
      'Global talent network',
      'Resource marketplace',
      'AI-powered matching',
      'Secure payments',
      'Quality assurance',
    ],
    bestFor: 'Freelancers, agencies, and companies looking to connect with creative talent',
    startingPrice: '$19',
    href: '/products/opendeck',
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <Badge variant="outline" className="mb-md">
              Product Comparison
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
              ATLVS VS OPENDECK
              <br />
              <span className="text-gradient-primary">
                CHOOSE YOUR PATH
              </span>
            </h1>
            <p className="color-success/80 text-body-sm max-w-3xl mx-auto">
              Compare our flagship products side-by-side to find the perfect solution 
              for your creative workflow and business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              PRODUCT OVERVIEW
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Understanding the core purpose and strengths of each platform.
            </p>
          </div>

          <div className="bg-success/10 border border-success/20 rounded-lg p-md mb-lg">
            {productOverview.map((product) => (
              <Card key={product.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-xl">
                  <div className="text-center mb-xl">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${product.color} mb-md`}>
                      <span className="text-heading-3 text-background">{product.icon}</span>
                    </div>
                    <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-sm uppercase`}>{product.name}</h3>
                    <p className="color-muted mb-md">{product.description}</p>
                    <div className="flex items-baseline justify-center gap-sm mb-lg">
                      <span className="text-body-sm color-muted">Starting at</span>
                      <span className="text-heading-2 text-heading-3">{product.startingPrice}</span>
                      <span className="text-body-sm color-muted">/month</span>
                    </div>
                  </div>

                  <div className="stack-lg">
                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">KEY STRENGTHS</h4>
                      <div className="stack-sm">
                        {product.strengths.map((strength) => (
                          <div key={strength} className="flex items-center gap-sm">
                            <CheckCircle className="h-4 w-4 color-success flex-shrink-0" />
                            <span className="text-body-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">BEST FOR</h4>
                      <p className="text-body-sm color-foreground">{product.bestFor}</p>
                    </div>

                    <a href={product.href as any as any}>
                      <Button className="w-full group">
                        Explore {product.name}
                        <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              DETAILED FEATURE COMPARISON
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Compare features across categories to make an informed decision.
            </p>
          </div>

          <div className="space-y-2xl">
            {comparisonData.map((category) => (
              <Card key={category.category}>
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-lg uppercase`}>
                    {category.category}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-sm text-heading-4">Feature</th>
                          <th className="text-center py-sm text-heading-4">ATLVS</th>
                          <th className="text-center py-sm text-heading-4">OPENDECK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature) => (
                          <tr key={feature.name} className="border-b border-muted/50">
                            <td className="py-md form-label">{feature.name}</td>
                            <td className="py-md text-center">
                              {feature.atlvs ? (
                                <Check className="h-5 w-5 color-success mx-auto" />
                              ) : (
                                <X className="h-5 w-5 color-muted mx-auto" />
                              )}
                            </td>
                            <td className="py-md text-center">
                              {feature.opendeck ? (
                                <Check className="h-5 w-5 color-success mx-auto" />
                              ) : (
                                <X className="h-5 w-5 color-muted mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              CHOOSE THE RIGHT SOLUTION
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Select the platform that best matches your workflow and business needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-xl">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-xl">
                <div className="flex items-center gap-sm mb-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase`}>CHOOSE ATLVS IF</h3>
                </div>
                
                <div className="stack-md">
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You manage complex projects</p>
                      <p className="text-body-sm color-muted">Need advanced project management with custom workflows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You have an existing team</p>
                      <p className="text-body-sm color-muted">Focus on internal collaboration and productivity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You need detailed analytics</p>
                      <p className="text-body-sm color-muted">Require comprehensive reporting and insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You manage budgets</p>
                      <p className="text-body-sm color-muted">Need financial tracking and budget management</p>
                    </div>
                  </div>
                </div>

                <div className="mt-xl">
                  <Link href="/products/atlvs">
                    <Button className="w-full group">
                      Get Started with ATLVS
                      <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-xl">
                <div className="flex items-center gap-sm mb-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                    <Globe className="h-6 w-6 text-background" />
                  </div>
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase`}>CHOOSE OPENDECK IF</h3>
                </div>
                
                <div className="stack-md">
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You need to find talent</p>
                      <p className="text-body-sm color-muted">Access to global network of creative professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You're a freelancer</p>
                      <p className="text-body-sm color-muted">Connect with clients and showcase your work</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You need creative resources</p>
                      <p className="text-body-sm color-muted">Access templates, assets, and educational content</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <Check className="h-5 w-5 color-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-heading-4">You work on diverse projects</p>
                      <p className="text-body-sm color-muted">Flexible marketplace for various creative needs</p>
                    </div>
                  </div>
                </div>

                <div className="mt-xl">
                  <Link href="/products/opendeck">
                    <Button className="w-full group">
                      Join OPENDECK
                      <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO GET STARTED?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Try both platforms with our free trials and see which one fits your workflow best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
