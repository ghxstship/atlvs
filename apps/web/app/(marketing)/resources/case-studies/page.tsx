import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, TrendingUp, Users, Clock, Star, Building, Film, Music, Megaphone } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Case Studies | GHXSTSHIP Resources',
  description: 'Discover how leading organizations have transformed their operations with GHXSTSHIP. Real-world success stories and measurable results.',
  openGraph: {
    title: 'Case Studies | GHXSTSHIP Resources',
    description: 'Discover how leading organizations have transformed their operations with GHXSTSHIP. Real-world success stories and measurable results.',
    url: 'https://ghxstship.com/resources/case-studies',
  },
};

const featuredCaseStudy = {
  title: 'Global Media Conglomerate Scales Creative Operations 300%',
  company: 'MediaTech International',
  industry: 'Film & TV',
  challenge: 'Managing 200+ simultaneous productions across 15 countries with fragmented workflows',
  solution: 'Implemented GHXSTSHIP enterprise platform for unified project management and global talent coordination',
  results: [
    '300% increase in production capacity',
    '45% reduction in project delivery time',
    '$50M+ annual cost savings',
    '98% client satisfaction rate',
  ],
  testimonial: 'GHXSTSHIP transformed how we manage global productions. We can now handle 3x more projects with the same team size.',
  author: 'Sarah Chen, Global Operations Director',
  readTime: '8 min read',
  featured: true,
};

const caseStudies = [
  {
    title: 'Fortune 500 Advertising Agency Streamlines Campaign Management',
    company: 'Creative Dynamics',
    industry: 'Advertising',
    icon: Megaphone,
    challenge: 'Coordinating 50+ concurrent campaigns across multiple clients and channels',
    results: [
      '60% faster campaign delivery',
      '40% improvement in client satisfaction',
      '200% ROI increase',
    ],
    readTime: '6 min read',
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'Music Festival Producer Manages 150+ Artists Seamlessly',
    company: 'Electric Nights Entertainment',
    industry: 'Music & Events',
    icon: Music,
    challenge: 'Managing complex logistics for multi-stage festivals with international artists',
    results: [
      '99.8% event execution success',
      '40% improvement in artist satisfaction',
      '25% reduction in technical issues',
    ],
    readTime: '7 min read',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Manufacturing Giant Digitizes Global Operations',
    company: 'Industrial Solutions Corp',
    industry: 'Corporate',
    icon: Building,
    challenge: 'Modernizing operations across 50+ facilities in 20 countries',
    results: [
      '45% improvement in project delivery',
      '60% reduction in operational costs',
      '$50M+ efficiency savings annually',
    ],
    readTime: '9 min read',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    title: 'Independent Film Studio Breaks Production Records',
    company: 'Visionary Pictures',
    industry: 'Film & TV',
    icon: Film,
    challenge: 'Producing award-winning content with limited budget and resources',
    results: [
      '50% faster production timeline',
      '30% cost reduction',
      'Grammy nomination achieved',
    ],
    readTime: '5 min read',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Tech Startup Scales Creative Team 500%',
    company: 'InnovateLab',
    industry: 'Technology',
    icon: TrendingUp,
    challenge: 'Rapidly scaling creative operations while maintaining quality standards',
    results: [
      '500% team growth in 12 months',
      '80% improvement in project quality',
      '90% reduction in onboarding time',
    ],
    readTime: '6 min read',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'E-commerce Giant Optimizes Product Photography',
    company: 'ShopSmart Global',
    industry: 'E-commerce',
    icon: Users,
    challenge: 'Managing product photography for 100K+ SKUs across multiple markets',
    results: [
      '70% faster content production',
      '50% cost reduction per asset',
      '95% consistency across markets',
    ],
    readTime: '7 min read',
    color: 'from-green-500 to-emerald-500',
  },
];

const industries = [
  'All Industries',
  'Film & TV',
  'Advertising',
  'Music & Events',
  'Corporate',
  'Technology',
  'E-commerce',
];

