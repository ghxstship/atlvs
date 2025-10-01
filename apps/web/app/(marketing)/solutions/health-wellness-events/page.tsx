import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Heart, Shield, Users, Zap, CheckCircle, Play, Star, Activity, Leaf } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Health & Wellness Events Solutions | GHXSTSHIP',
  description: 'Organize transformative health and wellness events with GHXSTSHIP. Manage retreats, workshops, conferences, and wellness programs.',
  openGraph: {
    title: 'Health & Wellness Events Solutions | GHXSTSHIP',
    description: 'Organize transformative health and wellness events with GHXSTSHIP. Manage retreats, workshops, conferences, and wellness programs.',
    url: 'https://ghxstship.com/solutions/health-wellness-events',
  },
};

const challenges = [
  {
    icon: Heart,
    title: 'Holistic Experience Design',
    description: 'Creating events that address physical, mental, and emotional well-being comprehensively',
    solution: 'Integrated wellness program management with multi-dimensional health tracking and outcomes',
  },
  {
    icon: Shield,
    title: 'Health & Safety Compliance',
    description: 'Meeting strict health regulations, insurance requirements, and safety protocols',
    solution: 'Automated compliance tracking with certification management and risk assessment tools',
  },
  {
    icon: Users,
    title: 'Diverse Participant Needs',
    description: 'Accommodating varying fitness levels, dietary restrictions, and accessibility requirements',
    solution: 'Personalized participant profiling with adaptive program recommendations and modifications',
  },
  {
    icon: Activity,
    title: 'Outcome Measurement',
    description: 'Tracking and demonstrating measurable wellness improvements and program effectiveness',
    solution: 'Comprehensive wellness analytics with pre/post assessments and long-term tracking',
  },
];

const features = [
  {
    title: 'Wellness Program Management',
    description: 'End-to-end coordination of retreats, workshops, and wellness conferences',
    benefits: ['Program scheduling', 'Instructor coordination', 'Venue management', 'Equipment tracking'],
  },
  {
    title: 'Participant Health Profiles',
    description: 'Secure management of health information, preferences, and progress tracking',
    benefits: ['Health assessments', 'Dietary tracking', 'Fitness monitoring', 'Goal setting'],
  },
  {
    title: 'Practitioner Network',
    description: 'Connect with certified wellness professionals and healthcare providers',
    benefits: ['Expert matching', 'Credential verification', 'Availability scheduling', 'Performance tracking'],
  },
  {
    title: 'Wellness Analytics',
    description: 'Comprehensive reporting on participant outcomes and program effectiveness',
    benefits: ['Health metrics', 'Engagement tracking', 'ROI analysis', 'Outcome reporting'],
  },
];

const caseStudies = [
  {
    title: 'Mindful Mountains Retreat',
    project: 'Annual Wellness Festival',
    challenge: 'Coordinating 50+ wellness sessions across 3 days for 2,000 participants with diverse health needs',
    solution: 'Implemented GHXSTSHIP for comprehensive participant management and personalized wellness journeys',
    results: [
      '95% participant satisfaction rate',
      '40% improvement in stress reduction',
      '30% increase in healthy habit adoption',
      'Zero health incidents or safety issues',
    ],
    testimonial: 'GHXSTSHIP transformed our retreat from chaotic to seamlessly orchestrated. Participants felt truly cared for.',
    author: 'Sarah Chen, Wellness Director',
  },
  {
    title: 'Corporate Wellness Solutions',
    project: 'Enterprise Health Program',
    challenge: 'Managing wellness programs for 10,000+ employees across 25 office locations globally',
    solution: 'Used GHXSTSHIP for scalable wellness program deployment with local customization and tracking',
    results: [
      '60% employee participation rate',
      '25% reduction in sick days',
      '35% improvement in employee satisfaction',
      '$2.3M savings in healthcare costs',
    ],
    testimonial: 'The platform enabled us to create a truly global wellness culture while maintaining local relevance.',
    author: 'Dr. Michael Torres, Chief Wellness Officer',
  },
];

