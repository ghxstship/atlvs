import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, TrendingUp, Users, DollarSign, Calendar, Lock, Eye, Award } from 'lucide-react';
import { typography } from '../../lib/typography';

export const metadata: Metadata = {
  title: 'Case Studies | GHXSTSHIP Resources',
  description: 'Real-world success stories and lessons learned from managing large-scale entertainment productions, from EDC festivals to Formula 1 events.',
  openGraph: {
    title: 'Case Studies | GHXSTSHIP Resources',
    description: 'Real-world success stories and lessons learned from managing large-scale entertainment productions.',
    url: 'https://ghxstship.com/resources/case-studies',
  },
};

const caseStudies = [
  {
    id: 'formula-1-las-vegas',
    title: 'Formula 1 Las Vegas Grand Prix: Managing 1,000+ Hospitality Staff',
    excerpt: 'How we achieved zero safety incidents while coordinating premium hospitality operations for a $500M+ inaugural Formula 1 event.',
    industry: 'Sports Entertainment',
    budget: '$500M+',
    teamSize: '1,000+',
    duration: '4 months',
    challenge: 'Managing massive hospitality operations for world-class sports entertainment event',
    results: ['Zero safety incidents', '100% regulatory compliance', 'Flawless VIP experience delivery'],
    isPremium: true,
    featured: true,
  },
  {
    id: 'edc-orlando-operations',
    title: 'EDC Orlando: Streamlining Festival Production for 100K+ Attendees',
    excerpt: 'Optimizing production workflows and team coordination for one of the world\'s largest electronic music festivals.',
    industry: 'Music Festivals',
    budget: '$15M+',
    teamSize: '500+',
    duration: '8 months',
    challenge: 'Coordinating complex multi-stage production with international talent',
    results: ['45% efficiency improvement', 'Zero production delays', '98% attendee satisfaction'],
    isPremium: true,
    featured: true,
  },
  {
    id: 'carnival-casting-revolution',
    title: 'Carnival Cruise Line: Revolutionizing Global Talent Acquisition',
    excerpt: 'Transforming talent casting operations from 6-week manual processes to 5-minute automated workflows.',
    industry: 'Cruise Entertainment',
    budget: '$5M+',
    teamSize: '50+',
    duration: '2 years',
    challenge: 'Scaling talent acquisition across 52 countries with manual processes',
    results: ['6 weeks to 5 minutes workflow', '300% scalability improvement', '40% cost reduction'],
    isPremium: false,
    featured: true,
  },
  {
    id: 'salvage-city-supper-club',
    title: 'Salvage City Supper Club: 24/7 Festival Entertainment Operations',
    excerpt: 'Managing premium dining and entertainment experiences in the world\'s largest electronic music festival environment.',
    industry: 'Festival Hospitality',
    budget: '$2M+',
    teamSize: '100+',
    duration: '6 months',
    challenge: 'Delivering luxury hospitality in high-energy festival environment',
    results: ['24/7 operations success', 'Premium service standards', 'Zero operational failures'],
    isPremium: true,
    featured: false,
  },
  {
    id: 'factory-town-transformation',
    title: 'Factory Town Miami: Venue Operations Optimization',
    excerpt: 'Leading comprehensive venue transformation and entertainment programming for South Florida\'s premier electronic music destination.',
    industry: 'Venue Management',
    budget: '$3M+',
    teamSize: '75+',
    duration: '12 months',
    challenge: 'Optimizing multi-departmental venue operations and entertainment programming',
    results: ['45% efficiency improvement', '50+ successful events', 'Zero safety incidents'],
    isPremium: false,
    featured: false,
  },
  {
    id: 'miami-music-week',
    title: 'Miami Music Week: Multi-Stage Production Coordination',
    excerpt: 'Orchestrating venue transformation and live productions while collaborating with international DJs and artists.',
    industry: 'Music Events',
    budget: '$1.5M+',
    teamSize: '200+',
    duration: '3 months',
    challenge: 'Coordinating multiple simultaneous productions with international talent',
    results: ['Flawless multi-stage execution', 'International artist satisfaction', 'Industry recognition'],
    isPremium: true,
    featured: false,
  },
];

const industries = ['All Industries', 'Sports Entertainment', 'Music Festivals', 'Cruise Entertainment', 'Festival Hospitality', 'Venue Management', 'Music Events'];

export default function CaseStudiesPage() {
  const featuredStudies = caseStudies.filter(study => study.featured);
  const regularStudies = caseStudies.filter(study => !study.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Case Studies
            </Badge>
            <h1 className={`mb-6 ${typography.heroTitle}`}>
              REAL RESULTS FROM
              <br />
              <span className="bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                REAL PRODUCTIONS
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Deep dives into actual productions we've managed - from Formula 1 hospitality 
              to EDC festivals. See the challenges, strategies, and results that prove 
              these methods work when millions of dollars and thousands of people are on the line.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Access Full Case Studies
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#featured">
                <Button variant="outline">
                  View Examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {industries.map((industry) => (
              <Badge 
                key={industry} 
                variant={industry === 'All Industries' ? 'primary' : 'outline'} 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section id="featured" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              FEATURED CASE STUDIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our most impactful and comprehensive production management success stories.
            </p>
          </div>

          <div className="space-y-8">
            {featuredStudies.map((study, index) => (
              <Card key={study.id} className="hover:shadow-lg transition-all duration-300 group overflow-hidden">
                <CardContent className="p-0">
                  <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                    <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                      <div className="h-64 lg:h-full bg-gradient-to-br from-green-500/10 to-blue-500/10 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="h-16 w-16 text-primary mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Case Study Preview</p>
                        </div>
                      </div>
                      {study.isPremium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col justify-center">
                      <Badge variant="outline" className="w-fit mb-4">{study.industry}</Badge>
                      <h3 className={`mb-4 group-hover:text-primary transition-colors ${typography.cardTitle}`}>
                        {study.title}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {study.excerpt}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="font-semibold">{study.budget}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Team:</span>
                          <span className="font-semibold">{study.teamSize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{study.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Results:</span>
                          <span className="font-semibold">{study.results.length} Key Wins</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-foreground mb-2">Key Results:</h4>
                        <ul className="space-y-1">
                          {study.results.slice(0, 2).map((result, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        variant={study.isPremium ? "primary" : "outline"} 
                        className="w-fit group-hover:translate-x-1 transition-transform"
                      >
                        {study.isPremium ? 'Unlock Full Study' : 'Read Case Study'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Case Studies */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              MORE CASE STUDIES
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularStudies.map((study) => (
              <Card key={study.id} className="hover:shadow-lg transition-all duration-300 group">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-green-500/10 to-blue-500/10 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Case Study</p>
                    </div>
                  </div>
                  {study.isPremium && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary">{study.industry}</Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className={`mb-3 group-hover:text-primary transition-colors ${typography.cardTitle}`}>
                    {study.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {study.excerpt}
                  </p>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-semibold">{study.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size:</span>
                      <span className="font-semibold">{study.teamSize}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={study.isPremium ? "primary" : "outline"} 
                    size="sm" 
                    className="w-full group-hover:translate-x-1 transition-transform"
                  >
                    {study.isPremium ? 'Unlock Study' : 'View Study'}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500/5 to-blue-500/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-12">
              <TrendingUp className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className={`mb-6 ${typography.sectionTitle}`}>
                LEARN FROM REAL RESULTS
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get access to detailed breakdowns of actual productions, including budgets, 
                timelines, challenges, and solutions. Learn what works when millions are on the line.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Access All Case Studies
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
