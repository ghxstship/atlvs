import { NextRequest, NextResponse } from 'next/server';
// Temporarily disabled Stripe integration
// import Stripe from 'stripe';
// import { createClient } from '@supabase/supabase-js';
// import { STRIPE_PRICING, type PlanType } from '../../../../lib/stripe-config';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// });

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export async function POST(request: NextRequest) {
  // Temporarily disabled - redirect to signup instead
  return NextResponse.json(
    { error: 'Stripe integration temporarily disabled. Please use signup flow.' },
    { status: 503 }
  );
}
