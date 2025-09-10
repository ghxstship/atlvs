import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Music, Calendar, Users, Zap, CheckCircle, Play, Star, Headphones, Mic } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Music & Events Solutions | GHXSTSHIP',
  description: 'Power your music production and live events with GHXSTSHIP. Connect artists, producers, and event organizers worldwide.',
  openGraph: {
    title: 'Music & Events Solutions | GHXSTSHIP',
    description: 'Power your music production and live events with GHXSTSHIP. Connect artists, producers, and event organizers worldwide.',
    url: 'https://ghxstship.com/solutions/music-events',
  },
};

const challenges = [
  {
    icon: Music,
    title: 'Artist Collaboration',
    description: 'Coordinating remote recording sessions and creative collaborations across time zones',
    solution: 'Real-time collaboration tools with version control and feedback systems',
  },
  {
    icon: Calendar,
    title: 'Event Production Management',
    description: 'Managing complex logistics for tours, festivals, and live events',
    solution: 'Comprehensive project management with timeline and resource tracking',
  },
  {
    icon: Users,
    title: 'Talent Discovery & Booking',
    description: 'Finding and booking the right artists, producers, and technical crew',
    solution: 'Global talent marketplace with skills verification and ratings',
  },
  {
    icon: Headphones,
    title: 'Audio Production Workflows',
    description: 'Streamlining recording, mixing, and mastering processes',
    solution: 'Integrated workflows with industry-standard DAW compatibility',
  },
];

const features = [
  {
    title: 'Music Production Hub',
    description: 'Complete ecosystem for music creation and collaboration',
    benefits: ['Remote recording', 'Version control', 'Feedback loops', 'Rights management'],
  },
  {
    title: 'Event Management',
    description: 'End-to-end event planning and execution tools',
    benefits: ['Venue coordination', 'Artist booking', 'Technical riders', 'Budget tracking'],
  },
  {
    title: 'Talent Marketplace',
    description: 'Connect with artists, producers, and industry professionals',
    benefits: ['Skill matching', 'Portfolio reviews', 'Secure contracts', 'Payment processing'],
  },
  {
    title: 'Live Performance Tools',
    description: 'Technology solutions for live shows and streaming',
    benefits: ['Stream management', 'Audience engagement', 'Multi-camera setup', 'Real-time mixing'],
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
      <section className="py-20 bg-gradient-to-br from-purple-500/5 via-background to-pink-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Music & Events
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  AMPLIFY YOUR
                  <br />
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    CREATIVE
                  </span>
                  <br />
                  VISION
                </h1>
                <p className="text-xl text-muted-foreground">
                  From studio to stage, GHXSTSHIP connects artists, producers, 
                  and event organizers worldwide. Create, collaborate, and deliver 
                  unforgettable musical experiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>10K+</div>
                  <div className="text-sm text-muted-foreground">Artists Connected</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-sm text-muted-foreground">Events Produced</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>1M+</div>
                  <div className="text-sm text-muted-foreground">Tracks Created</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50+</div>
                  <div className="text-sm text-muted-foreground">Countries Served</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Music Production Dashboard Preview */}
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
                      <Music className="w-3 h-3" />
                      studio.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>MIDNIGHT SESSIONS</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Recording
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                      <div className="font-semibold">8/12 Tracks</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-purple-500 h-1 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Collaborators</div>
                      <div className="font-semibold">12 Active</div>
                      <div className="flex -space-x-1 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-4 h-4 bg-purple-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Recent Activity</div>
                    {[
                      { action: 'Vocals recorded', user: 'Sarah M.', time: '2h ago', status: 'complete' },
                      { action: 'Mix revision', user: 'Alex K.', time: '4h ago', status: 'review' },
                      { action: 'Guitar overdubs', user: 'Mike R.', time: '6h ago', status: 'complete' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.status === 'complete' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="font-medium flex-1">{item.action}</span>
                        <span className="text-muted-foreground">{item.user}</span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Mic className="w-4 h-4 text-purple-500" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Live Recording</span>
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
              MUSIC INDUSTRY CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The music and events industry faces unique creative and logistical challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
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
              COMPLETE MUSIC ECOSYSTEM
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, produce, and perform music at the highest level.
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
              CREATIVE SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how artists and event organizers are pushing creative boundaries with GHXSTSHIP.
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
              MUSIC INDUSTRY INTEGRATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with the DAWs, streaming platforms, and tools you already use.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO CREATE MAGIC?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of artists, producers, and event organizers using GHXSTSHIP 
              to bring their creative visions to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Creating
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
