import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Heart, Globe, Users, Zap, CheckCircle, Play, Star, Calendar, Sparkles } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community & Cultural Events Solutions | GHXSTSHIP',
  description: 'Celebrate community and culture with GHXSTSHIP. Manage festivals, cultural celebrations, community gatherings, and heritage events.',
  openGraph: {
    title: 'Community & Cultural Events Solutions | GHXSTSHIP',
    description: 'Celebrate community and culture with GHXSTSHIP. Manage festivals, cultural celebrations, community gatherings, and heritage events.',
    url: 'https://ghxstship.com/solutions/community-cultural-events',
  },
};

const challenges = [
  {
    icon: Heart,
    title: 'Cultural Sensitivity & Authenticity',
    description: 'Respecting traditions while creating inclusive experiences that honor cultural heritage',
    solution: 'Cultural advisory integration with community stakeholder management and authenticity protocols',
  },
  {
    icon: Globe,
    title: 'Diverse Community Coordination',
    description: 'Bringing together multiple cultural groups, languages, and traditions in harmony',
    solution: 'Multi-cultural coordination tools with translation services and inclusive planning workflows',
  },
  {
    icon: Users,
    title: 'Volunteer & Community Engagement',
    description: 'Mobilizing large volunteer networks and ensuring meaningful community participation',
    solution: 'Volunteer management platform with skill matching and community engagement tracking',
  },
  {
    icon: Calendar,
    title: 'Seasonal & Traditional Timing',
    description: 'Coordinating events around cultural calendars, religious observances, and seasonal celebrations',
    solution: 'Cultural calendar integration with traditional timing considerations and conflict avoidance',
  },
];

const features = [
  {
    title: 'Cultural Festival Management',
    description: 'Comprehensive coordination of cultural festivals, parades, and heritage celebrations',
    benefits: ['Cultural programming', 'Vendor coordination', 'Performance scheduling', 'Heritage displays'],
  },
  {
    title: 'Community Engagement Platform',
    description: 'Tools to involve local communities in planning and executing cultural events',
    benefits: ['Stakeholder involvement', 'Community feedback', 'Local partnerships', 'Volunteer coordination'],
  },
  {
    title: 'Multicultural Event Support',
    description: 'Specialized tools for managing diverse cultural requirements and traditions',
    benefits: ['Cultural protocols', 'Language support', 'Religious considerations', 'Dietary accommodations'],
  },
  {
    title: 'Impact & Legacy Tracking',
    description: 'Measure community impact and preserve cultural heritage through events',
    benefits: ['Community metrics', 'Cultural preservation', 'Legacy documentation', 'Impact reporting'],
  },
];

const caseStudies = [
  {
    title: 'International Heritage Festival',
    project: 'Multi-Cultural Community Celebration',
    challenge: 'Coordinating 25+ cultural groups for a 3-day festival with 100,000+ attendees and authentic cultural programming',
    solution: 'Implemented GHXSTSHIP for cultural coordination with community stakeholder management and volunteer platform',
    results: [
      '100% cultural group participation',
      '95% community satisfaction rating',
      '50% increase in cultural awareness',
      '200+ new community partnerships formed',
    ],
    testimonial: 'GHXSTSHIP helped us create the most inclusive and authentic cultural celebration our city has ever seen.',
    author: 'Elena Vasquez, Cultural Events Director',
  },
  {
    title: 'Annual Harvest Festival',
    project: 'Traditional Agricultural Celebration',
    challenge: 'Preserving century-old traditions while engaging modern audiences across 5,000+ rural community members',
    solution: 'Used GHXSTSHIP for tradition preservation workflows with modern engagement tools and volunteer coordination',
    results: [
      '300% increase in youth participation',
      '100% tradition authenticity maintained',
      '80% improvement in volunteer coordination',
      '$500K+ economic impact for local community',
    ],
    testimonial: 'The platform allowed us to honor our heritage while creating new traditions for future generations.',
    author: 'Robert Thompson, Community Leader',
  },
];

const integrations = [
  { name: 'Cultural Centers', category: 'Community' },
  { name: 'Local Government', category: 'Municipal' },
  { name: 'Heritage Organizations', category: 'Cultural' },
  { name: 'Volunteer Networks', category: 'Community' },
  { name: 'Translation Services', category: 'Language' },
  { name: 'Local Media', category: 'Communications' },
  { name: 'Community Sponsors', category: 'Funding' },
  { name: 'Cultural Performers', category: 'Entertainment' },
];

