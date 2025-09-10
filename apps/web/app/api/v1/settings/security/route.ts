import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SecuritySettingSchema = z.object({
  twoFactorRequired: z.boolean().default(false),
  passwordMinLength: z.number().min(8).max(128).default(12),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireLowercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSymbols: z.boolean().default(false),
  sessionTimeoutMinutes: z.number().min(15).max(43200).default(480), // 8 hours
  maxLoginAttempts: z.number().min(3).max(20).default(5),
  lockoutDurationMinutes: z.number().min(5).max(1440).default(15),
  allowedIpRanges: z.array(z.string()).optional(),
  ssoEnabled: z.boolean().default(false),
  ssoProvider: z.string().optional(),
  ssoConfig: z.record(z.any()).optional(),
  auditLogRetentionDays: z.number().min(30).max(2555).default(365), // 1 year
  dataRetentionDays: z.number().min(30).max(2555).default(2555), // 7 years
  encryptionEnabled: z.boolean().default(true),
  backupEnabled: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily')
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
  return Sentry.startSpan({ name: 'settings.security.get' }, async () => {
    const { sb } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: securitySettings, error } = await sb
      .from('security_settings')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching security settings:', error);
      return NextResponse.json({ error: 'Failed to fetch security settings' }, { status: 500 });
    }

    return NextResponse.json({ securitySettings: securitySettings }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.security.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = SecuritySettingSchema.parse(body);

      const { data: securitySettings, error } = await sb
        .from('security_settings')
        .insert({
          organization_id: ctx.organizationId,
          two_factor_required: validatedData.twoFactorRequired,
          password_min_length: validatedData.passwordMinLength,
          password_require_uppercase: validatedData.passwordRequireUppercase,
          password_require_lowercase: validatedData.passwordRequireLowercase,
          password_require_numbers: validatedData.passwordRequireNumbers,
          password_require_symbols: validatedData.passwordRequireSymbols,
          session_timeout_minutes: validatedData.sessionTimeoutMinutes,
          max_login_attempts: validatedData.maxLoginAttempts,
          lockout_duration_minutes: validatedData.lockoutDurationMinutes,
          allowed_ip_ranges: validatedData.allowedIpRanges,
          sso_enabled: validatedData.ssoEnabled,
          sso_provider: validatedData.ssoProvider,
          sso_config: validatedData.ssoConfig,
          audit_log_retention_days: validatedData.auditLogRetentionDays,
          data_retention_days: validatedData.dataRetentionDays,
          encryption_enabled: validatedData.encryptionEnabled,
          backup_enabled: validatedData.backupEnabled,
          backup_frequency: validatedData.backupFrequency
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating security settings:', error);
        return NextResponse.json({ error: 'Failed to create security settings' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'security_settings', id: securitySettings.id },
        meta: { twoFactorRequired: validatedData.twoFactorRequired, ssoEnabled: validatedData.ssoEnabled }
      });

      return NextResponse.json({ securitySettings }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating security settings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.security.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = SecuritySettingSchema.partial().parse(body);

      const updateData: any = {};
      if (validatedData.twoFactorRequired !== undefined) updateData.two_factor_required = validatedData.twoFactorRequired;
      if (validatedData.passwordMinLength !== undefined) updateData.password_min_length = validatedData.passwordMinLength;
      if (validatedData.passwordRequireUppercase !== undefined) updateData.password_require_uppercase = validatedData.passwordRequireUppercase;
      if (validatedData.passwordRequireLowercase !== undefined) updateData.password_require_lowercase = validatedData.passwordRequireLowercase;
      if (validatedData.passwordRequireNumbers !== undefined) updateData.password_require_numbers = validatedData.passwordRequireNumbers;
      if (validatedData.passwordRequireSymbols !== undefined) updateData.password_require_symbols = validatedData.passwordRequireSymbols;
      if (validatedData.sessionTimeoutMinutes !== undefined) updateData.session_timeout_minutes = validatedData.sessionTimeoutMinutes;
      if (validatedData.maxLoginAttempts !== undefined) updateData.max_login_attempts = validatedData.maxLoginAttempts;
      if (validatedData.lockoutDurationMinutes !== undefined) updateData.lockout_duration_minutes = validatedData.lockoutDurationMinutes;
      if (validatedData.allowedIpRanges !== undefined) updateData.allowed_ip_ranges = validatedData.allowedIpRanges;
      if (validatedData.ssoEnabled !== undefined) updateData.sso_enabled = validatedData.ssoEnabled;
      if (validatedData.ssoProvider !== undefined) updateData.sso_provider = validatedData.ssoProvider;
      if (validatedData.ssoConfig !== undefined) updateData.sso_config = validatedData.ssoConfig;
      if (validatedData.auditLogRetentionDays !== undefined) updateData.audit_log_retention_days = validatedData.auditLogRetentionDays;
      if (validatedData.dataRetentionDays !== undefined) updateData.data_retention_days = validatedData.dataRetentionDays;
      if (validatedData.encryptionEnabled !== undefined) updateData.encryption_enabled = validatedData.encryptionEnabled;
      if (validatedData.backupEnabled !== undefined) updateData.backup_enabled = validatedData.backupEnabled;
      if (validatedData.backupFrequency !== undefined) updateData.backup_frequency = validatedData.backupFrequency;

      const { data: securitySettings, error } = await sb
        .from('security_settings')
        .update(updateData)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating security settings:', error);
        return NextResponse.json({ error: 'Failed to update security settings' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'security_settings', id: securitySettings.id },
        meta: validatedData
      });

      return NextResponse.json({ securitySettings }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating security settings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
