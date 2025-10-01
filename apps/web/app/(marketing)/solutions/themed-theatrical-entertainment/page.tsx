import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Palette, Users, Zap, CheckCircle, Play, Star, Sparkles, Camera } from 'lucide-react';
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
    icon: Sparkles,
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
      <section className="py-mdxl bg-gradient-to-br from-secondary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-xsxl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Themed & Theatrical Entertainment
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  CREATE
                  <br />
                  <span className="text-gradient-accent">
                    SPECTACULAR
                  </span>
                  <br />
                  EXPERIENCES
                </h1>
                <p className="text-heading-4 color-muted">
                  From Broadway stages to theme park attractions, GHXSTSHIP empowers 
                  entertainment creators to manage complex productions, coordinate 
                  multi-disciplinary teams, and deliver unforgettable experiences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>500+</div>
                  <div className="text-body-sm color-muted">Productions Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>50M+</div>
                  <div className="text-body-sm color-muted">Guests Entertained</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>10K+</div>
                  <div className="text-body-sm color-muted">Cast & Crew</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>95%</div>
                  <div className="text-body-sm color-muted">Guest Satisfaction</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Creating
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-sm h-icon-xs w-icon-xs" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Production Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-popover overflow-hidden">
                <div className="flex items-center gap-sm px-md py-sm bg-secondary/50 border-b">
                  <div className="flex gap-sm">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-sm  px-md py-xs bg-background rounded-md text-body-sm color-muted">
                      <Sparkles className="w-3 h-3" />
                      productions.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>THE ENCHANTED KINGDOM</h3>
                    <Badge variant="outline" className="color-success border-success">
                      In Production
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Cast</div>
                      <div>45 Active</div>
                      <div className="flex -cluster-xs mt-sm">
                        {[1, 2, 3, 4].map((i: any) => (
                          <div key={i} className="w-icon-xs h-icon-xs bg-secondary rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Rehearsals</div>
                      <div>12/15</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-secondary h-1 rounded-full w-icon-xs/5"></div>
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Production Status</div>
                    {[
                      { department: 'Costumes', status: '95%', color: 'bg-success' },
                      { department: 'Set Design', status: '88%', color: 'bg-accent' },
                      { department: 'Technical', status: '76%', color: 'bg-warning' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.department}</span>
                        <span className="color-muted">{item.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Camera className="w-icon-xs h-icon-xs color-secondary" />
                    <span className="text-body-sm form-label">Next: Tech Rehearsal - Stage B</span>
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
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              ENTERTAINMENT PRODUCTION CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Themed and theatrical entertainment requires precise coordination of creative and technical elements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge: any) => {
              const Icon = Sparkles;
              return (
                <Card key={challenge.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg bg-gradient-to-r from-secondary to-accent">
                        <Icon className="h-icon-md w-icon-md text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-sm uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-md">{challenge.description}</p>
                        <div className="flex items-start gap-sm">
                          <CheckCircle className="h-icon-xs w-icon-xs color-success flex-shrink-0 mt-0.5" />
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
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              COMPLETE ENTERTAINMENT PRODUCTION SUITE
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create, produce, and manage world-class entertainment experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {features.map((feature: any) => (
              <Card key={feature.title} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-xl">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-md uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-lg">{feature.description}</p>
                  
                  <div className="stack-sm">
                    {feature.benefits.map((benefit: any) => (
                      <div key={benefit} className="flex items-center gap-sm">
                        <CheckCircle className="h-icon-xs w-icon-xs color-success flex-shrink-0" />
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
      <section className="py-mdxl">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              ENTERTAINMENT SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how leading entertainment companies create magical experiences with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-xsxl">
            {caseStudies.map((study: any) => (
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
                        {study.results.map((result: any) => (
                          <div key={result} className="flex items-center gap-sm">
                            <Star className="h-icon-xs w-icon-xs color-warning flex-shrink-0" />
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
      <section className="py-mdxl bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              ENTERTAINMENT INDUSTRY INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with the specialized tools and systems used in entertainment production.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration: any) => (
              <Card key={integration.name} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-icon-2xl h-icon-2xl bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-md">
                    <Zap className="h-icon-md w-icon-md text-background" />
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
      <section className="py-mdxl bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              READY TO CREATE MAGIC?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join leading entertainment companies using GHXSTSHIP to produce 
              spectacular shows and unforgettable themed experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Creating
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full sm:w-auto">
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
