import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NotificationPreferenceSchema = z.object({
  type: z.enum(['email', 'sms', 'push', 'in_app']),
  enabled: z.boolean(),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).optional(),
  categories: z.array(z.enum([
    'project_updates', 'job_assignments', 'financial_alerts', 
    'system_notifications', 'security_alerts', 'marketplace_activity',
    'training_reminders', 'compliance_updates', 'approval_requests'
  ])).optional()
});

const UpdateNotificationSettingsSchema = z.object({
  preferences: z.array(NotificationPreferenceSchema),
  globalSettings: z.object({
    quietHours: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
      timezone: z.string()
    }).optional(),
    digestEnabled: z.boolean().optional(),
    digestFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    digestTime: z.string().optional()
  }).optional()
});

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
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Check if user can access other user's preferences
    if (userId !== user.id) {
      const { role: userRole } = await getAuthenticatedUser();
      if (!['owner', 'admin'].includes(userRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Get user's notification preferences
    const { data: preferences, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Notification preferences fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Default preferences if none exist
    const defaultPreferences = [
      { type: 'email', enabled: true, frequency: 'immediate', categories: ['security_alerts', 'approval_requests'] },
      { type: 'in_app', enabled: true, frequency: 'immediate', categories: ['project_updates', 'job_assignments'] },
      { type: 'push', enabled: false, frequency: 'immediate', categories: [] },
      { type: 'sms', enabled: false, frequency: 'immediate', categories: ['security_alerts'] }
    ];

    const userPreferences = preferences && preferences.length > 0 
      ? preferences 
      : defaultPreferences;

    // Get global notification settings from organization
    const { data: orgSettings } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', orgId)
      .single();

    const globalSettings = orgSettings?.settings?.notifications || {
      quietHours: { enabled: false, startTime: '22:00', endTime: '08:00', timezone: 'UTC' },
      digestEnabled: true,
      digestFrequency: 'daily',
      digestTime: '09:00'
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.notifications.get',
      resource_type: 'notification_preferences',
      details: { target_user_id: userId },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      preferences: userPreferences,
      globalSettings
    });

  } catch (error: any) {
    console.error('Notification settings GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { userId, ...settingsData } = body;
    const targetUserId = userId || user.id;

    // Check permissions for updating other user's preferences
    if (targetUserId !== user.id && !['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const validatedData = UpdateNotificationSettingsSchema.parse(settingsData);

    // Update user notification preferences
    if (validatedData.preferences) {
      // Delete existing preferences
      await supabase
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', targetUserId)
        .eq('organization_id', orgId);

      // Insert new preferences
      const preferencesToInsert = validatedData.preferences.map(pref => ({
        user_id: targetUserId,
        organization_id: orgId,
        type: pref.type,
        enabled: pref.enabled,
        frequency: pref.frequency || 'immediate',
        categories: pref.categories || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: prefsError } = await supabase
        .from('user_notification_preferences')
        .insert(preferencesToInsert);

      if (prefsError) {
        console.error('Preferences update error:', prefsError);
        return NextResponse.json({ error: prefsError.message }, { status: 400 });
      }
    }

    // Update global settings (admin/owner only)
    if (validatedData.globalSettings && ['owner', 'admin'].includes(role)) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single();

      const currentSettings = orgData?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...validatedData.globalSettings
        }
      };

      const { error: settingsError } = await supabase
        .from('organizations')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId);

      if (settingsError) {
        console.error('Global settings update error:', settingsError);
        return NextResponse.json({ error: settingsError.message }, { status: 400 });
      }
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.notifications.update',
      resource_type: 'notification_preferences',
      details: { 
        target_user_id: targetUserId,
        updated_preferences: validatedData.preferences?.length || 0,
        updated_global: !!validatedData.globalSettings
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Notification settings updated successfully'
    });

  } catch (error: any) {
    console.error('Notification settings PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'test_notification') {
      // Send a test notification
      const { type, message } = data;

      await supabase.from('notifications').insert({
        user_id: user.id,
        organization_id: orgId,
        type: 'test',
        title: 'Test Notification',
        message: message || 'This is a test notification to verify your settings.',
        created_at: new Date().toISOString()
      });

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.notifications.test',
        resource_type: 'notification',
        details: { notification_type: type },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Test notification sent successfully'
      });
    }

    if (action === 'mark_all_read') {
      // Mark all notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .is('read_at', null);

      if (error) {
        console.error('Mark all read error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'All notifications marked as read'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Notification settings POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    const body = await request.json();
    const { action, userId, notificationId } = body;

    if (action === 'reset_preferences') {
      const targetUserId = userId || user.id;

      // Check permissions
      if (targetUserId !== user.id && !['owner', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Delete all user preferences (will fall back to defaults)
      const { error } = await supabase
        .from('user_notification_preferences')
        .delete()
        .eq('user_id', targetUserId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Reset preferences error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.notifications.reset',
        resource_type: 'notification_preferences',
        details: { target_user_id: targetUserId },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Notification preferences reset to defaults'
      });
    }

    if (action === 'delete_notification' && notificationId) {
      // Delete a specific notification
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true,
        message: 'Notification deleted successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Notification settings DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
