import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Building, Shield, Users, Zap, CheckCircle, Play, Star, TrendingUp, Globe } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Corporate & Private Events Solutions | GHXSTSHIP',
  description: 'Orchestrate exceptional corporate and private events with GHXSTSHIP. Manage executive meetings, galas, product launches, and exclusive gatherings.',
  openGraph: {
    title: 'Corporate & Private Events Solutions | GHXSTSHIP',
    description: 'Orchestrate exceptional corporate and private events with GHXSTSHIP. Manage executive meetings, galas, product launches, and exclusive gatherings.',
    url: 'https://ghxstship.com/solutions/corporate-private-events',
  },
};

const challenges = [
  {
    icon: Building,
    title: 'Executive-Level Expectations',
    description: 'Meeting the high standards and complex requirements of C-suite and VIP attendees',
    solution: 'White-glove service coordination with dedicated executive support and concierge services',
  },
  {
    icon: Shield,
    title: 'Privacy & Security Management',
    description: 'Ensuring confidentiality, security protocols, and discretion for high-profile events',
    solution: 'Advanced security coordination with NDA management and confidential guest handling',
  },
  {
    icon: Users,
    title: 'Exclusive Guest Experience',
    description: 'Creating personalized, memorable experiences for discerning corporate and private clients',
    solution: 'Luxury event management with personalization tools and premium vendor networks',
  },
  {
    icon: TrendingUp,
    title: 'Business Impact Measurement',
    description: 'Demonstrating ROI and business value from corporate events and private gatherings',
    solution: 'Executive reporting with business impact analytics and relationship tracking',
  },
];

const features = [
  {
    title: 'Executive Event Management',
    description: 'Premium coordination for board meetings, product launches, and corporate galas',
    benefits: ['Executive logistics', 'VIP coordination', 'Security management', 'Protocol services'],
  },
  {
    title: 'Private Event Orchestration',
    description: 'Exclusive management for private parties, celebrations, and intimate gatherings',
    benefits: ['Luxury planning', 'Personalized service', 'Vendor curation', 'Guest experience'],
  },
  {
    title: 'Corporate Hospitality',
    description: 'Sophisticated client entertainment and relationship-building events',
    benefits: ['Client relations', 'Hospitality suites', 'Entertainment booking', 'Relationship tracking'],
  },
  {
    title: 'Business Impact Analytics',
    description: 'Measure event success and business outcomes with executive reporting',
    benefits: ['ROI tracking', 'Relationship metrics', 'Business impact', 'Executive dashboards'],
  },
];

const caseStudies = [
  {
    title: 'Fortune 100 Technology Company',
    project: 'Annual Shareholder Meeting',
    challenge: 'Orchestrating a high-profile shareholder meeting for 2,000+ attendees with global media coverage',
    solution: 'Implemented GHXSTSHIP for comprehensive event management with security protocols and media coordination',
    results: [
      '100% flawless execution with zero incidents',
      '95% attendee satisfaction rating',
      '50% reduction in planning time',
      'Seamless integration of virtual and in-person attendees',
    ],
    testimonial: 'GHXSTSHIP delivered the most professional and seamless shareholder meeting in our company history.',
    author: 'Sarah Chen, Chief Communications Officer',
  },
  {
    title: 'Private Equity Firm',
    project: 'Exclusive Client Appreciation Gala',
    challenge: 'Creating an intimate, luxury experience for 150 ultra-high-net-worth clients and partners',
    solution: 'Used GHXSTSHIP for white-glove event coordination with personalized service and discretion protocols',
    results: [
      '10/10 client satisfaction scores',
      '100% confidentiality maintained',
      '40% increase in client engagement',
      '$25M+ in new business relationships formed',
    ],
    testimonial: 'The attention to detail and discretion exceeded our highest expectations. Truly world-class service.',
    author: 'Michael Torres, Managing Partner',
  },
];

const integrations = [
  { name: 'Concierge Services', category: 'Luxury Services' },
  { name: 'Private Security', category: 'Security' },
  { name: 'Luxury Catering', category: 'F&B' },
  { name: 'Executive Transport', category: 'Transportation' },
  { name: 'Premium Venues', category: 'Venues' },
  { name: 'Entertainment Booking', category: 'Entertainment' },
  { name: 'Floral Design', category: 'Decor' },
  { name: 'Photography/Video', category: 'Media' },
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
                  Corporate & Private Events
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  ORCHESTRATE
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    EXCEPTIONAL
                  </span>
                  <br />
                  EVENTS
                </h1>
                <p className="text-xl text-muted-foreground">
                  From executive board meetings to exclusive private celebrations, GHXSTSHIP 
                  delivers white-glove event management that exceeds the highest expectations 
                  and creates unforgettable experiences for discerning clients.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>2,500+</div>
                  <div className="text-sm text-muted-foreground">Premium Events</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-sm text-muted-foreground">Executive Clients</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>100%</div>
                  <div className="text-sm text-muted-foreground">Confidentiality</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>9.8/10</div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Premium Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  View Portfolio
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
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>EXECUTIVE GALA 2024</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">VIP Guests</div>
                      <div className="font-semibold">150</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gold-500">Confirmed</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Vendors</div>
                      <div className="font-semibold">12</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-blue-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                      <div className="font-semibold">On Track</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-green-500 h-1 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Event Schedule</div>
                    {[
                      { event: 'VIP Reception', time: '6:00 PM', status: 'Ready', color: 'bg-green-500' },
                      { event: 'Dinner Service', time: '7:30 PM', status: 'Prep', color: 'bg-blue-500' },
                      { event: 'Awards Ceremony', time: '9:00 PM', status: 'Setup', color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="font-medium flex-1">{item.event}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                        <span className="text-muted-foreground">({item.status})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">White-Glove Service Active</span>
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
              PREMIUM EVENT CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Corporate and private events demand the highest standards of execution and discretion.
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
              WHITE-GLOVE EVENT PLATFORM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Premium event management designed for the most discerning corporate and private clients.
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
              PREMIUM EVENT SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how discerning clients create exceptional corporate and private events with GHXSTSHIP.
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
              PREMIUM VENDOR NETWORK
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Access our curated network of luxury vendors and premium service providers.
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
              READY FOR WHITE-GLOVE SERVICE?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join discerning clients using GHXSTSHIP to create exceptional corporate 
              and private events that exceed the highest expectations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Premium Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
