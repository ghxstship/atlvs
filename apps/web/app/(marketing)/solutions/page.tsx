import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Film, Megaphone, Music, Building, CheckCircle, Users, BarChart3, Zap, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Solutions - Industry-Focused Production Management | GHXSTSHIP',
  description: 'Discover how GHXSTSHIP transforms production workflows across Film & TV, Advertising, Music & Events, and Corporate industries.',
  openGraph: {
    title: 'Solutions - Industry-Focused Production Management | GHXSTSHIP',
    description: 'Discover how GHXSTSHIP transforms production workflows across Film & TV, Advertising, Music & Events, and Corporate industries.',
    url: 'https://ghxstship.com/solutions',
  },
};

const solutions = [
  {
    id: 'film-tv',
    icon: Film,
    title: 'Film & TV',
    tagline: 'Lights, Camera, Efficiency',
    description: 'Streamline complex multi-location shoots, coordinate large crews, and manage production schedules with precision.',
    longDescription: 'From pre-production planning to post-production delivery, GHXSTSHIP provides the comprehensive tools needed to manage the most complex film and television productions. Our platform handles everything from script breakdowns and shooting schedules to crew management and budget tracking.',
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
    gradient: 'from-red-500 to-orange-500',
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
    tagline: 'Creative Campaigns, Delivered',
    description: 'Streamline creative workflows, manage client approvals, and deliver campaigns that drive results.',
    longDescription: 'Navigate the fast-paced world of advertising with tools designed for creative agencies and in-house marketing teams. From initial concept to final delivery, manage campaigns, coordinate with clients, and ensure every creative asset meets brand standards.',
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
    gradient: 'from-blue-500 to-purple-500',
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
    tagline: 'Orchestrate Unforgettable Experiences',
    description: 'Coordinate large-scale events, manage talent and vendors, and create memorable experiences.',
    longDescription: 'Whether it\'s a music festival, corporate event, or live performance, our platform helps you coordinate every detail. From venue management and talent coordination to vendor relationships and audience engagement, ensure every event is flawlessly executed.',
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
    gradient: 'from-green-500 to-teal-500',
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
    tagline: 'Enterprise Content, Simplified',
    description: 'Coordinate internal communications, training materials, and brand content production at scale.',
    longDescription: 'Empower your corporate communications and content teams with enterprise-grade production management. From internal training videos and corporate communications to brand content and marketing materials, streamline every aspect of your content production pipeline.',
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
    gradient: 'from-indigo-500 to-blue-500',
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
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Industry Solutions
            </Badge>
            <h1 className="font-title text-4xl lg:text-6xl font-bold mb-6">
              TAILORED FOR
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                YOUR INDUSTRY
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GHXSTSHIP adapts to your specific industry needs with customizable workflows, 
              specialized features, and deep integrations designed for your unique challenges.
            </p>
          </div>

          {/* Industry Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Card key={solution.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-r ${solution.gradient} mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-title text-xl font-bold mb-2">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{solution.tagline}</p>
                    <a href={solution.href}>
                      <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Learn More
                        <ArrowRight className="ml-2 h-3 w-3" />
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div key={solution.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${solution.gradient}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="font-title text-3xl lg:text-4xl font-bold">{solution.title}</h2>
                        </div>
                        <p className="text-xl font-medium text-primary mb-4">{solution.tagline}</p>
                        <p className="text-lg text-muted-foreground">{solution.longDescription}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Key Features</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {solution.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3">Benefits</h3>
                        <div className="space-y-2">
                          {solution.benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${solution.gradient}`}></div>
                              <span className="text-sm text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a href={solution.href}>
                          <Button size="lg" className="w-full sm:w-auto group">
                            Explore {solution.title}
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </a>
                        <Link href="/auth/signup">
                          <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            Start Free Trial
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Case Study Card */}
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <Card className={`bg-gradient-to-br ${solution.gradient} bg-opacity-5 border-opacity-20`}>
                      <CardContent className="p-8">
                        {/* Stats */}
                        <div className="mb-8">
                          <h3 className="font-title text-2xl font-bold mb-6 text-center">
                            {solution.title} by the Numbers
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                              <div className="font-title text-3xl font-bold text-foreground mb-2">
                                {solution.stats.projects}
                              </div>
                              <div className="text-sm text-muted-foreground">Projects</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-3xl font-bold text-foreground mb-2">
                                {solution.stats.savings}
                              </div>
                              <div className="text-sm text-muted-foreground">Time Saved</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-3xl font-bold text-foreground mb-2">
                                {solution.stats.satisfaction}
                              </div>
                              <div className="text-sm text-muted-foreground">Satisfaction</div>
                            </div>
                            <div className="text-center">
                              <div className="font-title text-3xl font-bold text-foreground mb-2">
                                {solution.stats.clients}
                              </div>
                              <div className="text-sm text-muted-foreground">Clients</div>
                            </div>
                          </div>
                        </div>

                        {/* Case Study */}
                        <div className="pt-8 border-t">
                          <h4 className="font-semibold text-foreground mb-4">Success Story</h4>
                          <div className="space-y-3">
                            <div>
                              <span className="font-semibold text-sm">{solution.caseStudy.company}</span>
                              <span className="text-sm text-muted-foreground"> - {solution.caseStudy.project}</span>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">CHALLENGE</div>
                              <div className="text-sm text-foreground">{solution.caseStudy.challenge}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">RESULT</div>
                              <div className="text-sm font-semibold text-primary">{solution.caseStudy.result}</div>
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
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-title text-3xl lg:text-4xl font-bold mb-6">
              POWERFUL FEATURES
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ACROSS ALL INDUSTRIES
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              While each industry solution is tailored to specific needs, all benefit from 
              our core platform capabilities and enterprise-grade features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {commonFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Integration Highlight */}
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8 lg:p-12 text-center">
              <h3 className="font-title text-2xl font-bold mb-6">
                SEAMLESS INTEGRATIONS
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with the tools you already use. GHXSTSHIP integrates with over 100+ 
                popular applications and services to fit seamlessly into your existing workflow.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {['Slack', 'Adobe CC', 'Google Workspace', 'Microsoft 365'].map((integration) => (
                  <div key={integration} className="flex items-center justify-center p-4 bg-background rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">{integration}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/resources/integrations">
                  <Button variant="outline">
                    View All Integrations
                  </Button>
                </a>
                <Link href="/auth/signup">
                  <Button>
                    Start Free Trial
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