const metrics = [
  { label: 'Success Stories', value: '200+' },
  { label: 'Industries Served', value: '25+' },
  { label: 'Average ROI Increase', value: '250%' },
  { label: 'Client Satisfaction', value: '98%' },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Success Stories
            </Badge>
            <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
              PROVEN
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                RESULTS
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover how leading organizations across industries have transformed 
              their operations, improved efficiency, and achieved remarkable growth with GHXSTSHIP.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>
                    {metric.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Study */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>Featured Success Story</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <Badge variant="outline" className="mb-4">
                    {featuredCaseStudy.industry}
                  </Badge>
                  <h3 className={`${anton.className} text-2xl lg:text-3xl font-bold mb-4 uppercase`}>
                    {featuredCaseStudy.title}
                  </h3>
                  <p className="text-lg font-semibold text-muted-foreground mb-6">
                    {featuredCaseStudy.company}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">CHALLENGE</h4>
                      <p className="text-foreground">{featuredCaseStudy.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase">SOLUTION</h4>
                      <p className="text-foreground">{featuredCaseStudy.solution}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-4 uppercase">KEY RESULTS</h4>
                  <div className="space-y-3 mb-6">
                    {featuredCaseStudy.results.map((result) => (
                      <div key={result} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{result}</span>
                      </div>
                    ))}
                  </div>

                  <blockquote className="border-l-4 border-primary pl-4 mb-6">
                    <p className="text-foreground italic mb-2">"{featuredCaseStudy.testimonial}"</p>
                    <cite className="text-sm text-muted-foreground">— {featuredCaseStudy.author}</cite>
                  </blockquote>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredCaseStudy.readTime}
                    </div>
                  </div>

                  <Button className="group">
                    Read Full Case Study
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Industry Filter */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {industries.map((industry) => (
              <Button
                key={industry}
                variant={industry === 'All Industries' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {industry}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className={`${anton.className} text-3xl font-bold mb-6 uppercase`}>More Success Stories</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => {
              const Icon = study.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${study.color} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <Badge variant="outline" className="mb-3 text-xs">
                      {study.industry}
                    </Badge>
                    
                    <h3 className={`${anton.className} text-lg font-bold mb-3 uppercase group-hover:text-primary transition-colors`}>
                      {study.title}
                    </h3>
                    
                    <p className="text-sm font-semibold text-muted-foreground mb-4">
                      {study.company}
                    </p>
                    
                    <p className="text-muted-foreground mb-4 text-sm">
                      {study.challenge}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase">Key Results</h4>
                      {study.results.map((result) => (
                        <div key={result} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-foreground">{result}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {study.readTime}
                      </div>
                      
                      <Button variant="ghost" size="sm" className="p-0 h-auto font-medium group">
                        Read More
                        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Case Studies
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              MEASURABLE IMPACT
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our clients consistently achieve remarkable results across key performance indicators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { metric: '250%', label: 'Average ROI Increase', description: 'Across all client implementations' },
              { metric: '45%', label: 'Faster Project Delivery', description: 'Reduction in time-to-market' },
              { metric: '60%', label: 'Cost Reduction', description: 'In operational expenses' },
              { metric: '98%', label: 'Client Satisfaction', description: 'Would recommend GHXSTSHIP' },
            ].map((stat) => (
              <Card key={stat.metric} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`${anton.className} text-4xl font-bold text-primary mb-2 uppercase`}>
                    {stat.metric}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{stat.label}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              READY TO JOIN THEM?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start your own success story with GHXSTSHIP. See how our platform 
              can transform your operations and drive measurable results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              EXPLORE MORE RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Blog', href: '/resources/blog', description: 'Latest insights and trends' },
              { title: 'Guides', href: '/resources/guides', description: 'Step-by-step tutorials' },
              { title: 'Whitepapers', href: '/resources/whitepapers', description: 'In-depth research' },
            ].map((resource) => (
              <Link key={resource.title} href={resource.href}>
                <Card className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6 text-center">
                    <h3 className={`${anton.className} text-lg font-bold mb-2 uppercase group-hover:text-primary transition-colors`}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