export default function CommunityCulturalEventsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-warning/5 via-background to-destructive/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Community & Cultural Events
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-6 uppercase`}>
                  CELEBRATE
                  <br />
                  <span className="bg-gradient-to-r from-warning to-destructive bg-clip-text text-transparent">
                    COMMUNITY
                  </span>
                  <br />
                  CULTURE
                </h1>
                <p className="text-heading-4 color-muted">
                  From vibrant cultural festivals to intimate community gatherings, GHXSTSHIP 
                  empowers organizers to create authentic celebrations that honor heritage, 
                  build connections, and strengthen community bonds.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>2M+</div>
                  <div className="text-body-sm color-muted">Community Members</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>5,000+</div>
                  <div className="text-body-sm color-muted">Cultural Events</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>150+</div>
                  <div className="text-body-sm color-muted">Cultural Traditions</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 text-heading-3 color-foreground mb-2 uppercase`}>98%</div>
                  <div className="text-body-sm color-muted">Cultural Authenticity</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Start Celebrating
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Traditions
                </Button>
              </div>
            </div>

            {/* Cultural Dashboard Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-body-sm color-muted">
                      <Sparkles className="w-3 h-3" />
                      cultural.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-body text-heading-3 uppercase`}>HERITAGE FESTIVAL 2024</h3>
                    <Badge variant="outline" className="color-warning border-warning">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Communities</div>
                      <div className="text-heading-4">25</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-body-sm color-warning">United</span>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Volunteers</div>
                      <div className="text-heading-4">450</div>
                      <div className="flex -space-x-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-3 h-3 bg-warning rounded-full border border-background"></div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-body-sm color-muted mb-1">Traditions</div>
                      <div className="text-heading-4">100%</div>
                      <div className="w-full bg-secondary rounded-full h-1 mt-2">
                        <div className="bg-success h-1 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-body-sm form-label color-muted">Cultural Programming</div>
                    {[
                      { program: 'Traditional Dance', participants: 120, stage: 'Main', color: 'bg-destructive' },
                      { program: 'Heritage Crafts', participants: 85, stage: 'Pavilion', color: 'bg-primary' },
                      { program: 'Cultural Food Fair', participants: 300, stage: 'Plaza', color: 'bg-success' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-body-sm">
                        <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                        <span className="form-label flex-1">{item.program}</span>
                        <span className="color-muted">{item.stage}</span>
                        <span className="color-muted">({item.participants})</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Heart className="w-4 h-4 color-warning" />
                    <span className="text-body-sm form-label">Community Unity Score: 9.8/10</span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
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
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              CULTURAL EVENT CHALLENGES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Community and cultural events require deep understanding of traditions and inclusive coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge) => {
              const Icon = challenge.icon;
              return (
                <Card key={challenge.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-warning to-destructive">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-3 uppercase`}>{challenge.title}</h3>
                        <p className="color-muted mb-4">{challenge.description}</p>
                        <div className="flex items-start gap-2">
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
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              CULTURAL CELEBRATION PLATFORM
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Everything you need to create authentic cultural events that honor traditions and build community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-4 uppercase`}>{feature.title}</h3>
                  <p className="color-muted mb-6">{feature.description}</p>
                  
                  <div className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              CULTURAL CELEBRATION STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how communities are preserving heritage and building connections with GHXSTSHIP.
            </p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study) => (
              <Card key={study.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <Badge variant="outline" className="mb-4">{study.project}</Badge>
                      <h3 className={`${anton.className} text-heading-3 text-heading-3 mb-4 uppercase`}>{study.title}</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">CHALLENGE</h4>
                          <p className="color-foreground">{study.challenge}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-heading-4 text-body-sm color-muted mb-2 uppercase">SOLUTION</h4>
                          <p className="color-foreground">{study.solution}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-heading-4 text-body-sm color-muted mb-4 uppercase">RESULTS</h4>
                      <div className="space-y-3 mb-6">
                        {study.results.map((result) => (
                          <div key={result} className="flex items-center gap-2">
                            <Star className="h-4 w-4 color-warning flex-shrink-0" />
                            <span className="text-body-sm form-label color-foreground">{result}</span>
                          </div>
                        ))}
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4">
                        <p className="color-foreground italic mb-2">"{study.testimonial}"</p>
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
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              COMMUNITY NETWORK CONNECTIONS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Connect with cultural organizations, community groups, and heritage preservation networks.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-warning to-destructive rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-heading-4 color-foreground mb-1">{integration.name}</h3>
                  <p className="text-body-sm color-muted">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-warning/5 to-destructive/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              READY TO UNITE COMMUNITIES?
            </h2>
            <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
              Join community leaders using GHXSTSHIP to create authentic cultural celebrations 
              that honor heritage, preserve traditions, and strengthen community bonds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Start Celebrating
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
