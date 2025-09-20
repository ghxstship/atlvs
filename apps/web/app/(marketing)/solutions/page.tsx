import type { Metadata } from 'next';
import { anton } from '../../_components/lib/typography';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Film, Megaphone, Music, Building, CheckCircle, Users, BarChart3, Zap, Globe } from 'lucide-react';
import { typography } from '../../_components/lib/typography';

export const metadata: Metadata = {
  title: 'Solutions - Production Management That Actually Works | GHXSTSHIP',
  description: 'Real production management for Film & TV, Advertising, Music & Events, and Corporate teams who are tired of juggling 47 different apps.',
  openGraph: {
    title: 'Solutions - Production Management That Actually Works | GHXSTSHIP',
    description: 'Real production management for teams who are tired of juggling 47 different apps.',
    url: 'https://ghxstship.com/solutions',
  },
};

const solutions = [
  {
    id: 'film-tv',
    icon: Film,
    title: 'Film & TV',
    tagline: 'Production Management That Doesn\'t Crash Under Pressure',
    description: 'Stop losing your mind coordinating shoots. Manage crews, locations, and budgets without the usual chaos.',
    longDescription: 'Built by people who\'ve actually managed $50M+ productions. From pre-production planning to post-delivery, we handle the complexity so you can focus on making great content instead of babysitting spreadsheets and Slack channels.',
    features: [
      'Script breakdown and scheduling',
      'Multi-location shoot coordination',
      'Crew and talent management',
      'Equipment and location tracking',
      'Budget and expense management',
      'Post-production workflow',
    ],
    benefits: [
      'Reduce production timelines by 45%',
      'Improve crew coordination and communication',
      'Real-time budget and schedule tracking',
      'Streamlined approval processes',
      'Enhanced post-production collaboration',
    ],
    stats: {
      projects: '15K+',
      savings: '45%',
      satisfaction: '99%',
      clients: '500+',
    },
    gradient: 'from-primary to-secondary',
    href: '/solutions/film-tv',
    caseStudy: {
      company: 'Meridian Studios',
      project: 'The Last Frontier',
      challenge: 'Managing a $50M production across 12 locations with 200+ crew members',
      result: 'Completed 2 weeks ahead of schedule, 15% under budget',
    },
  },
  {
    id: 'advertising',
    icon: Megaphone,
    title: 'Advertising',
    tagline: 'Campaigns That Actually Launch On Time',
    description: 'Stop chasing approvals and missing deadlines. Manage creative workflows without losing your sanity.',
    longDescription: 'Built for agencies tired of client revision hell and missed launch dates. From concept to delivery, we streamline the chaos so you can focus on creating great work instead of managing endless email chains and version control nightmares.',
    features: [
      'Campaign planning and strategy',
      'Creative asset management',
      'Client approval workflows',
      'Multi-channel campaign coordination',
      'Performance tracking and analytics',
      'Brand compliance monitoring',
    ],
    benefits: [
      'Accelerate campaign delivery by 35%',
      'Streamline client approval processes',
      'Improve creative asset organization',
      'Enhanced team collaboration',
      'Real-time campaign performance insights',
    ],
    stats: {
      projects: '25K+',
      savings: '35%',
      satisfaction: '97%',
      clients: '750+',
    },
    gradient: 'from-primary to-secondary',
    href: '/solutions/advertising',
    caseStudy: {
      company: 'Apex Advertising',
      project: 'Global Brand Campaign',
      challenge: 'Coordinating a multi-market campaign across 15 countries with tight deadlines',
      result: 'Delivered on time across all markets, 25% increase in campaign effectiveness',
    },
  },
  {
    id: 'music-events',
    icon: Music,
    title: 'Music & Events',
    tagline: 'Events That Don\'t Fall Apart Last Minute',
    description: 'Stop panicking about vendor no-shows and talent drama. Coordinate events that actually happen as planned.',
    longDescription: 'Built by event producers who\'ve survived festival meltdowns and last-minute venue changes. From planning to execution, we handle the logistics nightmare so you can focus on creating amazing experiences instead of putting out fires.',
    features: [
      'Event planning and timeline management',
      'Venue and logistics coordination',
      'Talent and vendor management',
      'Ticketing and audience engagement',
      'Live event monitoring and support',
      'Post-event analytics and reporting',
    ],
    benefits: [
      'Improve event success rate to 99.8%',
      'Reduce planning time by 40%',
      'Enhanced vendor and talent coordination',
      'Real-time event monitoring',
      'Comprehensive post-event insights',
    ],
    stats: {
      projects: '8K+',
      savings: '40%',
      satisfaction: '98%',
      clients: '300+',
    },
    gradient: 'from-primary to-secondary',
    href: '/solutions/music-events',
    caseStudy: {
      company: 'Harmony Events',
      project: 'Music Festival Series',
      challenge: 'Managing 5 simultaneous festivals across different cities with shared resources',
      result: '99.8% event success rate, 50% reduction in coordination overhead',
    },
  },
  {
    id: 'corporate',
    icon: Building,
    title: 'Corporate',
    tagline: 'Corporate Content Without the Corporate Headaches',
    description: 'Scale content production without drowning in approval workflows and compliance nightmares.',
    longDescription: 'Built for corporate teams tired of endless approval chains and brand guideline chaos. From training videos to marketing materials, we streamline enterprise content production so you can actually ship things instead of living in revision purgatory.',
    features: [
      'Content strategy and planning',
      'Internal communications management',
      'Training and educational content',
      'Brand asset management',
      'Compliance and approval workflows',
      'Global content distribution',
    ],
    benefits: [
      'Accelerate content production by 50%',
      'Ensure brand consistency across all content',
      'Streamline approval and compliance processes',
      'Improve internal communication effectiveness',
      'Scale content operations globally',
    ],
    stats: {
      projects: '35K+',
      savings: '50%',
      satisfaction: '98%',
      clients: '1K+',
    },
    gradient: 'from-primary to-secondary',
    href: '/solutions/corporate',
    caseStudy: {
      company: 'Global Tech Corp',
      project: 'Worldwide Training Initiative',
      challenge: 'Creating and distributing training content for 50,000+ employees across 40 countries',
      result: 'Reduced production time by 60%, improved training completion rates by 35%',
    },
  },
];

