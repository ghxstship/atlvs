import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Calendar, Users, Shield, Zap, ExternalLink, MessageSquare, Lightbulb } from 'lucide-react';
import { anton } from '../../../_components/lib/typography';
import { MarketingSection } from '../../../_components/marketing';

export const metadata: Metadata = {
  title: 'Coming Soon | GHXSTSHIP Products',
  description: 'Get a sneak peek at the next generation of GHXSTSHIP products launching in 2026. GXTEWAY Blockchain Ticketing & Access Control, MVNIFEST Inventory Management, and OPVS Artist & Talent Management.',
  openGraph: {
    title: 'Coming Soon | GHXSTSHIP Products',
    description: 'Get a sneak peek at the next generation of GHXSTSHIP products launching in 2026.',
    url: 'https://ghxstship.com/products/coming-soon',
  },
};

const upcomingProducts = [
  {
    id: 'gxteway',
    name: 'GXTEWAY',
    subtitle: 'Open Source Blockchain Ticketing & Access Control',
    description: 'Revolutionary blockchain-based platform that combines decentralized ticketing with comprehensive access control for secure, transparent event management.',
    launchDate: 'Q1 2026',
    status: 'In Development',
    category: 'Blockchain & Access Control',
    features: [
      'NFT-based ticket ownership and verification',
      'Biometric access control integration',
      'Smart contract automation',
      'Fraud-proof verification system',
      'Real-time access monitoring',
      'Open source community development',
    ],
    benefits: [
      'Eliminate ticket fraud completely',
      'Streamlined access control',
      'Transparent pricing and fees',
      'Enhanced security protocols',
    ],
    targetUsers: ['Event Organizers', 'Venue Owners', 'Security Teams', 'Developers'],
    gradient: 'from-primary to-secondary',
  },
  {
    id: 'mvnifest',
    name: 'MVNIFEST',
    subtitle: 'Inventory Management System',
    description: 'Advanced inventory management platform designed specifically for production environments, providing real-time tracking and automated workflow management.',
    launchDate: 'Q2 2026',
    status: 'In Development',
    category: 'Inventory & Assets',
    features: [
      'Real-time asset tracking with IoT integration',
      'Automated inventory auditing',
      'Predictive maintenance scheduling',
      'Multi-location inventory management',
      'Integration with procurement systems',
      'Mobile-first interface for field operations',
    ],
    benefits: [
      'Reduce inventory losses by 75%',
      'Automated compliance reporting',
      'Streamlined asset utilization',
      'Enhanced operational efficiency',
    ],
    targetUsers: ['Inventory Managers', 'Operations Teams', 'Asset Controllers', 'Production Coordinators'],
    gradient: 'from-secondary to-primary',
  },
  {
    id: 'opvs',
    name: 'OPVS',
    subtitle: 'Artist & Talent Management',
    description: 'Comprehensive artist and talent management platform that revolutionizes how creative professionals manage their careers and connect with opportunities.',
    launchDate: 'Q3 2026',
    status: 'Early Planning',
    category: 'Talent & Artists',
    features: [
      'Artist portfolio and showcase management',
      'Talent booking and scheduling system',
      'Revenue tracking and financial management',
      'Contract and rights management',
      'Collaboration and networking tools',
      'Performance analytics and insights',
    ],
    benefits: [
      'Increase booking opportunities by 80%',
      'Streamlined career management',
      'Enhanced financial tracking',
      'Professional network expansion',
    ],
    targetUsers: ['Artists', 'Talent Managers', 'Booking Agents', 'Creative Professionals'],
    gradient: 'from-primary to-secondary',
  },
];

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <MarketingSection className=" bg-gradient-subtle" padding="lg">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <Badge variant="outline" className="mb-md">
              Coming Soon
            </Badge>
            <h1 className={`mb-lg ${anton.className} text-heading-1 lg:text-display text-heading-3 uppercase`}>
              THE NEXT GENERATION
              <br />
              <span className="text-gradient-accent">
                IS COMING IN 2026
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
              We're building the future of production management with three revolutionary new products 
              that will transform event management, ticketing, and talent coordination. Get ready for 
              something completely different.
            </p>
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/auth/signup">
                <Button className="group">
                  Get Early Access
                  <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
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
      </MarketingSection>

      {/* Timeline */}
      <MarketingSection className="py-smxl border-b" padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-2xl">
            <h2 className={`mb-md ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              2026 PRODUCT ROADMAP
            </h2>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-xl">
              <div className="text-center">
                <div className="w-component-lg h-component-lg bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-md">
                  <Shield className="h-icon-xl w-icon-xl text-background" />
                </div>
                <h3 className="text-heading-4 text-heading-3 mb-sm">Q1 2026</h3>
                <p className="text-body text-heading-4 text-foreground mb-sm">GXTEWAY Blockchain Ticketing</p>
                <p className="color-muted">Open source ticketing & access control</p>
              </div>
              
              <div className="text-center">
                <div className="w-component-lg h-component-lg bg-gradient-to-r from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-md">
                  <Zap className="h-icon-xl w-icon-xl text-background" />
                </div>
                <h3 className="text-heading-4 text-heading-3 mb-sm">Q2 2026</h3>
                <p className="text-body text-heading-4 color-accent mb-sm">MVNIFEST Inventory</p>
                <p className="color-muted">Advanced inventory management system</p>
              </div>

              <div className="text-center">
                <div className="w-component-lg h-component-lg bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-md">
                  <Users className="h-icon-xl w-icon-xl text-background" />
                </div>
                <h3 className="text-heading-4 text-heading-3 mb-sm">Q3 2026</h3>
                <p className="text-body text-heading-4 text-foreground mb-sm">OPVS Artist & Talent</p>
                <p className="color-muted">Comprehensive talent management</p>
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* Product Previews */}
      <MarketingSection id="products"  padding="md">
        <div className="container mx-auto px-md">
          <div className="space-y-mdxl">
            {upcomingProducts.map((product, index) => (
              <div key={product.id} className={`${index % 2 === 1 ? 'md:flex-row-reverse' : ''} md:flex items-center gap-xsxl`}>
                <div className="md:w-1/2 mb-xl md:mb-0">
                  <Card className="hover:shadow-elevation-4 transition-all duration-normal">
                    <div className={`h-container-md bg-gradient-to-br ${product.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="text-center text-background">
                        <div className="text-display text-heading-3 mb-md opacity-90">
                          {product.name}
                        </div>
                        <div className="text-heading-4 opacity-75">
                          {product.subtitle}
                        </div>
                      </div>
                      <div className="absolute top-md right-4">
                        <Badge className="bg-muted color-foreground border-foreground/30">
                          {product.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="md:w-1/2">
                  <div className="mb-lg">
                    <div className="flex items-center gap-sm mb-md">
                      <Badge variant="outline">{product.category}</Badge>
                      <Badge className="bg-accent color-accent-foreground">
                        <Calendar className="h-3 w-3 mr-xs" />
                        {product.launchDate}
                      </Badge>
                    </div>
                    <h2 className={`mb-md ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                      {product.name} {product.subtitle}
                    </h2>
                    <p className="text-body color-muted mb-lg">
                      {product.description}
                    </p>
                  </div>

                  <div className="stack-lg">
                    <div>
                      <h3 className="text-body text-heading-4 mb-sm">Key Features</h3>
                      <div className="grid gap-sm">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-sm">
                            <Zap className="h-icon-xs w-icon-xs text-foreground mt-xs flex-shrink-0" />
                            <span className="text-body-sm color-muted">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-body text-heading-4 mb-sm">Expected Benefits</h3>
                      <div className="grid gap-sm">
                        {product.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-sm">
                            <ArrowRight className="h-icon-xs w-icon-xs color-success mt-xs flex-shrink-0" />
                            <span className="text-body-sm text-heading-4 color-success">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-body text-heading-4 mb-sm">Target Users</h3>
                      <div className="flex flex-wrap gap-sm">
                        {product.targetUsers.map((user: any) => (
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
      </MarketingSection>

      {/* Feature Request Section */}
      <MarketingSection className=" bg-secondary/20" padding="md">
        <div className="container mx-auto px-md">
          <div className="text-center mb-3xl">
            <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
              SHAPE THE FUTURE
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Have ideas for features or entirely new products? We're building the future of production 
              management based on real user needs. Your input directly influences our roadmap.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-xl mb-2xl">
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
              <Card key={index} className="hover:shadow-elevation-3 transition-shadow text-center">
                <CardContent className="p-xl">
                  <div className="w-component-md h-component-md bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-md">
                    <item.icon className="h-icon-lg w-icon-lg text-background" />
                  </div>
                  <h3 className={`mb-sm ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                    {item.title}
                  </h3>
                  <p className="color-muted">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-xl">
                <MessageSquare className="h-icon-2xl w-icon-2xl text-foreground mx-auto mb-md" />
                <h3 className={`mb-md ${anton.className} text-heading-4 text-heading-3 uppercase`}>
                  Feature Request Portal
                </h3>
                <p className="color-muted mb-lg">
                  Submit feature requests, vote on community ideas, and track development progress 
                  on our dedicated feedback platform.
                </p>
                <Link href="https://ghxstship.canny.io" target="_blank" rel="noopener noreferrer">
                  <Button className="group">
                    Open Feature Portal
                    <ExternalLink className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
                <p className="text-body-sm color-muted mt-sm">
                  External link to canny.io feedback platform
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MarketingSection>

      {/* Early Access CTA */}
      <MarketingSection className=" bg-gradient-to-r from-primary/5 to-accent/5" padding="md">
        <div className="container mx-auto px-md">
          <Card className="max-w-4xl mx-auto text-center">
            <CardContent className="p-xsxl">
              <div className="flex justify-center mb-lg">
                <div className="w-component-lg h-component-lg bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Zap className="h-icon-xl w-icon-xl text-background" />
                </div>
              </div>
              <h2 className={`mb-lg ${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase`}>
                GET EARLY ACCESS
              </h2>
              <p className="text-body color-muted mb-xl max-w-2xl mx-auto">
                Be among the first to experience the next generation of production management tools. 
                Early access users get exclusive features, priority support, and special pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="group">
                    Join Early Access Program
                    <ArrowRight className="ml-sm h-icon-xs w-icon-xs transition-transform duration-normal ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales Team
                  </Button>
                </Link>
              </div>
              <p className="text-body-sm color-muted mt-lg">
                Free early access • Priority support • Exclusive features
              </p>
            </CardContent>
          </Card>
        </div>
      </MarketingSection>
    </div>
  );
}
