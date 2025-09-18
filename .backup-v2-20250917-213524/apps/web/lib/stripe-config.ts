// Stripe configuration (temporarily disabled until dependencies are resolved)
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// export { stripePromise };

// Stripe pricing configuration
export const STRIPE_PRICING = {
  starter: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
    amount: 29900, // $299.00 in cents
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 5 team members',
      '3 active projects',
      'Basic ATLVS features',
      'OPENDECK marketplace access',
      'Email support',
      '1GB storage',
      'Mobile app access',
      'Basic reporting'
    ]
  },
  professional: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_monthly',
    amount: 99900, // $999.00 in cents
    currency: 'usd',
    interval: 'month',
    originalAmount: 124900, // $1,249.00 in cents
    features: [
      'Up to 25 team members',
      'Unlimited projects',
      'Full ATLVS suite',
      'OPENDECK pro features',
      'Priority support',
      '100GB storage',
      'Advanced analytics',
      'API access',
      'Custom workflows',
      'Advanced reporting',
      'Integrations library',
      'Team collaboration tools'
    ]
  },
  enterprise: {
    priceId: 'custom',
    amount: null,
    currency: 'usd',
    interval: 'custom',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Full platform access',
      'White-label options',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited storage',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
      'Advanced security features',
      'Custom training & onboarding',
      'Priority feature requests'
    ]
  }
};

// Stripe webhook events we handle
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

// Subscription status types
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

// Plan types
export type PlanType = 'starter' | 'professional' | 'enterprise';

// Subscription interface
export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: PlanType;
  trialEnd?: Date;
}

// Customer interface
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  subscription?: Subscription;
}
