import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent, Badge } from '@ghxstship/ui';
import { ArrowRight, Users, Globe, Zap, CheckCircle, Star, Building, Target } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Partnerships | GHXSTSHIP',
  description: 'Partner with GHXSTSHIP to expand your reach and enhance your offerings. Explore integration partnerships, channel partnerships, and strategic alliances.',
  openGraph: {
    title: 'Partnerships | GHXSTSHIP',
    description: 'Partner with GHXSTSHIP to expand your reach and enhance your offerings. Explore integration partnerships, channel partnerships, and strategic alliances.',
    url: 'https://ghxstship.com/partnerships',
  },
};

const partnershipTypes = [
  {
    icon: Zap,
    title: 'Technology Partners',
    description: 'Integrate your tools and services with the GHXSTSHIP platform to provide seamless workflows for creative professionals.',
    benefits: ['API access', 'Co-marketing opportunities', 'Technical support', 'Joint go-to-market'],
    color: 'from-primary to-accent',
  },
  {
    icon: Users,
    title: 'Channel Partners',
    description: 'Resell GHXSTSHIP solutions to your clients and earn competitive commissions while expanding your service offerings.',
    benefits: ['Revenue sharing', 'Sales training', 'Marketing materials', 'Dedicated support'],
    color: 'from-primary to-accent',
  },
  {
    icon: Building,
    title: 'Strategic Partners',
    description: 'Form strategic alliances to co-develop solutions, enter new markets, and create innovative offerings together.',
    benefits: ['Joint development', 'Market expansion', 'Shared resources', 'Strategic alignment'],
    color: 'from-primary to-accent',
  },
  {
    icon: Globe,
    title: 'Regional Partners',
    description: 'Represent GHXSTSHIP in your local market and help us expand our global presence while growing your business.',
    benefits: ['Territory exclusivity', 'Local market expertise', 'Cultural adaptation', 'Regional support'],
    color: 'from-primary to-accent',
  },
];

const currentPartners = [
  {
    name: 'Adobe Creative Suite',
    type: 'Technology Integration',
    description: 'Seamless integration with Adobe Creative Cloud applications for enhanced creative workflows.',
    logo: '/api/placeholder/120/60',
  },
  {
    name: 'Slack',
    type: 'Communication Platform',
    description: 'Real-time notifications and project updates directly in your Slack workspace.',
    logo: '/api/placeholder/120/60',
  },
  {
    name: 'Google Workspace',
    type: 'Productivity Suite',
    description: 'Integration with Google Drive, Docs, and Calendar for seamless collaboration.',
    logo: '/api/placeholder/120/60',
  },
  {
    name: 'Figma',
    type: 'Design Platform',
    description: 'Direct integration with Figma for design collaboration and version control.',
    logo: '/api/placeholder/120/60',
  },
  {
    name: 'Zoom',
    type: 'Video Conferencing',
    description: 'Integrated video calls and screen sharing for remote creative collaboration.',
    logo: '/api/placeholder/120/60',
  },
  {
    name: 'Dropbox',
    type: 'File Storage',
    description: 'Secure file sharing and storage integration for creative assets.',
    logo: '/api/placeholder/120/60',
  },
];

const partnerBenefits = [
  {
    title: 'Expand Your Market Reach',
    description: 'Access GHXSTSHIP\'s global network of 100K+ creative professionals and enterprise clients.',
    icon: Globe,
  },
  {
    title: 'Increase Revenue Streams',
    description: 'Generate new revenue through partnerships, integrations, and joint solutions.',
    icon: Target,
  },
  {
    title: 'Enhance Your Offering',
    description: 'Provide more value to your customers by integrating with our comprehensive platform.',
    icon: Zap,
  },
  {
    title: 'Co-Marketing Opportunities',
    description: 'Leverage joint marketing initiatives to increase brand visibility and lead generation.',
    icon: Users,
  },
];

