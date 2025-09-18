'use client';

import React, { useState } from 'react';
import { Button } from '@ghxstship/ui';
import { ArrowRight, Loader2 } from 'lucide-react';

type PlanType = 'community' | 'pro' | 'team' | 'organization';

interface StripeCheckoutProps {
  plan: PlanType;
  className?: string;
  variant?: 'info' | 'outline' | 'success' | 'warning' | 'destructive' | 'primary' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  children?: React.ReactNode;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  plan,
  className = '',
  variant = 'primary',
  size = 'lg',
  children
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (plan === 'organization') {
      // Redirect to contact page for organization
      window.location.href = '/contact';
      return;
    }

    if (plan === 'community') {
      // Redirect to signup for free plan
      window.location.href = '/auth/signup';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, redirect to signup until Stripe is fully configured
      window.location.href = '/auth/signup';
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (plan === 'organization') return 'Contact Sales';
    if (plan === 'community') return 'Get Started Free';
    return children || 'Start Free Trial';
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full ${className}`}
        variant={variant}
        size={size}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            {getButtonText()}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-xs text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

// Hook for managing subscription status
export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/stripe/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { subscription, loading };
};
