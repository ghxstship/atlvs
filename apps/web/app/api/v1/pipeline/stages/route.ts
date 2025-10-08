import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreatePipelineStageSchema = z.object({
  name: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  type: z.enum(['lead', 'opportunity', 'project', 'job', 'contract']),
  order: z.number().positive(),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
  icon: z.string().optional(),
  criteria: z.object({
    required: z.array(z.string()).optional(),
    optional: z.array(z.string()).optional(),
    automatedTriggers: z.array(z.object({
      condition: z.string(),
      action: z.string(),
      value: z.any().optional()
    })).optional()
  }).optional(),
  actions: z.array(z.object({
    name: z.string(),
    type: z.enum(['notification', 'task', 'approval', 'document', 'integration']),
    trigger: z.enum(['entry', 'exit', 'manual']),
    config: z.record(z.any()).optional(),
    assignedRole: z.string().optional()
  })).optional(),
  permissions: z.object({
    canView: z.array(z.string()).optional(),
    canEdit: z.array(z.string()).optional(),
    canMove: z.array(z.string()).optional(),
    canDelete: z.array(z.string()).optional()
  }).optional(),
  sla: z.object({
    targetDays: z.number().positive().optional(),
    warningDays: z.number().positive().optional(),
    escalationDays: z.number().positive().optional(),
    escalationTo: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

const UpdatePipelineStageSchema = CreatePipelineStageSchema.partial();

const MoveItemSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
  itemType: z.enum(['lead', 'opportunity', 'project', 'job', 'contract']),
  fromStageId: z.string().uuid('Invalid from stage ID'),
  toStageId: z.string().uuid('Invalid to stage ID'),
  reason: z.string().optional(),
  notes: z.string().optional(),
  skipValidation: z.boolean().default(false)
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
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const includeItems = searchParams.get('includeItems') === 'true';

    let query = supabase
      .from('pipeline_stages')
      .select(`
        *,
        ${includeItems ? `
        items:pipeline_items(
          id,
          name,
          type,
          status,
          value,
          created_at,
          updated_at
        ),` : ''}
        transitions:stage_transitions(
          to_stage:pipeline_stages(id, name),
          conditions,
          auto_transition
        )
      `)
      .eq('organization_id', orgId)
      .order('order', { ascending: true });

    if (type) query = query.eq('type', type);
    if (isActive !== null) query = query.eq('is_active', isActive === 'true');

    const { data: stages, error } = await query;

    if (error) {
      console.error('Pipeline stages fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate stage metrics
    const metrics = (stages || []).reduce((acc, stage) => {
      const itemCount = (stage as any).items?.length || 0;
      const totalValue = (stage as any).items?.reduce((sum: number, item) => sum + (item.value || 0), 0) || 0;
      
      return {
        totalStages: acc.totalStages + 1,
        activeStages: acc.activeStages + ((stage as any).is_active ? 1 : 0),
        totalItems: acc.totalItems + itemCount,
        totalValue: acc.totalValue + totalValue,
        avgItemsPerStage: 0 // calculated after
      };
    }, {
      totalStages: 0,
      activeStages: 0,
      totalItems: 0,
      totalValue: 0,
      avgItemsPerStage: 0
    }) || { totalStages: 0, activeStages: 0, totalItems: 0, totalValue: 0, avgItemsPerStage: 0 };

    if (metrics.totalStages > 0) {
      metrics.avgItemsPerStage = Math.round(metrics.totalItems / metrics.totalStages);
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.stages.list',
      resource_type: 'pipeline_stage',
      details: { 
        count: stages?.length || 0,
        filters: { type, isActive, includeItems }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      stages: stages || [], 
      metrics
    });

  } catch (error) {
    console.error('Pipeline stages GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if this is moving an item between stages or creating a stage
    if (body.itemId && body.fromStageId && body.toStageId) {
      // Move item between stages
      const moveData = MoveItemSchema.parse(body);

      // Verify stages belong to organization
      const { data: fromStage } = await supabase
        .from('pipeline_stages')
        .select('id, name, type')
        .eq('id', moveData.fromStageId)
        .eq('organization_id', orgId)
        .single();

      const { data: toStage } = await supabase
        .from('pipeline_stages')
        .select('id, name, type, criteria')
        .eq('id', moveData.toStageId)
        .eq('organization_id', orgId)
        .single();

      if (!fromStage || !toStage) {
        return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
      }

      if (fromStage.type !== toStage.type) {
        return NextResponse.json({ error: 'Cannot move item between different stage types' }, { status: 400 });
      }

      // Validate stage transition criteria if not skipping validation
      if (!moveData.skipValidation && toStage.criteria?.required) {
        // This would need additional logic to validate criteria
        // For now, we'll assume validation passes
      }

      // Update the item's stage
      const tableName = `${moveData.itemType}s`; // leads, opportunities, projects, jobs, contracts
      const { data: item, error } = await supabase
        .from(tableName)
        .update({
          pipeline_stage_id: moveData.toStageId,
          updated_at: new Date().toISOString()
        })
        .eq('id', moveData.itemId)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Item move error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create stage transition record
      await supabase.from('stage_transitions').insert({
        item_id: moveData.itemId,
        item_type: moveData.itemType,
        from_stage_id: moveData.fromStageId,
        to_stage_id: moveData.toStageId,
        organization_id: orgId,
        moved_by: user.id,
        reason: moveData.reason,
        notes: moveData.notes,
        created_at: new Date().toISOString()
      });

      // Trigger stage actions for entry
      const entryActions = (toStage as any).actions?.filter((action: any) => action.trigger === 'entry') || [];
      for (const action of entryActions) {
        // Process action based on type
        if (action.type === 'notification') {
          await supabase.from('notifications').insert({
            user_id: user.id,
            organization_id: orgId,
            type: 'stage_transition',
            title: `Item moved to ${toStage.name}`,
            message: `${moveData.itemType} has been moved to stage "${toStage.name}"`,
            created_at: new Date().toISOString()
          });
        }
        // Add other action types as needed
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.stages.move_item',
        resource_type: 'stage_transition',
        details: { 
          item_id: moveData.itemId,
          item_type: moveData.itemType,
          from_stage: fromStage.name,
          to_stage: toStage.name
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ item, transition: { fromStage, toStage } }, { status: 200 });
    } else {
      // Create new pipeline stage
      const stageData = CreatePipelineStageSchema.parse(body);

      const { data: stage, error } = await supabase
        .from('pipeline_stages')
        .insert({
          ...stageData,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Pipeline stage creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.stages.create',
        resource_type: 'pipeline_stage',
        resource_id: stage.id,
        details: { 
          name: stageData.name,
          type: stageData.type,
          order: stageData.order
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ stage }, { status: 201 });
    }

  } catch (error) {
    console.error('Pipeline stages POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Stage ID is required' }, { status: 400 });
    }

    const stageData = UpdatePipelineStageSchema.parse(updateData);

    const { data: stage, error } = await supabase
      .from('pipeline_stages')
      .update({
        ...stageData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Pipeline stage update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.stages.update',
      resource_type: 'pipeline_stage',
      resource_id: stage.id,
      details: { updated_fields: Object.keys(stageData) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ stage });

  } catch (error) {
    console.error('Pipeline stages PUT error:', error);
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

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Stage ID is required' }, { status: 400 });
    }

    // Check if stage has items
    const { data: stageItems } = await supabase
      .from('pipeline_items')
      .select('id')
      .eq('stage_id', id)
      .limit(1);

    if (stageItems && stageItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete stage with items. Please move items to another stage first.' 
      }, { status: 400 });
    }

    const { data: stage } = await supabase
      .from('pipeline_stages')
      .select('name, type')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (!stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Pipeline stage deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.stages.delete',
      resource_type: 'pipeline_stage',
      resource_id: id,
      details: { 
        name: stage.name,
        type: stage.type
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Pipeline stages DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
