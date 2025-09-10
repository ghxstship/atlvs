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
      { label: 'Compare Products', href: '/products/compare' },
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
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'Blog', href: '/resources/blog' },
      { label: 'Case Studies', href: '/resources/case-studies' },
      { label: 'Documentation', href: '/resources/docs' },
      { label: 'Guides', href: '/resources/guides' },
      { label: 'Whitepapers', href: '/resources/whitepapers' },
    ],
  },
  { label: 'Community', href: '/community' },
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
