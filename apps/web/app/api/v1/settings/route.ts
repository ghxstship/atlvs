import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UpdateSettingsSchema = z.object({
  general: z.object({
    organizationName: z.string().min(1).optional(),
    timeZone: z.string().optional(),
    dateFormat: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    fiscalYearStart: z.string().optional()
  }).optional(),
  branding: z.object({
    logo: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    customCss: z.string().optional()
  }).optional(),
  features: z.object({
    enableProjects: z.boolean().optional(),
    enableJobs: z.boolean().optional(),
    enableMarketplace: z.boolean().optional(),
    enableFinance: z.boolean().optional(),
    enableReporting: z.boolean().optional(),
    enableIntegrations: z.boolean().optional()
  }).optional(),
  permissions: z.object({
    defaultUserRole: z.enum(['member', 'manager', 'admin']).optional(),
    allowSelfRegistration: z.boolean().optional(),
    requireEmailVerification: z.boolean().optional(),
    passwordPolicy: z.object({
      minLength: z.number().min(6).max(128).optional(),
      requireUppercase: z.boolean().optional(),
      requireLowercase: z.boolean().optional(),
      requireNumbers: z.boolean().optional(),
      requireSymbols: z.boolean().optional(),
      maxAge: z.number().optional() // in days
    }).optional()
  }).optional(),
  notifications: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    defaultChannels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).optional(),
    digestFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).optional()
  }).optional(),
  integrations: z.object({
    webhooksEnabled: z.boolean().optional(),
    apiRateLimit: z.number().positive().optional(),
    allowedDomains: z.array(z.string()).optional(),
    ssoEnabled: z.boolean().optional(),
    ssoProvider: z.string().optional()
  }).optional(),
  compliance: z.object({
    dataRetentionDays: z.number().positive().optional(),
    auditLogRetentionDays: z.number().positive().optional(),
    requireDataProcessingConsent: z.boolean().optional(),
    enableGDPRCompliance: z.boolean().optional(),
    enableSOXCompliance: z.boolean().optional()
  }).optional(),
  backup: z.object({
    autoBackupEnabled: z.boolean().optional(),
    backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    retentionPeriod: z.number().positive().optional(), // in days
    includeFiles: z.boolean().optional()
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
    const category = searchParams.get('category');

    // Get organization settings
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('settings, created_at, updated_at')
      .eq('id', orgId)
      .single();

    if (error) {
      console.error('Settings fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const settings = organization.settings || {};

    // Default settings structure
    const defaultSettings = {
      general: {
        organizationName: '',
        timeZone: 'UTC',
        dateFormat: 'MM/dd/yyyy',
        currency: 'USD',
        language: 'en',
        fiscalYearStart: '01-01'
      },
      branding: {
        logo: null,
        primaryColor: '#1f2937',
        secondaryColor: 'hsl(var(--primary))',
        customCss: null
      },
      features: {
        enableProjects: true,
        enableJobs: true,
        enableMarketplace: true,
        enableFinance: true,
        enableReporting: true,
        enableIntegrations: true
      },
      permissions: {
        defaultUserRole: 'member',
        allowSelfRegistration: false,
        requireEmailVerification: true,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: false,
          maxAge: 90
        }
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        defaultChannels: ['email', 'in_app'],
        digestFrequency: 'daily'
      },
      integrations: {
        webhooksEnabled: true,
        apiRateLimit: 1000,
        allowedDomains: [],
        ssoEnabled: false,
        ssoProvider: null
      },
      compliance: {
        dataRetentionDays: 2555, // 7 years
        auditLogRetentionDays: 365,
        requireDataProcessingConsent: false,
        enableGDPRCompliance: false,
        enableSOXCompliance: false
      },
      backup: {
        autoBackupEnabled: true,
        backupFrequency: 'daily',
        retentionPeriod: 30,
        includeFiles: false
      }
    };

    // Merge with defaults
    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      general: { ...defaultSettings.general, ...settings.general },
      branding: { ...defaultSettings.branding, ...settings.branding },
      features: { ...defaultSettings.features, ...settings.features },
      permissions: { 
        ...defaultSettings.permissions, 
        ...settings.permissions,
        passwordPolicy: { 
          ...defaultSettings.permissions.passwordPolicy, 
          ...settings.permissions?.passwordPolicy 
        }
      },
      notifications: { ...defaultSettings.notifications, ...settings.notifications },
      integrations: { ...defaultSettings.integrations, ...settings.integrations },
      compliance: { ...defaultSettings.compliance, ...settings.compliance },
      backup: { ...defaultSettings.backup, ...settings.backup }
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.get',
      resource_type: 'settings',
      details: { category },
      occurred_at: new Date().toISOString()
    });

    // Return specific category if requested
    if (category && mergedSettings[category as keyof typeof mergedSettings]) {
      return NextResponse.json({ 
        [category]: mergedSettings[category as keyof typeof mergedSettings],
        lastUpdated: organization.updated_at
      });
    }

    return NextResponse.json({ 
      settings: mergedSettings,
      lastUpdated: organization.updated_at
    });

  } catch (error) {
    console.error('Settings GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const settingsData = UpdateSettingsSchema.parse(body);

    // Get current settings
    const { data: organization } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', orgId)
      .single();

    const currentSettings = organization?.settings || {};

    // Deep merge settings
    const updatedSettings = {
      ...currentSettings,
      ...settingsData,
      general: { ...currentSettings.general, ...settingsData.general },
      branding: { ...currentSettings.branding, ...settingsData.branding },
      features: { ...currentSettings.features, ...settingsData.features },
      permissions: { 
        ...currentSettings.permissions, 
        ...settingsData.permissions,
        passwordPolicy: { 
          ...currentSettings.permissions?.passwordPolicy, 
          ...settingsData.permissions?.passwordPolicy 
        }
      },
      notifications: { ...currentSettings.notifications, ...settingsData.notifications },
      integrations: { ...currentSettings.integrations, ...settingsData.integrations },
      compliance: { ...currentSettings.compliance, ...settingsData.compliance },
      backup: { ...currentSettings.backup, ...settingsData.backup }
    };

    // Update organization settings
    const { data: updatedOrg, error } = await supabase
      .from('organizations')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)
      .select('settings, updated_at')
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log specific changes
    const changedCategories = Object.keys(settingsData);
    
    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.update',
      resource_type: 'settings',
      details: { 
        updated_categories: changedCategories,
        changes: settingsData
      },
      occurred_at: new Date().toISOString()
    });

    // Send notification for critical changes
    const criticalChanges = ['permissions', 'compliance', 'integrations'];
    const hasCriticalChanges = changedCategories.some(cat => criticalChanges.includes(cat));
    
    if (hasCriticalChanges) {
      // Notify other admins/owners
      const { data: admins } = await supabase
        .from('memberships')
        .select('user:users(id, email, name)')
        .eq('organization_id', orgId)
        .in('role', ['owner', 'admin'])
        .eq('status', 'active')
        .neq('user_id', user.id);

      if (admins) {
        const notifications = admins.map((admin: any) => ({
          user_id: admin.user.id,
          organization_id: orgId,
          type: 'settings_changed',
          title: 'Critical Settings Updated',
          message: `Organization settings have been updated by ${user.email}. Categories: ${changedCategories.join(', ')}`,
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    return NextResponse.json({ 
      settings: updatedOrg.settings,
      lastUpdated: updatedOrg.updated_at
    });

  } catch (error) {
    console.error('Settings PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Reset settings to defaults
export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner'].includes(role)) {
      return NextResponse.json({ error: 'Only organization owners can reset settings' }, { status: 403 });
    }

    const body = await request.json();
    const { category, confirm } = body;

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required to reset settings' }, { status: 400 });
    }

    let updateData = {};

    if (category) {
      // Reset specific category
      const { data: organization } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', orgId)
        .single();

      const currentSettings = organization?.settings || {};
      delete currentSettings[category];
      updateData.settings = currentSettings;
    } else {
      // Reset all settings
      updateData.settings = {};
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', orgId);

    if (error) {
      console.error('Settings reset error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.reset',
      resource_type: 'settings',
      details: { category: category || 'all' },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: category ? `${category} settings reset to defaults` : 'All settings reset to defaults'
    });

  } catch (error) {
    console.error('Settings DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
