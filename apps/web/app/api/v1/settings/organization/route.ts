import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAndServices } from '../../../../../lib/services';
import type { TenantContext } from '@ghxstship/domain';
import { authorize } from '@ghxstship/domain';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const OrganizationSettingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  currency: z.string().default('USD'),
  dateFormat: z.string().default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  weekStartsOn: z.enum(['sunday', 'monday']).default('sunday'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().optional()
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
  return Sentry.startSpan({ name: 'settings.organization.get' }, async () => {
    const { sb } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    const { data: orgSettings, error } = await sb
      .from('organization_settings')
      .select('*')
      .eq('organization_id', ctx.organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching organization settings:', error);
      return NextResponse.json({ error: 'Failed to fetch organization settings' }, { status: 500 });
    }

    return NextResponse.json({ organizationSettings: orgSettings }, { status: 200 });
  });
}

export async function POST(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.organization.create' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = OrganizationSettingSchema.parse(body);

      const { data: orgSettings, error } = await sb
        .from('organization_settings')
        .insert({
          organization_id: ctx.organizationId,
          ...validatedData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating organization settings:', error);
        return NextResponse.json({ error: 'Failed to create organization settings' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'create',
        entity: { type: 'organization_settings', id: orgSettings.id },
        meta: { name: orgSettings.name, displayName: orgSettings.display_name }
      });

      return NextResponse.json({ organizationSettings: orgSettings }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error creating organization settings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}

export async function PUT(request: NextRequest) {
  return Sentry.startSpan({ name: 'settings.organization.update' }, async () => {
    const { sb, audit } = getSupabaseAndServices();
    const { data } = await sb.auth.getUser();
    const userId = data.user?.id;
    const ctx = getTenantContextFromRequest(request, userId);

    if (authorize({ userId: ctx.userId, organizationId: ctx.organizationId, roles: ctx.roles }, 'settings:manage') === 'deny') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      const body = await request.json();
      const validatedData = OrganizationSettingSchema.partial().parse(body);

      const { data: orgSettings, error } = await sb
        .from('organization_settings')
        .update(validatedData)
        .eq('organization_id', ctx.organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating organization settings:', error);
        return NextResponse.json({ error: 'Failed to update organization settings' }, { status: 500 });
      }

      // Audit log
      await audit.record({
        occurredAt: new Date().toISOString(),
        actor: { userId: ctx.userId },
        tenant: { organizationId: ctx.organizationId },
        action: 'update',
        entity: { type: 'organization_settings', id: orgSettings.id },
        meta: validatedData
      });

      return NextResponse.json({ organizationSettings: orgSettings }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
      }
      console.error('Error updating organization settings:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
}
