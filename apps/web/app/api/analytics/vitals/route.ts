import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // Log to console (in production, send to analytics service)
    console.log('Web Vital Received:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      page: metric.page,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to PostHog, Sentry, or other analytics service
    // Example with PostHog:
    // posthog.capture('web_vital', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   metric_rating: metric.rating,
    //   page: metric.page,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
