import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - GHXSTSHIP',
  description: 'Choose the perfect plan for your creative production needs. From solo creators to enterprise teams.',
  openGraph: {
    title: 'Pricing - GHXSTSHIP',
    description: 'Choose the perfect plan for your creative production needs.',
    url: 'https://ghxstship.com/pricing'
  }
};

// Product Schema for SEO
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "Product",
      "position": 1,
      "name": "GHXSTSHIP Community",
      "description": "Perfect for freelancers and solo creators getting started",
      "brand": {
        "@type": "Brand",
        "name": "GHXSTSHIP"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "120",
        "highPrice": "144",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "offerCount": 2,
        "offers": [
          {
            "@type": "Offer",
            "price": "12.00",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "price": "120.00",
            "priceCurrency": "USD",
            "billingDuration": "P1Y",
            "availability": "https://schema.org/InStock"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "127"
      }
    },
    {
      "@type": "Product",
      "position": 2,
      "name": "GHXSTSHIP Pro",
      "description": "For professionals who need full creative production power",
      "brand": {
        "@type": "Brand",
        "name": "GHXSTSHIP"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "240",
        "highPrice": "288",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "offerCount": 2,
        "offers": [
          {
            "@type": "Offer",
            "price": "24.00",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "price": "240.00",
            "priceCurrency": "USD",
            "billingDuration": "P1Y",
            "availability": "https://schema.org/InStock"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "342"
      }
    },
    {
      "@type": "Product",
      "position": 3,
      "name": "GHXSTSHIP Team",
      "description": "For growing teams ready to scale their creative operations",
      "brand": {
        "@type": "Brand",
        "name": "GHXSTSHIP"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "360",
        "highPrice": "432",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "offerCount": 2,
        "offers": [
          {
            "@type": "Offer",
            "price": "36.00",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "price": "360.00",
            "priceCurrency": "USD",
            "billingDuration": "P1Y",
            "availability": "https://schema.org/InStock"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "856"
      }
    },
    {
      "@type": "Product",
      "position": 4,
      "name": "GHXSTSHIP Vessel",
      "description": "Single project enterprise solution with advanced ticketing",
      "brand": {
        "@type": "Brand",
        "name": "GHXSTSHIP"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "600",
        "highPrice": "720",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "offerCount": 2,
        "offers": [
          {
            "@type": "Offer",
            "price": "60.00",
            "priceCurrency": "USD",
            "billingDuration": "P1M",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "price": "600.00",
            "priceCurrency": "USD",
            "billingDuration": "P1Y",
            "availability": "https://schema.org/InStock"
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "234"
      }
    },
    {
      "@type": "Product",
      "position": 5,
      "name": "GHXSTSHIP Fleet",
      "description": "Multi-project enterprise solution for large organizations",
      "brand": {
        "@type": "Brand",
        "name": "GHXSTSHIP"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "0",
          "priceCurrency": "USD",
          "name": "Custom Pricing"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "89"
      }
    }
  ]
};
