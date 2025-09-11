import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, ShoppingBag, Briefcase, Globe, Zap, CheckCircle, Play, Users, Star, Award, Search, Filter } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'OPENDECK - Find Talent That Actually Shows Up | GHXSTSHIP',
  description: 'Stop getting ghosted by freelancers. OPENDECK connects you with verified crew and vendors who actually answer their phones and show up on time.',
  openGraph: {
    title: 'OPENDECK - Find Talent That Actually Shows Up | GHXSTSHIP',
    description: 'Stop getting ghosted by freelancers. OPENDECK connects you with verified crew and vendors who actually answer their phones.',
    url: 'https://ghxstship.com/products/opendeck',
  },
};

const features = [
  {
    icon: ShoppingBag,
    title: 'Talent That Shows Up',
    description: 'Find verified crew who actually answer their phones and show up when they say they will. No more last-minute "sorry, can\'t make it" texts.',
    benefits: ['Background verified', 'Real portfolio reviews', 'Actual skill tests', 'Honest rating system'],
  },
  {
    icon: Briefcase,
    title: 'Assets That Work',
    description: 'Pre-made templates and assets that don\'t look like they were designed in 2003. Curated by people who actually use this stuff.',
    benefits: ['Actually good templates', 'Usable stock assets', 'Real-world tutorials', 'Tools that don\'t suck'],
  },
  {
    icon: Globe,
    title: 'Worldwide Talent Pool',
    description: 'Access crew and vendors across 50+ countries. Perfect for when your local options are booked or overpriced.',
    benefits: ['50+ countries covered', 'Multi-language support', 'Local market knowledge', 'Time zone flexibility'],
  },
  {
    icon: Zap,
    title: 'Smart Matching',
    description: 'AI that actually helps match you with people who fit your budget, timeline, and won\'t drive you crazy.',
    benefits: ['Budget-aware matching', 'Skill compatibility', 'Real availability', 'Personality fit'],
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Powerful search and filtering tools to find exactly what you need, when you need it.',
    benefits: ['Smart filters', 'Saved searches', 'Real-time results', 'Custom criteria'],
  },
  {
    icon: Star,
    title: 'Actually Vetted Talent',
    description: 'We check portfolios, references, and backgrounds so you don\'t have to. No more hiring disasters.',
    benefits: ['Real background checks', 'Portfolio verification', 'Honest client reviews', 'Reliability scores'],
  },
  {
    icon: Award,
    title: 'Reputation That Matters',
    description: 'Build your rep with real projects and honest feedback. No fake reviews or inflated ratings.',
    benefits: ['Earned achievements', 'Real reputation scores', 'Featured work', 'Verified success stories'],
  },
  {
    icon: Filter,
    title: 'Recommendations That Help',
    description: 'Get suggestions based on what you actually need, not what someone\'s trying to sell you.',
    benefits: ['Relevant recommendations', 'Actually trending content', 'Useful collections', 'Smart suggestions'],
  },
];

const categories = [
  {
    title: 'Verified Professionals',
    count: '25K+',
    description: 'Crew who actually know what they\'re doing and show up on time',
    examples: ['Film Directors', 'Graphic Designers', 'Copywriters', 'Photographers', 'Animators'],
  },
  {
    title: 'Useful Resources',
    count: '100K+',
    description: 'Templates and assets that don\'t look like everyone else\'s',
    examples: ['Design Templates', 'Stock Photos', 'Video Assets', 'Audio Libraries', 'Tutorials'],
  },
  {
    title: 'Real Opportunities',
    count: '50K+',
    description: 'Actual paying gigs, not \'exposure\' opportunities',
    examples: ['Film Projects', 'Brand Campaigns', 'Web Design', 'Content Creation', 'Events'],
  },
];

const testimonials = [
  {
    quote: "Finally, freelancers who actually show up and do what they say they'll do. OPENDECK saved our last three productions from disaster.",
    author: "Marcus Rodriguez",
    role: "Creative Director, Apex Advertising",
    project: "Global Brand Campaign",
    rating: 5,
  },
  {
    quote: "No more getting ghosted by crew or dealing with flaky vendors. OPENDECK's vetting process actually works.",
    author: "Lisa Thompson",
    role: "Executive Producer, Pinnacle Media",
    project: "Documentary Series",
    rating: 5,
  },
];

