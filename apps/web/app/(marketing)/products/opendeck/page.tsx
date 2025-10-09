import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Award, Briefcase, CheckCircle, Filter, Globe, Play, Search, ShoppingBag, Star, Users, Zap } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { MarketingSection } from '../../../_components/marketing';
import { OctopusDoodle } from '../../../_components/marketing/OctopusDoodle';

export const metadata: Metadata = {
  title: 'OPENDECK - Find Talent That Actually Shows Up | GHXSTSHIP',
  description: 'Stop getting ghosted by freelancers. OPENDECK connects you with verified crew and vendors who actually answer their phones and show up on time.',
  openGraph: {
    title: 'OPENDECK - Find Talent That Actually Shows Up | GHXSTSHIP',
    description: 'Stop getting ghosted by freelancers. OPENDECK connects you with verified crew and vendors who actually answer their phones.',
    url: 'https://ghxstship.com/products/opendeck'
  }
};

const features = [
  {
    icon: ShoppingBag,
    title: 'Talent That Shows Up',
    description: 'Find verified crew who actually answer their phones and show up when they say they will. No more last-minute "sorry, can\'t make it" texts.',
    benefits: ['Background verified', 'Real portfolio reviews', 'Actual skill tests', 'Honest rating system']
  },
  {
    icon: Briefcase,
    title: 'Assets That Work',
    description: 'Pre-made templates and assets that don\'t look like they were designed in 2003. Curated by people who actually use this stuff.',
    benefits: ['Actually good templates', 'Usable stock assets', 'Real-world tutorials', 'Tools that don\'t suck']
  },
  {
    icon: Globe,
    title: 'Worldwide Talent Pool',
    description: 'Access crew and vendors across 50+ countries. Perfect for when your local options are booked or overpriced.',
    benefits: ['50+ countries covered', 'Multi-language support', 'Local market knowledge', 'Time zone flexibility']
  },
  {
    icon: Zap,
    title: 'Smart Matching',
    description: 'AI that actually helps match you with people who fit your budget, timeline, and won\'t drive you crazy.',
    benefits: ['Budget-aware matching', 'Skill compatibility', 'Real availability', 'Personality fit']
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Powerful search and filtering tools to find exactly what you need, when you need it.',
    benefits: ['Smart filters', 'Saved searches', 'Real-time results', 'Custom criteria']
  },
  {
    icon: Star,
    title: 'Actually Vetted Talent',
    description: 'We check portfolios, references, and backgrounds so you don\'t have to. No more hiring disasters.',
    benefits: ['Real background checks', 'Portfolio verification', 'Honest client reviews', 'Reliability scores']
  },
  {
    icon: Award,
    title: 'Reputation That Matters',
    description: 'Build your rep with real projects and honest feedback. No fake reviews or inflated ratings.',
    benefits: ['Earned achievements', 'Real reputation scores', 'Featured work', 'Verified success stories']
  },
  {
    icon: Filter,
    title: 'Recommendations That Help',
    description: 'Get suggestions based on what you actually need, not what someone\'s trying to sell you.',
    benefits: ['Relevant recommendations', 'Actually trending content', 'Useful collections', 'Smart suggestions']
  },
];

const categories = [
  {
    title: 'Verified Professionals',
    count: '25K+',
    description: 'Crew who actually know what they\'re doing and show up on time',
    examples: ['Film Directors', 'Graphic Designers', 'Copywriters', 'Photographers', 'Animators']
  },
  {
    title: 'Useful Resources',
    count: '100K+',
    description: 'Templates and assets that don\'t look like everyone else\'s',
    examples: ['Design Templates', 'Stock Photos', 'Video Assets', 'Audio Libraries', 'Tutorials']
  },
  {
    title: 'Real Opportunities',
    count: '50K+',
    description: 'Actual paying gigs, not \'exposure\' opportunities',
    examples: ['Film Projects', 'Brand Campaigns', 'Web Design', 'Content Creation', 'Events']
  },
];

const testimonials = [
  {
    quote: "Finally, freelancers who actually show up and do what they say they'll do. OPENDECK saved our last three productions from disaster.",
    author: "Marcus Rodriguez",
    role: "Creative Director, Apex Advertising",
    project: "Global Brand Campaign",
    rating: 5
  },
  {
    quote: "No more getting ghosted by crew or dealing with flaky vendors. OPENDECK's vetting process actually works.",
    author: "Lisa Thompson",
    role: "Executive Producer, Pinnacle Media",
    project: "Documentary Series",
    rating: 5
  },
];

const successStories = [
  {
    title: 'Apex Advertising',
    challenge: 'Finding specialized creative talent for global campaigns',
    solution: 'Used OPENDECK to connect with verified professionals worldwide',
    result: '90% reduction in hiring time, 300% ROI increase',
    industry: 'Advertising'
  },
  {
    title: 'Meridian Studios',
    challenge: 'Scaling creative team for multiple concurrent projects',
    solution: 'Leveraged OPENDECK marketplace for on-demand talent',
    result: '50% faster project delivery, 40% cost savings',
    industry: 'Film & TV'
  },
  {
    title: 'Harmony Events',
    challenge: 'Finding local creative talent for international events',
    solution: 'Connected with local professionals through OPENDECK network',
    result: '99.8% event success rate, 60% cost reduction',
    industry: 'Events'
  },
];

