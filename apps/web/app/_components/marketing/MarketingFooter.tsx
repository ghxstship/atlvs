'use client';


import Link from 'next/link';
import { anton } from '../lib/typography';
import { layouts } from '../lib/layouts';
import { NewsletterSignup } from '../../_components/marketing/NewsletterSignup';
import { FooterSection } from './footer/FooterSection';
import { SocialLinks } from './footer/SocialLinks';
import { TrustBadges } from './footer/TrustBadges';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Products',
    links: [
      { label: 'ATLVS', href: '/products/atlvs' },
      { label: 'OPENDECK', href: '/products/opendeck' },
      { label: 'Compare', href: '/products/compare' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Coming Soon', href: '/products/coming-soon' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Brand Activations', href: '/solutions/brand-activations' },
      { label: 'Community & Cultural Events', href: '/solutions/community-cultural-events' },
      { label: 'Concerts, Festivals & Tours', href: '/solutions/concerts-festivals-tours' },
      { label: 'Corporate & Private Events', href: '/solutions/corporate-community-events' },
      { label: 'Film & TV', href: '/solutions/film-tv' },
      { label: 'Health & Wellness Events', href: '/solutions/health-wellness-events' },
      { label: 'Hospitality & Travel', href: '/solutions/hospitality-travel' },
      { label: 'Immersive Experiences', href: '/solutions/immersive-experiences' },
      { label: 'Sporting Events & Tournaments', href: '/solutions/sporting-events-tournaments' },
      { label: 'Themed & Theatrical Entertainment', href: '/solutions/themed-theatrical-entertainment' },
      { label: 'Trade Shows & Conferences', href: '/solutions/trade-shows-conferences' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Documentation', href: '/resources/documentation' },
      { label: 'Guides', href: '/resources/guides' },
      { label: 'API Reference', href: '/resources/api' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/company/about' },
      { label: 'Team', href: '/company/team' },
      { label: 'Careers', href: '/company/careers' },
      { label: 'Press', href: '/company/press' },
      { label: 'Contact', href: '/company/contact' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Skool', href: 'https://www.skool.com/rogue-ops-collective-3068/about?ref=4f6baad2394a4a7daf965d8e8f1a86ed' },
      { label: 'Events', href: '/community/events' },
      { label: 'News', href: '/community/forums' },
      { label: 'Showcase', href: '/community/showcase' },
      { label: 'Impact', href: '/community/impact' },
      { label: 'Opportunities', href: '/community/opportunities' },
      { label: 'Partners', href: '/community/partners' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
];


export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Newsletter Section - Separate from footer */}
      <section className="py-smxl bg-muted/30 border-t">
        <div className={`${layouts.container} ${layouts.sectionPadding}`}>
          <div className="text-center">
            <h3 className={`${anton.className} text-heading-2 lg:text-heading-1 text-heading-3 uppercase mb-sm`}>
              STAY UPDATED WITH GHXSTSHIP
            </h3>
            <p className="color-muted mb-md max-w-2xl mx-auto">
              Get the latest updates on new features, industry insights, and exclusive content delivered to your inbox.
            </p>
            <NewsletterSignup variant="centered" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t">
        <div className={`${layouts.container} ${layouts.sectionPadding} py-xsxl`}>
          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-lg mb-xl">
            {footerSections.map((section: FooterSection) => (
              <FooterSection key={section.title} title={section.title} links={section.links} />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-lg border-t">
            {/* Logo */}
            <div className="flex items-center mb-sm md:mb-0">
              <Link href="/" className="flex items-center cluster-sm">
                <span className={`${anton.className} text-heading-4 text-heading-3 tracking-tight uppercase`}>
                  GHXSTSHIP
                </span>
              </Link>
            </div>

            {/* Centered Copyright */}
            <div className="flex-1 text-center mb-sm md:mb-0">
              <span className="text-body-sm color-muted">
                © {currentYear} GHXSTSHIP. All rights reserved.
              </span>
            </div>

            {/* Social Links */}
            <SocialLinks />
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </footer>
    </>
  );
}