const integrations = [
  { name: 'Fitbit', category: 'Fitness Tracking' },
  { name: 'MyFitnessPal', category: 'Nutrition' },
  { name: 'Headspace', category: 'Meditation' },
  { name: 'Zoom', category: 'Virtual Sessions' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Calendly', category: 'Scheduling' },
  { name: 'Mailchimp', category: 'Communication' },
  { name: 'Google Health', category: 'Health Data' },
];

export default function HealthWellnessEventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-mdxl bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-xsxl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Health & Wellness Events
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-lg uppercase`}>
                  TRANSFORM
                  <br />
                  <span className="bg-gradient-to-r from-success to-success bg-clip-text text-transparent">
                    LIVES THROUGH
                  </span>
                  <br />
                  WELLNESS
                </h1>
                <p className="text-heading-4 color-muted">
                  Create meaningful health and wellness experiences that inspire lasting 
                  change. From intimate retreats to large-scale wellness conferences, 
                  GHXSTSHIP helps you orchestrate transformative events.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>500K+</div>
                  <div className="text-body-sm color-muted">Lives Transformed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>2,500+</div>
                  <div className="text-body-sm color-muted">Events Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>98%</div>
                  <div className="text-body-sm color-muted">Safety Record</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-sm uppercase`}>85%</div>
                  <div className="text-body-sm color-muted">Goal Achievement</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Healing
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-icon-xs w-icon-xs" />
                  Watch Success Stories
                </Button>
              </div>
            </div>

            {/* Wellness Dashboard Preview */}
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
                      <Heart className="w-3 h-3" />
                      wellness.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-lg stack-md">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>MINDFUL MOUNTAIN RETREAT</h3>
                    <Badge variant="outline" className="color-success border-success">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-sm">
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Participants</div>
                      <div>247</div>
                      <div className="flex items-center gap-xs mt-xs">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-success">Engaged</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Sessions</div>
                      <div>32</div>
                      <div className="flex -cluster-xs mt-xs">
                        {[1, 2, 3, 4].map((i: any) => (
                          <div key={i} className="w-3 h-3 bg-success rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-sm">
                      <div className="text-body-sm color-muted mb-xs">Wellness Score</div>
                      <div>8.7/10</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-sm">
                        <div className="bg-success h-1 rounded-full w-icon-sm/6"></div>
                      </div>
                    </div>
                  </div>

                  <div className="stack-sm">
                    <div className="text-body-sm form-label color-muted">Today's Schedule</div>
                    {[
                      { session: 'Morning Yoga', time: '7:00 AM', participants: 89, color: 'bg-success' },
                      { session: 'Mindful Eating', time: '12:30 PM', participants: 156, color: 'bg-accent' },
                      { session: 'Sound Healing', time: '7:00 PM', participants: 203, color: 'bg-info' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-sm text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.session}</span>
                        <span className="color-muted">{item.time}</span>
                        <span className="color-muted">({item.participants})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-sm pt-sm border-t">
                    <Leaf className="w-icon-xs h-icon-xs color-success" />
                    <span className="text-body-sm form-label">Next: Nutrition Workshop - 2:00 PM</span>
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
              WELLNESS EVENT CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Health and wellness events require specialized care, compliance, and personalized approaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {challenges.map((challenge: any) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-floating transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg bg-gradient-to-r from-success to-success">
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
              COMPREHENSIVE WELLNESS PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create transformative health and wellness experiences.
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
              WELLNESS TRANSFORMATION STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how wellness leaders are creating life-changing experiences with GHXSTSHIP.
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
              WELLNESS ECOSYSTEM INTEGRATIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with leading health and wellness platforms for comprehensive experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            {integrations.map((integration: any) => (
              <Card key={integration.name} className="hover:shadow-floating transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-icon-2xl h-icon-2xl bg-gradient-to-r from-success to-success rounded-lg flex items-center justify-center mx-auto mb-md">
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
              READY TO TRANSFORM LIVES?
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Join wellness leaders using GHXSTSHIP to create meaningful health experiences 
              that inspire lasting positive change in people's lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Healing
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform group-hover:translate-x-1" />
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
