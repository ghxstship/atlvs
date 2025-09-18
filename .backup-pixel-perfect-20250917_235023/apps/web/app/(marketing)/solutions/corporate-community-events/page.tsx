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
      <section className="py-4xl bg-gradient-to-br from-primary/5 via-background to-info/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Corporate & Private Events
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  ORCHESTRATE
                  <br />
                  <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                    EXCEPTIONAL
                  </span>
                  <br />
                  EVENTS
                </h1>
                <p className="text-heading-4 color-muted">
                  From executive board meetings to exclusive private celebrations, GHXSTSHIP 
                  delivers white-glove event management that exceeds the highest expectations 
                  and creates unforgettable experiences for discerning clients.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>2,500+</div>
                  <div className="text-body-sm color-muted">Premium Events</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>500+</div>
                  <div className="text-body-sm color-muted">Executive Clients</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>100%</div>
                  <div className="text-body-sm color-muted">Confidentiality</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>9.8/10</div>
                  <div className="text-body-sm color-muted">Client Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Premium Trial
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  View Portfolio
                </Button>
              </div>
            </div>

            {/* Enterprise Dashboard Preview */}
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
                      <Building className="w-3 h-3" />
                      enterprise.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>EXECUTIVE GALA 2024</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">VIP Guests</div>
                      <div className="text-heading-4">150</div>
                      <div className="flex items-center gap-xs mt-xs">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-warning">Confirmed</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Vendors</div>
                      <div className="text-heading-4">12</div>
                      <div className="flex -cluster-xs mt-xs">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-primary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Timeline</div>
                      <div className="text-heading-4">On Track</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-success h-1 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Event Schedule</div>
                    {[
                      { event: 'VIP Reception', time: '6:00 PM', status: 'Ready', color: 'bg-success' },
                      { event: 'Dinner Service', time: '7:30 PM', status: 'Prep', color: 'bg-primary' },
                      { event: 'Awards Ceremony', time: '9:00 PM', status: 'Setup', color: 'bg-info' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.event}</span>
                        <span className="color-muted">{item.time}</span>
                        <span className="color-muted">({item.status})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Globe className="w-4 h-4 text-foreground" />
                    <span className="text-body-sm form-label">White-Glove Service Active</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
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
              PREMIUM EVENT CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Corporate and private events demand the highest standards of execution and discretion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-info">
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
              WHITE-GLOVE EVENT PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Premium event management designed for the most discerning corporate and private clients.
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
              PREMIUM EVENT SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how discerning clients create exceptional corporate and private events with GHXSTSHIP.
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
              PREMIUM VENDOR NETWORK
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Access our curated network of luxury vendors and premium service providers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-info rounded-lg flex items-center justify-center mx-auto mb-md">
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
      <section className="py-4xl bg-gradient-to-r from-primary/5 to-info/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY FOR WHITE-GLOVE SERVICE?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join discerning clients using GHXSTSHIP to create exceptional corporate 
              and private events that exceed the highest expectations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Premium Trial
                  <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
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
