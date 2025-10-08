import { NextResponse } from 'next/server';

// In production, this would fetch from a database or Edge Config
// For now, we'll use a static configuration
const experiments = {
  hero_headline_test: {
    id: 'hero_headline_test',
    name: 'Hero Headline Test',
    description: 'Testing different headline variations on the homepage',
    variants: ['control', 'variant_a', 'variant_b'],
    activeVariant: 'control',
    status: 'active' as const,
    startDate: '2025-09-30',
    endDate: '2025-10-30'
  },
  cta_button_test: {
    id: 'cta_button_test',
    name: 'CTA Button Text Test',
    description: 'Testing different call-to-action button text',
    variants: ['control', 'variant_a'],
    activeVariant: 'control',
    status: 'active' as const,
    startDate: '2025-09-30',
    endDate: '2025-10-30'
  },
  pricing_layout_test: {
    id: 'pricing_layout_test',
    name: 'Pricing Page Layout Test',
    description: 'Testing different pricing page layouts',
    variants: ['control', 'variant_a', 'variant_b'],
    activeVariant: 'control',
    status: 'active' as const,
    startDate: '2025-09-30',
    endDate: '2025-11-30'
  },
  signup_flow_test: {
    id: 'signup_flow_test',
    name: 'Signup Flow Test',
    description: 'Testing different signup flow variations',
    variants: ['control', 'variant_a'],
    activeVariant: 'control',
    status: 'draft' as const
  }
};

export async function GET() {
  // Return only active experiments
  const activeExperiments = Object.fromEntries(
    Object.entries(experiments).filter(([_, exp]) => exp.status === 'active')
  );

  return NextResponse.json(activeExperiments, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 60;
