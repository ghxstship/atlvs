import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@ghxstship/auth';
import { authorize } from '@ghxstship/domain';

const CreateActivationSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['deployment', 'go_live', 'cutover', 'rollback', 'maintenance', 'upgrade']),
  status: z.enum(['planned', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled']).default('planned'),
  scheduledDate: z.string(),
  completedDate: z.string().optional(),
  duration: z.number().optional(),
  responsibleId: z.string().uuid().optional(),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.string().optional(),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(['pending', 'completed', 'failed', 'skipped']).default('pending'),
    notes: z.string().optional()
  })).default([]),
  rollbackPlan: z.string().optional(),
  successCriteria: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

const UpdateActivationSchema = CreateActivationSchema.partial();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const authResult = authorize(
      { userId: user.id, organizationId: orgId, roles: [membership.role] },
      'projects:activations:read'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify project exists and user has access
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const responsibleId = searchParams.get('responsibleId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('project_activations')
      .select(`
        *,
        responsible:responsible_id(id, email, full_name),
        approver:approved_by(id, email, full_name)
      `)
      .eq('project_id', params.id)
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (responsibleId) query = query.eq('responsible_id', responsibleId);

    const { data: activations, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch activations' }, { status: 500 });
    }

    return NextResponse.json({ activations });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = request.headers.get('x-organization-id');
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const authResult = authorize(
      { userId: user.id, organizationId: orgId, roles: [membership.role] },
      'projects:activations:write'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify project exists and user has access
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = CreateActivationSchema.parse(body);

    const activationData = {
      ...validatedData,
      project_id: params.id,
      scheduled_date: validatedData.scheduledDate,
      completed_date: validatedData.completedDate,
      responsible_id: validatedData.responsibleId,
      approved_by: validatedData.approvedBy,
      approved_at: validatedData.approvedAt,
      rollback_plan: validatedData.rollbackPlan,
      success_criteria: validatedData.successCriteria,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: activation, error } = await supabase
      .from('project_activations')
      .insert([activationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create activation' }, { status: 500 });
    }

    return NextResponse.json({ activation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
