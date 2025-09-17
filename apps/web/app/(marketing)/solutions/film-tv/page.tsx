import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Film, Users, Clock, DollarSign, Award, Zap, CheckCircle, Play, Star } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Film & TV Production Solutions | GHXSTSHIP',
  description: 'Streamline your film and television production workflow with GHXSTSHIP. From pre-production to post, manage projects, teams, and budgets efficiently.',
  openGraph: {
    title: 'Film & TV Production Solutions | GHXSTSHIP',
    description: 'Streamline your film and television production workflow with GHXSTSHIP. From pre-production to post, manage projects, teams, and budgets efficiently.',
    url: 'https://ghxstship.com/solutions/film-tv',
  },
};

const challenges = [
  {
    icon: Users,
    title: 'Complex Team Coordination',
    description: 'Managing large, distributed crews across multiple locations and time zones',
    solution: 'Real-time collaboration tools and centralized communication',
  },
  {
    icon: Clock,
    title: 'Tight Production Schedules',
    description: 'Meeting demanding deadlines while maintaining quality standards',
    solution: 'AI-powered scheduling and automated workflow optimization',
  },
  {
    icon: DollarSign,
    title: 'Budget Management',
    description: 'Tracking expenses across departments and preventing cost overruns',
    solution: 'Real-time budget tracking and automated expense reporting',
  },
  {
    icon: Film,
    title: 'Asset Organization',
    description: 'Managing thousands of files, versions, and creative assets',
    solution: 'Intelligent asset management with version control',
  },
];

const features = [
  {
    title: 'Pre-Production Planning',
    description: 'Script breakdowns, scheduling, location scouting, and crew management',
    benefits: ['Script analysis tools', 'Location database', 'Crew scheduling', 'Budget planning'],
  },
  {
    title: 'Production Management',
    description: 'Daily call sheets, progress tracking, and real-time communication',
    benefits: ['Digital call sheets', 'Progress dashboards', 'Mobile apps', 'Weather integration'],
  },
  {
    title: 'Post-Production Workflow',
    description: 'Asset management, review cycles, and delivery coordination',
    benefits: ['Version control', 'Review & approval', 'Delivery tracking', 'Archive management'],
  },
  {
    title: 'Financial Tracking',
    description: 'Budget monitoring, expense tracking, and financial reporting',
    benefits: ['Real-time budgets', 'Expense capture', 'Cost reports', 'Invoice management'],
  },
];

const caseStudies = [
  {
    title: 'Meridian Studios',
    project: 'Epic Fantasy Series',
    challenge: 'Managing 200+ crew members across 5 countries for a $50M production',
    solution: 'Implemented GHXSTSHIP for unified project management and communication',
    results: [
      '30% reduction in production delays',
      '25% improvement in budget accuracy',
      '40% faster post-production workflow',
      '99.8% crew satisfaction rating',
    ],
    testimonial: 'GHXSTSHIP transformed how we manage large-scale productions. The visibility and control it provides is unmatched.',
    author: 'Sarah Chen, Executive Producer',
  },
  {
    title: 'Blackwater Productions',
    project: 'Documentary Series',
    challenge: 'Coordinating remote filming across multiple continents with tight deadlines',
    solution: 'Used ATLVS for project coordination and OPENDECK for local crew sourcing',
    results: [
      '50% faster crew onboarding',
      '35% reduction in travel costs',
      '20% improvement in delivery times',
      '100% on-time episode delivery',
    ],
    testimonial: 'The global talent network on OPENDECK helped us find amazing local crews we never would have discovered otherwise.',
    author: 'Marcus Rodriguez, Director',
  },
];

const integrations = [
  { name: 'Avid Media Composer', category: 'Editing' },
  { name: 'Adobe Premiere Pro', category: 'Editing' },
  { name: 'DaVinci Resolve', category: 'Color/Audio' },
  { name: 'Frame.io', category: 'Review' },
  { name: 'Shotgun', category: 'Pipeline' },
  { name: 'Movie Magic', category: 'Scheduling' },
  { name: 'StudioBinder', category: 'Pre-Production' },
  { name: 'Slack', category: 'Communication' },
];

export default function FilmTVPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-4">
                  Film & TV Solutions
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-6 uppercase`}>
                  STREAMLINE YOUR
                  <br />
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    FILM & TV
                  </span>
                  <br />
                  PRODUCTION
                </h1>
                <p className="text-heading-4 color-muted">
                  From script to screen, GHXSTSHIP provides the tools and workflows 
                  that film and television professionals need to deliver exceptional content on time and on budget.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-body-sm color-muted">Productions Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>$2B+</div>
                  <div className="text-body-sm color-muted">Budget Tracked</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>95%</div>
                  <div className="text-body-sm color-muted">On-Time Delivery</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>50K+</div>
                  <div className="text-body-sm color-muted">Crew Members</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Production Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-sm px-md py-sm bg-secondary/50 border-b">
                  <div className="flex gap-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-sm px-sm py-xs bg-background rounded-md text-body-sm color-muted">
                      <Film className="w-3 h-3" />
                      production.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>BLACKWATER REVERB</h3>
                    <Badge variant="outline" className="color-success border-success">
                      In Production
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-1">Budget</div>
                      <div className="text-heading-4">$75K</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-2">
                        <div className="bg-success h-1 rounded-full w-3/4"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-1">Schedule</div>
                      <div className="text-heading-4">Day 12/20</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-2">
                        <div className="bg-primary h-1 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-1">Crew</div>
                      <div className="text-heading-4">45 Active</div>
                      <div className="flex -cluster-xs mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-4 h-4 bg-secondary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Today's Schedule</div>
                    {[
                      { time: '06:00', task: 'Crew Call', status: 'completed' },
                      { time: '08:00', task: 'Scene 12A - Exterior', status: 'in-progress' },
                      { time: '14:00', task: 'Scene 15 - Interior', status: 'pending' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'completed' ? 'bg-success' : 
                          item.status === 'in-progress' ? 'bg-primary' : 'bg-secondary-foreground'
                        }`}></div>
                        <span className="form-label">{item.time}</span>
                        <span className="color-muted">{item.task}</span>
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
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              FILM & TV PRODUCTION CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              The film and television industry faces unique challenges that require specialized solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-secondary to-primary">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-3 uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-4">{challenge.description}</p>
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
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              END-TO-END PRODUCTION MANAGEMENT
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Comprehensive tools for every stage of film and television production.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-4 uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-6">{feature.description}</p>
                  
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
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how leading production companies have transformed their workflows with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-xl">
                  <div className="grid lg:grid-cols-2 gap-xl">
                    <div>
                      <Badge variant="outline" className="mb-4">{study.project}</Badge>
                      <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-4 uppercase`}>{study.title}</h3>
                      
                      <div className="stack-md">
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">CHALLENGE</h4>
                          <p className="color-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">SOLUTION</h4>
                          <p className="color-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-4 uppercase">RESULTS</h4>
                      <div className="stack-sm mb-6">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-sm">
                            <Star className="h-4 w-4 color-warning flex-shrink-0" />
                            <span className="text-body-sm form-label color-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4">
                        <p className="color-foreground italic mb-2">"{study.testimonial}"</p>
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
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              INDUSTRY INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Seamlessly connect with the tools your team already uses.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-1">{integration.name}</h3>
                  <p className="text-body-sm color-muted">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              READY TO TRANSFORM YOUR PRODUCTION?
            </h2>
            <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
              Join hundreds of production companies using GHXSTSHIP to deliver exceptional 
              film and television content on time and on budget.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
