import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source') || 'demo_link';
    const campaign = searchParams.get('campaign') || 'default';

    // Create a demo session identifier
    const demoSessionId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Set demo session cookie (expires in 24 hours)
    cookies().set('demo_session', demoSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // Set demo flag cookie
    cookies().set('is_demo', 'true', {
      httpOnly: false, // Accessible to client-side
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // Track demo access
    console.log('[Demo Access]', {
      sessionId: demoSessionId,
      source,
      campaign,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    });

    // TODO: In production, create actual demo user session with Supabase
    // const demoUser = await createDemoUser({
    //   sessionId: demoSessionId,
    //   source,
    //   campaign,
    // });

    // Redirect to dashboard with demo flag and source tracking
    redirect(`/dashboard?demo=true&session=${demoSessionId}&source=${source}&campaign=${campaign}`);
  } catch (error) {
    console.error('[Demo Access Error]', error);
    
    // Fallback to signup if demo creation fails
    redirect('/auth/signup?source=demo_fallback');
  }
}

export const dynamic = 'force-dynamic';
