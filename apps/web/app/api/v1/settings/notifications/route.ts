import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NotificationSettingSchema = z.object({
  userId: z.string().optional(),
  emailEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  pushEnabled: z.boolean().default(true),
  slackEnabled: z.boolean().default(false),
  teamsEnabled: z.boolean().default(false),
  webhookEnabled: z.boolean().default(false),
  emailFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  weekendNotifications: z.boolean().default(true),
  notificationTypes: z.object({
    projectUpdates: z.boolean().default(true),
    taskAssignments: z.boolean().default(true),
    deadlineReminders: z.boolean().default(true),
    budgetAlerts: z.boolean().default(true),
    securityAlerts: z.boolean().default(true),
    systemMaintenance: z.boolean().default(true),
    invoiceReminders: z.boolean().default(true),
    paymentConfirmations: z.boolean().default(true)
  }).default({})
});

function getTenantContextFromRequest(req: NextRequest, userId?: string): TenantContext {
  const organizationId = req.headers.get('x-org-id') || '';
  const projectId = req.headers.get('x-project-id') || undefined;
  const rolesHeader = req.headers.get('x-roles');
  const roles = rolesHeader ? (rolesHeader.split(',').map((r) => r.trim()) as any) : [];
  if (!organizationId) throw new Error('Missing x-org-id header');
  if (!userId) throw new Error('Unauthenticated');
  return { organizationId, projectId, userId, roles };
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.notifications.list' }, async () => {
    const { sb } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userId');

    let query = sb
      .from('notification_settings')
      .select('*')
      .eq('organization_id', ctx.organizationId);

    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: notificationSettings, error } = await query;

    if (error) {
      console.error('Error fetching notification settings:', error);
      return NextResponse.json({ error: 'Failed to fetch notification settings' }, { status: 500 });
    }

    return NextResponse.json({ notificationSettings: notificationSettings || [] }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.notifications.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    try {
      const body = await request.json();
      const validatedData = NotificationSettingSchema.parse(body);

      const { data: notificationSetting, error } = await sb
        .from('notification_settings')
        .insert({
          organization_id: ctx.organizationId,
          user_id: validatedData.userId || null,
          email_enabled: validatedData.emailEnabled,
          sms_enabled: validatedData.smsEnabled,
          push_enabled: validatedData.pushEnabled,
          slack_enabled: validatedData.slackEnabled,
          teams_enabled: validatedData.teamsEnabled,
          webhook_enabled: validatedData.webhookEnabled,
          email_frequency: validatedData.emailFrequency,
          quiet_hours_start: validatedData.quietHoursStart,
          quiet_hours_end: validatedData.quietHoursEnd,
          weekend_notifications: validatedData.weekendNotifications,
          notification_types: validatedData.notificationTypes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification setting:', error);
        return NextResponse.json({ error: 'Failed to create notification setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'notification_setting', id: notificationSetting.id },
        meta: { userId: validatedData.userId, emailEnabled: validatedData.emailEnabled }
      });

      return NextResponse.json({ notificationSetting }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating notification setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.notifications.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    try {
      const body = await request.json();
      const { id, ...updateData } = body;
      
      if (!id) {
        return NextResponse.json({ error: 'Notification setting ID is required' }, { status: 400 });
      }

      const validatedData = NotificationSettingSchema.partial().parse(updateData);

      const updateFields: any = {};
      if (validatedData.emailEnabled !== undefined) updateFields.email_enabled = validatedData.emailEnabled;
      if (validatedData.smsEnabled !== undefined) updateFields.sms_enabled = validatedData.smsEnabled;
      if (validatedData.pushEnabled !== undefined) updateFields.push_enabled = validatedData.pushEnabled;
      if (validatedData.slackEnabled !== undefined) updateFields.slack_enabled = validatedData.slackEnabled;
      if (validatedData.teamsEnabled !== undefined) updateFields.teams_enabled = validatedData.teamsEnabled;
      if (validatedData.webhookEnabled !== undefined) updateFields.webhook_enabled = validatedData.webhookEnabled;
      if (validatedData.emailFrequency !== undefined) updateFields.email_frequency = validatedData.emailFrequency;
      if (validatedData.quietHoursStart !== undefined) updateFields.quiet_hours_start = validatedData.quietHoursStart;
      if (validatedData.quietHoursEnd !== undefined) updateFields.quiet_hours_end = validatedData.quietHoursEnd;
      if (validatedData.weekendNotifications !== undefined) updateFields.weekend_notifications = validatedData.weekendNotifications;
      if (validatedData.notificationTypes !== undefined) updateFields.notification_types = validatedData.notificationTypes;

      const { data: notificationSetting, error } = await sb
        .from('notification_settings')
        .update(updateFields)
        .eq('id', id)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification setting:', error);
        return NextResponse.json({ error: 'Failed to update notification setting' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'notification_setting', id: notificationSetting.id },
        meta: validatedData
      });

      return NextResponse.json({ notificationSetting }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating notification setting:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function DELETE(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.notifications.delete' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification setting ID is required' }, { status: 400 });
    }

    const { error } = await sb
      .from('notification_settings')
      .delete()
      .eq('id', id)
      .eq('organization_id', ctx.organizationId);

    if (error) {
      console.error('Error deleting notification setting:', error);
      return NextResponse.json({ error: 'Failed to delete notification setting' }, { status: 500 });
    }

    // Audit log
    await audit.record({
      occurredAt: new Date().toISOString(),
      actor: { userId: ctx.userId },
      tenant: { organizationId: ctx.organizationId },
      action: 'delete',
      entity: { type: 'notification_setting', id },
      meta: {}
    });

    return NextResponse.json({ success: true }, { status: 200 });
  });
}
