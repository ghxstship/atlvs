import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateOnboardingProcessSchema = z.object({
  name: z.string().min(1, 'Process name is required'),
  description: z.string().optional(),
  type: z.enum(['employee', 'contractor', 'vendor', 'client']),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  steps: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    order: z.number().positive(),
    type: z.enum(['document', 'training', 'approval', 'task', 'meeting', 'system_access']),
    required: z.boolean().default(true),
    estimatedDuration: z.number().positive().optional(), // in hours
    assignedRole: z.string().optional(),
    dependencies: z.array(z.string()).optional(), // step IDs this depends on
    documents: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean().default(true),
      template: z.string().optional()
    })).optional(),
    approvers: z.array(z.object({
      role: z.string(),
      userId: z.string().uuid().optional(),
      required: z.boolean().default(true)
    })).optional(),
    automations: z.array(z.object({
      trigger: z.string(),
      action: z.string(),
      conditions: z.record(z.any()).optional()
    })).optional()
  })),
  notifications: z.object({
    welcome: z.boolean().default(true),
    stepReminders: z.boolean().default(true),
    completionNotice: z.boolean().default(true),
    escalations: z.boolean().default(false)
  }).optional(),
  settings: z.object({
    autoStart: z.boolean().default(false),
    allowSkipping: z.boolean().default(false),
    timeoutDays: z.number().positive().optional(),
    reminderFrequency: z.number().positive().default(24) // hours
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateOnboardingProcessSchema = CreateOnboardingProcessSchema.partial();

const StartOnboardingSchema = z.object({
  processId: z.string().uuid('Invalid process ID'),
  personId: z.string().uuid('Invalid person ID'),
  startDate: z.string().optional(),
  customData: z.record(z.any()).optional(),
  skipSteps: z.array(z.string()).optional(),
  assignedBy: z.string().uuid().optional(),
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
    const status = searchParams.get('status');
    const personId = searchParams.get('personId');
    const processId = searchParams.get('processId');
    const includeSteps = searchParams.get('includeSteps') === 'true';

    // If fetching onboarding instances for a person
    if (personId) {
      const { data: onboardingInstances, error } = await supabase
        .from('onboarding_instances')
        .select(`
          *,
          process:onboarding_processes(id, name, type, description),
          person:people(id, name, email),
          steps:onboarding_instance_steps(
            *,
            step:onboarding_process_steps(name, type, required, order),
            approvals:onboarding_step_approvals(
              approver:users(id, name, email),
              status,
              approved_at,
              comments
            )
          ),
          assigned_by:users(id, name, email)
        `)
        .eq('person_id', personId)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Onboarding instances fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ onboardingInstances: onboardingInstances || [] });
    }

    // If fetching a specific process
    if (processId) {
      const { data: process, error } = await supabase
        .from('onboarding_processes')
        .select(`
          *,
          steps:onboarding_process_steps(*),
          instances:onboarding_instances(
            id,
            person:people(id, name, email),
            status,
            progress,
            started_at,
            completed_at
          )
        `)
        .eq('id', processId)
        .eq('organization_id', orgId)
        .single();

      if (error || !process) {
        return NextResponse.json({ error: 'Process not found' }, { status: 404 });
      }

      return NextResponse.json({ process });
    }

    // Otherwise, fetch all processes
    let query = supabase
      .from('onboarding_processes')
      .select(`
        *,
        ${includeSteps ? 'steps:onboarding_process_steps(*),' : ''}
        instances:onboarding_instances(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data: processes, error } = await query;

    if (error) {
      console.error('Onboarding processes fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate metrics
    const metrics = {
      totalProcesses: processes?.length || 0,
      activeProcesses: processes?.filter(p => (p as any).status === 'active').length || 0,
      totalInstances: processes?.reduce((sum, p) => sum + ((p as any).instances?.[0]?.count || 0), 0) || 0,
      completionRate: 0 // Would need additional query to calculate
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.onboarding.list',
      resource_type: 'onboarding_process',
      details: { 
        count: processes?.length || 0,
        filters: { type, status, personId, processId, includeSteps }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      processes: processes || [], 
      metrics
    });

  } catch (error) {
    console.error('Onboarding GET error:', error);
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
    
    // Check if this is starting an onboarding instance or creating a process
    if (body.processId && body.personId) {
      // Start onboarding instance
      const instanceData = StartOnboardingSchema.parse(body);

      // Verify process belongs to organization
      const { data: process } = await supabase
        .from('onboarding_processes')
        .select('id, name, steps:onboarding_process_steps(*)')
        .eq('id', instanceData.processId)
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .single();

      if (!process) {
        return NextResponse.json({ error: 'Active process not found' }, { status: 404 });
      }

      // Verify person belongs to organization
      const { data: person } = await supabase
        .from('people')
        .select('id, name, email')
        .eq('id', instanceData.personId)
        .eq('organization_id', orgId)
        .single();

      if (!person) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }

      // Create onboarding instance
      const { data: instance, error } = await supabase
        .from('onboarding_instances')
        .insert({
          process_id: instanceData.processId,
          person_id: instanceData.personId,
          organization_id: orgId,
          status: 'in_progress',
          progress: 0,
          started_at: instanceData.startDate || new Date().toISOString(),
          assigned_by: instanceData.assignedBy || user.id,
          custom_data: instanceData.customData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Onboarding instance creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create instance steps from process steps
      const skipSteps = instanceData.skipSteps || [];
      const instanceSteps = process.steps
        .filter((step: any) => !skipSteps.includes(step.id))
        .map((step: any) => ({
          instance_id: instance.id,
          process_step_id: step.id,
          organization_id: orgId,
          status: 'pending',
          order: step.order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (instanceSteps.length > 0) {
        await supabase.from('onboarding_instance_steps').insert(instanceSteps);
      }

      // Send welcome notification
      await supabase.from('notifications').insert({
        user_id: (person as any).user_id,
        organization_id: orgId,
        type: 'onboarding_started',
        title: 'Welcome! Your onboarding has started',
        message: `Your onboarding process "${process.name}" has been initiated. Please check your tasks to get started.`,
        created_at: new Date().toISOString()
      });

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.onboarding.start',
        resource_type: 'onboarding_instance',
        resource_id: instance.id,
        details: { 
          process_id: instanceData.processId,
          person_id: instanceData.personId,
          person_name: person.name
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ instance }, { status: 201 });
    } else {
      // Create new onboarding process
      const processData = CreateOnboardingProcessSchema.parse(body);

      const { data: process, error } = await supabase
        .from('onboarding_processes')
        .insert({
          ...processData,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Onboarding process creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create process steps
      if (processData.steps && processData.steps.length > 0) {
        const steps = processData.steps.map(step => ({
          process_id: process.id,
          organization_id: orgId,
          ...step,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('onboarding_process_steps').insert(steps);
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.onboarding.create',
        resource_type: 'onboarding_process',
        resource_id: process.id,
        details: { 
          name: processData.name,
          type: processData.type,
          steps_count: processData.steps?.length || 0
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ process }, { status: 201 });
    }

  } catch (error) {
    console.error('Onboarding POST error:', error);
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
    const { id, instanceId, stepId, ...updateData } = body;

    if (instanceId && stepId) {
      // Update instance step
      const { data: step, error } = await supabase
        .from('onboarding_instance_steps')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', stepId)
        .eq('instance_id', instanceId)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Step update error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update instance progress if step completed
      if (updateData.status === 'completed') {
        // Calculate new progress
        const { data: allSteps } = await supabase
          .from('onboarding_instance_steps')
          .select('status')
          .eq('instance_id', instanceId);

        const completedSteps = allSteps?.filter(s => s.status === 'completed').length || 0;
        const totalSteps = allSteps?.length || 1;
        const progress = Math.round((completedSteps / totalSteps) * 100);

        await supabase
          .from('onboarding_instances')
          .update({
            progress,
            status: progress === 100 ? 'completed' : 'in_progress',
            completed_at: progress === 100 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', instanceId);
      }

      return NextResponse.json({ step });
    } else if (id) {
      // Update onboarding process
      const processData = UpdateOnboardingProcessSchema.parse(updateData);

      const { data: process, error } = await supabase
        .from('onboarding_processes')
        .update({
          ...processData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Process update error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (!process) {
        return NextResponse.json({ error: 'Process not found' }, { status: 404 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.onboarding.update',
        resource_type: 'onboarding_process',
        resource_id: process.id,
        details: { updated_fields: Object.keys(processData) },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ process });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

  } catch (error) {
    console.error('Onboarding PUT error:', error);
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
    const { id, instanceId } = body;

    if (instanceId) {
      // Cancel onboarding instance
      const { data: instance } = await supabase
        .from('onboarding_instances')
        .select('person:people(name)')
        .eq('id', instanceId)
        .eq('organization_id', orgId)
        .single();

      const { error } = await supabase
        .from('onboarding_instances')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', instanceId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Instance cancellation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.onboarding.cancel',
        resource_type: 'onboarding_instance',
        resource_id: instanceId,
        details: { person_name: (instance as any)?.person?.name || 'Unknown' },
        occurred_at: new Date().toISOString()
      });
    } else if (id) {
      // Delete onboarding process
      const { data: process } = await supabase
        .from('onboarding_processes')
        .select('name, status')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (!process) {
        return NextResponse.json({ error: 'Process not found' }, { status: 404 });
      }

      if (process.status === 'active') {
        return NextResponse.json({ 
          error: 'Cannot delete active process. Please archive it first.' 
        }, { status: 400 });
      }

      const { error } = await supabase
        .from('onboarding_processes')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Process deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.onboarding.delete',
        resource_type: 'onboarding_process',
        resource_id: id,
        details: { name: process.name },
        occurred_at: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Onboarding DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
