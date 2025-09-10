'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ghxstship/ui';
import { Github, Linkedin, Youtube, Mail, Check } from 'lucide-react';
import { Anton } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerSections = [
  {
    title: 'Products',
    links: [
      { label: 'ATLVS', href: '/products/atlvs' },
      { label: 'OPENDECK', href: '/products/opendeck' },
      { label: 'Compare Products', href: '/products/compare' },
      { label: 'Pricing', href: '/pricing' },
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
      { label: 'Documentation', href: '/resources/docs' },
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
      { label: 'Discord', href: 'https://discord.gg/ghxstship' },
      { label: 'Forums', href: '/community/forums' },
      { label: 'Events', href: '/community/events' },
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

const socialLinks = [
  { icon: XIcon, href: 'https://x.com/ghxstship_xyz', label: 'X' },
  { icon: Linkedin, href: 'https://linkedin.com/company/ghxstship', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/ghxstship', label: 'GitHub' },
  { icon: Youtube, href: 'https://youtube.com/@ghxstship', label: 'YouTube' },
];

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail('');
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Signup */}
        <div className="mb-12 text-center">
          <h3 className={`${anton.className} text-2xl font-bold mb-4 uppercase`}>
            STAY UPDATED WITH GHXSTSHIP
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get the latest updates on new features, industry insights, and exclusive content delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading || isSubscribed}
              className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
            />
            <Button 
              type="submit" 
              
              className="sm:w-auto" 
              disabled={isLoading || isSubscribed || !email}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Subscribing...
                </>
              ) : isSubscribed ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className={`${anton.className} font-semibold text-foreground mb-4 text-sm uppercase tracking-wide`}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href as any as any}
                      {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className={`${anton.className} text-xl font-bold tracking-tight uppercase`}>
                GHXSTSHIP
              </span>
            </Link>
            <span className="text-sm text-muted-foreground">
              © {currentYear} GHXSTSHIP. All rights reserved.
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href as any as any}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              SOC 2 Type II Certified
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              GDPR Compliant
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              ISO 27001 Certified
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              99.9% Uptime SLA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
