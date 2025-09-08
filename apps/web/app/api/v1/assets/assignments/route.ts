import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';
import { AssetsService } from '@ghxstship/application';
import { SupabaseAssetsRepository } from '@ghxstship/infrastructure';
import { AuditLogger, EventBus } from '@ghxstship/application';

const createAssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  assigneeType: z.enum(['project', 'crew_member', 'vendor', 'partner']),
  assigneeId: z.string().min(1, 'Assignee ID is required'),
  assigneeName: z.string().min(1, 'Assignee name is required'),
  status: z.enum(['assigned', 'in_use', 'returned', 'overdue', 'damaged']).default('assigned'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  expectedReturnDate: z.string().optional(),
  location: z.string().optional(),
  purpose: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'damaged']).default('excellent'),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Check permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role', membership.role)
      .eq('permission', 'assets:read');

    if (!permissions?.length) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const assignments = await assetsService.listAssignments(membership.organization_id);

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.assignments.list',
      resourceType: 'assignment',
      details: { count: assignments.length }
    });

    return NextResponse.json({ data: assignments });

  } catch (error) {
    console.error('Asset Assignments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check organization membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.json({ error: 'No active organization membership' }, { status: 403 });
    }

    // Check permissions
    const { data: permissions } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role', membership.role)
      .eq('permission', 'assets:write');

    if (!permissions?.length) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body);

    const assetsRepo = new SupabaseAssetsRepository(supabase);
    const auditLogger = new AuditLogger(supabase);
    const eventBus = new EventBus();
    const assetsService = new AssetsService(assetsRepo, auditLogger, eventBus);

    const assignment = await assetsService.createAssignment({
      ...validatedData,
      organizationId: membership.organization_id,
      assignedDate: new Date().toISOString(),
      createdBy: user.id
    });

    await auditLogger.log({
      userId: user.id,
      organizationId: membership.organization_id,
      action: 'assets.assignments.create',
      resourceType: 'assignment',
      resourceId: assignment.id,
      details: { 
        assetId: assignment.assetId,
        assigneeType: assignment.assigneeType,
        assigneeName: assignment.assigneeName,
        purpose: assignment.purpose
      }
    });

    return NextResponse.json({ data: assignment }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Asset Assignments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
