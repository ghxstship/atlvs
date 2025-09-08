import { Metadata } from 'next';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';
import { Handshake, Star, Globe, Zap } from 'lucide-react';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community Partners | GHXSTSHIP',
  description: 'Discover our community partners and learn how to become part of the GHXSTSHIP partner ecosystem.',
};

export default function PartnersPage() {
  const partnerTiers = [
    {
      title: 'Technology Partners',
      description: 'Integration partners that extend GHXSTSHIP capabilities',
      icon: Zap,
      benefits: ['API Access', 'Co-marketing', 'Technical Support', 'Joint Development'],
    },
    {
      title: 'Solution Partners',
      description: 'Consultants and agencies that implement GHXSTSHIP solutions',
      icon: Globe,
      benefits: ['Training Programs', 'Certification', 'Lead Sharing', 'Marketing Support'],
    },
    {
      title: 'Community Champions',
      description: 'Power users who advocate for GHXSTSHIP in their networks',
      icon: Star,
      benefits: ['Early Access', 'Direct Feedback', 'Recognition', 'Exclusive Events'],
    },
  ];

  const featuredPartners = [
    { name: 'Creative Cloud Solutions', category: 'Technology', logo: '/partners/creative-cloud.svg' },
    { name: 'Production Pro Services', category: 'Solution', logo: '/partners/production-pro.svg' },
    { name: 'Media Workflow Experts', category: 'Solution', logo: '/partners/media-workflow.svg' },
    { name: 'Digital Asset Management Co', category: 'Technology', logo: '/partners/dam-co.svg' },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`${anton.className} uppercase text-4xl md:text-5xl font-bold mb-6`}>
            COMMUNITY PARTNERS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our growing ecosystem of partners who help extend GHXSTSHIP's capabilities and reach.
          </p>
          <Button size="lg">
            Become a Partner
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {partnerTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.title} className="bg-card rounded-lg p-6 border text-center">
                <div className="bg-primary/10 p-4 rounded-lg inline-flex mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className={`${anton.className} uppercase text-xl font-bold mb-3`}>
                  {tier.title}
                </h3>
                <p className="text-muted-foreground mb-6">{tier.description}</p>
                <ul className="space-y-2 text-sm">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mb-16">
          <h2 className={`${anton.className} uppercase text-2xl font-bold mb-8 text-center`}>
            FEATURED PARTNERS
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPartners.map((partner) => (
              <div key={partner.name} className="bg-card rounded-lg p-6 border text-center hover:shadow-lg transition-shadow">
                <div className="bg-muted/30 rounded-lg h-16 mb-4 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Partner Logo</span>
                </div>
                <h3 className="font-semibold mb-1">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.category} Partner</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <Handshake className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className={`${anton.className} uppercase text-2xl font-bold mb-4`}>
              PARTNER WITH US
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to join the GHXSTSHIP partner ecosystem? Let's explore how we can work together 
              to deliver exceptional value to our shared customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Partnership Benefits</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Access to GHXSTSHIP's growing customer base</li>
                <li>• Co-marketing and promotional opportunities</li>
                <li>• Technical support and training resources</li>
                <li>• Revenue sharing and incentive programs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Getting Started</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Submit partnership application</li>
                <li>• Technical and business evaluation</li>
                <li>• Partnership agreement and onboarding</li>
                <li>• Launch and ongoing support</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg">
              Apply for Partnership
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
