import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: { id: string } };

const policyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  conditions: z.record(z.unknown()).optional(),
  approval_steps: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        step: z.number().int().min(1),
        approver_id: z.string().uuid(),
        metadata: z.record(z.unknown()).optional()
      })
    )
    .optional(),
  is_active: z.boolean().optional()
});

const POLICY_COLUMNS =
  'id, organization_id, name, description, conditions, approval_steps, is_active, created_at, updated_at';

async function resolveRequestContext(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }

  const organizationId = request.headers.get('x-organization-id');
  if (!organizationId) {
    return { error: NextResponse.json({ error: 'Organization ID required' }, { status: 400 }) } as const;
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership) {
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) } as const;
  }

  return { supabase, organizationId, user, role: membership.role } as const;
}

async function loadPolicy(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  policyId: string,
) {
  const { data, error } = await supabase
    .from('procurement_approval_policies')
    .select(POLICY_COLUMNS)
    .eq('organization_id', organizationId)
    .eq('id', policyId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await resolveRequestContext(request);
    if ('error' in context) return context.error;

    const { supabase, organizationId } = context;
    const policy = await loadPolicy(supabase, organizationId, params.id);

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const [{ data: history }, { data: templates }] = await Promise.all([
      supabase
        .from('procurement_approval_policy_history')
        .select('*')
        .eq('policy_id', params.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('procurement_approval_policy_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      policy,
      history: history ?? [],
      templates: templates ?? []
    });
  } catch (error) {
    console.error('Error in GET /api/v1/procurement/approvals/policies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await resolveRequestContext(request);
    if ('error' in context) return context.error;

    const { supabase, organizationId, role } = context;
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions to update policies' }, { status: 403 });
    }

    const existingPolicy = await loadPolicy(supabase, organizationId, params.id);
    if (!existingPolicy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const payload = policyUpdateSchema.parse(await request.json());

    if (payload.approval_steps) {
      const ordered = [...payload.approval_steps].sort((a, b) => a.step - b.step);
      ordered.forEach((step, index) => {
        if (step.step !== index + 1) {
          throw new Error('Approval steps must be sequential starting from 1');
        }
      });
    }

    const { data, error } = await supabase
      .from('procurement_approval_policies')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('id', params.id)
      .select(POLICY_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error('Error updating policy:', error);
      return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
    }

    return NextResponse.json({ policy: data, message: 'Policy updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('sequential')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Error in PATCH /api/v1/procurement/approvals/policies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const context = await resolveRequestContext(request);
    if ('error' in context) return context.error;

    const { supabase, organizationId, role } = context;
    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions to delete policies' }, { status: 403 });
    }

    const policy = await loadPolicy(supabase, organizationId, params.id);
    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('procurement_approval_policies')
      .delete()
      .eq('organization_id', organizationId)
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting policy:', error);
      return NextResponse.json({ error: 'Failed to delete policy' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/v1/procurement/approvals/policies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
