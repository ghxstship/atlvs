import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authorize } from '@ghxstship/domain';

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  type: z.enum(['internal', 'client', 'maintenance', 'research', 'development']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  budget: z.number().optional(),
  budgetCurrency: z.string().length(3).optional(),
  actualCost: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  clientId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  teamMembers: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  visibility: z.enum(['public', 'private', 'team', 'client']).optional(),
  isArchived: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
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
      'projects:read'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        manager:manager_id(id, email, full_name),
        client:client_id(id, name),
        tasks:project_tasks(
          id, title, status, priority, assignee_id, due_date, progress,
          assignee:assignee_id(id, email, full_name)
        ),
        milestones:project_milestones(
          id, title, due_date, status, progress
        ),
        risks:project_risks(
          id, title, category, probability, impact, risk_score, status
        ),
        files:project_files(
          id, name, category, file_size, created_at
        ),
        inspections:project_inspections(
          id, title, type, status, scheduled_date, inspector_id
        ),
        activations:project_activations(
          id, title, type, status, scheduled_date
        ),
        time_entries:project_time_entries(
          id, duration, is_billable, created_at, user_id
        )
      `)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
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
      'projects:write'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = UpdateProjectSchema.parse(body);

    const updateData = {
      ...validatedData,
      start_date: validatedData.startDate,
      end_date: validatedData.endDate,
      actual_start_date: validatedData.actualStartDate,
      actual_end_date: validatedData.actualEndDate,
      budget_currency: validatedData.budgetCurrency,
      actual_cost: validatedData.actualCost,
      client_id: validatedData.clientId,
      manager_id: validatedData.managerId,
      team_members: validatedData.teamMembers,
      is_archived: validatedData.isArchived,
      updated_by: user.id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
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
      'projects:delete'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
