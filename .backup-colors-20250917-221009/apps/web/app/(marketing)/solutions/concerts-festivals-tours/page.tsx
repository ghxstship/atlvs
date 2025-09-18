import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Music, Calendar, Users, Zap, CheckCircle, Play, Star, Headphones, Mic } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Concerts, Festivals & Tours Solutions | GHXSTSHIP',
  description: 'Power your live music events with GHXSTSHIP. Manage concerts, festivals, and tours with comprehensive production management tools.',
  openGraph: {
    title: 'Concerts, Festivals & Tours Solutions | GHXSTSHIP',
    description: 'Power your live music events with GHXSTSHIP. Manage concerts, festivals, and tours with comprehensive production management tools.',
    url: 'https://ghxstship.com/solutions/concerts-festivals-tours',
  },
};

const challenges = [
  {
    icon: Music,
    title: 'Multi-Venue Coordination',
    description: 'Managing complex logistics across multiple venues, cities, and countries for tours',
    solution: 'Centralized tour management with venue coordination and logistics tracking',
  },
  {
    icon: Calendar,
    title: 'Festival Production Complexity',
    description: 'Coordinating hundreds of artists, stages, and technical requirements simultaneously',
    solution: 'Comprehensive festival management with real-time scheduling and resource allocation',
  },
  {
    icon: Users,
    title: 'Crew & Talent Management',
    description: 'Booking and coordinating artists, technical crews, and support staff across events',
    solution: 'Integrated talent marketplace with crew scheduling and contract management',
  },
  {
    icon: Headphones,
    title: 'Technical Production Workflows',
    description: 'Managing sound, lighting, staging, and broadcast requirements for live events',
    solution: 'Technical rider management with equipment tracking and setup coordination',
  },
];

const features = [
  {
    title: 'Tour Management',
    description: 'Complete tour planning and execution from routing to settlement',
    benefits: ['Route optimization', 'Venue coordination', 'Crew scheduling', 'Financial tracking'],
  },
  {
    title: 'Festival Production',
    description: 'Multi-stage festival management with real-time coordination',
    benefits: ['Stage scheduling', 'Artist coordination', 'Technical planning', 'Crowd management'],
  },
  {
    title: 'Live Event Marketplace',
    description: 'Connect with artists, crews, and vendors for live events',
    benefits: ['Artist booking', 'Crew matching', 'Equipment rental', 'Vendor management'],
  },
  {
    title: 'Production Technology',
    description: 'Advanced tools for sound, lighting, and broadcast production',
    benefits: ['Technical riders', 'Equipment tracking', 'Show control', 'Live streaming'],
  },
];

const caseStudies = [
  {
    title: 'Harmony Records',
    project: 'Global Album Production',
    challenge: 'Coordinating a 12-track album with artists and producers across 6 countries',
    solution: 'Used GHXSTSHIP to manage remote sessions, file sharing, and collaborative mixing',
    results: [
      '50% faster production timeline',
      '30% cost reduction in studio time',
      '100% on-time delivery',
      'Grammy nomination for Best Engineered Album',
    ],
    testimonial: 'GHXSTSHIP made it possible to work with our dream team regardless of location. The collaboration tools are game-changing.',
    author: 'Maya Patel, Executive Producer',
  },
  {
    title: 'Electric Nights Festival',
    project: 'Multi-Stage Music Festival',
    challenge: 'Managing 150+ artists across 5 stages over 3 days with complex technical requirements',
    solution: 'Implemented GHXSTSHIP for artist coordination, technical planning, and real-time event management',
    results: [
      '99.8% event execution success rate',
      '40% improvement in artist satisfaction',
      '25% reduction in technical issues',
      '200K+ attendees across 3 days',
    ],
    testimonial: 'The platform helped us coordinate the most complex festival we\'ve ever produced. Everything ran like clockwork.',
    author: 'Carlos Rodriguez, Festival Director',
  },
];

const integrations = [
  { name: 'Pro Tools', category: 'DAW' },
  { name: 'Logic Pro', category: 'DAW' },
  { name: 'Ableton Live', category: 'DAW' },
  { name: 'Spotify for Artists', category: 'Distribution' },
  { name: 'Bandcamp', category: 'Distribution' },
  { name: 'Eventbrite', category: 'Ticketing' },
  { name: 'Twitch', category: 'Streaming' },
  { name: 'YouTube Live', category: 'Streaming' },
];

export default function MusicEventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-4xl bg-gradient-to-br from-secondary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-2xl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Concerts, Festivals & Tours
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  ORCHESTRATE
                  <br />
                  <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    LEGENDARY
                  </span>
                  <br />
                  LIVE EVENTS
                </h1>
                <p className="text-heading-4 color-muted">
                  From intimate concerts to massive festivals and world tours, GHXSTSHIP 
                  provides the production management tools to create unforgettable 
                  live music experiences that captivate audiences worldwide.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>10K+</div>
                  <div className="text-body-sm color-muted">Artists Connected</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>500+</div>
                  <div className="text-body-sm color-muted">Events Produced</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>1M+</div>
                  <div className="text-body-sm color-muted">Tracks Created</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>50+</div>
                  <div className="text-body-sm color-muted">Countries Served</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Creating
                    <ArrowRight className="ml-sm h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Music Production Dashboard Preview */}
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
                      <Music className="w-3 h-3" />
                      studio.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>MIDNIGHT SESSIONS</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Recording
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Progress</div>
                      <div className="text-heading-4">8/12 Tracks</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-secondary h-1 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Collaborators</div>
                      <div className="text-heading-4">12 Active</div>
                      <div className="flex -cluster-xs mt-sm">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-4 h-4 bg-secondary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Recent Activity</div>
                    {[
                      { action: 'Vocals recorded', user: 'Sarah M.', time: '2h ago', status: 'complete' },
                      { action: 'Mix revision', user: 'Alex K.', time: '4h ago', status: 'review' },
                      { action: 'Guitar overdubs', user: 'Mike R.', time: '6h ago', status: 'complete' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'complete' ? 'bg-success' : 'bg-warning'}`}></div>
                        <span className="form-label flex-1">{item.action}</span>
                        <span className="color-muted">{item.user}</span>
                        <span className="color-muted">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Mic className="w-4 h-4 color-secondary" />
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div className="bg-gradient-to-r from-secondary to-accent h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <span className="text-body-sm color-muted">Live Recording</span>
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
              MUSIC INDUSTRY CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              The music and events industry faces unique creative and logistical challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent">
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
              COMPLETE MUSIC ECOSYSTEM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create, produce, and perform music at the highest level.
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
              CREATIVE SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how artists and event organizers are pushing creative boundaries with GHXSTSHIP.
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
              MUSIC INDUSTRY INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with the DAWs, streaming platforms, and tools you already use.
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
              READY TO CREATE MAGIC?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join thousands of artists, producers, and event organizers using GHXSTSHIP 
              to bring their creative visions to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Creating
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
