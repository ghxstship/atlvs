import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Users can only view their own sessions unless they're admin/owner
    if (targetUserId && targetUserId !== user.id) {
      if (!['owner', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const userId = targetUserId || user.id;

    // Get user sessions
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });

    if (error) {
      console.error('Sessions fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get current session ID from auth
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const currentSessionId = currentSession?.access_token;

    const sanitizedSessions = sessions?.map(session => ({
      id: session.id,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      deviceInfo: session.device_info,
      location: session.location,
      isActive: session.is_active,
      isCurrent: session.token_hash === currentSessionId,
      lastActivityAt: session.last_activity_at,
      expiresAt: session.expires_at,
      createdAt: session.created_at
    }));

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'sessions.list',
      resource_type: 'user_session',
      details: { 
        targetUserId: userId,
        count: sanitizedSessions?.length || 0 
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ sessions: sanitizedSessions });

  } catch (err: unknown) {
    console.error('Sessions GET error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const action = searchParams.get('action');

    if (action === 'revoke-all') {
      // Revoke all sessions except current
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const currentSessionToken = currentSession?.access_token;

      let query = supabase
        .from('user_sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Keep current session active
      if (currentSessionToken) {
        query = query.neq('token_hash', currentSessionToken);
      }

      const { data: revokedSessions, error } = await query.select();

      if (error) {
        console.error('Sessions revoke all error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'sessions.revoked_all',
        resource_type: 'user_session',
        details: { 
          count: revokedSessions?.length || 0,
          exceptCurrent: !!currentSessionToken
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: `Revoked ${revokedSessions?.length || 0} sessions`,
        count: revokedSessions?.length || 0
      });

    } else if (sessionId) {
      // Revoke specific session
      // Verify the session belongs to the user or user is admin
      const { data: session } = await supabase
        .from('user_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.user_id !== user.id && !['owner', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Session revoke error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'session.revoked',
        resource_type: 'user_session',
        resource_id: sessionId,
        details: { 
          targetUserId: session.user_id,
          revokedBy: user.id
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Session revoked successfully'
      });

    } else {
      return NextResponse.json({ error: 'Session ID or action required' }, { status: 400 });
    }

  } catch (err: unknown) {
    console.error('Session DELETE error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

// Cleanup expired sessions (called by cron job or admin)
export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins can trigger cleanup
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'cleanup-expired') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Delete expired sessions
    const { data: expiredSessions, error } = await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      console.error('Session cleanup error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'sessions.cleanup',
      resource_type: 'user_session',
      details: { 
        count: expiredSessions?.length || 0
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: `Cleaned up ${expiredSessions?.length || 0} expired sessions`,
      count: expiredSessions?.length || 0
    });

  } catch (err: unknown) {
    console.error('Session cleanup error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
