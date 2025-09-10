import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Clapperboard, Palette, Users, Zap, CheckCircle, Play, Star, Sparkles, Camera } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Themed & Theatrical Entertainment Solutions | GHXSTSHIP',
  description: 'Create spectacular themed experiences and theatrical productions with GHXSTSHIP. Manage theme parks, theatrical shows, and immersive entertainment.',
  openGraph: {
    title: 'Themed & Theatrical Entertainment Solutions | GHXSTSHIP',
    description: 'Create spectacular themed experiences and theatrical productions with GHXSTSHIP. Manage theme parks, theatrical shows, and immersive entertainment.',
    url: 'https://ghxstship.com/solutions/themed-theatrical-entertainment',
  },
};

const challenges = [
  {
    icon: Clapperboard,
    title: 'Complex Production Coordination',
    description: 'Managing intricate theatrical productions with multiple departments, cast, and crew',
    solution: 'Integrated production management with role-specific workflows and real-time coordination',
  },
  {
    icon: Palette,
    title: 'Creative Asset Management',
    description: 'Organizing costumes, props, sets, and digital assets across multiple productions',
    solution: 'Comprehensive asset libraries with version control and availability tracking',
  },
  {
    icon: Users,
    title: 'Multi-Disciplinary Team Management',
    description: 'Coordinating directors, designers, performers, technicians, and support staff',
    solution: 'Specialized team management tools with skills tracking and scheduling optimization',
  },
  {
    icon: Sparkles,
    title: 'Experience Consistency',
    description: 'Maintaining quality and consistency across multiple shows and themed attractions',
    solution: 'Quality control systems with performance tracking and guest experience analytics',
  },
];

const features = [
  {
    title: 'Production Management',
    description: 'End-to-end management for theatrical productions and themed experiences',
    benefits: ['Show scheduling', 'Cast management', 'Technical coordination', 'Rehearsal planning'],
  },
  {
    title: 'Creative Asset Hub',
    description: 'Centralized management of all creative and technical assets',
    benefits: ['Costume tracking', 'Prop inventory', 'Set management', 'Digital asset library'],
  },
  {
    title: 'Talent & Crew Coordination',
    description: 'Comprehensive talent management and crew scheduling',
    benefits: ['Audition management', 'Contract tracking', 'Availability scheduling', 'Performance reviews'],
  },
  {
    title: 'Guest Experience Analytics',
    description: 'Track and optimize guest satisfaction and engagement',
    benefits: ['Experience metrics', 'Guest feedback', 'Performance analytics', 'Revenue tracking'],
  },
];

const caseStudies = [
  {
    title: 'Enchanted Worlds Theme Park',
    project: 'Multi-Attraction Launch',
    challenge: 'Launching 5 new themed attractions simultaneously with 200+ cast members and complex technical requirements',
    solution: 'Implemented GHXSTSHIP for coordinated production management across all attractions',
    results: [
      '100% on-time attraction openings',
      '95% guest satisfaction scores',
      '40% reduction in production delays',
      '$2M+ in operational savings',
    ],
    testimonial: 'GHXSTSHIP enabled us to orchestrate our most ambitious expansion with precision and creativity.',
    author: 'Maria Santos, Creative Director',
  },
  {
    title: 'Broadway Spectacular Productions',
    project: 'Multi-Show Production Season',
    challenge: 'Managing 3 concurrent Broadway productions with shared resources and overlapping schedules',
    solution: 'Used GHXSTSHIP for integrated production management and resource optimization',
    results: [
      '8 Tony Award nominations',
      '50% improvement in rehearsal efficiency',
      '30% reduction in production costs',
      '98% show completion rate',
    ],
    testimonial: 'The platform transformed how we manage complex theatrical productions. Every show opened flawlessly.',
    author: 'James Mitchell, Executive Producer',
  },
];

const integrations = [
  { name: 'QLab', category: 'Show Control' },
  { name: 'Vectorworks', category: 'Design' },
  { name: 'AutoCAD', category: 'Technical Drawing' },
  { name: 'Costume Pro', category: 'Wardrobe' },
  { name: 'StageWrite', category: 'Scheduling' },
  { name: 'WYSIWYG', category: 'Lighting Design' },
  { name: 'Avid Pro Tools', category: 'Audio' },
  { name: 'Unity', category: 'Interactive Media' },
];

export default function ThemedTheatricalPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-purple-500/5 via-background to-pink-500/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Themed & Theatrical Entertainment
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  CREATE
                  <br />
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    SPECTACULAR
                  </span>
                  <br />
                  EXPERIENCES
                </h1>
                <p className="text-xl text-muted-foreground">
                  From Broadway stages to theme park attractions, GHXSTSHIP empowers 
                  entertainment creators to manage complex productions, coordinate 
                  multi-disciplinary teams, and deliver unforgettable experiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>500+</div>
                  <div className="text-sm text-muted-foreground">Productions Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50M+</div>
                  <div className="text-sm text-muted-foreground">Guests Entertained</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>10K+</div>
                  <div className="text-sm text-muted-foreground">Cast & Crew</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>95%</div>
                  <div className="text-sm text-muted-foreground">Guest Satisfaction</div>
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

            {/* Production Dashboard Preview */}
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
                      <Clapperboard className="w-3 h-3" />
                      productions.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>THE ENCHANTED KINGDOM</h3>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      In Production
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Cast</div>
                      <div className="font-semibold">45 Active</div>
                      <div className="flex -space-x-1 mt-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-4 h-4 bg-purple-500 rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Rehearsals</div>
                      <div className="font-semibold">12/15</div>
                      <div className="w-full bg-muted rounded-full h-1 mt-2">
                        <div className="bg-purple-500 h-1 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Production Status</div>
                    {[
                      { department: 'Costumes', status: '95%', color: 'bg-green-500' },
                      { department: 'Set Design', status: '88%', color: 'bg-blue-500' },
                      { department: 'Technical', status: '76%', color: 'bg-yellow-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="font-medium flex-1">{item.department}</span>
                        <span className="text-muted-foreground">{item.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Camera className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium">Next: Tech Rehearsal - Stage B</span>
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
              ENTERTAINMENT PRODUCTION CHALLENGES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Themed and theatrical entertainment requires precise coordination of creative and technical elements.
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
              COMPLETE ENTERTAINMENT PRODUCTION SUITE
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, produce, and manage world-class entertainment experiences.
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
              ENTERTAINMENT SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how leading entertainment companies create magical experiences with GHXSTSHIP.
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
              ENTERTAINMENT INDUSTRY INTEGRATIONS
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with the specialized tools and systems used in entertainment production.
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
              Join leading entertainment companies using GHXSTSHIP to produce 
              spectacular shows and unforgettable themed experiences.
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
