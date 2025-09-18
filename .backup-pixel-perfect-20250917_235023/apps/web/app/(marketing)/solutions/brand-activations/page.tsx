import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Target, TrendingUp, Users, Zap, CheckCircle, Play, Star, BarChart, Megaphone } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Brand Activations Solutions | GHXSTSHIP',
  description: 'Create memorable brand experiences with GHXSTSHIP. Manage experiential campaigns, activations, and immersive brand events from concept to execution.',
  openGraph: {
    title: 'Brand Activations Solutions | GHXSTSHIP',
    description: 'Create memorable brand experiences with GHXSTSHIP. Manage experiential campaigns, activations, and immersive brand events from concept to execution.',
    url: 'https://ghxstship.com/solutions/brand-activations',
  },
};

const challenges = [
  {
    icon: Target,
    title: 'Experiential Event Coordination',
    description: 'Managing complex multi-location brand activations with tight timelines',
    solution: 'Centralized event management with real-time coordination tools',
  },
  {
    icon: TrendingUp,
    title: 'Engagement Measurement',
    description: 'Tracking brand impact and audience engagement across activations',
    solution: 'Real-time analytics and engagement tracking dashboards',
  },
  {
    icon: Users,
    title: 'Multi-Vendor Management',
    description: 'Coordinating agencies, vendors, talent, and production teams',
    solution: 'Unified vendor management with collaborative workflows',
  },
  {
    icon: Megaphone,
    title: 'Brand Experience Consistency',
    description: 'Ensuring consistent brand messaging across all activation touchpoints',
    solution: 'Brand asset libraries and experience guideline enforcement',
  },
];

const features = [
  {
    title: 'Activation Management',
    description: 'End-to-end brand activation planning, execution, and measurement',
    benefits: ['Event timelines', 'Budget tracking', 'Venue coordination', 'Engagement metrics'],
  },
  {
    title: 'Experience Design',
    description: 'Collaborative design workflows for immersive brand experiences',
    benefits: ['Design reviews', 'Experience mapping', 'Brand guidelines', 'Asset libraries'],
  },
  {
    title: 'Stakeholder Coordination',
    description: 'Seamless communication across clients, vendors, and production teams',
    benefits: ['Vendor portals', 'Real-time updates', 'Approval workflows', 'Communication tools'],
  },
  {
    title: 'Impact Analytics',
    description: 'Comprehensive measurement of brand activation effectiveness',
    benefits: ['Engagement tracking', 'Brand lift analysis', 'ROI reporting', 'Audience insights'],
  },
];

const caseStudies = [
  {
    title: 'Apex Advertising',
    project: 'Global Brand Campaign',
    challenge: 'Managing 15 concurrent campaigns across 8 countries for major retail client',
    solution: 'Implemented GHXSTSHIP for unified campaign management and global team coordination',
    results: [
      '40% improvement in campaign delivery time',
      '60% reduction in revision cycles',
      '300% ROI increase across all campaigns',
      '98% client satisfaction rating',
    ],
    testimonial: 'GHXSTSHIP transformed our agency operations. We can now handle 3x more campaigns with the same team size.',
    author: 'Marcus Rodriguez, Creative Director',
  },
  {
    title: 'Digital Dynamics',
    project: 'Multi-Channel Campaign Series',
    challenge: 'Coordinating creative assets across social, digital, and traditional media channels',
    solution: 'Used ATLVS for project management and OPENDECK for freelance creative talent',
    results: [
      '50% faster creative production',
      '35% cost reduction through talent optimization',
      '25% improvement in campaign performance',
      '100% on-time campaign launches',
    ],
    testimonial: 'The global talent network helped us find specialized creatives for each channel, elevating our campaign quality.',
    author: 'Sarah Chen, Account Director',
  },
];

