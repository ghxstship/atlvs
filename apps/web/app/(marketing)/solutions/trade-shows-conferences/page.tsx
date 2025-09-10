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
      <section className="py-20 bg-gradient-to-br from-purple-500/5 via-background to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Trade Shows & Conferences
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  MASTER
                  <br />
                  <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    BUSINESS
                  </span>
                  <br />
                  EVENTS
                </h1>
                <p className="text-xl text-muted-foreground">
                  From intimate conferences to massive trade shows, GHXSTSHIP empowers 
                  organizers to create business events that drive connections, generate 
                  leads, and deliver measurable ROI for all stakeholders.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>5M+</div>
                  <div className="text-sm text-muted-foreground">Attendees Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>10K+</div>
                  <div className="text-sm text-muted-foreground">Events Powered</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>95%</div>
                  <div className="text-sm text-muted-foreground">Lead Capture Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>4.2X</div>
                  <div className="text-sm text-muted-foreground">Average ROI Increase</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Building
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  View Success Stories
                </Button>
              </div>
            </div>

            {/* Conference Dashboard Preview */}
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
                      <Presentation className="w-3 h-3" />
                      events.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>TECH SUMMIT 2024</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Attendees</div>
                      <div className="font-semibold">12.5K</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-500">Active</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Sessions</div>
                      <div className="font-semibold">45</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-purple-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Engagement</div>
                      <div className="font-semibold">87%</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-purple-500 h-1 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Live Sessions</div>
                    {[
                      { session: 'AI Innovation Keynote', attendees: 3200, room: 'Main Hall', color: 'bg-red-500' },
                      { session: 'Startup Pitch Competition', attendees: 850, room: 'Hall B', color: 'bg-blue-500' },
                      { session: 'Networking Lunch', attendees: 5600, room: 'Exhibition', color: 'bg-green-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="font-medium flex-1">{item.session}</span>
                        <span className="text-muted-foreground">{item.room}</span>
                        <span className="text-muted-foreground">({item.attendees})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Network className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium">2,847 new connections made today</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
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
              BUSINESS EVENT CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Trade shows and conferences require sophisticated coordination to deliver value for all stakeholders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
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
              COMPREHENSIVE EVENT PLATFORM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create successful trade shows and conferences that drive business results.
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
              BUSINESS EVENT SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how event organizers are creating exceptional business experiences with GHXSTSHIP.
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
              BUSINESS EVENT INTEGRATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with leading business platforms to maximize event ROI and lead generation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-purple-500/5 to-indigo-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO DRIVE BUSINESS RESULTS?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join event organizers using GHXSTSHIP to create trade shows and conferences 
              that generate leads, build relationships, and deliver measurable ROI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Building
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
