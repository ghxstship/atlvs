'use client';

import React, { useEffect, useState } from 'react';

// A/B Test configuration
export interface ABTest {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number; // Percentage weight (0-100)
  }[];
  status: 'active' | 'paused' | 'completed';
}

// Experimentation utilities
export class ABTesting {
  private static instance: ABTesting;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): ABTesting {
    if (!ABTesting.instance) {
      ABTesting.instance = new ABTesting();
    }
    return ABTesting.instance;
  }

  // Set user identifier for consistent variant assignment
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Get variant for a test (consistent for same user)
  getVariant(testId: string, test: ABTest): string {
    if (test.status !== 'active') {
      return test.variants[0].id; // Return first variant if test is not active
    }

    const identifier = this.userId || this.getAnonymousId();

    // Simple hash-based variant assignment for consistency
    const hash = this.simpleHash(identifier + testId);
    const random = Math.abs(hash) % 100;

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant.id;
      }
    }

    return test.variants[0].id; // Fallback
  }

  // Track conversion event
  trackConversion(testId: string, variantId: string, event: string, metadata?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        conversion_event: event,
        ...metadata
      });
    }

    // Also track in PostHog if available
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        conversion_event: event,
        ...metadata
      });
    }

    console.log(`AB Test Conversion: ${testId} - ${variantId} - ${event}`, metadata);
  }

  // Track page view with variant
  trackPageView(testId: string, variantId: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_page_view', {
        test_id: testId,
        variant_id: variantId
      });
    }
  }

  private getAnonymousId(): string {
    if (typeof window === 'undefined') return 'server';

    let anonymousId = localStorage.getItem('ab_anonymous_id');
    if (!anonymousId) {
      anonymousId = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ab_anonymous_id', anonymousId);
    }
    return anonymousId;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}

// Active A/B tests configuration
export const ACTIVE_AB_TESTS: ABTest[] = [
  {
    id: 'hero_headline',
    name: 'Hero Headline Test',
    status: 'active',
    variants: [
      { id: 'control', name: 'REVOLUTIONARY PRODUCTION MANAGEMENT PLATFORM', weight: 50 },
      { id: 'variant1', name: 'TRANSFORM YOUR CREATIVE WORKFLOW', weight: 25 },
      { id: 'variant2', name: 'THE COMPLETE PRODUCTION MANAGEMENT SOLUTION', weight: 25 },
    ]
  },
  {
    id: 'cta_button',
    name: 'CTA Button Text Test',
    status: 'active',
    variants: [
      { id: 'control', name: 'Get Started Free →', weight: 40 },
      { id: 'variant1', name: 'Start Free Trial', weight: 30 },
      { id: 'variant2', name: 'Try GHXSTSHIP Free', weight: 30 },
    ]
  },
  {
    id: 'pricing_display',
    name: 'Pricing Display Test',
    status: 'paused',
    variants: [
      { id: 'control', name: 'Show prices', weight: 50 },
      { id: 'variant1', name: 'Contact for pricing', weight: 50 },
    ]
  },
];

// React hook for using A/B tests
export function useABTest(testId: string) {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const test = ACTIVE_AB_TESTS.find(t => t.id === testId);
    if (!test) {
      setVariant('control');
      setIsLoading(false);
      return;
    }

    const abTesting = ABTesting.getInstance();
    const assignedVariant = abTesting.getVariant(testId, test);

    setVariant(assignedVariant);
    setIsLoading(false);

    // Track page view
    abTesting.trackPageView(testId, assignedVariant);
  }, [testId]);

  const trackConversion = (event: string, metadata?: Record<string, any>) => {
    if (variant) {
      const abTesting = ABTesting.getInstance();
      abTesting.trackConversion(testId, variant, event, metadata);
    }
  };

  return { variant, isLoading, trackConversion };
}

// Component for conditional rendering based on variant
export function ABTestVariant({
  testId,
  children,
  variant: targetVariant
}: {
  testId: string;
  children: React.ReactNode;
  variant: string;
}) {
  const { variant: currentVariant } = useABTest(testId);
  return currentVariant === targetVariant ? <>{children}</> : null;
}
