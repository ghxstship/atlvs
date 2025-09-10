import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Building, Shield, Users, Zap, CheckCircle, Play, Star, TrendingUp, Globe } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Corporate Solutions | GHXSTSHIP',
  description: 'Transform your enterprise operations with GHXSTSHIP. Scalable project management, global team coordination, and enterprise-grade security.',
  openGraph: {
    title: 'Corporate Solutions | GHXSTSHIP',
    description: 'Transform your enterprise operations with GHXSTSHIP. Scalable project management, global team coordination, and enterprise-grade security.',
    url: 'https://ghxstship.com/solutions/corporate',
  },
};

const challenges = [
  {
    icon: Building,
    title: 'Enterprise Scale Management',
    description: 'Coordinating complex projects across multiple departments and global offices',
    solution: 'Hierarchical project structures with department-specific dashboards',
  },
  {
    icon: Shield,
    title: 'Security & Compliance',
    description: 'Meeting strict security requirements and regulatory compliance standards',
    solution: 'Enterprise-grade security with SOC 2, GDPR, and industry-specific compliance',
  },
  {
    icon: Users,
    title: 'Global Team Coordination',
    description: 'Managing distributed teams across time zones and cultural differences',
    solution: 'Advanced collaboration tools with localization and timezone management',
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Measuring productivity and ROI across diverse business units',
    solution: 'Comprehensive analytics with customizable KPIs and executive reporting',
  },
];

const features = [
  {
    title: 'Enterprise Project Management',
    description: 'Scalable project orchestration for complex organizational structures',
    benefits: ['Multi-level hierarchies', 'Resource allocation', 'Budget tracking', 'Timeline management'],
  },
  {
    title: 'Global Talent Network',
    description: 'Access specialized expertise from around the world',
    benefits: ['Skills matching', 'Vendor management', 'Contract automation', 'Performance tracking'],
  },
  {
    title: 'Security & Governance',
    description: 'Enterprise-grade security with comprehensive audit trails',
    benefits: ['SSO integration', 'Role-based access', 'Audit logs', 'Compliance reporting'],
  },
  {
    title: 'Executive Analytics',
    description: 'Real-time insights for strategic decision making',
    benefits: ['Custom dashboards', 'KPI tracking', 'Predictive analytics', 'Executive reports'],
  },
];

const caseStudies = [
  {
    title: 'Global Manufacturing Corp',
    project: 'Digital Transformation Initiative',
    challenge: 'Modernizing operations across 50+ facilities in 20 countries with 10,000+ employees',
    solution: 'Implemented GHXSTSHIP enterprise platform for unified project management and global coordination',
    results: [
      '45% improvement in project delivery time',
      '60% reduction in operational costs',
      '300% increase in cross-team collaboration',
      '$50M+ in efficiency savings annually',
    ],
    testimonial: 'GHXSTSHIP enabled us to coordinate our largest transformation project seamlessly across all global operations.',
    author: 'Jennifer Walsh, Chief Operations Officer',
  },
  {
    title: 'Fortune 500 Financial Services',
    project: 'Regulatory Compliance Overhaul',
    challenge: 'Implementing new compliance frameworks across multiple business units while maintaining operations',
    solution: 'Used GHXSTSHIP for compliance project management with specialized regulatory workflows',
    results: [
      '100% on-time compliance implementation',
      '80% reduction in audit preparation time',
      '95% improvement in regulatory reporting',
      'Zero compliance violations post-implementation',
    ],
    testimonial: 'The platform\'s compliance features and audit trails were crucial for our regulatory success.',
    author: 'David Kim, Chief Compliance Officer',
  },
];

const integrations = [
  { name: 'Microsoft 365', category: 'Productivity' },
  { name: 'Google Workspace', category: 'Productivity' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'SAP', category: 'ERP' },
  { name: 'Slack', category: 'Communication' },
  { name: 'Jira', category: 'Project Management' },
  { name: 'Tableau', category: 'Analytics' },
  { name: 'Okta', category: 'Identity Management' },
];

export default function CorporatePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Enterprise Solutions
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  TRANSFORM YOUR
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    ENTERPRISE
                  </span>
                  <br />
                  OPERATIONS
                </h1>
                <p className="text-xl text-muted-foreground">
                  Scale your business with GHXSTSHIP's enterprise platform. 
                  Manage complex projects, coordinate global teams, and drive 
                  innovation with enterprise-grade security and compliance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-sm text-muted-foreground">Enterprise Clients</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50K+</div>
                  <div className="text-sm text-muted-foreground">Projects Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime SLA</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>$1B+</div>
                  <div className="text-sm text-muted-foreground">Project Value Managed</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Enterprise Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Enterprise Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-xs text-muted-foreground">
                      <Building className="w-3 h-3" />
                      enterprise.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>GLOBAL OPERATIONS</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Projects</div>
                      <div className="font-semibold">247</div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-500">+12%</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Teams</div>
                      <div className="font-semibold">89</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-blue-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Budget</div>
                      <div className="font-semibold">$2.5M</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-blue-500 h-1 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Regional Performance</div>
                    {[
                      { region: 'North America', performance: '94%', color: 'bg-green-500' },
                      { region: 'Europe', performance: '91%', color: 'bg-blue-500' },
                      { region: 'Asia Pacific', performance: '88%', color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="font-medium flex-1">{item.region}</span>
                        <span className="text-muted-foreground">{item.performance}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">24/7 Global Operations</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              ENTERPRISE CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Large organizations face unique challenges that require enterprise-grade solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-xl font-bold mb-3 uppercase`}>{challenge.title}</h3>
                        <p className="text-muted-foreground mb-4">{challenge.description}</p>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-foreground">{challenge.solution}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              ENTERPRISE-GRADE PLATFORM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built for scale, security, and performance to meet the demands of global enterprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-xl font-bold mb-4 uppercase`}>{feature.title}</h3>
                  <p className="text-muted-foreground mb-6">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              ENTERPRISE SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how global enterprises have transformed their operations with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <Badge variant="outline" className="mb-4">{study.project}</Badge>
                      <h3 className={`${anton.className} text-2xl font-bold mb-4 uppercase`}>{study.title}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">CHALLENGE</h4>
                          <p className="text-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">SOLUTION</h4>
                          <p className="text-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-4 uppercase">RESULTS</h4>
                      <div className="space-y-3 mb-6">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4">
                        <p className="text-foreground italic mb-2">"{study.testimonial}"</p>
                        <cite className="text-sm text-muted-foreground">— {study.author}</cite>
                      </blockquote>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              ENTERPRISE INTEGRATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Seamlessly connect with your existing enterprise systems and workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO SCALE YOUR ENTERPRISE?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join Fortune 500 companies using GHXSTSHIP to drive innovation, 
              improve efficiency, and achieve unprecedented growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Enterprise Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
