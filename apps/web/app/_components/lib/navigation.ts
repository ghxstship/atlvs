export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export const navigation: NavigationItem[] = [
  {
    label: 'Products',
    href: '/products',
    children: [
      { label: 'ATLVS', href: '/products/atlvs' },
      { label: 'OPENDECK', href: '/products/opendeck' },
      { label: 'Compare', href: '/products/compare' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Coming Soon', href: '/products/coming-soon' },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions',
    children: [
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
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Documentation', href: '/resources/documentation' },
      { label: 'Guides', href: '/resources/guides' },
      { label: 'Whitepapers', href: '/resources/whitepapers' },
    ],
  },
  {
    label: 'Community',
    href: '/community',
    children: [
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
    label: 'Company',
    href: '/company',
    children: [
      { label: 'About', href: '/company/about' },
      { label: 'Team', href: '/company/team' },
      { label: 'Press', href: '/company/press' },
      { label: 'Careers', href: '/company/careers' },
    ],
  },
];
