import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authorize } from '@ghxstship/domain';

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  type: z.enum(['task', 'bug', 'feature', 'improvement', 'research']).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  parentTaskId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
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
      'projects:tasks:read'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: task, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        project:project_id!inner(id, organization_id),
        assignee:assignee_id(id, email, full_name),
        milestone:milestone_id(id, title),
        parent_task:parent_task_id(id, title),
        subtasks:project_tasks!parent_task_id(id, title, status, progress),
        comments:task_comments(
          id, content, created_at, created_by,
          author:created_by(id, email, full_name)
        )
      `)
      .eq('id', params.taskId)
      .eq('project_id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }

    // Verify organization access
    if (task.project.organization_id !== orgId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
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
      'projects:tasks:write'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = UpdateTaskSchema.parse(body);

    const updateData = {
      ...validatedData,
      assignee_id: validatedData.assigneeId,
      due_date: validatedData.dueDate,
      estimated_hours: validatedData.estimatedHours,
      actual_hours: validatedData.actualHours,
      parent_task_id: validatedData.parentTaskId,
      milestone_id: validatedData.milestoneId,
      updated_by: user.id
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });

    const { data: task, error } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', params.taskId)
      .eq('project_id', params.id)
      .select(`
        *,
        project:project_id!inner(organization_id)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Verify organization access
    if (task.project.organization_id !== orgId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ task });
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
  { params }: { params: { id: string; taskId: string } }
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
      'projects:tasks:delete'
    );

    if (authResult === 'deny') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify task exists and belongs to project in organization
    const { data: task } = await supabase
      .from('project_tasks')
      .select(`
        id,
        project:project_id!inner(organization_id)
      `)
      .eq('id', params.taskId)
      .eq('project_id', params.id)
      .single();

    if (!task || (task.project as any).organization_id !== orgId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', params.taskId)
      .eq('project_id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