export default function OPENDECKPage() {
  return (
    <div className="min-h-screen brand-opendeck">
      {/* Hero Section */}
      <MarketingSection className=" bg-gradient-to-br from-secondary/5 via-background to-primary/5" padding="lg">
        <div className="container mx-auto px-md">
          <div className="grid lg:grid-cols-2 gap-xsxl items-center">
            <div className="stack-xl">
              <div>
                <Badge variant="outline" className="mb-md">
                  Creative Marketplace
                </Badge>
                <h1 className={`${anton.className} text-heading-1 lg:text-display mb-lg uppercase`}>
                  <span className="text-gradient-accent">
                    OPENDECK
                  </span>
                  <br />
                  TALENT THAT
                  <br />
                  DOESN'T GHOST YOU
                </h1>
                <p className="text-heading-4 color-muted">
                  Find verified crew and vendors who actually show up, answer their phones, 
                  and deliver what they promise. No more production nightmares.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 color-foreground mb-sm uppercase`}>25K+</div>
                  <div className="text-body-sm color-muted">Active Creators</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 color-foreground mb-sm uppercase`}>50K+</div>
                  <div className="text-body-sm color-muted">Projects Listed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 color-foreground mb-sm uppercase`}>94%</div>
                  <div className="text-body-sm color-muted">Success Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-heading-2 color-foreground mb-sm uppercase`}>50+</div>
                  <div className="text-body-sm color-muted">Countries</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-md">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Join OPENDECK
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-sm h-icon-xs w-icon-xs" />
                  Explore Marketplace
                </Button>
              </div>
            </div>

            {/* Octopus Doodle Animation */}
            <div className="relative">
              <OctopusDoodle variant="marketplace" className="w-full h-full" />
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Categories Section */}
      <MarketingSection  padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              DISCOVER EVERYTHING CREATIVE
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              From world-class talent to premium resources, OPENDECK connects you with 
              everything you need to bring your creative vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl mb-3xl">
            {categories.map((category: any) => (
              <Card key={category.title} className="hover:shadow-elevation-3 transition-shadow">
                <CardContent className="p-xl text-center">
                  <div className={`${anton.className} text-heading-1 color-secondary mb-md uppercase`}>
                    {category.count}
                  </div>
                  <h3 className={`${anton.className} text-heading-3 mb-md uppercase`}>{category.title}</h3>
                  <p className="color-muted mb-lg">{category.description}</p>
                  
                  <div className="stack-sm">
                    {category.examples.map((example: any) => (
                      <div key={example} className="flex items-center justify-center gap-sm">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="text-body-sm color-muted">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MarketingSection>

      {/* Features Section */}
      <MarketingSection className=" bg-secondary/20" padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              POWERFUL MARKETPLACE FEATURES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Advanced tools and features designed to help you find, connect, and collaborate 
              with the best creative talent and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {features.map((feature: any) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-elevation-3 transition-shadow">
                  <CardContent className="p-lg">
                    <div className="inline-flex items-center justify-center w-icon-2xl h-icon-2xl rounded-lg bg-gradient-to-r from-secondary to-primary mb-md">
                      <Icon className="h-icon-md w-icon-md text-background" />
                    </div>
                    <h3 className="text-heading-4 color-foreground mb-sm">{feature.title}</h3>
                    <p className="text-body-sm color-muted mb-md">{feature.description}</p>
                    <div className="stack-sm gap-xs">
                      {feature.benefits.map((benefit: any) => (
                        <div key={benefit} className="flex items-center gap-sm">
                          <CheckCircle className="h-3 w-3 color-success flex-shrink-0" />
                          <span className="text-body-sm color-muted">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </MarketingSection>

      {/* Success Stories Section */}
      <MarketingSection  padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how leading companies have transformed their creative workflows with OPENDECK.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-xl mb-3xl">
            {successStories.map((story: any) => (
              <Card key={story.title} className="hover:shadow-elevation-3 transition-shadow">
                <CardContent className="p-xl">
                  <Badge variant="outline" className="mb-md">{story.industry}</Badge>
                  <h3 className={`${anton.className} text-heading-3 mb-md uppercase`}>{story.title}</h3>
                  
                  <div className="stack-md">
                    <div>
                      <h4 className="text-body-sm color-muted mb-sm">CHALLENGE</h4>
                      <p className="text-body-sm color-foreground">{story.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-body-sm color-muted mb-sm">SOLUTION</h4>
                      <p className="text-body-sm color-foreground">{story.solution}</p>
                    </div>
                    
                    <div className="pt-md border-t">
                      <h4 className="text-body-sm color-muted mb-sm">RESULT</h4>
                      <p className="text-heading-4 color-secondary">{story.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-2 gap-xl max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-elevation-3 transition-shadow">
                <CardContent className="p-xl">
                  <div className="flex items-center gap-xs mb-md">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-icon-xs w-icon-xs fill-warning color-warning" />
                    ))}
                  </div>
                  <blockquote className="text-body color-foreground mb-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-md">
                    <div className="w-icon-2xl h-icon-2xl bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                      <span className="text-background text-heading-4 text-body-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-heading-4 color-foreground">{testimonial.author}</div>
                      <div className="text-body-sm color-muted">{testimonial.role}</div>
                      <div className="text-body-sm color-muted">Project: {testimonial.project}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MarketingSection>

      {/* CTA Section */}
      <MarketingSection className=" bg-gradient-to-r from-secondary/5 to-primary/5" padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-lg uppercase`}>
              JOIN THE CREATIVE REVOLUTION
            </h2>
            <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
              Connect with 25,000+ creative professionals and discover unlimited opportunities 
              in the world's largest creative marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center mb-xl">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Join OPENDECK
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-lg text-body-sm color-muted">
              <div className="flex items-center gap-sm">
                <CheckCircle className="h-icon-xs w-icon-xs color-success" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-sm">
                <Users className="h-icon-xs w-icon-xs color-secondary" />
                <span>25K+ professionals</span>
              </div>
              <div className="flex items-center gap-sm">
                <Globe className="h-icon-xs w-icon-xs text-foreground" />
                <span>Global network</span>
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>
    </div>
  );
}
