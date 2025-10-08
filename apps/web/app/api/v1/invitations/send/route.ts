import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, role, organizationName, inviterName } = await request.json();

    if (!email || !role || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient({
      get: (name: string) => {
        const c = cookieStore.get(name);
        return c ? { name: c.name, value: c.value } : undefined;
      },
      set: (name: string, value: string, options) => cookieStore.set(name, value, options),
      remove: (name: string) => cookieStore.delete(name)
    });

    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, you would send an email here
    // For now, we'll just log the invitation details
    console.log('Team invitation:', {
      email,
      role,
      organizationName,
      inviterName,
      invitedBy: session.user.id
    });

    // You could integrate with email services like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Postmark
    
    // Example email content:
    const emailContent = {
      to: email,
      subject: `You've been invited to join ${organizationName} on GHXSTSHIP`,
      html: `
        <h2>You've been invited to join ${organizationName}</h2>
        <p>${inviterName} has invited you to join their team on GHXSTSHIP as a ${role}.</p>
        <p>Click the link below to accept the invitation and create your account:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/signup?invite=${encodeURIComponent(email)}&org=${encodeURIComponent(organizationName)}">
          Accept Invitation
        </a>
      `
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully' 
    });

  } catch (error) {
    console.error('Failed to send invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