const successStories = [
  {
    title: 'Apex Advertising',
    challenge: 'Finding specialized creative talent for global campaigns',
    solution: 'Used OPENDECK to connect with verified professionals worldwide',
    result: '90% reduction in hiring time, 300% ROI increase',
    industry: 'Advertising',
  },
  {
    title: 'Meridian Studios',
    challenge: 'Scaling creative team for multiple concurrent projects',
    solution: 'Leveraged OPENDECK marketplace for on-demand talent',
    result: '50% faster project delivery, 40% cost savings',
    industry: 'Film & TV',
  },
  {
    title: 'Harmony Events',
    challenge: 'Finding local creative talent for international events',
    solution: 'Connected with local professionals through OPENDECK network',
    result: '99.8% event success rate, 60% cost reduction',
    industry: 'Events',
  },
];

export default function OPENDECKPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  Creative Marketplace
                </Badge>
                <h1 className={`${anton.className} text-4xl lg:text-6xl font-bold mb-6 uppercase`}>
                  <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    OPENDECK
                  </span>
                  <br />
                  TALENT THAT
                  <br />
                  DOESN'T GHOST YOU
                </h1>
                <p className="text-xl text-muted-foreground">
                  Find verified crew and vendors who actually show up, answer their phones, 
                  and deliver what they promise. No more production nightmares.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>25K+</div>
                  <div className="text-sm text-muted-foreground">Active Creators</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50K+</div>
                  <div className="text-sm text-muted-foreground">Projects Listed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>94%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className={`${anton.className} text-3xl font-bold text-foreground mb-2 uppercase`}>50+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button className="w-full sm:w-auto group">
                    Join OPENDECK
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto group">
                  <Play className="mr-2 h-4 w-4" />
                  Explore Marketplace
                </Button>
              </div>
            </div>

            {/* Marketplace Preview */}
            <div className="relative">
              <Card className="bg-background border shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive"></div>
                    <div className="w-3 h-3 rounded-full bg-warning"></div>
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-background rounded-md text-xs text-muted-foreground">
                      <div className="w-3 h-3 text-success">🔒</div>
                      opendeck.ghxstship.com
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${anton.className} text-lg font-bold uppercase`}>FEATURED TALENT</h3>
                    <Badge variant="outline" className="text-secondary border-secondary">
                      Trending
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Captain Blackwater', role: 'Film Director', rating: 4.9, projects: 127, location: 'Los Angeles, CA' },
                      { name: 'Maya Chen', role: 'Creative Director', rating: 4.8, projects: 89, location: 'New York, NY' },
                      { name: 'Alex Rivera', role: 'Motion Designer', rating: 5.0, projects: 156, location: 'London, UK' },
                    ].map((talent, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {talent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{talent.name}</div>
                          <div className="text-xs text-muted-foreground">{talent.role}</div>
                          <div className="text-xs text-muted-foreground">{talent.location}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-xs font-semibold">{talent.rating}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{talent.projects} projects</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>25,847 active creators</span>
                      <span>Updated 2 min ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              DISCOVER EVERYTHING CREATIVE
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              From world-class talent to premium resources, OPENDECK connects you with 
              everything you need to bring your creative vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {categories.map((category) => (
              <Card key={category.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className={`${anton.className} text-4xl font-bold text-secondary mb-4 uppercase`}>
                    {category.count}
                  </div>
                  <h3 className={`${anton.className} text-xl font-bold mb-4 uppercase`}>{category.title}</h3>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  
                  <div className="space-y-2">
                    {category.examples.map((example) => (
                      <div key={example} className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="text-sm text-muted-foreground">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              POWERFUL MARKETPLACE FEATURES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Advanced tools and features designed to help you find, connect, and collaborate 
              with the best creative talent and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-secondary to-primary mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    <div className="space-y-1">
                      {feature.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              SUCCESS STORIES
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how leading companies have transformed their creative workflows with OPENDECK.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {successStories.map((story) => (
              <Card key={story.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <Badge variant="outline" className="mb-4">{story.industry}</Badge>
                  <h3 className={`${anton.className} text-xl font-bold mb-4 uppercase`}>{story.title}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">CHALLENGE</h4>
                      <p className="text-sm text-foreground">{story.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">SOLUTION</h4>
                      <p className="text-sm text-foreground">{story.solution}</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">RESULT</h4>
                      <p className="font-semibold text-secondary">{story.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground">Project: {testimonial.project}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className={`${anton.className} text-3xl lg:text-4xl font-bold mb-6 uppercase`}>
              JOIN THE CREATIVE REVOLUTION
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with 25,000+ creative professionals and discover unlimited opportunities 
              in the world's largest creative marketplace.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button className="w-full sm:w-auto group">
                  Join OPENDECK
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-secondary" />
                <span>25K+ professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>Global network</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
