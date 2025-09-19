import { Metadata } from 'next';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';
import { Users, Star, Globe, Zap } from 'lucide-react';

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
    <div className="container mx-auto px-md py-3xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3xl">
          <h1 className={`${anton.className} uppercase text-heading-1 md:text-display text-heading-3 mb-lg`}>
            COMMUNITY PARTNERS
          </h1>
          <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
            Join our growing ecosystem of partners who help extend GHXSTSHIP's capabilities and reach.
          </p>
          <Button>
            Become a Partner
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-xl mb-3xl">
          {partnerTiers.map((tier: any) => {
            const Icon = tier.icon;
            return (
              <div key={tier.title} className="bg-card rounded-lg p-lg border text-center">
                <div className="bg-primary/10 p-md rounded-lg inline-flex mb-md">
                  <Icon className="h-8 w-8 text-foreground" />
                </div>
                <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-sm`}>
                  {tier.title}
                </h3>
                <p className="color-muted mb-lg">{tier.description}</p>
                <ul className="stack-sm text-body-sm">
                  {tier.benefits.map((benefit: any) => (
                    <li key={benefit} className="flex items-center justify-center gap-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mb-3xl">
          <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-xl text-center`}>
            FEATURED PARTNERS
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {featuredPartners.map((partner: any) => (
              <div key={partner.name} className="bg-card rounded-lg p-lg border text-center hover:shadow-floating transition-shadow">
                <div className="bg-secondary/30 rounded-lg h-16 mb-md flex items-center justify-center">
                  <span className="text-body-sm color-muted">Partner Logo</span>
                </div>
                <h3 className="text-heading-4 mb-xs">{partner.name}</h3>
                <p className="text-body-sm color-muted">{partner.category} Partner</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-xl">
          <div className="text-center mb-xl">
            <Users className="h-12 w-12 text-foreground mx-auto mb-md" />
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              PARTNER WITH US
            </h2>
            <p className="color-muted max-w-2xl mx-auto">
              Ready to join the GHXSTSHIP partner ecosystem? Let's explore how we can work together 
              to deliver exceptional value to our shared customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-xl">
            <div>
              <h3 className="text-heading-4 mb-sm">Partnership Benefits</h3>
              <ul className="stack-sm text-body-sm color-muted">
                <li>• Access to GHXSTSHIP's growing customer base</li>
                <li>• Co-marketing and promotional opportunities</li>
                <li>• Technical support and training resources</li>
                <li>• Revenue sharing and incentive programs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-heading-4 mb-sm">Getting Started</h3>
              <ul className="stack-sm text-body-sm color-muted">
                <li>• Submit partnership application</li>
                <li>• Technical and business evaluation</li>
                <li>• Partnership agreement and onboarding</li>
                <li>• Launch and ongoing support</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-xl">
            <Button>
              Apply for Partnership
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