const partnershipProcess = [
  {
    step: '1',
    title: 'Initial Discussion',
    description: 'Schedule a call to discuss partnership opportunities and alignment.',
  },
  {
    step: '2',
    title: 'Proposal Review',
    description: 'We review your proposal and assess mutual benefits and technical requirements.',
  },
  {
    step: '3',
    title: 'Agreement & Onboarding',
    description: 'Finalize partnership agreement and begin the technical integration process.',
  },
  {
    step: '4',
    title: 'Launch & Support',
    description: 'Go live with the partnership and receive ongoing support for success.',
  },
];

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Partner Program
            </Badge>
            <h1 className={`${anton.className} text-heading-1 lg:text-display text-heading-3 mb-6 uppercase`}>
              GROW
              <br />
              <span className="text-gradient-primary">
                TOGETHER
              </span>
            </h1>
            <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-8">
              Join GHXSTSHIP's partner ecosystem and unlock new opportunities for growth. 
              Whether you're a technology provider, reseller, or strategic partner, 
              we'll help you succeed in the creative collaboration market.
            </p>

            <div className="flex flex-col sm:flex-row gap-md justify-center mb-12">
              <Button className="group">
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button>
                Partner Portal
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-lg max-w-2xl mx-auto">
              <div className="text-center">
                <div className={`${anton.className} text-heading-3 text-heading-3 color-foreground mb-2 uppercase`}>200+</div>
                <div className="text-body-sm color-muted">Active Partners</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-heading-3 text-heading-3 color-foreground mb-2 uppercase`}>50+</div>
                <div className="text-body-sm color-muted">Integrations</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-heading-3 text-heading-3 color-foreground mb-2 uppercase`}>25+</div>
                <div className="text-body-sm color-muted">Countries</div>
              </div>
              <div className="text-center">
                <div className={`${anton.className} text-heading-3 text-heading-3 color-foreground mb-2 uppercase`}>$50M+</div>
                <div className="text-body-sm color-muted">Partner Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              PARTNERSHIP OPPORTUNITIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Choose the partnership model that best fits your business goals and capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {partnershipTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-xl">
                    <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center mb-6`}>
                      <Icon className="h-6 w-6 text-background" />
                    </div>
                    
                    <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-4 uppercase`}>
                      {type.title}
                    </h3>
                    <p className="color-muted mb-6">{type.description}</p>
                    
                    <div className="stack-sm mb-6">
                      <h4 className="text-heading-4 text-body-sm color-muted uppercase">Benefits</h4>
                      {type.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-sm">
                          <CheckCircle className="h-4 w-4 color-success flex-shrink-0" />
                          <span className="text-body-sm color-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full group">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              OUR PARTNERS
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              We're proud to work with industry-leading companies to provide the best experience for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {currentPartners.map((partner) => (
              <Card key={partner.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-lg text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 color-primary" />
                  </div>
                  <h3 className={`${anton.className} text-body text-heading-3 mb-2 uppercase`}>
                    {partner.name}
                  </h3>
                  <Badge variant="outline" className="text-body-sm mb-3">
                    {partner.type}
                  </Badge>
                  <p className="text-body-sm color-muted">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              WHY PARTNER WITH US?
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Discover the advantages of joining the GHXSTSHIP partner ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {partnerBenefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-xl">
                    <div className="flex items-start gap-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent">
                        <Icon className="h-6 w-6 text-background" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${anton.className} text-heading-4 text-heading-3 mb-3 uppercase`}>{benefit.title}</h3>
                        <p className="color-muted">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              HOW TO BECOME A PARTNER
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              Our streamlined process makes it easy to start partnering with GHXSTSHIP.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border hidden lg:block"></div>
            
            <div className="space-y-12">
              {partnershipProcess.map((step, index) => (
                <div key={step.step} className={`flex items-center gap-xl ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-lg">
                        <h3 className={`${anton.className} text-body text-heading-3 mb-2 uppercase`}>
                          {step.title}
                        </h3>
                        <p className="color-muted">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="relative z-10 hidden lg:block">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-background text-heading-3">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Success Stories */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              PARTNER SUCCESS STORIES
            </h2>
            <p className="text-body color-muted max-w-3xl mx-auto">
              See how our partners have grown their business with GHXSTSHIP.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-xl">
            {[
              {
                company: 'CreativeFlow Solutions',
                type: 'Channel Partner',
                result: '300% revenue growth in 18 months',
                testimonial: 'Partnering with GHXSTSHIP has transformed our business. We\'ve expanded our service offerings and tripled our revenue.',
                author: 'Sarah Martinez, CEO',
              },
              {
                company: 'TechIntegrate Inc.',
                type: 'Technology Partner',
                result: '50K+ new users through integration',
                testimonial: 'The GHXSTSHIP integration has brought us thousands of new users and strengthened our platform significantly.',
                author: 'David Chen, CTO',
              },
            ].map((story) => (
              <Card key={story.company} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-xl">
                  <div className="flex items-center gap-sm mb-4">
                    <h3 className={`${anton.className} text-heading-4 text-heading-3 uppercase`}>
                      {story.company}
                    </h3>
                    <Badge variant="outline" className="text-body-sm">
                      {story.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-sm mb-4">
                    <Star className="h-4 w-4 color-warning" />
                    <span className="text-heading-4 color-primary">{story.result}</span>
                  </div>
                  
                  <blockquote className="border-l-4 border-primary pl-4 mb-4">
                    <p className="color-foreground italic">"{story.testimonial}"</p>
                  </blockquote>
                  
                  <cite className="text-body-sm color-muted">— {story.author}</cite>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-md">
          <div className="text-center">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              READY TO PARTNER?
            </h2>
            <p className="text-body color-muted mb-8 max-w-2xl mx-auto">
              Join our growing partner ecosystem and unlock new opportunities for growth. 
              Let's build the future of creative collaboration together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <Link href="/contact">
                <Button className="w-full sm:w-auto group">
                  Start Partnership Discussion
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button className="w-full sm:w-auto">
                Download Partner Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20">
        <div className="container mx-auto px-md">
          <div className="text-center mb-16">
            <h2 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 mb-6 uppercase`}>
              PARTNER RESOURCES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-lg">
            {[
              { title: 'API Documentation', href: '/resources/docs', description: 'Technical integration guides' },
              { title: 'Marketing Materials', href: '/resources/guides', description: 'Co-marketing resources' },
              { title: 'Support Center', href: '/contact', description: 'Partner support and assistance' },
            ].map((resource) => (
              <a key={resource.title} href={resource.href as any as any}>
                <Card className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-lg text-center">
                    <h3 className={`${anton.className} text-body text-heading-3 mb-2 uppercase group-hover:color-primary transition-colors`}>
                      {resource.title}
                    </h3>
                    <p className="text-body-sm color-muted">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
