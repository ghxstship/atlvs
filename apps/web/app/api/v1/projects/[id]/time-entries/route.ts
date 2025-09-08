import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@ghxstship/auth';
import { authorize } from '@ghxstship/domain';

const CreateTimeEntrySchema = z.object({
  description: z.string().min(1).max(500),
  duration: z.number().positive(),
  date: z.string(),
  taskId: z.string().uuid().optional(),
  isBillable: z.boolean().default(false),
  hourlyRate: z.number().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

const UpdateTimeEntrySchema = CreateTimeEntrySchema.partial();

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
      'projects:time:read'
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
    const userId = searchParams.get('userId');
    const taskId = searchParams.get('taskId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isBillable = searchParams.get('isBillable');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('project_time_entries')
      .select(`
        *,
        user:user_id(id, email, full_name),
        task:task_id(id, title)
      `)
      .eq('project_id', params.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) query = query.eq('user_id', userId);
    if (taskId) query = query.eq('task_id', taskId);
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    if (isBillable !== null) query = query.eq('is_billable', isBillable === 'true');

    const { data: timeEntries, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
    }

    // Calculate totals
    const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0;
    const billableHours = timeEntries?.filter(entry => entry.is_billable).reduce((sum, entry) => sum + entry.duration, 0) || 0;

    return NextResponse.json({ 
      timeEntries, 
      summary: {
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        totalEntries: timeEntries?.length || 0
      }
    });
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
      'projects:time:write'
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
    const validatedData = CreateTimeEntrySchema.parse(body);

    const timeEntryData = {
      ...validatedData,
      project_id: params.id,
      user_id: user.id,
      task_id: validatedData.taskId,
      is_billable: validatedData.isBillable,
      hourly_rate: validatedData.hourlyRate
    };

    const { data: timeEntry, error } = await supabase
      .from('project_time_entries')
      .insert([timeEntryData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
    }

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
