import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Users, Calendar, TrendingUp, Zap, CheckCircle, Play, Star, Network, Presentation } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Trade Shows & Conferences Solutions | GHXSTSHIP',
  description: 'Master trade shows and conferences with GHXSTSHIP. Manage exhibitions, attendee engagement, lead generation, and networking events.',
  openGraph: {
    title: 'Trade Shows & Conferences Solutions | GHXSTSHIP',
    description: 'Master trade shows and conferences with GHXSTSHIP. Manage exhibitions, attendee engagement, lead generation, and networking events.',
    url: 'https://ghxstship.com/solutions/trade-shows-conferences',
  },
};

const challenges = [
  {
    icon: Users,
    title: 'Large-Scale Attendee Management',
    description: 'Coordinating thousands of attendees, exhibitors, and speakers across multiple venues and sessions',
    solution: 'Comprehensive attendee management with registration, check-in, and real-time tracking systems',
  },
  {
    icon: Calendar,
    title: 'Complex Scheduling Coordination',
    description: 'Managing overlapping sessions, workshops, and networking events with resource conflicts',
    solution: 'Intelligent scheduling engine with conflict resolution and automated resource allocation',
  },
  {
    icon: TrendingUp,
    title: 'Lead Generation & ROI Tracking',
    description: 'Maximizing business value and measuring success across exhibitors and attendees',
    solution: 'Advanced lead capture tools with ROI analytics and business impact measurement',
  },
  {
    icon: Network,
    title: 'Networking Facilitation',
    description: 'Creating meaningful connections between diverse attendees with varying interests and goals',
    solution: 'AI-powered networking tools with matchmaking algorithms and structured networking events',
  },
];

const features = [
  {
    title: 'Exhibition Management',
    description: 'Complete coordination of trade show floors, booth assignments, and exhibitor services',
    benefits: ['Floor planning', 'Booth management', 'Exhibitor portal', 'Lead tracking'],
  },
  {
    title: 'Conference Orchestration',
    description: 'End-to-end management of multi-track conferences with speakers and sessions',
    benefits: ['Session scheduling', 'Speaker coordination', 'Content management', 'Live streaming'],
  },
  {
    title: 'Attendee Experience Platform',
    description: 'Personalized attendee journeys with networking and engagement tools',
    benefits: ['Mobile app', 'Networking matching', 'Gamification', 'Real-time updates'],
  },
  {
    title: 'Business Intelligence',
    description: 'Comprehensive analytics for exhibitors, organizers, and attendees',
    benefits: ['Lead analytics', 'Engagement metrics', 'ROI reporting', 'Performance dashboards'],
  },
];

const caseStudies = [
  {
    title: 'Global Tech Summit',
    project: 'International Technology Conference',
    challenge: 'Managing 15,000+ attendees across 5 days with 200+ sessions and 500+ exhibitors',
    solution: 'Implemented GHXSTSHIP for comprehensive event management with mobile app and networking platform',
    results: [
      '98% attendee satisfaction rating',
      '300% increase in networking connections',
      '85% exhibitor lead generation improvement',
      '40% reduction in operational costs',
    ],
    testimonial: 'GHXSTSHIP transformed our conference from logistical nightmare to seamless experience for all stakeholders.',
    author: 'Maria Rodriguez, Event Director',
  },
  {
    title: 'Manufacturing Trade Expo',
    project: 'Industrial Equipment Exhibition',
    challenge: 'Coordinating 800+ exhibitors and 25,000+ visitors with complex logistics and lead tracking',
    solution: 'Used GHXSTSHIP for exhibitor management, lead capture, and real-time floor analytics',
    results: [
      '95% exhibitor renewal rate',
      '250% increase in qualified leads',
      '60% improvement in floor traffic flow',
      '$50M+ in business deals facilitated',
    ],
    testimonial: 'The platform delivered unprecedented ROI for our exhibitors and created the most successful expo in our history.',
    author: 'David Chen, Trade Show Manager',
  },
];

const integrations = [
  { name: 'Salesforce', category: 'CRM' },
  { name: 'HubSpot', category: 'Marketing' },
  { name: 'Eventbrite', category: 'Registration' },
  { name: 'Zoom', category: 'Virtual Events' },
  { name: 'LinkedIn', category: 'Networking' },
  { name: 'Mailchimp', category: 'Email Marketing' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Google Analytics', category: 'Analytics' },
];

export default function TradeShowsConferencesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Trade Shows & Conferences
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  MASTER
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                    BUSINESS
                  </span>
                  <br />
                  EVENTS
                </h1>
                <p className="text-heading-4 color-muted">
                  From intimate conferences to massive trade shows, GHXSTSHIP empowers 
                  organizers to create business events that drive connections, generate 
                  leads, and deliver measurable ROI for all stakeholders.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>5M+</div>
                  <div className="text-body-sm color-muted">Attendees Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>10K+</div>
                  <div className="text-body-sm color-muted">Events Powered</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>95%</div>
                  <div className="text-body-sm color-muted">Lead Capture Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>4.2X</div>
                  <div className="text-body-sm color-muted">Average ROI Increase</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Building
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  View Success Stories
                </Button>
              </div>
            </div>

            {/* Conference Dashboard Preview */}
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
                      <Presentation className="w-3 h-3" />
                      events.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>TECH SUMMIT 2024</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Attendees</div>
                      <div className="text-heading-4">12.5K</div>
                      <div className="flex items-center gap-xs mt-xs">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-success">Active</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Sessions</div>
                      <div className="text-heading-4">45</div>
                      <div className="flex -cluster-xs mt-xs">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Engagement</div>
                      <div className="text-heading-4">87%</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-primary h-1 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Live Sessions</div>
                    {[
                      { session: 'AI Innovation Keynote', attendees: 3200, room: 'Main Hall', color: 'bg-destructive' },
                      { session: 'Startup Pitch Competition', attendees: 850, room: 'Hall B', color: 'bg-primary' },
                      { session: 'Networking Lunch', attendees: 5600, room: 'Exhibition', color: 'bg-success' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.session}</span>
                        <span className="color-muted">{item.room}</span>
                        <span className="color-muted">({item.attendees})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Network className="w-4 h-4 color-primary" />
                    <span className="text-body-sm form-label">2,847 new connections made today</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    </div>
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
              BUSINESS EVENT CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Trade shows and conferences require sophisticated coordination to deliver value for all stakeholders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-primary">
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
              COMPREHENSIVE EVENT PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create successful trade shows and conferences that drive business results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
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
              BUSINESS EVENT SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how event organizers are creating exceptional business experiences with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-2xl">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
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
              BUSINESS EVENT INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with leading business platforms to maximize event ROI and lead generation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
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
              READY TO DRIVE BUSINESS RESULTS?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join event organizers using GHXSTSHIP to create trade shows and conferences 
              that generate leads, build relationships, and deliver measurable ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Building
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