const commonFeatures = [
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Real-time communication and file sharing across all team members',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Comprehensive reporting and performance analytics',
  },
  {
    icon: Zap,
    title: 'Automation',
    description: 'Automated workflows and intelligent task management',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Multi-region support with local compliance and regulations',
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-subtle">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Industry Solutions
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              TAILORED FOR
              <br />
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                YOUR INDUSTRY
              </span>
            </h1>
            <p className={`max-w-3xl mx-auto ${typography.heroSubtitle}`}>
              Stop juggling 47 different apps. We built production management that actually works 
              for your industry's specific chaos, not generic project management fluff.
            </p>
          </div>

          {/* Industry Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {solutions.map((solution: any) => {
              const Icon = solution.icon;
              return (
                <Card key={solution.id} className="group hover:shadow-floating transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-lg text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${solution.gradient} mb-md`}>
                      <Icon className="h-8 w-8 text-background" />
                    </div>
                    <h3 className="font-title text-heading-4 text-heading-3 mb-sm">{solution.title}</h3>
                    <p className="text-body-sm color-muted mb-md">{solution.tagline}</p>
                    <a href={solution.href}>
                      <Button className="transition-all duration-200 hover:scale-105 group-hover:text-accent">
                        Learn More
                        <ArrowRight className="ml-sm h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Solutions */}
      <section className="py-4xl">
        <div className="container mx-auto px-md">
          <div className="space-y-4xl">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div key={solution.id} className={`grid lg:grid-cols-2 gap-2xl items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="stack-lg">
                      <div>
                        <div className="flex items-center gap-sm mb-sm">
                          <div className={`p-sm rounded-lg bg-gradient-to-r ${solution.gradient}`}>
                            <Icon className="h-6 w-6 text-background" />
                          </div>
                          <h2 className="font-title text-heading-2 lg:text-heading-1 text-heading-3">{solution.title}</h2>
                        </div>
                        <p className="text-heading-4 form-label text-foreground mb-md">{solution.tagline}</p>
                        <p className="text-body color-muted">{solution.longDescription}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="text-heading-4 color-foreground mb-sm">Key Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                          {solution.features.map((feature: any) => (
                            <div key={feature} className="flex items-center gap-sm">
                              <CheckCircle className="h-4 w-4 color-success flex-shrink-0" />
                              <span className="text-body-sm color-muted">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h3 className="text-heading-4 color-foreground mb-sm">Benefits</h3>
                        <div className="stack-sm">
                          {solution.benefits.map((benefit: any) => (
                            <div key={benefit} className="flex items-center gap-sm">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${solution.gradient}`}></div>
                              <span className="text-body-sm color-muted">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row gap-md">
                        <a href={solution.href}>
                          <Button className="w-full sm:w-auto group transition-all duration-200 hover:scale-105">
                            Explore {solution.title}
                            <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
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

                  {/* Stats & Case Study Card */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <Card className={`bg-gradient-to-br ${solution.gradient} bg-opacity-5 border-opacity-20`}>
                      <CardContent className="p-xl">
                        {/* Stats */}
                        <div className="mb-xl">
                          <h3 className="font-title text-heading-3 text-heading-3 mb-lg text-center">
                            {solution.title} by the Numbers
                          </h3>
                          <div className="grid grid-cols-2 gap-lg">
                            <div className="text-center">
                              <div className="font-title text-heading-2 text-heading-3 color-foreground mb-sm">
                                {solution.stats.projects}
                              </div>
                              <div className="text-body-sm color-muted">Projects</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-heading-2 text-heading-3 color-foreground mb-sm">
                                {solution.stats.savings}
                              </div>
                              <div className="text-body-sm color-muted">Time Saved</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-heading-2 text-heading-3 color-foreground mb-sm">
                                {solution.stats.satisfaction}
                              </div>
                              <div className="text-body-sm color-muted">Satisfaction</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-heading-2 text-heading-3 color-foreground mb-sm">
                                {solution.stats.clients}
                              </div>
                              <div className="text-body-sm color-muted">Clients</div>
                            </div>
                          </div>
                        </div>

                        {/* Case Study */}
                        <div className="pt-xl border-t">
                          <h4 className="text-heading-4 color-foreground mb-md">Success Story</h4>
                          <div className="stack-sm">
                            <div>
                              <span className="text-heading-4 text-body-sm">{solution.caseStudy.company}</span>
                              <span className="text-body-sm color-muted"> - {solution.caseStudy.project}</span>
                            </div>
                            <div>
                              <div className="text-body-sm color-muted mb-xs">CHALLENGE</div>
                              <div className="text-body-sm color-foreground">{solution.caseStudy.challenge}</div>
                            </div>
                            <div>
                              <div className="text-body-sm color-muted mb-xs">RESULT</div>
                              <div className="text-body-sm text-heading-4 text-foreground">{solution.caseStudy.result}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Features Section */}
      <section className="py-4xl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className="font-title text-heading-2 lg:text-heading-1 text-heading-3 mb-lg">
              POWERFUL FEATURES
              <br />
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                ACROSS ALL INDUSTRIES
              </span>
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Every industry has its own special brand of chaos. These features work across 
              all of them to keep your productions from falling apart.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg mb-3xl">
            {commonFeatures.map((feature: any) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center hover:shadow-floating transition-shadow">
                  <CardContent className="p-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-md">
                      <Icon className="h-6 w-6 text-foreground" />
                    </div>
                    <h3 className="text-heading-4 color-foreground mb-sm">{feature.title}</h3>
                    <p className="text-body-sm color-muted">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Integration Highlight */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-xl lg:p-2xl text-center">
              <h3 className="font-title text-heading-3 text-heading-3 mb-lg">
                SEAMLESS INTEGRATIONS
              </h3>
              <p className="color-muted mb-xl max-w-2xl mx-auto">
                Works with the tools you're already stuck with. Over 100+ integrations so you don't 
                have to convince your team to abandon everything they know.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
                {['Slack', 'Adobe CC', 'Google Workspace', 'Microsoft 365'].map((integration: any) => (
                  <div key={integration} className="flex items-center justify-center p-md bg-background rounded-lg border">
                    <span className="text-body-sm form-label color-muted">{integration}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <a href="/resources/integrations">
                  <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                    View All Integrations
                  </Button>
                </a>
                <Link href="/auth/signup">
                  <Button className="group transition-all duration-200 hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
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
