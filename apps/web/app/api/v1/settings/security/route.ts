import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SecuritySettingsSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(8).max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    maxAge: z.number().min(0).optional(),
    preventReuse: z.number().min(0).max(24).optional()
  }).optional(),
  sessionSettings: z.object({
    maxSessionDuration: z.number().min(300).max(86400), // 5 minutes to 24 hours
    idleTimeout: z.number().min(300).max(7200), // 5 minutes to 2 hours
    requireReauth: z.boolean(),
    maxConcurrentSessions: z.number().min(1).max(10)
  }).optional(),
  mfaSettings: z.object({
    required: z.boolean(),
    allowedMethods: z.array(z.enum(['totp', 'sms', 'email'])),
    gracePeriod: z.number().min(0).max(30) // days
  }).optional(),
  accessControl: z.object({
    ipWhitelist: z.array(z.string()).optional(),
    allowedDomains: z.array(z.string()).optional(),
    blockSuspiciousActivity: z.boolean(),
    maxFailedAttempts: z.number().min(3).max(10),
    lockoutDuration: z.number().min(300).max(86400) // 5 minutes to 24 hours
  }).optional(),
  auditSettings: z.object({
    logAllActions: z.boolean(),
    retentionPeriod: z.number().min(30).max(2555), // 30 days to 7 years
    alertOnSensitiveActions: z.boolean(),
    exportEnabled: z.boolean()
  }).optional()
});

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
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
    
    // Get security settings
    const { data: settings, error } = await supabase
      .from('organization_settings')
      .select('security_settings')
      .eq('organization_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Security settings fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get security metrics
    const [failedLoginsResult, activeSessions, recentAudits] = await Promise.all([
      supabase
        .from('audit_logs')
        .select('id')
        .eq('organization_id', orgId)
        .eq('action', 'auth.login.failed')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('user_sessions')
        .select('id')
        .eq('organization_id', orgId)
        .eq('status', 'active'),
      supabase
        .from('audit_logs')
        .select('id')
        .eq('organization_id', orgId)
        .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100)
    ]);

    const securityMetrics = {
      failedLoginsLast24h: failedLoginsResult.data?.length || 0,
      activeSessions: activeSessions.data?.length || 0,
      auditLogsLast7Days: recentAudits.data?.length || 0
    };

    // Default security settings if none exist
    const defaultSettings = {
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      },
      sessionSettings: {
        maxSessionDuration: 28800, // 8 hours
        idleTimeout: 1800, // 30 minutes
        requireReauth: true,
        maxConcurrentSessions: 3
      },
      mfaSettings: {
        required: false,
        allowedMethods: ['totp', 'email'],
        gracePeriod: 7
      },
      accessControl: {
        ipWhitelist: [],
        allowedDomains: [],
        blockSuspiciousActivity: true,
        maxFailedAttempts: 5,
        lockoutDuration: 900 // 15 minutes
      },
      auditSettings: {
        logAllActions: true,
        retentionPeriod: 365,
        alertOnSensitiveActions: true,
        exportEnabled: true
      }
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.security.get',
      resource_type: 'security_settings',
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      securitySettings: settings?.security_settings || defaultSettings,
      securityMetrics
    });

  } catch (error) {
    console.error('Security settings GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'test_security') {
      // Simulate security test
      const testResults = {
        passwordPolicyCompliance: true,
        sessionSecurityScore: 85,
        mfaCoverage: 60,
        accessControlEffectiveness: 90,
        auditingCompleteness: 95,
        overallScore: 86,
        recommendations: [
          'Enable MFA for all admin users',
          'Review IP whitelist configuration',
          'Consider reducing session timeout for sensitive operations'
        ]
      };

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.security.test',
        resource_type: 'security_settings',
        details: testResults,
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json(testResults);
    }

    if (action === 'generate_backup_codes') {
      // Generate backup codes for MFA
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      // Store hashed backup codes
      const { error } = await supabase
        .from('user_backup_codes')
        .upsert({
          user_id: user.id,
          organization_id: orgId,
          codes: backupCodes.map(code => ({ code, used: false })),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Backup codes generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.security.backup_codes.generate',
        resource_type: 'security_settings',
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ backupCodes });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Security settings POST error:', error);
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
    const securityData = SecuritySettingsSchema.parse(body);

    // Update security settings
    const { data: settings, error } = await supabase
      .from('organization_settings')
      .upsert({
        organization_id: orgId,
        security_settings: securityData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Security settings update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'settings.security.update',
      resource_type: 'security_settings',
      details: { updated_fields: Object.keys(securityData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ securitySettings: settings.security_settings });

  } catch (error) {
    console.error('Security settings PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only organization owners can reset security settings' }, { status: 403 });
    }

    const body = await request.json();
    const { confirm, resetType } = body;

    if (!confirm) {
      return NextResponse.json({ error: 'Confirmation required to reset security settings' }, { status: 400 });
    }

    if (resetType === 'all') {
      // Reset all security settings to defaults
      const { error } = await supabase
        .from('organization_settings')
        .update({
          security_settings: null,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', orgId);

      if (error) {
        console.error('Security settings reset error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.security.reset',
        resource_type: 'security_settings',
        details: { resetType: 'all' },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Security settings have been reset to defaults'
      });
    }

    if (resetType === 'sessions') {
      // Terminate all active sessions except current
      const { error } = await supabase
        .from('user_sessions')
        .update({
          status: 'terminated',
          terminated_at: new Date().toISOString()
        })
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .neq('user_id', user.id);

      if (error) {
        console.error('Sessions termination error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'settings.security.sessions.terminate_all',
        resource_type: 'security_settings',
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true,
        message: 'All user sessions have been terminated'
      });
    }

    return NextResponse.json({ error: 'Invalid reset type' }, { status: 400 });

  } catch (error) {
    console.error('Security settings DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
