import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authorize } from '@ghxstship/domain';

const CreateInspectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['safety', 'quality', 'compliance', 'maintenance', 'environmental', 'security']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'failed', 'cancelled']).default('scheduled'),
  scheduledDate: z.string(),
  completedDate: z.string().optional(),
  inspectorId: z.string().uuid().optional(),
  location: z.string().optional(),
  checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(['pending', 'pass', 'fail', 'na']).default('pending'),
    notes: z.string().optional()
  })).default([]),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

const UpdateInspectionSchema = CreateInspectionSchema.partial();

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
      'projects:inspections:read'
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
    const inspectorId = searchParams.get('inspectorId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('project_inspections')
      .select(`
        *,
        inspector:inspector_id(id, email, full_name)
      `)
      .eq('project_id', params.id)
      .order('scheduled_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (inspectorId) query = query.eq('inspector_id', inspectorId);

    const { data: inspections, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch inspections' }, { status: 500 });
    }

    return NextResponse.json({ inspections });
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
      'projects:inspections:write'
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
    const validatedData = CreateInspectionSchema.parse(body);

    const inspectionData = {
      ...validatedData,
      project_id: params.id,
      scheduled_date: validatedData.scheduledDate,
      completed_date: validatedData.completedDate,
      inspector_id: validatedData.inspectorId,
      created_by: user.id,
      updated_by: user.id
    };

    const { data: inspection, error } = await supabase
      .from('project_inspections')
      .insert([inspectionData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 });
    }

    return NextResponse.json({ inspection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
