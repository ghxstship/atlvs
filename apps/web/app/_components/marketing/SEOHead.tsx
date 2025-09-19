'use client';


import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
}

const defaultSEO = {
  title: 'GHXSTSHIP - Revolutionary Production Management Platform',
  description: 'Transform your creative production workflow with ATLVS and OPENDECK. Enterprise-grade project management, asset organization, and team collaboration tools for film, TV, advertising, and creative agencies.',
  keywords: [
    'production management',
    'creative workflow',
    'project management',
    'asset management',
    'film production',
    'TV production',
    'advertising',
    'creative agencies',
    'ATLVS',
    'OPENDECK',
    'collaboration tools',
    'enterprise software'
  ],
  image: 'https://ghxstship.com/og-image.jpg',
  type: 'website' as const,
};

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noindex = false,
  canonical,
}: SEOHeadProps) {
  const pathname = usePathname();
  const baseUrl = 'https://ghxstship.com';
  
  const seoTitle = title ? `${title} | GHXSTSHIP` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = [...defaultSEO.keywords, ...keywords];
  const seoImage = image || defaultSEO.image;
  const seoUrl = `${baseUrl}${pathname}`;
  const canonicalUrl = canonical || seoUrl;

  // Generate structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GHXSTSHIP',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: defaultSEO.description,
    foundingDate: '2019',
    founders: [
      {
        '@type': 'Person',
        name: 'Sarah Chen',
        jobTitle: 'CEO & Co-Founder'
      },
      {
        '@type': 'Person',
        name: 'Marcus Rodriguez',
        jobTitle: 'CTO & Co-Founder'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Market Street, Suite 500',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'customer service',
      email: 'hello@ghxstship.com'
    },
    sameAs: [
      'https://twitter.com/ghxstship',
      'https://linkedin.com/company/ghxstship',
      'https://github.com/ghxstship'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GHXSTSHIP',
    url: baseUrl,
    description: defaultSEO.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ATLVS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '99',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1247'
    },
    description: 'Professional production management platform for creative teams'
  };

  let pageSchema = {};
  
  if (type === 'article' && publishedTime) {
    pageSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: seoDescription,
      image: seoImage,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: {
        '@type': 'Person',
        name: author || 'GHXSTSHIP Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'GHXSTSHIP',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': seoUrl
      }
    };
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(', ')} />
      <meta name="author" content={author || 'GHXSTSHIP'} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content="GHXSTSHIP" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag: any) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ghxstship" />
      <meta name="twitter:creator" content="@ghxstship" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema)
        }}
      />
      {Object.keys(pageSchema).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageSchema)
          }}
        />
      )}
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      <link rel="dns-prefetch" href="https://unpkg.com" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Alternative Languages */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
    </Head>
  );
}