const integrations = [
  { name: 'Google Ads', category: 'Advertising' },
  { name: 'Facebook Ads Manager', category: 'Social Media' },
  { name: 'Adobe Creative Suite', category: 'Design' },
  { name: 'Figma', category: 'Design' },
  { name: 'HubSpot', category: 'CRM' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'Google Analytics', category: 'Analytics' },
  { name: 'Hootsuite', category: 'Social Media' },
];

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-warning/5 via-background to-destructive/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Brand Activations Solutions
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  CREATE MEMORABLE
                  <br />
                  <span className="bg-gradient-to-r from-warning to-destructive bg-clip-text text-transparent">
                    BRAND
                  </span>
                  <br />
                  EXPERIENCES
                </h1>
                <p className="text-heading-4 color-muted">
                  From experiential campaigns to immersive activations, GHXSTSHIP empowers 
                  agencies to create unforgettable brand experiences that drive engagement 
                  and build lasting connections with audiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>1000+</div>
                  <div className="text-body-sm color-muted">Campaigns Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>$500M+</div>
                  <div className="text-body-sm color-muted">Ad Spend Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>300%</div>
                  <div className="text-body-sm color-muted">Average ROI Increase</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>200+</div>
                  <div className="text-body-sm color-muted">Agencies Served</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Campaign Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-popover overflow-hidden">
                <div className="flex items-center gap-sm px-md py-sm bg-secondary/50 border-b">
                  <div className="flex gap-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-sm px-sm py-xs bg-background rounded-md text-body-sm color-muted">
                      <Target className="w-3 h-3" />
                      campaigns.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>APEX RETAIL CAMPAIGN</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Budget</div>
                      <div className="text-heading-4">$125K</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-warning h-1 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">ROI</div>
                      <div className="text-heading-4">285%</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-success h-1 rounded-full w-5/6"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Reach</div>
                      <div className="text-heading-4">2.5M</div>
                      <div className="flex -cluster-xs mt-sm">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-4 h-4 bg-warning rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Channel Performance</div>
                    {[
                      { channel: 'Google Ads', performance: '92%', color: 'bg-success' },
                      { channel: 'Facebook', performance: '87%', color: 'bg-primary' },
                      { channel: 'Instagram', performance: '78%', color: 'bg-secondary' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.channel}</span>
                        <span className="color-muted">{item.performance}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              ADVERTISING AGENCY CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Modern advertising agencies face complex challenges that require specialized solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-warning to-destructive">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-md">{challenge.description}</p>
                        <div className="flex items-start gap-sm">
                          <CheckCircle className="h-4 w-4 color-success flex-shrink-0 mt-0.5" />
                          <p className="text-body-sm form-label color-foreground">{challenge.solution}</p>
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
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              COMPREHENSIVE CAMPAIGN MANAGEMENT
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to plan, execute, and optimize advertising campaigns at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-md uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-lg">{feature.description}</p>
                  
                  <div className="stack-sm">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-sm">
                        <CheckCircle className="h-4 w-4 color-success flex-shrink-0" />
                        <span className="text-body-sm color-foreground">{benefit}</span>
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
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              AGENCY SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how leading advertising agencies have scaled their operations with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-2xl">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <div className="grid lg:grid-cols-2 gap-xl">
                    <div>
                      <Badge variant="outline" className="mb-md">{study.project}</Badge>
                      <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-md uppercase`}>{study.title}</h3>
                      
                      <div className="stack-md">
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">CHALLENGE</h4>
                          <p className="color-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-sm uppercase">SOLUTION</h4>
                          <p className="color-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-md uppercase">RESULTS</h4>
                      <div className="stack-sm mb-lg">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-sm">
                            <Star className="h-4 w-4 color-warning flex-shrink-0" />
                            <span className="text-body-sm form-label color-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-md">
                        <p className="color-foreground italic mb-sm">"{study.testimonial}"</p>
                        <cite className="text-body-sm color-muted">— {study.author}</cite>
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
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              ADVERTISING TOOL INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with the advertising platforms and tools your team already uses.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-md">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-xs">{integration.name}</h3>
                  <p className="text-body-sm color-muted">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO SCALE YOUR AGENCY?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join hundreds of advertising agencies using GHXSTSHIP to deliver 
              exceptional campaigns and drive measurable results for their clients.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="w-full sm:w-auto">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
