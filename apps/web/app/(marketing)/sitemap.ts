import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ghxstship.com';

  // Static marketing pages
  const staticPages = [
    '',
    '/products',
    '/products/atlvs',
    '/products/opendeck',
    '/products/compare',
    '/solutions',
    '/solutions/brand-activations',
    '/solutions/community-events',
    '/solutions/corporate-events',
    '/solutions/health-wellness-events',
    '/solutions/immersive-experiences',
    '/solutions/sporting-events',
    '/solutions/themed-entertainment',
    '/solutions/trade-shows-conferences',
    '/pricing',
    '/company',
    '/careers',
    '/contact',
    '/resources',
    '/resources/blog',
    '/resources/case-studies',
    '/resources/documentation',
    '/resources/guides',
    '/resources/whitepapers',
    '/community',
    '/privacy',
    '/terms',
    '/cookies',
    '/security',
    '/accessibility'
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly' as const,
    priority: page === '' ? 1.0 : page.startsWith('/products') || page === '/pricing' ? 0.9 : 0.8
  }));
}
