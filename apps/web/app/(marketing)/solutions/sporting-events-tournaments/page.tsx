import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Trophy, Target, Users, Zap, CheckCircle, Play, Star, Calendar, Activity } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Sporting Events & Tournaments Solutions | GHXSTSHIP',
  description: 'Power athletic excellence with GHXSTSHIP. Manage tournaments, championships, sporting events, and athletic competitions with precision.',
  openGraph: {
    title: 'Sporting Events & Tournaments Solutions | GHXSTSHIP',
    description: 'Power athletic excellence with GHXSTSHIP. Manage tournaments, championships, sporting events, and athletic competitions with precision.',
    url: 'https://ghxstship.com/solutions/sporting-events-tournaments',
  },
};

const challenges = [
  {
    icon: Trophy,
    title: 'Tournament Bracket Management',
    description: 'Complex scheduling, seeding, and bracket progression across multiple divisions and skill levels',
    solution: 'Automated bracket generation with real-time updates, seeding algorithms, and multi-division management',
  },
  {
    icon: Target,
    title: 'Athletic Performance Tracking',
    description: 'Recording statistics, managing athlete data, and providing real-time performance analytics',
    solution: 'Comprehensive athlete management with performance metrics, statistics tracking, and analytics dashboards',
  },
  {
    icon: Users,
    title: 'Multi-Venue Coordination',
    description: 'Synchronizing events across multiple venues, fields, and facilities with different capacities',
    solution: 'Venue management system with capacity tracking, scheduling optimization, and resource allocation',
  },
  {
    icon: Calendar,
    title: 'Season & Championship Planning',
    description: 'Long-term planning for seasons, playoffs, and championship tournaments with weather contingencies',
    solution: 'Season planning tools with weather integration, contingency scheduling, and championship workflows',
  },
];

const features = [
  {
    title: 'Tournament Management System',
    description: 'Complete tournament organization from registration to championship with automated brackets',
    benefits: ['Bracket generation', 'Seeding algorithms', 'Real-time scoring', 'Championship tracking'],
  },
  {
    title: 'Athlete & Team Coordination',
    description: 'Comprehensive management of athletes, teams, coaches, and support staff',
    benefits: ['Team registration', 'Athlete profiles', 'Coach coordination', 'Performance tracking'],
  },
  {
    title: 'Venue & Facility Management',
    description: 'Multi-venue coordination with scheduling, capacity management, and resource allocation',
    benefits: ['Venue scheduling', 'Capacity tracking', 'Equipment management', 'Facility coordination'],
  },
  {
    title: 'Broadcasting & Media Integration',
    description: 'Live streaming, media coordination, and fan engagement for sporting events',
    benefits: ['Live streaming', 'Media coordination', 'Fan engagement', 'Social integration'],
  },
];

const caseStudies = [
  {
    title: 'National Youth Soccer Championship',
    project: 'Multi-Division Tournament Series',
    challenge: 'Managing 500+ teams across 12 age divisions with 50+ venues over 10 days with live streaming requirements',
    solution: 'Deployed GHXSTSHIP for tournament management with automated brackets, venue coordination, and streaming integration',
    results: [
      '100% tournament completion on schedule',
      '99.8% bracket accuracy maintained',
      '2M+ live stream viewers engaged',
      '95% participant satisfaction rating',
    ],
    testimonial: 'GHXSTSHIP transformed our championship from logistical nightmare to seamless sporting excellence.',
    author: 'Michael Rodriguez, Tournament Director',
  },
  {
    title: 'Olympic Trials Swimming',
    project: 'Elite Athletic Competition',
    challenge: 'Coordinating 1,000+ elite swimmers with precise timing, qualifying standards, and broadcast requirements',
    solution: 'Implemented GHXSTSHIP for athlete management with performance tracking, timing integration, and media coordination',
    results: [
      '100% timing accuracy achieved',
      '50+ Olympic qualifiers identified',
      '10M+ broadcast audience reached',
      '0 scheduling conflicts or delays',
    ],
    testimonial: 'The precision and reliability of GHXSTSHIP helped us identify our next generation of Olympic champions.',
    author: 'Sarah Chen, Competition Manager',
  },
];

const integrations = [
  { name: 'Sports Federations', category: 'Governing Bodies' },
  { name: 'Timing Systems', category: 'Technology' },
  { name: 'Broadcast Networks', category: 'Media' },
  { name: 'Venue Management', category: 'Facilities' },
  { name: 'Athlete Databases', category: 'Registration' },
  { name: 'Streaming Platforms', category: 'Broadcasting' },
  { name: 'Sponsorship Systems', category: 'Commercial' },
  { name: 'Medical Services', category: 'Health & Safety' },
];

export default function SportingEventsTournamentsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-green-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Sporting Events & Tournaments
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  POWER
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                    ATHLETIC
                  </span>
                  <br />
                  EXCELLENCE
                </h1>
                <p className="text-xl text-muted-foreground">
                  From local tournaments to championship events, GHXSTSHIP empowers sports 
                  organizers to create world-class athletic competitions that inspire athletes, 
                  engage fans, and celebrate sporting excellence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>10M+</div>
                  <div className="text-sm text-muted-foreground">Athletes Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>25,000+</div>
                  <div className="text-sm text-muted-foreground">Tournaments</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-sm text-muted-foreground">Sports Covered</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>99.9%</div>
                  <div className="text-sm text-muted-foreground">Event Success Rate</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Competing
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Tournament Dashboard Preview */}
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
                      <Activity className="w-3 h-3" />
                      tournament.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>CHAMPIONSHIP 2024</h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Teams</div>
                      <div className="font-semibold">128</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-500">Active</span>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Matches</div>
                      <div className="font-semibold">127</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-green-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                      <div className="font-semibold">85%</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-blue-500 h-1 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Current Matches</div>
                    {[
                      { match: 'Eagles vs Hawks', venue: 'Stadium A', time: '14:30', status: 'Live' },
                      { match: 'Lions vs Tigers', venue: 'Stadium B', time: '15:00', status: 'Starting' },
                      { match: 'Wolves vs Bears', venue: 'Stadium C', time: '15:30', status: 'Scheduled' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'Live' ? 'bg-red-500 animate-pulse' : 
                          item.status === 'Starting' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="font-medium flex-1">{item.match}</span>
                        <span className="text-muted-foreground">{item.venue}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">Championship Final: Tomorrow 19:00</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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
              SPORTING EVENT CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Athletic competitions demand precision, fairness, and seamless coordination across all aspects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-green-500">
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
              ATHLETIC COMPETITION PLATFORM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to organize world-class sporting events and tournaments.
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
              CHAMPIONSHIP SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how sporting organizations are creating world-class competitions with GHXSTSHIP.
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
              SPORTS ECOSYSTEM CONNECTIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with sports federations, timing systems, broadcast networks, and athletic organizations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-green-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO CHAMPION EXCELLENCE?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join sports organizations using GHXSTSHIP to create world-class tournaments 
              and athletic competitions that inspire athletes and engage fans worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Competing
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
