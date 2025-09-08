import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Check, X, Zap, Users, Globe, Star, Shield, Clock, DollarSign } from 'lucide-react';
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
    color: 'from-blue-500 to-indigo-600',
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
    color: 'from-purple-500 to-pink-600',
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
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              Product Comparison
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              ATLVS VS OPENDECK
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CHOOSE YOUR PATH
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare our flagship products side-by-side to find the perfect solution 
              for your creative workflow and business needs.
            </p>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              PRODUCT OVERVIEW
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Understanding the core purpose and strengths of each platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {productOverview.map((product) => (
              <Card key={product.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${product.color} mb-4`}>
                      <span className="text-2xl">{product.icon}</span>
                    </div>
                    <h3 className={`${anton.className} text-2xl font-bold mb-2 uppercase`}>{product.name}</h3>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex items-baseline justify-center gap-2 mb-6">
                      <span className="text-sm text-muted-foreground">Starting at</span>
                      <span className="text-3xl font-bold">{product.startingPrice}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase">KEY STRENGTHS</h4>
                      <div className="space-y-2">
                        {product.strengths.map((strength) => (
                          <div key={strength} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase">BEST FOR</h4>
                      <p className="text-sm text-foreground">{product.bestFor}</p>
                    </div>

                    <Link href={product.href}>
                      <Button className="w-full group">
                        Explore {product.name}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              DETAILED FEATURE COMPARISON
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Compare features across categories to make an informed decision.
            </p>
          </div>

          <div className="space-y-12">
            {comparisonData.map((category) => (
              <Card key={category.category}>
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-xl font-bold mb-6 uppercase`}>
                    {category.category}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-semibold">Feature</th>
                          <th className="text-center py-3 font-semibold">ATLVS</th>
                          <th className="text-center py-3 font-semibold">OPENDECK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature) => (
                          <tr key={feature.name} className="border-b border-muted/50">
                            <td className="py-4 font-medium">{feature.name}</td>
                            <td className="py-4 text-center">
                              {feature.atlvs ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground mx-auto" />
                              )}
                            </td>
                            <td className="py-4 text-center">
                              {feature.opendeck ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground mx-auto" />
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              CHOOSE THE RIGHT SOLUTION
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Select the platform that best matches your workflow and business needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`${anton.className} text-xl font-bold uppercase`}>CHOOSE ATLVS IF</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You manage complex projects</p>
                      <p className="text-sm text-muted-foreground">Need advanced project management with custom workflows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You have an existing team</p>
                      <p className="text-sm text-muted-foreground">Focus on internal collaboration and productivity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You need detailed analytics</p>
                      <p className="text-sm text-muted-foreground">Require comprehensive reporting and insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You manage budgets</p>
                      <p className="text-sm text-muted-foreground">Need financial tracking and budget management</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/products/atlvs">
                    <Button className="w-full group">
                      Get Started with ATLVS
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <h3 className={`${anton.className} text-xl font-bold uppercase`}>CHOOSE OPENDECK IF</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You need to find talent</p>
                      <p className="text-sm text-muted-foreground">Access to global network of creative professionals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You're a freelancer</p>
                      <p className="text-sm text-muted-foreground">Connect with clients and showcase your work</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You need creative resources</p>
                      <p className="text-sm text-muted-foreground">Access templates, assets, and educational content</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">You work on diverse projects</p>
                      <p className="text-sm text-muted-foreground">Flexible marketplace for various creative needs</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="/products/opendeck">
                    <Button className="w-full group">
                      Join OPENDECK
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO GET STARTED?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Try both platforms with our free trials and see which one fits your workflow best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
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
