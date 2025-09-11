import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, Shield, Zap, ExternalLink, MessageSquare, Lightbulb } from 'lucide-react';
import { typography } from '../../lib/typography';

export const metadata: Metadata = {
  title: 'Coming Soon | GHXSTSHIP Products',
  description: 'Get a sneak peek at the next generation of GHXSTSHIP products launching in 2026. OPVS Talent Management and MVNIFEST Access & Asset Control.',
  openGraph: {
    title: 'Coming Soon | GHXSTSHIP Products',
    description: 'Get a sneak peek at the next generation of GHXSTSHIP products launching in 2026.',
    url: 'https://ghxstship.com/products/coming-soon',
  },
};

const upcomingProducts = [
  {
    id: 'opvs',
    name: 'OPVS',
    subtitle: 'Talent Management',
    description: 'Revolutionary talent management platform that connects production teams with verified professionals worldwide.',
    launchDate: 'Q2 2026',
    status: 'In Development',
    category: 'Talent & Workforce',
    features: [
      'Global talent directory with skill verification',
      'AI-powered crew matching and recommendations',
      'Integrated scheduling and availability management',
      'Performance tracking and rating system',
      'Automated contract and payment processing',
      'Real-time communication and collaboration tools',
    ],
    benefits: [
      'Reduce hiring time by 70%',
      'Access to 50K+ verified professionals',
      'Streamlined onboarding process',
      'Enhanced team performance tracking',
    ],
    targetUsers: ['Production Managers', 'Talent Coordinators', 'HR Teams', 'Freelance Professionals'],
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'mvnifest',
    name: 'MVNIFEST',
    subtitle: 'Access & Asset Control',
    description: 'Next-generation security and asset management system for high-stakes production environments.',
    launchDate: 'Q4 2026',
    status: 'Early Planning',
    category: 'Security & Assets',
    features: [
      'Biometric access control and monitoring',
      'Real-time asset tracking with IoT integration',
      'Advanced security protocols and compliance',
      'Automated incident reporting and response',
      'Integration with existing security systems',
      'Mobile-first interface for field operations',
    ],
    benefits: [
      'Reduce security incidents by 85%',
      'Real-time asset visibility',
      'Automated compliance reporting',
      'Enhanced operational security',
    ],
    targetUsers: ['Security Managers', 'Asset Controllers', 'Operations Teams', 'Compliance Officers'],
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Coming Soon
            </Badge>
            <h1 className={`mb-6 ${typography.heroTitle}`}>
              THE NEXT GENERATION
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IS COMING IN 2026
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We're building the future of production management with two revolutionary new products 
              that will transform how you manage talent and secure your operations. Get ready for 
              something completely different.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#products">
                <Button variant="outline">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`mb-4 ${typography.sectionTitle}`}>
              2026 PRODUCT ROADMAP
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Q2 2026</h3>
                <p className="text-lg font-semibold text-primary mb-2">OPVS Talent Management</p>
                <p className="text-muted-foreground">Revolutionary talent platform launches</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Q4 2026</h3>
                <p className="text-lg font-semibold text-accent mb-2">MVNIFEST Access & Asset Control</p>
                <p className="text-muted-foreground">Next-gen security platform debuts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Previews */}
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {upcomingProducts.map((product, index) => (
              <div key={product.id} className={`${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex items-center gap-12`}>
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <Card className="hover:shadow-xl transition-all duration-300">
                    <div className={`h-80 bg-gradient-to-br ${product.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="text-center text-white">
                        <div className="text-6xl font-bold mb-4 opacity-90">
                          {product.name}
                        </div>
                        <div className="text-xl opacity-75">
                          {product.subtitle}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/20 text-white border-white/30">
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="md:w-1/2">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge className="bg-gradient-to-r from-warning to-destructive text-white">
                        <Calendar className="h-3 w-3 mr-1" />
                        {product.launchDate}
                      </Badge>
                    </div>
                    <h2 className={`mb-4 ${typography.sectionTitle}`}>
                      {product.name} {product.subtitle}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                      <div className="grid gap-2">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Expected Benefits</h3>
                      <div className="grid gap-2">
                        {product.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                            <span className="text-sm font-semibold text-success">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Target Users</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.targetUsers.map((user) => (
                          <Badge key={user} variant="secondary">
                            {user}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Request Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`mb-6 ${typography.sectionTitle}`}>
              SHAPE THE FUTURE
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Have ideas for features or entirely new products? We're building the future of production 
              management based on real user needs. Your input directly influences our roadmap.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Lightbulb,
                title: 'Submit Ideas',
                description: 'Share your feature requests and product ideas with our development team',
              },
              {
                icon: MessageSquare,
                title: 'Join Discussions',
                description: 'Participate in community discussions about upcoming features and improvements',
              },
              {
                icon: Users,
                title: 'Beta Testing',
                description: 'Get early access to new features and help us test before public release',
              },
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={`mb-3 ${typography.cardTitle}`}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className={`mb-4 ${typography.cardTitle}`}>
                  Feature Request Portal
                </h3>
                <p className="text-muted-foreground mb-6">
                  Submit feature requests, vote on community ideas, and track development progress 
                  on our dedicated feedback platform.
                </p>
                <Link href="https://ghxstship.canny.io" target="_blank" rel="noopener noreferrer">
                  <Button className="group">
                    Open Feature Portal
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  External link to canny.io feedback platform
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <Zap className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className={`mb-6 ${typography.sectionTitle}`}>
                GET EARLY ACCESS
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Be among the first to experience the next generation of production management tools. 
                Early access users get exclusive features, priority support, and special pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Join Early Access Program
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales Team
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Free early access • Priority support • Exclusive features
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
