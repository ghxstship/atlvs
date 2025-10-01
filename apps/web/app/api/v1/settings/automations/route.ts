import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  triggerType: z.string(),
  triggerConfig: z.record(z.unknown()),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown(),
    logic: z.enum(['AND', 'OR']).optional()
  })).optional(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.unknown()),
    order: z.number()
  })).min(1),
  isActive: z.boolean().default(true)
});

const UpdateAutomationRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  triggerType: z.string().optional(),
  triggerConfig: z.record(z.unknown()).optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.unknown(),
    logic: z.enum(['AND', 'OR']).optional()
  })).optional(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.unknown()),
    order: z.number()
  })).optional(),
  isActive: z.boolean().optional()
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
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can view automation rules
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const triggerType = searchParams.get('triggerType');

    let query = supabase
      .from('automation_rules')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (triggerType) {
      query = query.eq('trigger_type', triggerType);
    }

    const { data: rules, error } = await query;

    if (error) {
      console.error('Automation rules fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'automations.list',
      resource_type: 'automation_rule',
      details: { count: rules?.length || 0 },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      automationRules: rules?.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        triggerType: rule.trigger_type,
        triggerConfig: rule.trigger_config,
        conditions: rule.conditions,
        actions: rule.actions,
        isActive: rule.is_active,
        runCount: rule.run_count,
        lastRunAt: rule.last_run_at,
        createdAt: rule.created_at,
        updatedAt: rule.updated_at
      }))
    });

  } catch (err: unknown) {
    console.error('Automation rules GET error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can create automation rules
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const ruleData = CreateAutomationRuleSchema.parse(body);

    // Create automation rule
    const { data: rule, error } = await supabase
      .from('automation_rules')
      .insert({
        organization_id: orgId,
        name: ruleData.name,
        description: ruleData.description,
        trigger_type: ruleData.triggerType,
        trigger_config: ruleData.triggerConfig,
        conditions: ruleData.conditions || [],
        actions: ruleData.actions,
        is_active: ruleData.isActive,
        run_count: 0,
        created_at: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Automation rule creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'automation.created',
      resource_type: 'automation_rule',
      resource_id: rule.id,
      details: { 
        name: ruleData.name,
        triggerType: ruleData.triggerType,
        actionsCount: ruleData.actions.length
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      automationRule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        triggerType: rule.trigger_type,
        triggerConfig: rule.trigger_config,
        conditions: rule.conditions,
        actions: rule.actions,
        isActive: rule.is_active,
        createdAt: rule.created_at
      }
    });

  } catch (err: unknown) {
    console.error('Automation rule POST error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can update automation rules
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json({ error: 'Automation rule ID required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = UpdateAutomationRuleSchema.parse(body);

    // Verify the rule belongs to the organization
    const { data: existingRule } = await supabase
      .from('automation_rules')
      .select('organization_id')
      .eq('id', ruleId)
      .single();

    if (!existingRule || existingRule.organization_id !== orgId) {
      return NextResponse.json({ error: 'Automation rule not found' }, { status: 404 });
    }

    // Update the automation rule
    const updateFields: Record<string, unknown> = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.triggerType !== undefined) updateFields.trigger_type = updateData.triggerType;
    if (updateData.triggerConfig !== undefined) updateFields.trigger_config = updateData.triggerConfig;
    if (updateData.conditions !== undefined) updateFields.conditions = updateData.conditions;
    if (updateData.actions !== undefined) updateFields.actions = updateData.actions;
    if (updateData.isActive !== undefined) updateFields.is_active = updateData.isActive;
    updateFields.updated_at = new Date().toISOString();

    const { data: updatedRule, error } = await supabase
      .from('automation_rules')
      .update(updateFields)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      console.error('Automation rule update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'automation.updated',
      resource_type: 'automation_rule',
      resource_id: ruleId,
      details: { changes: updateData },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      automationRule: {
        id: updatedRule.id,
        name: updatedRule.name,
        description: updatedRule.description,
        triggerType: updatedRule.trigger_type,
        triggerConfig: updatedRule.trigger_config,
        conditions: updatedRule.conditions,
        actions: updatedRule.actions,
        isActive: updatedRule.is_active,
        updatedAt: updatedRule.updated_at
      }
    });

  } catch (err: unknown) {
    console.error('Automation rule PUT error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    // Only admins and owners can delete automation rules
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json({ error: 'Automation rule ID required' }, { status: 400 });
    }

    // Verify the rule belongs to the organization
    const { data: existingRule } = await supabase
      .from('automation_rules')
      .select('organization_id, name')
      .eq('id', ruleId)
      .single();

    if (!existingRule || existingRule.organization_id !== orgId) {
      return NextResponse.json({ error: 'Automation rule not found' }, { status: 404 });
    }

    // Delete the automation rule
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      console.error('Automation rule delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'automation.deleted',
      resource_type: 'automation_rule',
      resource_id: ruleId,
      details: { name: existingRule.name },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      message: 'Automation rule deleted successfully'
    });

  } catch (err: unknown) {
    console.error('Automation rule DELETE error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
